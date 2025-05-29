<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\LogKlaim;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Pendaftaran\Pendaftaran;
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
        $pendaftaran->load(['penjamin.kunjunganBPJS.dokterDPJP', 'penjamin.kunjunganBPJS.poliTujuan', 'penjamin.kunjunganBPJS.faskesPerujuk', 'penjamin.kunjunganBPJS.dataPeserta']);
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
        $pendaftaran->load(['penjamin.kunjunganBPJS.dokterDPJP', 'penjamin.kunjunganBPJS.poliTujuan', 'penjamin.kunjunganBPJS.faskesPerujuk', 'penjamin.kunjunganBPJS.dataPeserta']);
        return response()->json($pendaftaran, 200, [], JSON_PRETTY_PRINT);
    }

    public function previewResumeMedis(Pendaftaran $pendaftaran)
    {
        $pendaftaran->load(['pemeriksaanFisik', 'pasien','penjamin.jenisPenjamin', 'riwayatKunjungan.rpp' ,'anamnesis' ,'pasienPulang.kunjunganPasien.ruangan', 'pendaftaranTagihan.pembayaranTagihan', 'riwayatKunjungan.ruangan', 'resumeMedis']);
        return response()->json($pendaftaran, 200, [], JSON_PRETTY_PRINT);
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
