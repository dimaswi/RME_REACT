<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\KeadaanUmumEdit;
use App\Models\Eklaim\KonsultasiEdit;
use App\Models\Eklaim\NyeriEdit;
use App\Models\Eklaim\PemeriksaanFisikEdit;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Eklaim\PengkajianAwalEdit;
use App\Models\Eklaim\PsikologiEdit;
use App\Models\Eklaim\ResumeMedisEdit;
use App\Models\Eklaim\TerapiPulangEdit;
use App\Models\Pembayaran\TagihanPendaftaran;
use App\Models\Pendaftaran\Kunjungan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EditDataController extends Controller
{
    public function EditResumeMedis(PengajuanKlaim $pengajuanKlaim)
    {
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
        ]);

        //Kop
        $imagePath = public_path('images/kop.png'); // Path ke gambar di folder public
        if (!file_exists($imagePath)) {
            throw new \Exception("Gambar tidak ditemukan di path: $imagePath");
        }
        $imageData = base64_encode(file_get_contents($imagePath)); // Konversi ke Base64
        $imageBase64 = 'data:image/png;base64,' . $imageData; // Tambahkan prefix Base64

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
            ])->with('error', 'Tidak ada data resume medis untuk diedit');
        }

        return Inertia::render('eklaim/EditData/ResumeMedis', [
            'pengajuanKlaim' => $pengajuanKlaim,
            'imageBase64' => $imageBase64
        ])->with('success', 'Berhasil mengambil data resume medis');
    }

    public function StoreEditResumeMedis(Request $request)
    {
        dd($request->all());
        try {
            DB::connection('eklaim')->beginTransaction();

            $resumeMedisEdit = ResumeMedisEdit::create([
                'pengajuan_klaim' => $request->input('resumeMedis')['id_pengajuan_klaim'],
                'nama_pasien' => $request->input('resumeMedis')['nama_pasien'],
                'NORM' => $request->input('resumeMedis')['NORM'],
                'tanggal_lahir' => $request->input('resumeMedis')['tanggal_lahir'],
                'jenis_kelamin' => $request->input('resumeMedis')['jenis_kelamin'],
                'ruang_rawat' => $request->input('resumeMedis')['ruang_rawat'],
                'penjamin' => $request->input('resumeMedis')['penjamin'],
                'indikasi_rawat_inap' => $request->input('resumeMedis')['indikasi_rawat_inap'],
                'tanggal_masuk' => $request->input('resumeMedis')['tanggal_masuk'],
                'tanggal_keluar' => $request->input('resumeMedis')['tanggal_keluar'],
                'lama_dirawat' => $request->input('resumeMedis')['lama_dirawat'],
                'riwayat_penyakit_sekarang' => $request->input('resumeMedis')['riwayat_penyakit_sekarang'],
                'riwayat_penyakit_dulu' => $request->input('resumeMedis')['riwayat_penyakit_lalu'],
                'pemeriksaan_fisik' => $request->input('resumeMedis')['pemeriksaan_fisik'],
                'diagnosa_utama' => $request->input('resumeMedis')['diagnosa_utama'],
                'icd10_utama' => $request->input('resumeMedis')['icd10_utama'],
                'diagnosa_sekunder' => $request->input('resumeMedis')['diagnosa_sekunder'],
                'icd10_sekunder' => $request->input('resumeMedis')['icd10_sekunder'],
                'prosedur_utama' => $request->input('resumeMedis')['tindakan_prosedur'],
                'icd9_utama' => $request->input('resumeMedis')['icd9_utama'],
                'prosedur_sekunder' => $request->input('resumeMedis')['tindakan_sekunder'],
                'icd9_sekunder' => $request->input('resumeMedis')['icd9_sekunder'],
                'riwayat_alergi' => $request->input('resumeMedis')['riwayat_alergi'],
                'keadaan_pulang' => $request->input('resumeMedis')['keadaan_pulang'],
                'cara_pulang' => $request->input('resumeMedis')['cara_pulang'],
                'intruksi_tindak_lanjut' => $request->input('resumeMedis')['intruksi_tindak_lanjut'],
                'dokter' => $request->input('resumeMedis')['dokter'],
                'tanda_tangan_pasien' => $request->input('resumeMedis')['tanda_tangan_pasien']
            ]);

            if ($request->has('permintaan_konsul')) {
                foreach ($request->input('resumeMedis')['permintaan_konsul'] as $konsul) {
                    KonsultasiEdit::create([
                        'resume_medis' => $resumeMedisEdit->id,
                        'pertanyaan' => $konsul['perimintaan'],
                        'jawaban' => $konsul['jawaban']
                    ]);
                }
            }

            if ($request->has('terapi_pulang')) {
                foreach ($request->input('resumeMedis')['terapi_pulang'] as $terapi) {
                    TerapiPulangEdit::create([
                        'resume_medis' => $resumeMedisEdit->id,
                        'nama_obat' => $terapi['namaObat'],
                        'jumlah' => $terapi['jumlah'],
                        'frekuensi' => $terapi['frekuensi'],
                        'cara_pakai' => $terapi['caraPemberian'],
                    ]);
                }
            }

            if ($request->has('pengkajiaAwal')) {
                $pengkajian_awal = PengkajianAwalEdit::create([
                    'resume_medis' => $resumeMedisEdit->id,
                    'nama_pasien' => $request->input('pengkajiaAwal')['nama_pasien'],
                    'ruangan' => $request->input('pengkajiaAwal')['ruangan'],
                    'tanggal_masuk' => $request->input('pengkajiaAwal')['tanggal_masuk'],
                    'alamat' => $request->input('pengkajiaAwal')['alamat'],
                    'NORM' => $request->input('pengkajiaAwal')['nomor_rm'],
                    'tanggal_lahir' => $request->input('pengkajiaAwal')['tanggal_lahir'],
                    'jenis_kelamin' => $request->input('pengkajiaAwal')['jenis_kelamin'],
                    'riwayat_alergi' => $request->input('pengkajiaAwal')['riwayat_alergi'],
                    'resiko_jatuh' => $request->input('pengkajiaAwal')['resiko_jatuh']['resiko'],
                    'skor_resiko_jatuh' => $request->input('pengkajiaAwal')['resiko_jatuh']['skor'],
                    'metode_penilaian_resiko_jatuh' => $request->input('pengkajiaAwal')['resiko_jatuh']['metode'],
                    'resiko_dekubitus' => $request->input('pengkajiaAwal')['resiko_dekubitus']['resiko'],
                    'skor_resiko_dekubitus' => $request->input('pengkajiaAwal')['resiko_dekubitus']['skor'],
                    'penurunan_berat_badan' => $request->input('pengkajiaAwal')['resiko_gizi']['penurunan_berat_badan'],
                    'nafsu_makan' => $request->input('pengkajiaAwal')['resiko_gizi']['penurunan_asupan'],
                    'diagnosa_khusus' => $request->input('pengkajiaAwal')['resiko_gizi']['diagnosis_khusus'],
                    'edukasi_pasien' => $request->input('pengkajiaAwal')['edukasi_pasien'],
                    'skrining_rencana_pulang' => $request->input('pengkajiaAwal')['discharge_planning']['skrining'],
                    'faktor_risiko_rencana_pulang' => $request->input('pengkajiaAwal')['discharge_planning']['faktor_risiko'],
                    'tindak_lanjut_rencana_pulang' => $request->input('pengkajiaAwal')['discharge_planning']['tindak_lanjut'],
                    'rencana_keperawatan' => $request->input('pengkajiaAwal')['rencana_keperawatan'],
                    'masalah_medis' => $request->input('pengkajiaAwal')['masalah_medis'],
                    'diagnosa_medis' => $request->input('pengkajiaAwal')['diagnosa_keperawatan'],
                    'rencana_terapi' => $request->input('pengkajiaAwal')['rencana_terapi'],
                    'dokter' => $request->input('pengkajiaAwal')['nama_dokter'],
                    'tanda_tangan_perawat' => $request->input('pengkajiaAwal')['tanda_tangan_perawat'],
                ]);

                if ($request->has('pengkajiaAwal')['tanda_vital']) {
                    foreach ($request->input('pengkajiaAwal')['tanda_vital'] as $tandaVital) {
                        KeadaanUmumEdit::create([
                            'pengkajian_awal' => $pengkajian_awal->id,
                            'gcs' => $tandaVital['gcs'],
                            'eye' => $tandaVital['eye'],
                            'motorik' => $tandaVital['motorik'],
                            'verbal' => $tandaVital['verbal'],
                            'tekanan_darah' => $tandaVital['tekanan_darah'],
                            'frekuensi_nadi' => $tandaVital['frekuensi_nadi'],
                            'frekuensi_nafas' => $tandaVital['frekuensi_nafas'],
                            'suhu' => $tandaVital['suhu'],
                            'berat_badan' => $tandaVital['berat_badan'],
                            'saturasi_oksigen' => $tandaVital['saturasi_oksigen']
                        ]);
                    }
                }

                if ($request->has('pengkajiaAwal')['pemeriksaan_fisik']) {
                    foreach ($request->input('pengkajiaAwal')['pemeriksaan_fisik'] as $tandaVital) {
                        PemeriksaanFisikEdit::create([
                            'pengkajian_awal' => $pengkajian_awal->id,
                            'mata' => $tandaVital['mata'],
                            'ikterus' => $tandaVital['ikterus'],
                            'pupil' => $tandaVital['pupil'],
                            'diameter_mata' => $tandaVital['diameter_mata'],
                            'udem_palpebrae' => $tandaVital['udem_palpebrae'],
                            'kelainan_mata' => $tandaVital['kelainan_mata'],
                            'tht' => $tandaVital['tht'],
                            'tongsil' => $tandaVital['tongsil'],
                            'faring' => $tandaVital['faring'],
                            'lidah' => $tandaVital['lidah'],
                            'bibir' => $tandaVital['bibir'],
                            'leher' => $tandaVital['leher'],
                            'jvp' => $tandaVital['jvp'],
                            'limfe' => $tandaVital['limfe'],
                            'kaku_kuduk' => $tandaVital['kaku_kuduk'],
                            'thoraks' => $tandaVital['thoraks'],
                            'cor' => $tandaVital['cor'],
                            's1' => $tandaVital['s1'],
                            'mur_mur' => $tandaVital['mur_mur'],
                            'pulmo' => $tandaVital['pulmo'],
                            'suara_nafas' => $tandaVital['suara_nafas'],
                            'ronchi' => $tandaVital['ronchi'],
                            'wheezing' => $tandaVital['wheezing'],
                            'abdomen' => $tandaVital['abdomen'],
                            'meteorismus' => $tandaVital['meteorismus'],
                            'peristaltik' => $tandaVital['peristaltik'],
                            'asites' => $tandaVital['asites'],
                            'nyeri_tekan' => $tandaVital['nyeri_tekan'],
                            'hepar' => $tandaVital['hepar'],
                            'lien' => $tandaVital['lien'],
                            'extremitas' => $tandaVital['extremitas'],
                            'udem' => $tandaVital['udem'],
                            'defeksesi' => $tandaVital['defeksesi'],
                            'urin' => $tandaVital['urin'],
                            'lain_lain' => $tandaVital['lain_lain']
                        ]);
                    }
                }

                if ($request->has('pengkajiaAwal')['status_psikososial']) {
                    foreach ($request->input('pengkajiaAwal')['status_psikososial'] as $psikologi) {
                        PsikologiEdit::create([
                            'pengkajian_awal' => $pengkajian_awal->id,
                            'status_psikologi' => $psikologi['status_psikologi'],
                            'status_mental' => $psikologi['status_mental'],
                            'hubungan_keluarga' => $psikologi['hubungan_keluarga'],
                            'tempat_tinggal' => $psikologi['tempat_tinggal'],
                            'agama' => $psikologi['agama'],
                            'kebiasaan_beribadah' => $psikologi['kebiasaan_beribadah'],
                            'pekerjaan' => $psikologi['pekerjaan'],
                            'penghasilan' => $psikologi['penghasilan']
                        ]);
                    }
                }

                if ($request->has('pengkajiaAwal')['penilaian_nyeri']) {
                    foreach ($request->input('pengkajiaAwal')['penilaian_nyeri'] as $penilaianNyeri) {
                        NyeriEdit::create([
                            'pengkajian_awal' => $pengkajian_awal->id,
                            'nyeri' => $penilaianNyeri['nyeri'],
                            'onset' => $penilaianNyeri['onset'],
                            'pencetus' => $penilaianNyeri['pencetus'],
                            'lokasi_nyeri' => $penilaianNyeri['lokasi'],
                            'gambaran_nyeri' => $penilaianNyeri['gambaran'],
                            'durasi' => $penilaianNyeri['durasi'],
                            'skala' => $penilaianNyeri['skala'],
                            'metode' => $penilaianNyeri['metode']
                        ]);
                    }
                }
            }

            return redirect()->back()->with('success', 'Data Resume Medis berhasil disimpan.');
        } catch (\Throwable $th) {

            return redirect()->back()->with('error', 'Gagal menyimpan data Resume Medis: ' . $th->getMessage());
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
}
