<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Aplikasi\Pengguna;
use App\Models\Eklaim\Anamnesis;
use App\Models\Eklaim\CPPT;
use App\Models\Eklaim\DischargePlanning;
use App\Models\Eklaim\Laboratorium;
use App\Models\Eklaim\LogKlaim;
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
use App\Models\Eklaim\TandaVital;
use App\Models\Eklaim\TerapiPulang;
use App\Models\Eklaim\Triage;
use App\Models\Eklaim\TTVResumeMedis;
use App\Models\Master\Pasien;
use App\Models\Pembayaran\PembayaranTagihan;
use App\Models\Pembayaran\TagihanPendaftaran;
use App\Models\Pendaftaran\Kunjungan;
use App\Models\Pendaftaran\Pendaftaran;
use App\Models\Pendaftaran\Penjamin;
use Dompdf\Dompdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PDO;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class BridgeDataController extends Controller
{
    public function loadDataResumeMedis(Pendaftaran $pendaftaran)
    {
        return response()->json($pendaftaran, 200, [], JSON_PRETTY_PRINT);
    }

    public function loadDataTagihan(Pendaftaran $pendaftaran)
    {
        $pendaftaran->load(['pendaftaranTagihan.tagihan']);
        return response()->json($pendaftaran, 200, [], JSON_PRETTY_PRINT);
    }

    public function downloadSEP(Pendaftaran $pendaftaran)
    {
        $pendaftaran->load(['pasien', 'penjamin.kunjunganBPJS.dokterDPJP', 'penjamin.kunjunganBPJS.poliTujuan', 'penjamin.kunjunganBPJS.faskesPerujuk', 'penjamin.kunjunganBPJS.dataPeserta']);
        return response()->json($pendaftaran, 200, [], JSON_PRETTY_PRINT);
    }

    public function downloadResumeMedis(Pendaftaran $pendaftaran)
    {
        return response()->json($pendaftaran, 200, [], JSON_PRETTY_PRINT);
    }

    public function downloadTagihan(Pendaftaran $pendaftaran)
    {
        return response()->json($pendaftaran, 200, [], JSON_PRETTY_PRINT);
    }

    public function downloadBerkasKlaim($nomor_sep)
    {
        $metadata = [
            'method' => 'claim_print'
        ];

        $data = [
            "nomor_sep" => (string) $nomor_sep,
        ];

        $inacbgController = new \App\Http\Controllers\Inacbg\InacbgController();
        $send = $inacbgController->sendToEklaim($metadata, $data);

        if ($send['metadata']['code'] != 200) {
            DB::connection('eklaim')->beginTransaction();
            LogKlaim::create([
                'nomor_SEP' => $nomor_sep,
                'method' => json_encode($metadata),
                'request' => json_encode($data),
                'response' => json_encode($send),
            ]);
            DB::connection('eklaim')->commit();
            return response()->json([
                'success' => false,
                'message' => $send['metadata']['message'],
            ], 404);
        }

        DB::connection('eklaim')->beginTransaction();
        LogKlaim::create([
            'nomor_SEP' => $nomor_sep,
            'method' => json_encode($metadata),
            'request' => json_encode($data),
            'response' => json_encode($send),
        ]);
        DB::connection('eklaim')->commit();

        $pdf = base64_decode($send["data"]);
        return response($pdf, 200)->header('Content-Type', 'application/pdf');
    }

    public function downloadRadiologi(Pendaftaran $pendaftaran)
    {
        return response()->json($pendaftaran, 200, [], JSON_PRETTY_PRINT);
    }

    public function previewSEP(Pendaftaran $pendaftaran)
    {
        $pendaftaran->load([
            'pasien',
            'penjamin.kunjunganBPJS.dokterDPJP',
            'penjamin.kunjunganBPJS.poliTujuan',
            'penjamin.kunjunganBPJS.faskesPerujuk',
            'penjamin.kunjunganBPJS.dataPeserta'
        ]);
        return response()->json($pendaftaran, 200, [], JSON_PRETTY_PRINT);
    }

    public function previewResumeMedis(Pendaftaran $pendaftaran)
    {
        // try {
        $pendaftaran->load([
            'pasien',
            'kunjunganPasien.ruangan',
            'kunjunganPasien.pendaftaranPasien.pasien',
            'kunjunganPasien.pendaftaranPasien.resumemedis',
            'kunjunganPasien.pendaftaranPasien.diagnosaPasien.namaDiagnosa',
            'kunjunganPasien.pendaftaranPasien.prosedurPasien',
            'kunjunganPasien.pendaftaranPasien.penjamin.jenisPenjamin',
            'kunjunganPasien.dokterDPJP.pegawai',
            'kunjunganPasien.rpp',
            'kunjunganPasien.keluhanUtama',
            'kunjunganPasien.tandaVital',
            'kunjunganPasien.tandaVital.tingkatKesadaran',
            'kunjunganPasien.pemeriksaanFisik',
            'kunjunganPasien.permintaanKonsul.jawabanKonsul',
            'kunjunganPasien.pasienPulang.keadaanPulang',
            'kunjunganPasien.pasienPulang.caraPulang',
            'kunjunganPasien.orderResepPulang.orderResepDetil.namaObat',
            'kunjunganPasien.orderResepPulang.orderResepDetil.frekuensiObat',
            'kunjunganPasien.orderResepPulang.orderResepDetil.caraPakai',
        ]);

        // Ambil kunjungan rawat inap (JENIS_KUNJUNGAN == 3) dari kunjunganPasien relasi di Pendaftaran
        $kunjunganRawatInap = $pendaftaran->kunjunganPasien
            ->first(function ($kunjungan) {
                return $kunjungan->ruangan && $kunjungan->ruangan->JENIS_KUNJUNGAN == 3;
            });

        $kunjunganPasien = [];
        if (!$kunjunganRawatInap) {
            $kunjunganPasien = $pendaftaran->kunjunganPasien
                ->first(function ($kunjungan) {
                    return $kunjungan->ruangan && $kunjungan->ruangan->JENIS_KUNJUNGAN == 1;
                });
        } else {
            $kunjunganPasien = $kunjunganRawatInap;
        }


        $hasilKonsultasi = $kunjunganPasien->permintaanKonsul
            ->flatMap(function ($konsul) {
                return $konsul->jawabanKonsul ? $konsul->jawabanKonsul->pluck('JAWABAN') : collect();
            })
            ->map(function ($jawaban) {
                return strip_tags(html_entity_decode($jawaban));
            })
            ->implode(', ') ?: [];


        $diagnosaUtama = $kunjunganPasien->pendaftaranPasien->diagnosaPasien
            ? $kunjunganPasien->pendaftaranPasien->diagnosaPasien
            ->flatMap(function ($diagnosa) {
                return $diagnosa->namaDiagnosa ? [$diagnosa->namaDiagnosa->STR] : [];
            })->implode(', ')
            : 'Tidak ada data diagnosa';

        $icd10DiagnosaUtama = $kunjunganPasien->pendaftaranPasien->diagnosaPasien
            ? $kunjunganPasien->pendaftaranPasien->diagnosaPasien
            ->flatMap(function ($diagnosa) {
                return $diagnosa->namaDiagnosa ? [$diagnosa->namaDiagnosa->CODE] : [];
            })->implode(', ')
            : 'Tidak ada data diagnosa';

        $jenisKelamin = $kunjunganPasien->pendaftaranPasien->pasien->JENIS_KELAMIN === 1
            ? 'Laki-laki'
            : ($kunjunganPasien->pendaftaranPasien->pasien->JENIS_KELAMIN === 2
                ? 'Perempuan'
                : 'Tidak ada data jenis kelamin');

        $terapiPulang = $kunjunganPasien->orderResepPulang
            ? $kunjunganPasien->orderResepPulang
            ->flatMap(function ($orderResep) {
                return $orderResep->orderResepDetil
                    ? $orderResep->orderResepDetil->map(function ($resep) {
                        return [
                            'nama_obat' => $resep->namaObat->NAMA ?? 'Tidak ada data nama obat',
                            'frekuensi' => $resep->frekuensiObat->KETERANGAN ?? 'Tidak ada data aturan pakai',
                            'jumlah' => $resep->JUMLAH ?? 'Tidak ada data jumlah',
                            'cara_pakai' => $resep->caraPakai->DESKRIPSI ?? 'Tidak ada data cara pakai',
                        ];
                    })
                    : collect();
            })
            ->toArray()
            : [];

        $gelarDepanDokter = $kunjunganPasien->dokterDPJP->pegawai->GELAR_DEPAN != null
            ? $kunjunganPasien->dokterDPJP->pegawai->GELAR_DEPAN . '.'
            : '';
        $gelarBelakangDokter = $kunjunganPasien->dokterDPJP->pegawai->GELAR_BELAKANG != null
            ? ',' . $kunjunganPasien->dokterDPJP->pegawai->GELAR_BELAKANG
            : '';
        $getNamaDokter = $gelarDepanDokter . $kunjunganPasien->dokterDPJP->pegawai->NAMA . $gelarBelakangDokter;

        $resumeMedis = [
            'nama_pasien' => $kunjunganPasien->pendaftaranPasien->pasien->NAMA ?? 'Tidak ada data nama pasien',
            'no_rm' => $kunjunganPasien->pendaftaranPasien->pasien->NORM ?? 'Tidak ada data nomor rekam medis',
            'ruang_rawat_terakhir' => $kunjunganUGD->ruangan->DESKRIPSI ?? 'Tidak ada data ruang rawat',
            'jenis_kelamin' => $jenisKelamin,
            'tanggal_lahir' => $kunjunganPasien->pendaftaranPasien->pasien->TANGGAL_LAHIR ?? 'Tidak ada data tanggal lahir',
            'tanggal_masuk' => $kunjunganPasien->MASUK ?? 'Tidak ada data tanggal masuk',
            'tanggal_keluar' => $kunjunganPasien->KELUAR ?? 'Tidak ada data tanggal keluar',
            'ruang_rawat_terakhir' => $kunjunganUGD->ruangan->DESKRIPSI ?? 'Tidak ada data ruang rawat',
            'penjamin' => $kunjunganPasien->pendaftaranPasien->penjamin->jenisPenjamin->DESKRIPSI ?? 'Tidak ada data penjamin',
            'indikasi_rawat_inap' => $kunjunganPasien->pendaftaranPasien->resumeMedis->INDIKASI_RAWAT_INAP ?? 'Tidak ada data indikasi rawat inap',
            'riwayat_penyakit_sekarang' => $kunjunganPasien->keluhanUtama->DESKRIPSI ?? 'Tidak ada data riwayat penyakit sekarang',
            'riwayat_penyakit_dahulu' => $kunjunganPasien->rpp->DESKRIPSI ?? 'Tidak ada data ringkasan penyakit dahulu',
            'pemeriksaan_fisik' => $kunjunganPasien->pemeriksaanFisik->DESKRIPSI ?? 'Tidak ada data pemeriksaan fisik',
            'hasil_konsultasi' => $hasilKonsultasi ?? [],
            'diagnosa_utama' => $diagnosaUtama,
            'icd_10_diagnosa_utama' => $icd10DiagnosaUtama,
            'prosedur_utama' => $kunjunganPasien->pendaftaranPasien->prosedurPasien->pluck('TINDAKAN')->implode(', ') ?? 'Tidak ada data prosedur',
            'icd_9_prosedur_utama' => $kunjunganPasien->pendaftaranPasien->prosedurPasien->pluck('KODE')->implode(', ') ?? 'Tidak ada data prosedur',
            'keadaan_pulang' => $kunjunganPasien->pasienPulang->keadaanPulang->DESKRIPSI ?? 'Tidak ada data keadaan pulang',
            'cara_pulang' => $kunjunganPasien->pasienPulang->caraPulang->DESKRIPSI ?? 'Tidak ada data cara pulang',
            'tekanan_darah' => $kunjunganPasien->tandaVital->SISTOLIK . "/" . $kunjunganPasien->tandaVital->DISTOLIK ?? 'Tidak ada data tekanan darah',
            'nadi' => $kunjunganPasien->tandaVital->FREKUENSI_NADI ?? 'Tidak ada data nadi',
            'suhu' => $kunjunganPasien->tandaVital->SUHU ?? 'Tidak ada data suhu',
            'pernafasan' => $kunjunganPasien->tandaVital->FREKUENSI_NAFAS ?? 'Tidak ada data pernafasan',
            'kesadaran' => $kunjunganPasien->tandaVital->tingkatKesadaran->DESKRIPSI ?? 'Tidak ada data kesadaran',
            'skala_nyeri' => $kunjunganPasien->tandaVital->SKALA_NYERI ?? 'Tidak ada data skala nyeri',
            'terapi_pulang' => $terapiPulang,
            'nama_dokter' => $getNamaDokter,
            'nip_dokter' => $kunjunganPasien->dokterDPJP->pegawai->NIP ?? 'Tidak ada data NIP dokter',

        ];

        // Ubah gambar menjadi Base64
        $namaDokter = $resumeMedis['nama_dokter'] ?? '-';
        $qrcodeBase64 = 'data:image/png;base64,' . base64_encode(
            QrCode::format('png')->size(150)->generate($namaDokter)
        );
        $imagePath = public_path('images/kop.png'); // Path ke gambar di folder public
        if (!file_exists($imagePath)) {
            throw new \Exception("Gambar tidak ditemukan di path: $imagePath");
        }
        $imageData = base64_encode(file_get_contents($imagePath)); // Konversi ke Base64
        $imageBase64 = 'data:image/png;base64,' . $imageData; // Tambahkan prefix Base64


        $dompdf = new Dompdf();
        $dompdf->loadHtml(
            view('eklaim.ResumeMedis', compact(
                'resumeMedis',
                'imageBase64', // Kirim Base64 ke view
                'qrcodeBase64', // Kirim Base64 QR Code ke view
            ))->render()
        );
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $pdf = $dompdf->output();

        return response($pdf, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="ResumeMedis.pdf"');

        // return view('eklaim.ResumeMedis', compact(
        //     'resumeMedis',
        //     'imageBase64' // Kirim Base64 ke view
        // ));
        // } catch (\Throwable $th) {
        //     return redirect()->back()->with([
        //         'error' => 'Gagal membuat preview Resume Medis: ' . $th->getMessage(),
        //     ]);
        // }
    }

    public function previewTriage(Pendaftaran $pendaftaran)
    {
        $pendaftaran->load([
            'pendaftaranTagihan.gabungTagihan.kunjunganPasien.ruangan',
            'pendaftaranTagihan.gabungTagihan.kunjunganPasien.pendaftaranPasien.pasien',
            'pendaftaranTagihan.gabungTagihan.kunjunganPasien.triage.petugas',
        ]);
        $kunjunganUGD = null;
        $tagihanUGD = $pendaftaran->pendaftaranTagihan;
        if ($tagihanUGD && $tagihanUGD->gabungTagihan) {
            $kunjunganUGD = $tagihanUGD->gabungTagihan->kunjunganPasien
                ->first(function ($kunjungan) {
                    return $kunjungan->ruangan && $kunjungan->ruangan->JENIS_KUNJUNGAN == 2;
                });
        }

        if (!$kunjunganUGD) {
            if (request()->expectsJson() || request()->ajax()) {
                return response()->json([
                    'error' => 'Tidak ada data kunjungan ugd yang ditemukan untuk pendaftaran ini.',
                ], 404);
            }
            return redirect()->back()->with([
                'error' => 'Tidak ada data kunjungan ugd yang ditemukan untuk pendaftaran ini.',
            ]);
        }

        $jenisKelamin = $kunjunganUGD->pendaftaranPasien->pasien->JENIS_KELAMIN === 1
            ? 'Laki-laki'
            : ($kunjunganUGD->pendaftaranPasien->pasien->JENIS_KELAMIN === 2
                ? 'Perempuan'
                : 'Tidak ada data jenis kelamin');

        $nama_perawat = ($kunjunganUGD->triage->petugas->GELAR_DEPAN ? $kunjunganUGD->triage->petugas->GELAR_DEPAN . '.' : '') . $kunjunganUGD->triage->petugas->NAMA . ($kunjunganUGD->triage->petugas->GELAR_BELAKANG ? ',' . $kunjunganUGD->triage->petugas->GELAR_BELAKANG : '') ?? 'Tidak ada data petugas';
        $nip_perawat = $kunjunganUGD->triage->petugas->NIP ?? 'Tidak ada data NIP petugas';
        // dd(json_decode($kunjunganUGD->triage->KEDATANGAN, true));
        $triage = [
            'nama_pasien' => $kunjunganUGD->pendaftaranPasien->pasien->NAMA ?? 'Tidak ada data nama pasien',
            'no_rm' => $kunjunganUGD->pendaftaranPasien->pasien->NORM ?? 'Tidak ada data nomor rekam medis',
            'tanggal_lahir' => $kunjunganUGD->pendaftaranPasien->pasien->TANGGAL_LAHIR ?? 'Tidak ada data tanggal lahir',
            'jenis_kelamin' => $jenisKelamin,
            'tanggal_masuk' => $kunjunganUGD->MASUK ?? 'Tidak ada data tanggal masuk',
            'cara_datang' => json_decode($kunjunganUGD->triage->KEDATANGAN, true) ?? 'Tidak ada data cara datang',
            'macam_kasus' => json_decode($kunjunganUGD->triage->KASUS, true) ?? 'Tidak ada data macam kasus',
            'anamnesa' => json_decode($kunjunganUGD->triage->ANAMNESE, true) ?? 'Tidak ada data anamnesa',
            'tanda_vital' => json_decode($kunjunganUGD->triage->TANDA_VITAL, true) ?? 'Tidak ada data tanda vital',
            'petugas' => ($kunjunganUGD->triage->petugas->GELAR_DEPAN ? $kunjunganUGD->triage->petugas->GELAR_DEPAN . '.' : '') . $kunjunganUGD->triage->petugas->NAMA . ($kunjunganUGD->triage->petugas->GELAR_BELAKANG ? ',' . $kunjunganUGD->triage->petugas->GELAR_BELAKANG : '') ?? 'Tidak ada data petugas',
            'kebutuhan_khusus' => json_decode($kunjunganUGD->triage->KEBUTUHAN_KHUSUS, true) ?? 'Tidak ada data kebutuhan khusus',
            'resusitasi' => json_decode($kunjunganUGD->triage->RESUSITASI, true) ?? 0,
            'emergency' => json_decode($kunjunganUGD->triage->EMERGENCY, true) ?? 0,
            'urgent' => json_decode($kunjunganUGD->triage->URGENT, true) ?? 0,
            'less_urgent' => json_decode($kunjunganUGD->triage->LESS_URGENT, true) ?? 0,
            'non_urgent' => json_decode($kunjunganUGD->triage->NON_URGENT, true) ?? 0,
            'death' => json_decode($kunjunganUGD->triage->DOA, true) ?? 0,
            'nama_dokter' => 'dr.MUSATAFID ALWI',
            'nip_dokter' => '202301169',
            'tanda_tangan_dokter' => 'data:image/png;base64,' . base64_encode(QrCode::format('png')->size(150)->generate("dr.MUSATAFID ALWI")),
            'nama_perawat' => $nama_perawat,
            'nip_perawat' => $nip_perawat,
            'tanda_tangan_perawat' => 'data:image/png;base64,' . base64_encode(QrCode::format('png')->size(150)->generate($nama_perawat)),
        ];

        $imagePath = public_path('images/kop.png'); // Path ke gambar di folder public
        if (!file_exists($imagePath)) {
            throw new \Exception("Gambar tidak ditemukan di path: $imagePath");
        }
        $imageData = base64_encode(file_get_contents($imagePath)); // Konversi ke Base64
        $imageBase64 = 'data:image/png;base64,' . $imageData; // Tambahkan prefix Base64


        $dompdf = new Dompdf();
        $dompdf->loadHtml(
            view('eklaim.Triage', compact(
                'triage',
                'imageBase64', // Kirim Base64 ke view
                // 'qrcodeBase64', // Kirim Base64 QR Code ke view
            ))->render()
        );
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $pdf = $dompdf->output();

        return response($pdf, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="Triage.pdf"');

        // return view('eklaim.Triage', compact(
        //     'triage',
        //     'imageBase64' // Kirim Base64 ke view
        // ));
    }

    public function previewPengkajianAwal(Pendaftaran $pendaftaran)
    {
        $pendaftaran->load([
            'pendaftaranTagihan.gabungTagihan.kunjunganPasien.ruangan',
            'pendaftaranTagihan.gabungTagihan.kunjunganPasien.pendaftaranPasien.pasien',
            'pendaftaranTagihan.gabungTagihan.kunjunganPasien.anamnesisPasienDiperoleh',
            'pendaftaranTagihan.gabungTagihan.kunjunganPasien.anamnesisPasien',
            'pendaftaranTagihan.gabungTagihan.kunjunganPasien.rpp',
            'pendaftaranTagihan.gabungTagihan.kunjunganPasien.keluhanUtama',
            'pendaftaranTagihan.gabungTagihan.kunjunganPasien.dokterDPJP',
            'pendaftaranTagihan.gabungTagihan.kunjunganPasien.orderResep.orderResepDetil.namaObat',
            'pendaftaranTagihan.gabungTagihan.kunjunganPasien.riwayatPenyakitKeluarga',
            'pendaftaranTagihan.gabungTagihan.kunjunganPasien.tandaVital.tingkatKesadaran',
            'pendaftaranTagihan.gabungTagihan.kunjunganPasien.pemeriksaanFisik',
            'pendaftaranTagihan.gabungTagihan.kunjunganPasien.pemeriksaanMata',
            'pendaftaranTagihan.gabungTagihan.kunjunganPasien.riwayatAlergi',
            'pendaftaranTagihan.gabungTagihan.kunjunganPasien.rencanaTerapi',
            'pendaftaranTagihan.gabungTagihan.kunjunganPasien.diagnosaPasien.namaDiagnosa',
        ]);
        $kunjunganUGD = null;
        $tagihanUGD = $pendaftaran->pendaftaranTagihan;
        if ($tagihanUGD && $tagihanUGD->gabungTagihan) {
            $kunjunganUGD = $tagihanUGD->gabungTagihan->kunjunganPasien
                ->first(function ($kunjungan) {
                    return $kunjungan->ruangan && $kunjungan->ruangan->JENIS_KUNJUNGAN == 2;
                });
        }

        if (!$kunjunganUGD) {
            if (request()->expectsJson() || request()->ajax()) {
                return response()->json([
                    'error' => 'Tidak ada data kunjungan ugd yang ditemukan untuk pendaftaran ini.',
                ], 404);
            }
            return redirect()->back()->with([
                'error' => 'Tidak ada data kunjungan ugd yang ditemukan untuk pendaftaran ini.',
            ]);
        }

        $getRiwayatPengobatan = $kunjunganUGD->orderResep
            ? $kunjunganUGD->orderResep->flatMap(function ($order) {
                return $order->orderResepDetil
                    ? $order->orderResepDetil->map(function ($detil) {
                        return $detil->namaObat->NAMA ?? null;
                    })->filter()
                    : collect();
            })->values()->implode(', ')
            : '';

        $getRiwayatAlergi = $kunjunganUGD->riwayatAlergi
            ? $kunjunganUGD->riwayatAlergi->flatMap(function ($alergi) {
                return $alergi->ALERGI ? [$alergi->ALERGI] : [];
            })->implode(', ')
            : '';

        $getRiwayatAlergi = trim($getRiwayatAlergi) !== '' ? $getRiwayatAlergi : 'Tidak ada riwayat alergi';

        $getDiagnosaPasien = $kunjunganUGD->pendaftaranPasien->diagnosaPasien
            ? $kunjunganUGD->pendaftaranPasien->diagnosaPasien
            ->flatMap(function ($diagnosa) {
                return $diagnosa->namaDiagnosa ? [$diagnosa->namaDiagnosa->STR . ' (' . $diagnosa->namaDiagnosa->CODE . ')'] : [];
            })->implode(', ')
            : 'Tidak ada data diagnosa';

        $riwayatKeluarga = [];
        if ($kunjunganUGD->riwayatPenyakitKeluarga) {
            if ($kunjunganUGD->riwayatPenyakitKeluarga->HIPERTENSI == 1) {
                $riwayatKeluarga[] = 'HIPERTENSI';
            }
            if ($kunjunganUGD->riwayatPenyakitKeluarga->DIABETES_MELITUS == 1) {
                $riwayatKeluarga[] = 'DIABETES MELITUS';
            }
            if ($kunjunganUGD->riwayatPenyakitKeluarga->PENYAKIT_JANTUNG == 1) {
                $riwayatKeluarga[] = 'PENYAKIT JANTUNG';
            }
            if ($kunjunganUGD->riwayatPenyakitKeluarga->ASMA == 1) {
                $riwayatKeluarga[] = 'ASMA';
            }
            if (!empty($kunjunganUGD->riwayatPenyakitKeluarga->LAINNYA)) {
                $riwayatKeluarga[] = $kunjunganUGD->riwayatPenyakitKeluarga->LAINNYA;
            }
        }
        $riwayat_penyakit_keluarga = count($riwayatKeluarga) > 0 ? implode(', ', $riwayatKeluarga) : 'Tidak ada data';

        $pupil = ($kunjunganUGD->pemeriksaanMata->_ISOKOR ?? 0) == 1
            ? 'Pupil Isokor'
            : (($kunjunganUGD->pemeriksaanMata->_ANISOKOR ?? 0) == 1
                ? 'Pupil Anisokor'
                : 'Tidak Ada Kelainan');

        $namaDokter = ($kunjunganUGD->dokterDPJP->GELAR_DEPAN ? $kunjunganUGD->dokterDPJP->GELAR_DEPAN . '.' : '') . $kunjunganUGD->dokterDPJP->NAMA . ($kunjunganUGD->dokterDPJP->GELAR_BELAKANG ? ',' . $kunjunganUGD->dokterDPJP->GELAR_BELAKANG : '') ?? 'Tidak ada data petugas';

        $pengkajianAwal = [
            'nama_pasien' => $kunjunganUGD->pendaftaranPasien->pasien->NAMA ?? 'Tidak ada data nama pasien',
            'no_rm' => $kunjunganUGD->pendaftaranPasien->pasien->NORM ?? 'Tidak ada data nomor rekam medis',
            'tanggal_lahir' => $kunjunganUGD->pendaftaranPasien->pasien->TANGGAL_LAHIR ?? 'Tidak ada data tanggal lahir',
            'jenis_kelamin' => $kunjunganUGD->pendaftaranPasien->pasien->JENIS_KELAMIN === 1 ? 'Laki-laki' : ($kunjunganUGD->pendaftaranPasien->pasien->JENIS_KELAMIN === 2 ? 'Perempuan' : 'Tidak ada data jenis kelamin'),
            'tanggal_masuk' => $kunjunganUGD->MASUK ?? 'Tidak ada data tanggal masuk',
            'ruangan' => $kunjunganUGD->ruangan->DESKRIPSI ?? 'Tidak ada data ruang rawat',
            'alamat_pasien' => $kunjunganUGD->pendaftaranPasien->pasien->ALAMAT ?? 'Tidak ada data alamat pasien',
            'auto_anamnesis' => $kunjunganUGD->anamnesisPasienDiperoleh->AUTOANAMNESIS ?? 0,
            'allo_anamnesis' => $kunjunganUGD->anamnesisPasienDiperoleh->ALLOANAMNESIS ?? 0,
            'dari' => $kunjunganUGD->anamnesisPasienDiperoleh->DARI ?? '-',
            'anamnesis' => $kunjunganUGD->keluhanUtama->DESKRIPSI ?? 'Tidak ada data anamnesis',
            'riwayat_penyakit_sekarang' => $kunjunganUGD->anamnesisPasien->DESKRIPSI ?? 'Tidak ada data riwayat penyakit sekarang',
            'riwayat_penyakit_dahulu' => $kunjunganUGD->rpp->DESKRIPSI ?? 'Tidak ada data riwayat penyakit dahulu',
            'riwayat_pengobatan' => $getRiwayatPengobatan,
            'riwayat_penyakit_keluarga' => $riwayat_penyakit_keluarga,
            'keadaan_umum' => $kunjunganUGD->tandaVital->KEADAAN_UMUM,
            'tingkat_kesadaran' => $kunjunganUGD->tandaVital->tingkatKesadaran->DESKRIPSI,
            'gcs' => $kunjunganUGD->tandaVital->GCS,
            'eye' => $kunjunganUGD->tandaVital->EYE,
            'motorik' => $kunjunganUGD->tandaVital->MOTORIK,
            'verbal' => $kunjunganUGD->tandaVital->VERBAL,
            'tekanan_darah' => $kunjunganUGD->tandaVital->SISTOLIK . '/' . $kunjunganUGD->tandaVital->DISTOLIK,
            'frekuensi_nadi' => $kunjunganUGD->tandaVital->FREKUENSI_NADI,
            'frekuensi_nafas' => $kunjunganUGD->tandaVital->FREKUENSI_NAFAS,
            'suhu' => $kunjunganUGD->tandaVital->SUHU,
            'saturasi_o2' => $kunjunganUGD->tandaVital->SATURASI_O2,
            'mata' => ($kunjunganUGD->pemeriksaanMata && $kunjunganUGD->pemeriksaanMata->ANEMIS == 1) ? 'Ada' : 'Tidak Ada Kelainan',
            'ikterus' => ($kunjunganUGD->pemeriksaanMata && $kunjunganUGD->pemeriksaanMata->IKTERUS == 1) ? 'Ada' : 'Tidak Ada Kelainan',
            'pupil' => $pupil,
            'diameter' => ($kunjunganUGD->pemeriksaanMata && $kunjunganUGD->pemeriksaanMata->DIAMETER_ISIAN && $kunjunganUGD->pemeriksaanMata->DIAMETER_MM) ? $kunjunganUGD->pemeriksaanMata->DIAMETER_ISIAN . "/" . $kunjunganUGD->pemeriksaanMata->DIAMETER_MM : 'Tidak ada data diameter',
            'udem_palpebrae' => ($kunjunganUGD->pemeriksaanMata && $kunjunganUGD->pemeriksaanMata->UDEM == 1) ? 'Ada' : 'Tidak Ada Kelainan',
            'riwayat_alergi' => $getRiwayatAlergi,
            'diagnosa' => $getDiagnosaPasien,
            'rencana_terapi' => $kunjunganUGD->rencanaTerapi->DESKRIPSI ?? 'Tidak ada data rencana terapi',
            'nama_dokter' => $namaDokter,
            'nip_dokter' => $kunjunganUGD->dokterDPJP->NIP ?? 'Tidak ada data NIP dokter',
        ];

        $qrcodeBase64 = 'data:image/png;base64,' . base64_encode(
            QrCode::format('png')->size(150)->generate($namaDokter)
        );

        $imagePath = public_path('images/kop.png'); // Path ke gambar di folder public
        if (!file_exists($imagePath)) {
            throw new \Exception("Gambar tidak ditemukan di path: $imagePath");
        }
        $imageData = base64_encode(file_get_contents($imagePath)); // Konversi ke Base64
        $imageBase64 = 'data:image/png;base64,' . $imageData; // Tambahkan prefix Base64


        $dompdf = new Dompdf();
        $dompdf->loadHtml(
            view('eklaim.PengkajianAwal', compact(
                'pengkajianAwal',
                'imageBase64', // Kirim Base64 ke view
                'qrcodeBase64', // Kirim Base64 QR Code ke view
            ))->render()
        );
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $pdf = $dompdf->output();

        return response($pdf, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="PengkajianAwal.pdf"');

        // return view('eklaim.PengkajianAwal', compact(
        //     'pengkajianAwal',
        //     'imageBase64', // Kirim Base64 ke view
        //     'qrcodeBase64', // Kirim Base64 QR Code ke view
        // ));
    }

    public function previewCPPT(Pendaftaran $pendaftaran)
    {
        $pendaftaran->load([
            'kunjunganPasien.ruangan',
            'kunjunganPasien.CPPT.petugas.pegawai.profesi',
            'kunjunganPasien.pendaftaranPasien.pasien',
        ]);

        $kunjunganRawatInap = $pendaftaran->kunjunganPasien
            ->first(function ($kunjungan) {
                return $kunjungan->ruangan && $kunjungan->ruangan->JENIS_KUNJUNGAN == 3;
            });

        if (!$kunjunganRawatInap) {
            if (request()->expectsJson() || request()->ajax()) {
                return response()->json([
                    'error' => 'Tidak ada data kunjungan rawat inap yang ditemukan untuk pendaftaran ini.',
                ], 404);
            }
            return redirect()->back()->with([
                'error' => 'Tidak ada data kunjungan rawat inap yang ditemukan untuk pendaftaran ini.',
            ]);
        }

        $dataCppt = [];
        foreach ($kunjunganRawatInap->CPPT as $item) {
            // Ambil nama petugas, sesuaikan field jika perlu
            $namaPetugas = $item->petugas->NAMA ?? '-';
            // Generate QR code base64
            $qrcodePetugas = 'data:image/png;base64,' . base64_encode(
                QrCode::format('png')->size(100)->generate($namaPetugas)
            );
            // Ubah ke array dan tambahkan qrcode_petugas
            $cpptItem = $item->toArray();
            $cpptItem['qrcode_petugas'] = $qrcodePetugas;
            $dataCppt[] = $cpptItem;
        }

        $CPPT = [
            'nama_pasien' => $kunjunganRawatInap->pendaftaranPasien->pasien->NAMA ?? 'Tidak ada data nama pasien',
            'no_rm' => $kunjunganRawatInap->pendaftaranPasien->pasien->NORM ?? 'Tidak ada data nomor rekam medis',
            'tanggal_lahir' => $kunjunganRawatInap->pendaftaranPasien->pasien->TANGGAL_LAHIR ?? 'Tidak ada data tanggal lahir',
            'jenis_kelamin' => $kunjunganRawatInap->pendaftaranPasien->pasien->JENIS_KELAMIN === 1
                ? 'Laki-laki'
                : ($kunjunganRawatInap->pendaftaranPasien->pasien->JENIS_KELAMIN === 2
                    ? 'Perempuan'
                    : 'Tidak ada data jenis kelamin'),
            'alamat' => $kunjunganRawatInap->pendaftaranPasien->pasien->ALAMAT ?? 'Tidak ada data alamat pasien',
            'cppt' => $dataCppt,
        ];

        $imagePath = public_path('images/kop.png'); // Path ke gambar di folder public
        if (!file_exists($imagePath)) {
            throw new \Exception("Gambar tidak ditemukan di path: $imagePath");
        }
        $imageData = base64_encode(file_get_contents($imagePath)); // Konversi ke Base64
        $imageBase64 = 'data:image/png;base64,' . $imageData; // Tambahkan prefix Base64


        $dompdf = new Dompdf();
        $dompdf->loadHtml(
            view('eklaim.CPPT', compact(
                'CPPT',
                'imageBase64', // Kirim Base64 ke view
                // 'qrcodeBase64', // Kirim Base64 QR Code ke view
            ))->render()
        );
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $pdf = $dompdf->output();

        return response($pdf, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="PengkajianAwal.pdf"');
    }

    public function previewResumeMedisEdit(PengajuanKlaim $pendaftaran)
    {
        $dataResumeMedis = ResumeMedis::where('id_pengajuan_klaim', $pendaftaran->id)->first();
        $dataPermintaanKonsultasi = PermintaanKonsul::where('resume_medis_id', $dataResumeMedis->id)->get();
        $getKonsultasi = $dataPermintaanKonsultasi->map(function ($konsul) {
            return [
                'pertanyaan' => $konsul->pertanyaan ?? 'Tidak ada data pertanyaan',
                'jawaban' => $konsul->jawaban ?? 'Tidak ada data jawaban',
            ];
        })->toArray();
        $dataTTV = TTVResumeMedis::where('resume_medis_id', $dataResumeMedis->id)->first();
        $dataTerapiPulang = TerapiPulang::where('resume_medis_id', $dataResumeMedis->id)->get();
        $getTerapiPulang = $dataTerapiPulang->map(function ($terapi) {
            return [
                'nama_obat' => $terapi->nama_obat ?? 'Tidak ada data nama obat',
                'frekuensi' => $terapi->frekuensi ?? 'Tidak ada data aturan pakai',
                'jumlah' => $terapi->jumlah ?? 'Tidak ada data jumlah',
                'cara_pakai' => $terapi->cara_pemberian ?? 'Tidak ada data cara pakai',
            ];
        })->toArray();

        if (!$dataResumeMedis) {
            throw new \Exception("Data Resume Medis tidak ditemukan");
        }
        $diagnosaArr = [];
        if (!empty($dataResumeMedis->diagnosa_utama)) {
            $diagnosaArr = collect(explode('#', $dataResumeMedis->diagnosa_utama))
                ->filter()
                ->flatMap(function ($item) {
                    [$val, $count] = array_pad(explode('+', $item), 2, 1);
                    $count = (int) $count ?: 1;
                    return array_fill(0, $count, $val);
                })
                ->map(function ($code) {
                    $desc = \App\Models\Master\MrConso::where('CODE', $code)->value('STR') ?? '';
                    return [
                        'id' => $code,
                        'description' => $desc,
                    ];
                })
                ->values()
                ->toArray();
        }

        $prosedurArr = [];
        if (!empty($dataResumeMedis->prosedur_utama)) {
            $prosedurArr = collect(explode('#', $dataResumeMedis->prosedur_utama))
                ->filter()
                ->flatMap(function ($item) {
                    [$val, $count] = array_pad(explode('+', $item), 2, 1);
                    $count = (int) $count ?: 1;
                    return array_fill(0, $count, $val);
                })
                ->map(function ($code) {
                    $desc = \App\Models\Master\MrConso::where('CODE', $code)->value('STR') ?? '';
                    return [
                        'id' => $code,
                        'description' => $desc,
                    ];
                })
                ->values()
                ->toArray();
        }

        if ($dataResumeMedis->cara_pulang == 1) {
            $dataResumeMedis->cara_pulang = 'Atas Persetujuan Dokter';
        } elseif ($dataResumeMedis->cara_pulang == 2) {
            $dataResumeMedis->cara_pulang = 'Dirujuk';
        } elseif ($dataResumeMedis->cara_pulang == 3) {
            $dataResumeMedis->cara_pulang = 'Atas Permintaan Sendiri';
        } elseif ($dataResumeMedis->cara_pulang == 4) {
            $dataResumeMedis->cara_pulang = 'Meninggal';
        } else {
            $dataResumeMedis->cara_pulang = 'Lain-lain';
        }


        $resumeMedis = [
            'nama_pasien' => $dataResumeMedis->nama_pasien ?? 'Tidak ada data nama pasien',
            'no_rm' => $dataResumeMedis->no_rm ?? 'Tidak ada data nomor rekam medis',
            'ruang_rawat_terakhir' => $dataResumeMedis->ruang_rawat ?? 'Tidak ada data ruang rawat',
            'jenis_kelamin' => $dataResumeMedis->jenis_kelamin ?? 'Tidak ada data jenis kelamin',
            'tanggal_lahir' => $dataResumeMedis->tanggal_lahir ?? 'Tidak ada data tanggal lahir',
            'tanggal_masuk' => $dataResumeMedis->tanggal_masuk ?? 'Tidak ada data tanggal masuk',
            'tanggal_keluar' => $dataResumeMedis->tanggal_keluar ?? 'Tidak ada data tanggal keluar',
            'penjamin' => $dataResumeMedis->penjamin ?? 'Tidak ada data penjamin',
            'indikasi_rawat_inap' => $dataResumeMedis->indikasi_rawat_inap ?? 'Tidak ada data indikasi rawat inap',
            'riwayat_penyakit_sekarang' => $dataResumeMedis->riwayat_penyakit_sekarang ?? 'Tidak ada data riwayat penyakit sekarang',
            'riwayat_penyakit_dahulu' => $dataResumeMedis->riwayat_penyakit_dahulu ?? 'Tidak ada data ringkasan penyakit dahulu',
            'pemeriksaan_fisik' => $dataResumeMedis->pemeriksaan_fisik ?? 'Tidak ada data pemeriksaan fisik',
            'hasil_konsultasi' => $getKonsultasi ?? 'Tidak ada data hasil konsultasi',
            'diagnosa_utama' => $diagnosaArr ?? 'Tidak ada data diagnosa utama',
            'prosedur_utama' => $prosedurArr ?? 'Tidak ada data prosedur',
            'keadaan_pulang' => $dataResumeMedis->keadaan_pulang ?? 'Tidak ada data keadaan pulang',
            'cara_pulang' => $dataResumeMedis->cara_pulang ?? 'Tidak ada data cara pulang',
            'tekanan_darah' => $dataTTV->tekanan_darah ?? '0/0',
            'nadi' => $dataTTV->nadi ?? '0',
            'suhu' => $dataTTV->suhu ?? '0',
            'pernafasan' => $dataTTV->pernafasan ?? '0',
            'kesadaran' => $dataTTV->tingkat_kesadaran ?? '-',
            'skala_nyeri' => $dataTTV->skala_nyeri ?? '-',
            'terapi_pulang' => $getTerapiPulang,
            'nama_dokter' => $dataResumeMedis->dokter ?? 'Tidak ada data nama dokter',
            'nip_dokter' => $dataResumeMedis->NIP ?? '-',
            'keadaan_umum' => $dataResumeMedis->keadaan_umum ?? 'Tidak ada data keadaan umum',
            'suhu' => $dataResumeMedis->suhu ?? 'Tidak ada data suhu',
            'nadi' => $dataResumeMedis->nadi ?? 'Tidak ada data nadi',
            'sistole' => $dataResumeMedis->sistole ?? 'Tidak ada data sistolik',
            'diastole' => $dataResumeMedis->diastole ?? 'Tidak ada data diastolik',
            'respirasi' => $dataResumeMedis->respirasi ?? 'Tidak ada data pernafasan',

        ];

        $namaDokter = $dataResumeMedis['dokter'] ?? '-';
        $qrcodeBase64 = 'data:image/png;base64,' . base64_encode(
            QrCode::format('png')->size(150)->generate($namaDokter)
        );
        $imagePath = public_path('images/kop.png'); // Path ke gambar di folder public
        if (!file_exists($imagePath)) {
            throw new \Exception("Gambar tidak ditemukan di path: $imagePath");
        }
        $imageData = base64_encode(file_get_contents($imagePath)); // Konversi ke Base64
        $imageBase64 = 'data:image/png;base64,' . $imageData; // Tambahkan prefix Base64


        $dompdf = new Dompdf();
        $dompdf->loadHtml(
            view('eklaim.ResumeMedis', compact(
                'resumeMedis',
                'imageBase64', // Kirim Base64 ke view
                'qrcodeBase64', // Kirim Base64 QR Code ke view
            ))->render()
        );
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $pdf = $dompdf->output();

        return response($pdf, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="ResumeMedis.pdf"');
    }

    public function previewPengkajianAwalEdit(PengajuanKlaim $pendaftaran)
    {
        $resumeMedis = ResumeMedis::where('id_pengajuan_klaim', $pendaftaran->id)->first();
        $dataPengkajianAwal = PengkajianAwal::where('resume_medis_id', $resumeMedis->id)->first();
        if (!$dataPengkajianAwal) {
            return redirect()->back()->with('error', 'Data Pengkajian Awal tidak ditemukan untuk pengajuan klaim ini.');
        }
        $dataTTV = TandaVital::where('pengkajian_awal_id', $dataPengkajianAwal->id)->first();
        $dataAnamnesis = Anamnesis::where('pengkajian_awal_id', $dataPengkajianAwal->id)->first();
        $dataPemeriksaanFisik = PemeriksaanFisik::where('pengkajian_awal_id', $dataPengkajianAwal->id)->first();
        $dataResikoJatuh = ResikoJatuh::where('pengkajian_awal_id', $dataPengkajianAwal->id)->first();
        $dataResikoDekubitus = ResikoDekubitus::where('pengkajian_awal_id', $dataPengkajianAwal->id)->first();
        $dataResikoGizi = ResikoGizi::where('pengkajian_awal_id', $dataPengkajianAwal->id)->first();
        $dataStatusPsokososial = Psikososial::where('pengkajian_awal_id', $dataPengkajianAwal->id)->first();
        $dataDischargePlanning = DischargePlanning::where('pengkajian_awal_id', $dataPengkajianAwal->id)->first();
        $dataPenilaianNyeri = PenilaianNyeri::where('pengkajian_awal_id', $dataPengkajianAwal->id)->first();

        $pengkajianAwal = [
            'nama_pasien' => $dataPengkajianAwal->nama_pasien ?? 'Tidak ada data nama pasien',
            'no_rm' => $dataPengkajianAwal->no_rm ?? 'Tidak ada data nomor rekam medis',
            'tanggal_lahir' => $dataPengkajianAwal->tanggal_lahir ?? 'Tidak ada data tanggal lahir',
            'jenis_kelamin' => $dataPengkajianAwal->jenis_kelamin ?? 'Tidak ada data jenis kelamin',
            'tanggal_masuk' => $dataPengkajianAwal->tanggal_masuk ?? 'Tidak ada data tanggal masuk',
            'ruangan' => $dataPengkajianAwal->ruangan ?? 'Tidak ada data ruang rawat',
            'alamat_pasien' => $dataPengkajianAwal->alamat ?? 'Tidak ada data alamat pasien',
            'auto_anamnesis' => $dataAnamnesis->auto_anamnesis === "Ya" ? 1 : 0,
            'allo_anamnesis' => $dataAnamnesis->allo_anamnesis === "Ya" ? 1 : 0,
            'dari' => $dataAnamnesis->dari ?? '-',
            'anamnesis' => $dataAnamnesis->keluhan_utama ?? 'Tidak ada data anamnesis',
            'riwayat_penyakit_sekarang' => $dataAnamnesis->riwayat_penyakit_sekarang ?? 'Tidak ada data riwayat penyakit sekarang',
            'riwayat_penyakit_dahulu' => $dataAnamnesis->riwayat_penyakit_lalu ?? 'Tidak ada data riwayat penyakit dahulu',
            'riwayat_pengobatan' => $dataAnamnesis->riwayat_pengobatan ?? 'Tidak ada data riwayat pengobatan',
            'riwayat_penyakit_keluarga' => $dataAnamnesis->riwayat_penyakit_keluarga ?? 'Tidak ada data riwayat penyakit keluarga',
            'keadaan_umum' => $dataTTV->keadaan_umum ?? 'Tidak ada data keadaan umum',
            'tingkat_kesadaran' => $dataTTV->tingkat_kesadaran ?? 'Tidak ada data tingkat kesadaran',
            'gcs' => $dataTTV->GCS ?? 'Tidak ada data GCS',
            'eye' => $dataTTV->EYE ?? 'Tidak ada data eye',
            'motorik' => $dataTTV->MOTORIK ?? 'Tidak ada data motorik',
            'verbal' => $dataTTV->VERBAL ?? 'Tidak ada data verbal',
            'tekanan_darah' => $dataTTV->SISTOLIK . '/' . $dataTTV->DISTOLIK ?? 'Tidak ada data tekanan darah',
            'frekuensi_nadi' => $dataTTV->FREKUENSI_NADI ?? 'Tidak ada data frekuensi nadi',
            'frekuensi_nafas' => $dataTTV->FREKUENSI_NAFAS ?? 'Tidak ada data frekuensi nafas',
            'suhu' => $dataTTV->SUHU ?? 'Tidak ada data suhu',
            'saturasi_o2' => $dataTTV->SATURASI_O2 ?? 'Tidak ada data saturasi O2',
            'mata' => $dataPemeriksaanFisik->mata ?? 'Tidak ada kelainan',
            'ikterus' => $dataPemeriksaanFisik->ikterus ?? 'Tidak ada kelainan',
            'pupil' => $dataPemeriksaanFisik->pupil ?? 'Tidak ada kelainan',
            'diameter' => $dataPemeriksaanFisik->diameter_mata ?? 'Tidak ada kelainan',
            'udem_palpebrae' => $dataPemeriksaanFisik->udema_palpebrae ?? 'Tidak ada kelainan',
            'kelainan_mata' => $dataPemeriksaanFisik->kelainan_mata ?? 'Tidak ada kelainan',
            'tht' => $dataPemeriksaanFisik->tht ?? 'Tidak ada kelainan',
            'tongsil' => $dataPemeriksaanFisik->tongsil ?? 'Tidak ada kelainan',
            'faring' => $dataPemeriksaanFisik->faring ?? 'Tidak ada kelainan',
            'lidah' => $dataPemeriksaanFisik->lidah ?? 'Tidak ada kelainan',
            'bibir' => $dataPemeriksaanFisik->bibir ?? 'Tidak ada kelainan',
            'leher' => $dataPemeriksaanFisik->leher ?? 'Tidak ada kelainan',
            'jvp' => $dataPemeriksaanFisik->jvp ?? 'Tidak ada kelainan',
            'limfe' => $dataPemeriksaanFisik->limfe ?? 'Tidak ada kelainan',
            'kaku_kuduk' => $dataPemeriksaanFisik->kaku_kuduk ?? 'Tidak ada kelainan',
            'thoraks' => $dataPemeriksaanFisik->thoraks ?? 'Tidak ada kelainan',
            'cor' => $dataPemeriksaanFisik->cor ?? 'Tidak ada kelainan',
            'murmur' => $dataPemeriksaanFisik->murmur ?? 'Tidak ada kelainan',
            's1s2' => $dataPemeriksaanFisik->s1s2 ?? 'Tidak ada kelainan',
            'pulmo' => $dataPemeriksaanFisik->pulmo ?? 'Tidak ada kelainan',
            'suara_nafas' => $dataPemeriksaanFisik->suara_nafas ?? 'Tidak ada kelainan',
            'ronchi' => $dataPemeriksaanFisik->ronchi ?? 'Tidak ada kelainan',
            'wheezing' => $dataPemeriksaanFisik->wheezing ?? 'Tidak ada kelainan',
            'abdomen' => $dataPemeriksaanFisik->abdomen ?? 'Tidak ada kelainan',
            'meteorismus' => $dataPemeriksaanFisik->meteorismus ?? 'Tidak ada kelainan',
            'peristaltik' => $dataPemeriksaanFisik->peristaltik ?? 'Tidak ada kelainan',
            'asites' => $dataPemeriksaanFisik->asites ?? 'Tidak ada kelainan',
            'nyeri_tekan' => $dataPemeriksaanFisik->nyeri_tekan ?? 'Tidak ada kelainan',
            'hepar' => $dataPemeriksaanFisik->hepar ?? 'Tidak ada kelainan',
            'lien' => $dataPemeriksaanFisik->lien ?? 'Tidak ada kelainan',
            'extremitas' => $dataPemeriksaanFisik->extremitas ?? 'Tidak ada kelainan',
            'udem' => $dataPemeriksaanFisik->udem ?? 'Tidak ada kelainan',
            'defeksasi' => $dataPemeriksaanFisik->defeksasi ?? 'Tidak ada kelainan',
            'urin' => $dataPemeriksaanFisik->urin ?? 'Tidak ada kelainan',
            'pemeriksaan_lain_lain' => $dataPemeriksaanFisik->pemeriksaan_lain_lain ?? 'Tidak ada kelainan',
            'riwayat_alergi' => $dataPengkajianAwal->riwayat_alergi ?? 'Tidak ada data riwayat alergi',
            'diagnosa' => $dataPengkajianAwal->diagnosa_keperawatan ?? 'Tidak ada data diagnosa',
            'rencana_terapi' => $dataPengkajianAwal->rencana_terapi ?? 'Tidak ada data rencana terapi',
            'nama_dokter' => $dataPengkajianAwal->nama_dokter ?? 'Tidak ada data nama dokter',
            'nip_dokter' => '-',
            'nyeri' => $dataPenilaianNyeri->nyeri ?? 'Tidak ada data skala nyeri',
            'onset' => $dataPenilaianNyeri->onset ?? 'Tidak ada data lokasi nyeri',
            'pencetus' => $dataPenilaianNyeri->pencetus ?? 'Tidak ada data durasi nyeri',
            'lokasi' => $dataPenilaianNyeri->lokasi ?? 'Tidak ada data frekuensi nyeri',
            'gambaran' => $dataPenilaianNyeri->gambaran ?? 'Tidak ada data gambaran nyeri',
            'durasi' => $dataPenilaianNyeri->durasi ?? 'Tidak ada data durasi nyeri',
            'skala_nyeri' => $dataPenilaianNyeri->skala ?? 'Tidak ada data skala nyeri',
            'metode' => $dataPenilaianNyeri->metode ?? 'Tidak ada data metode nyeri',
        ];

        $namaDokter = $dataResumeMedis['dokter'] ?? '-';
        $qrcodeBase64 = 'data:image/png;base64,' . base64_encode(
            QrCode::format('png')->size(150)->generate($namaDokter)
        );
        $imagePath = public_path('images/kop.png'); // Path ke gambar di folder public
        if (!file_exists($imagePath)) {
            throw new \Exception("Gambar tidak ditemukan di path: $imagePath");
        }
        $imageData = base64_encode(file_get_contents($imagePath)); // Konversi ke Base64
        $imageBase64 = 'data:image/png;base64,' . $imageData; // Tambahkan prefix Base64


        $dompdf = new Dompdf();
        $dompdf->loadHtml(
            view('eklaim.PengkajianAwal', compact(
                'pengkajianAwal',
                'imageBase64', // Kirim Base64 ke view
                'qrcodeBase64', // Kirim Base64 QR Code ke view
            ))->render()
        );
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $pdf = $dompdf->output();

        return response($pdf, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="PengkajianAwal.pdf"');
    }

    public function previewTriageEdit(PengajuanKlaim $pendaftaran)
    {
        $dataResumeMedis = ResumeMedis::where('id_pengajuan_klaim', $pendaftaran->id)->first();
        if (!$dataResumeMedis) {
            return redirect()->back()->with('error', 'Data Resume Medis tidak ditemukan untuk pengajuan klaim ini.');
        }
        $dataTriage = Triage::where('resume_medis_id', $dataResumeMedis->id)->first();
        $getCaraDatang = [
            'JENIS' => 99,
            'PENGANTAR' => $dataTriage->pengantar ?? 'Tidak ada data pengantar',
            'ALAT_TRANSPORTASI' => $dataTriage->alat_transportasi ?? 'Tidak ada data alat transportasi',
            'ASAL_RUJUKAN' => $dataTriage->pasien_rujukan ?? '-',
            'KEPOLISIAN' => $dataTriage->dikirim_polisi ?? '-',
        ];
        $getDataMacamKasus = [
            'JENIS' => $dataTriage->jenis_kasus ?? 0,
            'DIMANA' => $dataTriage->lokasi_kasus ?? "Tidak ada data lokasi kasus",
        ];
        $getDataAnamnesa = [
            'KELUHAN_UTAMA' => $dataTriage->keluhan_utama ?? 'Tidak ada data keluhan utama',
            'TERPIMPIN' => $dataTriage->anamnesa_terpimpin ?? 'Tidak ada data terpimpin',
        ];
        $getDataTandaVital = [
            'SISTOLE' => 0,
            'DIASTOLE' => 0,
            'TEKANAN_DARAH' => $dataTriage->tekanan_darah ?? 'Tidak ada data tekanan darah',
            'FREK_NADI' => $dataTriage->nadi ?? 'Tidak ada data frekuensi nadi',
            'FREK_NAFAS' => $dataTriage->pernapasan ?? 'Tidak ada data frekuensi nafas',
            'SUHU' => $dataTriage->suhu ?? 'Tidak ada data suhu',
            'SKALA_NYERI' => $dataTriage->nyeri ?? 'Tidak ada data nyeri',
            'METODE_UKUR' => $dataTriage->metode_ukur_nyeri ?? 'Tidak ada data metode ukur',
        ];
        $getDataKebutuhanKhusus = [
            'AIRBONE' => $dataTriage->airborne ?? 0,
            'DEKONTAMINAN' => $dataTriage->dekontaminasi ?? 0,
        ];
        $getDataResusitasi = [
            'CHECKED' => $dataTriage->resusitasi ?? 0,
        ];
        $getDataEmergency = [
            'CHECKED' => $dataTriage->emergency ?? 0,
        ];
        $getDataUrgent = [
            'CHECKED' => $dataTriage->urgent ?? 0,
        ];
        $getDataLessUrgent = [
            'CHECKED' => $dataTriage->less_urgent ?? 0,
        ];
        $getDataNonUrgent = [
            'CHECKED' => $dataTriage->non_urgent ?? 0,
        ];
        $getDataDeath = [
            'CHECKED' => $dataTriage->zona_hitam ?? 0,
        ];

        $triage = [
            'nama_pasien' => $dataTriage->nama_pasien ?? 'Tidak ada data nama pasien',
            'no_rm' => $dataTriage->no_rm ?? 'Tidak ada data nomor rekam medis',
            'tanggal_lahir' => $dataTriage->tanggal_lahir ?? 'Tidak ada data tanggal lahir',
            'jenis_kelamin' => $dataTriage->jenis_kelamin ?? 'Tidak ada jenis kelamin',
            'tanggal_masuk' => $dataTriage->tanggal_kedatangan ?? 'Tidak ada data tanggal masuk',
            'cara_datang' => $getCaraDatang,
            'macam_kasus' => $getDataMacamKasus,
            'anamnesa' => $getDataAnamnesa,
            'tanda_vital' => $getDataTandaVital,
            'petugas' => $dataTriage->petugas ?? '',
            'kebutuhan_khusus' => $getDataKebutuhanKhusus,
            'resusitasi' => $getDataResusitasi,
            'emergency' => $getDataEmergency,
            'urgent' => $getDataUrgent,
            'less_urgent' => $getDataLessUrgent,
            'non_urgent' => $getDataNonUrgent,
            'death' => $getDataDeath,
            'nama_dokter' => 'dr.MUSATAFID ALWI',
            'nip_dokter' => '202301169',
            'tanda_tangan_dokter' => 'data:image/png;base64,' . base64_encode(QrCode::format('png')->size(150)->generate("dr.MUSATAFID ALWI")),
            'nama_perawat' => $dataTriage->petugas ?? '',
            'nip_perawat' => $dataTriage->nip_petugas ?? '',
            'tanda_tangan_perawat' => 'data:image/png;base64,' . base64_encode(QrCode::format('png')->size(150)->generate($dataTriage->petugas ?? '-')),
        ];

        $imagePath = public_path('images/kop.png'); // Path ke gambar di folder public
        if (!file_exists($imagePath)) {
            throw new \Exception("Gambar tidak ditemukan di path: $imagePath");
        }
        $imageData = base64_encode(file_get_contents($imagePath)); // Konversi ke Base64
        $imageBase64 = 'data:image/png;base64,' . $imageData; // Tambahkan prefix Base64


        $dompdf = new Dompdf();
        $dompdf->loadHtml(
            view('eklaim.Triage', compact(
                'triage',
                'imageBase64', // Kirim Base64 ke view
            ))->render()
        );
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $pdf = $dompdf->output();

        return response($pdf, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="Triage.pdf"');
    }

    public function previewCPPTEdit(PengajuanKlaim $pendaftaran)
    {
        $dataResumeMedis = ResumeMedis::where('id_pengajuan_klaim', $pendaftaran->id)->first();
        $dataPengkajianAwal = PengkajianAwal::where('resume_medis_id', $dataResumeMedis->id)->select('alamat')->first();
        $dataCPPT = CPPT::where('resume_medis_id', $dataResumeMedis->id)->get();

        $listCPPT = [];
        foreach ($dataCPPT as $item) {
            // Ambil nama petugas, sesuaikan field jika perlu
            $namaPetugas = $item->nama_petugas ?? '-';
            // Generate QR code base64
            $qrcodePetugas = 'data:image/png;base64,' . base64_encode(
                QrCode::format('png')->size(100)->generate($namaPetugas)
            );
            // Ubah ke array dan tambahkan qrcode_petugas
            $cpptItem = $item->toArray();
            $cpptItem = [
                'TANGGAL' => $item->tanggal_jam ?? 'Tidak ada data tanggal',
                'profesi' => $item->profesi ?? 'Tidak ada data profesi',
                'petugas' => [
                    'NAMA' => $item->petugas->pegawai->NAMA ?? 'Tidak ada data nama petugas',
                    'pegawai' => [
                        'profesi' => [
                            'DESKRIPSI' => $item->profesi ?? 'Tidak ada data profesi',
                        ]
                    ]
                ],
                'SUBYEKTIF' => $item->subyektif ?? 'Tidak ada data subyektif',
                'OBYEKTIF' => $item->obyektif ?? 'Tidak ada data objektif',
                'ASSESMENT' => $item->assesment ?? 'Tidak ada data assesment',
                'PLANNING' => $item->planning ?? 'Tidak ada data planning',
                'INSTRUKSI' => $item->instruksi ?? 'Tidak ada data instruksi',
                'qrcode_petugas' => $qrcodePetugas, // Tambahkan QR code petugas
            ];
            $listCPPT[] = $cpptItem;
        }

        $CPPT = [
            'nama_pasien' => $dataResumeMedis->nama_pasien ?? 'Tidak ada data nama pasien',
            'no_rm' => $dataResumeMedis->no_rm ?? 'Tidak ada data nomor rekam medis',
            'tanggal_lahir' => $dataResumeMedis->tanggal_lahir ?? 'Tidak ada data tanggal lahir',
            'jenis_kelamin' => $dataResumeMedis->jenis_kelamin ?? 'Tidak ada data jenis kelamin',
            'alamat' => $dataPengkajianAwal->alamat ?? 'Tidak ada data alamat pasien',
            'cppt' => $listCPPT,
        ];

        $imagePath = public_path('images/kop.png'); // Path ke gambar di folder public
        if (!file_exists($imagePath)) {
            throw new \Exception("Gambar tidak ditemukan di path: $imagePath");
        }
        $imageData = base64_encode(file_get_contents($imagePath)); // Konversi ke Base64
        $imageBase64 = 'data:image/png;base64,' . $imageData; // Tambahkan prefix Base64


        $dompdf = new Dompdf();
        $dompdf->loadHtml(
            view('eklaim.CPPT', compact(
                'CPPT',
                'imageBase64', // Kirim Base64 ke view
                // 'qrcodeBase64', // Kirim Base64 QR Code ke view
            ))->render()
        );
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $pdf = $dompdf->output();

        return response($pdf, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="CPPT.pdf"');
    }

    public function previewTagihan($nomor_pendaftaran)
    {
        // dd('Preview Tagihan untuk nomor pendaftaran: ' . $nomor_pendaftaran);
        $pengajuanKlaim = PengajuanKlaim::where('id', $nomor_pendaftaran)->first();
        $resumeMedis = ResumeMedis::where('id_pengajuan_klaim', $pengajuanKlaim->id)->first();
        $kunjungan = Kunjungan::where('NOMOR', $resumeMedis->nomor_kunjungan_igd)->first();
        $dataPasien = Pasien::where('NORM', $pengajuanKlaim->NORM)->first();
        $dataTagihanPendaftaran = TagihanPendaftaran::where('PENDAFTARAN', $pengajuanKlaim->nomor_pendaftaran)
            ->where('STATUS', '!=', 0)
            ->where('UTAMA', 1)
            ->first();

        if ($dataTagihanPendaftaran == null) {
            $dataTagihan = TagihanPendaftaran::where('PENDAFTARAN', $kunjungan->NOPEN)
                ->where('STATUS', '!=', 0)
                ->where('UTAMA', 1)
                ->first();

            $dataPembayaran = PembayaranTagihan::where('TAGIHAN', $dataTagihan->TAGIHAN)
                ->with('pegawai')
                ->first();

            $qrcode_petugas = 'data:image/png;base64,' . base64_encode(
                QrCode::format('png')->size(100)->generate(
                    $dataPembayaran->pegawai->NAMA ?? 'Tidak ada data nama petugas'
                )
            );
            $nama_petugas = $dataPembayaran->pegawai->NAMA ?? 'Tidak ada data nama petugas';
            $pendaftaranPasien = Pendaftaran::where('NOMOR', $dataTagihan->PENDAFTARAN)->first();
            $tanggalMasuk = $pendaftaranPasien->TANGGAL ?? '';
            $tanggalKeluar = $dataPembayaran->TANGGAL ?? '';
            $dataKunjungan = Kunjungan::where('NOPEN', $dataTagihan->PENDAFTARAN)->first();
            $klasifikasiKunjungan = null;
            if ($dataKunjungan && $dataKunjungan->ruangan && in_array($dataKunjungan->ruangan->JENIS_KUNJUNGAN, [1, 2, 3, 17])) {
                $klasifikasiKunjungan = $dataKunjungan;
            }
            $penjaminPasien = Penjamin::where('NOPEN', $dataTagihan->PENDAFTARAN)->first();
            $ruangan = 'Rawat Inap';
            $penjamin = $penjaminPasien->JENIS == 1 ? 'Umum' : 'BPJS';
        } else {
            $dataPembayaran = PembayaranTagihan::where('TAGIHAN', $dataTagihanPendaftaran->TAGIHAN)
                ->with('pegawai')
                ->first();

            $qrcode_petugas = 'data:image/png;base64,' . base64_encode(
                QrCode::format('png')->size(100)->generate(
                    $dataPembayaran->pegawai->NAMA ?? 'Tidak ada data nama petugas'
                )
            );
            $nama_petugas = $dataPembayaran->pegawai->NAMA ?? 'Tidak ada data nama petugas';
            $pendaftaranPasien = Pendaftaran::where('NOMOR', $dataTagihanPendaftaran->PENDAFTARAN)->first();
            $tanggalMasuk = $pendaftaranPasien->TANGGAL ?? '';
            $tanggalKeluar = $dataPembayaran->TANGGAL ?? '';
            $dataKunjungan = Kunjungan::where('NOPEN', $dataTagihanPendaftaran->PENDAFTARAN)->first();
            $klasifikasiKunjungan = null;
            if ($dataKunjungan && $dataKunjungan->ruangan && in_array($dataKunjungan->ruangan->JENIS_KUNJUNGAN, [1, 2, 3, 17])) {
                $klasifikasiKunjungan = $dataKunjungan;
            }
            $penjaminPasien = Penjamin::where('NOPEN', $dataTagihanPendaftaran->PENDAFTARAN)->first();
            $ruangan = $klasifikasiKunjungan->ruangan->DESKRIPSI ?? 'Tidak ada data ruangan';
            $penjamin = $penjaminPasien->JENIS == 1 ? 'Umum' : 'BPJS';
        }

        $rincianTagihan = RincianTagihan::where('id_pengajuan_klaim', $pengajuanKlaim->id)
            ->with([
                'tarifAdministrasi.ruangan',
                'tarifRuangRawat.ruanganKelas',
                'tarifTindakan.tindakan',
                'hargaBarang.obat',
                'paket',
                'tarifOksigen',
            ])
            ->get()
            ->map(function ($item) {
                $data = $item->toArray();

                // Set semua relasi null dulu
                $data['tarif_administrasi'] = null;
                $data['tarif_ruang_rawat'] = null;
                $data['tarif_tindakan'] = null;
                $data['harga_barang'] = null;
                $data['paket'] = null;
                $data['tarif_oksigen'] = null;

                // Isi hanya relasi yang sesuai jenis
                switch ($item->jenis) {
                    case 1:
                        $data['tarif_administrasi'] = $item->tarifAdministrasi ? $item->tarifAdministrasi->toArray() : null;
                        break;
                    case 2:
                        $data['tarif_ruang_rawat'] = $item->tarifRuangRawat ? $item->tarifRuangRawat->toArray() : null;
                        break;
                    case 3:
                        $data['tarif_tindakan'] = $item->tarifTindakan ? $item->tarifTindakan->toArray() : null;
                        break;
                    case 4:
                        $data['harga_barang'] = $item->hargaBarang ? $item->hargaBarang->toArray() : null;
                        break;
                    case 5:
                        $data['paket'] = $item->paket ? $item->paket->toArray() : null;
                        break;
                    case 6:
                        $data['tarif_oksigen'] = $item->tarifOksigen ? $item->tarifOksigen->toArray() : null;
                        break;
                }

                // relasi_jenis tetap untuk kemudahan akses
                $data['relasi_jenis'] =
                    $data['tarif_administrasi'] ??
                    $data['tarif_ruang_rawat'] ??
                    $data['tarif_tindakan'] ??
                    $data['harga_barang'] ??
                    $data['paket'] ??
                    $data['tarif_oksigen'];

                return $data;
            });

        $imagePath = public_path('images/kop.png'); // Path ke gambar di folder public
        if (!file_exists($imagePath)) {
            throw new \Exception("Gambar tidak ditemukan di path: $imagePath");
        }
        $imageData = base64_encode(file_get_contents($imagePath)); // Konversi ke Base64
        $imageBase64 = 'data:image/png;base64,' . $imageData; // Tambahkan prefix Base64

        $dompdf = new Dompdf();
        $dompdf->loadHtml(
            view('eklaim.Tagihan', compact(
                'rincianTagihan', // Kirim rincian tagihan ke view
                'imageBase64', // Kirim Base64 ke view
                'dataPasien', // Kirim data pasien ke view
                'tanggalMasuk',
                'tanggalKeluar',
                'ruangan',
                'penjamin',
                'dataPembayaran',
                'qrcode_petugas', // Kirim QR code petugas ke view
                'nama_petugas', // Kirim nama petugas ke view
            ))->render()
        );
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $pdf = $dompdf->output();

        return response($pdf, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="Tagihan.pdf"');
    }

    public function previewBerkasKlaim(Pendaftaran $pendaftaran)
    {
        return response()->json($pendaftaran, 200, [], JSON_PRETTY_PRINT);
    }

    public function previewLaboratorium(PengajuanKlaim $pengajuanKlaim)
    {
        $pasien = Pasien::where('NORM', $pengajuanKlaim->NORM)->first();
        $dataLaboratorium = Laboratorium::where('pengajuan_klaim_id', $pengajuanKlaim->id)
            ->with('hasilLaboratorium.parameterTindakanLab')
            ->get()
            ->map(function ($tindakan) {
                $dataKunjungan = Kunjungan::where('NOMOR', $tindakan->kunjungan_id)->first();
                $dataPendaftaran = Pendaftaran::where('NOMOR', $dataKunjungan->NOPEN)->first();
                $getRuanganPerujuk = Kunjungan::where('NOPEN', $dataKunjungan->NOPEN)
                    ->with('ruangan')
                    ->get();
                foreach ($getRuanganPerujuk as $ruangan) {
                    if (in_array($ruangan->ruangan->JENIS_KUNJUNGAN, [1, 2, 3, 17])) {
                        $ruanganPerujuk = $ruangan->ruangan->DESKRIPSI ?? 'Tidak ada nama ruangan';
                    }
                }
                $dataPegawai = Pengguna::where('ID', $tindakan->oleh)->first();
                $qrcodeBase64 = 'data:image/png;base64,' . base64_encode(
                    QrCode::format('png')->size(150)->generate($dataPegawai->NAMA ?? 'Tidak ada nama pasien')
                );
                $dokterPJ = "dr. YUSRON ABDURROHMAN";
                $qrcodeBase64DokterPJ = 'data:image/png;base64,' . base64_encode(
                    QrCode::format('png')->size(150)->generate($dokterPJ)
                );
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
                    'DATA_KUNJUNGAN' => $dataKunjungan,
                    'DATA_PENDAFTARAN' => $dataPendaftaran,
                    'RUANGAN_PERUJUK' => $ruanganPerujuk ?? 'Tidak ada nama ruangan',
                    'NAMA_PEGAWAI' => $dataPegawai->NAMA,
                    'QRCODE_PEGAWAI' => $qrcodeBase64,
                    'NAMA_DOKTER' => $dokterPJ,
                    'QRCODE_DOKTER' => $qrcodeBase64DokterPJ,
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
            ->groupBy('kunjungan_id') // Group by kunjungan_id
            ->values();
        // dd($dataLaboratorium);

        $imagePath = public_path('images/kop.png'); // Path ke gambar di folder public
        if (!file_exists($imagePath)) {
            throw new \Exception("Gambar tidak ditemukan di path: $imagePath");
        }
        $imageData = base64_encode(file_get_contents($imagePath)); // Konversi ke Base64
        $imageBase64 = 'data:image/png;base64,' . $imageData; // Tambahkan prefix Base64


        $dompdf = new Dompdf();
        $dompdf->loadHtml(
            view('eklaim.Laboratorium', compact(
                'pasien', // Kirim data pasien ke view
                'dataLaboratorium', // Kirim data laboratorium ke view
                'imageBase64', // Kirim Base64 ke view
                // 'qrcodeBase64', // Kirim Base64 QR Code ke view
                // 'ruanganPerujuk', // Kirim nama perujuk ke view
                // 'dataKunjungan',
                // 'dataPegawai',
                // 'dokterPJ',
                // 'qrcodeBase64DokterPJ', // Kirim QR Code Dokter PJ ke view
            ))->render()
        );
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $pdf = $dompdf->output();

        return response($pdf, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="Laboratorium.pdf"');
    }

    public function previewRadiologi(PengajuanKlaim $pengajuanKlaim)
    {
        $pasien = Pasien::where('NORM', $pengajuanKlaim->NORM)->first();
        $dataRadiologi = Radiologi::where('id_pengajuan_klaim', $pengajuanKlaim->id)
            ->with([
                'tindakanRadiologi',
                'dokter',
                'petugas'
            ])
            ->get();
        $dataRadiologi = $dataRadiologi->map(function ($item) {
            // Misal QR code untuk nama dokter, bisa diganti sesuai kebutuhan
            $gelarDepanDokter = $item->dokter->GELAR_DEPAN ? trim($item->dokter->GELAR_DEPAN) . '.' : '';
            $gelarBelakangDokter = $item->dokter->GELAR_BELAKANG ? ', ' . trim($item->dokter->GELAR_BELAKANG) : '';
            $gelarDepanPetugas = $item->petugas->GELAR_DEPAN ? trim($item->petugas->GELAR_DEPAN) . '.' : '';
            $gelarBelakangPetugas = $item->petugas->GELAR_BELAKANG ? ', ' . trim($item->petugas->GELAR_BELAKANG) : '';

            $namaDokter = trim($gelarDepanDokter . ' ' . $item->dokter->NAMA . $gelarBelakangDokter) ?? 'Tidak ada nama dokter';
            $namaPetugas = trim($gelarDepanPetugas . ' ' . $item->petugas->NAMA . $gelarBelakangPetugas) ?? 'Tidak ada nama petugas';
            $item->qrcodeDokter = 'data:image/png;base64,' . base64_encode(
                QrCode::format('png')->size(100)->generate($namaDokter)
            );
            $item->qrcodePetugas = 'data:image/png;base64,' . base64_encode(
                QrCode::format('png')->size(100)->generate($namaPetugas)
            );
            $item->dokter_nama = $namaDokter;
            $item->petugas_nama = $namaPetugas;
            return $item;
        });
        $dataKunjungan = Kunjungan::where('NOMOR', $dataRadiologi[0]->nomor_kunjungan)->first();

        $imagePath = public_path('images/kop.png'); // Path ke gambar di folder public
        if (!file_exists($imagePath)) {
            throw new \Exception("Gambar tidak ditemukan di path: $imagePath");
        }
        $imageData = base64_encode(file_get_contents($imagePath)); // Konversi ke Base64
        $imageBase64 = 'data:image/png;base64,' . $imageData; // Tambahkan prefix Base64

        $dompdf = new Dompdf();
        $dompdf->loadHtml(
            view('eklaim.Radiologi', compact(
                'pasien',
                'dataRadiologi',
                'dataKunjungan',
                'imageBase64', // Kirim Base64 ke view
            ))->render()
        );
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $pdf = $dompdf->output();

        return response($pdf, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="Radiologi.pdf"');
    }
}
