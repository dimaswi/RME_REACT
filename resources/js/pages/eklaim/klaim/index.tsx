import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, Home, ListCollapse, Loader, Save } from 'lucide-react';
import React, { useState } from 'react';

export default function KlaimIndex() {
    const { dataPendaftaran, filters } = usePage().props as unknown as {
        dataPendaftaran: {
            data: any[];
            links: any[];
            current_page: number;
            last_page: number;
            per_page: number;
        };
        filters?: {
            q?: string;
            perPage?: number;
        };
    };

    const [itemsPerPage, setItemsPerPage] = useState(dataPendaftaran.per_page || 10);
    const [query, setQuery] = useState(filters?.q || '');
    const [selectedPoli, setSelectedPoli] = useState('');
    const [selectedKelas, setSelectedKelas] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: <Home className="mr-1 inline" />,
            href: '/eklaim/klaim',
        },
    ];

    // Search otomatis setiap karakter diketik
    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        router.get(route('eklaim.klaim.index'), { page: 1, per_page: itemsPerPage, q: value }, { preserveState: true, replace: true });
    };

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        router.get(route('eklaim.klaim.index'), { page: 1, per_page: e.target.value, q: query }, { preserveState: true });
    };

    const handlePageChange = (url: string | null) => {
        if (url) {
            const urlObj = new URL(url, window.location.origin);
            urlObj.searchParams.set('per_page', String(itemsPerPage));
            urlObj.searchParams.set('q', query);
            router.get(urlObj.pathname + urlObj.search, {}, { preserveState: true });
        }
    };

    const [modalData, setModalData] = useState<any | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [loadingAjukan, setLoadingAjukan] = useState(false);

    const handleRowClick = (item: any) => {
        setModalData(item);
        setShowModal(true);
        console.log('Row clicked:', item);
    };

    const formatTanggalIndo = (tanggal: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(tanggal).toLocaleDateString('id-ID', options);
    };

    const prevLink = dataPendaftaran.links.find((l) => l.label === 'Previous' || l.label === '&laquo; Previous');
    const nextLink = dataPendaftaran.links.find((l) => l.label === 'Next' || l.label === 'Next &raquo;');
    const badgeStatus = (status: number) => {
        switch (status) {
            case 0:
                return <Badge className="bg-red-100 text-red-800">Belum Diajukan</Badge>;
            case 1:
                return <Badge className="bg-green-100 text-green-800">Sudah Diajukan</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
        }
    };

    const handleAjukanKlaim = async () => {
        const data = {
            nomor_kartu: modalData.noKartu,
            nomor_sep: modalData.noSEP,
            nomor_rm: modalData.kartu_asuransi_pasien.NORM,
            nama_pasien: modalData.data_peserta.NAMA,
            nomor_pendaftaran: modalData.penjamin_pendaftaran.NOPEN,
            tgl_lahir: modalData.data_peserta.tglLahir,
            gender: modalData.data_peserta.sex == 'L' ? '1' : '2',
            jenis_perawatan: modalData.poliTujuan == 'IGD' ? 'Gawat Darurat' : modalData.poliTujuan == '' ? 'Rawat Inap' : 'Rawat Jalan',
        };

        router.post(route('eklaim.klaim.storePengajuanKlaim'), data, {
            onStart: () => setLoadingAjukan(true),
            onFinish: () => {
                setLoadingAjukan(false);
                setShowModal(false);
            },
        });
    };

    const tanggal_awal = usePage().props.tanggal_awal || '';
    const tanggal_akhir = usePage().props.tanggal_akhir || '';

    function parseDate(str: string): Date | undefined {
        if (!str) return undefined;
        const d = new Date(str);
        return isNaN(d.getTime()) ? undefined : d;
    }

    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: parseDate(tanggal_awal),
        to: parseDate(tanggal_akhir),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Klaim" />
            <div className="p-4">
                {/* Single Search Field */}
                <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={handleQueryChange}
                        className="w-64 rounded-md border p-1 text-sm"
                        placeholder="Cari Nomor Kartu atau Nomor SEP"
                    />
                    <Button
                        variant="outline"
                        onClick={() =>
                            router.get(
                                route('eklaim.klaim.indexPengajuanKlaim'),
                                { page: 1, per_page: itemsPerPage, q: query },
                                { preserveState: true },
                            )
                        }
                    >
                        <ListCollapse size={12} />
                        Data Pengajuan
                    </Button>
                </div>
                <div className="w-full overflow-x-auto rounded-md border">
                    <div className="flex items-center justify-end gap-2 border-b bg-gray-50 p-4">
                        {/* Filter Kelas */}
                        <Select
                            value={selectedKelas}
                            onValueChange={(val) => {
                                setSelectedKelas(val);
                                router.get(
                                    route('eklaim.klaim.index'),
                                    {
                                        ...filters,
                                        page: 1,
                                        per_page: itemsPerPage,
                                        q: query,
                                        kelas: val === 'ALL' ? '' : val,
                                        poli: selectedPoli === 'ALL' ? '' : selectedPoli,
                                        tanggal_awal: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
                                        tanggal_akhir: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
                                    },
                                    { preserveState: true, replace: true },
                                );
                            }}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter Kelas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Semua Kelas</SelectItem>
                                <SelectItem value="1">Kelas 1</SelectItem>
                                <SelectItem value="2">Kelas 2</SelectItem>
                                <SelectItem value="3">Kelas 3</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Filter Poli */}
                        <Select
                            value={selectedPoli}
                            onValueChange={(val) => {
                                setSelectedPoli(val);
                                router.get(
                                    route('eklaim.klaim.index'),
                                    {
                                        ...filters,
                                        page: 1,
                                        per_page: itemsPerPage,
                                        q: query,
                                        // Rawat Inap = '', ALL = 'ALL', lainnya = kode poli
                                        poli: val === 'RAWAT_INAP' ? '' : val === 'ALL' ? '' : val,
                                        kelas: selectedKelas === 'ALL' ? '' : selectedKelas,
                                        tanggal_awal: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
                                        tanggal_akhir: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
                                    },
                                    { preserveState: true, replace: true },
                                );
                            }}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter Poli" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={JSON.stringify(['', 'INT', 'OBG', 'ANA', 'BED', 'IGD'])}>Semua Poli</SelectItem>
                                <SelectItem value={JSON.stringify([''])}>Rawat Inap</SelectItem>
                                <SelectItem value={JSON.stringify(['INT'])}>Poli Penyakit Dalam</SelectItem>
                                <SelectItem value={JSON.stringify(['ANA'])}>Poli Anak</SelectItem>
                                <SelectItem value={JSON.stringify(['OBG'])}>Poli Obgyn</SelectItem>
                                <SelectItem value={JSON.stringify(['BED'])}>Poli Bedah</SelectItem>
                                <SelectItem value={JSON.stringify(['IGD'])}>Gawat Darurat</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Filter tanggal tetap */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-[260px] justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange.from && dateRange.to
                                        ? `${format(dateRange.from, 'dd MMM yyyy')} - ${format(dateRange.to, 'dd MMM yyyy')}`
                                        : 'Pilih Rentang Tanggal'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-auto p-0">
                                <div className="flex flex-col gap-2 p-4">
                                    <Calendar
                                        mode="range"
                                        selected={dateRange}
                                        onSelect={(range) => {
                                            setDateRange(range);
                                            if (range.from && range.to) {
                                                router.get(
                                                    route('eklaim.klaim.index'),
                                                    {
                                                        ...filters,
                                                        tanggal_awal: format(range.from, 'yyyy-MM-dd'),
                                                        tanggal_akhir: format(range.to, 'yyyy-MM-dd'),
                                                        kelas: selectedKelas,
                                                        poli: selectedPoli,
                                                    },
                                                    { preserveState: true },
                                                );
                                            }
                                        }}
                                        numberOfMonths={2}
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 self-end"
                                        onClick={() => {
                                            setDateRange({ from: undefined, to: undefined });
                                            router.get(
                                                route('eklaim.klaim.index'),
                                                {
                                                    ...filters,
                                                    tanggal_awal: '',
                                                    tanggal_akhir: '',
                                                    kelas: selectedKelas,
                                                    poli: selectedPoli,
                                                },
                                                { preserveState: true },
                                            );
                                        }}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Table className="w-full min-w-max">
                        <TableHeader>
                            <TableRow>
                                <TableHead>SEP</TableHead>
                                <TableHead>Nama Lengkap</TableHead>
                                <TableHead>Kode Poli</TableHead>
                                <TableHead>Tanggal SEP</TableHead>
                                <TableHead>Kelas</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dataPendaftaran.data.length > 0 ? (
                                dataPendaftaran.data.map((item, idx) => (
                                    <TableRow key={item.NORM} className="cursor-pointer hover:bg-blue-50" onClick={() => handleRowClick(item)}>
                                        <TableCell>{item.noSEP}</TableCell>
                                        <TableCell>{item.data_peserta.nama}</TableCell>
                                        <TableCell>{item.poliTujuan ? item.poliTujuan : 'Rawat Inap'}</TableCell>
                                        <TableCell>{formatTanggalIndo(item.tglSEP)}</TableCell>
                                        <TableCell>{item.data_peserta.nmKelas}</TableCell>
                                        <TableCell>{badgeStatus(item.klaimStatus)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        Data tidak ditemukan
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {/* Pagination dan item per page */}
                <div className="mt-4 flex flex-wrap items-center justify-between">
                    {/* Informasi Halaman */}
                    <div className="text-sm text-gray-700">
                        Page {dataPendaftaran.current_page} of {dataPendaftaran.last_page}
                    </div>
                    {/* Pagination dan item per page */}
                    <div className="flex items-center space-x-4">
                        {/* Selector untuk jumlah item per halaman */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm">Baris :</span>
                            <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="rounded-md border p-1 text-sm">
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                        {/* Tombol Pagination */}
                        <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(prevLink?.url)} disabled={!prevLink?.url}>
                                Previous
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(nextLink?.url)} disabled={!nextLink?.url}>
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-10 text-sm"
                    onMouseDown={(e) => {
                        // Tutup modal jika klik di luar konten modal
                        if (e.target === e.currentTarget) setShowModal(false);
                    }}
                >
                    <div className="mx-4 w-full max-w-7xl rounded-lg bg-white shadow-lg" onMouseDown={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-center border-b px-4 py-3">
                            <Home className="mr-2 text-blue-500" />
                            <h2 className="flex-1 text-lg font-semibold">Detail Pasien</h2>
                            <button className="text-xl text-gray-400 hover:text-gray-700" onClick={() => setShowModal(false)} aria-label="Tutup">
                                &times;
                            </button>
                        </div>
                        {/* Modal Body */}
                        <div className="m-4 rounded bg-blue-50 p-2 text-[11px]">
                            <div>
                                <b>Nama Pasien:</b> {modalData?.data_peserta?.nama || 'Tidak Diketahui'}
                            </div>
                            <div>
                                <b>Nomor Kartu:</b> {modalData?.data_peserta?.noKartu || 'Tidak Diketahui'}
                            </div>
                            <div>
                                <b>Tanggal Lahir:</b> {formatTanggalIndo(modalData?.data_peserta?.tglLahir) || 'Tidak Diketahui'}
                            </div>
                            <div>
                                <b>No SEP:</b> {modalData?.noSEP || 'Tidak Diketahui'}
                            </div>
                            <div>
                                <b>Tgl SEP:</b> {formatTanggalIndo(modalData?.tglSEP) || 'Tidak Diketahui'}
                            </div>
                            <div>
                                <b>Ruangan</b> : {modalData?.poliTujuan || 'Rawat Inap'}
                            </div>
                        </div>
                        {/* Modal Footer */}
                        <div className="flex justify-end gap-2 border-t px-4 py-2">
                            {modalData?.klaimStatus === 0 && (
                                <Button variant="outline" disabled={loadingAjukan} onClick={() => handleAjukanKlaim()}>
                                    {loadingAjukan ? (
                                        <>
                                            <Loader className="mr-2 h-4 w-4 animate-spin text-blue-400" />
                                            Mengajukan Klaim...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4 text-green-400" /> Ajukan Klaim
                                        </>
                                    )}
                                </Button>
                            )}
                            <Button variant="outline" onClick={() => setShowModal(false)}>
                                Tutup
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
