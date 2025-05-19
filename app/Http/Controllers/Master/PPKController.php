<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\PPK;
use Illuminate\Http\Request;

class PPKController extends Controller
{
    public function DataPPK()
    {
        // Ambil hanya rumah sakit aktif (misal JENIS = 1 untuk RS, STATUS = 1 untuk aktif)
        $ppk = PPK::where('JENIS', 1)->where('STATUS', 1)->orderBy('NAMA')->get(['ID', 'NAMA']);
        return response()->json($ppk);
    }
}
