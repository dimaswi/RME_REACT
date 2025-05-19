<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\RuangKamar;
use Illuminate\Http\Request;

class BedController extends Controller
{
    public function DataKamarTidur()
    {
        $kamar = RuangKamar::with([
                'ruangKamarTidur' => function($q) {
                    $q->where('STATUS', '!=', 0);
                },
                'ruangan'
            ])
            ->where('STATUS', '!=', 0)
            ->get()
            ->map(function($kamar) {
                return [
                    'id' => $kamar->ID,
                    'ruangan' => $kamar->RUANGAN,
                    'nama_ruangan' => $kamar->ruangan ? $kamar->ruangan->DESKRIPSI : null,
                    'nama_kamar' => $kamar->KAMAR,
                    'beds' => $kamar->ruangKamarTidur->map(function($bed) {
                        return [
                            'id' => $bed->ID,
                            'nama' => $bed->TEMPAT_TIDUR,
                            'status' => $bed->STATUS, // 1=terisi, 3=kosong
                        ];
                    })->values(),
                ];
            })->values();
        return response()->json($kamar);
    }
}
