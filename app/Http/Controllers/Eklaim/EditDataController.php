<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\Anamnesis;
use App\Models\Eklaim\CPPT as EklaimCPPT;
use App\Models\Eklaim\DischargePlanning;
use App\Models\Eklaim\HasilLaboratorium;
use App\Models\Eklaim\IntruksiTindakLanjut;
use App\Models\Eklaim\Laboratorium;
use App\Models\Eklaim\PemeriksaanFisik;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Eklaim\PengkajianAwal;
use App\Models\Eklaim\PenilaianNyeri;
use App\Models\Eklaim\PermintaanKonsul;
use App\Models\Eklaim\Psikososial;
use App\Models\Eklaim\Radiologi;
use App\Models\Eklaim\ResikoDekubitus;
use App\Models\Eklaim\ResikoGizi;
use App\Models\Eklaim\ResikoJatuh;
use App\Models\Eklaim\ResumeMedis;
use App\Models\Eklaim\RincianTagihan;
use App\Models\Eklaim\Tagihan;
use App\Models\Eklaim\TandaVital;
use App\Models\Eklaim\TerapiPulang;
use App\Models\Eklaim\Triage as EklaimTriage;
use App\Models\Inventory\Obat;
use App\Models\Layanan\OrderLab;
use App\Models\Layanan\TindakanMedis;
use App\Models\Master\Pegawai;
use App\Models\Master\Tindakan;
use App\Models\Pembayaran\TagihanPendaftaran;
use App\Models\Pembayaran\TarifTindakan;
use App\Models\Pendaftaran\Kunjungan;
use App\Models\Pendaftaran\Pendaftaran;
use App\Models\RM\CPPT;
use App\Models\RM\Triage;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EditDataController extends Controller
{
    public function EditResumeMedis(PengajuanKlaim $pengajuanKlaim)
    {
        if ($pengajuanKlaim->edit == 1) {
            $dataKunjungan = $pengajuanKlaim->load([
                'resumeMedis.pengkajianAwal',
                'resumeMedis.intruksiTindakLanjut',
                'resumeMedis.permintaanKonsul',
                'resumeMedis.terapiPulang',
            ]);
        }
        // Jika jenis_perawatan adalah Rawat Jalan
        if ($pengajuanKlaim->jenis_perawatan === 'Rawat Jalan' && $pengajuanKlaim->edit == 0) {
            $dataPendaftaranRawatJalan = Pendaftaran::where('NOMOR', $pengajuanKlaim->nomor_pendaftaran)
                ->with(['kunjunganPasien.ruangan'])
                ->first();

            // Ambil Kunjungan Rawat Jalan
            if ($dataPendaftaranRawatJalan && $dataPendaftaranRawatJalan->kunjunganPasien) {
                foreach ($dataPendaftaranRawatJalan->kunjunganPasien as $kunjungan) {
                    if ($kunjungan->ruangan->JENIS_KUNJUNGAN === 1) {
                        $kunjungan->load([
                            'ruangan',
                            // 'resumeMedis',
                            'pendaftaranPasien.pasien',
                            'penjaminPasien.jenisPenjamin',
                            'anamnesisPasien',
                            'rpp',
                            'pemeriksaanFisik',
                            'riwayatAlergi',
                            'pasienPulang.keadaanPulang',
                            'pasienPulang.caraPulang',
                            'permintaanKonsul',
                            'diagnosaPasien.namaDiagnosa',
                            'prosedurPasien.namaProsedur',
                            'orderResepPulang.orderResepDetil.namaObat',
                            'orderResepPulang.orderResepDetil.caraPakai',
                            'orderResepPulang.orderResepDetil.frekuensiObat',
                            'jadwalKontrol.ruangan',
                            'tagihanPendaftaran.gabungTagihan',
                            'dokterDPJP.pegawai',
                            'tandaVital'
                        ]);
                        $dataKunjungan = $kunjungan;
                    }
                }
            }
        }

        // Jika jenis_perawatan adalah Rawat Inap
        if ($pengajuanKlaim->jenis_perawatan === 'Rawat Inap' && $pengajuanKlaim->edit == 0) {
            $dataPendaftaranRawatInap = Pendaftaran::where('NOMOR', $pengajuanKlaim->nomor_pendaftaran)
                ->with([
                    'kunjunganPasien.ruangan',
                ])
                ->first();

            // Ambil Kunjungan Rawat Inap
            if ($dataPendaftaranRawatInap && $dataPendaftaranRawatInap->kunjunganPasien) {
                foreach ($dataPendaftaranRawatInap->kunjunganPasien as $kunjungan) {
                    if ($kunjungan->ruangan->JENIS_KUNJUNGAN === 3) {
                        $kunjungan->load([
                            'ruangan',
                            'resumeMedis',
                            'pendaftaranPasien.pasien',
                            'penjaminPasien.jenisPenjamin',
                            'anamnesisPasien',
                            'rpp',
                            'pemeriksaanFisik',
                            'riwayatAlergi',
                            'pasienPulang.keadaanPulang',
                            'pasienPulang.caraPulang',
                            'permintaanKonsul',
                            'diagnosaPasien.namaDiagnosa',
                            'prosedurPasien.namaProsedur',
                            'orderResepPulang.orderResepDetil.namaObat',
                            'orderResepPulang.orderResepDetil.caraPakai',
                            'orderResepPulang.orderResepDetil.frekuensiObat',
                            'jadwalKontrol.ruangan',
                            'tagihanPendaftaran.gabungTagihan',
                            'dokterDPJP.pegawai',
                            'tandaVital'
                        ]);
                        $dataKunjungan = $kunjungan;
                    }
                }
            }

            // Data pengkajian awal
            $tagihanPendaftaran = TagihanPendaftaran::where('PENDAFTARAN', $pengajuanKlaim->nomor_pendaftaran)
                ->with(['gabungTagihan.kunjunganPasien.ruangan'])
                ->get();

            foreach ($tagihanPendaftaran as $tp) {
                // Cek gabungTagihan dan kunjunganPasien
                if ($tp->gabungTagihan && !empty($tp->gabungTagihan->kunjunganPasien)) {
                    // Cek KE dan cari TagihanPendaftaran UGD jika ada
                    if (!empty($tp->gabungTagihan->KE)) {
                        $tagihanPendaftaranUGD = \App\Models\Pembayaran\TagihanPendaftaran::where('TAGIHAN', $tp->gabungTagihan->KE)->first();
                        if ($tagihanPendaftaranUGD && !empty($tagihanPendaftaranUGD->PENDAFTARAN)) {
                            $kunjunganUGD = Kunjungan::where('NOPEN', $tagihanPendaftaranUGD->PENDAFTARAN)->with('ruangan')->get();
                            foreach ($kunjunganUGD as $kunjungan) {
                                if ($kunjungan->ruangan && $kunjungan->ruangan->JENIS_KUNJUNGAN == 2) {
                                    $dataKunjungan['nomor_kunjungan_igd'] = $kunjungan->NOMOR;
                                }
                            }
                        }
                    }
                    // Loop kunjunganPasien pada gabungTagihan
                    foreach ($tp->gabungTagihan->kunjunganPasien as $kunjungan) {
                        if ($kunjungan->ruangan && $kunjungan->ruangan->JENIS_KUNJUNGAN === 2) {
                            $dataKunjungan['nomor_kunjungan_igd'] = $kunjungan->NOMOR;
                        }
                    }
                }

                // Cek gabungTagihanDari dan kunjunganPasien
                if ($tp->gabungTagihanDari && !empty($tp->gabungTagihanDari->kunjunganPasien)) {
                    // Cek KE dan cari TagihanPendaftaran UGD jika ada
                    if (!empty($tp->gabungTagihanDari->KE)) {
                        $tagihanPendaftaranUGD = \App\Models\Pembayaran\TagihanPendaftaran::where('TAGIHAN', $tp->gabungTagihanDari->KE)->first();
                        if ($tagihanPendaftaranUGD && !empty($tagihanPendaftaranUGD->PENDAFTARAN)) {
                            $kunjunganUGD = Kunjungan::where('NOPEN', $tagihanPendaftaranUGD->PENDAFTARAN)->with('ruangan')->get();
                            foreach ($kunjunganUGD as $kunjungan) {
                                if ($kunjungan->ruangan && $kunjungan->ruangan->JENIS_KUNJUNGAN == 2) {
                                    $dataKunjungan['nomor_kunjungan_igd'] = $kunjungan->NOMOR;
                                }
                            }
                        }
                    }
                    // Loop kunjunganPasien pada gabungTagihanDari
                    foreach ($tp->gabungTagihanDari->kunjunganPasien as $kunjungan) {
                        if ($kunjungan->ruangan && $kunjungan->ruangan->JENIS_KUNJUNGAN === 2) {
                            $dataKunjungan['nomor_kunjungan_igd'] = $kunjungan->NOMOR;
                        }
                    }
                }
            }
        }

        // Jika jenis_perawatan adalah Gawat Darurat
        if ($pengajuanKlaim->jenis_perawatan === 'Gawat Darurat' && $pengajuanKlaim->edit == 0) {
            $dataPendaftaranGawatDarurat = Pendaftaran::where('NOMOR', $pengajuanKlaim->nomor_pendaftaran)
                ->with(['kunjunganPasien.ruangan'])
                ->first();

            // Ambil Kunjungan Gawat Darurat
            if ($dataPendaftaranGawatDarurat && $dataPendaftaranGawatDarurat->kunjunganPasien) {
                foreach ($dataPendaftaranGawatDarurat->kunjunganPasien as $kunjungan) {
                    if ($kunjungan->ruangan->JENIS_KUNJUNGAN === 2) {
                        $kunjungan->load([
                            'ruangan',
                            'resumeMedis',
                            'pendaftaranPasien.pasien',
                            'penjaminPasien.jenisPenjamin',
                            'anamnesisPasien',
                            'rpp',
                            'pemeriksaanFisik',
                            'riwayatAlergi',
                            'pasienPulang.keadaanPulang',
                            'pasienPulang.caraPulang',
                            'permintaanKonsul',
                            'diagnosaPasien.namaDiagnosa',
                            'prosedurPasien.namaProsedur',
                            'orderResepPulang.orderResepDetil.namaObat',
                            'orderResepPulang.orderResepDetil.caraPakai',
                            'orderResepPulang.orderResepDetil.frekuensiObat',
                            'jadwalKontrol.ruangan',
                            'tagihanPendaftaran.gabungTagihan',
                            'dokterDPJP.pegawai'
                        ]);
                        $dataKunjungan = $kunjungan;
                    }
                }
            }
        }

        //Kop
        $imagePath = public_path('images/kop.png'); // Path ke gambar di folder public
        if (!file_exists($imagePath)) {
            throw new \Exception("Gambar tidak ditemukan di path: $imagePath");
        }
        $imageData = base64_encode(file_get_contents($imagePath)); // Konversi ke Base64
        $imageBase64 = 'data:image/png;base64,' . $imageData; // Tambahkan prefix Base64

        return Inertia::render('eklaim/EditData/ResumeMedis', [
            'dataKlaim' => $pengajuanKlaim,
            'dataKunjungan' => $dataKunjungan,
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

            PengajuanKlaim::where('id', $resumeData['id_pengajuan_klaim'])->update(['edit' => 1]);

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
                    'nomor_kunjungan_rawat_inap' => $resumeData['nomor_kunjungan_rawat_inap'] ?? null,
                    'nomor_kunjungan_igd' => $resumeData['nomor_kunjungan_igd'] ?? null,
                    'nomor_kunjungan_poli' => $resumeData['nomor_kunjungan_poli'] ?? null,
                    'id_pengajuan_klaim' => $resumeData['id_pengajuan_klaim'] ?? null,
                    'nama_pasien' => $resumeData['nama_pasien'] ?? null,
                    'no_rm' => $resumeData['no_rm'] ?? null,
                    'tanggal_lahir' => $resumeData['tanggal_lahir'] ?? null,
                    'jenis_kelamin' => $resumeData['jenis_kelamin'] == 1 ? 'Laki-Laki' : 'Perempuan',
                    'ruang_rawat' => $resumeData['ruang_rawat'] ?? null,
                    'penjamin' => $resumeData['penjamin'] ?? null,
                    'indikasi_rawat_inap' => $resumeData['indikasi_rawat_inap'] ?? null,
                    'tanggal_masuk' => $resumeData['tanggal_masuk'] ?? null,
                    'tanggal_keluar' => $resumeData['tanggal_keluar'] ?? null,
                    'lama_dirawat' => $resumeData['lama_dirawat'] ?? null,
                    'riwayat_penyakit_sekarang' => $resumeData['riwayat_penyakit_sekarang'] ?? null,
                    'riwayat_penyakit_lalu' => $resumeData['riwayat_penyakit_lalu'] ?? null,
                    'pemeriksaan_fisik' => $resumeData['pemeriksaan_fisik'] ?? null,
                    'keadaan_umum' => $resumeData['keadaan_umum'] ?? null,
                    'suhu' => $resumeData['suhu'] ?? null,
                    'sistole' => $resumeData['sistole'] ?? null,
                    'diastole' => $resumeData['diastole'] ?? null,
                    'nadi' => $resumeData['nadi'] ?? null,
                    'respirasi' => $resumeData['respirasi'] ?? null,
                    'diagnosa_utama' => $resumeData['diagnosa_utama'] ?? null,
                    'tindakan_prosedur' => $resumeData['tindakan_prosedur'] ?? null,
                    'riwayat_alergi' => $resumeData['riwayat_alergi'] ?? null,
                    'keadaan_pulang' => $resumeData['keadaan_pulang'] ?? null,
                    'cara_pulang' => $resumeData['cara_pulang'] ?? null,
                    'dokter' => $resumeData['dokter'] ?? null,
                ]
            );

            if (!empty($resumeData['permintaan_konsul']) && is_array($resumeData['permintaan_konsul'])) {
                // Delete existing konsul records for this resume
                PermintaanKonsul::where('resume_medis_id', $resume->id)->delete();
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

            if (!empty($resumeData['terapi_pulang']) && is_array($resumeData['terapi_pulang'])) {
                // Delete existing terapi records for this resume
                $klaim = PengajuanKlaim::where('id', $resumeData['id_pengajuan_klaim'])->first();
                TerapiPulang::where('resume_medis_id', $resume->id)->delete();
                RincianTagihan::where('id_pengajuan_klaim', $resume['id_pengajuan_klaim'])->where('edit', 1)->delete();
                foreach ($resumeData['terapi_pulang'] as $terapi) {
                    $terapi['resume_medis_id'] = $resume->id;
                    TerapiPulang::updateOrCreate(
                        [
                            'resume_medis_id' => $resume->id,
                            'nama_obat' => $terapi['namaObat'] ?? null,
                            'jumlah' => $terapi['jumlah'] ?? null,
                            'frekuensi' => $terapi['frekuensi'] ?? null,
                            'cara_pemberian' => $terapi['caraPemberian'] ?? null,
                        ],
                        $terapi
                    );

                    $obat = Obat::where('NAMA', $terapi['namaObat'])->with('hargaBarang')->first();
                    RincianTagihan::where('id_tarif', $obat->hargaBarang->ID ?? null)->delete();
                    RincianTagihan::create([
                        'id_pengajuan_klaim' => $resume['id_pengajuan_klaim'] ?? null,
                        'tagihan' => $klaim->nomor_pendaftaran ?? null,
                        'jenis' => 4, // Jenis Obat
                        'ref' => 'Apotek',
                        'id_tarif' => $obat->hargaBarang->ID ?? null,
                        'jumlah' => $terapi['jumlah'] ?? null,
                        'tarif' => $obat->hargaBarang->HARGA_JUAL ?? null,
                    ]);
                }
            }


            if ($resumeData['instruksi_tindak_lanjut']) {
                IntruksiTindakLanjut::updateOrCreate(
                    [
                        'resume_medis_id' => $resume->id,
                        'poli_tujuan' => $resumeData['instruksi_tindak_lanjut']['poliTujuan'] ?? null,
                        'jam' => $resumeData['instruksi_tindak_lanjut']['jam'] ?? null,
                        'tanggal' => $resumeData['instruksi_tindak_lanjut']['tanggal'] ?? null,
                        'nomor_bpjs' => $resumeData['instruksi_tindak_lanjut']['nomor_bpjs'] ?? null,
                    ],
                    $resumeData['instruksi_tindak_lanjut']
                );
            }

            // 2. Simpan Pengkajian Awal (jika ada)
            $pengkajianData = $request->input('pengkajianAwal');

            // Jika pengkajianAwal kosong/false, hapus data beserta relasinya
            if (!is_array($pengkajianData) || self::isAllNullOrEmpty($pengkajianData)) {
                // Cari data pengkajian awal yang terkait
                $pengkajianAwal = PengkajianAwal::where('resume_medis_id', $resume->id)->first();
                if ($pengkajianAwal) {
                    // Hapus semua relasi yang terkait
                    DischargePlanning::where('pengkajian_awal_id', $pengkajianAwal->id)->delete();
                    ResikoJatuh::where('pengkajian_awal_id', $pengkajianAwal->id)->delete();
                    PemeriksaanFisik::where('pengkajian_awal_id', $pengkajianAwal->id)->delete();
                    Anamnesis::where('pengkajian_awal_id', $pengkajianAwal->id)->delete();
                    PenilaianNyeri::where('pengkajian_awal_id', $pengkajianAwal->id)->delete();
                    ResikoDekubitus::where('pengkajian_awal_id', $pengkajianAwal->id)->delete();
                    ResikoGizi::where('pengkajian_awal_id', $pengkajianAwal->id)->delete();
                    Psikososial::where('pengkajian_awal_id', $pengkajianAwal->id)->delete();
                    TandaVital::where('pengkajian_awal_id', $pengkajianAwal->id)->delete();
                    PengajuanKlaim::where('id', $resumeData['id_pengajuan_klaim'])->update(['pengkajian_awal' => 0]);
                    // Hapus data utama pengkajian_awal
                    $pengkajianAwal->delete();
                }
            } else {
                // ...lanjutkan proses simpan seperti biasa (is_array($pengkajianData))
                PengajuanKlaim::where('id', $resumeData['id_pengajuan_klaim'])->update(['pengkajian_awal' => 1]);
                $pengkajianData['resume_medis_id'] = $resume->id;
                $PengkajianAwal = PengkajianAwal::updateOrCreate(
                    ['resume_medis_id' => $resume->id],
                    [
                        'resume_medis_id' => $pengkajianData['resume_medis_id'] ?? null,
                        'nomor_kunjungan' => $pengkajianData['nomor_kunjungan'] ?? null,
                        'ruangan' => $pengkajianData['ruangan'] ?? null,
                        'tanggal_masuk' => $pengkajianData['tanggal_masuk'] ?? null,
                        'nama_pasien' => $pengkajianData['nama_pasien'] ?? null,
                        'alamat' => $pengkajianData['alamat'] ?? null,
                        'nomor_rm' => $pengkajianData['nomor_rm'] ?? null,
                        'tanggal_lahir' => $pengkajianData['tanggal_lahir'] ?? null,
                        'jenis_kelamin' => $pengkajianData['jenis_kelamin'] ?? null,
                        'riwayat_alergi' => $pengkajianData['riwayat_alergi'] ?? null,
                        'edukasi_pasien' => $pengkajianData['edukasi_pasien'] ?? null,
                        'rencana_keperawatan' => $pengkajianData['rencana_keperawatan'] ?? null,
                        'diagnosa_keperawatan' => $pengkajianData['diagnosa_keperawatan'] ?? null,
                        'masalah_medis' => $pengkajianData['masalah_medis'] ?? null,
                        'rencana_terapi' => $pengkajianData['rencana_terapi'] ?? null,
                        'nama_dokter' => $pengkajianData['nama_dokter'] ?? null,
                        'tanggal_tanda_tangan' => $pengkajianData['tanggal_tanda_tangan'] ?? null,
                        'tanggal_keluar' => $pengkajianData['tanggal_keluar'] ?? null,
                    ]
                );

                // Discharge Planning
                if (
                    isset($pengkajianData['discharge_planning']) &&
                    is_array($pengkajianData['discharge_planning']) &&
                    !self::isAllNullOrEmpty($pengkajianData['discharge_planning'])
                ) {
                    DischargePlanning::updateOrCreate(
                        ['pengkajian_awal_id' => $PengkajianAwal->id],
                        array_merge(['pengkajian_awal_id' => $PengkajianAwal->id], $pengkajianData['discharge_planning'])
                    );
                }

                // Resiko Jatuh
                if (
                    isset($pengkajianData['resiko_jatuh']) &&
                    is_array($pengkajianData['resiko_jatuh']) &&
                    !self::isAllNullOrEmpty($pengkajianData['resiko_jatuh'])
                ) {
                    ResikoJatuh::updateOrCreate(
                        ['pengkajian_awal_id' => $PengkajianAwal->id],
                        array_merge(['pengkajian_awal_id' => $PengkajianAwal->id], $pengkajianData['resiko_jatuh'])
                    );
                }

                // Pemeriksaan Fisik
                if (
                    isset($pengkajianData['pemeriksaan_fisik']) &&
                    is_array($pengkajianData['pemeriksaan_fisik']) &&
                    !self::isAllNullOrEmpty($pengkajianData['pemeriksaan_fisik'])
                ) {
                    PemeriksaanFisik::updateOrCreate(
                        ['pengkajian_awal_id' => $PengkajianAwal->id],
                        array_merge(['pengkajian_awal_id' => $PengkajianAwal->id], $pengkajianData['pemeriksaan_fisik'])
                    );
                }

                // Anamnesis
                if (
                    isset($pengkajianData['anamnesis']) &&
                    is_array($pengkajianData['anamnesis']) &&
                    !self::isAllNullOrEmpty($pengkajianData['anamnesis'])
                ) {
                    Anamnesis::updateOrCreate(
                        ['pengkajian_awal_id' => $PengkajianAwal->id],
                        array_merge(['pengkajian_awal_id' => $PengkajianAwal->id], $pengkajianData['anamnesis'])
                    );
                }

                // Penilaian Nyeri
                if (
                    isset($pengkajianData['penilaian_nyeri']) &&
                    is_array($pengkajianData['penilaian_nyeri']) &&
                    !self::isAllNullOrEmpty($pengkajianData['penilaian_nyeri'])
                ) {
                    PenilaianNyeri::updateOrCreate(
                        ['pengkajian_awal_id' => $PengkajianAwal->id],
                        array_merge(['pengkajian_awal_id' => $PengkajianAwal->id], $pengkajianData['penilaian_nyeri'])
                    );
                }

                // Resiko Dekubitus
                if (
                    isset($pengkajianData['resiko_dekubitas']) &&
                    is_array($pengkajianData['resiko_dekubitas']) &&
                    !self::isAllNullOrEmpty($pengkajianData['resiko_dekubitas'])
                ) {
                    ResikoDekubitus::updateOrCreate(
                        ['pengkajian_awal_id' => $PengkajianAwal->id],
                        array_merge(['pengkajian_awal_id' => $PengkajianAwal->id], $pengkajianData['resiko_dekubitas'])
                    );
                }

                // Resiko Gizi
                if (
                    isset($pengkajianData['resiko_gizi']) &&
                    is_array($pengkajianData['resiko_gizi']) &&
                    !self::isAllNullOrEmpty($pengkajianData['resiko_gizi'])
                ) {
                    ResikoGizi::updateOrCreate(
                        ['pengkajian_awal_id' => $PengkajianAwal->id],
                        array_merge(['pengkajian_awal_id' => $PengkajianAwal->id], $pengkajianData['resiko_gizi'])
                    );
                }

                // Status Psikososial
                if (
                    isset($pengkajianData['status_psikososial']) &&
                    is_array($pengkajianData['status_psikososial']) &&
                    !self::isAllNullOrEmpty($pengkajianData['status_psikososial'])
                ) {
                    Psikososial::updateOrCreate(
                        ['pengkajian_awal_id' => $PengkajianAwal->id],
                        array_merge(['pengkajian_awal_id' => $PengkajianAwal->id], $pengkajianData['status_psikososial'])
                    );
                }

                // Tanda Vital
                if (
                    isset($pengkajianData['tanda_vital']) &&
                    is_array($pengkajianData['tanda_vital']) &&
                    !self::isAllNullOrEmpty($pengkajianData['tanda_vital'])
                ) {
                    TandaVital::updateOrCreate(
                        ['pengkajian_awal_id' => $PengkajianAwal->id],
                        array_merge(['pengkajian_awal_id' => $PengkajianAwal->id], $pengkajianData['tanda_vital'])
                    );
                }
            }

            // 3. Simpan data triage
            $triageData = $request->input('triage');

            if ($triageData == false) {
                // Jika triageData tidak ada, set triage_id menjadi null
                PengajuanKlaim::where('id', $resumeData['id_pengajuan_klaim'])->update(['triage' => 0]);
                $triage = EklaimTriage::where('resume_medis_id', $resume->id)->delete();
            }

            if (!is_array($triageData) || self::isAllNullOrEmpty($triageData)) {
                // Jika triageData kosong, hapus data beserta relasinya
                PengajuanKlaim::where('id', $resumeData['id_pengajuan_klaim'])->update(['triage' => 0]);
                $triage = EklaimTriage::where('resume_medis_id', $resume->id)->first();
                if ($triage) {
                    $triage->delete();
                }
            } else {
                // Simpan atau update data triage
                PengajuanKlaim::where('id', $resumeData['id_pengajuan_klaim'])->update(['triage' => 1]);
                EklaimTriage::updateOrCreate(
                    ['resume_medis_id' => $resume->id],
                    array_merge(['resume_medis_id' => $resume->id], $triageData)
                );
            }

            // 4. Simpan data CPPT
            $cpptData = $request->input('cppt');

            if ($cpptData == false) {
                // Jika cpptData tidak ada, set cppt_id menjadi null
                PengajuanKlaim::where('id', $resumeData['id_pengajuan_klaim'])->update(['cppt' => 0]);
                EklaimCPPT::where('resume_medis_id', $resume->id)->delete();
            }

            if (!is_array($cpptData) || self::isAllNullOrEmpty($cpptData)) {
                // Jika cpptData kosong, hapus data beserta relasinya
                EklaimCPPT::where('resume_medis_id', $resume->id)->delete();
                PengajuanKlaim::where('id', $resumeData['id_pengajuan_klaim'])->update(['cppt' => 0]);
            } else {
                // Ambil semua id lama
                $existingIds = EklaimCPPT::where('resume_medis_id', $resume->id)->pluck('id')->toArray();
                $newIds = [];
                PengajuanKlaim::where('id', $resumeData['id_pengajuan_klaim'])->update(['cppt' => 1]);
                foreach ($cpptData as $key => $value) {
                    // Pastikan $value adalah array dan tidak kosong
                    if (is_array($value) && !self::isAllNullOrEmpty($value)) {
                        // Jika CPPT dari frontend sudah ada id, gunakan id tersebut
                        $cpptId = $value['id'] ?? $key;

                        $model = EklaimCPPT::updateOrCreate(
                            ['resume_medis_id' => $resume->id, 'id' => $cpptId],
                            array_merge(
                                [
                                    'resume_medis_id' => $resume->id,
                                    'id' => $cpptId,
                                    'nomor_kunjungan' => $cpptData['nomor_kunjungan'] ?? null // <-- tambahkan ini
                                ],
                                $value
                            )
                        );
                        $newIds[] = $model->id;
                    }
                }

                // Hapus data CPPT lama yang tidak ada di input baru
                if (!empty($newIds)) {
                    EklaimCPPT::where('resume_medis_id', $resume->id)
                        ->whereNotIn('id', $newIds)
                        ->delete();
                } else {
                    // Jika tidak ada data baru, hapus semua
                    EklaimCPPT::where('resume_medis_id', $resume->id)->delete();
                }
            }

            DB::connection('eklaim')->commit();
            $request->session()->flash('success', 'Data Resume Medis berhasil disimpan.');
            return redirect()->back()->with('success', 'Data Resume Medis berhasil disimpan.');
        } catch (\Exception $e) {
            DB::connection('eklaim')->rollBack();
            return redirect()->back()->with('error', 'Gagal menyimpan data: ' . $e->getMessage());
        }
    }

    private static function isAllNullOrEmpty($arr)
    {
        // Jika bukan array, langsung cek nilainya
        if (!is_array($arr)) {
            return is_null($arr) || $arr === '';
        }

        // Jika array kosong, anggap kosong
        if (empty($arr)) {
            return true;
        }

        foreach ($arr as $value) {
            // Jika value adalah array, cek rekursif
            if (is_array($value)) {
                if (!self::isAllNullOrEmpty($value)) {
                    return false;
                }
            } else {
                if (!is_null($value) && $value !== '') {
                    return false;
                }
            }
        }
        return true;
    }

    public function EditTagihan(PengajuanKlaim $pengajuanKlaim)
    {
        $rincian = RincianTagihan::where('id_pengajuan_klaim', $pengajuanKlaim->id)
            ->with([
                'tagihan',
                'tarifAdministrasi.ruangan',
                'tarifRuangRawat.ruanganKelas',
                'tarifTindakan.tindakan',
                'hargaBarang.obat',
                'paket',
                'tarifOksigen'
            ])
            ->get();

        // dd($rincian);

        $tindakan = TarifTindakan::with('tindakan')->where('STATUS', 1)->get();
        $obat = Obat::with('hargaBarang')->where('STATUS', 1)->get();

        return Inertia::render('eklaim/EditData/Tagihan', [
            'pengajuanKlaim' => $pengajuanKlaim,
            'rincian' => $rincian,
            'tindakan' => $tindakan,
            'obat' => $obat
        ]);
    }

    public function syncTagihan(PengajuanKlaim $pengajuanKlaim)
    {
        try {
            $resumeMedis = ResumeMedis::where('id_pengajuan_klaim', $pengajuanKlaim->id)->first();
            $kunjunganIGD = Kunjungan::where('NOMOR', $resumeMedis->nomor_kunjungan_igd)->first();

            // Cari tagihanPendaftaran dengan UTAMA = 1
            $tagihanPendaftaran = TagihanPendaftaran::where('PENDAFTARAN', $pengajuanKlaim->nomor_pendaftaran)
                ->with([
                    'tagihan.rincianTagihan',
                    'tagihan.rincianTagihan.tarifAdministrasi.ruangan',
                    'tagihan.rincianTagihan.tarifRuangRawat.ruanganKelas',
                    'tagihan.rincianTagihan.tarifTindakan.tindakan',
                    'tagihan.rincianTagihan.hargaBarang.obat',
                    'tagihan.rincianTagihan.paket',
                    'tagihan.rincianTagihan.tarifOksigen'
                ])
                ->where('UTAMA', 1)
                ->first();

            if (
                !$tagihanPendaftaran ||
                !$tagihanPendaftaran->tagihan ||
                empty($tagihanPendaftaran->tagihan->rincianTagihan) ||
                count($tagihanPendaftaran->tagihan->rincianTagihan) === 0
            ) {
                // Data rincianTagihan kosong, lakukan fallback/cari data lain
                if (!empty($kunjunganIGD) && !empty($kunjunganIGD->NOPEN)) {
                    $tagihanPendaftaran = TagihanPendaftaran::where('PENDAFTARAN', $kunjunganIGD->NOPEN)
                        ->with([
                            'tagihan.rincianTagihan',
                            'tagihan.rincianTagihan.tarifAdministrasi.ruangan',
                            'tagihan.rincianTagihan.tarifRuangRawat.ruanganKelas',
                            'tagihan.rincianTagihan.tarifTindakan.tindakan',
                            'tagihan.rincianTagihan.hargaBarang.obat',
                            'tagihan.rincianTagihan.paket',
                            'tagihan.rincianTagihan.tarifOksigen'
                        ])
                        ->where('UTAMA', 1)
                        ->first();
                }
            }

            RincianTagihan::where('id_pengajuan_klaim', $pengajuanKlaim->id)->where('edit', 0)->delete();
            DB::connection('eklaim')->beginTransaction();
            foreach ($tagihanPendaftaran->tagihan->rincianTagihan as $rincian) {
                RincianTagihan::create([
                    'id_pengajuan_klaim' => $pengajuanKlaim->id,
                    'tagihan' => $pengajuanKlaim->nomor_pendaftaran,
                    'id_tarif' => $rincian->TARIF_ID,
                    'jenis' => $rincian->JENIS,
                    'ref' => $rincian->REF_ID,
                    'jumlah' => $rincian->JUMLAH,
                    'tarif' => $rincian->TARIF,
                    'edit' => 0
                ]);
            }
            $pengajuanKlaim->update([
                'tagihan' => 1,
            ]);
            DB::connection('eklaim')->commit();

            return redirect()->back()->with('success', 'Data tagihan berhasil disinkronkan.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Gagal menyinkronkan data tagihan: ' . $th->getMessage());
        }
    }

    public function deleteRincianTagihan(RincianTagihan $rincianTagihan)
    {
        try {
            $rincianTagihan->delete();

            return redirect()->back()->with('success', 'Data rincian tagihan berhasil dihapus.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Gagal menghapus data rincian tagihan: ' . $th->getMessage());
        }
    }

    public function StoreEditTagihan(Request $request)
    {
        try {
            DB::connection('eklaim')->beginTransaction();
            $pengajuanKlaim = PengajuanKlaim::findOrFail($request->input('pengajuanKlaim'));
            $dataTagihan = $request->input('tagihan');
            $dataTindakan = TarifTindakan::with('tindakan')->where('ID', $dataTagihan['id'])->first();
            if ($dataTindakan->tindakan->JENIS == 1) {
                $ref = 'Prosedur Non Bedah';
            } elseif ($dataTindakan->tindakan->JENIS == 2) {
                $ref = 'Prosedur Bedah';
            } elseif ($dataTindakan->tindakan->JENIS == 3) {
                $ref = 'Konsultasi';
            } elseif ($dataTindakan->tindakan->JENIS == 4) {
                $ref = 'Tenaga Ahli';
            } elseif ($dataTindakan->tindakan->JENIS == 5) {
                $ref = 'Keperawatan';
            } elseif ($dataTindakan->tindakan->JENIS == 6) {
                $ref = 'Penunjang';
            } else if ($dataTindakan->tindakan->JENIS == 7) {
                $ref = 'Radiologi';
            } else if ($dataTindakan->tindakan->JENIS == 8) {
                $ref = 'Laboratorium';
            } else if ($dataTindakan->tindakan->JENIS == 9) {
                $ref = 'Bank Darah';
            } else if ($dataTindakan->tindakan->JENIS == 10) {
                $ref = 'Rehabilitasi';
            } else if ($dataTindakan->tindakan->JENIS == 11) {
                $ref = 'Sewa Alat';
            } else {
                $ref = 'Non Kategori';
            }

            RincianTagihan::create([
                'id_pengajuan_klaim' => $pengajuanKlaim->id,
                'tagihan' => $pengajuanKlaim->nomor_pendaftaran,
                'id_tarif' => $dataTindakan->ID,
                'jenis' => 3,
                'ref' => $ref,
                'jumlah' => $dataTagihan['jumlah'],
                'tarif' => $dataTindakan->TARIF,
                'edit' => 1
            ]);

            DB::connection('eklaim')->commit();
            return redirect()->route('eklaim.editData.tagihan', ['pengajuanKlaim' => $pengajuanKlaim->id]);
        } catch (\Throwable $th) {
            DB::connection('eklaim')->rollBack();
            return redirect()->route('eklaim.editData.tagihan', ['pengajuanKlaim' => $pengajuanKlaim->id]);
        }
    }

    public function StoreEditTagihanObat(Request $request)
    {
        try {
            DB::connection('eklaim')->beginTransaction();
            $pengajuanKlaim = PengajuanKlaim::findOrFail($request->input('pengajuanKlaim'));
            $dataTagihan = $request->input('tagihan');
            $obat = Obat::where('ID', $dataTagihan['id'])->with('hargaBarang')->first();
            dd($obat);
            RincianTagihan::create([
                'id_pengajuan_klaim' => $pengajuanKlaim->id,
                'tagihan' => $pengajuanKlaim->nomor_pendaftaran,
                'id_tarif' => $dataTagihan['id'] ?? null,
                'jenis' => 4,
                'ref' => '',
                'jumlah' => $dataTagihan['jumlah'],
                'tarif' => $obat->hargaBarang->HARGA_JUAL ?? null,
                'edit' => 1
            ]);

            DB::connection('eklaim')->commit();
            return redirect()->route('eklaim.editData.tagihan', ['pengajuanKlaim' => $pengajuanKlaim->id]);
        } catch (\Throwable $th) {
            DB::connection('eklaim')->rollBack();
            return redirect()->route('eklaim.editData.tagihan', ['pengajuanKlaim' => $pengajuanKlaim->id]);
        }
    }

    public function EditLaboratorium(PengajuanKlaim $pengajuanKlaim)
    {
        $dataPendaftaran = Pendaftaran::where('NORM', $pengajuanKlaim->NORM)
            ->with([
                'kunjunganPasien.ruangan'
            ])->get();

        if ($dataPendaftaran->isEmpty()) {
            return redirect()->back()->with('error', 'Data pendaftaran tidak ditemukan.');
        }

        $tindakanLab = Tindakan::where('JENIS', 8)
            ->with([
                'parameterTindakanLab.satuan',
            ])
            ->get()
            ->map(function ($tindakan) {
                return [
                    'ID' => $tindakan->ID,
                    'NAMA' => $tindakan->NAMA,
                    'PARAMETER' => $tindakan->parameterTindakanLab->map(function ($param) {
                        return [
                            'ID' => $param->ID,
                            'PARAMETER' => $param->PARAMETER,
                            'NILAI_RUJUKAN' => $param->NILAI_RUJUKAN,
                            'SATUAN' => $param->satuan->DESKRIPSI ?? null,
                        ];
                    })->values(),
                ];
            })
            ->values();

        $dataKunjunganLab = [];
        foreach ($dataPendaftaran as $pendaftaran) {
            foreach ($pendaftaran->kunjunganPasien as $kunjungan) {
                if (in_array($kunjungan->ruangan->JENIS_KUNJUNGAN, [4])) {
                    $tanggalMasuk = null;
                    if ($kunjungan->MASUK) {
                        $tanggalMasuk = Carbon::parse($kunjungan->MASUK)->translatedFormat('d F Y');
                    }

                    $dataKunjunganLab[] = [
                        'ID' => $kunjungan->NOMOR,
                        'TANGGAL' => $tanggalMasuk,
                        'RUANGAN' => $kunjungan->ruangan->DESKRIPSI,
                    ];
                }
            }
        }

        $pegawai = Pegawai::all()->map(function ($pegawai) {
            $nama = trim($pegawai->NAMA);

            $gelarDepan = $pegawai->GELAR_DEPAN ? trim($pegawai->GELAR_DEPAN) . '.' : '';
            $gelarBelakang = $pegawai->GELAR_BELAKANG ? ', ' . trim($pegawai->GELAR_BELAKANG) : '';

            return [
                'ID' => $pegawai->ID,
                'DESKRIPSI' => trim($gelarDepan . ' ' . $nama . $gelarBelakang),
            ];
        })->values();

        return Inertia::render('eklaim/EditData/Laboratorium', [
            'pengajuanKlaim' => $pengajuanKlaim,
            'dataKunjunganLab' => $dataKunjunganLab,
            'listTindakanLab' => $tindakanLab,
            'pegawai' => $pegawai,
        ]);
    }

    public function getDataLaboratorium($nomorKunjungan, $jenisData)
    {
        if ($jenisData === 'Real') {
            $data = TindakanMedis::where('KUNJUNGAN', $nomorKunjungan)
                ->with([
                    'hasilLab.parameterTindakanLab.satuan',
                    'tindakanLaboratorium',
                ])
                ->get();
        } else {
            $data = Laboratorium::with('hasilLaboratorium.parameterTindakanLab')
                ->where('kunjungan_id', $nomorKunjungan)
                ->get()
                ->map(function ($tindakan) {
                    return [
                        'ID' => $tindakan->id,
                        'KUNJUNGAN' => $tindakan->kunjungan_id,
                        'TINDAKAN' => $tindakan->tindakan_id,
                        'TANGGAL' => $tindakan->tanggal,
                        'OLEH' => $tindakan->oleh,
                        'STATUS' => $tindakan->status,
                        'OTOMATIS' => $tindakan->otomatis,
                        'tindakan_laboratorium' => [
                            'ID' => $tindakan->tindakan_id,
                            'NAMA' => $tindakan->nama_tindakan,
                        ],
                        'hasil_lab' => collect($tindakan->hasilLaboratorium)->map(function ($hasil) {
                            return [
                                'ID' => $hasil->id,
                                'TINDAKAN_MEDIS' => $hasil->laboratorium_tindakan_id,
                                'PARAMETER_TINDAKAN' => $hasil->parameter_id,
                                'TANGGAL' => $hasil->created_at,
                                'HASIL' => $hasil->hasil,
                                'NILAI_NORMAL' => $hasil->parameterTindakanLab->NILAI_RUJUKAN ?? null,
                                'SATUAN' => $hasil->parameterTindakanLab->satuan->DESKRIPSI ?? null,
                                'KETERANGAN' => $hasil->keterangan,
                                'OLEH' => $hasil->oleh,
                                'OTOMATIS' => $hasil->otomatis,
                                'parameter_tindakan_lab' => [
                                    'ID' => $hasil->parameterTindakanLab->ID ?? null,
                                    'PARAMETER' => $hasil->parameterTindakanLab->PARAMETER ?? null,
                                    'NILAI_RUJUKAN' => $hasil->parameterTindakanLab->NILAI_RUJUKAN ?? null,
                                    'SATUAN' => $hasil->parameterTindakanLab->SATUAN ?? null,
                                ],
                                'STATUS' => $hasil->status,
                            ];
                        }),
                    ];
                })
                ->values();
        }

        return response()->json($data);
    }

    public function StoreEditLaboratorium(Request $request)
    {
        DB::connection('eklaim')->beginTransaction();
        try {
            $data = $request->input('data');
            $nomorKunjungan = $request->input('kunjungan_id');
            $pengajuanKlaimId = $request->input('pengajuanKlaim_id');
            $dokter = $request->input('dokter');
            $petugas = $request->input('petugas');

            PengajuanKlaim::where('id', $pengajuanKlaimId)->update(['laboratorium' => 1]);
            Laboratorium::where('kunjungan_id', $nomorKunjungan)
                ->where('pengajuan_klaim_id', $pengajuanKlaimId)
                ->delete();

            foreach ($data as $item) {
                $laboratoriumData = Laboratorium::create([
                    'pengajuan_klaim_id' => $pengajuanKlaimId,
                    'kunjungan_id' => $nomorKunjungan,
                    'tindakan_id' => $item['tindakan_laboratorium']['ID'] ?? null,
                    'nama_tindakan' => $item['tindakan_laboratorium']['NAMA'] ?? null,
                    'tanggal' => $item['TANGGAL'] ?? null,
                    'oleh' => $item['OLEH'] ?? null,
                    'status' => $item['STATUS'] ?? null,
                    'otomatis' => $item['OTOMATIS'] ?? null,
                    'dokter' => $dokter,
                    'petugas' => $petugas,
                ]);

                foreach ($item['hasil_lab'] as $hasil) {
                    HasilLaboratorium::create([
                        'laboratorium_tindakan_id' => $laboratoriumData->id,
                        'parameter_id' => $hasil['PARAMETER_TINDAKAN'] ?? null,
                        'parameter_nama' => $hasil['parameter_tindakan_lab']['PARAMETER'] ?? null,
                        'hasil' => $hasil['HASIL'] ?? null,
                        'nilai_normal' => $hasil['parameter_tindakan_lab']['NILAI_RUJUKAN'] ?? null,
                        'satuan' => $hasil['parameter_tindakan_lab']['SATUAN'] ?? null,
                        'keterangan' => $hasil['KETERANGAN'] ?? null,
                        'oleh' => $hasil['OLEH'] ?? null,
                        'otomatis' => $hasil['OTOMATIS'] ?? null,
                        'status' => $hasil['STATUS'] ?? null
                    ]);
                }
            }
            DB::connection('eklaim')->commit();

            return response()->json(['success' => 'Data Laboratorium berhasil disimpan.']);
        } catch (\Throwable $th) {
            DB::connection('eklaim')->rollBack();

            return response()->json(['error' => 'Gagal menyimpan data Laboratorium: ' . $th->getMessage()]);
        }
    }

    public function EditRadiologi(PengajuanKlaim $pengajuanKlaim)
    {
        $dataPendaftaran = Pendaftaran::where('NORM', $pengajuanKlaim->NORM)
            ->with([
                'kunjunganPasien.ruangan'
            ])->get();

        if ($dataPendaftaran->isEmpty()) {
            return redirect()->back()->with('error', 'Data pendaftaran tidak ditemukan.');
        }

        $dataKunjungan = $dataPendaftaran->first()->kunjunganPasien;
        $dataKunjunganRadiologi = [];
        foreach ($dataKunjungan as $kunjungan) {
            if (in_array($kunjungan->ruangan->JENIS_KUNJUNGAN, [5])) {
                $tanggalMasuk = null;
                if ($kunjungan->MASUK) {
                    $tanggalMasuk = Carbon::parse($kunjungan->MASUK)->translatedFormat('d F Y');
                }

                $dataKunjunganRadiologi[] = [
                    'ID' => $kunjungan->NOMOR,
                    'TANGGAL' => $tanggalMasuk,
                    'RUANGAN' => $kunjungan->ruangan->DESKRIPSI,
                ];
            }
        }

        $tindakanRad = Tindakan::where('JENIS', 7)->get();
        $pegawai = Pegawai::all()->map(function ($pegawai) {
            $nama = trim($pegawai->NAMA);

            $gelarDepan = $pegawai->GELAR_DEPAN ? trim($pegawai->GELAR_DEPAN) . '.' : '';
            $gelarBelakang = $pegawai->GELAR_BELAKANG ? ', ' . trim($pegawai->GELAR_BELAKANG) : '';

            return [
                'ID' => $pegawai->ID,
                'DESKRIPSI' => trim($gelarDepan . ' ' . $nama . $gelarBelakang),
            ];
        })->values();

        return Inertia::render('eklaim/EditData/Radiologi', [
            'pengajuanKlaim' => $pengajuanKlaim,
            'dataKunjunganRadiologi' => $dataKunjunganRadiologi,
            'tindakanRad' => $tindakanRad,
            'pegawai' => $pegawai
        ]);
    }

    public function getDataRadiologi($nomorKunjungan, $jenisData)
    {
        if ($jenisData === 'Real') {
            $data = TindakanMedis::where('KUNJUNGAN', $nomorKunjungan)
                ->with([
                    'tindakanRadiologi',
                    'hasilRadiologi'
                ])
                ->get();
        } else {
            $data = Radiologi::where('nomor_kunjungan', $nomorKunjungan)
                ->with(
                    'tindakanRadiologi'
                )
                ->get()
                ->map(function ($item) use ($nomorKunjungan) {
                    return [
                        'KUNJUNGAN' => $nomorKunjungan,
                        'hasil_radiologi' => [
                            'KLINIS' => $item->klinis,
                            'KESAN' => $item->kesan,
                            'USUL' => $item->usul,
                            'HASIL' => $item->hasil,
                        ],
                        'tindakan_radiologi' => [
                            'ID' => $item->tindakanRadiologi->ID ?? null,
                            'NAMA' => $item->tindakanRadiologi->NAMA ?? null,
                        ],
                    ];
                })
                ->values();
        }

        return response()->json($data);
    }

    public function StoreEditRadiologi(Request $request)
    {
        DB::connection('eklaim')->beginTransaction();
        try {
            $data = $request->input('data');
            $dataKlaim = $request->input('dataKlaim');
            $dokter = $request->input('dokter');
            $petugas = $request->input('petugas');

            if ($request->input('nomorKunjungan') != null) {
                $nomorKunjungan = $request->input('nomorKunjungan');
                Radiologi::where('nomor_kunjungan', $nomorKunjungan)->delete();
            }

            if ($request->input('nomorKunjungan') == null) {
                $nomorKunjungan = $dataKlaim['nomor_kunjungan'];
                Radiologi::where('nomor_kunjungan', $nomorKunjungan)->delete();
            }

            foreach ($data as $item) {
                // Simpan atau update data Radiologi
                Radiologi::create([
                    'id_pengajuan_klaim' => $dataKlaim['id'],
                    'nomor_kunjungan' => $nomorKunjungan,
                    'nama_petugas' => $petugas,
                    'nama_dokter' => $dokter,
                    'tindakan' => $item['tindakan_radiologi']['ID'],
                    'klinis' => $item['hasil_radiologi']['KLINIS'],
                    'kesan' => $item['hasil_radiologi']['KESAN'],
                    'usul' => $item['hasil_radiologi']['USUL'],
                    'hasil' => $item['hasil_radiologi']['HASIL'],
                ]);
            }

            DB::connection('eklaim')->commit();
            return response()->json(['success' => 'Data Laboratorium berhasil disimpan.']);
        } catch (\Throwable $th) {
            DB::connection('eklaim')->rollBack();

            return response()->json(['error' => 'Gagal menyimpan data Laboratorium: ' . $th->getMessage()]);
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

    public function getDataTriageEdit($nomorKunjungan)
    {
        $data = EklaimTriage::where('nomor_kunjungan', $nomorKunjungan)
            ->first();

        if ($data) {
            return response()->json($data);
        } else {
            return response()->json(['error' => 'Data Triage tidak ditemukan.'], 404);
        }
    }

    public function getDataCPPTEdit($nomorKunjungan)
    {
        $data = EklaimCPPT::where('nomor_kunjungan', $nomorKunjungan)
            ->get();

        if ($data) {
            return response()->json($data);
        } else {
            return response()->json(['error' => 'Data CPPT tidak ditemukan.'], 404);
        }
    }

    public function getDataPengkajianAwalEdit($nomorKunjungan)
    {
        $data = PengkajianAwal::where('nomor_kunjungan', $nomorKunjungan)
            ->with([
                'anamnesis',
                'pemeriksaanFisik',
                'tandaVital',
                'penilaianNyeri',
                'resikoJatuh',
                'resikoDekubitus',
                'resikoGizi',
                'psikososial',
                'dischargePlanning',
            ])
            ->first();

        if ($data) {
            return response()->json($data);
        } else {
            return response()->json(['error' => 'Data Pengkajian Awal tidak ditemukan.'], 404);
        }
    }

    public function getNamaObat(Request $request)
    {
        $keyword = $request->input('q', '');

        $obat = Obat::with('hargaBarang')
            ->where('NAMA', 'like', '%' . $keyword . '%')
            ->select('ID', 'NAMA as DESKRIPSI')
            ->take(10)
            ->get();

        return response()->json($obat);
    }
}
