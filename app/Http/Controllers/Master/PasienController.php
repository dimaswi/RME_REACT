<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\Pasien;
use App\Models\Master\Referensi;
use App\Models\Master\Wilayah;
use App\Models\Master\Negara;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PasienController extends Controller
{
    public function index()
    {
        $search = request()->search ?? '';

        // Query pasien dengan pencarian dan pagination
        $pasiens = Pasien::query()
            ->leftJoin('wilayah as kel', 'pasien.wilayah', '=', 'kel.ID')
            ->leftJoin('wilayah as kec', DB::raw('LEFT(pasien.WILAYAH, 6)'), '=', 'kec.ID')
            ->leftJoin('wilayah as kab', DB::raw('LEFT(pasien.WILAYAH, 4)'), '=', 'kab.ID')
            ->leftJoin('wilayah as prov', DB::raw('LEFT(pasien.WILAYAH, 4)'), '=', 'prov.ID')
            ->select(
                'NORM',
                'NAMA',
                'TANGGAL_LAHIR',
                'TANGGAL',
                'JENIS_KELAMIN',
                'ALAMAT',
                'TEMPAT_LAHIR',
                'RT',
                'RW',
                'kel.DESKRIPSI as KELURAHAN',
                'kec.DESKRIPSI as KECAMATAN',
                'kab.DESKRIPSI as KABUPATEN',
                'prov.DESKRIPSI as PROVINSI',
            )
            ->when($search, function ($query, $search) {
                $query->where('NAMA', 'like', "%{$search}%")
                    ->orWhere('NORM', 'like', "%{$search}%");
            })
            ->orderBy('TANGGAL', 'DESC')
            ->paginate(request()->itemsPerPage ?? 10) // Pagination dengan jumlah item per halaman
            ->withQueryString(); // Menyimpan query string untuk pagination

        return Inertia::render('master/pasien/index', [
            'pasiens' => $pasiens,
            'filters' => [
                'search' => $search,
                'itemsPerPage' => request()->itemsPerPage ?? 10,
            ],
        ]);
    }

    public function detail(Pasien $pasien)
    {
        $data_pasien = Pasien::query()
            ->where('pasien.NORM', $pasien->NORM)
            ->with([
                'keluargaPasien.hubungan',
                'kartuIdentitas.jenisKartuIdentitas',
                'agama',
                'pendidikan',
                'pekerjaan',
                'kawin',
                'golda',
                'riwayatPendaftaran.riwayatKunjungan.ruangan',
            ])
            ->leftJoin('wilayah as tempat_lahir', DB::raw('LEFT(pasien.WILAYAH, 4)'), '=', 'tempat_lahir.ID')
            ->leftJoin('wilayah as kel', 'pasien.wilayah', '=', 'kel.ID')
            ->leftJoin('wilayah as kec', DB::raw('LEFT(pasien.WILAYAH, 6)'), '=', 'kec.ID')
            ->leftJoin('wilayah as kab', DB::raw('LEFT(pasien.WILAYAH, 4)'), '=', 'kab.ID')
            ->leftJoin('wilayah as prov', DB::raw('LEFT(pasien.WILAYAH, 2)'), '=', 'prov.ID')
            ->select(
                'pasien.*',
                'kel.DESKRIPSI as KELURAHAN',
                'kec.DESKRIPSI as KECAMATAN',
                'kab.DESKRIPSI as KABUPATEN',
                'prov.DESKRIPSI as PROVINSI',
                'tempat_lahir.DESKRIPSI as TEMPAT_LAHIR',
            )
            ->firstOrFail();

        // dd($data_pasien);

        return Inertia::render('master/pasien/detail', [
            'pasien' => $data_pasien,
        ]);
    }

    public function create()
    {
        $tempatLahir = Wilayah::where('JENIS', 2)->orderBy('DESKRIPSI', 'asc')->get(['ID', 'DESKRIPSI']);
        $jenisKelamin = Referensi::where('JENIS', 2)->orderBy('DESKRIPSI', 'asc')->get(['ID', 'DESKRIPSI']);
        $agama = Referensi::where('JENIS', 1)->orderBy('DESKRIPSI')->get(['ID', 'DESKRIPSI']);
        $statusPerkawinan = Referensi::where('JENIS', 5)->orderBy('DESKRIPSI')->get(['ID', 'DESKRIPSI']);
        $pekerjaan = Referensi::where('JENIS', 4)->orderBy('DESKRIPSI')->get(['ID', 'DESKRIPSI']);
        $pendidikan = Referensi::where('JENIS', 3)->orderBy('DESKRIPSI')->get(['ID', 'DESKRIPSI']);
        $negara = Negara::orderBy('DESKRIPSI')->get(['ID', 'DESKRIPSI']);
        $statusIdentitas = Referensi::where('JENIS', 140)->orderBy('DESKRIPSI')->get(['ID', 'DESKRIPSI']);
        $statusAktif = Referensi::where('JENIS', 13)->orderBy('DESKRIPSI')->get(['ID', 'DESKRIPSI']);
        $golonganDarah = Referensi::where('JENIS', 6)->orderBy('DESKRIPSI')->get(['ID', 'DESKRIPSI']);

        return Inertia::render('master/pasien/create', [
            'tempatLahir' => $tempatLahir,
            'jenisKelamin' => $jenisKelamin,
            'agama' => $agama,
            'statusPerkawinan' => $statusPerkawinan,
            'pekerjaan' => $pekerjaan,
            'pendidikan' => $pendidikan,
            'negara' => $negara,
            'statusIdentitas' => $statusIdentitas,
            'statusAktif' => $statusAktif,
            'golonganDarah' => $golonganDarah,
        ]);
    }
}
