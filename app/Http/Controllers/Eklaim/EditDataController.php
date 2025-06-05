<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\CPPT as EklaimCPPT;
use App\Models\Eklaim\IntruksiTindakLanjut;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Eklaim\PengkajianAwal;
use App\Models\Eklaim\PermintaanKonsul;
use App\Models\Eklaim\ResumeMedis;
use App\Models\Eklaim\TerapiPulang;
use App\Models\Eklaim\Triage as EklaimTriage;
use App\Models\Pembayaran\TagihanPendaftaran;
use App\Models\Pendaftaran\Kunjungan;
use App\Models\RM\CPPT;
use App\Models\RM\Triage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EditDataController extends Controller
{
    public function EditResumeMedis(PengajuanKlaim $pengajuanKlaim)
    {
        //Kop
        $imagePath = public_path('images/kop.png'); // Path ke gambar di folder public
        if (!file_exists($imagePath)) {
            throw new \Exception("Gambar tidak ditemukan di path: $imagePath");
        }
        $imageData = base64_encode(file_get_contents($imagePath)); // Konversi ke Base64
        $imageBase64 = 'data:image/png;base64,' . $imageData; // Tambahkan prefix Base64

        if ($pengajuanKlaim->edit == 1) {
            $pengajuanKlaim->load([
                'resumeMedisEdit.pengkajianAwalEdit.pemeriksaanFisikEdit',
                'resumeMedisEdit.pengkajianAwalEdit.anamnesaEdit',
                'resumeMedisEdit.pengkajianAwalEdit.psikologiEdit',
                'resumeMedisEdit.pengkajianAwalEdit.nyeriEdit',
                'resumeMedisEdit.pengkajianAwalEdit.keadaanUmumEdit',
                'resumeMedisEdit.intruksiTindakLanjutEdit',
                'resumeMedisEdit.terapiPulangEdit',
                'resumeMedisEdit.konsultasiEdit',
            ]);
        }

        if ($pengajuanKlaim->edit == 0) {
            $pengajuanKlaim->load([
                'penjamin.kunjunganPasien.ruangan',
                'penjamin.kunjunganPasien.penjaminPasien.jenisPenjamin',
                'penjamin.kunjunganPasien.pendaftaranPasien.pasien',
                'penjamin.kunjunganPasien.pendaftaranPasien.resumeMedis',
                'penjamin.kunjunganPasien.anamnesisPasien',
                'penjamin.kunjunganPasien.rpp',
                'penjamin.kunjunganPasien.diagnosaPasien',
                'penjamin.kunjunganPasien.prosedurPasien',
                'penjamin.kunjunganPasien.pemeriksaanFisik',
                'penjamin.kunjunganPasien.permintaanKonsul',
                'penjamin.kunjunganPasien.permintaanKonsul.jawabanKonsul',
                'penjamin.kunjunganPasien.riwayatAlergi',
                'penjamin.kunjunganPasien.pasienPulang.caraPulang',
                'penjamin.kunjunganPasien.pasienPulang.keadaanPulang',
                'penjamin.kunjunganPasien.orderResep.orderResepDetil.namaObat',
                'penjamin.kunjunganPasien.orderResep.orderResepDetil.caraPakai',
                'penjamin.kunjunganPasien.orderResep.orderResepDetil.frekuensiObat',
                'penjamin.kunjunganPasien.jadwalKontrol.ruangan',
                'penjamin.kunjunganPasien.dokterDPJP',
                'penjamin.kunjunganPasien.gabungTagihan.kunjunganPasien.ruangan',
                'penjamin.kunjunganPasien.gabungTagihan.kunjunganPasien.pendaftaranPasien.pasien',
                'penjamin.kunjunganPasien.gabungTagihan.kunjunganPasien.anamnesisPasien',
                'penjamin.kunjunganPasien.gabungTagihan.kunjunganPasien.anamnesisPasienDiperoleh',
                'penjamin.kunjunganPasien.gabungTagihan.kunjunganPasien.keluhanUtama',
                'penjamin.kunjunganPasien.gabungTagihan.kunjunganPasien.rpp',
                'penjamin.kunjunganPasien.gabungTagihan.kunjunganPasien.orderResep.orderResepDetil.namaObat',
                'penjamin.kunjunganPasien.gabungTagihan.kunjunganPasien.riwayatPenyakitKeluarga',
                'penjamin.kunjunganPasien.gabungTagihan.kunjunganPasien.tandaVital',
                'penjamin.kunjunganPasien.gabungTagihan.kunjunganPasien.riwayatAlergi',
                'penjamin.kunjunganPasien.gabungTagihan.kunjunganPasien.rencanaTerapi',
                'penjamin.kunjunganPasien.gabungTagihan.kunjunganPasien.diagnosaPasien.namaDiagnosa',
                'penjamin.kunjunganPasien.gabungTagihan.kunjunganPasien.dokterDPJP',

            ]);

            // Handle jika penjamin atau kunjunganPasien kosong/null
            if (!$pengajuanKlaim->penjamin || !$pengajuanKlaim->penjamin->kunjunganPasien) {
                return Inertia::render('eklaim/EditData/ResumeMedis', [
                    'pengajuanKlaim' => $pengajuanKlaim,
                    'imageBase64' => $imageBase64
                ])->with('error', 'Tidak ada data resume medis untuk diedit');
            }

            if (
                $pengajuanKlaim->penjamin->kunjunganPasien->count() < 1
            ) {
                return Inertia::render('eklaim/EditData/ResumeMedis', [
                    'pengajuanKlaim' => $pengajuanKlaim,
                    'imageBase64' => $imageBase64
                ]);
            }
        }

        // dd($pengajuanKlaim);
        return Inertia::render('eklaim/EditData/ResumeMedis', [
            'pengajuanKlaim' => $pengajuanKlaim,
            'imageBase64' => $imageBase64
        ]);
    }

    public function StoreEditResumeMedis(Request $request)
    {
        // dd($request->all());
        DB::connection('eklaim')->beginTransaction();
        try {
            // 1. Simpan Resume Medis
            if (isset($resumeData['id_pengajuan_klaim']) && $resumeData['id_pengajuan_klaim'] !== null && $resumeData['id_pengajuan_klaim'] !== '') {
                $resumeData['id_pengajuan_klaim'] = (int) $resumeData['id_pengajuan_klaim'];
            } else {
                $resumeData['id_pengajuan_klaim'] = null;
            }

            $resumeData = $request->input('resumeMedis');

            // Pastikan id_pengajuan_klaim integer atau null
            if (isset($resumeData['id_pengajuan_klaim']) && $resumeData['id_pengajuan_klaim'] !== null && $resumeData['id_pengajuan_klaim'] !== '') {
                // Jika UUID, simpan sebagai string (ubah tipe kolom jika perlu)
                // $resumeData['id_pengajuan_klaim'] = (string) $resumeData['id_pengajuan_klaim'];
            } else {
                $resumeData['id_pengajuan_klaim'] = null;
            }

            // Simpan data utama resume medis
            $resume = ResumeMedis::updateOrCreate(
                ['id_pengajuan_klaim' => $resumeData['id_pengajuan_klaim'] ?? null],
                [
                    'id_pengajuan_klaim'      => $resumeData['id_pengajuan_klaim'] ?? null,
                    'nama_pasien'             => $resumeData['nama_pasien'] ?? null,
                    'no_rm'                   => $resumeData['no_rm'] ?? null,
                    'tanggal_lahir'           => $resumeData['tanggal_lahir'] ?? null,
                    'jenis_kelamin'           => $resumeData['jenis_kelamin'] ?? null,
                    'ruang_rawat'             => $resumeData['ruang_rawat'] ?? null,
                    'penjamin'                => $resumeData['penjamin'] ?? null,
                    'indikasi_rawat_inap'     => $resumeData['indikasi_rawat_inap'] ?? null,
                    'tanggal_masuk'           => $resumeData['tanggal_masuk'] ?? null,
                    'tanggal_keluar'          => $resumeData['tanggal_keluar'] ?? null,
                    'lama_dirawat'            => $resumeData['lama_dirawat'] ?? null,
                    'riwayat_penyakit_sekarang' => $resumeData['riwayat_penyakit_sekarang'] ?? null,
                    'riwayat_penyakit_lalu'   => $resumeData['riwayat_penyakit_lalu'] ?? null,
                    'pemeriksaan_fisik'       => $resumeData['pemeriksaan_fisik'] ?? null,
                    'diagnosa_utama'          => $resumeData['diagnosa_utama'] ?? null,
                    'icd10_utama'             => $resumeData['icd10_utama'] ?? null,
                    'diagnosa_sekunder'       => $resumeData['diagnosa_sekunder'] ?? null,
                    'icd10_sekunder'          => $resumeData['icd10_sekunder'] ?? null,
                    'tindakan_prosedur'       => $resumeData['tindakan_prosedur'] ?? null,
                    'icd9_utama'              => $resumeData['icd9_utama'] ?? null,
                    'tindakan_prosedur_sekunder' => $resumeData['tindakan_prosedur_sekunder'] ?? null,
                    'icd9_sekunder'           => $resumeData['icd9_sekunder'] ?? null,
                    'riwayat_alergi'          => $resumeData['riwayat_alergi'] ?? null,
                    'keadaan_pulang'          => $resumeData['keadaan_pulang'] ?? null,
                    'cara_pulang'             => $resumeData['cara_pulang'] ?? null,
                    'dokter'                  => $resumeData['dokter'] ?? null,
                ]
            );

            if (!empty($resumeData['permintaan_konsul']) && is_array($resumeData['permintaan_konsul'])) {
                foreach ($resumeData['permintaan_konsul'] as $konsul) {
                    $konsul['resume_medis_id'] = $resume->id;
                    PermintaanKonsul::updateOrCreate(
                        [
                            'resume_medis_id' => $resume->id,
                            'pertanyaan' => $konsul['permintaan'] ?? null,
                            'jawaban' => $konsul['jawaban'] ?? null,
                        ],
                        $konsul
                    );
                }
            }

            if ($request->filled('terapi_pulang')) {
                $terapiArr = $request->input('terapi_pulang');
                if (is_array($terapiArr)) {
                    foreach ($terapiArr as $terapi) {
                        $terapi['resume_medis_id'] = $resume->id;
                        TerapiPulang::updateOrCreate(
                            [
                                'resume_medis_id' => $resume->id,
                                'nama_obat' => $terapi['nama_obat'] ?? null,
                            ],
                            $terapi
                        );
                    }
                }
            }

            if ($request->filled('instruksi_tindak_lanjut')) {
                $instruksiArr = $request->input('instruksi_tindak_lanjut');
                if (is_array($instruksiArr)) {
                    foreach ($instruksiArr as $instruksi) {
                        $instruksi['resume_medis_id'] = $resume->id;
                        IntruksiTindakLanjut::updateOrCreate(
                            [
                                'resume_medis_id' => $resume->id,
                                'instruksi' => $instruksi['instruksi'] ?? null,
                            ],
                            $instruksi
                        );
                    }
                }
            }

            // 2. Simpan Pengkajian Awal (jika ada)

            if ($request->input('pengkajianAwal') === true) {
                if ($request->filled('pengkajianAwal')) {
                    $pengkajian = $request->input('pengkajianAwal');
                    if (is_array($pengkajian) && isset($pengkajian[0])) {
                        $pengkajian = $pengkajian[0];
                    }
                    $pengkajian['resume_medis_id'] = $resume->id;
                    $pengkajianAwal = PengkajianAwal::updateOrCreate(
                        ['nomor_kunjungan' => $pengkajian['nomor_kunjungan']],
                        $pengkajian
                    );
                }
            }

            // 3. Simpan Triage (jika ada)
            if ($request->input('triage') === true) {
                if ($request->filled('triage')) {
                    $triage = $request->input('triage');
                    if (is_array($triage) && isset($triage[0])) {
                        $triage = $triage[0];
                    }
                    $triage['resume_medis_id'] = $resume->id;
                    EklaimTriage::updateOrCreate(
                        ['nomor_kunjungan' => $triage['nomor_kunjungan']],
                        $triage
                    );
                }
            }

            // 4. Simpan CPPT (jika ada)
            if ($request->input('cppt') === true) {
                if ($request->filled('cppt')) {
                    $cpptRows = $request->input('cppt');
                    if (is_array($cpptRows)) {
                        foreach ($cpptRows as $row) {
                            $row['resume_medis_id'] = $resume->id;
                            EklaimCPPT::updateOrCreate(
                                [
                                    'resume_medis_id' => $resume->id,
                                    'tanggal_jam' => $row['tanggal_jam'] ?? null,
                                    'nama_petugas' => $row['nama_petugas'] ?? null
                                ],
                                $row
                            );
                        }
                    }
                }
            }

            DB::connection('eklaim')->commit();
            return response()->json(['success' => 'Data Resume Medis berhasil disimpan.']);
        } catch (\Exception $e) {
            DB::connection('eklaim')->rollBack();
            return response()->json(['error' => 'Gagal menyimpan data: ' . $e->getMessage()], 500);
        }
    }

    public function EditTagihan(PengajuanKlaim $pengajuanKlaim)
    {
        $tagihanPendaftaran = TagihanPendaftaran::where('PENDAFTARAN', $pengajuanKlaim->nomor_pendaftaran)->where('UTAMA', 1)
            ->with([
                'tagihan.rincianTagihan',
                'tagihan.rincianTagihan.tarifAdministrasi.ruangan',
                'tagihan.rincianTagihan.tarifRuangRawat.ruanganKelas',
                'tagihan.rincianTagihan.tarifTindakan.tindakan',
                'tagihan.rincianTagihan.hargaBarang.obat',
                'tagihan.rincianTagihan.paket',
                'tagihan.rincianTagihan.tarifOksigen'
            ])
            ->first();

        return Inertia::render('eklaim/EditData/Tagihan', [
            'pengajuanKlaim' => $pengajuanKlaim,
            'tagihanPendaftaran' => $tagihanPendaftaran
        ]);
    }

    public function StoreEditTagihan(Request $request)
    {
        try {

            return redirect()->back()->with('success', 'Data Tagihan berhasil disimpan.');
        } catch (\Throwable $th) {

            return redirect()->back()->with('error', 'Gagal menyimpan data Tagihan: ' . $th->getMessage());
        }
    }

    public function EditLaboratorium(PengajuanKlaim $pengajuanKlaim)
    {
        return Inertia::render('eklaim/EditData/Laboratorium', [
            'pengajuanKlaim' => $pengajuanKlaim
        ]);
    }

    public function StoreEditLaboratorium(Request $request)
    {
        try {

            return redirect()->back()->with('success', 'Data Laboratorium berhasil disimpan.');
        } catch (\Throwable $th) {

            return redirect()->back()->with('error', 'Gagal menyimpan data Laboratorium: ' . $th->getMessage());
        }
    }

    public function EditRadiologi(PengajuanKlaim $pengajuanKlaim)
    {
        return Inertia::render('eklaim/EditData/Radiologi', [
            'pengajuanKlaim' => $pengajuanKlaim
        ]);
    }

    public function StoreEditRadiologi(Request $request)
    {
        try {

            return redirect()->back()->with('success', 'Data Radiologi berhasil disimpan.');
        } catch (\Throwable $th) {

            return redirect()->back()->with('error', 'Gagal menyimpan data Radiologi: ' . $th->getMessage());
        }
    }

    public function loadDataPengkajianAwalRIRD(Kunjungan $nomorKunjungan)
    {
        if (!$nomorKunjungan->exists) {
            return redirect()->back()->with('error', 'Nomor kunjungan tidak ditemukan.');
        }

        $nomorKunjungan->load([
            'pendaftaranPasien.pasien',
            'ruangan',
            'anamnesisPasien',
            'keluhanUtama',
            'rpp',
            'diagnosaPasien.namaDiagnosa',
            'tandaVital',
            'riwayatAlergi',
            'orderResep.orderResepDetil.namaObat',
            'anamnesisPasienDiperoleh',
            'riwayatPenyakitKeluarga',
            'rencanaTerapi',
            'dokterDPJP',
        ]);

        return response()->json([
            'kunjungan' => $nomorKunjungan
        ]);
    }

    public function switchEditResumeMedis(PengajuanKlaim $pengajuanKlaim)
    {
        try {
            $pengajuanKlaim->edit = $pengajuanKlaim->edit == 1 ? 0 : 1;
            $pengajuanKlaim->save();

            return redirect()->back();
        } catch (\Throwable $th) {
            return redirect()->back()->with([
                'error' => 'Gagal mengubah status edit Resume Medis: ' . $th->getMessage(),
            ]);
        }
    }

    public function getDataTriage($nomorKunjungan)
    {
        $data = Triage::where('KUNJUNGAN', $nomorKunjungan)
            ->with([
                'pasien',
            ])
            ->first();

        if ($data) {
            return response()->json($data);
        } else {
            return response()->json(['error' => 'Data Triage tidak ditemukan.'], 404);
        }
    }

    public function getDataCPPT($nomorKunjungan)
    {
        $data = CPPT::where('KUNJUNGAN', $nomorKunjungan)
            ->with([
                'kunjungan.pendaftaranPasien.pasien',
                'petugas.pegawai.profesi',
            ])
            ->get();

        if ($data) {
            return response()->json($data);
        } else {
            return response()->json(['error' => 'Data CPPT tidak ditemukan.'], 404);
        }
    }

    public function getDataPengkajianAwal($nomorKunjungan)
    {
        $data = Kunjungan::where('NOMOR', $nomorKunjungan)
            ->with([
                'pendaftaranPasien.pasien',
                'anamnesisPasien',
                'anamnesisPasienDiperoleh',
                'diagnosaPasien.namaDiagnosa',
                'dokterDPJP',
                'keluhanUtama',
                'orderResep.orderResepDetil.namaObat',
                'rencanaTerapi',
                'riwayatAlergi',
                'riwayatPenyakitKeluarga',
                'tandaVital',
                'rpp',
                'ruangan',
            ])
            ->first();

        if ($data) {
            return response()->json($data);
        } else {
            return response()->json(['error' => 'Data Pengkajian Awal tidak ditemukan.'], 404);
        }
    }
}
