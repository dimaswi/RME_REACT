import SearchableDropdown from '@/components/SearchableDropdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Download, Home } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface HasilLab {
    ID: string;
    TINDAKAN_MEDIS: string;
    PARAMETER_TINDAKAN: string | number;
    TANGGAL: string;
    HASIL: string;
    NILAI_NORMAL: string;
    SATUAN: string;
    KETERANGAN: string;
    OLEH: string | number;
    OTOMATIS: number;
    parameter_tindakan_lab: {
        PARAMETER: string;
    };
    STATUS: number;
}

interface TindakanLab {
    ID: any;
    KUNJUNGAN: string;
    TINDAKAN: string | number;
    TANGGAL: string | null;
    OLEH: string | number;
    STATUS: number;
    OTOMATIS: number;
    tindakan_laboratorium: {
        ID: string;
        NAMA: string;
    };
    hasil_lab: HasilLab[];
}

// Fungsi format tanggal Indonesia
function formatTanggalIndo(tanggal: string) {
    if (!tanggal) return '';
    const bulanIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const dateObj = new Date(tanggal);
    if (isNaN(dateObj.getTime())) return tanggal; // fallback jika format tidak valid
    const tgl = dateObj.getDate();
    const bln = bulanIndo[dateObj.getMonth()];
    const thn = dateObj.getFullYear();
    return `${tgl} - ${bln} - ${thn}`;
}

export default function EditLaboratorium() {
    const dataKlaim = usePage().props.pengajuanKlaim;
    const dataKunjunganLab = usePage().props.dataKunjunganLab as Array<{ ID: string; TANGGAL: string; RUANGAN: string }>;
    const pegawai = usePage().props.pegawai as Array<{ ID: string; DESKRIPSI: string }>;

    const [showModal, setShowModal] = useState(false);
    const [petugas, setPetugas] = useState('');
    const [dokter, setDokter] = useState('');
    const [pendingSave, setPendingSave] = useState(false);
    const [selectedKunjungan, setSelectedKunjungan] = useState<string | undefined>(undefined);
    const [selectedJenisData, setSelectedJenisData] = useState<string | undefined>(undefined);
    const [selectedTindakanLab, setSelectedTindakanLab] = useState<string | undefined>(undefined);

    const listTindakanLab = usePage().props.listTindakanLab as Array<{
        ID: string;
        NAMA: string;
        PARAMETER: Array<{ ID: string; PARAMETER: string; NILAI_RUJUKAN: string; SATUAN: string }>;
    }>;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: <Home className="mr-1 inline" />,
            href: route('eklaim.klaim.index'),
        },
        {
            title: 'List Pengajuan Klaim',
            href: route('eklaim.klaim.indexPengajuanKlaim'),
        },
        {
            title: dataKlaim.nomor_SEP,
            href: route('eklaim.klaim.dataKlaim', { dataKlaim: dataKlaim.id }),
        },
        {
            title: 'Edit Data Laboratorium',
            href: '#',
        },
    ];

    const [dataTindakan, setDataTindakan] = useState<TindakanLab[]>([]);
    const [showTable, setShowTable] = useState(false);

    // Untuk tindakan dinamis
    const [dynamicTindakan, setDynamicTindakan] = useState<TindakanLab[]>([]);

    // Untuk baris tambah baru
    const [addRow, setAddRow] = useState<{ tindakanId?: string; hasil_lab: HasilLab[] }>({ hasil_lab: [] });

    // Tambahkan state untuk table default
    const [showDefaultTable, setShowDefaultTable] = useState(true);

    // Handler hapus tindakan (baik dari backend maupun dynamic)
    const handleDeleteTindakan = (id: string) => {
        // Jika dataTindakan (backend), hapus dari state dataTindakan
        if (dataTindakan.some((t) => t.ID === id)) {
            setDataTindakan((prev) => prev.filter((t) => t.ID !== id));
        } else {
            // Jika dynamicTindakan (tindakan baru), hapus dari state dynamicTindakan
            setDynamicTindakan((prev) => prev.filter((t) => t.ID !== id));
        }
    };

    // Gabungkan dataTindakan (dari backend) dan dynamicTindakan (tambahan user)
    const allTindakan = [...dataTindakan, ...dynamicTindakan];

    const handleLoadData = async () => {
        if (selectedKunjungan && selectedJenisData) {
            try {
                const response = await axios.get(
                    route('getDataLaboratorium', {
                        nomorKunjungan: selectedKunjungan,
                        jenisData: selectedJenisData,
                    }),
                );
                if (response.data && Array.isArray(response.data)) {
                    setDataTindakan(response.data);
                    setShowTable(true);
                    setShowDefaultTable(false); // Hapus table default setelah load
                    toast.success('Data laboratorium berhasil dimuat.');
                } else {
                    setShowTable(false);
                    setShowDefaultTable(false);
                    toast.error('Gagal memuat data laboratorium.');
                }
            } catch {
                setShowTable(false);
                setShowDefaultTable(false);
                toast.error('Gagal memuat data laboratorium.');
            }
        }
    };

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    function getOlehFromDataTindakan() {
        if (dataTindakan.length > 0) {
            return dataTindakan[0].OLEH ?? '';
        }
        return '';
    }

    // Handler ketika pilih tindakan pada baris tambah
    const handleSelectTindakanBaru = (tindakanId: string) => {
        const tindakan = listTindakanLab.find((t) => t.ID === tindakanId);
        if (!tindakan) return;
        setAddRow({
            tindakanId,
            hasil_lab: tindakan.PARAMETER.map((param) => ({
                ID: (Math.floor(Math.random() * 1000000000) + 1).toString(), // Generate random ID
                TINDAKAN_MEDIS: tindakanId,
                PARAMETER_TINDAKAN: param.ID,
                TANGGAL: null,
                HASIL: '',
                NILAI_NORMAL: param.NILAI_RUJUKAN ?? '',
                SATUAN: param.SATUAN ?? '',
                KETERANGAN: '',
                OLEH: getOlehFromDataTindakan(),
                OTOMATIS: 0,
                parameter_tindakan_lab: {
                    PARAMETER: param.PARAMETER,
                    NILAI_RUJUKAN: param.NILAI_RUJUKAN ?? '',
                    SATUAN: param.SATUAN ?? '',
                },
                STATUS: 1,
            })),
        });
    };

    // Handler simpan baris baru ke dynamicTindakan
    const handleSimpanBaru = () => {
        if (!addRow.tindakanId) return;
        const tindakan = listTindakanLab.find((t) => t.ID === addRow.tindakanId);
        if (!tindakan) return;
        // Ambil tanggal dari inputan user (kolom tabel)
        const tanggal = addRow.hasil_lab[0]?.TANGGAL ?? null;
        setDynamicTindakan((prev) => [
            ...prev,
            {
                ID: (Math.floor(Math.random() * 1000000000) + 1).toString(), // Generate random ID
                KUNJUNGAN: selectedKunjungan ?? '',
                TINDAKAN: tindakan.ID,
                TANGGAL: tanggal, // <-- Ambil dari input tanggal user
                OLEH: getOlehFromDataTindakan(),
                STATUS: 1,
                OTOMATIS: 0,
                tindakan_laboratorium: { ID: tindakan.ID, NAMA: tindakan.NAMA },
                hasil_lab: addRow.hasil_lab,
            },
        ]);
        setAddRow({ hasil_lab: [] });
    };

    // Handler edit hasil pada baris tambah
    const handleEditHasilBaru = (idx: number, value: string) => {
        setAddRow((row) => ({
            ...row,
            hasil_lab: row.hasil_lab.map((h, i) => (i === idx ? { ...h, HASIL: value } : h)),
        }));
    };

    const handleSimpan = () => {
        if (allTindakan.length === 0) {
            toast.error('Tidak ada data laboratorium yang disimpan.');
            return;
        }
        setShowModal(true);
        setPendingSave(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Laboratorium" />
            <div className="flex gap-6">
                <div className="w-1/2 gap-5 p-4">
                    <h1 className="text-2xl font-bold">Edit Laboratorium</h1>
                </div>
                <div className="flex w-full justify-end gap-5 p-4">
                    <div>
                        <Select value={selectedJenisData} onValueChange={setSelectedJenisData}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Pilih Jenis Data" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Real">
                                    <Badge className="bg-green-400">Real</Badge> Data Asli
                                </SelectItem>
                                <SelectItem value="Rekondisi">
                                    <Badge className="bg-yellow-400">Rekondisi</Badge> Data Rekondisi
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Select value={selectedKunjungan} onValueChange={setSelectedKunjungan}>
                            <SelectTrigger className="w-[220px]">
                                <SelectValue placeholder="Pilih Kunjungan Laboratorium" />
                            </SelectTrigger>
                            <SelectContent>
                                {selectedJenisData === 'Real' &&
                                    dataKunjunganLab.map((item) => (
                                        <SelectItem key={item.ID} value={item.ID}>
                                            <div className="flex flex-col">
                                                <Badge className="h-6 w-full bg-green-400">{item.RUANGAN}</Badge>
                                                {selectedKunjungan !== item.ID && (
                                                    <div className="text-xs font-medium text-gray-700">{item.TANGGAL}</div>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                {selectedJenisData === 'Rekondisi' &&
                                    dataKunjunganLab.map((item) => (
                                        <SelectItem key={item.ID} value={item.ID}>
                                            <div className="flex flex-col">
                                                <Badge className="h-6 w-full bg-yellow-400">{item.RUANGAN}</Badge>
                                                {selectedKunjungan !== item.ID && (
                                                    <div className="text-xs font-medium text-gray-700">{item.TANGGAL}</div>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Button
                            className="h-8 w-30 rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                            disabled={!selectedKunjungan || !selectedJenisData}
                            onClick={handleLoadData}
                        >
                            <Download className="mr-2 inline" />
                            Load
                        </Button>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-all">
                    <div className="animate-in fade-in zoom-in-95 relative w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
                        <button
                            className="absolute top-3 right-3 text-gray-400 transition hover:text-gray-700"
                            onClick={() => {
                                setShowModal(false);
                                setPendingSave(false);
                            }}
                            aria-label="Tutup"
                        >
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="mb-4 flex flex-col items-center gap-2">
                            <div className="mb-2 rounded-full bg-blue-100 p-3">
                                <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                                    <path
                                        stroke="#2563eb"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 12v.01M8 12v.01M16 12v.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8Z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800">Konfirmasi Data</h2>
                            <p className="text-center text-sm text-gray-500">
                                Silakan isi nama petugas dan dokter sebelum menyimpan data laboratorium.
                            </p>
                        </div>
                        <div className="mb-3">
                            <label className="mb-1 block text-xs font-semibold text-gray-600">Nama Petugas</label>
                            <SearchableDropdown
                                data={pegawai}
                                value={petugas}
                                setValue={setPetugas}
                                placeholder="Cari Nama Petugas"
                                getOptionLabel={(item) => item.DESKRIPSI}
                                getOptionValue={(item) => item.ID}
                                autoFocus
                            />
                        </div>
                        <div className="mb-5">
                            <label className="mb-1 block text-xs font-semibold text-gray-600">Nama Dokter</label>
                            <SearchableDropdown
                                data={pegawai}
                                value={dokter}
                                setValue={setDokter}
                                placeholder="Cari Nama Dokter"
                                getOptionLabel={(item) => item.DESKRIPSI}
                                getOptionValue={(item) => item.ID}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                    setShowModal(false);
                                    setPendingSave(false);
                                }}
                            >
                                Batal
                            </Button>
                            <Button
                                className="rounded-lg bg-blue-600 px-5 text-white hover:bg-blue-700"
                                onClick={async () => {
                                    if (!petugas || !dokter) {
                                        toast.error('Nama petugas & dokter wajib diisi');
                                        return;
                                    }
                                    setShowModal(false);
                                    setPendingSave(false);
                                    // Kirim data ke backend
                                    try {
                                        const response = await axios.post(route('eklaim.editData.storeLaboratorium'), {
                                            kunjungan_id: selectedKunjungan,
                                            data: allTindakan,
                                            pengajuanKlaim_id: dataKlaim.id,
                                            petugas,
                                            dokter,
                                        });
                                        if (response.data.success) {
                                            toast.success(response.data.success);
                                        } else {
                                            toast.error(response.data.error);
                                        }
                                    } catch (error: any) {
                                        console.error('Error saving data:', error);
                                        toast.error('Gagal menyimpan data laboratorium.');
                                    }
                                    setPetugas('');
                                    setDokter('');
                                }}
                            >
                                Simpan
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table default: hanya baris tambah tindakan, tampil sebelum klik Load */}
            {showDefaultTable && (
                <div className="mb-10 w-full overflow-x-auto">
                    <table className="min-w-full border text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="w-[10%] border px-2 py-1">Tindakan</th>
                                <th className="w-[10%] border px-2 py-1">Tanggal</th>
                                <th className="w-[20%] border px-2 py-1">Parameter</th>
                                <th className="w-[10%] border px-2 py-1">Hasil</th>
                                <th className="w-[25%] border px-2 py-1">Nilai Normal</th>
                                <th className="w-[15%] border px-2 py-1">Satuan</th>
                                <th className="w-[5%] border px-2 py-1"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Baris tambah baru */}
                            <tr>
                                <td className="border px-2 py-1 align-top">
                                    <Select value={addRow.tindakanId} onValueChange={handleSelectTindakanBaru}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder="Pilih Tindakan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {listTindakanLab.map((t) => (
                                                <SelectItem key={t.ID} value={t.ID}>
                                                    {t.NAMA}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </td>
                                <td className="border px-2 py-1 align-top">
                                    {addRow.tindakanId && (
                                        <input
                                            type="date"
                                            className="border px-1 py-0.5"
                                            value={addRow.hasil_lab[0]?.TANGGAL?.slice(0, 10) || ''}
                                            onChange={(e) => {
                                                const tanggalBaru = e.target.value;
                                                setAddRow((row) => ({
                                                    ...row,
                                                    hasil_lab: row.hasil_lab.map((h) => ({
                                                        ...h,
                                                        TANGGAL: tanggalBaru,
                                                    })),
                                                }));
                                            }}
                                        />
                                    )}
                                </td>
                                <td className="border px-2 py-1"></td>
                                <td className="border px-2 py-1"></td>
                                <td className="border px-2 py-1"></td>
                                <td className="border px-2 py-1"></td>
                                <td className="border px-2 py-1 align-top">
                                    {addRow.tindakanId && (
                                        <Button size="sm" className="bg-green-400 hover:bg-green-700" onClick={handleSimpanBaru}>
                                            Tambah
                                        </Button>
                                    )}
                                </td>
                            </tr>
                            {/* Parameter dan hasil otomatis muncul setelah pilih tindakan */}
                            {addRow.tindakanId &&
                                addRow.hasil_lab.map((hasil, idx) => (
                                    <tr key={hasil.ID}>
                                        <td className="border px-2 py-1"></td>
                                        <td className="border px-2 py-1"></td>
                                        <td className="border px-2 py-1">{hasil.parameter_tindakan_lab.PARAMETER}</td>
                                        <td className="border px-2 py-1">
                                            <input
                                                className="w-full border px-1 py-0.5"
                                                value={hasil.HASIL}
                                                onChange={(e) => handleEditHasilBaru(idx, e.target.value)}
                                            />
                                        </td>
                                        <td className="border px-2 py-1">{hasil.NILAI_NORMAL}</td>
                                        <td className="border px-2 py-1">{hasil.SATUAN}</td>
                                        <td className="border px-2 py-1"></td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Table hasil load dari backend */}
            {showTable && (
                <div className="mb-10 w-full overflow-x-auto">
                    <table className="min-w-full border text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="w-[10%] border px-2 py-1">Tindakan</th>
                                <th className="w-[10%] border px-2 py-1">Tanggal</th>
                                <th className="w-[20%] border px-2 py-1">Parameter</th>
                                <th className="w-[10%] border px-2 py-1">Hasil</th>
                                <th className="w-[25%] border px-2 py-1">Nilai Normal</th>
                                <th className="w-[15%] border px-2 py-1">Satuan</th>
                                <th className="w-[5%] border px-2 py-1"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {allTindakan.map((tindakan, tindakanIdx) => {
                                const hasilCount = tindakan.hasil_lab && tindakan.hasil_lab.length > 0 ? tindakan.hasil_lab.length : 1;
                                const isDynamic = dynamicTindakan.some((t) => t.ID === tindakan.ID);

                                return (
                                    <React.Fragment key={tindakan.ID}>
                                        {tindakan.hasil_lab && tindakan.hasil_lab.length > 0 ? (
                                            tindakan.hasil_lab.map((hasil, idx) => (
                                                <tr key={hasil.ID}>
                                                    {idx === 0 && (
                                                        <>
                                                            <td className="border px-2 py-1 align-top" rowSpan={hasilCount}>
                                                                {tindakan.tindakan_laboratorium?.NAMA ?? '-'}
                                                            </td>
                                                            <td className="border px-2 py-1 align-top" rowSpan={hasilCount}>
                                                                {formatTanggalIndo(tindakan.TANGGAL)}
                                                            </td>
                                                        </>
                                                    )}
                                                    <td className="border px-2 py-1">{hasil.parameter_tindakan_lab.PARAMETER}</td>
                                                    <td className="border px-2 py-1">
                                                        {/* Jika dari backend (bukan dynamic), input akan update dataTindakan */}
                                                        <input
                                                            className="w-full border px-1 py-0.5"
                                                            value={hasil.HASIL}
                                                            onChange={(e) => {
                                                                if (isDynamic) {
                                                                    // Untuk data dinamis (tindakan baru)
                                                                    setDynamicTindakan((prev) =>
                                                                        prev.map((t) =>
                                                                            t.ID === tindakan.ID
                                                                                ? {
                                                                                      ...t,
                                                                                      hasil_lab: t.hasil_lab.map((h) =>
                                                                                          h.ID === hasil.ID ? { ...h, HASIL: e.target.value } : h,
                                                                                      ),
                                                                                  }
                                                                                : t,
                                                                        ),
                                                                    );
                                                                } else {
                                                                    // Untuk data dari backend
                                                                    setDataTindakan((prev) =>
                                                                        prev.map((t) =>
                                                                            t.ID === tindakan.ID
                                                                                ? {
                                                                                      ...t,
                                                                                      hasil_lab: t.hasil_lab.map((h) =>
                                                                                          h.ID === hasil.ID ? { ...h, HASIL: e.target.value } : h,
                                                                                      ),
                                                                                  }
                                                                                : t,
                                                                        ),
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="border px-2 py-1">{hasil.NILAI_NORMAL}</td>
                                                    <td className="border px-2 py-1">{hasil.SATUAN}</td>
                                                    {idx === 0 && (
                                                        <td className="border px-2 py-1 align-top" rowSpan={hasilCount}>
                                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteTindakan(tindakan.ID)}>
                                                                Hapus
                                                            </Button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td className="border px-2 py-1" rowSpan={1}>
                                                    {tindakan.tindakan_laboratorium?.NAMA ?? '-'}
                                                </td>
                                                <td className="border px-2 py-1" rowSpan={1}>
                                                    {formatTanggalIndo(tindakan.TANGGAL)}
                                                </td>
                                                <td className="border px-2 py-1 text-center" colSpan={4}>
                                                    -
                                                </td>
                                                <td className="border px-2 py-1" rowSpan={1}>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteTindakan(tindakan.ID)}>
                                                        Hapus
                                                    </Button>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}

                            {/* Baris tambah baru */}
                            <tr>
                                <td className="border px-2 py-1 align-top">
                                    <Select value={addRow.tindakanId} onValueChange={handleSelectTindakanBaru}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder="Pilih Tindakan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {listTindakanLab.map((t) => (
                                                <SelectItem key={t.ID} value={t.ID}>
                                                    {t.NAMA}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </td>
                                <td className="border px-2 py-1 align-top">
                                    {addRow.tindakanId && (
                                        <input
                                            type="date"
                                            className="border px-1 py-0.5"
                                            value={addRow.hasil_lab[0]?.TANGGAL?.slice(0, 10) || ''}
                                            onChange={(e) => {
                                                const tanggalBaru = e.target.value;
                                                setAddRow((row) => ({
                                                    ...row,
                                                    hasil_lab: row.hasil_lab.map((h) => ({
                                                        ...h,
                                                        TANGGAL: tanggalBaru,
                                                    })),
                                                }));
                                            }}
                                        />
                                    )}
                                </td>
                                <td className="border px-2 py-1"></td>
                                <td className="border px-2 py-1"></td>
                                <td className="border px-2 py-1"></td>
                                <td className="border px-2 py-1"></td>
                                <td className="border px-2 py-1 align-top">
                                    {addRow.tindakanId && (
                                        <Button size="sm" className="bg-green-400 hover:bg-green-700" onClick={handleSimpanBaru}>
                                            Tambah
                                        </Button>
                                    )}
                                </td>
                            </tr>
                            {/* Parameter dan hasil otomatis muncul setelah pilih tindakan */}
                            {addRow.tindakanId &&
                                addRow.hasil_lab.map((hasil, idx) => (
                                    <tr key={hasil.ID}>
                                        <td className="border px-2 py-1"></td>
                                        <td className="border px-2 py-1"></td>
                                        <td className="border px-2 py-1">{hasil.parameter_tindakan_lab.PARAMETER}</td>
                                        <td className="border px-2 py-1">
                                            <input
                                                className="w-full border px-1 py-0.5"
                                                value={hasil.HASIL}
                                                onChange={(e) => handleEditHasilBaru(idx, e.target.value)}
                                            />
                                        </td>
                                        <td className="border px-2 py-1">{hasil.NILAI_NORMAL}</td>
                                        <td className="border px-2 py-1">{hasil.SATUAN}</td>
                                        <td className="border px-2 py-1"></td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>

                    {/* Tambah handle button simpan */}
                    <div className="flex justify-end pt-5">
                        <Button className="h-10 w-50 bg-blue-400 hover:bg-blue-700" onClick={handleSimpan}>
                            Simpan
                        </Button>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
