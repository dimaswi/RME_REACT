<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Pendaftaran\Pendaftaran;
use Illuminate\Http\Request;
use PDO;

class BridgeDataController extends Controller
{
    public function loadDataResumeMedis(Pendaftaran $pendaftaran)
    {
        dd($pendaftaran);
        return response()->json("Resume Medis");
    }

    public function loadDataTagihan(Pendaftaran $pendaftaran)
    {
        return response()->json("Tagihan");
    }

    public function downloadSEP(Pendaftaran $pendaftaran)
    {

    }

    public function downloadResumeMedis(Pendaftaran $pendaftaran)
    {

    }

    public function downloadTagihan(Pendaftaran $pendaftaran)
    {

    }

    public function downloadBerkasKlaim(Pendaftaran $pendaftaran)
    {

    }
}
