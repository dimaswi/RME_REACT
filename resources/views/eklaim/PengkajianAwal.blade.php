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
                {{ formatTanggalIndo($pengkajianAwal['tanggal_masuk']) }} <br>
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
                {{ formatTanggalIndo($pengkajianAwal['tanggal_lahir']) }} <br>
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
                    <li><b>Riwayat Penyakit Sekarang</b> :
                        <span>{{ $pengkajianAwal['riwayat_penyakit_sekarang'] }}</span>
                    </li>
                    <li><b>Riwayat Penyakit Dahulu</b> : <span>{{ $pengkajianAwal['riwayat_penyakit_dahulu'] }}</span>
                    </li>
                    <li><b>Riwayat Pengobatan</b> : <span>{{ $pengkajianAwal['riwayat_pengobatan'] }}</span></li>
                    <li><b>Riwayat Penyakit Keluarga</b> :
                        <span>{{ $pengkajianAwal['riwayat_penyakit_keluarga'] }}</span>
                    </li>
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
                    <li><b>Anemis</b> : <span>{{ $pengkajianAwal['mata'] }}</span></li>
                    <li><b>Ikterus</b> : <span>{{ $pengkajianAwal['ikterus'] }}</span></li>
                    <li><b>Pupil</b> : <span>{{ $pengkajianAwal['pupil'] }}</span></li>
                    <li><b>Diameter</b> : <span>{{ $pengkajianAwal['diameter'] }}</span></li>
                    <li><b>Udem Palpebrae</b> : <span>{{ $pengkajianAwal['udem_palpebrae'] }}</span></li>
                    <li><b>THT</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Leher</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Tongsil</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Faring</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Lidah</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Bibir</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>JVP</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Pembesaran Kelenjar Limfe</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Kaku Kuduk</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Thoraks</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Cor</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>s1s2</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Mur-Mur</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Pulmo</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Suara Nafas</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Ronchi</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Wheezing</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Abdomen</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Peristaltik</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Asites</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Hepar</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Nyeri Tekan</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Lien</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Extremitas</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Udem</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Defeksesi</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Urin</b> : <span>Tidak Ada Kelainan</span></li>
                    <li><b>Lain-lain</b> : <span>Tidak Ada Kelainan</span></li>
                </ol>
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="8"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong><u>Riwayat Alergi</u></strong> <br>
                {{ $pengkajianAwal['riwayat_alergi'] }}
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="8"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong><u>Hubungan Status Psikosisial Spiritual</u></strong> <br>
                <ol>
                    <li><b>Status Psikologis</b> : <span>Tidak ada kelainan</span></li>
                    <li><b>Status Mental</b> : <span>Tidak ada kelainan</span></li>
                    <li><b>Hubungan Dengan Anggota Keluarga</b> : <span>Normal</span></li>
                    <li><b>Tempat Tinggal</b> : <span>Rumah</span></li>
                    <li><b>Agama</b> : <span>Tidak Diketahui</span></li>
                    <li><b>Kebiasaan Beribadah</b> : <span>Tidak Diketahui</span></li>
                    <li><b>Pekerjaan</b> : <span>Tidak Diketahui</span></li>
                    <li><b>Penghasilan</b> : <span>Tidak Diketahui</span></li>
                </ol>
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="8"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong><u>Penilaian Nyeri</u></strong> <br>
                <ol>
                    <li><b>Nyeri</b> : <span>Tidak ada </span></li>
                    <li><b>Onset</b> : <span>Tidak ada</span></li>
                    <li><b>Pencetus</b> : <span>Normal</span></li>
                    <li><b>Lokasi Nyeri</b> : <span>Tidak ada</span></li>
                    <li><b>Gambaran</b> : <span>Tidak Diketahui</span></li>
                    <li><b>Durasi</b> : <span>Tidak Diketahui</span></li>
                    <li><b>Skala Nyeri</b> : <span>Tidak ada</span></li>
                    <li><b>Metode</b> : <span>Tidak ada</span></li>
                </ol>
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="8"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong><u>Resiko Jatuh</u></strong> <br>
                <ol>
                    <li><b>Risiko Jatuh</b> : <span>Tidak ada </span></li>
                    <li><b>Skor</b> : <span>Tidak ada</span></li>
                    <li><b>Metode</b> : <span>Tidak Diketahui</span></li>
                </ol>
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="8"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong><u>Resiko Gizi</u></strong> <br>
                <ol>
                    <li><b>Penurunan Berat Badan</b> : <span>Tidak ada </span></li>
                    <li><b>Penurunan Asupan Makan</b> : <span>Tidak ada</span></li>
                    <li><b>Pasien dengan Diagnosis Khusus</b> : <span>Tidak Diketahui</span></li>
                </ol>
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="8"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong><u>Edukasi Pasien / Keluarga</u></strong> <br>
                Tidak ada
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="8"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong><u>Rencana Pulang / Discharge Planning</u></strong> <br>
                <ol>
                    <li><b>Skrinning Faktor Resiko Pasien Pulang</b> : <span>Tidak ada </span></li>
                    <li><b>Faktor Resiko Pulang</b> : <span>Tidak ada</span></li>
                    <li><b>Tindak Lanjut</b> : <span>Tidak ada</span></li>
                </ol>
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="8"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong><u>Masalah Keperawatan</u></strong> <br>
                Tidak ada
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="8"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong><u>Rencana Keperawatan</u></strong> <br>
                Tidak ada
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="8"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong><u>Masalah Medis</u></strong> <br>
                {{ $pengkajianAwal['anamnesis'] }}
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="8"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong><u>Diagnosa Medis</u></strong> <br>
                {{ $pengkajianAwal['diagnosa'] }}
            </td>
        </tr>

        <tr style="font-size: 13px; text-align: left;">
            <td colspan="8"
                style="vertical-align: top; height: 70px; width: 20%; border: 1px solid #000; padding-left: 5px">
                <strong><u>Rencana Terapi / Tindakan</u></strong> <br>
                {{ $pengkajianAwal['rencana_terapi'] }}
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
                <strong id='nama_dokter'>{{ $pengkajianAwal['nama_dokter'] }}</strong>
                <br>
                NIP. {{ $pengkajianAwal['nip_dokter'] }}
            </td>
        </tr>
    </table>
</body>

</html>
