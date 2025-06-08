<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ $pengkajianAwal['nama_pasien'] }}</title>
</head>


<style>
    body {
        font-family: 'halvetica', sans-serif;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #000;
    }

    ul {
        margin: 0;
        /* Hilangkan margin default */
        padding-left: 20px;
        /* Tambahkan padding untuk indentasi */
        /* Ubah list menjadi angka */
    }

    li {
        margin-bottom: 5px;
        margin-left: -25px;
        /* Atur jarak antar item */
    }
</style>

<body>
    @php
        use Carbon\Carbon;

        // Fungsi untuk menghitung lama dirawat
        function hitungLamaDirawat($tanggalMasuk, $tanggalKeluar = null)
        {
            $tanggalMasuk = Carbon::parse($tanggalMasuk);
            $tanggalKeluar = $tanggalKeluar ? Carbon::parse($tanggalKeluar) : Carbon::now();
            $lamaDirawat = $tanggalMasuk->diffInDays($tanggalKeluar);

            // Jika lama dirawat kurang dari 1, bulatkan menjadi 1
            return ceil($lamaDirawat);
        }

        function formatTanggalIndo($tanggal)
        {
            $bulan = [
                1 => 'Januari',
                'Februari',
                'Maret',
                'April',
                'Mei',
                'Juni',
                'Juli',
                'Agustus',
                'September',
                'Oktober',
                'November',
                'Desember',
            ];

            $tanggal = Carbon::parse($tanggal);
            $hari = $tanggal->format('d'); // Ambil tanggal (hari)
            $bulanIndo = $bulan[(int) $tanggal->format('m')]; // Ambil nama bulan
            $tahun = $tanggal->format('Y'); // Ambil tahun

            return "$hari $bulanIndo $tahun";
        }
    @endphp
    <table>
        <tr>
            <td colspan="2">
                <!-- Gunakan data Base64 untuk menampilkan gambar -->
                <img src="{{ $imageBase64 }}" alt="Logo Klinik" style="padding-left:20px; width: 50px; height: 50px;">
            </td>
            <td colspan="6">
                <div style="line-height: 1.2">
                    <h3 style="font-size: 20px; text-align: left; margin-top: 10px">KLINIK RAWAT INAP UTAMA MUHAMMADIYAH
                        KEDUNGADEM</h3>
                    <p style="font-size: 12px; text-align: left; margin-top: -20px;">
                        Jl. PUK Desa Drokilo. Kec. Kedungadem Kab. Bojonegoro <br>
                        Email : klinik.muh.kedungadem@gmail.com | WA : 082242244646 <br>
                    </p>
                </div>
            </td>
        </tr>
        <tr style="background: black; color: white; text-align: center;">
            <td colspan="8">
                <h3 style="font-size: 16px;">PENGKAJIAN AWAL RI/RD</h3>
            </td>
        </tr>
    </table>
</body>

</html>
