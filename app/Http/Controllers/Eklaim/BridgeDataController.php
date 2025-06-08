<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\LogKlaim;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Pendaftaran\Kunjungan;
use App\Models\Pendaftaran\Pendaftaran;
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
            "nomor_sep" => (string)$nomor_sep,
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
            ]);
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
        return response($pdf, 200)
            ->header('Content-Type', 'application/pdf');
    }

    public function downloadLaboratorium(Pendaftaran $pendaftaran)
    {
        return response()->json($pendaftaran, 200, [], JSON_PRETTY_PRINT);
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
            'kunjunganPasien.dokterDPJP',
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

        $hasilKonsultasi = $kunjunganRawatInap->permintaanKonsul
            ->flatMap(function ($konsul) {
                return $konsul->jawabanKonsul ? $konsul->jawabanKonsul->pluck('JAWABAN') : collect();
            })
            ->map(function ($jawaban) {
                return strip_tags(html_entity_decode($jawaban));
            })
            ->implode(', ') ?: 'Tidak ada data hasil konsultasi';

        $diagnosaUtama = $kunjunganRawatInap->pendaftaranPasien->diagnosaPasien
            ? $kunjunganRawatInap->pendaftaranPasien->diagnosaPasien
            ->flatMap(function ($diagnosa) {
                return $diagnosa->namaDiagnosa ? [$diagnosa->namaDiagnosa->STR] : [];
            })->implode(', ')
            : 'Tidak ada data diagnosa';

        $icd10DiagnosaUtama = $kunjunganRawatInap->pendaftaranPasien->diagnosaPasien
            ? $kunjunganRawatInap->pendaftaranPasien->diagnosaPasien
            ->flatMap(function ($diagnosa) {
                return $diagnosa->namaDiagnosa ? [$diagnosa->namaDiagnosa->CODE] : [];
            })->implode(', ')
            : 'Tidak ada data diagnosa';

        $jenisKelamin = $kunjunganRawatInap->pendaftaranPasien->pasien->JENIS_KELAMIN === 1
            ? 'Laki-laki'
            : ($kunjunganRawatInap->pendaftaranPasien->pasien->JENIS_KELAMIN === 2
                ? 'Perempuan'
                : 'Tidak ada data jenis kelamin');

        $terapiPulang = $kunjunganRawatInap->orderResepPulang
            ? $kunjunganRawatInap->orderResepPulang
            ->flatMap(function ($orderResep) {
                return $orderResep->orderResepDetil
                    ? $orderResep->orderResepDetil->map(function ($resep) {
                        return [
                            'nama_obat' => $resep->namaObat->NAMA ?? 'Tidak ada data nama obat',
                            'frekuensi' => $resep->frekuensiObat->KETERANGAN ?? 'Tidak ada data aturan pakai',
                            'cara_pakai' => $resep->caraPakai->DESKRIPSI ?? 'Tidak ada data cara pakai',
                        ];
                    })
                    : collect();
            })
            ->toArray()
            : [];

        $resumeMedis = [
            'nama_pasien' => $kunjunganRawatInap->pendaftaranPasien->pasien->NAMA ?? 'Tidak ada data nama pasien',
            'no_rm' => $kunjunganRawatInap->pendaftaranPasien->pasien->NORM ?? 'Tidak ada data nomor rekam medis',
            'ruang_rawat_terakhir' => $kunjunganUGD->ruangan->DESKRIPSI ?? 'Tidak ada data ruang rawat',
            'jenis_kelamin' => $jenisKelamin,
            'tanggal_lahir' => $kunjunganRawatInap->pendaftaranPasien->pasien->TANGGAL_LAHIR ?? 'Tidak ada data tanggal lahir',
            'tanggal_masuk' => $kunjunganRawatInap->MASUK ?? 'Tidak ada data tanggal masuk',
            'tanggal_keluar' => $kunjunganRawatInap->KELUAR ?? 'Tidak ada data tanggal keluar',
            'ruang_rawat_terakhir' => $kunjunganUGD->ruangan->DESKRIPSI ?? 'Tidak ada data ruang rawat',
            'penjamin' => $kunjunganRawatInap->pendaftaranPasien->penjamin->jenisPenjamin->DESKRIPSI ?? 'Tidak ada data penjamin',
            'indikasi_rawat_inap' =>  $kunjunganRawatInap->pendaftaranPasien->resumeMedis->INDIKASI_RAWAT_INAP ?? 'Tidak ada data indikasi rawat inap',
            'riwayat_penyakit_sekarang' => $kunjunganRawatInap->keluhanUtama->DESKRIPSI ?? 'Tidak ada data riwayat penyakit sekarang',
            'riwayat_penyakit_dahulu' => $kunjunganRawatInap->rpp->DESKRIPSI ?? 'Tidak ada data ringkasan penyakit dahulu',
            'pemeriksaan_fisik' => $kunjunganRawatInap->pemeriksaanFisik->DESKRIPSI ?? 'Tidak ada data pemeriksaan fisik',
            'hasil_konsultasi' => $hasilKonsultasi,
            'diagnosa_utama' => $diagnosaUtama,
            'icd_10_diagnosa_utama' => $icd10DiagnosaUtama,
            'prosedur_utama' => $kunjunganRawatInap->pendaftaranPasien->prosedurPasien->pluck('TINDAKAN')->implode(', ') ?? 'Tidak ada data prosedur',
            'icd_9_prosedur_utama' => $kunjunganRawatInap->pendaftaranPasien->prosedurPasien->pluck('KODE')->implode(', ') ?? 'Tidak ada data prosedur',
            'keadaan_pulang' => $kunjunganRawatInap->pasienPulang->keadaanPulang->DESKRIPSI ?? 'Tidak ada data keadaan pulang',
            'cara_pulang' => $kunjunganRawatInap->pasienPulang->caraPulang->DESKRIPSI ?? 'Tidak ada data cara pulang',
            'tekanan_darah' => $kunjunganRawatInap->tandaVital->SISTOLIK . "/" . $kunjunganRawatInap->tandaVital->DISTOLIK ?? 'Tidak ada data tekanan darah',
            'nadi' => $kunjunganRawatInap->tandaVital->FREKUENSI_NADI ?? 'Tidak ada data nadi',
            'suhu' => $kunjunganRawatInap->tandaVital->SUHU ?? 'Tidak ada data suhu',
            'pernafasan' => $kunjunganRawatInap->tandaVital->FREKUENSI_NAFAS ?? 'Tidak ada data pernafasan',
            'kesadaran' => $kunjunganRawatInap->tandaVital->tingkatKesadaran->DESKRIPSI ?? 'Tidak ada data kesadaran',
            'skala_nyeri' => $kunjunganRawatInap->tandaVital->SKALA_NYERI ?? 'Tidak ada data skala nyeri',
            'terapi_pulang' => $terapiPulang,
            'nama_dokter' => $kunjunganRawatInap->dokterDPJP->GELAR_DEPAN . '.' . $kunjunganRawatInap->dokterDPJP->NAMA . '' . $kunjunganRawatInap->dokterDPJP->GELAR_BELAKANG ?? 'Tidak ada data nama dokter',
            'nip_dokter' => $kunjunganRawatInap->dokterDPJP->NIP ?? 'Tidak ada data NIP dokter',

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

        // return response($pdf, 200)
        //     ->header('Content-Type', 'application/pdf')
        //     ->header('Content-Disposition', 'inline; filename="Triage.pdf"');

        return view('eklaim.Triage', compact(
            'triage',
            'imageBase64' // Kirim Base64 ke view
        ));
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
            'pendaftaranTagihan.gabungTagihan.kunjunganPasien.orderResep.orderResepDetil.namaObat',
            'pendaftaranTagihan.gabungTagihan.kunjunganPasien.riwayatPenyakitKeluarga',
            'pendaftaranTagihan.gabungTagihan.kunjunganPasien.tandaVital.tingkatKesadaran',
            'pendaftaranTagihan.gabungTagihan.kunjunganPasien.pemeriksaanFisik',
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
        ];

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
                // 'qrcodeBase64', // Kirim Base64 QR Code ke view
            ))->render()
        );
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $pdf = $dompdf->output();

        // return response($pdf, 200)
        //     ->header('Content-Type', 'application/pdf')
        //     ->header('Content-Disposition', 'inline; filename="PengkajianAwal.pdf"');

        return view('eklaim.PengkajianAwal', compact(
            'pengkajianAwal',
            'imageBase64' // Kirim Base64 ke view
        ));
    }

    public function previewTagihan(Pendaftaran $pendaftaran)
    {
        return response()->json($pendaftaran, 200, [], JSON_PRETTY_PRINT);
    }

    public function previewBerkasKlaim(Pendaftaran $pendaftaran)
    {
        return response()->json($pendaftaran, 200, [], JSON_PRETTY_PRINT);
    }

    public function previewLaboratorium(Pendaftaran $pendaftaran)
    {
        return response()->json($pendaftaran, 200, [], JSON_PRETTY_PRINT);
    }

    public function previewRadiologi(Pendaftaran $pendaftaran)
    {
        return response()->json($pendaftaran, 200, [], JSON_PRETTY_PRINT);
    }
}
