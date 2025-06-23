<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Inacbg\InacbgController;
use App\Models\BPJS\Kunjungan;
use App\Models\Eklaim\DataKlaim;
use App\Models\Eklaim\GrouperOne;
use App\Models\Eklaim\GrouperOneCBG;
use App\Models\Eklaim\GrouperOneChronic;
use App\Models\Eklaim\GrouperOneInagrouper;
use App\Models\Eklaim\grouperOneSpecialCmgOption;
use App\Models\Eklaim\GrouperOneSubAcute;
use App\Models\Eklaim\GrouperOneTarif;
use App\Models\Eklaim\LogKlaim;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Eklaim\ResumeMedis;
use App\Models\Master\Dokter;
use App\Models\Master\Pasien;
use App\Models\Pembayaran\Tagihan;
use App\Models\Pembayaran\TagihanPendaftaran;
use App\Models\Pendaftaran\Pendaftaran;
use App\Models\RM\Diagnosa;
use App\Models\RM\Prosedur;
use App\Models\RM\TTV;
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
        $poli = $request->input('poli');
        $tanggalAwal = $request->input('tanggal_awal');
        $tanggalAkhir = $request->input('tanggal_akhir');
        $kelas = $request->input('kelas');


        // $query = Pasien::query();
        $query = Kunjungan::query();

        if ($q) {
            $query->where(function ($sub) use ($q) {
                $sub->where('noSEP', 'like', "%$q%")
                    ->orWhere('noKartu', 'like', "%$q%");
            });
        }

        if ($poli) {
            // Jika $poli adalah string JSON array, decode
            if (is_string($poli) && str_starts_with($poli, '[')) {
                $poliArr = json_decode($poli, true);
            } else {
                // Jika string biasa, jadikan array
                $poliArr = [$poli];
            }
            $query->whereIn('poliTujuan', $poliArr);
        }

        if ($kelas) {
            $query->whereHas('dataPeserta', function ($q) use ($kelas) {
                $q->where('kdKelas', $kelas);
            });
        }

        // Filter tanggal_pengajuan
        if ($tanggalAwal && $tanggalAkhir) {
            $query->whereBetween('tglSEP', [$tanggalAwal, $tanggalAkhir]);
        } elseif ($tanggalAwal) {
            $query->whereDate('tglSEP', '>=', $tanggalAwal);
        } elseif ($tanggalAkhir) {
            $query->whereDate('tglSEP', '<=', $tanggalAkhir);
        }

        $dataPendaftaran = $query
            ->with(['dataPeserta', 'kartuAsuransiPasien', 'penjaminPendaftaran'])
            ->orderByDesc('tglSEP')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('eklaim/klaim/index', [
            'dataPendaftaran' => $dataPendaftaran,
            'filters' => [
                'q' => $q,
                'perPage' => $perPage,
            ],
            'tanggal_awal' => $tanggalAwal,
            'tanggal_akhir' => $tanggalAkhir,
            'kelas' => $kelas,
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
        $klaimNumber = $this->generateClaimNumber();
        $data = [
            "nomor_kartu" => $request->input('nomor_kartu'),
            "nomor_sep" => $request->input('nomor_sep'),
            "nomor_rm" => (string) $request->input('nomor_rm'),
            "nama_pasien" => $request->input('nama_pasien'),
            "tgl_lahir" => $request->input('tgl_lahir'),
            "gender" => (string) $request->input('gender'),
        ];

        // Init Klaim Controller
        $inacbgController = new \App\Http\Controllers\Inacbg\InacbgController();
        $send = $inacbgController->sendToEklaim($metadata, $data);

        if ($send['metadata']['code'] != 200) {
            DB::connection('eklaim')->beginTransaction();
            LogKlaim::create([
                'nomor_SEP' => $data['nomor_sep'],
                'method' => json_encode($metadata),
                'request' => json_encode($data),
                'response' => json_encode($send),
            ]);
            DB::connection('eklaim')->commit();
            return redirect()->back()->with('error', 'Gagal mengajukan klaim: ' . $send['metadata']['message']);
        }
        DB::connection('eklaim')->beginTransaction();
        $pasien = Pasien::where('NORM', $data['nomor_rm'])->firstOrFail();
        $pengajuanKlaim = PengajuanKlaim::create([
            'NORM' => $pasien->NORM,
            'nomor_pendaftaran' => $request->input('nomor_pendaftaran'),
            'nomor_SEP' => $request->input('nomor_sep'),
            'klaim_number' => $klaimNumber,
            'status' => 1,
            'jenis_perawatan' => $request->input('jenis_perawatan'),
            'petugas' => Auth::user()->nama,
            'request' => json_encode($data), // pastikan tersimpan sebagai JSON
            'tanggal_pengajuan' => now(),
        ]);

        Kunjungan::where('noSep', $request->input('nomor_sep'))
            ->update(['klaimStatus' => 1]);

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

        $klaimNumber = $this->generateClaimNumber();

        // Ubah request menjadi array
        $requestData = json_decode($pengajuanKlaim->request, true);

        // Kirim ke eklaim
        $inacbgController = new \App\Http\Controllers\Inacbg\InacbgController();
        $send = $inacbgController->sendToEklaim($metadata, $requestData);

        if ($send['metadata']['code'] != 200) {
            DB::connection('eklaim')->beginTransaction();
            LogKlaim::create([
                'nomor_SEP' => $pengajuanKlaim->nomor_SEP,
                'method' => json_encode($metadata),
                'request' => json_encode($requestData),
                'response' => json_encode($send),
            ]);
            DB::connection('eklaim')->commit();
            return redirect()->back()->with('error', 'Gagal mengajukan ulang klaim: ' . $send['metadata']['message']);
        }

        LogKlaim::create([
            'nomor_SEP' => $pengajuanKlaim->nomor_SEP,
            'method' => json_encode($metadata),
            'request' => json_encode($requestData),
            'response' => json_encode($send),
        ]);

        // Update request dan nomor_SEP di database
        $pengajuanKlaim->update([
            'request' => json_encode($requestData),
            'nomor_SEP' => $pengajuanKlaim->nomor_SEP,
            'status' => 1,
        ]);
        DB::connection('eklaim')->commit();
        return redirect()->back()->with('success', 'Pengajuan ulang klaim berhasil.');
    }

    public function updateDataKlaim(Request $request, PengajuanKlaim $pengajuanKlaim)
    {
        $metadata = [
            'method' => 'set_claim_data',
            'nomor_sep' => $pengajuanKlaim->nomor_SEP,
        ];

        // Diagnosa: jika ada duplikat, tambahkan +N pada value yang duplikat (hanya pada kemunculan terakhir)
        $diagnosaArr = $request->input('diagnosa');
        if (is_array($diagnosaArr)) {
            $diagnosaCount = array_count_values($diagnosaArr);
            $diagnosaResult = [];
            $used = [];
            foreach ($diagnosaArr as $val) {
                if (!isset($used[$val])) $used[$val] = 0;
                $used[$val]++;
                if ($diagnosaCount[$val] > 1 && $used[$val] == $diagnosaCount[$val]) {
                    // Hanya tambahkan +N pada kemunculan terakhir
                    $diagnosaResult[] = $val . '+' . $diagnosaCount[$val];
                } elseif ($diagnosaCount[$val] > 1) {
                    // Lewati kemunculan sebelumnya
                    continue;
                } else {
                    $diagnosaResult[] = $val;
                }
            }
            $diagnosa = count($diagnosaResult) > 0 ? implode('#', $diagnosaResult) : '#';
        } elseif (empty($diagnosaArr)) {
            $diagnosa = '#';
        } else {
            $diagnosa = $diagnosaArr;
        }

        // Procedure: jika ada duplikat, tambahkan +N pada value yang duplikat (hanya pada kemunculan terakhir)
        $procedureArr = $request->input('procedure');
        if (is_array($procedureArr)) {
            $procedureCount = array_count_values($procedureArr);
            $procedureResult = [];
            $usedProc = [];
            foreach ($procedureArr as $val) {
                if (!isset($usedProc[$val])) $usedProc[$val] = 0;
                $usedProc[$val]++;
                if ($procedureCount[$val] > 1 && $usedProc[$val] == $procedureCount[$val]) {
                    $procedureResult[] = $val . '+' . $procedureCount[$val];
                } elseif ($procedureCount[$val] > 1) {
                    continue;
                } else {
                    $procedureResult[] = $val;
                }
            }
            $procedure = count($procedureResult) > 0 ? implode('#', $procedureResult) : '#';
        } elseif (empty($procedureArr)) {
            $procedure = '#';
        } else {
            $procedure = $procedureArr;
        }


        // Persalinan: jika semua input kosong/null, set semua field null
        $persalinanInput = $request->input('persalinan');
        $isPersalinanKosong = true;
        if (is_array($persalinanInput)) {
            foreach (['usia_kehamilan', 'gravida', 'partus', 'abortus', 'onset_kontraksi'] as $field) {
                if (!empty($persalinanInput[$field])) {
                    $isPersalinanKosong = false;
                    break;
                }
            }
            // Cek delivery jika ada isian
            if ($isPersalinanKosong && !empty($persalinanInput['delivery']) && is_array($persalinanInput['delivery'])) {
                foreach ($persalinanInput['delivery'] as $delivery) {
                    foreach ($delivery as $val) {
                        if (!empty($val)) {
                            $isPersalinanKosong = false;
                            break 2;
                        }
                    }
                }
            }
        }

        $persalinan = [
            "usia_kehamilan" => null,
            "gravida" => null,
            "partus" => null,
            "abortus" => null,
            "onset_kontraksi" => null,
            "delivery" => null,
        ];

        if (!$isPersalinanKosong && is_array($persalinanInput)) {
            $persalinan = [
                "usia_kehamilan" => $persalinanInput['usia_kehamilan'] ?? null,
                "gravida" => $persalinanInput['gravida'] ?? null,
                "partus" => $persalinanInput['partus'] ?? null,
                "abortus" => $persalinanInput['abortus'] ?? null,
                "onset_kontraksi" => $persalinanInput['onset_kontraksi'] ?? null,
                "delivery" => !empty($persalinanInput['delivery']) ? $persalinanInput['delivery'] : null,
            ];
        }

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
            "diagnosa" => $diagnosa,
            "procedure" => $procedure,
            "diagnosa_inagrouper" => $request->input('diagnosa_inagrouper'),
            "procedure_inagrouper" => $request->input('procedure_inagrouper'),
            "tarif_rs" => [
                "prosedur_non_bedah" => $request->input('tarif_rs.prosedur_non_bedah'),
                "prosedur_bedah" => $request->input('tarif_rs.prosedur_bedah'),
                "konsultasi" => $request->input('tarif_rs.konsultasi'),
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
            "persalinan" => $persalinan,
            "tarif_poli_eks" => $request->input('tarif_poli_eks'),
            "nama_dokter" => $request->input('nama_dokter'),
            "kode_tarif" => $request->input('kode_tarif'),
            "payor_id" => $request->input('payor_id'),
            "payor_cd" => $request->input('payor_cd'),
            "cob_cd" => $request->input('cob_cd'),
            "coder_nik" => $request->input('coder_nik'),
        ];

        DB::beginTransaction();
        try {
            // Simpan data utama
            $klaimData = DataKlaim::updateOrCreate(
                ['pengajuan_klaim_id' => $pengajuanKlaim->id],
                [
                    'pengajuan_klaim_id' => $data['pengajuan_klaim_id'] ?? $pengajuanKlaim->id,
                    'nomor_sep' => $data['nomor_sep'],
                    'nomor_kartu' => $data['nomor_kartu'],
                    'tgl_masuk' => $data['tgl_masuk'],
                    'tgl_pulang' => $data['tgl_pulang'],
                    'cara_masuk' => $data['cara_masuk'],
                    'jenis_rawat' => $data['jenis_rawat'],
                    'kelas_rawat' => $data['kelas_rawat'],
                    'adl_sub_acute' => $data['adl_sub_acute'],
                    'adl_chronic' => $data['adl_chronic'],
                    'icu_indikator' => $data['icu_indikator'],
                    'icu_los' => $data['icu_los'],
                    'ventilator_hour' => $data['ventilator_hour'],
                    'ventilator_use_ind' => $data['ventilator']['use_ind'] ?? null,
                    'ventilator_start_dttm' => $data['ventilator']['start_dttm'] ?? null,
                    'ventilator_stop_dttm' => $data['ventilator']['stop_dttm'] ?? null,
                    'upgrade_class_ind' => $data['upgrade_class_ind'],
                    'upgrade_class_class' => $data['upgrade_class_class'],
                    'upgrade_class_los' => $data['upgrade_class_los'],
                    'upgrade_class_payor' => $data['upgrade_class_payor'],
                    'add_payment_pct' => $data['add_payment_pct'],
                    'birth_weight' => $data['birth_weight'],
                    'sistole' => $data['sistole'],
                    'diastole' => $data['diastole'],
                    'discharge_status' => $data['discharge_status'],
                    'diagnosa' => $diagnosa,
                    'procedure' => $procedure,
                    'diagnosa_inagrouper' => $diagnosa,
                    'procedure_inagrouper' => $procedure,
                    'pemulasaraan_jenazah' => $data['pemulasaraan_jenazah'],
                    'kantong_jenazah' => $data['kantong_jenazah'],
                    'peti_jenazah' => $data['peti_jenazah'],
                    'plastik_erat' => $data['plastik_erat'],
                    'desinfektan_jenazah' => $data['desinfektan_jenazah'],
                    'mobil_jenazah' => $data['mobil_jenazah'],
                    'desinfektan_mobil_jenazah' => $data['desinfektan_mobil_jenazah'],
                    'covid19_status_cd' => $data['covid19_status_cd'],
                    'nomor_kartu_t' => $data['nomor_kartu_t'],
                    'episodes' => $data['episodes'],
                    'covid19_cc_ind' => $data['covid19_cc_ind'],
                    'covid19_rs_darurat_ind' => $data['covid19_rs_darurat_ind'],
                    'covid19_co_insidense_ind' => $data['covid19_co_insidense_ind'],
                    'terapi_konvalesen' => $data['terapi_konvalesen'],
                    'akses_naat' => $data['akses_naat'],
                    'isoman_ind' => $data['isoman_ind'],
                    'bayi_lahir_status_cd' => $data['bayi_lahir_status_cd'],
                    'dializer_single_use' => $data['dializer_single_use'],
                    'kantong_darah' => $data['kantong_darah'],
                    'alteplase_ind' => $data['alteplase_ind'],
                    'tarif_poli_eks' => $data['tarif_poli_eks'],
                    'nama_dokter' => $data['nama_dokter'],
                    'kode_tarif' => $data['kode_tarif'],
                    'payor_id' => $data['payor_id'],
                    'payor_cd' => $data['payor_cd'],
                    'cob_cd' => $data['cob_cd'],
                    'coder_nik' => $data['coder_nik'],
                ]
            );

            // Simpan tarif_rs
            if (!empty($data['tarif_rs'])) {
                $klaimData->tarifRs()->updateOrCreate([], $data['tarif_rs']);
            }

            // Simpan persalinan & delivery
            if (!empty($data['persalinan'])) {
                $persalinan = $klaimData->persalinan()->updateOrCreate([], [
                    'usia_kehamilan' => $data['persalinan']['usia_kehamilan'],
                    'gravida' => $data['persalinan']['gravida'],
                    'partus' => $data['persalinan']['partus'],
                    'abortus' => $data['persalinan']['abortus'],
                    'onset_kontraksi' => $data['persalinan']['onset_kontraksi'],
                ]);
                // Simpan delivery
                if (!empty($data['persalinan']['delivery']) && is_array($data['persalinan']['delivery'])) {
                    $persalinan->deliveries()->delete();
                    foreach ($data['persalinan']['delivery'] as $delivery) {
                        $persalinan->deliveries()->create($delivery);
                    }
                }
            }

            // Simpan apgar
            if (!empty($data['apgar'])) {
                $klaimData->apgar()->updateOrCreate([], [
                    'appearance_1' => $data['apgar']['menit_1']['appearance'] ?? null,
                    'pulse_1' => $data['apgar']['menit_1']['pulse'] ?? null,
                    'grimace_1' => $data['apgar']['menit_1']['grimace'] ?? null,
                    'activity_1' => $data['apgar']['menit_1']['activity'] ?? null,
                    'respiration_1' => $data['apgar']['menit_1']['respiration'] ?? null,
                    'appearance_5' => $data['apgar']['menit_5']['appearance'] ?? null,
                    'pulse_5' => $data['apgar']['menit_5']['pulse'] ?? null,
                    'grimace_5' => $data['apgar']['menit_5']['grimace'] ?? null,
                    'activity_5' => $data['apgar']['menit_5']['activity'] ?? null,
                    'respiration_5' => $data['apgar']['menit_5']['respiration'] ?? null,
                ]);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }

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
            return redirect()->back()->with('error', 'Gagal mengirim data klaim: ' . $send['metadata']['message']);
        }

        LogKlaim::create([
            'nomor_SEP' => $pengajuanKlaim->nomor_SEP,
            'method' => json_encode($metadata),
            'request' => json_encode($data),
            'response' => json_encode($send),
        ]);
        DB::connection('eklaim')->commit();
        return redirect()->back()->with('success', 'Data klaim berhasil diperbarui dan dikirim ke eKlaim.');
    }

    public function groupStageOneKlaim(PengajuanKlaim $pengajuanKlaim)
    {
        $metadata = [
            'method' => 'grouper',
            'stage' => '1'
        ];

        $data = [
            "nomor_sep" => (string) $pengajuanKlaim->klaim_number,
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
            return redirect()->back()->with('error', 'Gagal mengirim data klaim: ' . $send['metadata']['message']);
        }

        // Mulai simpan data ke database
        DB::connection('eklaim')->beginTransaction();
        try {
            $response = $send['response'] ?? [];
            // 1. Simpan GrouperOne (utama)
            $grouperOne = \App\Models\Eklaim\GrouperOne::updateOrCreate(
                [
                    'pengajuan_klaim_id' => $pengajuanKlaim->id,
                    'kelas' => $response['kelas'] ?? null,
                ],
                [
                    'pengajuan_klaim_id' => $pengajuanKlaim->id,
                    'kelas' => $response['kelas'] ?? null,
                    'inacbg_version' => $response['inacbg_version'] ?? null,
                ]
            );

            // 2. Simpan GrouperOneCBG
            if (!empty($response['cbg'])) {
                \App\Models\Eklaim\GrouperOneCBG::updateOrCreate(
                    [
                        'grouper_one_id' => $grouperOne->id,
                        'code' => $response['cbg']['code'] ?? null,
                    ],
                    [
                        'grouper_one_id' => $grouperOne->id,
                        'code' => $response['cbg']['code'] ?? null,
                        'description' => $response['cbg']['description'] ?? null,
                        'base_tariff' => null, // Tidak ada di JSON
                        'tariff' => $response['cbg']['tariff'] ?? null,
                    ]
                );
            }

            // 3. Simpan GrouperOneSubAcute
            if (!empty($response['sub_acute'])) {
                \App\Models\Eklaim\GrouperOneSubAcute::updateOrCreate(
                    [
                        'grouper_one_id' => $grouperOne->id,
                        'code' => $response['sub_acute']['code'] ?? null,
                    ],
                    [
                        'grouper_one_id' => $grouperOne->id,
                        'code' => $response['sub_acute']['code'] ?? null,
                        'description' => $response['sub_acute']['description'] ?? null,
                        'tarif' => $response['sub_acute']['tariff'] ?? null,
                    ]
                );
            }

            // 4. Simpan GrouperOneChronic
            if (!empty($response['chronic'])) {
                \App\Models\Eklaim\GrouperOneChronic::updateOrCreate(
                    [
                        'grouper_one_id' => $grouperOne->id,
                        'code' => $response['chronic']['code'] ?? null,
                    ],
                    [
                        'grouper_one_id' => $grouperOne->id,
                        'code' => $response['chronic']['code'] ?? null,
                        'description' => $response['chronic']['description'] ?? null,
                        'tarif' => $response['chronic']['tariff'] ?? null,
                    ]
                );
            }

            // 5. Simpan GrouperOneTarif (tarif_alt)
            if (!empty($send['tarif_alt']) && is_array($send['tarif_alt'])) {
                foreach ($send['tarif_alt'] as $tarif) {
                    \App\Models\Eklaim\GrouperOneTarif::updateOrCreate(
                        [
                            'pengajuan_klaim_id' => $pengajuanKlaim->id,
                            'kelas' => $tarif['kelas'] ?? null,
                        ],
                        [
                            'pengajuan_klaim_id' => $pengajuanKlaim->id,
                            'kelas' => $tarif['kelas'] ?? null,
                            'tarif_inacbg' => $tarif['tarif_inacbg'] ?? null,
                        ]
                    );
                }
            }

            // 6. Simpan grouperOneSpecialCmgOption (special_cmg_option)
            if (!empty($send['special_cmg_option']) && is_array($send['special_cmg_option'])) {
                foreach ($send['special_cmg_option'] as $cmg) {
                    \App\Models\Eklaim\grouperOneSpecialCmgOption::updateOrCreate(
                        [
                            'pengajuan_klaim_id' => $pengajuanKlaim->id,
                            'code' => $cmg['code'] ?? null,
                        ],
                        [
                            'pengajuan_klaim_id' => $pengajuanKlaim->id,
                            'code' => $cmg['code'] ?? null,
                            'description' => $cmg['description'] ?? null,
                            'type' => $cmg['type'] ?? null,
                        ]
                    );
                }
            }

            // 7. Simpan GrouperOneInagrouper (response_inagrouper)
            if (!empty($send['response_inagrouper'])) {
                $inagrouper = $send['response_inagrouper'];
                \App\Models\Eklaim\GrouperOneInagrouper::updateOrCreate(
                    [
                        'pengajuan_klaim_id' => $pengajuanKlaim->id,
                        'mdc_number' => $inagrouper['mdc_number'] ?? null,
                    ],
                    [
                        'pengajuan_klaim_id' => $pengajuanKlaim->id,
                        'mdc_number' => $inagrouper['mdc_number'] ?? null,
                        'mdc_description' => $inagrouper['mdc_description'] ?? null,
                        'drg_code' => $inagrouper['drg_code'] ?? null,
                        'drg_description' => $inagrouper['drg_description'] ?? null,
                    ]
                );
            }

            PengajuanKlaim::where('id', $pengajuanKlaim->id)->update([
                'status' => 2, // status 2 untuk klaim sudah digrouper
                'berkas_klaim' => 1, // berkas klaim sudah lengkap
            ]);

            DB::connection('eklaim')->commit();

            return redirect()->back()->with('success', 'Data berhasil digrouping');
        } catch (\Exception $e) {
            DB::connection('eklaim')->rollBack();
            return redirect()->back()->with('error', 'Gagal menyimpan data grouper: ' . $e->getMessage());
        }

        // // Logging sukses
        // LogKlaim::create([
        //     'nomor_SEP' => $pengajuanKlaim->nomor_SEP,
        //     'method' => json_encode($metadata),
        //     'request' => json_encode($data),
        //     'response' => json_encode($send),
        // ]);

        // return redirect()->back()->with('success', 'Data berhasil digrouping');
    }

    public function groupStageTwoKlaim(PengajuanKlaim $pengajuanKlaim, Request $request)
    {
        $metadata = [
            'method' => 'grouper',
            'stage' => '2'
        ];

        $data = [
            "nomor_sep" => (string) $pengajuanKlaim->klaim_number,
            "special_cmg" => $request->input('special_cmg') ?? "#",
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
            return redirect()->back()->with('error', 'Gagal mengirim data klaim: ' . $send['metadata']['message']);
        }

        try {
            // Mulai simpan data ke database
            DB::connection('eklaim')->beginTransaction();
            $response = $send['response'] ?? [];
            // 1. Update Data Pada GrouperOneCbg
            if (!empty($response['cbg'])) {
                $grouperOne = \App\Models\Eklaim\GrouperOne::where('pengajuan_klaim_id', $pengajuanKlaim->id)->first();
                if ($grouperOne) {
                    \App\Models\Eklaim\GrouperOneCBG::updateOrCreate(
                        [
                            'grouper_one_id' => $grouperOne->id,
                            'code' => $response['cbg']['code'] ?? null,
                        ],
                        [
                            'grouper_one_id' => $grouperOne->id,
                            'code' => $response['cbg']['code'] ?? null,
                            'description' => $response['cbg']['description'] ?? null,
                            'base_tariff' => $response['cbg']['base_tariff'] ?? null,
                            'tariff' => $response['cbg']['tariff'] ?? null,
                        ]
                    );
                }
            }

            // 2. Simpan GrouperTwoSpecialCmg
            if (!empty($response['special_cmg']) && is_array($response['special_cmg'])) {
                $grouperOne = $grouperOne ?? \App\Models\Eklaim\GrouperOne::where('pengajuan_klaim_id', $pengajuanKlaim->id)->first();
                foreach ($response['special_cmg'] as $cmg) {
                    \App\Models\Eklaim\GrouperTwoSpecialCMG::updateOrCreate(
                        [
                            'grouper_one_id' => $grouperOne ? $grouperOne->id : null,
                            'code' => $cmg['code'] ?? null,
                        ],
                        [
                            'grouper_one_id' => $grouperOne ? $grouperOne->id : null,
                            'code' => $cmg['code'] ?? null,
                            'description' => $cmg['description'] ?? null,
                            'type' => $cmg['type'] ?? null,
                        ]
                    );
                }
            }

            // 3. Update GrouperOne kolom add_payment_amt
            if (isset($response['add_payment_amt'])) {
                $grouperOne = $grouperOne ?? \App\Models\Eklaim\GrouperOne::where('pengajuan_klaim_id', $pengajuanKlaim->id)->first();
                if ($grouperOne) {
                    $grouperOne->add_payment_amt = $response['add_payment_amt'];
                    $grouperOne->save();
                }
            }

            LogKlaim::create([
                'nomor_SEP' => $pengajuanKlaim->nomor_SEP,
                'method' => json_encode($metadata),
                'request' => json_encode($data),
                'response' => json_encode($send),
            ]);
            DB::connection('eklaim')->commit();
            return redirect()->back()->with('success', 'Data berhasil digrouping');
        } catch (\Throwable $th) {
            DB::connection('eklaim')->rollBack();
            return redirect()->back()->with('error', 'Gagal menyimpan data grouper: ' . $th->getMessage());
        }
    }

    public function groupStageFinalKlaim(PengajuanKlaim $pengajuanKlaim)
    {
        $metadata = [
            'method' => 'claim_final',
        ];

        $data = [
            'nomor_sep' => (string) $pengajuanKlaim->nomor_SEP,
            'coder_nik' => "3522133010010003",
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
            return redirect()->back()->with('error', 'Gagal mengirim data klaim: ' . $send['metadata']['message']);
        }
        PengajuanKlaim::where('id', $pengajuanKlaim->id)->update([
            'status' => 3, // status 3 untuk klaim final
        ]);

        LogKlaim::create([
            'nomor_SEP' => $pengajuanKlaim->nomor_SEP,
            'method' => json_encode($metadata),
            'request' => json_encode($data),
            'response' => json_encode($send),
        ]);

        DB::connection('eklaim')->commit();
        return redirect()->back()->with('success', 'Data klaim berhasil dikirim untuk tahap final.');
    }

    public function hapusDataKlaim(PengajuanKlaim $pengajuanKlaim)
    {
        $metadata = [
            'method' => 'delete_claim'
        ];

        $data = [
            "nomor_sep" => $pengajuanKlaim->klaim_number,
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
            return redirect()->back()->with('error', 'Gagal mengirim data klaim: ' . $send['metadata']['message']);
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
            "nomor_sep" => (string) $pengajuanKlaim->klaim_number,
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
            return redirect()->back()->with('error', 'Gagal mengirim data klaim: ' . $send['metadata']['message']);
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

        return $send['response']['claim_number'] ?? "Not Ok";
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

        $query = PengajuanKlaim::with('pendaftaranPoli.pasien');

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
        // Ambil data klaim dari database jika sudah ada
        $klaimData = \App\Models\Eklaim\DataKlaim::with([
            'apgar',
            'persalinan.deliveries',
            'tarifRs'
        ])->where('pengajuan_klaim_id', $pengajuanKlaim->id)->first();

        if ($klaimData) {
            return response()->json([
                'klaimData' => $klaimData,
                'apgar' => $klaimData->apgar,
                'persalinan' => $klaimData->persalinan,
                'delivery' => $klaimData->persalinan ? $klaimData->persalinan->deliveries : [],
                'tarif_rs' => $klaimData->tarifRs,
                'from' => 'db'
            ]);
        }

        // Jika belum ada, fallback ke data kunjungan (seperti sebelumnya)
        $data = $pengajuanKlaim->load([
            'pendaftaranPoli.kunjunganPasien.ruangan' => function ($query) {
                $query->whereIn('JENIS_KUNJUNGAN', [1, 2, 3, 17]);
            },
        ]);

        $dokter = \App\Models\Master\Dokter::with('pegawai')->where('ID', $data->pendaftaranPoli->kunjunganPasien[0]['DPJP'])->first();
        $gelarDepan = $dokter->pegawai->GELAR_DEPAN ? $dokter->pegawai->GELAR_DEPAN . '.' : '';
        $gelarBelakang = $dokter->pegawai->GELAR_BELAKANG ? ',' . $dokter->pegawai->GELAR_BELAKANG : '';
        $data->dokter = [
            'NIP' => $dokter->pegawai->NIP,
            'NAMA' => $gelarDepan . $dokter->pegawai->NAMA . $gelarBelakang,
        ];

        $tagihanPendaftaran = \App\Models\Pembayaran\TagihanPendaftaran::where('PENDAFTARAN',  $pengajuanKlaim->nomor_pendaftaran)->first();
        $tagihan = \App\Models\Pembayaran\Tagihan::where('ID', $tagihanPendaftaran->TAGIHAN)->first();
        $data->tagihan = $tagihan;

        if ($pengajuanKlaim->edit == 1) {
            $dataResumeMedis = ResumeMedis::where('id_pengajuan_klaim', $pengajuanKlaim->id)->first();
            $data['sistole'] = $dataResumeMedis->sistole;
            $data['diastole'] = $dataResumeMedis->diastole;
            $data['diagnosa'] = $dataResumeMedis->diagnosa_utama;
            $data['prosedur'] = $dataResumeMedis->tindakan_prosedur;
        }

        if ($pengajuanKlaim->edit == 0) {
            if (
                isset($data->pendaftaranPoli) &&
                isset($data->pendaftaranPoli->kunjunganPasien) &&
                is_iterable($data->pendaftaranPoli->kunjunganPasien)
            ) {
                foreach ($data->pendaftaranPoli->kunjunganPasien as $kunjungan) {
                    if (
                        isset($kunjungan->ruangan) &&
                        isset($kunjungan->ruangan->JENIS_KUNJUNGAN) &&
                        in_array($kunjungan->ruangan->JENIS_KUNJUNGAN, [1, 2, 3, 17])
                    ) {
                        $nomorKunjungan = $kunjungan->NOMOR;
                        $ttv = TTV::where('KUNJUNGAN', $nomorKunjungan)->orderBy('TANGGAL', 'DESC')->first();
                        $diagnosa = Diagnosa::where('NOPEN', $kunjungan->NOPEN)->orderBy('TANGGAL', 'DESC')->first();
                        // dd($diagnosa);
                        $prosedur = Prosedur::where('NOPEN', $kunjungan->NOPEN)->orderBy('TANGGAL', 'DESC')->first();
                        $sistole = $ttv->SISTOLIK ?? null;
                        $diastole = $ttv->DISTOLIK ?? null;
                        $data['sistole'] = $sistole;
                        $data['diastole'] = $diastole;
                        $data['diagnosa'] = $diagnosa ? $diagnosa->KODE : null;
                        $data['prosedur'] = $prosedur ? $prosedur->KODE : null;
                        
                    }
                }
            }
        }

        return response()->json([
            'klaimData' => null,
            'kunjungan' => $data,
            'from' => 'kunjungan'
        ]);
    }

    public function loadDataGroupOne(PengajuanKlaim $pengajuanKlaim)
    {
        $data = $pengajuanKlaim;
        $data->grouperone = GrouperOne::where('pengajuan_klaim_id', $pengajuanKlaim->id)->with(['cbg', 'subAcute', 'chronic', 'specialCmg'])->first();
        $data->grouperOneInagrouper = GrouperOneInagrouper::where('pengajuan_klaim_id', $pengajuanKlaim->id)->get();
        $data->grouperOneTarif = GrouperOneTarif::where('pengajuan_klaim_id', $pengajuanKlaim->id)->get();
        $data->grouperOneSpecialCmgOption = grouperOneSpecialCmgOption::where('pengajuan_klaim_id', $pengajuanKlaim->id)->get();

        return response()->json($data);
    }

    public function getDataKlaim(PengajuanKlaim $pengajuanKlaim)
    {
        $metadata = [
            'method' => 'get_claim_data'
        ];

        $data = [
            "nomor_sep" => (string) $pengajuanKlaim->klaim_number,
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
            "nomor_sep" => $pengajuanKlaim->klaim_number,
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

    public function getAmbilDataTarifDiagnosa(PengajuanKlaim $pengajuanKlaim)
    {
        $metadata = [
            'method' => 'grouper',
            'stage' => '1',
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
            return redirect()->back()->with('error', 'Gagal mengirim data klaim: ' . $send['metadata']['message']);
        }

        DB::connection('eklaim')->beginTransaction();
        LogKlaim::create([
            'nomor_SEP' => $pengajuanKlaim->nomor_SEP,
            'method' => json_encode($metadata),
            'request' => json_encode($data),
            'response' => json_encode($send),
        ]);
        DB::connection('eklaim')->commit();
        return redirect()->back()->with('success', 'Data tarif dan diagnosa berhasil diambil.');
    }

    public function kirimDataKolektifHari(Request $request)
    {
        $tanggal_awal = $request->input('tanggal_awal');
        $tanggal_akhir = $request->input('tanggal_akhir');
        $jenis_rawat = $request->input('jenis_rawat');
        $date_type = $request->input('date_type');

        $metadata = [
            'method' => 'send_claim'
        ];

        $data = [
            'start_dt' => $tanggal_awal,
            'stop_dt' => $tanggal_akhir,
            'jenis_rawat' => $jenis_rawat,
            'date_type' => $date_type,
        ];

        dd($data);

        // $inacbgController = new \App\Http\Controllers\Inacbg\InacbgController();
        // $send = $inacbgController->sendToEklaim($metadata, $data);
        // if ($send['metadata']['code'] != 200) {
        //     DB::connection('eklaim')->beginTransaction();
        //     LogKlaim::create([
        //         'nomor_SEP' => "-",
        //         'method' => json_encode($metadata),
        //         'request' => json_encode($data),
        //         'response' => json_encode($send),
        //     ]);
        //     DB::connection('eklaim')->commit();
        //     return redirect()->back()->with('error', 'Gagal mengirim data klaim: ' . $send['metadata']['message']);
        // }

        // DB::connection('eklaim')->beginTransaction();
        // LogKlaim::create([
        //     'nomor_SEP' => "-",
        //     'method' => json_encode($metadata),
        //     'request' => json_encode($data),
        //     'response' => json_encode($send),
        // ]);
        // DB::connection('eklaim')->commit();
        // return redirect()->back()->with('success', 'Data tarif dan diagnosa berhasil diambil.');
    }
}
