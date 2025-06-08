<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ $triage['nama_pasien'] }}</title>
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
                <h3 style="font-size: 16px;">TRIAGE</h3>
            </td>
        </tr>
    </table>
    <table>
        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Nama Pasien :</strong>
                <br>
                {{ $triage['nama_pasien'] }}
            </td>
            <td colspan="2"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Nomor RM :</strong>
                <br>
                {{ $triage['no_rm'] }}
            </td>
            <td colspan="2"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Tanggal Lahir :</strong>
                <br>
                {{ formatTanggalIndo($triage['tanggal_lahir']) }}
            </td>
            <td colspan="2"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Jenis Kelamin :</strong>
                <br>
                {{ $triage['jenis_kelamin'] }}
            </td>
        </tr>
        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Cara Datang</strong>
            </td>
            <td colspan="6"
                style="vertical-align: top; height: 70px; width: 60%; border: 1px solid #000; padding-left: 5px">
                <div>
                    <strong>Kedatangan Pasien</strong> :
                    @if ($triage['cara_datang']['JENIS'] == 1)
                        <span>Datang Sendiri, diantar Oleh {{ $triage['cara_datang']['PENGANTAR'] }}</span>
                    @endif
                </div>

                <div>
                    <strong>Datang Menggunakan</strong> : <span>{{ $triage['cara_datang']['ALAT_TRANSPORTASI'] }}</span>
                </div>

                <div>
                    <strong>Rujukan Dari</strong> :
                    <span>{{ $triage['cara_datang']['ASAL_RUJUKAN'] === '' ? 'Tidak ada' : $triage['cara_datang']['ASAL_RUJUKAN'] }}</span>
                </div>

                <div>
                    <strong>Dari Kepolisian</strong> :
                    <span>{{ $triage['cara_datang']['KEPOLISIAN'] === '' ? 'Tidak ada' : $triage['cara_datang']['KEPOLISIAN'] }}</span>
                </div>
            </td>
        </tr>
        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Macam Kasus</strong>
            </td>
            <td colspan="6"
                style="vertical-align: top; height: 70px; width: 60%; border: 1px solid #000; padding-left: 5px">
                <div>
                    @if ($triage['macam_kasus']['JENIS'] == 1)
                        <strong>Trauma</strong> :
                        @if ($triage['macam_kasus']['LAKA_LANTAS'] == 1)
                            <input type="checkbox" checked>
                            <span>Laka Lantas</span>
                        @endif
                        <br>
                        @if ($triage['macam_kasus']['KECELAKAAN_KERJA'] == 1)
                            <input type="checkbox" checked>
                            <span>Kecelakaan Kerja</span>
                        @endif
                        <br>
                        <strong>Lokasi Kejadian</strong> : {{ $triage['macam_kasus']['DIMANA'] }}
                    @endif

                    @if ($triage['macam_kasus']['JENIS'] == 0)
                        <strong>Non-Trauma</strong> :
                        Tidak ada keterangan kasus
                        <br>
                        <strong>Lokasi Kejadian</strong> :
                        {{ $triage['macam_kasus']['DIMANA'] === '' ? 'Tidak ada keterangan' : $triage['macam_kasus']['DIMANA'] }}
                    @endif

                    @if ($triage['macam_kasus']['JENIS'] === '')
                        <strong>Tidak ada keterangan kasus</strong>
                    @endif
                </div>
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Anamnesa</strong>
            </td>
            <td colspan="3"
                style="vertical-align: top; height: 70px; width: 60%; border: 1px solid #000; padding-left: 5px">
                <div>
                    <strong>Tanggal Masuk</strong> : {{ formatTanggalIndo($triage['tanggal_masuk']) }}
                </div>
                <div>
                    <strong>Keluhan Utama</strong> : {{ $triage['anamnesa']['KELUHAN_UTAMA'] }}
                </div>
                <div>
                    <strong>Anamnesa Terpimpim</strong> : {{ $triage['anamnesa']['TERPIMPIN'] }}
                </div>
            </td>
            <td colspan="3"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <div>
                    <strong>Tekanan Darah</strong> :
                    {{ $triage['tanda_vital']['SISTOLE'] . '/' . $triage['tanda_vital']['DIASTOLE'] }} mmHg
                </div>
                <div>
                    <strong>Frekuensi Nadi</strong> : {{ $triage['tanda_vital']['FREK_NADI'] }} bpm
                </div>
                <div>
                    <strong>Frekuensi Pernapasan</strong> : {{ $triage['tanda_vital']['FREK_NAFAS'] }} x/menit
                </div>
                <div>
                    <strong>Suhu</strong> : {{ $triage['tanda_vital']['SUHU'] }} °C
                </div>
                <div>
                    <strong>Nyeri</strong> : {{ $triage['tanda_vital']['SKALA_NYERI'] ?? 0 }}
                    {{ $triage['tanda_vital']['METODE_UKUR'] ?? '' }}
                </div>
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Petugas Triage</strong>
            </td>
            <td colspan="3" style="vertical-align: top; width: 60%; border: 1px solid #000; padding-left: 5px">
                <center style="font-weight: bold;">
                    Primer
                </center>
            </td>
            <td colspan="3" style="vertical-align: top; width: 60%; border: 1px solid #000; padding-left: 5px">
                <center style="font-weight: bold;">
                    Sekunder
                </center>
            </td>
        </tr>
        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2"
                style="vertical-align: top; height:50px ;width: 20%; border: 1px solid #000; padding-left: 5px">
            </td>
            <td colspan="3"
                style="vertical-align: top; height:50px ;width: 60%; border: 1px solid #000; padding-left: 5px">
                <center style="font-weight: bold;">
                    {{ $triage['petugas'] }}
                </center>
            </td>
            <td colspan="3"
                style="vertical-align: top; height:50px ;width: 60%; border: 1px solid #000; padding-left: 5px">
                <center style="font-weight: bold;">

                </center>
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Kebutuhan Khusus</strong>
            </td>
            <td colspan="6" style="vertical-align: top; width: 60%; border: 1px solid #000; padding: 5px">
                @if ($triage['kebutuhan_khusus']['AIRBONE'] == 1)
                    <input type="checkbox"> <span>Tidak ada kebutuhan khusus</span><br>
                    <input type="checkbox" checked> <span>AIRBONE</span><br>
                    <input type="checkbox"> <span>DEKONTAMINAN</span><br>
                @elseif ($triage['kebutuhan_khusus']['DEKONTAMINAN'] == 1)
                    <input type="checkbox"> <span>Tidak ada kebutuhan khusus</span><br>
                    <input type="checkbox"> <span>AIRBONE</span><br>
                    <input type="checkbox" checked> <span>DEKONTAMINAN</span><br>
                @else
                    <input type="checkbox" checked> <span>Tidak ada kebutuhan khusus</span><br>
                    <input type="checkbox"> <span>AIRBONE</span><br>
                    <input type="checkbox"> <span>DEKONTAMINAN</span><br>
                @endif
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Pemeriksaan</strong>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px; background: blue; color:white;">
                <center>Resusitasi (P1)</center> <br>
                @if ($triage['resusitasi']['CHECKED'] == 1)
                    <center>
                        <input type="checkbox" checked style="width: 20px; height: 20px;">
                    </center>
                @endif
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px; background: Red; color:white;">
                <center>Emergency (P2)</center> <br>
                @if ($triage['emergency']['CHECKED'] == 1)
                    <center>
                        <input type="checkbox" checked style="width: 20px; height: 20px;">
                    </center>
                @endif
            </td>
            <td
                style="vertical-align: top; border: 1px solid #000; padding-left: 5px; background: Yellow; color:black;">
                <center>Urgent (P3)</center> <br>
                @if ($triage['urgent']['CHECKED'] == 1)
                    <center>
                        <input type="checkbox" checked style="width: 20px; height: 20px;">
                    </center>
                @endif
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px; background: Green; color:white;">
                <center>Less Urgent (P4)</center> <br>
                @if ($triage['less_urgent']['CHECKED'] == 1)
                    <center>
                        <input type="checkbox" checked style="width: 20px; height: 20px;">
                    </center>
                @endif
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px; background: white; color:black;">
                <center>Non-Urgent (P5)</center> <br>
                @if ($triage['non_urgent']['CHECKED'] == 1)
                    <center>
                        <input type="checkbox" checked style="width: 20px; height: 20px;">
                    </center>
                @endif
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px; background: black; color:white;">
                <center>Expectant (Non-Priority)</center> <br>
                @if ($triage['death']['CHECKED'] == 1)
                    <center>
                        <input type="checkbox" checked style="width: 20px; height: 20px;">
                    </center>
                @endif
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Jalan Nafas</strong>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <ol>
                    <li>Sumbatan(obstruction)</li>
                </ol>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <ol>
                    <li>Stridor</li>
                </ol>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <ol>
                    <li>Stridor Corpal tanpa tanda gangguan pernafasan</li>
                </ol>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <ol>
                    <li>Bebas (patent)</li>
                </ol>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <ol>
                    <li>Bebas (patent)</li>
                </ol>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px">

            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Pernafasan</strong>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <ol>
                    <li>Henti Nafas (Breathing Arrest)</li>
                    <li>Freak Nafas (RR) < 10 x/Menit</li>
                    <li>Sianosis</li>
                </ol>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <ol>
                    <li>Freak Nafas (RR) < 32 x/Menit</li>
                    <li>Wheezing</li>
                    <li>Gurgling</li>
                </ol>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <ol>
                    <li>Freak Nafas (RR) > 24-32 x/Menit</li>
                    <li>Wheezing</li>
                </ol>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <ol>
                    <li>Freak Nafas (RR) > 24-32 x/Menit</li>
                </ol>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <ol>
                    <li>Freak Nafas (RR) > 24-32 x/Menit</li>
                </ol>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px">

            </td>
        </tr>
        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Sirkulasi</strong>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <ol>
                    <li>Henti jantung (Cardiac Arrest)</li>
                    <li>Nadi tidak teraba (Pulsene)</li>
                    <li>Pucat</li>
                    <li>Akral Dingin</li>
                </ol>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <ol>
                    <li>Nadi teraba lemah (Weakness pulse)</li>
                    <li>Frek nadi (HR) < 50 x/mnt </li>
                    <li>Frek nadi (HR) > 150 x/mnt (Dws)</li>
                    <li>Pucat</li>
                    <li>Akral Dingin</li>
                    <li>CRT < 2 detik</li>
                </ol>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <ol>
                    <li>Frek Nadi (HR) > 120 - 150 x/mnt</li>
                    <li>TD Sist > 160 mmHg</li>
                    <li>TD Diast > 100 mmHg</li>
                </ol>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <ol>
                    <li>Frek Nadi (HR) > 100 - 120 x/mnt</li>
                    <li>TD Sist > 120 - 140 mmHg</li>
                    <li>TD Diast > 80 - 100 mmHg</li>
                </ol>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <ol>
                    <li>Frek Nadi (HR) > 80 - 100 x/mnt</li>
                    <li>TD Sist > 120 mmHg</li>
                    <li>TD Diast > 80 mmHg</li>
                </ol>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px">

            </td>
        </tr>
        <tr style="font-size: 13px; text-align: left;">
            <td colspan="2" style="vertical-align: top; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong>Kesadaran</strong>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <ol>
                    <li>GCS < 9</li>
                </ol>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <ol>
                    <li>GCS 9 - 12</li>
                    <li>Pupil unisokor</li>
                </ol>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <ol>
                    <li>GCS > 12</li>
                </ol>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <ol>
                    <li>GCS 15</li>
                </ol>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <ol>
                    <li>GCS 15</li>
                </ol>
            </td>
            <td style="vertical-align: top; border: 1px solid #000; padding-left: 5px">
                <ol>
                    <li>Pupil Midriasis Total</li>
                    <li>Kaku Mayat</li>
                </ol>
            </td>
        </tr>
        <tr style="font-size: 13px; text-align: left;">
            <td colspan="4" style="vertical-align: top; width: 20%; border: 1px solid #000; padding-left: 5px">
                <center>
                    <strong>Perawat</strong> <br>
                    {{ $triage['nama_perawat'] }} <br>
                    <img src="{{ $triage['tanda_tangan_perawat'] }}" alt=""> <br>
                    {{ $triage['nip_perawat'] }}
                </center>
            </td>
            <td colspan="4" style="vertical-align: top; width: 20%; border: 1px solid #000; padding-left: 5px">
                <center>
                    <strong>Dokter</strong> <br>
                    {{ $triage['nama_dokter'] }} <br>
                    <img src="{{ $triage['tanda_tangan_dokter'] }}" alt=""> <br>
                    {{ $triage['nip_dokter'] }}
                </center>
            </td>
        </tr>
    </table>
</body>

</html>
