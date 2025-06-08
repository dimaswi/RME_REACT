<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ $resumeMedis['nama_pasien'] }}</title>
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
                <h3 style="font-size: 16px;">RINGKASAN PULANG</h3>
            </td>
        </tr>
    </table>

    <table>
        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Nama Pasien :</strong>
                <br>
                {{ $resumeMedis['nama_pasien'] }}
            </td>
            <td colspan="2"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Nomor RM :</strong>
                <br>
                {{ $resumeMedis['no_rm'] }}
            </td>
            <td colspan="2"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Tanggal Lahir :</strong>
                <br>
                {{ formatTanggalIndo($resumeMedis['tanggal_lahir']) }}
            </td>
            <td colspan="2"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Jenis Kelamin :</strong>
                <br>
                {{ $resumeMedis['jenis_kelamin'] }}
            </td>
        </tr>
        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Tanggal Masuk :</strong>
                <br>
                {{ formatTanggalIndo($resumeMedis['tanggal_masuk']) }}
            </td>
            <td colspan="2"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Tanggal Keluar :</strong>
                <br>
                {{ formatTanggalIndo($resumeMedis['tanggal_keluar']) }}
            </td>
            <td colspan="2"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Lama Dirawat :</strong>
                <br>
                {{ hitungLamaDirawat($resumeMedis['tanggal_masuk'], $resumeMedis['tanggal_keluar'] ?? null) }} hari
            </td>
            <td colspan="2"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Ruang Rawat Terakhir :</strong>
                <br>
                {{ $resumeMedis['ruang_rawat_terakhir'] }}
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="4"
                style="vertical-align: top; height: 70px; width: 50%; border: 1px solid #000; padding-left: 5px">
                <strong>Penjamin :</strong>
                <br>
                {{ $resumeMedis['penjamin'] }}
            </td>
            <td colspan="4"
                style="vertical-align: top; height: 70px; width: 50%; border: 1px solid #000; padding-left: 5px">
                <strong>Indikasi Rawat Inap :</strong>
                <br>
                {{ $resumeMedis['indikasi_rawat_inap'] ?? 'Tidak ada' }}
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <strong>Riwayat Penyakit Sekarang :</strong>
            </td>
            <td colspan="6" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <strong>Ringkasan Penyakit Sekarang :</strong>
                <br>
                {{ $resumeMedis['riwayat_penyakit_sekarang'] }}
                <br>
                <strong>Ringkasan Penyakit Dahulu :</strong>
                <br>
                {{ $resumeMedis['riwayat_penyakit_dahulu'] }}
            </td>
        </tr>
        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <strong>Pemeriksaan Fisik :</strong>
            </td>
            <td colspan="6" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                {{ $resumeMedis['pemeriksaan_fisik'] }}
            </td>
        </tr>
        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <strong>Hasil Konsultasi :</strong>
            </td>
            <td colspan="6" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                {{ $resumeMedis['hasil_konsultasi'] }}
            </td>
        </tr>
        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <strong>
                    <center>Diagnosa</center>
                </strong>
            </td>
            <td colspan="1" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <strong>
                    <center>ICD 10</center>
                </strong>
            </td>
            <td colspan="2" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <strong>
                    <center>Terapi</center>
                </strong>
            </td>
            <td colspan="2" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <strong>
                    <center>Prosedur</center>
                </strong>
            </td>
            <td colspan="1" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <strong>
                    <center>ICD 9</center>
                </strong>
            </td>
        </tr>
        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                {{ $resumeMedis['diagnosa_utama'] }}
            </td>
            <td colspan="1" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                {{ $resumeMedis['icd_10_diagnosa_utama'] }}
            </td>
            <td colspan="2" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                {{-- {{ $resumeMedis['terapi_utama'] }} --}}
            </td>
            <td colspan="2" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                {{ $resumeMedis['prosedur_utama'] }}
            </td>
            <td colspan="1" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                {{ $resumeMedis['icd_9_prosedur_utama'] }}
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <strong>Keadaan Pulang :</strong>
            </td>
            <td colspan="6" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                {{ $resumeMedis['keadaan_pulang'] }}
            </td>

        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <strong>Cara Pulang :</strong>
            </td>
            <td colspan="6" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                {{ $resumeMedis['cara_pulang'] }}
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <strong>Cara Pulang :</strong>
            </td>
            <td colspan="6" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                {{ $resumeMedis['cara_pulang'] }}
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <strong>Keadaan Umum :</strong>
            </td>
            <td colspan="6" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <div>
                    <div>
                        <strong>Tekanan Darah</strong>
                        <span>: {{ $resumeMedis['tekanan_darah'] }} mmHg</span>
                    </div>
                    <div>
                        <strong>Nadi</strong>
                        <span>: {{ $resumeMedis['nadi'] }} bpm</span>
                    </div>
                    <div>
                        <strong>Pernafasan</strong>
                        <span>: {{ $resumeMedis['pernafasan'] }} kali/menit</span>
                    </div>
                    <div>
                        <strong>Suhu</strong>
                        <span>: {{ $resumeMedis['suhu'] }} °C</span>
                    </div>
                    <div>
                        <strong>Kesadaran</strong>
                        <span>: {{ $resumeMedis['kesadaran'] }}</span>
                    </div>
                    <div>
                        <strong>Skala Nyeri</strong>
                        <span>: {{ $resumeMedis['skala_nyeri'] }}</span>
                    </div>
                </div>
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <strong>Terapi Pulang </strong>
            </td>
            <td colspan="6" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <ol>
                    @foreach ($resumeMedis['terapi_pulang'] as $terapi)
                        <li>{{ $terapi['nama_obat'] }} - {{ $terapi['frekuensi'] }} - {{ $terapi['cara_pakai'] }}
                        </li>
                    @endforeach
                </ol>
            </td>
        </tr>

        <tr>
            <td colspan="4" style="text-align: center; font-size: 13px; padding: 10px; vertical-align: top;">
                <strong>Keluarga Pasien</strong>
            </td>
            <td colspan="4" style="text-align: center; font-size: 13px; padding: 10px; vertical-align: top;">
                <strong>Dokter Penanggung Jawab</strong>
                <div>
                    <img src="{{ $qrcodeBase64 }}" alt="" style="width: 50px; height: 50px; margin: 10px;">
                </div>
                <strong id='nama_dokter'>{{ $resumeMedis['nama_dokter'] }}</strong>
                <br>
                NIP. {{ $resumeMedis['nip_dokter'] }}
            </td>
        </tr>
    </table>

</body>

</html>
