<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pembayaran\TransaksiKasir;
use Inertia\Inertia;

class PendapatanKasirController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);

        $transaksiKasir = TransaksiKasir::with('kasir')
            ->orderByDesc('BUKA')
            ->paginate($perPage)
            ->through(function ($item) {
                return [
                    'NOMOR' => $item->NOMOR,
                    'nama_kasir' => $item->kasir ? $item->kasir->NAMA : '-',
                    'buka' => $item->BUKA,
                    'tutup' => $item->TUTUP,
                    'total' => $item->TOTAL,
                    'status' => $item->STATUS,
                ];
            });

        return Inertia::render('keuangan/pendapatan/kasir/index', [
            'transaksiKasir' => $transaksiKasir,
        ]);
    }
}
