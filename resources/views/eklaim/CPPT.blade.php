<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ $CPPT['nama_pasien'] }}</title>
</head>


<style>
    body {
        font-family: 'halvetica', sans-serif;
        text-align: justify
    }

    table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #000;
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
                <h3 style="font-size: 16px;">Catatan Perkembangan Pasien Terintegrasi</h3>
            </td>
        </tr>
    </table>
    <table>
        <tr style="font-size: 13px; text-align: left;">
            <td
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Nama Pasien :</strong>
                <br>
                {{ $CPPT['nama_pasien'] }}
            </td>
            <td
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Nomor RM :</strong>
                <br>
                {{ $CPPT['no_rm'] }}
            </td>
            <td
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Tanggal Lahir :</strong>
                <br>
                {{ formatTanggalIndo($CPPT['tanggal_lahir']) }}
            </td>
            <td
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Jenis Kelamin :</strong>
                <br>
                {{ $CPPT['jenis_kelamin'] }}
            </td>
            <td
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Alamat :</strong>
                <br>
                {{ $CPPT['alamat'] }}
            </td>
        </tr>
    </table>

    <table>
        <tr>
            <td
                style="vertical-align: middle; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong><center>Tanggal / Jam</center></strong>
            </td>
            <td
                style="vertical-align: middle; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong><center>Profesi (PPA)</center></strong>
            </td>
            <td
                style="vertical-align: middle; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong><center>Hasil Assessment Penatalaksanaan pasien/SOAP</center></strong>
            </td>
            <td
                style="vertical-align: middle; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong><center>Instruksi</center></strong>
            </td>
            <td
                style="vertical-align: middle; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong><center>Verifikasi</center></strong>
            </td>
        </tr>

        @foreach ($CPPT['cppt'] as $value)
            <tr style="font-size: 13px; text-align: left;">
                <td
                    style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                    {{ formatTanggalIndo($value['TANGGAL']) }}
                </td>
                <td
                    style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                    {{ $value['petugas']['NAMA'] }} - {{ $value['petugas']['pegawai']['profesi']['DESKRIPSI'] }}
                </td>
                <td
                    style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                    <strong><i>S/</i> : </strong> {{ $value['SUBYEKTIF'] }} <br>
                    <strong><i>O/</i> : </strong> {{ $value['OBYEKTIF'] }} <br>
                    <strong><i>A/</i> : </strong> {{ $value['ASSESMENT'] }} <br>
                    <strong><i>P/</i> : </strong> {{ $value['PLANNING'] }}
                </td>
                <td
                    style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                    {{ preg_replace('/(&nbsp;|[^\pL\pN\s.,:;!?()\/-]+)/u', '', strip_tags($value['INSTRUKSI'])) }}
                </td>
                <td
                    style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                    <center style="padding-top: 10px;">
                        <img src="{{ $value['qrcode_petugas'] }}" alt="QR Petugas" width="60">
                    </center>
                </td>
            </tr>
        @endforeach
    </table>
</body>

</html>
