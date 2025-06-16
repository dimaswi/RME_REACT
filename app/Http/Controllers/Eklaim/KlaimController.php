<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\BPJS\Kunjungan;
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

        // Init Klaim Controller
        $this->generateClaimNumber();
        $inacbgController = new \App\Http\Controllers\Inacbg\InacbgController();
        $send = $inacbgController->sendToEklaim($metadata, $data);

        // Check response Eklaim

        DB::connection('eklaim')->beginTransaction();
        $pasien = Pasien::where('NORM', $data['nomor_rm'])->firstOrFail();
        $pengajuanKlaim = PengajuanKlaim::create([
            'NORM' => $pasien->NORM,
            'nomor_pendaftaran' => $request->input('nomor_pendaftaran'),
            'nomor_SEP' => $request->input('nomor_sep'),
            'status' => 1,
            'jenis_perawatan' => $request->input('jenis_perawatan'),
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

    public function updateDataKlaim(Request $request, PengajuanKlaim $pengajuanKlaim)
    {
        $metadata = [
            'method' => 'set_claim_data',
            'nomor_sep' => $pengajuanKlaim->nomor_SEP,
        ];

        $data = [
            "nomor_sep" => (string)$pengajuanKlaim->nomor_SEP,
            "nomor_kartu" => json_decode($pengajuanKlaim->request)->nomor_kartu,
            "tgl_masuk" => "2023-01-25 12:55:00",
            "tgl_pulang" => "2023-01-31 09:55:00",
            "cara_masuk" => "gp",
            "jenis_rawat" => "1",
            "kelas_rawat" => "1",
            "adl_sub_acute" => "15",
            "adl_chronic" => "12",
            "icu_indikator" => "1",
            "icu_los" => "2",
            "ventilator_hour" => "5",
            "ventilator" => [
                "use_ind" => "1",
                "start_dttm" => "2023-01-26 12:55:00",
                "stop_dttm" => "2023-01-26 17:50:00"
            ],
            "upgrade_class_ind" => "1",
            "upgrade_class_class" => "vip",
            "upgrade_class_los" => "5",
            "upgrade_class_payor" => "peserta",
            "add_payment_pct" => "35",
            "birth_weight" => "0",
            "sistole" => 120,
            "diastole" => 70,
            "discharge_status" => "1",
            "diagnosa" => "S71.0#A00.1",
            "procedure" => "81.52#88.38#86.22",
            "diagnosa_inagrouper" => "S71.0#A00.1",
            "procedure_inagrouper" => "81.52#88.38#86.22+3#86.22",
            "tarif_rs" => [
                "prosedur_non_bedah" => "300000",
                "prosedur_bedah" => "20000000",
                "tenaga_ahli" => "200000",
                "keperawatan" => "80000",
                "penunjang" => "1000000",
                "radiologi" => "500000",
                "laboratorium" => "600000",
                "pelayanan_darah" => "150000",
                "rehabilitasi" => "100000",
                "kamar" => "6000000",
                "rawat_intensif" => "2500000",
                "obat" => "100000",
                "obat_kronis" => "1000000",
                "obat_kemoterapi" => "5000000",
                "alkes" => "500000",
                "bmhp" => "400000",
                "sewa_alat" => "210000"
            ],
            "pemulasaraan_jenazah" => "1",
            "kantong_jenazah" => "1",
            "peti_jenazah" => "1",
            "plastik_erat" => "1",
            "desinfektan_jenazah" => "1",
            "mobil_jenazah" => "0",
            "desinfektan_mobil_jenazah" => "0",
            "covid19_status_cd" => "1",
            "nomor_kartu_t" => "nik",
            "episodes" => "1;12#2;3#6;5",
            "covid19_cc_ind" => "1",
            "covid19_rs_darurat_ind" => "1",
            "covid19_co_insidense_ind" => "1",
            "covid19_penunjang_pengurang" => [
                "lab_asam_laktat" => "1",
                "lab_procalcitonin" => "1",
                "lab_crp" => "1",
                "lab_kultur" => "1",
                "lab_d_dimer" => "1",
                "lab_pt" => "1",
                "lab_aptt" => "1",
                "lab_waktu_pendarahan" => "1",
                "lab_anti_hiv" => "1",
                "lab_analisa_gas" => "1",
                "lab_albumin" => "1",
                "rad_thorax_ap_pa" => "0"
            ],
            "terapi_konvalesen" => "1000000",
            "akses_naat" => "C",
            "isoman_ind" => "0",
            "bayi_lahir_status_cd" => 1,
            "dializer_single_use" => 0,
            "kantong_darah" => 1,
            "alteplase_ind" => 0,
            "apgar" => [
                "menit_1" => [
                    "appearance" => 1,
                    "pulse" => 2,
                    "grimace" => 1,
                    "activity" => 1,
                    "respiration" => 1
                ],
                "menit_5" => [
                    "appearance" => 2,
                    "pulse" => 2,
                    "grimace" => 2,
                    "activity" => 2,
                    "respiration" => 2
                ]
            ],
            "persalinan" => [
                "usia_kehamilan" => "22",
                "gravida" => "2",
                "partus" => "4",
                "abortus" => "2",
                "onset_kontraksi" => "induksi",
                "delivery" => [
                    [
                        "delivery_sequence" => "1",
                        "delivery_method" => "vaginal",
                        "delivery_dttm" => "2023-01-21 17:01:33",
                        "letak_janin" => "kepala",
                        "kondisi" => "livebirth",
                        "use_manual" => "1",
                        "use_forcep" => "0",
                        "use_vacuum" => "1",
                        "shk_spesimen_ambil" => "ya",
                        "shk_lokasi" => "tumit",
                        "shk_spesimen_dttm" => "2023-01-21 18:11:33"
                    ],
                    [
                        "delivery_sequence" => "2",
                        "delivery_method" => "vaginal",
                        "delivery_dttm" => "2023-01-21 17:03:49",
                        "letak_janin" => "lintang",
                        "kondisi" => "livebirth",
                        "use_manual" => "1",
                        "use_forcep" => "0",
                        "use_vacuum" => "0",
                        "shk_spesimen_ambil" => "tidak",
                        "shk_alasan" => "akses-sulit"
                    ]
                ]
            ],
            "tarif_poli_eks" => "100000",
            "nama_dokter" => "RUDY, DR",
            "kode_tarif" => "AP",
            "payor_id" => "3",
            "payor_cd" => "JKN",
            "cob_cd" => "0001",
            "coder_nik" => "123123123123"
        ];
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
        $perPage = $request->input('per_page', 10);
        $tanggalAwal = $request->input('tanggal_awal');
        $tanggalAkhir = $request->input('tanggal_akhir');
        $status = $request->input('status'); // Ambil status dari request

        $query = PengajuanKlaim::query();

        // Filter status klaim
        if ($status !== null && $status !== '') {
            if (is_array($status)) {
                $query->whereIn('status', $status);
            } elseif (is_string($status) && str_starts_with($status, '[')) {
                // Jika status dikirim sebagai string array (misal: "[0,1,2,3,4]")
                $arr = json_decode($status, true);
                if (is_array($arr)) {
                    $query->whereIn('status', $arr);
                } else {
                    $query->where('status', $status);
                }
            } else {
                $query->where('status', $status);
            }
        }

        // Filter tanggal_pengajuan
        if ($tanggalAwal && $tanggalAkhir) {
            $query->whereBetween('tanggal_pengajuan', [$tanggalAwal, $tanggalAkhir]);
        } elseif ($tanggalAwal) {
            $query->whereDate('tanggal_pengajuan', '>=', $tanggalAwal);
        } elseif ($tanggalAkhir) {
            $query->whereDate('tanggal_pengajuan', '<=', $tanggalAkhir);
        }

        $pengajuanKlaim = $query->orderByDesc('tanggal_pengajuan')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('eklaim/klaim/listPengajuan', [
            'pengajuanKlaim' => $pengajuanKlaim,
            'filters' => [
                'perPage' => $perPage,
                'status' => $status,
            ],
            'tanggal_awal' => $tanggalAwal,
            'tanggal_akhir' => $tanggalAkhir,
            'status' => $status,
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

    public function searchRekamMedis(Request $request)
    {
        $q = $request->input('q', '');
        $limit = $request->input('limit', 10);

        $query = Pasien::query()
            ->with('nomorBPJS')
            ->select('NORM', 'NAMA', 'TANGGAL_LAHIR', 'ALAMAT', 'JENIS_KELAMIN')
            ->orderBy('NORM');

        if ($q) {
            $query->where('NORM', 'like', "%{$q}%")->orWhere('NAMA', 'like', "%{$q}%")->orWhere('ALAMAT', 'like', "%{$q}%");
        }

        // Pagination for fast loading
        $data = $query->limit($limit)->get();

        return response()->json([
            'data' => $data
        ]);
    }

    public function searchDataSEP($nomorKartu)
    {

        $query = Kunjungan::query()
            ->select('noSEP', 'noKartu', 'tglSEP', 'poliTujuan')
            ->with('penjaminPendaftaran')
            ->orderBy('tglSEP', 'desc');

        if ($nomorKartu) {
            $query->where('noKartu', 'like', "%{$nomorKartu}%");
        }

        // Pagination for fast loading
        $data = $query->get();

        return response()->json([
            'data' => $data
        ]);
    }
}
