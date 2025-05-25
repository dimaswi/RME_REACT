<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Master\Pasien;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KlaimController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $q = $request->input('q');

        $query = Pasien::query();

        if ($q) {
            $query->where(function($sub) use ($q) {
                $sub->where('NAMA', 'like', "%$q%")
                    ->orWhere('NORM', 'like', "%$q%")
                    ->orWhere('ALAMAT', 'like', "%$q%");
            });
        }

        $dataPendaftaran = $query
            ->orderByDesc('NORM')
            ->paginate($perPage, ['NORM', 'NAMA', 'ALAMAT'])
            ->withQueryString();

        return Inertia::render('eklaim/klaim/index', [
            'dataPendaftaran' => $dataPendaftaran,
            'filters' => [
                'q' => $q,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function show(Request $request, $pasien)
    {
        $q = $request->input('q');
        $pasien = \App\Models\Master\Pasien::where('NORM', $pasien)->firstOrFail();

        // Filter pengajuan klaim jika ada pencarian
        $pengajuanKlaimQuery = $pasien->pengajuanKlaim();
        if ($q) {
            $pengajuanKlaimQuery->where(function($query) use ($q) {
                $query->where('no_klaim', 'like', "%$q%")
                      ->orWhere('status', 'like', "%$q%");
            });
        }
        $pengajuanKlaim = $pengajuanKlaimQuery->get();

        return Inertia::render('eklaim/klaim/show', [
            'pasien' => $pasien,
            'pengajuan_klaim' => $pengajuanKlaim,
            'klaimFilter' => [
                'q' => $q,
            ],
        ]);
    }
}
