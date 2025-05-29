<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\LogKlaim;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Master\Pasien;
use App\Models\Pendaftaran\Pendaftaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

use function Pest\Laravel\json;

class KlaimController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $q = $request->input('q');

        $query = Pasien::query();

        if ($q) {
            $query->where(function ($sub) use ($q) {
                $sub->where('NAMA', 'like', "%$q%")
                    ->orWhere('NORM', 'like', "%$q%")
                    ->orWhere('ALAMAT', 'like', "%$q%");
            });
        }

        $dataPendaftaran = $query
            ->orderByDesc('NORM')
            ->paginate($perPage, ['NORM', 'NAMA', 'ALAMAT'])
            ->withQueryString();

        return Inertia::render('eklaim/klaim/index', [
            'dataPendaftaran' => $dataPendaftaran,
            'filters' => [
                'q' => $q,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function show(Request $request, $pasien)
    {
        $q = $request->input('q');
        $pasien = \App\Models\Master\Pasien::where('NORM', $pasien)->firstOrFail();

        // Mengambil data pengajuan klaim untuk pasien
        $pengajuanKlaim = $pasien->pengajuanKlaim()->get();

        // Menambahkan data kunjungan
        $kunjungan = Pendaftaran::where('NORM', $pasien->NORM)
            ->with([
                'penjamin.kunjunganBPJS',
                'pasien',
                'riwayatKunjungan.ruangan'

            ])
            ->get();

        return Inertia::render('eklaim/klaim/show', [
            'pasien' => $pasien,
            'pengajuan_klaim' => $pengajuanKlaim,
            'klaimFilter' => [
                'q' => $q,
            ],
            'kunjungan' => $kunjungan, // tambahkan data kunjungan ke view
        ]);
    }

    public function storePengajuanKlaim(Request $request)
    {
        // Memulai Pengiriman ke Eklaim
        $metadata = [
            'method' => 'new_claim'
        ];

        $data =  [
            "nomor_kartu" => $request->input('nomor_kartu'),
            "nomor_sep" => $request->input('nomor_sep'),
            "nomor_rm" => (string)$request->input('nomor_rm'),
            "nama_pasien" => $request->input('nama_pasien'),
            "tgl_lahir" => $request->input('tgl_lahir'),
            "gender" => (string)$request->input('gender'),
        ];

        // dd(json_encode($data));
        // Init Klaim Controller
        $inacbgController = new \App\Http\Controllers\Inacbg\InacbgController();
        $send = $inacbgController->sendToEklaim($metadata, $data);

        // Check response Eklaim
        if ($send['metadata']['code'] != 200) {
            DB::connection('eklaim')->beginTransaction();
            $pasien = Pasien::where('NORM', $request->input('NORM'))->firstOrFail();
            $pengajuanKlaim = PengajuanKlaim::create([
                'NORM' => $request->input('NORM'),
                'nomor_pendaftaran' => $request->input('nomor_pendaftaran'),
                'nomor_SEP' => $request->input('nomor_SEP'),
                'status' => 0,
                'petugas' => Auth::user()->nama,
                'request' => json_encode($data), // pastikan tersimpan sebagai JSON
                'tanggal_pengajuan' => now(),
            ]);

            LogKlaim::create([
                'nomor_SEP' => $pengajuanKlaim->nomor_SEP,
                'method' => json_encode($metadata),
                'request' => json_encode($data),
                'response' => json_encode($send),
            ]);
            DB::connection('eklaim')->commit();
            return redirect()->back()->with('error', 'Gagal mengirim pengajuan klaim: ' . $send['metadata']['message']);
        } else if ($send['metadata']['code'] == 200) {
            DB::connection('eklaim')->beginTransaction();
            $pasien = Pasien::where('NORM', $request->input('NORM'))->firstOrFail();
            $pengajuanKlaim = PengajuanKlaim::create([
                'NORM' => $request->input('NORM'),
                'nomor_pendaftaran' => $request->input('nomor_pendaftaran'),
                'nomor_SEP' => $request->input('nomor_SEP'),
                'status' => 1,
                'petugas' => Auth::user()->nama,
                'request' => json_encode($data), // pastikan tersimpan sebagai JSON
                'tanggal_pengajuan' => now(),
            ]);

            LogKlaim::create([
                'nomor_SEP' => $pengajuanKlaim->nomor_SEP,
                'method' => json_encode($metadata),
                'request' => json_encode($data),
                'response' => json_encode($send),
            ]);
            DB::connection('eklaim')->commit();
            return redirect()->back()->with('success', 'Pengajuan klaim berhasil dibuat.');
        }

        return redirect()->back()->with('success', 'Pengajuan klaim berhasil dibuat.');
    }

    public function ajukanUlangKlaim(PengajuanKlaim $pengajuanKlaim)
    {
        $metadata = [
            'method' => 'new_claim'
        ];

        $data = json_decode($pengajuanKlaim->request);

        $inacbgController = new \App\Http\Controllers\Inacbg\InacbgController();

        $getClaimNumber = $this->generateClaimNumber();

        if ($getClaimNumber != "Ok") {
            return redirect()->back()->with('error', 'Gagal mengajukan ulang klaim: Gagal mendapatkan nomor klaim baru');
        }

        $send = $inacbgController->sendToEklaim($metadata, $data);
        if ($send['metadata']['code'] != 200) {
            DB::connection('eklaim')->beginTransaction();
            LogKlaim::create([
                'nomor_SEP' => $pengajuanKlaim->nomor_SEP,
                'method' => json_encode($metadata),
                'request' => $pengajuanKlaim->request,
                'response' => json_encode($send),
            ]);
            DB::connection('eklaim')->commit();
            return redirect()->back()->with('error', 'Gagal mengirim pengajuan klaim: ' . $send['metadata']['message']);
        }
        LogKlaim::create([
            'nomor_SEP' => $pengajuanKlaim->nomor_SEP,
            'method' => json_encode($metadata),
            'request' => $pengajuanKlaim->request,
            'response' => json_encode($send),
        ]);

        $pengajuanKlaim->update([
            'status' => 1, // status 1 untuk klaim berhasil
        ]);
        DB::connection('eklaim')->commit();
        return redirect()->back()->with('success', 'Pengajuan klaim berhasil dibuat.');
    }

    public function hapusDataKlaim(PengajuanKlaim $pengajuanKlaim)
    {
        $metadata = [
            'method' => 'delete_claim'
        ];

        $data = [
            "nomor_sep" => $pengajuanKlaim->nomor_SEP,
            "coder_nik" => "3522133010010003"
        ];

        $inacbgController = new \App\Http\Controllers\Inacbg\InacbgController();
        $send = $inacbgController->sendToEklaim($metadata, $data);
        if ($send['metadata']['code'] != 200) {
            DB::connection('eklaim')->beginTransaction();
            LogKlaim::create([
                'nomor_SEP' => $pengajuanKlaim->nomor_SEP,
                'method' => json_encode($metadata),
                'request' => json_encode($data),
                'response' => json_encode($send),
            ]);
            DB::connection('eklaim')->commit();
            return redirect()->back()->with('error', 'Gagal menghapus data klaim: ' . $send['metadata']['message']);
        }
        LogKlaim::create([
            'nomor_SEP' => $pengajuanKlaim->nomor_SEP,
            'method' => json_encode($metadata),
            'request' => json_encode($data),
            'response' => json_encode($send),
        ]);

        $pengajuanKlaim->update([
            'status' => 0, // status 2 untuk klaim dihapus
        ]);
        DB::connection('eklaim')->commit();
        return redirect()->back()->with('success', 'Data klaim berhasil dihapus.');
    }

    public function editUlangKlaim(PengajuanKlaim $pengajuanKlaim)
    {
        $metadata = [
            'method' => 'reedit_claim'
        ];

        $data = [
            "nomor_sep" => (string)$pengajuanKlaim->nomor_SEP,
        ];

        $inacbgController = new \App\Http\Controllers\Inacbg\InacbgController();
        $send = $inacbgController->sendToEklaim($metadata, $data);
        if ($send['metadata']['code'] != 200) {
            DB::connection('eklaim')->beginTransaction();
            LogKlaim::create([
                'nomor_SEP' => $pengajuanKlaim->nomor_SEP,
                'method' => json_encode($metadata),
                'request' => json_encode($data),
                'response' => json_encode($send),
            ]);
            DB::connection('eklaim')->commit();
            return redirect()->back()->with('error', 'Gagal menghapus data klaim: ' . $send['metadata']['message']);
        }
        LogKlaim::create([
            'nomor_SEP' => $pengajuanKlaim->nomor_SEP,
            'method' => json_encode($metadata),
            'request' => json_encode($data),
            'response' => json_encode($send),
        ]);

        $pengajuanKlaim->update([
            'status' => 1, // status 2 untuk klaim dihapus
        ]);
        DB::connection('eklaim')->commit();
        return redirect()->back()->with('success', 'Klaim berhasil diedit ulang.');
    }

    public function dataKlaim(PengajuanKlaim $dataKlaim)
    {
        $pasien = Pasien::where('NORM', $dataKlaim->NORM)->firstOrFail();
        $dataPendaftaran = Pendaftaran::where('NOMOR', $dataKlaim->nomor_pendaftaran)->with('pasienPulang')->firstOrFail();
        return Inertia::render('eklaim/klaim/dataKlaim', [
            'dataKlaim' => $dataKlaim,
            'pasien' => $pasien,
            'dataPendaftaran' => $dataPendaftaran,
        ]);
    }

    public function generateClaimNumber()
    {
        $metadata = [
            'method' => 'generate_claim_number'
        ];

        $inacbgController = new \App\Http\Controllers\Inacbg\InacbgController();
        $send = $inacbgController->sendToEklaim($metadata, "0");
        if ($send['metadata']['code'] != 200) {
            DB::connection('eklaim')->beginTransaction();
            LogKlaim::create([
                'nomor_SEP' => "-",
                'method' => json_encode($metadata),
                'request' => "-",
                'response' => json_encode($send),
            ]);
            DB::connection('eklaim')->commit();
            return "Not Ok";
        }
        LogKlaim::create([
            'nomor_SEP' => "-",
            'method' => json_encode($metadata),
            'request' => "-",
            'response' => json_encode($send),
        ]);
        DB::connection('eklaim')->commit();

        return "Ok";
    }

    public function updateDataPasien(Pasien $pasien, Request $request)
    {
        $metadata = [
            'method' => 'update_patient',
            'nomor_rm' => $pasien->NORM,
        ];

        $data = [
            "nomor_kartu" => (string)$request->input('nomor_kartu'),
            "nomor_rm" => (string)$request->input('nomor_rm'),
            "nama_pasien" => (string)$request->input('nama_pasien'),
            "tgl_lahir" => (string)$request->input('tgl_lahir'),
            "gender" => (string)$request->input('gender'),
        ];

        $inacbgController = new \App\Http\Controllers\Inacbg\InacbgController();
        $send = $inacbgController->sendToEklaim($metadata, $data);
        if ($send['metadata']['code'] != 200) {
            DB::connection('eklaim')->beginTransaction();
            LogKlaim::create([
                'nomor_SEP' => "-",
                'method' => json_encode($metadata),
                'request' => "-",
                'response' => json_encode($send),
            ]);
            DB::connection('eklaim')->commit();
            return redirect()->back()->with('error', 'Gagal mengupdate data pasien: ' . $send['metadata']['message']);
        }
        LogKlaim::create([
            'nomor_SEP' => "-",
            'method' => json_encode($metadata),
            'request' => "-",
            'response' => json_encode($send),
        ]);
        DB::connection('eklaim')->commit();

        return redirect()->back()->with('success', 'Data pasien berhasil diupdate.');
    }

    public function hapusDataPasien(Pasien $pasien)
    {
        $metadata = [
            'method' => 'delete_patient',
        ];

        $data = [
            "nomor_kartu" => (string)$pasien->NORM,
            "coder_nik" => "3522133010010003",
        ];

        $inacbgController = new \App\Http\Controllers\Inacbg\InacbgController();
        $send = $inacbgController->sendToEklaim($metadata, $data);
        if ($send['metadata']['code'] != 200) {
            DB::connection('eklaim')->beginTransaction();
            LogKlaim::create([
                'nomor_SEP' => "-",
                'method' => json_encode($metadata),
                'request' => "-",
                'response' => json_encode($send),
            ]);
            DB::connection('eklaim')->commit();
            return redirect()->back()->with('error', 'Gagal mengupdate data pasien: ' . $send['metadata']['message']);
        }
        LogKlaim::create([
            'nomor_SEP' => "-",
            'method' => json_encode($metadata),
            'request' => "-",
            'response' => json_encode($send),
        ]);
        DB::connection('eklaim')->commit();

        return redirect()->back()->with('success', 'Data pasien berhasil diupdate.');
    }

    public function listPengajuanKlaim(Request $request)
    {
        $perPage = $request->input('per_page', 10); // Jumlah item per halaman
        $pengajuanKlaim = PengajuanKlaim::orderByDesc('tanggal_pengajuan')
            ->paginate($perPage)
            ->withQueryString(); // Tambahkan query string untuk pagination

        return Inertia::render('eklaim/klaim/listPengajuan', [
            'pengajuanKlaim' => $pengajuanKlaim,
            'filters' => [
                'perPage' => $perPage,
            ],
        ]);
    }

    public function getDataKlaim(PengajuanKlaim $pengajuanKlaim)
    {
        $metadata = [
            'method' => 'get_claim_data'
        ];

        $data = [
            "nomor_sep" => (string)$pengajuanKlaim->nomor_SEP,
        ];

        $inacbgController = new \App\Http\Controllers\Inacbg\InacbgController();
        $send = $inacbgController->sendToEklaim($metadata, $data);

        if ($send['metadata']['code'] != 200) {
            DB::connection('eklaim')->beginTransaction();
            LogKlaim::create([
                'nomor_SEP' => $pengajuanKlaim->nomor_SEP,
                'method' => json_encode($metadata),
                'request' => json_encode($data),
                'response' => json_encode($send),
            ]);
            DB::connection('eklaim')->commit();
            return redirect()->back()->with('error', 'Gagal mendapatkan data klaim: ' . $send['metadata']['message']);
        }

        DB::connection('eklaim')->beginTransaction();
        LogKlaim::create([
            'nomor_SEP' => $pengajuanKlaim->nomor_SEP,
            'method' => json_encode($metadata),
            'request' => json_encode($data),
            'response' => json_encode($send),
        ]);
        DB::connection('eklaim')->commit();
        return Inertia::render('eklaim/klaim/detailKlaim', [
            'dataKlaim' => $send['response']['data'],
        ])->with('success', 'Data klaim berhasil diambil.');
    }

    public function getStatusKlaim(PengajuanKlaim $pengajuanKlaim)
    {
        $metadata = [
            'method' => 'get_claim_status'
        ];

        $data = [
            "nomor_sep" => $pengajuanKlaim->nomor_SEP,
        ];

        $inacbgController = new \App\Http\Controllers\Inacbg\InacbgController();
        $send = $inacbgController->sendToEklaim($metadata, $data);

        if ($send['metadata']['code'] != 200) {
            DB::connection('eklaim')->beginTransaction();
            LogKlaim::create([
                'nomor_SEP' => $pengajuanKlaim->nomor_SEP,
                'method' => json_encode($metadata),
                'request' => json_encode($data),
                'response' => json_encode($send),
            ]);
            DB::connection('eklaim')->commit();
            return redirect()->back()->with('error', 'Gagal mendapatkan status klaim: ' . $send['metadata']['message']);
        }

        DB::connection('eklaim')->beginTransaction();
        LogKlaim::create([
            'nomor_SEP' => $pengajuanKlaim->nomor_SEP,
            'method' => json_encode($metadata),
            'request' => json_encode($data),
            'response' => json_encode($send),
        ]);
        DB::connection('eklaim')->commit();
        return redirect()->back()->with('success', 'Status Klaim: ' . $send['response']['nmStatusSep']);
    }
}
