<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ $pasien['NAMA'] }}</title>
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

            $tanggal = \Carbon\Carbon::parse($tanggal);
            $hari = $tanggal->format('d');
            $bulanIndo = $bulan[(int) $tanggal->format('m')];
            $tahun = $tanggal->format('Y');

            // Jika ada waktu (jam:menit:detik tidak 00:00:00), tambahkan ke hasil
            $waktu = $tanggal->format('H:i:s');
            if ($waktu !== '00:00:00') {
                return "$hari $bulanIndo $tahun $waktu";
            } else {
                return "$hari $bulanIndo $tahun";
            }
        }
    @endphp
    @foreach($dataRadiologi as $tindakanRadiologi)
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
                    <h3 style="font-size: 16px;">RADIOLOGI</h3>
                </td>
            </tr>
        </table>
        <table style="font-size: 12px">
            <tr>
                <td style="width: 15%; padding-left: 5px;"><strong>Nama</strong></td>
                <td style="width: 35%; border-right: 1px solid black;">: {{ $pasien->NAMA }}</td>
                <td style="width: 15%; padding-left: 5px;"><strong>Alamat</strong></td>
                <td style="width: 35%;">: {{ $pasien->ALAMAT }}</td>
            </tr>
            <tr>
                <td style="width: 15%; padding-left: 5px;"><strong>No. RM</strong></td>
                <td style="width: 35%; border-right: 1px solid black;">: {{ $pasien->NORM }}</td>
                <td style="width: 15%; padding-left: 5px;"><strong>Tanggal Masuk</strong></td>
                <td style="width: 35%;">: {{ formatTanggalIndo($dataKunjungan->MASUK) }}</td>
            </tr>
            <tr>
                <td style="width: 15%; padding-left: 5px;"><strong>Jenis Kelamin</strong></td>
                <td style="width: 35%; border-right: 1px solid black;">:
                    {{ $pasien->JENIS_KELAMIN == 1 ? 'Laki-Laki' : 'Perempuan' }}
                </td>
                <td style="width: 15%; padding-left: 5px;"><strong>Tanggal Keluar</strong></td>
                <td style="width: 35%;">: {{ formatTanggalIndo($dataKunjungan->KELUAR) }}</td>
            </tr>
            <tr>
                <td style="width: 15%; padding-left: 5px;"><strong>Tanggal Lahir</strong></td>
                <td style="width: 35%; border-right: 1px solid black;">: {{ formatTanggalIndo($pasien->TANGGAL_LAHIR) }}
                </td>
                <td style="width: 15%; padding-left: 5px;"><strong>Tindakan</strong></td>
                <td style="width: 35%;">: {{ $tindakanRadiologi['tindakanRadiologi']['NAMA'] }}</td>
            </tr>
        </table>
        <table style="font-size: 12px">
            <tr>
                <td style="border: 1px solid black; padding: 10px;">
                    <ol>
                        <li style="padding-bottom: 10px">
                            <div>
                                <strong>KLINIS</strong>
                                <div>
                                    {!! nl2br(e($tindakanRadiologi->klinis)) !!}
                                </div>
                            </div>
                        </li>

                        <li style="padding-bottom: 10px">
                            <strong>HASIL PEMERIKSAAN</strong>
                            <div>
                                {!! nl2br(e($tindakanRadiologi->hasil)) !!}
                            </div>
                        </li>

                        <li style="padding-bottom: 10px">
                            <strong>KESAN PEMERIKSAAN</strong>
                            <div>
                                {!! nl2br(e($tindakanRadiologi->kesan)) !!}
                            </div>
                        </li>

                        <li style="padding-bottom: 10px">
                            <strong>USUL PEMERIKSAAN</strong>
                            <div>
                                {!! nl2br(e($tindakanRadiologi->usul)) !!}
                            </div>
                        </li>
                    </ol>
                </td>
            </tr>
        </table>
        <table style="font-size: 12px; border: none;">
            <tr>
                <td style="width: 50%; text-align: center; padding: 10px;">
                    Petugas <br>
                    <img src="{{ $tindakanRadiologi->qrcodePetugas }}" alt="QR Dokter" width="50" style="padding: 10px"> <br>
                    {{ $tindakanRadiologi->petugas_nama }}

                </td>
                <td style="width: 50%; text-align: center; padding: 10px;">
                    Konsulen <br>
                    <img src="{{ $tindakanRadiologi->qrcodeDokter }}" alt="QR Dokter" width="50" style="padding: 10px"> <br>
                    {{ $tindakanRadiologi->dokter_nama }}

                </td>
            </tr>
        </table>
        @if(!$loop->last)
            <div style="page-break-after: always;"></div>
        @endif
    @endforeach
</body>

</html>