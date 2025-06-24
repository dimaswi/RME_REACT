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
                style="vertical-align: top; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Nama Pasien :</strong>
                <br>
                {{ $resumeMedis['nama_pasien'] }}
            </td>
            <td colspan="2"
                style="vertical-align: top; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Nomor RM :</strong>
                <br>
                {{ $resumeMedis['no_rm'] }}
            </td>
            <td colspan="2"
                style="vertical-align: top; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Tanggal Lahir :</strong>
                <br>
                {{ formatTanggalIndo($resumeMedis['tanggal_lahir']) }}
            </td>
            <td colspan="2"
                style="vertical-align: top; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Jenis Kelamin :</strong>
                <br>
                {{ $resumeMedis['jenis_kelamin'] }}
            </td>
        </tr>
        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2"
                style="vertical-align: top; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Tanggal Masuk :</strong>
                <br>
                {{ formatTanggalIndo($resumeMedis['tanggal_masuk']) }}
            </td>
            <td colspan="2"
                style="vertical-align: top; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Tanggal Keluar :</strong>
                <br>
                {{ formatTanggalIndo($resumeMedis['tanggal_keluar']) }}
            </td>
            <td colspan="2"
                style="vertical-align: top; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Lama Dirawat :</strong>
                <br>
                {{ hitungLamaDirawat($resumeMedis['tanggal_masuk'], $resumeMedis['tanggal_keluar'] ?? null) }} hari
            </td>
            <td colspan="2"
                style="vertical-align: top; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Ruang Rawat Terakhir :</strong>
                <br>
                {{ $resumeMedis['ruang_rawat_terakhir'] }}
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="4"
                style="vertical-align: top; width: 50%; border: 1px solid #000; padding-left: 5px">
                <strong>Penjamin :</strong>
                <br>
                {{ $resumeMedis['penjamin'] }}
            </td>
            <td colspan="4"
                style="vertical-align: top; width: 50%; border: 1px solid #000; padding-left: 5px">
                <strong>Indikasi Rawat Inap :</strong>
                <br>
                {{ $resumeMedis['indikasi_rawat_inap'] ?? 'Tidak ada' }}
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top;border: 1px solid #000; padding-left: 5px">
                <strong>Riwayat Penyakit Sekarang :</strong>
            </td>
            <td colspan="6" style="vertical-align: top;border: 1px solid #000; padding-left: 5px">
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
            <td colspan="2" style="vertical-align: top;border: 1px solid #000; padding-left: 5px">
                <strong>Pemeriksaan Fisik :</strong>
            </td>
            <td colspan="6" style="vertical-align: top;border: 1px solid #000; padding-left: 5px">
                {{ $resumeMedis['pemeriksaan_fisik'] }}
            </td>
        </tr>
        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top;border: 1px solid #000; padding-left: 5px">
                <strong>Hasil Konsultasi :</strong>
            </td>
            <td colspan="6" style="vertical-align: top;border: 1px solid #000; padding-left: 5px">
                <ol>
                    @if (count($resumeMedis['hasil_konsultasi']) > 0)
                        {{-- Loop through hasil_konsultasi and display each item --}}
                        @foreach ($resumeMedis['hasil_konsultasi'] as $konsultasi)
                            <li>{{ $konsultasi['nama_dokter'] }} - {{ $konsultasi['spesialis'] }}: {{ $konsultasi['hasil'] }}</li>
                        @endforeach
                    @else
                        <li>Tidak ada hasil konsultasi</li>
                    @endif
                </ol>
            </td>
        </tr>
        <tr style="font-size: 13px; text-align: left;">
            <td colspan="4" style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <strong>
                    <center>ICD 10</center>
                </strong>
            </td>
            <td colspan="4" style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <strong>
                    <center>Diagnosa</center>
                </strong>
            </td>
        </tr>
        @foreach ($resumeMedis['diagnosa_utama'] as $index => $diagnosa)
            <tr style="font-size: 13px; text-align: left;">
                <td colspan="4" style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                    {{ $diagnosa['id'] }}
                    @if ($index == 0)
                        <span style="color: red;">(Diagnosa Primer)</span>
                    @else
                        <span style="color: blue;">(Diagnosa Sekunder)</span>
                    @endif
                </td>
                <td colspan="4" style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                    {{ $diagnosa['description'] }}
                </td>
            </tr>
        @endforeach

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="4" style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <strong>
                    <center>ICD 9</center>
                </strong>
            </td>
            <td colspan="4" style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <strong>
                    <center>Prosedur</center>
                </strong>
            </td>
        </tr>
        @foreach ($resumeMedis['prosedur_utama'] as $index => $prosedur)
            <tr style="font-size: 13px; text-align: left;">
                <td colspan="4" style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                    {{ $prosedur['id'] }}
                    @if ($index == 0)
                        <span style="color: red;">(Prosedur Primer)</span>
                    @else
                        <span style="color: blue;">(Prosedur Sekunder)</span>
                    @endif
                </td>
                <td colspan="4" style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                    {{ $prosedur['description'] }}
                </td>
            </tr>
        @endforeach

        @empty($resumeMedis['prosedur_utama'])
            <tr style="font-size: 13px; text-align: left;">
                <td colspan="8" style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                    <center>Tidak ada prosedur yang dilakukan</center>
                </td>
            </tr>
        @endempty

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top;border: 1px solid #000; padding-left: 5px">
                <strong>Keadaan Pulang :</strong>
            </td>
            <td colspan="6" style="vertical-align: top;border: 1px solid #000; padding-left: 5px">
                {{ $resumeMedis['keadaan_pulang'] }}
            </td>

        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top;border: 1px solid #000; padding-left: 5px">
                <strong>Cara Pulang :</strong>
            </td>
            <td colspan="6" style="vertical-align: top;border: 1px solid #000; padding-left: 5px">
                {{ $resumeMedis['cara_pulang'] }}
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top;border: 1px solid #000; padding-left: 5px">
                <strong>Keadaan Umum :</strong>
            </td>
            <td colspan="6" style="vertical-align: top;border: 1px solid #000; padding-left: 5px">
                <div>
                    <div>
                        <strong>Tekanan Darah</strong>
                        <span>: {{ $resumeMedis['sistole'] }} / {{ $resumeMedis['diastole'] }} mmHg</span>
                    </div>
                    <div>
                        <strong>Nadi</strong>
                        <span>: {{ $resumeMedis['nadi'] }} bpm</span>
                    </div>
                    <div>
                        <strong>Pernafasan</strong>
                        <span>: {{ $resumeMedis['respirasi'] }} kali/menit</span>
                    </div>
                    <div>
                        <strong>Suhu</strong>
                        <span>: {{ $resumeMedis['suhu'] }} °C</span>
                    </div>
                    {{-- <div>
                        <strong>Kesadaran</strong>
                        <span>: {{ $resumeMedis['kesadaran'] }}</span>
                    </div>
                    <div>
                        <strong>Skala Nyeri</strong>
                        <span>: {{ $resumeMedis['skala_nyeri'] }}</span>
                    </div> --}}
                </div>
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top;border: 1px solid #000; padding-left: 5px">
                <strong>Terapi Pulang </strong>
            </td>
            <td colspan="6" style="vertical-align: top;border: 1px solid #000; padding-left: 5px">
                <ol>
                    @foreach ($resumeMedis['terapi_pulang'] as $terapi)
                        <li>{{ $terapi['nama_obat'] }} ({{ (int)$terapi['jumlah'] }}) - {{ $terapi['frekuensi'] }} - {{ $terapi['cara_pakai'] }}
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
