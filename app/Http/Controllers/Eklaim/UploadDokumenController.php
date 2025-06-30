<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Inacbg\InacbgController;
use App\Models\Eklaim\LogKlaim;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Master\Pasien;
use App\Models\Pendaftaran\Pendaftaran;
use DB;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UploadDokumenController extends Controller
{
    public function uploadDokumen(Request $request, PengajuanKlaim $pengajuanKlaim)
    {
        try {
            $file = $request->file('file');
            $file_class = $request->input('file_class');
            $file_name = $request->input('file_class') . ".pdf";
            $pasien = Pasien::where('NORM', $pengajuanKlaim->NORM)->firstOrFail();
            $dataPendaftaran = Pendaftaran::where('NOMOR', $pengajuanKlaim->nomor_pendaftaran)->with('pasienPulang')->firstOrFail();
            $base64File = null;
            if ($file) {
                $base64File = base64_encode(file_get_contents($file->getRealPath()));
            }

            if (!$base64File) {
                return response()->json(['error' => 'File not found or empty'], 400);
            }

            $metadata = [
                "method" => "file_upload",
                "nomor_sep" => $pengajuanKlaim->nomor_SEP,
                "file_class" => $file_class,
                "file_name" => $file_name,
            ];

            $data = [
                "data" => $base64File,
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
                if ($send['metadata']['code'] != 200) {
                    // ... logging ...
                    return response()->json([
                        'success' => false,
                        'message' => 'Gagal pada eklaim: ' . $send['metadata']['message'],
                    ], 400);
                }
            }

            LogKlaim::create([
                'nomor_SEP' => $pengajuanKlaim->nomor_SEP,
                'method' => json_encode($metadata),
                'request' => json_encode($data),
                'response' => json_encode($send),
            ]);

            DB::connection('eklaim')->commit();
            return response()->json([
                'success' => true,
                'message' => 'Dokumen berhasil diunggah',
            ]);
        } catch (\Throwable $th) {
            DB::connection('eklaim')->rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengunggah dokumen: ' . $th->getMessage() . ' in ' . $th->getFile() . ' on line ' . $th->getLine(),
            ], 400);
        }
    }
}
