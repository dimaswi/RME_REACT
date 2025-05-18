<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\KartuIdentitasKeluarga;
use App\Models\Master\KartuIdentitasPasien;
use App\Models\Master\KeluargaPasiens;
use App\Models\Master\KontakKeluarga;
use App\Models\Master\KontakPasien;
use App\Models\Master\Pasien;
use App\Models\Master\Referensi;
use App\Models\Master\Wilayah;
use App\Models\Master\Negara;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
                'TIDAK_DIKENAL',
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
        if ($request->pasien_tidak_dikenal == true) {
            try {
                DB::connection('master')->beginTransaction();
                Pasien::create([
                    'NAMA' => $request->nama,
                    'TANGGAL_LAHIR' => Carbon::parse($request->tanggal_lahir)->format('Y-m-d H:i:s'),
                    'JENIS_KELAMIN' => $request->jenis_kelamin,
                    'TANGGAL' => now(),
                    'OLEH' => Auth::user()->id,
                    'TIDAK_DIKENAL' => 1,
                ]);
                DB::connection('master')->commit();
                // Untuk Inertia, gunakan Inertia::location agar redirect berjalan di SPA
                return redirect()->route('master.pasiens.index')->with('success', 'Data pasien berhasil disimpan.');
            } catch (\Exception $e) {
                DB::connection('master')->rollBack();
                // Kirim error ke frontend
                return back()->with('error', 'Gagal menyimpan data pasien: ' . $e->getMessage());
            }
        }

        try {
            $connectionDatabase = DB::connection('master');
            $connectionDatabase->beginTransaction();
            // Simpan data pasien baru
            $pasienBaru = Pasien::create([
                'NAMA' => $request->nama,
                'PANGGILAN' => $request->panggilan,
                'GELAR_DEPAN' => $request->gelar_depan,
                'GELAR_BELAKANG' => $request->gelar_belakang,
                'TEMPAT_LAHIR' => $request->tempat_lahir,
                'TANGGAL_LAHIR' => Carbon::parse($request->tanggal_lahir)->format('Y-m-d H:i:s'),
                'JENIS_KELAMIN' => $request->jenis_kelamin,
                'ALAMAT' => $request->alamat_pasien,
                'RT' => $request->rukun_tetangga,
                'RW' => $request->rukun_warga,
                'KODEPOS' => $request->kode_pos,
                'WILAYAH' => $request->alamat_kelurahan,
                'AGAMA' => $request->agama,
                'PENDIDIKAN' => $request->pendidikan,
                'PEKERJAAN' => $request->pekerjaan,
                'STATUS_PERKAWINAN' => $request->status_perkawinan,
                'GOLONGAN_DARAH' => $request->golongan_darah,
                'KEWARGANEGARAAN' => $request->negara,
                'SUKU' => $request->status_identitas,
                'TIDAK_DIKENAL' => 0, // Set default value
                'BAHASA' => $request->bahasa ?? 1,
                'LOCK_AKSES' => 0, // Set default value
                'TANGGAL' => now(),
                'OLEH' => Auth::user()->id,
                'STATUS' => 1, // Set default value
            ]);

            // Simpan data kontak pasien jika ada
            KontakPasien::create([
                'JENIS' => $request->jenis_kontak,
                'NORM' => $pasienBaru->NORM,
                'NOMOR' => $request->telepon_pasien,
            ]);

            // Simpan data kartu identitas pasien jika ada
            KartuIdentitasPasien::create([
                'JENIS' => $request->jenis_identitas,
                'NORM' => $pasienBaru->NORM,
                'NOMOR' => $request->nomor_identitas,
                'ALAMAT' => $request->kartu_alamat_pasien,
                'RT' => $request->kartu_rukun_tetangga,
                'RW' => $request->kartu_rukun_warga,
                'KODEPOS' => $request->kartu_kode_pos,
                'WILAYAH' => $request->kartu_alamat_kelurahan,
            ]);

            // Simpan data keluarga pasien jika ada
            if ($request->nama_keluarga != null) {
                $keluargaPasien =  KeluargaPasiens::create([
                    'SHDK' => $request->hubungan_keluarga,
                    'NORM' => $pasienBaru->NORM,
                    'JENIS_KELAMIN' => $request->jenis_kelamin_keluarga,
                    'NOMOR' => 1,
                    'NAMA'  => $request->nama_keluarga,
                    'ALAMAT' => $request->alamat_keluarga,
                    'PENDIDIKAN' => $request->pendidikan_keluarga ?? 0,
                    'PEKERJAAN' => $request->pekerjaan_keluarga ?? 0,
                    'TANGGAL_LAHIR' => Carbon::parse($request->tanggal_lahir_keluarga)->format('Y-m-d H:i:s') ?? '0000-00-00',
                ]);

                // Simpan data kontak keluarga jika ada
                if ($request->telepon_keluarga != null) {
                    KontakKeluarga::create([
                        'SHDK' => $request->hubungan_keluarga,
                        'JENIS' => $request->jenis_kontak_keluarga,
                        'NORM' => $pasienBaru->NORM,
                        'NOMOR' => $request->telepon_keluarga,
                    ]);
                }

                // Simpan data kartu identitas keluarga jika ada
                if ($request->nomor_identitas_keluarga != null) {
                    KartuIdentitasKeluarga::create([
                        'JENIS' => $request->a,
                        'KELUARGA_PASIEN_ID' => $keluargaPasien->ID,
                        'NOMOR' => $request->nomor_identitas_keluarga,
                        'ALAMAT' => $request->alamat_keluarga,
                        'RT' => $request->rukun_tetangga_keluarga,
                        'RW' => $request->rukun_warga_keluarga,
                        'KODEPOS' => $request->kode_pos_keluarga,
                        'WILAYAH' => $request->alamat_kelurahan_keluarga,
                    ]);
                }
            }

            $connectionDatabase->commit();
            return redirect()->route('master.pasiens.detail', ['pasien' => $pasienBaru->NORM])->with('success', 'Data pasien berhasil disimpan.');
        } catch (\Exception $e) {
            $connectionDatabase->rollBack();
            return back()->with('error', 'Gagal menyimpan data pasien: ' . $e->getMessage());
        }
    }

    public function edit(Pasien $pasien, Request $request)
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
        $kontakPasien = KontakPasien::where('NORM', $pasien->NORM)->first();
        $kartuIdentitasPasien = KartuIdentitasPasien::where('NORM', $pasien->NORM)->first();
        $keluargaPasien = KeluargaPasiens::where('NORM', $pasien->NORM)->first();
        $kartuIdentitasKeluarga = $keluargaPasien
            ? KartuIdentitasKeluarga::where('KELUARGA_PASIEN_ID', $keluargaPasien->ID)->first()
            : null;
        $kontakKeluarga = $keluargaPasien
            ? KontakKeluarga::where('SHDK', $keluargaPasien->SHDK)->where('NORM', $pasien->NORM)->first()
            : null;

        // Kirim data pasien ke edit.tsx
        return Inertia::render('master/pasien/edit', [
            'pasien' => $pasien,
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
            'kontakPasien' => $kontakPasien,
            'kartuIdentitasPasien' => $kartuIdentitasPasien,
            'keluargaPasien' => $keluargaPasien,
            'kartuIdentitasKeluarga' => $kartuIdentitasKeluarga,
            'kontakKeluarga' => $kontakKeluarga,
        ]);
    }

    public function update(Request $request, Pasien $pasien)
    {
        if ($request->pasien_tidak_dikenal == true) {
            try {
                DB::connection('master')->beginTransaction();
                $pasien->update([
                    'NAMA' => $request->nama,
                    'TANGGAL_LAHIR' => Carbon::parse($request->tanggal_lahir)->format('Y-m-d H:i:s'),
                    'JENIS_KELAMIN' => $request->jenis_kelamin,
                    'TANGGAL' => now(),
                    'OLEH' => Auth::user()->id,
                    'TIDAK_DIKENAL' => 1,
                ]);
                DB::connection('master')->commit();
                // Untuk Inertia, gunakan Inertia::location agar redirect berjalan di SPA
                return redirect()->route('master.pasiens.detail', ['pasien' => $pasien->NORM])->with('success', 'Data pasien berhasil disimpan.');
            } catch (\Exception $e) {
                DB::connection('master')->rollBack();
                // Kirim error ke frontend
                return back()->with('error', 'Gagal menyimpan data pasien: ' . $e->getMessage());
            }
        }

        try {
            $connectionDatabase = DB::connection('master');
            $connectionDatabase->beginTransaction();

            // Update data pasien
            $pasien->update([
                'NAMA' => $request->nama,
                'PANGGILAN' => $request->nama_panggilan,
                'GELAR_DEPAN' => $request->gelar_depan,
                'GELAR_BELAKANG' => $request->gelar_belakang,
                'TEMPAT_LAHIR' => $request->tempat_lahir,
                'TANGGAL_LAHIR' => $request->tanggal_lahir ? Carbon::parse($request->tanggal_lahir)->format('Y-m-d H:i:s') : null,
                'JENIS_KELAMIN' => $request->jenis_kelamin,
                'ALAMAT' => $request->alamat_pasien,
                'RT' => $request->rukun_tetangga,
                'RW' => $request->rukun_warga,
                'KODEPOS' => $request->kode_pos,
                'WILAYAH' => $request->alamat_kelurahan,
                'AGAMA' => $request->agama,
                'PENDIDIKAN' => $request->pendidikan,
                'PEKERJAAN' => $request->pekerjaan,
                'STATUS_PERKAWINAN' => $request->status_perkawinan,
                'GOLONGAN_DARAH' => $request->golongan_darah,
                'KEWARGANEGARAAN' => $request->negara,
                'SUKU' => $request->status_identitas,
                'STATUS' => $request->status_aktif,
            ]);

            // Update data kontak pasien jika ada
            $kontakPasien = KontakPasien::where('NORM', $pasien->NORM)->first();
            if ($kontakPasien) {
                $kontakPasien->update([
                    'JENIS' => $request->jenis_kontak,
                    'NOMOR' => $request->telepon_pasien,
                ]);
            } else {
                if ($request->telepon_pasien != null) {
                    KontakPasien::create([
                        'JENIS' => $request->jenis_kontak,
                        'NORM' => $pasien->NORM,
                        'NOMOR' => $request->telepon_pasien,
                    ]);
                }
            }

            // Update data kartu identitas pasien jika ada
            $kartuIdentitasPasien = KartuIdentitasPasien::where('NORM', $pasien->NORM)->first();
            if ($kartuIdentitasPasien) {
                $kartuIdentitasPasien->update([
                    'JENIS' => $request->jenis_identitas,
                    'NOMOR' => $request->nomor_identitas,
                    'ALAMAT' => $request->kartu_alamat_pasien,
                    'RT' => $request->kartu_rukun_tetangga,
                    'RW' => $request->kartu_rukun_warga,
                    'KODEPOS' => $request->kartu_kode_pos,
                    'WILAYAH' => $request->kartu_alamat_kelurahan,
                ]);
            } else {
                if ($request->nomor_identitas != null) {
                    KartuIdentitasPasien::create([
                        'JENIS' => $request->jenis_identitas,
                        'NORM' => $pasien->NORM,
                        'NOMOR' => $request->nomor_identitas,
                        'ALAMAT' => $request->kartu_alamat_pasien,
                        'RT' => $request->kartu_rukun_tetangga,
                        'RW' => $request->kartu_rukun_warga,
                        'KODEPOS' => $request->kartu_kode_pos,
                        'WILAYAH' => $request->kartu_alamat_kelurahan,
                    ]);
                }
            }

            // Update data keluarga pasien jika ada
            if ($request->nama_keluarga) {
                $keluargaPasien = KeluargaPasiens::where('NORM', $pasien->NORM)->first();
                if ($keluargaPasien) {
                    $keluargaPasien->update([
                        'SHDK' => $request->hubungan_keluarga,
                        'JENIS_KELAMIN' => $request->jenis_kelamin_keluarga,
                        'NOMOR' => 1,
                        'NAMA'  => $request->nama_keluarga,
                        'ALAMAT' => $request->alamat_keluarga,
                        'PENDIDIKAN' => $request->pendidikan_keluarga ?? 0,
                        'PEKERJAAN' => $request->pekerjaan_keluarga ?? 0,
                        'TANGGAL_LAHIR' => $request->tanggal_lahir_keluarga ? Carbon::parse($request->tanggal_lahir_keluarga)->format('Y-m-d H:i:s') : '0000-00-00',
                    ]);

                    // Update data kontak keluarga jika ada
                    $kontakKeluarga = KontakKeluarga::where('SHDK', $request->hubungan_keluarga)
                        ->where('NORM', $pasien->NORM)
                        ->first();
                    if ($kontakKeluarga) {
                        $kontakKeluarga->update([
                            'JENIS' => $request->jenis_kontak_keluarga,
                            'NOMOR' => $request->telepon_keluarga,
                        ]);
                    } else {
                        if ($request->telepon_keluarga != null) {
                            KontakKeluarga::create([
                                'SHDK' => $request->hubungan_keluarga,
                                'JENIS' => $request->jenis_kontak_keluarga,
                                'NORM' => $pasien->NORM,
                                'NOMOR' => $request->telepon_keluarga,
                            ]);
                        }
                    }

                    // Update data kartu identitas keluarga jika ada
                    $kartuIdentitasKeluarga = KartuIdentitasKeluarga::where('KELUARGA_PASIEN_ID', $keluargaPasien->ID)->first();
                    if ($kartuIdentitasKeluarga) {
                        $kartuIdentitasKeluarga->update([
                            'JENIS' => $request->jenis_identitas_keluarga,
                            'NOMOR' => $request->nomor_identitas_keluarga,
                            'ALAMAT' => $request->alamat_keluarga,
                            'RT' => $request->rukun_tetangga_keluarga,
                            'RW' => $request->rukun_warga_keluarga,
                            'KODEPOS' => $request->kode_pos_keluarga,
                            'WILAYAH' => $request->alamat_kelurahan_keluarga,
                        ]);
                    } else {
                        if ($request->nomor_identitas_keluarga != null) {
                            KartuIdentitasKeluarga::create([
                                'JENIS' => $request->jenis_identitas_keluarga,
                                'KELUARGA_PASIEN_ID' => $keluargaPasien->ID,
                                'NOMOR' => $request->nomor_identitas_keluarga,
                                'ALAMAT' => $request->alamat_keluarga,
                                'RT' => $request->rukun_tetangga_keluarga,
                                'RW' => $request->rukun_warga_keluarga,
                                'KODEPOS' => $request->kode_pos_keluarga,
                                'WILAYAH' => $request->alamat_kelurahan_keluarga,
                            ]);
                        }
                    }
                } else {
                    // Jika tidak ada data keluarga pasien, buat data baru
                    $keluargaPasien = KeluargaPasiens::create([
                        'SHDK' => $request->hubungan_keluarga,
                        'NORM' => $pasien->NORM,
                        'JENIS_KELAMIN' => $request->jenis_kelamin_keluarga,
                        'NOMOR' => 1,
                        'NAMA'  => $request->nama_keluarga,
                        'ALAMAT' => $request->alamat_keluarga,
                        'PENDIDIKAN' => $request->pendidikan_keluarga ?? 0,
                        'PEKERJAAN' => $request->pekerjaan_keluarga ?? 0,
                        'TANGGAL_LAHIR' => $request->tanggal_lahir_keluarga ? Carbon::parse($request->tanggal_lahir_keluarga)->format('Y-m-d H:i:s') : '0000-00-00',
                    ]);

                    // Simpan data kontak keluarga jika ada
                    if ($request->telepon_keluarga != null) {
                        KontakKeluarga::create([
                            'SHDK' => $request->hubungan_keluarga,
                            'JENIS' => $request->jenis_kontak_keluarga,
                            'NORM' => $pasien->NORM,
                            'NOMOR' => $request->telepon_keluarga,
                        ]);
                    }

                    // Simpan data kartu identitas keluarga jika ada
                    if ($request->nomor_identitas_keluarga != null) {
                        KartuIdentitasKeluarga::create([
                            'JENIS' => $request->jenis_identitas_keluarga,
                            'KELUARGA_PASIEN_ID' => $keluargaPasien->ID,
                            'NOMOR' => $request->nomor_identitas_keluarga,
                            'ALAMAT' => $request->alamat_keluarga,
                            'RT' => $request->rukun_tetangga_keluarga,
                            'RW' => $request->rukun_warga_keluarga,
                            'KODEPOS' => $request->kode_pos_keluarga,
                            'WILAYAH' => $request->alamat_kelurahan_keluarga,
                        ]);
                    }
                }
            }

            $connectionDatabase->commit();
            return redirect()->route('master.pasiens.detail', ['pasien' => $pasien->NORM])->with('success', 'Data pasien berhasil diupdate.');
        } catch (\Exception $e) {
            DB::connection('master')->rollBack();
            return back()->with('error', 'Gagal mengupdate data pasien: ' . $e->getMessage());
        }
    }

    public function wilayahAjax(Request $request)
    {
        $jenis = $request->input('jenis');
        $parent = $request->input('parent');
        $query = Wilayah::where('JENIS', $jenis);
        if ($parent) {
            $query->where('ID', 'like', $parent . '%');
        }
        $wilayah = $query->orderBy('DESKRIPSI')->get(['ID', 'DESKRIPSI']);
        return response()->json(['wilayah' => $wilayah]);
    }
}
