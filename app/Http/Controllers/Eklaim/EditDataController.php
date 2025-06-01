<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use App\Models\Eklaim\PengajuanKlaim;
use App\Models\Pendaftaran\Kunjungan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EditDataController extends Controller
{
    public function EditResumeMedis(PengajuanKlaim $pengajuanKlaim)
    {
        $pengajuanKlaim->load([
            'penjamin.kunjunganPasien.ruangan',
            'penjamin.kunjunganPasien.penjaminPasien.jenisPenjamin',
            'penjamin.kunjunganPasien.pendaftaranPasien.pasien',
            'penjamin.kunjunganPasien.pendaftaranPasien.resumeMedis',
            'penjamin.kunjunganPasien.anamnesisPasien',
            'penjamin.kunjunganPasien.rpp',
            'penjamin.kunjunganPasien.diagnosaPasien',
            'penjamin.kunjunganPasien.prosedurPasien',
            'penjamin.kunjunganPasien.pemeriksaanFisik',
            'penjamin.kunjunganPasien.permintaanKonsul',
            'penjamin.kunjunganPasien.permintaanKonsul.jawabanKonsul',
            'penjamin.kunjunganPasien.riwayatAlergi',
            'penjamin.kunjunganPasien.pasienPulang.caraPulang',
            'penjamin.kunjunganPasien.pasienPulang.keadaanPulang',
            'penjamin.kunjunganPasien.orderResep.orderResepDetil.namaObat',
            'penjamin.kunjunganPasien.orderResep.orderResepDetil.caraPakai',
            'penjamin.kunjunganPasien.orderResep.orderResepDetil.frekuensiObat',
            'penjamin.kunjunganPasien.jadwalKontrol.ruangan',
            'penjamin.kunjunganPasien.dokterDPJP',
            'penjamin.kunjunganPasien.gabungTagihan.kunjunganPasien.ruangan',
        ]);

        //Kop
        $imagePath = public_path('images/kop.png'); // Path ke gambar di folder public
        if (!file_exists($imagePath)) {
            throw new \Exception("Gambar tidak ditemukan di path: $imagePath");
        }
        $imageData = base64_encode(file_get_contents($imagePath)); // Konversi ke Base64
        $imageBase64 = 'data:image/png;base64,' . $imageData; // Tambahkan prefix Base64

        // Handle jika penjamin atau kunjunganPasien kosong/null
        if (
            $pengajuanKlaim->penjamin->kunjunganPasien->count() < 1
        ) {
            return Inertia::render('eklaim/EditData/ResumeMedis', [
                'pengajuanKlaim' => $pengajuanKlaim,
                'imageBase64'=> $imageBase64
            ])->with('error', 'Tidak ada data resume medis untuk diedit');
        }

        return Inertia::render('eklaim/EditData/ResumeMedis', [
            'pengajuanKlaim' => $pengajuanKlaim,
            'imageBase64'=> $imageBase64
        ])->with('success', 'Berhasil mengambil data resume medis');
    }

    public function StoreEditResumeMedis(Request $request)
    {
        try {

            return redirect()->back()->with('success', 'Data Resume Medis berhasil disimpan.');
        } catch (\Throwable $th) {

            return redirect()->back()->with('error', 'Gagal menyimpan data Resume Medis: ' . $th->getMessage());
        }
    }

    public function EditTagihan(PengajuanKlaim $pengajuanKlaim)
    {
        return Inertia::render('eklaim/EditData/Tagihan', [
            'pengajuanKlaim' => $pengajuanKlaim
        ]);
    }

    public function StoreEditTagihan(Request $request)
    {
        try {

            return redirect()->back()->with('success', 'Data Tagihan berhasil disimpan.');
        } catch (\Throwable $th) {

            return redirect()->back()->with('error', 'Gagal menyimpan data Tagihan: ' . $th->getMessage());
        }
    }

    public function EditLaboratorium(PengajuanKlaim $pengajuanKlaim)
    {
        return Inertia::render('eklaim/EditData/Laboratorium', [
            'pengajuanKlaim' => $pengajuanKlaim
        ]);
    }

    public function StoreEditLaboratorium(Request $request)
    {
        try {

            return redirect()->back()->with('success', 'Data Laboratorium berhasil disimpan.');
        } catch (\Throwable $th) {

            return redirect()->back()->with('error', 'Gagal menyimpan data Laboratorium: ' . $th->getMessage());
        }
    }

    public function EditRadiologi(PengajuanKlaim $pengajuanKlaim)
    {
        return Inertia::render('eklaim/EditData/Radiologi', [
            'pengajuanKlaim' => $pengajuanKlaim
        ]);
    }

    public function StoreEditRadiologi(Request $request)
    {
        try {

            return redirect()->back()->with('success', 'Data Radiologi berhasil disimpan.');
        } catch (\Throwable $th) {

            return redirect()->back()->with('error', 'Gagal menyimpan data Radiologi: ' . $th->getMessage());
        }
    }

    public function loadDataPengkajianAwalRIRD(Kunjungan $nomorKunjungan)
    {
        if (!$nomorKunjungan->exists) {
            return redirect()->back()->with('error', 'Nomor kunjungan tidak ditemukan.');
        }

        $nomorKunjungan->load([
            'pendaftaranPasien.pasien',
            'ruangan'
        ]);

        return response()->json([
            'kunjungan' => $nomorKunjungan
        ]);
    }
}
