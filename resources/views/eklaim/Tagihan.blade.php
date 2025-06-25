<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ $dataPasien['NAMA'] }}</title>
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

    .tabel-tagihan {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #000;
        table-layout: fixed;
    }

    .tabel-tagihan th,
    .tabel-tagihan td {
        border: 1px solid #000;
        padding: 4px;
        font-size: 11px;
    }

    .tabel-tagihan th:nth-child(1),
    .tabel-tagihan td:nth-child(1) {
        width: 7%;
    }

    .tabel-tagihan th:nth-child(2),
    .tabel-tagihan td:nth-child(2) {
        width: 43%;
    }

    .tabel-tagihan th:nth-child(3),
    .tabel-tagihan td:nth-child(3) {
        width: 15%;
    }

    .tabel-tagihan th:nth-child(4),
    .tabel-tagihan td:nth-child(4) {
        width: 15%;
    }

    .tabel-tagihan th:nth-child(5),
    .tabel-tagihan td:nth-child(5) {
        width: 20%;
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
                    return "$hari $bulanIndo $tahun";
                } else {
                    return "$hari $bulanIndo $tahun";
                }
            }
        }
    @endphp
    @php
        if (!function_exists('formatRupiah')) {
            function formatRupiah($angka)
            {
                return 'Rp ' . number_format($angka, 0, ',', '.');
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
                <h3 style="font-size: 16px;">TAGIHAN PASIEN</h3>
            </td>
        </tr>
    </table>
    <table>
        <tr style="border: 1px solid black; font-size: 12px; text-align: left; background: #f2f2f2;">
            <td style="border: 1px solid black; padding: 5px; width: 50%;">
                <table style="border: none">
                    <tr>
                        <td style="min-width:100px; width: 100px;"><strong>Nama Pasien</strong></td>
                        <td>: {{ $dataPasien['NAMA'] }}</td>
                    </tr>
                    <tr>
                        <td><strong>No. RM</strong></td>
                        <td>: {{ $dataPasien['NORM'] }}</td>
                    </tr>
                    <tr>
                        <td><strong>Jenis Kelamin</strong></td>
                        <td>: {{ $dataPasien['JENIS_KELAMIN'] == 1 ? 'Laki-laki' : 'Perempuan' }}</td>
                    </tr>
                    <tr>
                        <td><strong>Alamat</strong></td>
                        <td>: {{ $dataPasien['ALAMAT'] }}</td>
                    </tr>
                    <tr>
                        <td><strong>Tanggal Lahir</strong></td>
                        <td>: {{ formatTanggalIndo($dataPasien['TANGGAL_LAHIR']) }}</td>
                    </tr>
                </table>
            </td>
            <td style="border: 1px solid black; padding: 5px; width: 50%; vertical-align: top;">
                <table style="border: none; vertical-align: top;">
                    <tr>
                        <td style="min-width:100px; width: 100px;"><strong>Tanggal Masuk</strong></td>
                        <td>: {{ formatTanggalIndo($tanggalMasuk) }}</td>
                    </tr>
                    <tr>
                        <td><strong>Tanggal Pulang</strong></td>
                        <td>: {{ formatTanggalIndo($tanggalKeluar) }}</td>
                    </tr>
                    <tr>
                        <td><strong>Ruangan</strong></td>
                        <td>: {{ $ruangan }}</td>
                    </tr>
                    <tr>
                        <td><strong>Penjamin</strong></td>
                        <td>: {{ $penjamin }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    @php
        $perPage = 30;
        $total = count($rincianTagihan);
        $pages = ceil($total / $perPage);
    @endphp

    @for ($page = 0; $page < $pages; $page++)
        @php
            $start = $page * $perPage;
            $end = min(($page + 1) * $perPage, $total);
        @endphp

        <table class="tabel-tagihan">
            @if ($page == 0)
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Nama Tindakan</th>
                        <th>Jumlah</th>
                        <th>Tarif</th>
                        <th>Total</th>
                    </tr>
                </thead>
            @endif
            <tbody>
                @for ($i = $start; $i < $end; $i++)
                    @php $item = $rincianTagihan[$i]; @endphp
                    <tr>
                        <td>{{ $i + 1 }}</td>
                        @if ($item['jenis'] === '1')
                            <td>Tarif Admisi {{ $item['tarif_administrasi']['ruangan']['DESKRIPSI'] ?? '' }} </td>
                        @elseif ($item['jenis'] === '2')
                            <td>Tarif Ruang Perawatan
                                {{ $item['tarif_ruang_rawat']['ruangan_kelas']['DESKRIPSI'] ?? '' }}</td>
                        @elseif ($item['jenis'] === '3')
                            <td>Tarif Tindakan {{ $item['tarif_tindakan']['tindakan']['NAMA'] ?? '' }}</td>
                        @elseif ($item['jenis'] === '4')
                            <td>Tarif Obat {{ $item['harga_barang']['obat']['NAMA'] ?? '' }}</td>
                        @elseif ($item['jenis'] === '5')
                            <td>Tarif Paket Pengobatan </td>
                        @elseif ($item['jenis'] === '6')
                            <td>Tarif Oksigen </td>
                        @else
                            <td> - </td>
                        @endif
                        <td>{{ (int) $item['jumlah'] }}</td>
                        <td>{{ formatRupiah($item['tarif']) }}</td>
                        <td>{{ formatRupiah($item['jumlah'] * $item['tarif']) }}</td>
                    </tr>
                @endfor
            </tbody>
            {{-- @if ($page == $pages - 1)
                <tfoot>
                    <tr>
                        <td style="text-align: right; font-weight: bold;"></td>
                        <td style="text-align: right; font-weight: bold;"></td>
                        <td style="text-align: right; font-weight: bold;"></td>
                        <td style="text-align: right; font-weight: bold;">Total</td>
                        <td>
                            {{ formatRupiah(
                                collect($rincianTagihan)->sum(function ($item) {
                                    return $item['jumlah'] * $item['tarif'];
                                }),
                            ) }}
                        </td>
                    </tr>
                    <tr style="border: none">
                        <td style="border: none"></td>
                        <td style="border: none"></td>
                        <td style="border: none"></td>
                        <td style="border: none" colspan="2">
                            <center>
                                BOJONEGORO, {{ formatTanggalIndo($tanggalKeluar) }} <br>
                                <img src="{{ $qrcode_petugas }}" alt="" style="width: 70px; height: 70px; padding: 10px;"> <br>
                                <strong>{{ $dataPembayaran['pegawai']['NAMA'] }}</strong>
                            </center>
                        </td>
                    </tr>
                </tfoot>
            @endif --}}
        </table>
        @if ($page < $pages - 1)
            <div style="page-break-after: always;"></div>
        @endif
    @endfor
</body>

</html>
