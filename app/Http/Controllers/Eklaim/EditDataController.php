<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\AnamnesaEdit;
use App\Models\Eklaim\IntruksiTindakLanjutEdit;
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
        if ($request->input('jenisSave') == 1) {
            try {
                DB::connection('eklaim')->beginTransaction();
                $resumeMedisEdit = ResumeMedisEdit::where('id', $request->input('resumeMedis')['id_resume_medis'])->update([
                    'pengajuan_klaim' => $request->input('resumeMedis')['id_pengajuan_klaim'] ?? null,
                    'nama_pasien' => $request->input('resumeMedis')['nama_pasien'] ?? null,
                    'NORM' => $request->input('resumeMedis')['no_rm'] ?? null,
                    'tanggal_lahir' => $request->input('resumeMedis')['tanggal_lahir'] ?? null,
                    'jenis_kelamin' => $request->input('resumeMedis')['jenis_kelamin'] ?? null,
                    'ruang_rawat' => $request->input('resumeMedis')['ruang_rawat'] ?? null,
                    'penjamin' => $request->input('resumeMedis')['penjamin'] ?? null,
                    'indikasi_rawat_inap' => $request->input('resumeMedis')['indikasi_rawat_inap'] ?? null,
                    'tanggal_masuk' => $request->input('resumeMedis')['tanggal_masuk'] ?? null,
                    'tanggal_keluar' => $request->input('resumeMedis')['tanggal_keluar'] ?? null,
                    'lama_dirawat' => $request->input('resumeMedis')['lama_dirawat'] ?? null,
                    'riwayat_penyakit_sekarang' => $request->input('resumeMedis')['riwayat_penyakit_sekarang'] ?? null,
                    'riwayat_penyakit_dulu' => $request->input('resumeMedis')['riwayat_penyakit_lalu'] ?? null,
                    'pemeriksaan_fisik' => $request->input('resumeMedis')['pemeriksaan_fisik'] ?? null,
                    'diagnosa_utama' => $request->input('resumeMedis')['diagnosa_utama'] ?? null,
                    'icd10_utama' => $request->input('resumeMedis')['icd10_utama'] ?? null,
                    'diagnosa_sekunder' => $request->input('resumeMedis')['diagnosa_sekunder'] ?? null,
                    'icd10_sekunder' => $request->input('resumeMedis')['icd10_sekunder'] ?? null,
                    'prosedur_utama' => $request->input('resumeMedis')['tindakan_prosedur'] ?? null,
                    'icd9_utama' => $request->input('resumeMedis')['icd9_utama'] ?? null,
                    'prosedur_sekunder' => $request->input('resumeMedis')['tindakan_prosedur_sekunder'] ?? null,
                    'icd9_sekunder' => $request->input('resumeMedis')['icd9_sekunder'] ?? null,
                    'riwayat_alergi' => $request->input('resumeMedis')['riwayat_alergi'] ?? null,
                    'keadaan_pulang' => $request->input('resumeMedis')['keadaan_pulang'] ?? null,
                    'cara_pulang' => $request->input('resumeMedis')['cara_pulang'] ?? null,
                    'dokter' => $request->input('resumeMedis')['dokter'] ?? null,
                    'tanda_tangan_pasien' => $request->input('resumeMedis')['tanda_tangan_pasien'] ?? null
                ]);

                if ($request->has('resumeMedis.permintaan_konsul')) {
                    KonsultasiEdit::where('resume_medis', $request->input('resumeMedis')['id_resume_medis'])->delete();
                    foreach ($request->input('resumeMedis')['permintaan_konsul'] as $konsul) {
                        KonsultasiEdit::create([
                            'resume_medis' => $request->input('resumeMedis')['id_resume_medis'],
                            'pertanyaan' => $konsul['permintaan'] ?? null,
                            'jawaban' => $konsul['jawaban'] ?? null
                        ]);
                    }
                }

                if ($request->has('resumeMedis.terapi_pulang')) {
                    TerapiPulangEdit::where('resume_medis', $request->input('resumeMedis')['id_resume_medis'])->delete();
                    foreach ($request->input('resumeMedis')['terapi_pulang'] as $terapi) {
                        TerapiPulangEdit::create([
                            'resume_medis' => $request->input('resumeMedis')['id_resume_medis'],
                            'nama_obat' => $terapi['namaObat'] ?? null,
                            'jumlah' => $terapi['jumlah'] ?? null,
                            'frekuensi' => $terapi['frekuensi'] ?? null,
                            'cara_pemakaian' => $terapi['caraPemberian'] ?? null,
                        ]);
                    }
                }

                if ($request->has('resumeMedis.instruksi_tindak_lanjut')) {
                    IntruksiTindakLanjutEdit::where('resume_medis', $request->input('resumeMedis')['id_resume_medis'])->update([
                        'poli_tujuan' => $request->input('resumeMedis')['instruksi_tindak_lanjut']['poliTujuan'] ?? null,
                        'tanggal' => $request->input('resumeMedis')['instruksi_tindak_lanjut']['tanggal'] ?? null,
                        'jam' => $request->input('resumeMedis')['instruksi_tindak_lanjut']['jam'] ?? null,
                        'nomor_bpjs' => $request->input('resumeMedis')['instruksi_tindak_lanjut']['nomor_bpjs'] ?? null
                    ]);
                }

                if ($request->has('pengkajianAwal')) {
                    $id_pengkajianAwal = PengkajianAwalEdit::where('resume_medis', $request->input('resumeMedis')['id_resume_medis'])->first();
                    PengkajianAwalEdit::where('resume_medis', $id_pengkajianAwal->id)->update([
                        'nomor_kunjungan' => $request->input('pengkajianAwal')['nomor_kunjungan'] ?? null,
                        'nama_pasien' => $request->input('pengkajianAwal')['nama_pasien'] ?? null,
                        'ruangan' => $request->input('pengkajianAwal')['ruangan'] ?? null,
                        'tanggal_masuk' => $request->input('pengkajianAwal')['tanggal_masuk'] ?? null,
                        'alamat' => $request->input('pengkajianAwal')['alamat'] ?? null,
                        'NORM' => $request->input('pengkajianAwal')['nomor_rm'] ?? null,
                        'tanggal_lahir' => $request->input('pengkajianAwal')['tanggal_lahir'] ?? null,
                        'jenis_kelamin' => $request->input('pengkajianAwal')['jenis_kelamin'] ?? null,
                        'riwayat_alergi' => $request->input('pengkajianAwal')['riwayat_alergi'] ?? null,
                        'resiko_jatuh' => $request->input('pengkajianAwal')['resiko_jatuh']['resiko'] ?? null,
                        'skor_resiko_jatuh' => $request->input('pengkajianAwal')['resiko_jatuh']['skor'] ?? null,
                        'metode_penilaian_resiko_jatuh' => $request->input('pengkajianAwal')['resiko_jatuh']['metode'] ?? null,
                        'resiko_dekubitus' => $request->input('pengkajianAwal')['resiko_dekubitas']['resiko'] ?? null,
                        'skor_resiko_dekubitus' => $request->input('pengkajianAwal')['resiko_dekubitas']['skor'] ?? null,
                        'penurunan_berat_badan' => $request->input('pengkajianAwal')['resiko_gizi']['penurunan_berat_badan'] ?? null,
                        'nafsu_makan' => $request->input('pengkajianAwal')['resiko_gizi']['penurunan_asupan'] ?? null,
                        'diagnosa_khusus' => $request->input('pengkajianAwal')['resiko_gizi']['diagnosis_khusus'] ?? null,
                        'edukasi_pasien' => $request->input('pengkajianAwal')['edukasi_pasien'] ?? null,
                        'skrining_rencana_pulang' => $request->input('pengkajianAwal')['discharge_planning']['skrinning'] ?? null,
                        'faktor_risiko_rencana_pulang' => $request->input('pengkajianAwal')['discharge_planning']['faktor_resiko'] ?? null,
                        'tindak_lanjut_rencana_pulang' => $request->input('pengkajianAwal')['discharge_planning']['tindak_lanjut'] ?? null,
                        'rencana_keperawatan' => $request->input('pengkajianAwal')['rencana_keperawatan'] ?? null,
                        'masalah_medis' => $request->input('pengkajianAwal')['masalah_medis'] ?? null,
                        'diagnosa_medis' => $request->input('pengkajianAwal')['diagnosa_keperawatan'] ?? null,
                        'rencana_terapi' => $request->input('pengkajianAwal')['rencana_terapi'] ?? null,
                        'dokter' => $request->input('pengkajianAwal')['nama_dokter'] ?? null,
                        'tanda_tangan_perawat' => $request->input('pengkajianAwal')['tanda_tangan_perawat'] ?? null,
                    ]);

                    if ($request->has('pengkajianAwal.tanda_vital')) {
                        KeadaanUmumEdit::where('pengkajian_awal', $id_pengkajianAwal->id)->update([
                            'keadaan_umum' => $request->input('pengkajianAwal')['tanda_vital']['keadaan_umum'] ?? null,
                            'tingkat_kesadaran' => $request->input('pengkajianAwal')['tanda_vital']['tingkat_kesadaran'] ?? null,
                            'gcs' => $request->input('pengkajianAwal')['tanda_vital']['gcs'] ?? null,
                            'eye' => $request->input('pengkajianAwal')['tanda_vital']['eye'] ?? null,
                            'motorik' => $request->input('pengkajianAwal')['tanda_vital']['motorik'] ?? null,
                            'verbal' => $request->input('pengkajianAwal')['tanda_vital']['verbal'] ?? null,
                            'tekanan_darah' => $request->input('pengkajianAwal')['tanda_vital']['tekanan_darah'] ?? null,
                            'frekuensi_nadi' => $request->input('pengkajianAwal')['tanda_vital']['frekuensi_nadi'] ?? null,
                            'frekuensi_nafas' => $request->input('pengkajianAwal')['tanda_vital']['frekuensi_nafas'] ?? null,
                            'suhu' => $request->input('pengkajianAwal')['tanda_vital']['suhu'] ?? null,
                            'berat_badan' => $request->input('pengkajianAwal')['tanda_vital']['berat_badan'] ?? null,
                            'saturasi_oksigen' => $request->input('pengkajianAwal')['tanda_vital']['saturasi_o2'] ?? null
                        ]);
                    }

                    if ($request->has('pengkajianAwal.pemeriksaan_fisik')) {
                        PemeriksaanFisikEdit::where('pengkajian_awal', $id_pengkajianAwal->id)->update([
                            'mata' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['mata'] ?? null,
                            'ikterus' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['ikterus'] ?? null,
                            'pupil' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['pupil'] ?? null,
                            'diameter_mata' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['diameter_mata'] ?? null,
                            'udem_palpebrae' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['udem_palpebrae'] ?? null,
                            'kelainan_mata' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['kelainan_mata'] ?? null,
                            'tht' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['tht'] ?? null,
                            'tongsil' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['tongsil'] ?? null,
                            'faring' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['faring'] ?? null,
                            'lidah' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['lidah'] ?? null,
                            'bibir' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['bibir'] ?? null,
                            'leher' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['leher'] ?? null,
                            'jvp' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['jvp'] ?? null,
                            'limfe' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['limfe'] ?? null,
                            'kaku_kuduk' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['kaku_kuduk'] ?? null,
                            'thoraks' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['thoraks'] ?? null,
                            'cor' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['cor'] ?? null,
                            's1s2' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['s1s2'] ?? null,
                            'mur_mur' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['murmur'] ?? null,
                            'pulmo' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['pulmo'] ?? null,
                            'suara_nafas' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['suara_nafas'] ?? null,
                            'ronchi' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['ronchi'] ?? null,
                            'wheezing' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['wheezing'] ?? null,
                            'abdomen' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['abdomen'] ?? null,
                            'meteorismus' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['meteorismus'] ?? null,
                            'peristaltik' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['peristaltik'] ?? null,
                            'asites' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['asites'] ?? null,
                            'nyeri_tekan' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['nyeri_tekan'] ?? null,
                            'hepar' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['hepar'] ?? null,
                            'lien' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['lien'] ?? null,
                            'extremitas' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['extremitas'] ?? null,
                            'udem' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['udem'] ?? null,
                            'defeksesi' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['defeksesi'] ?? null,
                            'urin' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['urin'] ?? null,
                            'lain_lain' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['pemeriksaan_lain_lain'] ?? null
                        ]);
                    }

                    if ($request->has('pengkajianAwal.status_psikososial')) {
                        PsikologiEdit::where('pengkajian_awal', $id_pengkajianAwal->id)->update([
                            'status_psikologi' => $request->input('pengkajianAwal')['status_psikososial']['status_psikologis'] ?? null,
                            'status_mental' => $request->input('pengkajianAwal')['status_psikososial']['status_mental'] ?? null,
                            'hubungan_keluarga' => $request->input('pengkajianAwal')['status_psikososial']['hubungan_keluarga'] ?? null,
                            'tempat_tinggal' => $request->input('pengkajianAwal')['status_psikososial']['tempat_tinggal'] ?? null,
                            'agama' => $request->input('pengkajianAwal')['status_psikososial']['agama'] ?? null,
                            'kebiasaan_beribadah' => $request->input('pengkajianAwal')['status_psikososial']['kebiasaan_beribadah'] ?? null,
                            'pekerjaan' => $request->input('pengkajianAwal')['status_psikososial']['pekerjaan'] ?? null,
                            'penghasilan' => $request->input('pengkajianAwal')['status_psikososial']['penghasilan'] ?? null
                        ]);
                    }

                    if ($request->has('pengkajianAwal.anamnesis')) {
                        $anamnesis = $request->input('pengkajianAwal.anamnesis');
                        AnamnesaEdit::where('pengkajian_awal', $id_pengkajianAwal->id)->update([
                            'anamnesa_diperoleh' => $anamnesis['auto_anamnesis'] == 1 ? 'Auto Anamnesis' : ($anamnesis['allo_anamnesis'] == 1 ? 'Allo Anamnesis' : null),
                            'anamnesa_diperoleh_dari' => $anamnesis['dari'] ?? null,
                            'keluhan_utama' => $anamnesis['keluhan_utama'] ?? null,
                            'riwayat_penyakit_sekarang' => $anamnesis['riwayat_penyakit_sekarang'] ?? null,
                            'riwayat_penyakit_dulu' => $anamnesis['riwayat_penyakit_lalu'] ?? null,
                            'riwayat_pengobatan' => $anamnesis['riwayat_pengobatan'] ?? null,
                            'riwayat_penyakit_keluarga' => $anamnesis['riwayat_penyakit_keluarga'] ?? null
                        ]);
                    }

                    if ($request->has('pengkajianAwal.penilaian_nyeri')) {
                        NyeriEdit::where('pengkajian_awal', $id_pengkajianAwal->id)->update([
                            'nyeri' => $request->input('pengkajianAwal.penilaian_nyeri.nyeri') ?? null,
                            'onset' => $request->input('pengkajianAwal.penilaian_nyeri.onset') ?? null,
                            'pencetus' => $request->input('pengkajianAwal.penilaian_nyeri.pencetus') ?? null,
                            'lokasi_nyeri' => $request->input('pengkajianAwal.penilaian_nyeri.lokasi') ?? null,
                            'gambaran_nyeri' => $request->input('pengkajianAwal.penilaian_nyeri.gambaran') ?? null,
                            'durasi' => $request->input('pengkajianAwal.penilaian_nyeri.durasi') ?? null,
                            'skala' => $request->input('pengkajianAwal.penilaian_nyeri.skala') ?? null,
                            'metode' => $request->input('pengkajianAwal.penilaian_nyeri.metode') ?? null
                        ]);
                    }
                }

                DB::connection('eklaim')->commit();
                return response()->json(['success' => 'Data Resume Medis berhasil disimpan.']);
            } catch (\Throwable $th) {
                DB::connection('eklaim')->rollBack();
                return response()->json(['error' => 'Gagal menyimpan data Resume Medis: ' . $th->getMessage()], 500);
            }
        } else {
            try {
                DB::connection('eklaim')->beginTransaction();
                $resumeMedisEdit = ResumeMedisEdit::create([
                    'pengajuan_klaim' => $request->input('resumeMedis')['id_pengajuan_klaim'] ?? null,
                    'nama_pasien' => $request->input('resumeMedis')['nama_pasien'] ?? null,
                    'NORM' => $request->input('resumeMedis')['NORM'] ?? null,
                    'tanggal_lahir' => $request->input('resumeMedis')['tanggal_lahir'] ?? null,
                    'jenis_kelamin' => $request->input('resumeMedis')['jenis_kelamin'] ?? null,
                    'ruang_rawat' => $request->input('resumeMedis')['ruang_rawat'] ?? null,
                    'penjamin' => $request->input('resumeMedis')['penjamin'] ?? null,
                    'indikasi_rawat_inap' => $request->input('resumeMedis')['indikasi_rawat_inap'] ?? null,
                    'tanggal_masuk' => $request->input('resumeMedis')['tanggal_masuk'] ?? null,
                    'tanggal_keluar' => $request->input('resumeMedis')['tanggal_keluar'] ?? null,
                    'lama_dirawat' => $request->input('resumeMedis')['lama_dirawat'] ?? null,
                    'riwayat_penyakit_sekarang' => $request->input('resumeMedis')['riwayat_penyakit_sekarang'] ?? null,
                    'riwayat_penyakit_dulu' => $request->input('resumeMedis')['riwayat_penyakit_lalu'] ?? null,
                    'pemeriksaan_fisik' => $request->input('resumeMedis')['pemeriksaan_fisik'] ?? null,
                    'diagnosa_utama' => $request->input('resumeMedis')['diagnosa_utama'] ?? null,
                    'icd10_utama' => $request->input('resumeMedis')['icd10_utama'] ?? null,
                    'diagnosa_sekunder' => $request->input('resumeMedis')['diagnosa_sekunder'] ?? null,
                    'icd10_sekunder' => $request->input('resumeMedis')['icd10_sekunder'] ?? null,
                    'prosedur_utama' => $request->input('resumeMedis')['tindakan_prosedur'] ?? null,
                    'icd9_utama' => $request->input('resumeMedis')['icd9_utama'] ?? null,
                    'prosedur_sekunder' => $request->input('resumeMedis')['tindakan_prosedur_sekunder'] ?? null,
                    'icd9_sekunder' => $request->input('resumeMedis')['icd9_sekunder'] ?? null,
                    'riwayat_alergi' => $request->input('resumeMedis')['riwayat_alergi'] ?? null,
                    'keadaan_pulang' => $request->input('resumeMedis')['keadaan_pulang'] ?? null,
                    'cara_pulang' => $request->input('resumeMedis')['cara_pulang'] ?? null,
                    'dokter' => $request->input('resumeMedis')['dokter'] ?? null,
                    'tanda_tangan_pasien' => $request->input('resumeMedis')['tanda_tangan_pasien'] ?? null
                ]);

                if ($request->has('resumeMedis.permintaan_konsul')) {
                    foreach ($request->input('resumeMedis')['permintaan_konsul'] as $konsul) {
                        KonsultasiEdit::create([
                            'resume_medis' => $resumeMedisEdit->id ?? null,
                            'pertanyaan' => $konsul['permintaan'] ?? null,
                            'jawaban' => $konsul['jawaban'] ?? null
                        ]);
                    }
                }

                if ($request->has('resumeMedis.terapi_pulang')) {
                    foreach ($request->input('resumeMedis')['terapi_pulang'] as $terapi) {
                        TerapiPulangEdit::create([
                            'resume_medis' => $resumeMedisEdit->id,
                            'nama_obat' => $terapi['namaObat'] ?? null,
                            'jumlah' => $terapi['jumlah'] ?? null,
                            'frekuensi' => $terapi['frekuensi'] ?? null,
                            'cara_pemakaian' => $terapi['caraPemberian'] ?? null,
                        ]);
                    }
                }

                if ($request->has('resumeMedis.instruksi_tindak_lanjut')) {
                    IntruksiTindakLanjutEdit::create([
                        'resume_medis' => $resumeMedisEdit->id,
                        'poli_tujuan' => $request->input('resumeMedis')['instruksi_tindak_lanjut']['poliTujuan'] ?? null,
                        'tanggal' => $request->input('resumeMedis')['instruksi_tindak_lanjut']['tanggal'] ?? null,
                        'jam' => $request->input('resumeMedis')['instruksi_tindak_lanjut']['jam'] ?? null,
                        'nomor_bpjs' => $request->input('resumeMedis')['instruksi_tindak_lanjut']['nomor_bpjs'] ?? null
                    ]);
                }

                if ($request->has('pengkajianAwal')) {
                    $pengkajian_awal = PengkajianAwalEdit::create([
                        'resume_medis' => $resumeMedisEdit->id,
                        'nomor_kunjungan' => $request->input('pengkajianAwal')['nomor_kunjungan'] ?? null,
                        'nama_pasien' => $request->input('pengkajianAwal')['nama_pasien'] ?? null,
                        'ruangan' => $request->input('pengkajianAwal')['ruangan'] ?? null,
                        'tanggal_masuk' => $request->input('pengkajianAwal')['tanggal_masuk'] ?? null,
                        'alamat' => $request->input('pengkajianAwal')['alamat'] ?? null,
                        'NORM' => $request->input('pengkajianAwal')['nomor_rm'] ?? null,
                        'tanggal_lahir' => $request->input('pengkajianAwal')['tanggal_lahir'] ?? null,
                        'jenis_kelamin' => $request->input('pengkajianAwal')['jenis_kelamin'] ?? null,
                        'riwayat_alergi' => $request->input('pengkajianAwal')['riwayat_alergi'] ?? null,
                        'resiko_jatuh' => $request->input('pengkajianAwal')['resiko_jatuh']['resiko'] ?? null,
                        'skor_resiko_jatuh' => $request->input('pengkajianAwal')['resiko_jatuh']['skor'] ?? null,
                        'metode_penilaian_resiko_jatuh' => $request->input('pengkajianAwal')['resiko_jatuh']['metode'] ?? null,
                        'resiko_dekubitus' => $request->input('pengkajianAwal')['resiko_dekubitas']['resiko'] ?? null,
                        'skor_resiko_dekubitus' => $request->input('pengkajianAwal')['resiko_dekubitas']['skor'] ?? null,
                        'penurunan_berat_badan' => $request->input('pengkajianAwal')['resiko_gizi']['penurunan_berat_badan'] ?? null,
                        'nafsu_makan' => $request->input('pengkajianAwal')['resiko_gizi']['penurunan_asupan'] ?? null,
                        'diagnosa_khusus' => $request->input('pengkajianAwal')['resiko_gizi']['diagnosis_khusus'] ?? null,
                        'edukasi_pasien' => $request->input('pengkajianAwal')['edukasi_pasien'] ?? null,
                        'skrining_rencana_pulang' => $request->input('pengkajianAwal')['discharge_planning']['skrinning'] ?? null,
                        'faktor_risiko_rencana_pulang' => $request->input('pengkajianAwal')['discharge_planning']['faktor_resiko'] ?? null,
                        'tindak_lanjut_rencana_pulang' => $request->input('pengkajianAwal')['discharge_planning']['tindak_lanjut'] ?? null,
                        'rencana_keperawatan' => $request->input('pengkajianAwal')['rencana_keperawatan'] ?? null,
                        'masalah_medis' => $request->input('pengkajianAwal')['masalah_medis'] ?? null,
                        'diagnosa_medis' => $request->input('pengkajianAwal')['diagnosa_keperawatan'] ?? null,
                        'rencana_terapi' => $request->input('pengkajianAwal')['rencana_terapi'] ?? null,
                        'dokter' => $request->input('pengkajianAwal')['nama_dokter'] ?? null,
                        'tanda_tangan_perawat' => $request->input('pengkajianAwal')['tanda_tangan_perawat'] ?? null,
                    ]);

                    if ($request->has('pengkajianAwal.tanda_vital')) {
                        KeadaanUmumEdit::create([
                            'pengkajian_awal' => $pengkajian_awal->id,
                            'keadaan_umum' => $request->input('pengkajianAwal')['tanda_vital']['keadaan_umum'] ?? null,
                            'tingkat_kesadaran' => $request->input('pengkajianAwal')['tanda_vital']['tingkat_kesadaran'] ?? null,
                            'gcs' => $request->input('pengkajianAwal')['tanda_vital']['gcs'] ?? null,
                            'eye' => $request->input('pengkajianAwal')['tanda_vital']['eye'] ?? null,
                            'motorik' => $request->input('pengkajianAwal')['tanda_vital']['motorik'] ?? null,
                            'verbal' => $request->input('pengkajianAwal')['tanda_vital']['verbal'] ?? null,
                            'tekanan_darah' => $request->input('pengkajianAwal')['tanda_vital']['tekanan_darah'] ?? null,
                            'frekuensi_nadi' => $request->input('pengkajianAwal')['tanda_vital']['frekuensi_nadi'] ?? null,
                            'frekuensi_nafas' => $request->input('pengkajianAwal')['tanda_vital']['frekuensi_nafas'] ?? null,
                            'suhu' => $request->input('pengkajianAwal')['tanda_vital']['suhu'] ?? null,
                            'berat_badan' => $request->input('pengkajianAwal')['tanda_vital']['berat_badan'] ?? null,
                            'saturasi_oksigen' => $request->input('pengkajianAwal')['tanda_vital']['saturasi_o2'] ?? null
                        ]);
                    }

                    if ($request->has('pengkajianAwal.pemeriksaan_fisik')) {
                        PemeriksaanFisikEdit::create([
                            'pengkajian_awal' => $pengkajian_awal->id,
                            'mata' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['mata'] ?? null,
                            'ikterus' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['ikterus'] ?? null,
                            'pupil' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['pupil'] ?? null,
                            'diameter_mata' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['diameter_mata'] ?? null,
                            'udem_palpebrae' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['udem_palpebrae'] ?? null,
                            'kelainan_mata' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['kelainan_mata'] ?? null,
                            'tht' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['tht'] ?? null,
                            'tongsil' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['tongsil'] ?? null,
                            'faring' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['faring'] ?? null,
                            'lidah' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['lidah'] ?? null,
                            'bibir' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['bibir'] ?? null,
                            'leher' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['leher'] ?? null,
                            'jvp' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['jvp'] ?? null,
                            'limfe' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['limfe'] ?? null,
                            'kaku_kuduk' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['kaku_kuduk'] ?? null,
                            'thoraks' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['thoraks'] ?? null,
                            'cor' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['cor'] ?? null,
                            's1s2' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['s1s2'] ?? null,
                            'mur_mur' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['murmur'] ?? null,
                            'pulmo' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['pulmo'] ?? null,
                            'suara_nafas' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['suara_nafas'] ?? null,
                            'ronchi' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['ronchi'] ?? null,
                            'wheezing' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['wheezing'] ?? null,
                            'abdomen' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['abdomen'] ?? null,
                            'meteorismus' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['meteorismus'] ?? null,
                            'peristaltik' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['peristaltik'] ?? null,
                            'asites' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['asites'] ?? null,
                            'nyeri_tekan' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['nyeri_tekan'] ?? null,
                            'hepar' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['hepar'] ?? null,
                            'lien' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['lien'] ?? null,
                            'extremitas' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['extremitas'] ?? null,
                            'udem' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['udem'] ?? null,
                            'defeksesi' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['defeksesi'] ?? null,
                            'urin' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['urin'] ?? null,
                            'lain_lain' => $request->input('pengkajianAwal')['pemeriksaan_fisik']['pemeriksaan_lain_lain'] ?? null
                        ]);
                    }

                    if ($request->has('pengkajianAwal.status_psikososial')) {
                        PsikologiEdit::create([
                            'pengkajian_awal' => $pengkajian_awal->id,
                            'status_psikologi' => $request->input('pengkajianAwal')['status_psikososial']['status_psikologis'] ?? null,
                            'status_mental' => $request->input('pengkajianAwal')['status_psikososial']['status_mental'] ?? null,
                            'hubungan_keluarga' => $request->input('pengkajianAwal')['status_psikososial']['hubungan_keluarga'] ?? null,
                            'tempat_tinggal' => $request->input('pengkajianAwal')['status_psikososial']['tempat_tinggal'] ?? null,
                            'agama' => $request->input('pengkajianAwal')['status_psikososial']['agama'] ?? null,
                            'kebiasaan_beribadah' => $request->input('pengkajianAwal')['status_psikososial']['kebiasaan_beribadah'] ?? null,
                            'pekerjaan' => $request->input('pengkajianAwal')['status_psikososial']['pekerjaan'] ?? null,
                            'penghasilan' => $request->input('pengkajianAwal')['status_psikososial']['penghasilan'] ?? null
                        ]);
                    }

                    if ($request->has('pengkajianAwal.anamnesis')) {
                        $anamnesis = $request->input('pengkajianAwal.anamnesis');
                        AnamnesaEdit::create([
                            'pengkajian_awal' => $pengkajian_awal->id,
                            'anamnesa_diperoleh' => $anamnesis['auto_anamnesis'] == 1 ? 'Auto Anamnesis' : ($anamnesis['allo_anamnesis'] == 1 ? 'Allo Anamnesis' : null),
                            'anamnesa_diperoleh_dari' => $anamnesis['dari'] ?? null,
                            'keluhan_utama' => $anamnesis['keluhan_utama'] ?? null,
                            'riwayat_penyakit_sekarang' => $anamnesis['riwayat_penyakit_sekarang'] ?? null,
                            'riwayat_penyakit_dulu' => $anamnesis['riwayat_penyakit_lalu'] ?? null,
                            'riwayat_pengobatan' => $anamnesis['riwayat_pengobatan'] ?? null,
                            'riwayat_penyakit_keluarga' => $anamnesis['riwayat_penyakit_keluarga'] ?? null
                        ]);
                    }

                    if ($request->has('pengkajianAwal.penilaian_nyeri')) {
                        NyeriEdit::create([
                            'pengkajian_awal' => $pengkajian_awal->id,
                            'nyeri' => $request->input('pengkajianAwal.penilaian_nyeri.nyeri') ?? null,
                            'onset' => $request->input('pengkajianAwal.penilaian_nyeri.onset') ?? null,
                            'pencetus' => $request->input('pengkajianAwal.penilaian_nyeri.pencetus') ?? null,
                            'lokasi_nyeri' => $request->input('pengkajianAwal.penilaian_nyeri.lokasi') ?? null,
                            'gambaran_nyeri' => $request->input('pengkajianAwal.penilaian_nyeri.gambaran') ?? null,
                            'durasi' => $request->input('pengkajianAwal.penilaian_nyeri.durasi') ?? null,
                            'skala' => $request->input('pengkajianAwal.penilaian_nyeri.skala') ?? null,
                            'metode' => $request->input('pengkajianAwal.penilaian_nyeri.metode') ?? null
                        ]);
                    }
                }

                PengajuanKlaim::where('id', $request->input('resumeMedis')['id_pengajuan_klaim'])
                    ->update(['edit' => 1]);

                DB::connection('eklaim')->commit();
                return response()->json(['success' => 'Data Resume Medis berhasil disimpan.']);
            } catch (\Throwable $th) {
                DB::connection('eklaim')->rollBack();
                return response()->json(['error' => 'Gagal menyimpan data Resume Medis: ' . $th->getMessage()], 500);
            }
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
}
