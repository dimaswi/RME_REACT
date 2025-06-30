import SearchableDropdown from '@/components/SearchableDropdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Download, Home, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type HasilRadiologi = {
    ID: string | number;
    KLINIS: string;
    KESAN: string;
    USUL: string;
    HASIL: string;
};

type DataRadiologi = {
    ID: string | number;
    tindakan_radiologi: { ID: string };
    hasil_radiologi: HasilRadiologi;
};

export default function EditRadiologi() {
    const dataKlaim = usePage().props.pengajuanKlaim;
    const dataKunjunganRadiologi = usePage().props.dataKunjunganRadiologi as Array<{ ID: string; TANGGAL: string; RUANGAN: string }>;
    const tindakanRad = usePage().props.tindakanRad as Array<{ ID: string; NAMA: string }>;
    const pegawai = usePage().props.pegawai as Array<{ ID: string; DESKRIPSI: string }>;

    const [selectedKunjungan, setSelectedKunjungan] = useState<string | undefined>(undefined);
    const [selectedJenisData, setSelectedJenisData] = useState<string | undefined>(undefined);
    const [dataRadiologi, setDataRadiologi] = useState<DataRadiologi[]>([]);
    const [addRow, setAddRow] = useState<{ nama: string; klinis: string; kesan: string; usul: string; hasil: string }>({
        nama: '',
        klinis: '',
        kesan: '',
        usul: '',
        hasil: '',
    });
    const [showModal, setShowModal] = useState(false);
    const [petugas, setPetugas] = useState('');
    const [dokter, setDokter] = useState('');
    const [pendingSave, setPendingSave] = useState(false);

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
            title: 'Edit Data Radiologi',
            href: '#',
        },
    ];

    const handleLoadData = async () => {
        if (selectedKunjungan && selectedJenisData) {
            try {
                const response = await axios.get(
                    route('getDataRadiologi', {
                        nomorKunjungan: selectedKunjungan,
                        jenisData: selectedJenisData,
                    }),
                );
                if (response.data && Array.isArray(response.data)) {
                    setDataRadiologi(response.data);
                    toast.success('Data radiologi berhasil dimuat.');
                } else {
                    setDataRadiologi([]);
                    toast.error('Gagal memuat data radiologi.');
                }
            } catch {
                setDataRadiologi([]);
                toast.error('Gagal memuat data radiologi.');
            }
        }
    };

    const handleAddRow = () => {
        if (!addRow.nama) {
            toast.error('Nama tindakan wajib diisi');
            return;
        }
        // Cari objek tindakan dari list tindakanRad
        const tindakanObj = tindakanRad.find(t => t.ID === addRow.nama);
        setDataRadiologi((prev) => [
            ...prev,
            {
                ID: Date.now(),
                KUNJUNGAN: selectedKunjungan,
                tindakan_radiologi: tindakanObj ? { ID: tindakanObj.ID, NAMA: tindakanObj.NAMA } : { ID: addRow.nama, NAMA: '' },
                hasil_radiologi: {
                    ID: Date.now(),
                    KLINIS: addRow.klinis,
                    KESAN: addRow.kesan,
                    USUL: addRow.usul,
                    HASIL: addRow.hasil,
                },
            },
        ]);
        setAddRow({ nama: '', klinis: '', kesan: '', usul: '', hasil: '' });
    };

    const handleDeleteRow = (rowIdx: number) => {
        setDataRadiologi((prev) => prev.filter((_, i) => i !== rowIdx));
    };

    const handleSimpanData = async () => {
        if (dataRadiologi.length === 0) {
            toast.error('Tidak ada data radiologi yang disimpan.');
            return;
        }
        setShowModal(true);
        setPendingSave(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Radiologi" />
            <div className="flex gap-6">
                <div className="w-1/2 p-4">
                    <h1 className="text-2xl font-bold">Edit Radiologi</h1>
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
                                <SelectValue placeholder="Pilih Kunjungan Radiologi" />
                            </SelectTrigger>
                            <SelectContent>
                                {selectedJenisData === 'Real' &&
                                    dataKunjunganRadiologi.map((item) => (
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
                                    dataKunjunganRadiologi.map((item) => (
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

            {/* Modal Petugas dan Dokter */}
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
                            <p className="text-center text-sm text-gray-500">Silakan isi nama petugas dan dokter sebelum menyimpan data radiologi.</p>
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
                                    router.post(
                                        route('eklaim.editData.storeRadiologi', {
                                            nomorKunjungan: selectedKunjungan,
                                            jenisData: selectedJenisData,
                                        }),
                                        {
                                            data: dataRadiologi,
                                            jenisData: selectedJenisData,
                                            petugas,
                                            dokter,
                                            dataKlaim,
                                            nomorKunjungan: selectedKunjungan,
                                        },
                                        {
                                            only: ['dataKunjunganRadiologi', 'flash', 'success', 'error'], // sesuaikan dengan props yang ingin di-reload
                                            onSuccess: () => {
                                                toast.success('Data radiologi berhasil disimpan.');
                                                setDataRadiologi([]);
                                                setPetugas('');
                                                setDokter('');
                                            },
                                            onError: (errors) => {
                                                toast.error('Gagal menyimpan data radiologi.');
                                            },
                                            onFinish: () => {
                                                console.log(dataKlaim);
                                            }
                                        }
                                    );
                                }}
                            >
                                Simpan
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table data radiologi */}
            <div className="p-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-48">NAMA</TableHead>
                            <TableHead className="w-32">KLINIS</TableHead>
                            <TableHead className="w-48">KESAN</TableHead>
                            <TableHead className="w-32">USUL</TableHead>
                            <TableHead className="w-64">HASIL</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dataRadiologi.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">
                                    Tidak ada data radiologi.
                                </TableCell>
                            </TableRow>
                        )}
                        {dataRadiologi.map((row, rowIdx) => (
                            <TableRow key={row.hasil_radiologi.ID}>
                                <TableCell className="align-top">{row.tindakan_radiologi?.NAMA ?? '-'}</TableCell>
                                <TableCell className="align-top">{row.hasil_radiologi?.KLINIS ?? '-'}</TableCell>
                                <TableCell className="align-top">
                                    {row.hasil_radiologi?.KESAN
                                        ? row.hasil_radiologi.KESAN.split('\n').map((line, idx) => (
                                            <span key={idx}>
                                                {line}
                                                <br />
                                            </span>
                                        ))
                                        : '-'}
                                </TableCell>
                                <TableCell className="align-top">{row.hasil_radiologi?.USUL ?? '-'}</TableCell>
                                <TableCell className="align-top">
                                    {row.hasil_radiologi?.HASIL
                                        ? row.hasil_radiologi.HASIL.split('\n').map((line, idx) => (
                                            <span key={idx}>
                                                {line}
                                                <br />
                                            </span>
                                        ))
                                        : '-'}
                                </TableCell>
                                <TableCell className="align-top">
                                    <Button variant="destructive" size="icon" onClick={() => handleDeleteRow(rowIdx, 0)} title="Hapus">
                                        <Trash2 size={16} />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {/* Form tambah data sebagai baris baru di bawah */}
                        <TableRow>
                            <TableCell className="align-top">
                                <Select value={addRow.nama} onValueChange={(val) => setAddRow((r) => ({ ...r, nama: val }))}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih Tindakan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tindakanRad?.map((tindakan) => (
                                            <SelectItem key={tindakan.ID} value={tindakan.ID}>
                                                {tindakan.NAMA}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell className="align-top">
                                <input
                                    className="w-full rounded border px-2 py-1"
                                    placeholder="Klinis"
                                    value={addRow.klinis}
                                    onChange={(e) => setAddRow((r) => ({ ...r, klinis: e.target.value }))}
                                />
                            </TableCell>
                            <TableCell>
                                <textarea
                                    className="h-40 min-h-[40px] w-full rounded border px-2 py-1"
                                    placeholder="Kesan"
                                    value={addRow.kesan}
                                    onChange={(e) => setAddRow((r) => ({ ...r, kesan: e.target.value }))}
                                />
                            </TableCell>
                            <TableCell>
                                <textarea
                                    className="h-40 min-h-[40px] w-full rounded border px-2 py-1"
                                    placeholder="Usul"
                                    value={addRow.usul}
                                    onChange={(e) => setAddRow((r) => ({ ...r, usul: e.target.value }))}
                                />
                            </TableCell>
                            <TableCell>
                                <textarea
                                    className="h-40 min-h-[40px] w-full rounded border px-2 py-1"
                                    placeholder="Hasil"
                                    value={addRow.hasil}
                                    onChange={(e) => setAddRow((r) => ({ ...r, hasil: e.target.value }))}
                                />
                            </TableCell>
                            <TableCell>
                                <Button className="bg-green-600" onClick={handleAddRow} title="Tambah">
                                    <Plus size={16} />
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <div className="flex justify-end p-4">
                    <Button className="bg-blue-600 text-white" onClick={handleSimpanData} disabled={dataRadiologi.length === 0}>
                        Simpan Semua Data
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
