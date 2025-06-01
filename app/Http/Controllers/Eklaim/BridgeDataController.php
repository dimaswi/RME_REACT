<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\LogKlaim;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Pendaftaran\Pendaftaran;
use Dompdf\Dompdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PDO;

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
        try {
            $pendaftaran->load([
                'pasienPulang.kunjunganPasien.jadwalKontrol',
                'diagnosaPasien.namaDiagnosa',
                'prosedurPasien.namaProsedur',
                'pemeriksaanFisik',
                'pasien',
                'pasienPulang.keadaanPulang',
                'pasienPulang.caraPulang',
                'penjamin.jenisPenjamin',
                'riwayatKunjungan.rpp',
                'anamnesis',
                'pasienPulang.kunjunganPasien.ruangan',
                'pendaftaranTagihan.pembayaranTagihan',
                'riwayatKunjungan.ruangan',
                'riwayatKunjungan.tandaVital',
                'resumeMedis',
                'pasienPulang',
            ]);

            // dd($pendaftaran->riwayatKunjungan->ttv);

            // Ubah gambar menjadi Base64
            $imagePath = public_path('images/kop.png'); // Path ke gambar di folder public
            if (!file_exists($imagePath)) {
                throw new \Exception("Gambar tidak ditemukan di path: $imagePath");
            }
            $imageData = base64_encode(file_get_contents($imagePath)); // Konversi ke Base64
            $imageBase64 = 'data:image/png;base64,' . $imageData; // Tambahkan prefix Base64


            $dompdf = new Dompdf();
            $dompdf->loadHtml(
                view('eklaim.ResumeMedis', compact(
                    'pendaftaran',
                    'imageBase64' // Kirim Base64 ke view
                ))->render()
            );
            $dompdf->setPaper('A4', 'portrait');
            $dompdf->render();
            $pdf = $dompdf->output();

            return response($pdf, 200)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'inline; filename="ResumeMedis.pdf"');
        } catch (\Throwable $th) {
            return redirect()->back()->with([
                'error' => 'Gagal membuat preview Resume Medis: ' . $th->getMessage(),
            ]);
        }
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
