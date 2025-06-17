<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\BPJS\Kunjungan;
use App\Models\Eklaim\LogKlaim;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Master\Dokter;
use App\Models\Master\Pasien;
use App\Models\Pembayaran\Tagihan;
use App\Models\Pembayaran\TagihanPendaftaran;
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

        $data = [
            "nomor_kartu" => $request->input('nomor_kartu'),
            "nomor_sep" => $request->input('nomor_sep'),
            "nomor_rm" => (string) $request->input('nomor_rm'),
            "nama_pasien" => $request->input('nama_pasien'),
            "tgl_lahir" => $request->input('tgl_lahir'),
            "gender" => (string) $request->input('gender'),
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
            "nomor_sep" => (string) $pengajuanKlaim->nomor_SEP,
            "nomor_kartu" => json_decode($pengajuanKlaim->request)->nomor_kartu,
            "tgl_masuk" => $request->input('tanggal_masuk'),
            "tgl_pulang" => $request->input('tanggal_pulang'),
            "cara_masuk" => $request->input('cara_masuk'),
            "jenis_rawat" => $request->input('jenis_rawat'),
            "kelas_rawat" => $request->input('kelas_rawat'),
            "adl_sub_acute" => $request->input('adl_sub_acute'),
            "adl_chronic" => $request->input('adl_chronic'),
            "icu_indikator" => $request->input('icu_indikator'),
            "icu_los" => $request->input('icu_los'),
            "ventilator_hour" => $request->input('ventilator_hour'),
            "ventilator" => [
                "use_ind" => $request->input('ventilator.use_ind'),
                "start_dttm" => $request->input('ventilator.start_dttm'),
                "stop_dttm" => $request->input('ventilator.stop_dttm')
            ],
            "upgrade_class_ind" => $request->input('upgrade_class_ind'),
            "upgrade_class_class" => $request->input('upgrade_class_class'),
            "upgrade_class_los" => $request->input('upgrade_class_los'),
            "upgrade_class_payor" => $request->input('upgrade_class_payor'),
            "add_payment_pct" => $request->input('add_payment_pct'),
            "birth_weight" => $request->input('birth_weight'),
            "sistole" => $request->input('sistole'),
            "diastole" => $request->input('diastole'),
            "discharge_status" => $request->input('discharge_status'),
            "diagnosa" => $request->input('diagnosa'),
            "procedure" => $request->input('procedure'),
            "diagnosa_inagrouper" => $request->input('diagnosa_inagrouper'),
            "procedure_inagrouper" => $request->input('procedure_inagrouper'),
            "tarif_rs" => [
                "prosedur_non_bedah" => $request->input('tarif_rs.prosedur_non_bedah'),
                "prosedur_bedah" => $request->input('tarif_rs.prosedur_bedah'),
                "tenaga_ahli" => $request->input('tarif_rs.tenaga_ahli'),
                "keperawatan" => $request->input('tarif_rs.keperawatan'),
                "penunjang" => $request->input('tarif_rs.penunjang'),
                "radiologi" => $request->input('tarif_rs.radiologi'),
                "laboratorium" => $request->input('tarif_rs.laboratorium'),
                "pelayanan_darah" => $request->input('tarif_rs.pelayanan_darah'),
                "rehabilitasi" => $request->input('tarif_rs.rehabilitasi'),
                "kamar" => $request->input('tarif_rs.kamar'),
                "rawat_intensif" => $request->input('tarif_rs.rawat_intensif'),
                "obat" => $request->input('tarif_rs.obat'),
                "obat_kronis" => $request->input('tarif_rs.obat_kronis'),
                "obat_kemoterapi" => $request->input('tarif_rs.obat_kemoterapi'),
                "alkes" => $request->input('tarif_rs.alkes'),
                "bmhp" => $request->input('tarif_rs.bmhp'),
                "sewa_alat" => $request->input('tarif_rs.sewa_alat')
            ],
            "pemulasaraan_jenazah" => $request->input('pemulasaraan_jenazah'),
            "kantong_jenazah" => $request->input('kantong_jenazah'),
            "peti_jenazah" => $request->input('peti_jenazah'),
            "plastik_erat" => $request->input('plastik_erat'),
            "desinfektan_jenazah" => $request->input('desinfektan_jenazah'),
            "mobil_jenazah" => $request->input('mobil_jenazah'),
            "desinfektan_mobil_jenazah" => $request->input('desinfektan_mobil_jenazah'),
            "covid19_status_cd" => $request->input('covid19_status_cd'),
            "nomor_kartu_t" => $request->input('nomor_kartu_t'),
            "episodes" => $request->input('episodes'),
            "covid19_cc_ind" => $request->input('covid19_cc_ind'),
            "covid19_rs_darurat_ind" => $request->input('covid19_rs_darurat_ind'),
            "covid19_co_insidense_ind" => $request->input('covid19_co_insidense_ind'),
            "covid19_penunjang_pengurang" => [
                "lab_asam_laktat" => $request->input('covid19_penunjang_pengurang.lab_asam_laktat'),
                "lab_procalcitonin" => $request->input('covid19_penunjang_pengurang.lab_procalcitonin'),
                "lab_crp" => $request->input('covid19_penunjang_pengurang.lab_crp'),
                "lab_kultur" => $request->input('covid19_penunjang_pengurang.lab_kultur'),
                "lab_d_dimer" => $request->input('covid19_penunjang_pengurang.lab_d_dimer'),
                "lab_pt" => $request->input('covid19_penunjang_pengurang.lab_pt'),
                "lab_aptt" => $request->input('covid19_penunjang_pengurang.lab_aptt'),
                "lab_waktu_pendarahan" => $request->input('covid19_penunjang_pengurang.lab_waktu_pendarahan'),
                "lab_anti_hiv" => $request->input('covid19_penunjang_pengurang.lab_anti_hiv'),
                "lab_analisa_gas" => $request->input('covid19_penunjang_pengurang.lab_analisa_gas'),
                "lab_albumin" => $request->input('covid19_penunjang_pengurang.lab_albumin'),
                "rad_thorax_ap_pa" => $request->input('covid19_penunjang_pengurang.rad_thorax_ap_pa')
            ],
            "terapi_konvalesen" => $request->input('terapi_konvalesen'),
            "akses_naat" => $request->input('akses_naat'),
            "isoman_ind" => $request->input('isoman_ind'),
            "bayi_lahir_status_cd" => $request->input('bayi_lahir_status_cd'),
            "dializer_single_use" => $request->input('dializer_single_use'),
            "kantong_darah" => $request->input('kantong_darah'),
            "alteplase_ind" => $request->input('alteplase_ind'),
            "apgar" => [
                "menit_1" => [
                    "appearance" => $request->input('apgar.menit_1.appearance'),
                    "pulse" => $request->input('apgar.menit_1.pulse'),
                    "grimace" => $request->input('apgar.menit_1.grimace'),
                    "activity" => $request->input('apgar.menit_1.activity'),
                    "respiration" => $request->input('apgar.menit_1.respiration')
                ],
                "menit_5" => [
                    "appearance" => $request->input('apgar.menit_5.appearance'),
                    "pulse" => $request->input('apgar.menit_5.pulse'),
                    "grimace" => $request->input('apgar.menit_5.grimace'),
                    "activity" => $request->input('apgar.menit_5.activity'),
                    "respiration" => $request->input('apgar.menit_5.respiration')
                ]
            ],
            "persalinan" => [
                "usia_kehamilan" => $request->input('persalinan.usia_kehamilan'),
                "gravida" => $request->input('persalinan.gravida'),
                "partus" => $request->input('persalinan.partus'),
                "abortus" => $request->input('persalinan.abortus'),
                "onset_kontraksi" => $request->input('persalinan.onset_kontraksi'),
                "delivery" => $request->input('persalinan.delivery'), // <-- array of delivery
            ],
            "tarif_poli_eks" => $request->input('tarif_poli_eks'),
            "nama_dokter" => $request->input('nama_dokter'),
            "kode_tarif" => $request->input('kode_tarif'),
            "payor_id" => $request->input('payor_id'),
            "payor_cd" => $request->input('payor_cd'),
            "cob_cd" => $request->input('cob_cd'),
            "coder_nik" => $request->input('coder_nik'),
        ];

        dd($data);
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
            "nomor_sep" => (string) $pengajuanKlaim->nomor_SEP,
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
            "nomor_kartu" => (string) $request->input('nomor_kartu'),
            "nomor_rm" => (string) $request->input('nomor_rm'),
            "nama_pasien" => (string) $request->input('nama_pasien'),
            "tgl_lahir" => (string) $request->input('tgl_lahir'),
            "gender" => (string) $request->input('gender'),
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
            "nomor_kartu" => (string) $pasien->NORM,
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

    public function loadDataKlaim(PengajuanKlaim $pengajuanKlaim)
    {
        $data = $pengajuanKlaim->load([
            'pendaftaranPoli.kunjunganPasien.ruangan' => function ($query) {
                $query->where('JENIS_KUNJUNGAN', 1);
            },
        ]);

        // dd($data->pendaftaranPoli->kunjunganPasien[0]['DPJP']);

        $dokter = Dokter::with('pegawai')->where('ID', $data->pendaftaranPoli->kunjunganPasien[0]['DPJP'])->first();

        // dd($dokter->pegawai->NAMA);

        // $data->dokter = $dokter->map(function ($item) {
        //     $gelarDepan = $item->pegawai->GELAR_DEPAN ? $item->pegawai->GELAR_DEPAN . '.' : '';
        //     $gelarBelakang = $item->pegawai->GELAR_BELAKANG ? ',' . $item->pegawai->GELAR_BELAKANG : '';
        //     return [
        //         'NIP' => $item->NIP,
        //         'NAMA' => $gelarDepan . $item->pegawai->NAMA . $gelarBelakang,
        //     ];
        // });

        $gelarDepan = $dokter->pegawai->GELAR_DEPAN ? $dokter->pegawai->GELAR_DEPAN . '.' : '';
        $gelarBelakang = $dokter->pegawai->GELAR_BELAKANG ? ',' . $dokter->pegawai->GELAR_BELAKANG : '';
        $data->dokter = [
            'NIP' => $dokter->pegawai->NIP,
            'NAMA' => $gelarDepan . $dokter->pegawai->NAMA . $gelarBelakang,
        ];

        $tagihanPendaftaran = TagihanPendaftaran::where('PENDAFTARAN',  $pengajuanKlaim->nomor_pendaftaran)
            ->first();

        $tagihan = Tagihan::where('ID', $tagihanPendaftaran->TAGIHAN)
            ->first();

        $data->tagihan = $tagihan;
        

        return response()->json($data);
    }

    public function getDataKlaim(PengajuanKlaim $pengajuanKlaim)
    {
        $metadata = [
            'method' => 'get_claim_data'
        ];

        $data = [
            "nomor_sep" => (string) $pengajuanKlaim->nomor_SEP,
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
