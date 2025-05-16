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

    public function create(Request $request)
    {
        // Data awal untuk render form
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
        $provinsi = Wilayah::where('JENIS', 1)->orderBy('DESKRIPSI')->get(['ID', 'DESKRIPSI']);
        $jenisKontak = Referensi::where('JENIS', 8)->orderBy('DESKRIPSI')->get(['ID', 'DESKRIPSI']);
        $jenisIdentitas = Referensi::where('JENIS', 9)->orderBy('DESKRIPSI')->get(['ID', 'DESKRIPSI']);
        $hubunganKeluarga = Referensi::where('JENIS', 7)->orderBy('DESKRIPSI')->get(['ID', 'DESKRIPSI']);

        // Jika partial reload wilayah
        $wilayah = null;
        if ($request->has('jenis')) {
            $jenis = $request->input('jenis');
            $parent = $request->input('parent');
            $query = Wilayah::where('JENIS', $jenis);
            if ($parent) {
                if ($jenis == 2) $query->where('ID', 'like', $parent . '%');
                if ($jenis == 3) $query->where('ID', 'like', $parent . '%');
                if ($jenis == 4) $query->where('ID', 'like', $parent . '%');
            }
            $wilayah = $query->orderBy('DESKRIPSI')->get(['ID', 'DESKRIPSI']);
        }

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
            'provinsi' => $provinsi,
            'jenisKontak' => $jenisKontak,
            'jenisIdentitas' => $jenisIdentitas,
            'hubunganKeluarga' => $hubunganKeluarga,
            'wilayah' => $wilayah, // akan null jika bukan partial reload
        ]);
    }

    public function store(Request $request)
{
    // Validasi data (contoh, sesuaikan rules sesuai kebutuhan)
    $validated = $request->validate([
        'nama' => 'required|string|max:255',
        'tempat_lahir' => 'required',
        'tanggal_lahir' => 'required|date',
        'jenis_kelamin' => 'required',
        'agama' => 'required',
        'status_perkawinan' => 'required',
        'pendidikan' => 'required',
        'pekerjaan' => 'required',
        'golongan_darah' => 'nullable',
        'negara' => 'required',
        'status_identitas' => 'nullable',
        'status_aktif' => 'nullable',

        // Alamat Pasien
        'alamat_pasien' => 'required',
        'rukun_tetangga' => 'required',
        'rukun_warga' => 'required',
        'kode_pos' => 'required',
        'alamat_provinsi' => 'required',
        'alamat_kabupaten' => 'required',
        'alamat_kecamatan' => 'required',
        'alamat_kelurahan' => 'required',

        // Kartu Identitas Pasien
        'jenis_identitas' => 'required',
        'nomor_identitas' => 'required',
        'kartu_alamat_pasien' => 'required',
        'kartu_rukun_tetangga' => 'required',
        'kartu_rukun_warga' => 'required',
        'kartu_kode_pos' => 'required',
        'kartu_alamat_provinsi' => 'required',
        'kartu_alamat_kabupaten' => 'required',
        'kartu_alamat_kecamatan' => 'required',
        'kartu_alamat_kelurahan' => 'required',

        // Kontak Pasien
        'jenis_kontak' => 'required',
        'telepon_pasien' => 'required',

        // Keluarga Pasien
        'hubungan_keluarga' => 'required',
        'nama_keluarga' => 'required',
        'tanggal_lahir_keluarga' => 'required|date',
        'jenis_kelamin_keluarga' => 'required',
        'pendidikan_keluarga' => 'required',
        'pekerjaan_keluarga' => 'required',
        'jenis_kontak_keluarga' => 'required',
        'telepon_keluarga' => 'required',
        'jenis_identitas_keluarga' => 'required',
        'nomor_identitas_keluarga' => 'required',
        'alamat_keluarga' => 'required',
        'rukun_tetangga_keluarga' => 'required',
        'rukun_warga_keluarga' => 'required',
        'kode_pos_keluarga' => 'required',
        'alamat_provinsi_keluarga' => 'required',
        'alamat_kabupaten_keluarga' => 'required',
        'alamat_kecamatan_keluarga' => 'required',
        'alamat_kelurahan_keluarga' => 'required',
    ]);

    // Simpan data ke tabel pasien (contoh, sesuaikan field dan relasi)
    // $pasien = Pasien::create([
    //     'NAMA' => $validated['nama'],
    //     'TEMPAT_LAHIR' => $validated['tempat_lahir'],
    //     'TANGGAL_LAHIR' => $validated['tanggal_lahir'],
    //     'JENIS_KELAMIN' => $validated['jenis_kelamin'],
    //     'AGAMA' => $validated['agama'],
    //     'STATUS_PERKAWINAN' => $validated['status_perkawinan'],
    //     'PENDIDIKAN' => $validated['pendidikan'],
    //     'PEKERJAAN' => $validated['pekerjaan'],
    //     'GOLONGAN_DARAH' => $validated['golongan_darah'] ?? null,
    //     'NEGARA' => $validated['negara'],
    //     'STATUS_IDENTITAS' => $validated['status_identitas'] ?? null,
    //     'STATUS_AKTIF' => $validated['status_aktif'] ?? null,

    //     // Alamat
    //     'ALAMAT' => $validated['alamat_pasien'],
    //     'RT' => $validated['rukun_tetangga'],
    //     'RW' => $validated['rukun_warga'],
    //     'KODE_POS' => $validated['kode_pos'],
    //     'PROVINSI' => $validated['alamat_provinsi'],
    //     'KABUPATEN' => $validated['alamat_kabupaten'],
    //     'KECAMATAN' => $validated['alamat_kecamatan'],
    //     'KELURAHAN' => $validated['alamat_kelurahan'],

    //     // Kartu Identitas
    //     'JENIS_IDENTITAS' => $validated['jenis_identitas'],
    //     'NOMOR_IDENTITAS' => $validated['nomor_identitas'],
    //     'KARTU_ALAMAT' => $validated['kartu_alamat_pasien'],
    //     'KARTU_RT' => $validated['kartu_rukun_tetangga'],
    //     'KARTU_RW' => $validated['kartu_rukun_warga'],
    //     'KARTU_KODE_POS' => $validated['kartu_kode_pos'],
    //     'KARTU_PROVINSI' => $validated['kartu_alamat_provinsi'],
    //     'KARTU_KABUPATEN' => $validated['kartu_alamat_kabupaten'],
    //     'KARTU_KECAMATAN' => $validated['kartu_alamat_kecamatan'],
    //     'KARTU_KELURAHAN' => $validated['kartu_alamat_kelurahan'],

    //     // Kontak
    //     'JENIS_KONTAK' => $validated['jenis_kontak'],
    //     'TELEPON' => $validated['telepon_pasien'],

    //     // Keluarga
    //     'HUBUNGAN_KELUARGA' => $validated['hubungan_keluarga'],
    //     'NAMA_KELUARGA' => $validated['nama_keluarga'],
    //     'TANGGAL_LAHIR_KELUARGA' => $validated['tanggal_lahir_keluarga'],
    //     'JENIS_KELAMIN_KELUARGA' => $validated['jenis_kelamin_keluarga'],
    //     'PENDIDIKAN_KELUARGA' => $validated['pendidikan_keluarga'],
    //     'PEKERJAAN_KELUARGA' => $validated['pekerjaan_keluarga'],
    //     'JENIS_KONTAK_KELUARGA' => $validated['jenis_kontak_keluarga'],
    //     'TELEPON_KELUARGA' => $validated['telepon_keluarga'],
    //     'JENIS_IDENTITAS_KELUARGA' => $validated['jenis_identitas_keluarga'],
    //     'NOMOR_IDENTITAS_KELUARGA' => $validated['nomor_identitas_keluarga'],
    //     'ALAMAT_KELUARGA' => $validated['alamat_keluarga'],
    //     'RT_KELUARGA' => $validated['rukun_tetangga_keluarga'],
    //     'RW_KELUARGA' => $validated['rukun_warga_keluarga'],
    //     'KODE_POS_KELUARGA' => $validated['kode_pos_keluarga'],
    //     'PROVINSI_KELUARGA' => $validated['alamat_provinsi_keluarga'],
    //     'KABUPATEN_KELUARGA' => $validated['alamat_kabupaten_keluarga'],
    //     'KECAMATAN_KELUARGA' => $validated['alamat_kecamatan_keluarga'],
    //     'KELURAHAN_KELUARGA' => $validated['alamat_kelurahan_keluarga'],
    // ]);

    // Simpan data kartu identitas pasien (jika ada relasi, gunakan relasi)
    // Contoh: $pasien->kartuIdentitas()->create([...]);
    // Simpan data keluarga pasien (jika ada relasi, gunakan relasi)
    // Contoh: $pasien->keluargaPasien()->create([...]);

    // Redirect atau response sukses
    return redirect()->route('master.pasiens.index')->with('success', 'Data pasien berhasil disimpan.');
}
}
