@foreach ($dataLaboratorium as $group)
    @foreach ($group as $dataLab)
        <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>{{ $pasien['nama_pasien'] }}</title>
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

        #tabel-laboratorium th {
            background: #f3f3f3;
            font-size: 14px;
            padding: 5px;
            border: 1px solid #000;
        }

        #tabel-laboratorium td {
            font-size: 10px;
            border: none;
        }

        #tabel-laboratorium .last-row-tindakan td {
            border-bottom: 1px solid #000 !important;
        }

        #tabel-laboratorium td,
        #tabel-laboratorium th {
            border-left: 1px solid #000;
            border-right: 1px solid #000;
        }

        .page-break {
            page-break-after: always;
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
                    $waktu = $tanggal->format('H:i:s');
                    if ($waktu !== '00:00:00') {
                        return "$hari $bulanIndo $tahun $waktu";
                    } else {
                        return "$hari $bulanIndo $tahun";
                    }
                }
            }
        @endphp
        {{-- KOP --}}
        <table>
            <tr>
                <td colspan="2">
                    <img src="{{ $imageBase64 }}" alt="Logo Klinik" style="padding-left:20px; width: 50px; height: 50px;">
                </td>
                <td colspan="6">
                    <div style="line-height: 1.2">
                        <h3 style="font-size: 20px; text-align: left; margin-top: 10px">KLINIK RAWAT INAP UTAMA
                            MUHAMMADIYAH KEDUNGADEM</h3>
                        <p style="font-size: 12px; text-align: left; margin-top: -20px;">
                            Jl. PUK Desa Drokilo. Kec. Kedungadem Kab. Bojonegoro <br>
                            Email : klinik.muh.kedungadem@gmail.com | WA : 082242244646 <br>
                        </p>
                    </div>
                </td>
            </tr>
            <tr style="background: black; color: white; text-align: center;">
                <td colspan="8">
                    <h3 style="font-size: 16px;">Hasil Laboratorium</h3>
                </td>
            </tr>
        </table>

        <table style="font-size: 12px;">
            <tr>
                <td style="width: 12%;">No. RM</td>
                <td style="width: 30%;">: {{ $pasien['NORM'] }}</td>
                <td style="width: 12%;">Nama Pasien</td>
                <td style="width: 30%;">: {{ $pasien['NAMA'] }}</td>
            </tr>
            <tr>
                <td>Jenis Kelamin</td>
                <td>: {{ $pasien['JENIS_KELAMIN'] == 1 ? 'Laki-laki' : 'Perempuan' }}</td>
                <td>Tanggal Lahir</td>
                <td>: {{ formatTanggalIndo($pasien['TANGGAL_LAHIR']) }}</td>
            </tr>
            <tr>
                <td>Tanggal Masuk</td>
                <td>: {{ formatTanggalIndo($dataLab['DATA_KUNJUNGAN']['MASUK']) }}</td>
                <td>Ruangan Perujuk</td>
                <td>: {{ $dataLab['RUANGAN_PERUJUK'] }}</td>
            </tr>
            <tr>
                <td>Tanggal Keluar</td>
                <td>: {{ formatTanggalIndo($dataLab['DATA_KUNJUNGAN']['KELUAR']) }}</td>
                <td>Alamat</td>
                <td>: {{ $pasien['ALAMAT'] }}</td>
            </tr>
        </table>

        <table id="tabel-laboratorium">
            <thead>
                <tr>
                    <th class="tindakan" style="width:29%;">Tindakan</th>
                    <th style="width:22%;">Parameter</th>
                    <th style="width:12%;">Hasil</th>
                    <th style="width:22%;">Nilai Normal</th>
                    <th style="width:5%;">Satuan</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $hasilCount = count($dataLab['hasil_lab']);
                @endphp
                @if ($hasilCount > 0)
                    @foreach ($dataLab['hasil_lab'] as $idx => $hasil)
                        <tr @if ($idx === $hasilCount - 1) class="last-row-tindakan" @endif>
                            @if ($idx === 0)
                                <td class="tindakan @if ($hasilCount === 1) last-row-td @endif"
                                    style="vertical-align: top; border-bottom: 1px solid #000;"
                                    rowspan="{{ $hasilCount }}">
                                    {{ $dataLab['tindakan_laboratorium']['NAMA'] ?? '-' }}
                                </td>
                            @endif
                            <td style="vertical-align: top;">
                                {{ $hasil['parameter_tindakan_lab']['PARAMETER'] ?? '-' }}</td>
                            <td style="vertical-align: top;">{{ $hasil['HASIL'] ?? '' }}</td>
                            <td style="vertical-align: top;">
                                {{ $hasil['NILAI_NORMAL'] ?? ($hasil['parameter_tindakan_lab']['NILAI_RUJUKAN'] ?? '') }}
                            </td>
                            <td style="vertical-align: top;">
                                {{ $hasil['SATUAN'] ?? ($hasil['parameter_tindakan_lab']['SATUAN'] != 0 ? $hasil['parameter_tindakan_lab']['SATUAN'] : '') }}
                            </td>
                        </tr>
                    @endforeach
                @else
                    <tr>
                        <td class="tindakan last-row-td">{{ $dataLab['tindakan_laboratorium']['NAMA'] ?? '-' }}
                        </td>
                        <td class="tanggal last-row-td">
                            {{ \Carbon\Carbon::parse($dataLab['TANGGAL'])->format('d - F - Y') }}</td>
                        <td colspan="4" style="text-align:center;">-</td>
                    </tr>
                @endif
            </tbody>
        </table>
        <table>
            <tr style="font-size: 12px;">
                <td style="width: 50%; text-align: center; padding: 10px; padding-top: 20px;">
                    <strong>Petugas Laboratorium</strong>
                    <br>
                    <img src="{{ $dataLab['QRCODE_PEGAWAI'] ?? '' }}" alt="" width="50px" height="50px"
                        style="padding: 10px"> <br>
                    {{ $dataLab['NAMA_PEGAWAI'] ?? '-' }} <br>
                </td>
                <td style="width: 50%; text-align: center; padding: 10px">
                    BOJONEGORO,
                    {{ $dataLab['DATA_KUNJUNGAN']['MASUK'] ? \Carbon\Carbon::parse($dataLab['DATA_KUNJUNGAN']['KELUAR'])->format('d F Y') : '-' }}
                    <br>
                    <strong>Dokter Penanggung Jawab</strong>
                    <br>
                    <img src="{{ $dataLab['QRCODE_DOKTER'] ?? '' }}" alt="" width="50px" height="50px"
                        style="padding: 10px"> <br>
                    {{ $dataLab['NAMA_DOKTER'] ?? '-' }} <br>
                </td>
            </tr>
        </table>
        {{-- AKHIR --}}
    </body>

    </html>
        @if (!$loop->parent->last || !$loop->last)
            <div class="page-break"></div>
        @endif
    @endforeach
@endforeach
