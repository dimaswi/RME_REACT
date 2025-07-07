import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { AlignJustify, CalendarIcon, Home, Info, Search, Trash, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import CollapseBelumDiajukan from './collapseBelumDiajukan';
import FinalGroupingCollapse from './collapseFinalGrouping';
import GroupingOneCollapse from './collapseGroupingOne';
import PengajuanKlaimCollapse from './collapseListPengajuan';
import SudahTerkirimCollapse from './collapseSudahKirim';

// Function untuk memformat tanggal
const formatTanggal = (tanggal: string | null) => {
    if (!tanggal) return '-';
    return format(new Date(tanggal), 'd MMMM yyyy', { locale: id });
};

// Function untuk menampilkan badge status
const getStatusBadge = (status: number, id: string) => {
    const statusMap: Record<number, { label: string; badgeClass: string }> = {
        0: { label: 'Belum Diajukan', badgeClass: 'bg-red-500 text-white hover:bg-red-700' },
        1: { label: 'Sudah Diajukan', badgeClass: 'bg-amber-500 text-white hover:bg-amber-700' },
        2: { label: 'Grouper', badgeClass: 'bg-blue-500 text-white hover:bg-blue-700' },
        3: { label: 'Final', badgeClass: 'bg-green-500 text-white hover:bg-green-700' },
        4: { label: 'Dikirim', badgeClass: 'bg-green-500 text-white hover:bg-green-700' },
    };
    const statusInfo = statusMap[status] || { label: 'Unknown', badgeClass: 'bg-gray-300 text-gray-800' };
    return (
        <Badge
            onClick={() => router.get(route('eklaim.klaim.getStatusKlaim', { pengajuanKlaim: id }))}
            variant="outline"
            className={`hover:cursor-pointer ${statusInfo.badgeClass}`}
        >
            {statusInfo.label}
        </Badge>
    );
};

const FILTER_STORAGE_KEY = 'pengajuan_filter_state';
const DATA_STORAGE_KEY = 'pengajuan_data_state';

export default function ListPengajuan() {
    // Ambil filter dari localStorage jika ada
    const getInitialFilters = () => {
        const saved = localStorage.getItem(FILTER_STORAGE_KEY);
        if (saved && saved !== '') {
            try {
                const parsed = JSON.parse(saved);
                // Pastikan struktur sesuai select (status array, jenis_kunjungan string, dst)
                return {
                    status: Array.isArray(parsed.status) ? parsed.status : [0, 1, 2, 3, 4],
                    jenis_kunjungan: typeof parsed.jenis_kunjungan === 'string' ? parsed.jenis_kunjungan : 'all',
                    jenis_tanggal: typeof parsed.jenis_tanggal === 'string' ? parsed.jenis_tanggal : 'MASUK', // tambahkan ini
                    tanggal_awal: parsed.tanggal_awal ?? '',
                    tanggal_akhir: parsed.tanggal_akhir ?? '',
                    perPage: parsed.perPage ?? 10,
                    page: parsed.page ?? 1,
                };
            } catch {
                localStorage.removeItem(FILTER_STORAGE_KEY);
            }
        }
        return {
            status: [0, 1, 2, 3, 4],
            jenis_kunjungan: 'all',
            jenis_tanggal: 'MASUK', // tambahkan ini
            tanggal_awal: '',
            tanggal_akhir: '',
            perPage: 10,
            page: 1,
        };
    };

    // Perbaiki getInitialData agar selalu return struktur default jika parsing gagal
    const getInitialData = () => {
        const saved = localStorage.getItem(DATA_STORAGE_KEY);
        if (saved && saved !== '') {
            try {
                const parsed = JSON.parse(saved);
                return {
                    data: Array.isArray(parsed.data) ? parsed.data : [],
                    links: Array.isArray(parsed.links) ? parsed.links : [],
                    current_page: parsed.current_page ?? 1,
                    last_page: parsed.last_page ?? 1,
                    perPage: parsed.perPage ?? 10,
                    total: parsed.total ?? 0, // <-- tambahkan ini
                };
            } catch {
                localStorage.removeItem(DATA_STORAGE_KEY);
            }
        }
        // Struktur default
        return { data: [], links: [], current_page: 1, last_page: 1, perPage: 10, total: 0 }; // <-- tambahkan total
    };

    const props = usePage().props as any;
    const tanggal_awal = props.tanggal_awal || '';
    const tanggal_akhir = props.tanggal_akhir || '';

    function parseDate(str: string): Date | undefined {
        if (!str) return undefined;
        const d = new Date(str);
        return isNaN(d.getTime()) ? undefined : d;
    }

    const { pengajuanKlaim, filters } = usePage().props as any;

    const [status, setStatus] = useState<string>(filters?.status ?? JSON.stringify([0, 1, 2, 3, 4]));
    const [jenisKunjungan, setJenisKunjungan] = useState<string>(filters?.jenis_kunjungan ?? 'all');
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: filters?.tanggal_awal ? parseDate(filters.tanggal_awal) : undefined,
        to: filters?.tanggal_akhir ? parseDate(filters.tanggal_akhir) : undefined,
    });
    const [filtersState, setFilters] = useState(getInitialFilters);
    const [data, setData] = useState(getInitialData); // <-- pastikan fungsi dipanggil
    const [loading, setLoading] = useState(false);
    const [openModalBaru, setOpenModalBaru] = useState(false);
    const [openRow, setOpenRow] = useState<number | null>(null);
    const [filterSEP, setFilterSEP] = useState(''); // Tambahkan state untuk filter SEP di dalam komponen
    const [selectedJenisTanggal, setSelectedJenisTanggal] = useState(filtersState.jenis_tanggal || 'MASUK'); // Tambahkan state untuk jenis tanggal di bagian state declarations

    // Simpan filter ke localStorage setiap kali berubah
    useEffect(() => {
        localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filtersState));
    }, [filtersState]);

    // Simpan data table ke localStorage setiap kali data berubah
    useEffect(() => {
        localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
    }, [data]);

    // Update data table di localStorage setiap kali ada response inertia (navigasi, reload, dsb)
    useEffect(() => {
        const onFinish = (event: any) => {
            // Cek jika ada data pengajuanKlaim di props inertia
            if (event.detail?.page?.props?.pengajuanKlaim) {
                const resp = event.detail.page.props.pengajuanKlaim;
                // Strukturkan sesuai state data
                const newData = {
                    data: Array.isArray(resp.data) ? resp.data : [],
                    links: Array.isArray(resp.links) ? resp.links : [],
                    current_page: resp.current_page ?? 1,
                    last_page: resp.last_page ?? 1,
                    perPage: resp.perPage ?? 10,
                    total: resp.total ?? resp.data.length, // <-- tambahkan ini
                };
                localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(newData));
            }
        };
        window.addEventListener('inertia:finish', onFinish);
        return () => window.removeEventListener('inertia:finish', onFinish);
    }, []);

    const tanggalAwal = filtersState.tanggal_awal ? new Date(filtersState.tanggal_awal) : null;
    const tanggalAkhir = filtersState.tanggal_akhir ? new Date(filtersState.tanggal_akhir) : null;

    // Fetch data manual (bukan useEffect otomatis)
    const fetchData = async (customFilters = filtersState) => {
        toast.loading('Mengambil data pengajuan klaim...');
        setLoading(true);
        await axios
            .post('/eklaim/klaim/list-pengajuan/filter', customFilters)
            .then((response) => {
                const resp = response.data.pengajuanKlaim;
                if (resp && Array.isArray(resp.data)) {
                    console.log('Response data:', resp.data); // Debugging log
                    setData({
                        data: resp.data,
                        links: Array.isArray(resp.links) ? resp.links : [],
                        current_page: resp.current_page ?? 1,
                        last_page: resp.last_page ?? 1,
                        perPage: resp.perPage ?? 10,
                        total: resp.total ?? resp.data.length, // <-- tambahkan ini
                    });
                    toast.dismiss();
                    toast.success('Data berhasil diambil');
                } else {
                    toast.dismiss();
                    toast.error('Format data tidak sesuai');
                }
            })
            .catch((error) => {
                toast.dismiss();
                toast.error('Gagal mengambil data');
            })
            .finally(() => setLoading(false));
    };

    // Handler submit filter
    const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFilters((prev) => ({ ...prev, page: 1 }));
        fetchData({ ...filtersState, page: 1 });
    };

    // Handler Next/Previous
    const handlePageChange = (page: number) => {
        setFilters((prev) => ({ ...prev, page }));
        fetchData({ ...filtersState, page });
    };

    // Handler perPage
    const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = Number(e.target.value);
        setFilters((prev) => ({ ...prev, perPage: value, page: 1 }));
        fetchData({ ...filtersState, perPage: value, page: 1 });
    };

    const handleToggleRow = (id: number) => {
        setOpenRow((prev) => (prev === id ? null : id));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: <Home className="mr-1 inline" />,
            href: route('eklaim.klaim.index'),
        },
        {
            title: 'List Pengajuan Klaim',
            href: route('eklaim.klaim.indexPengajuanKlaim'),
        },
    ];

    const refreshData = async () => {
        await fetchData(filtersState);
    };

    const formatTanggalIndo = (tanggal: string | Date | null | undefined) => {
        if (!tanggal) return '-';
        let dateObj;
        if (tanggal instanceof Date) {
            dateObj = tanggal;
        } else if (typeof tanggal === 'string' && tanggal.length > 0) {
            // Mendukung format ISO, Y-m-d, Y-m-d H:i:s, dst
            dateObj = new Date(tanggal.replace(' ', 'T'));
        } else {
            return '-';
        }
        if (isNaN(dateObj.getTime())) return '-';
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return dateObj.toLocaleDateString('id-ID', options);
    };

    // Tambahkan useEffect untuk sync jenis_tanggal dengan filter state
    useEffect(() => {
        setFilters((prev) => ({ ...prev, jenis_tanggal: selectedJenisTanggal }));
    }, [selectedJenisTanggal]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="List Pengajuan Klaim" />
            <div className="p-4">
                <div className="w-full overflow-x-auto rounded-md border">
                    {/* Form Filter */}
                    <form onSubmit={handleFilterSubmit} className="flex items-center justify-end gap-2 border-b bg-gray-50 p-4">
                        {/* Input filter SEP di atas tabel */}
                        <div className="flex items-center justify-end gap-2 py-2">
                            <div className="relative w-[300px]">
                                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                                    <Search className="h-4 w-4" />
                                </span>
                                <Input
                                    type="text"
                                    placeholder="Cari Nomor SEP"
                                    value={filterSEP}
                                    onChange={(e) => setFilterSEP(e.target.value)}
                                    className="pl-10"
                                />
                                {filterSEP && (
                                    <button
                                        type="button"
                                        onClick={() => setFilterSEP('')}
                                        className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        tabIndex={-1}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <Select
                            value={
                                Array.isArray(filtersState.status) && filtersState.status.length === 5 && filtersState.status.every((v, i) => v === i)
                                    ? 'ALL'
                                    : Array.isArray(filtersState.status)
                                        ? (filtersState.status[0]?.toString() ?? 'ALL')
                                        : 'ALL'
                            }
                            onValueChange={(val) => {
                                if (val === 'ALL') {
                                    setFilters((prev) => ({ ...prev, status: [0, 1, 2, 3, 4], page: 1 }));
                                } else {
                                    setFilters((prev) => ({ ...prev, status: [Number(val)], page: 1 }));
                                }
                            }}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter Status Klaim" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Semua Status</SelectItem>
                                <SelectItem value="0">Belum Diajukan</SelectItem>
                                <SelectItem value="1">Sudah Diajukan</SelectItem>
                                <SelectItem value="2">Grouper</SelectItem>
                                <SelectItem value="3">Final</SelectItem>
                                <SelectItem value="4">Dikirim</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filtersState.jenis_kunjungan}
                            onValueChange={(val) => setFilters((prev) => ({ ...prev, jenis_kunjungan: val, page: 1 }))}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter Jenis Kunjungan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Jenis Kunjungan</SelectItem>
                                <SelectItem value="Rawat Jalan">Rawat Jalan</SelectItem>
                                <SelectItem value="Rawat Inap">Rawat Inap</SelectItem>
                                <SelectItem value="Gawat Darurat">Gawat Darurat</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Tambahkan Select untuk jenis tanggal setelah Select jenis_kunjungan */}
                        <Select
                            value={selectedJenisTanggal}
                            onValueChange={(val) => setSelectedJenisTanggal(val)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue>
                                    {selectedJenisTanggal === 'MASUK'
                                        ? 'Tanggal Masuk'
                                        : selectedJenisTanggal === 'KELUAR'
                                            ? 'Tanggal Keluar'
                                            : selectedJenisTanggal}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MASUK">Tanggal Masuk</SelectItem>
                                <SelectItem value="KELUAR">Tanggal Keluar</SelectItem>
                            </SelectContent>
                        </Select>

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
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    tanggal_awal: format(range.from, 'yyyy-MM-dd'),
                                                    tanggal_akhir: format(range.to, 'yyyy-MM-dd'),
                                                    page: 1,
                                                }));
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
                                            setFilters((prev) => ({
                                                ...prev,
                                                tanggal_awal: '',
                                                tanggal_akhir: '',
                                                page: 1,
                                            }));
                                        }}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Button type="submit" variant="outline">
                            <AlignJustify className="mr-2 h-4 w-4" />
                            Filter
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                // Reset semua filter ke default
                                setFilters({
                                    status: [0, 1, 2, 3, 4],
                                    jenis_kunjungan: 'all',
                                    jenis_tanggal: 'MASUK', // tambahkan ini
                                    tanggal_awal: '',
                                    tanggal_akhir: '',
                                    perPage: 10,
                                    page: 1,
                                });
                                setDateRange({ from: undefined, to: undefined });
                                setFilterSEP('');
                                setSelectedJenisTanggal('MASUK'); // tambahkan ini
                                fetchData({
                                    status: [0, 1, 2, 3, 4],
                                    jenis_kunjungan: 'all',
                                    jenis_tanggal: 'MASUK', // tambahkan ini
                                    tanggal_awal: '',
                                    tanggal_akhir: '',
                                    perPage: 10,
                                    page: 1,
                                });
                            }}
                        >
                            <Trash className="mr-2 h-4 w-4 text-red-500" />
                            Reset Filter
                        </Button>
                    </form>
                    {/* END Form Filter */}

                    {/* Table Data */}
                    <Table className="w-full min-w-max">
                        <TableHeader>
                            <TableRow>
                                <TableHead>No.</TableHead>
                                <TableHead>NORM</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Tanggal Masuk</TableHead>
                                <TableHead>Tanggal Keluar</TableHead>
                                <TableHead>Nomor SEP</TableHead>
                                <TableHead>
                                    <center>Status</center>
                                </TableHead>
                                <TableHead>
                                    <center>Tanggal Pengajuan</center>
                                </TableHead>
                                <TableHead>
                                    <center>#</center>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.isArray(data.data) && data.data.length > 0 ? (
                                data.data
                                    .filter((item: any) =>
                                        filterSEP.trim() === ''
                                            ? true
                                            : (item.nomor_SEP || '').toLowerCase().includes(filterSEP.trim().toLowerCase()),
                                    )
                                    .map((item: any, idx: number) => (
                                        <React.Fragment key={item.id}>
                                            <TableRow className="cursor-pointer hover:bg-blue-50" onClick={() => handleToggleRow(item.id)}>
                                                <TableCell>{idx + 1 + (data.current_page - 1) * data.perPage}</TableCell>
                                                <TableCell>{item.pendaftaran_poli.pasien.NORM || '-'}</TableCell>
                                                <TableCell>{item.pendaftaran_poli.pasien.NAMA || '-'}</TableCell>
                                                <TableCell>
                                                    {(() => {
                                                        // Pastikan kunjungan_pasien adalah array
                                                        if (!Array.isArray(item?.penjamin?.kunjungan_pasien)) {
                                                            return '-';
                                                        }

                                                        // Filter kunjungan yang memiliki JENIS_KUNJUNGAN = 1, 2, atau 3
                                                        const validKunjungan = item.penjamin.kunjungan_pasien.filter(
                                                            (kunjungan: any) => [1, 2, 3].includes(kunjungan?.ruangan?.JENIS_KUNJUNGAN)
                                                        );

                                                        // Jika tidak ada kunjungan yang valid, return '-'
                                                        if (validKunjungan.length === 0) {
                                                            return '-';
                                                        }

                                                        // Ambil kunjungan terakhir dari yang valid
                                                        const lastValidKunjungan = validKunjungan[validKunjungan.length - 1];

                                                        return formatTanggalIndo(lastValidKunjungan.MASUK);
                                                    })()}
                                                </TableCell>
                                                <TableCell>
                                                    {(() => {
                                                        // Pastikan kunjungan_pasien adalah array
                                                        if (!Array.isArray(item?.penjamin?.kunjungan_pasien)) {
                                                            return '-';
                                                        }

                                                        // Filter kunjungan yang memiliki JENIS_KUNJUNGAN = 1, 2, atau 3
                                                        const validKunjungan = item.penjamin.kunjungan_pasien.filter(
                                                            (kunjungan: any) => [1, 2, 3].includes(kunjungan?.ruangan?.JENIS_KUNJUNGAN)
                                                        );

                                                        // Jika tidak ada kunjungan yang valid, return '-'
                                                        if (validKunjungan.length === 0) {
                                                            return '-';
                                                        }

                                                        // Ambil kunjungan terakhir dari yang valid
                                                        const lastValidKunjungan = validKunjungan[validKunjungan.length - 1];

                                                        return formatTanggalIndo(lastValidKunjungan.KELUAR);
                                                    })()}
                                                </TableCell>
                                                <TableCell>{item.nomor_SEP || '-'}</TableCell>
                                                <TableCell>
                                                    <center>{getStatusBadge(item.status, item.id)}</center>
                                                </TableCell>
                                                <TableCell>
                                                    <center>{formatTanggal(item.tanggal_pengajuan)}</center>
                                                </TableCell>
                                                <TableCell>
                                                    <center>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.visit(route('eklaim.klaim.dataKlaim', { dataKlaim: item.id }));
                                                            }}
                                                        >
                                                            <Info className="mr-2 h-4 w-4 text-blue-400" />
                                                            Detail
                                                        </Button>
                                                    </center>
                                                </TableCell>
                                            </TableRow>
                                            {openRow === item.id && (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="bg-gray-50">
                                                        {item.status === 0 && <CollapseBelumDiajukan pengajuanKlaim={item} />}

                                                        {item.status === 1 && (
                                                            <PengajuanKlaimCollapse
                                                                item={item}
                                                                formatTanggal={formatTanggal}
                                                                getStatusBadge={getStatusBadge}
                                                                expanded={openRow === item.id}
                                                                refreshData={refreshData}
                                                            />
                                                        )}

                                                        {item.status === 2 && (
                                                            <>
                                                                <PengajuanKlaimCollapse
                                                                    item={item}
                                                                    formatTanggal={formatTanggal}
                                                                    getStatusBadge={getStatusBadge}
                                                                    expanded={openRow === item.id}
                                                                    refreshData={refreshData}
                                                                />
                                                                <GroupingOneCollapse pengajuanKlaim={item} refreshData={refreshData} />
                                                            </>
                                                        )}

                                                        {item.status === 3 && (
                                                            <FinalGroupingCollapse pengajuanKlaim={item} refreshData={refreshData} />
                                                        )}

                                                        {item.status === 4 && (
                                                            <SudahTerkirimCollapse pengajuanKlaim={item} refreshData={refreshData} />
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">
                                        Data tidak ditemukan
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination & PerPage */}
                <div className="flex items-center justify-between py-2">
                    <div>
                        Halaman {data.current_page} dari {data.last_page}
                        {typeof data.total !== "undefined" && (
                            <> | Total Data: {data.total}</>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Baris per halaman:</span>
                        <select
                            className="rounded border px-2 py-1"
                            value={filtersState.perPage}
                            onChange={(e) => {
                                const newPerPage = Number(e.target.value);
                                const newFilters = { ...filtersState, perPage: newPerPage, page: 1 };
                                setFilters(newFilters);
                                fetchData(newFilters);
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={250}>250</option>
                            <option value={500}>500</option>
                        </select>
                        <Button variant="outline" size="sm" onClick={() => handlePageChange(data.current_page - 1)} disabled={data.current_page <= 1}>
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(data.current_page + 1)}
                            disabled={data.current_page >= data.last_page}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
