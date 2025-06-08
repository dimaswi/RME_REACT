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
        if (!function_exists('formatTanggalIndo')) {
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
    <table>
        <tr style="font-size: 13px; text-align: left;">
            <td colspan="4"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Ruangan</strong> : <br>
                {{ $pengkajianAwal['ruangan'] }}
            </td>
            <td colspan="4"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Tanggal Masuk</strong> : <br>
                {{ $pengkajianAwal['tanggal_masuk'] }}
            </td>
        </tr>
        <tr style="font-size: 13px; text-align: left;">
            <td colspan="4"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Nama Pasien</strong> :
                {{ $pengkajianAwal['nama_pasien'] }} <br>
                <strong>No. RM</strong> :
                {{ $pengkajianAwal['no_rm'] }} <br>
                <strong>Jenis Kelamin</strong> :
                {{ $pengkajianAwal['jenis_kelamin'] }} <br>
                <strong>Tanggal Lahir</strong> :
                {{ $pengkajianAwal['tanggal_lahir'] }} <br>
            </td>
            <td colspan="4"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Alamat Pasien</strong> :
                {{ $pengkajianAwal['alamat_pasien'] }} <br>
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="8"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong><u>Anamnesa</u></strong> : <br>
                Diperoleh secara :
                @if ($pengkajianAwal['auto_anamnesis'] == 1)
                    <span>Auto-Anamnesis/<s>Allo-Anamnesis</s></span>, dari : {{ $pengkajianAwal['dari'] }}
                @elseif ($pengkajianAwal['allo_anamnesisi'] == 1)
                    <span><s>Auto-Anamnesis</s>/Allo-Anamnesis</span>, dari : {{ $pengkajianAwal['dari'] }}
                @else
                    <span>Auto-Anamnesisi/Allo-Anamnesis</span>, dari : {{ $pengkajianAwal['dari'] }}
                @endif
                <br>
                <ol>
                    <li><b>Keluhan Utama</b> : <span>{{ $pengkajianAwal['anamnesis'] }}</span></li>
                    <li><b>Riwayat Penyakit Sekarang</b> : <span>{{ $pengkajianAwal['riwayat_penyakit_sekarang'] }}</span></li>
                    <li><b>Riwayat Penyakit Dahulu</b> : <span>{{ $pengkajianAwal['riwayat_penyakit_dahulu'] }}</span></li>
                    <li><b>Riwayat Pengobatan</b> : <span>{{ $pengkajianAwal['riwayat_pengobatan'] }}</span></li>
                    <li><b>Riwayat Penyakit Keluarga</b> : <span>{{ $pengkajianAwal['riwayat_penyakit_keluarga'] }}</span></li>
                </ol>
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="8"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong><u>Keadaan Umum</u></strong>
                <ol>
                    <li><b>Keadaan</b> : <span>{{ $pengkajianAwal['keadaan_umum'] }}</span></li>
                    <li><b>Tingkat Kesadaran</b> : <span>{{ $pengkajianAwal['tingkat_kesadaran'] }}</span></li>
                    <li><b>Tekanan Darah</b> : <span>{{ $pengkajianAwal['tekanan_darah'] }} mmHg</span></li>
                    <li><b>GCS</b> : <span>{{ $pengkajianAwal['gcs'] }}</span></li>
                    <li><b>Eye</b> : <span>{{ $pengkajianAwal['eye'] }}</span></li>
                    <li><b>Motorik</b> : <span>{{ $pengkajianAwal['motorik'] }}</span></li>
                    <li><b>Verbal</b> : <span>{{ $pengkajianAwal['verbal'] }}</span></li>
                    <li><b>Frekuensi Nadi</b> : <span>{{ $pengkajianAwal['frekuensi_nadi'] }} x /Menit</span></li>
                    <li><b>Frekuensi Nafas</b> : <span>{{ $pengkajianAwal['frekuensi_nafas'] }} x /Menit</span></li>
                    <li><b>Suhu</b> : <span>{{ $pengkajianAwal['suhu'] }} °C</span></li>
                    <li><b>Saturasi Oksigen</b> : <span>{{ $pengkajianAwal['saturasi_o2'] }} %</span></li>
                </ol>
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="8"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong><u>Pemeriksaan Fisik</u></strong>
                <ol>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                    <li><b>Mata</b> : <span>Tidak ada</span></li>
                </ol>
            </td>
        </tr>
    </table>
</body>

</html>
