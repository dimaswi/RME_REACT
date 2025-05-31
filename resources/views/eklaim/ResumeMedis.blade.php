<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ $pendaftaran['pasien']['NAMA'] }}</title>
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
                {{ $pendaftaran['pasien']['NAMA'] }}
            </td>
            <td colspan="2"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Nomor RM :</strong>
                <br>
                {{ $pendaftaran['pasien']['NORM'] }}
            </td>
            <td colspan="2"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Tanggal Lahir :</strong>
                <br>
                {{ formatTanggalIndo($pendaftaran['pasien']['TANGGAL_LAHIR']) }}
            </td>
            <td colspan="2"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Jenis Kelamin :</strong>
                <br>
                {{ $pendaftaran['pasien']['JENIS_KELAMIN'] == 1 ? 'Laki-laki' : 'Perempuan' }}
            </td>
        </tr>
        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Tanggal Masuk :</strong>
                <br>
                {{ formatTanggalIndo($pendaftaran['TANGGAL']) }}
            </td>
            <td colspan="2"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Tanggal Keluar :</strong>
                <br>
                {{ formatTanggalIndo($pendaftaran['pasienPulang']['TANGGAL'] ?? 'Pasien belum pulang') }}
            </td>
            <td colspan="2"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Lama Dirawat :</strong>
                <br>
                {{ hitungLamaDirawat($pendaftaran['TANGGAL'], $pendaftaran['pasienPulang']['TANGGAL'] ?? null) }} hari
            </td>
            <td colspan="2"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Ruang Rawat Terakhir :</strong>
                <br>
                {{ $pendaftaran['pasienPulang']['kunjunganPasien']['ruangan']['DESKRIPSI'] ?? 'Tidak ada' }}
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="4"
                style="vertical-align: top; height: 70px; width: 50%; border: 1px solid #000; padding-left: 5px">
                <strong>Penjamin :</strong>
                <br>
                {{ $pendaftaran['penjamin']['jenisPenjamin']['DESKRIPSI'] ?? 'Tidak diketahui' }}
            </td>
            <td colspan="4"
                style="vertical-align: top; height: 70px; width: 50%; border: 1px solid #000; padding-left: 5px">
                <strong>Indikasi Rawat Inap :</strong>
                <br>
                {{ $pendaftaran['resumeMedis']['INDIKASI_RAWAT_INAP'] ?? 'Tidak ada' }}
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <strong>Riwayat Penyakit Sekarang :</strong>
            </td>
            <td colspan="6" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <strong>Ringkasan Penyakit Sekarang :</strong>
                <ol>
                    @forelse ($pendaftaran['anamnesis'] as $value)
                        @php
                            $deskripsi = $value['DESKRIPSI'] ?? '-';
                        @endphp
                        @if (str_contains(strtolower($deskripsi), 'tidak') || $deskripsi === '-')
                        @else
                            <li>
                                {{ $deskripsi }}
                            </li>
                        @endif
                    @empty
                        Tidak ada data anamnesis.
                    @endforelse
                </ol>
                <strong>Ringkasan Penyakit Dahulu :</strong>
                <ol>
                    @forelse ($pendaftaran['riwayatKunjungan'] as $kunjungan)
                        @php
                            $deskripsi = $kunjungan['rpp']['DESKRIPSI'] ?? '-';
                        @endphp
                        @if (str_contains(strtolower($deskripsi), 'tidak') || $deskripsi === '-')
                        @else
                            <li>
                                {{ $deskripsi }}
                            </li>
                        @endif
                    @empty
                        Tidak ada data riwayat kunjungan.
                    @endforelse
                </ol>
            </td>
        </tr>
        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <strong>Pemeriksaan Fisik :</strong>
            </td>
            <td colspan="6" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                @if (
                    $pendaftaran['pemeriksaan_fisik'] &&
                        is_array($pendaftaran['pemeriksaan_fisik']) &&
                        count($pendaftaran['pemeriksaan_fisik']) > 0)
                    @foreach ($pendaftaran['pemeriksaan_fisik'] as $key => $value)
                        <ul>
                            <li>
                                {{ $value['DESKRIPSI'] }}
                            </li>
                        </ul>
                    @endforeach
                @else
                    Tidak ada riwayat pemeriksaan fisik yang tercatat.
                @endif
            </td>
        </tr>
        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <strong>Hasil Konsultasi :</strong>
            </td>
            <td colspan="6" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                {{ $pendaftaran['resumeMedis']['DESKRIPSI_KONSUL'] ?? 'Tidak ada' }}
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
                @if (isset($pendaftaran['diagnosa_pasien']) &&
                        is_array($pendaftaran['diagnosa_pasien']) &&
                        $pendaftaran['diagnosa_pasien']['UTAMA'] == 1)
                    {{ $pendaftaran['diagnosa_pasien']['nama_diagnosa']['STR'] ?? 'Tidak ada' }}
                @else
                @endif
            </td>
            <td colspan="1" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                @if (isset($pendaftaran['diagnosa_pasien']) &&
                        is_array($pendaftaran['diagnosa_pasien']) &&
                        $pendaftaran['diagnosa_pasien']['UTAMA'] == 1)
                    {{ $pendaftaran['diagnosa_pasien']['nama_diagnosa']['CODE'] ?? 'Tidak ada' }}
                @else
                @endif
            </td>
            <td colspan="2" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">

            </td>
            <td colspan="2" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                @if (isset($pendaftaran['prosedur_pasien']) &&
                        is_array($pendaftaran['prosedur_pasien']) &&
                        count($pendaftaran['prosedur_pasien']) > 0)
                    {{ $pendaftaran['prosedur_pasien']['nama_prosedur']['STR'] ?? 'Tidak ada' }}
                @else
                @endif
            </td>
            <td colspan="1" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <@if (isset($pendaftaran['prosedur_pasien']) &&
                        is_array($pendaftaran['prosedur_pasien']) &&
                        count($pendaftaran['prosedur_pasien']) > 0)
                    {{ $pendaftaran['prosedur_pasien']['nama_prosedur']['CODE'] ?? 'Tidak ada' }}
                @else
                    @endif
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <strong>Keadaan Pulang :</strong>
            </td>
            <td colspan="6" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                {{ $pendaftaran['pasienPulang']['keadaanPulang']['DESKRIPSI'] ?? 'Tidak ada' }}
            </td>

        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <strong>Cara Pulang :</strong>
            </td>
            <td colspan="6" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                {{ $pendaftaran['pasienPulang']['caraPulang']['DESKRIPSI'] ?? 'Tidak ada' }}
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <strong>Cara Pulang :</strong>
            </td>
            <td colspan="6" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                {{ $pendaftaran['pasienPulang']['caraPulang']['DESKRIPSI'] ?? 'Tidak ada' }}
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                <strong>Riwayat TTV :</strong>
            </td>
            <td colspan="6" style="vertical-align: top; height: 70px;border: 1px solid #000; padding-left: 5px">
                @forelse ($pendaftaran['riwayatKunjungan'] as $ttv)
                    Keadaan Umum : {{ $ttv['tandaVital']['KEADAAN_UMUM'] ?? "Tidak ada" }} <br>
                    Tekanan Darah : {{ $ttv['tandaVital']['SISTOLIK'] ?? 0 }}/{{ $ttv['tandaVital']['DIASTOLIK'] ?? 0 }} mmHg<br>
                    Frekuensi Nadi : {{ $ttv['tandaVital']['FREKUENSI_NADI'] ?? 0 }} x/menit<br>
                    Frekuensi Pernapasan : {{ $ttv['tandaVital']['FREKUENSI_PERNAPASAN'] ?? 0 }} x/menit<br>
                    Suhu : {{ $ttv['tandaVital']['SUHU'] ?? 0 }} °C<br>
                    Saturasi Oksigen : {{ $ttv['tandaVital']['SATURASI_OKSIGEN'] ?? 0 }} %<br>
                    <br>
                @empty

                @endforelse
            </td>
        </tr>

    </table>

</body>

</html>
