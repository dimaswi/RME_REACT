<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Master\Pasien;
use App\Models\Pendaftaran\Pendaftaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class KlaimController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $q = $request->input('q');

        $query = Pasien::query();

        if ($q) {
            $query->where(function ($sub) use ($q) {
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

        // Mengambil data pengajuan klaim untuk pasien
        $pengajuanKlaim = $pasien->pengajuanKlaim()->get();

        // Menambahkan data kunjungan
        $kunjungan = Pendaftaran::where('NORM', $pasien->NORM)
            ->with([
                'penjamin.kunjunganBPJS',
                'pasien',
                'riwayatKunjungan.ruangan'

            ])
            ->get();

        return Inertia::render('eklaim/klaim/show', [
            'pasien' => $pasien,
            'pengajuan_klaim' => $pengajuanKlaim,
            'klaimFilter' => [
                'q' => $q,
            ],
            'kunjungan' => $kunjungan, // tambahkan data kunjungan ke view
        ]);
    }

    public function storePengajuanKlaim(Request $request)
    {
        $pasien = Pasien::where('NORM', $request->input('NORM'))->firstOrFail();
        // dd($request->all());
        PengajuanKlaim::create([
            'NORM' => $request->input('NORM'),
            'nomor_pendaftaran' => $request->input('nomor_pendaftaran'),
            'nomor_SEP' => $request->input('nomor_SEP'),
            'status' => 0,
            'petugas' => Auth::user()->nama,
            'request' => json_encode($request->input('request')), // pastikan tersimpan sebagai JSON
            'tanggal_pengajuan' => now(),
        ]);

        return redirect()->back()->with('success', 'Pengajuan klaim berhasil dibuat.');
    }

    public function dataKlaim(PengajuanKlaim $dataKlaim)
    {
        $pasien = Pasien::where('NORM', $dataKlaim->NORM)->firstOrFail();
        $dataPendaftaran = Pendaftaran::where('NOMOR', $dataKlaim->nomor_pendaftaran)->with('pasienPulang')->firstOrFail();
        return Inertia::render('eklaim/klaim/dataKlaim', [
            'dataKlaim' => $dataKlaim,
            'pasien' => $pasien,
            'dataPendaftaran' => $dataPendaftaran,
        ]);
    }
}
