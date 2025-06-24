import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { AlignJustify, CalendarIcon, Home, Info } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import CollapseBelumDiajukan from './collapseBelumDiajukan';
import FinalGroupingCollapse from './collapseFinalGrouping';
import GroupingOneCollapse from './collapseGroupingOne';
import PengajuanKlaimCollapse from './collapseListPengajuan';
import SudahTerkirimCollapse from './collapseSudahKirim';
import { toast } from 'sonner';

// Function untuk memformat tanggal
const formatTanggal = (tanggal: string | null) => {
    if (!tanggal) return '-';
    return format(new Date(tanggal), 'd MMMM yyyy', { locale: id });
};

// Function untuk menampilkan badge status
const getStatusBadge = (status: number, id: string) => {
    const statusMap: Record<number, { label: string; color: string; text: string }> = {
        0: { label: 'Belum Diajukan', color: 'red', text: 'white' },
        1: { label: 'Sudah Diajukan', color: 'yellow', text: 'white' },
        2: { label: 'Grouper', color: 'blue', text: 'white' },
        3: { label: 'Final', color: 'green', text: 'white' },
        4: { label: 'Dikirim', color: 'green', text: 'white' },
    };
    const statusInfo = statusMap[status] || { label: 'Unknown', color: 'gray', text: 'gray-800' };
    return (
        <Badge
            onClick={() => router.get(route('eklaim.klaim.getStatusKlaim', { pengajuanKlaim: id }))}
            variant="outline"
            className={`hover:cursor-pointer hover:bg-${statusInfo.color}-700 bg-${statusInfo.color}-500 text-${statusInfo.text}`}
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
            tanggal_awal: '',
            tanggal_akhir: '',
            perPage: 10,
            page: 1,
        };
    };

    const getInitialData = () => {
        const saved = localStorage.getItem(DATA_STORAGE_KEY);
        if (saved && saved !== '') {
            try {
                const parsed = JSON.parse(saved);
                // Pastikan struktur data table sesuai kebutuhan
                return {
                    data: Array.isArray(parsed.data) ? parsed.data : [],
                    links: Array.isArray(parsed.links) ? parsed.links : [],
                    current_page: parsed.current_page ?? 1,
                    last_page: parsed.last_page ?? 1,
                    perPage: parsed.perPage ?? 10,
                };
            } catch {
                localStorage.removeItem(DATA_STORAGE_KEY);
            }
        }
        return { data: [], links: [], current_page: 1, last_page: 1, perPage: 10 };
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
    const [data, setData] = useState(getInitialData);
    const [loading, setLoading] = useState(false);
    const [openModalBaru, setOpenModalBaru] = useState(false);
    const [openRow, setOpenRow] = useState<number | null>(null);

    // Simpan filter & data ke localStorage setiap kali berubah
    useEffect(() => {
        localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filtersState));
    }, [filtersState]);
    useEffect(() => {
        localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
    }, [data]);
    useEffect(() => {
        // Sinkronkan dateRange dengan filtersState saat filtersState berubah (misal setelah reload)
        setDateRange({
            from: filtersState.tanggal_awal ? new Date(filtersState.tanggal_awal) : undefined,
            to: filtersState.tanggal_akhir ? new Date(filtersState.tanggal_akhir) : undefined,
        });
    }, [filtersState.tanggal_awal, filtersState.tanggal_akhir]);

    // Fetch data manual (bukan useEffect otomatis)
    const fetchData = async (customFilters = filtersState) => {
        toast.loading('Mengambil data pengajuan klaim...')
        setLoading(true);
        await axios
            .post('/eklaim/klaim/pengajuan/filter', customFilters)
            .then((response) => {
                setData(response.data.dataPendaftaran); // <-- ambil dataPendaftaran saja!
                toast.dismiss();
                toast.success('Data berhasil diambil');
            })
            .catch((error) => {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="List Pengajuan Klaim" />
            <div className="p-4">
                <div className="w-full overflow-x-auto rounded-md border">
                    {/* Form Filter */}
                    <form onSubmit={handleFilterSubmit} className="flex items-center justify-end gap-2 border-b bg-gray-50 p-4">
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
                    </form>
                    {/* END Form Filter */}

                    {/* Table Data */}
                    <Table className="w-full min-w-max">
                        <TableHeader>
                            <TableRow>
                                <TableHead>NORM</TableHead>
                                <TableHead>Nama</TableHead>
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
                            {data.data && data.data.length > 0 ? (
                                data.data.map((item: any, idx: number) => (
                                    <React.Fragment key={item.id}>
                                        <TableRow className="cursor-pointer hover:bg-blue-50" onClick={() => handleToggleRow(item.id)}>
                                            <TableCell>{item.pendaftaran_poli.pasien.NORM || '-'}</TableCell>
                                            <TableCell>{item.pendaftaran_poli.pasien.NAMA || '-'}</TableCell>
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
                                                <TableCell colSpan={6} className="bg-gray-50">
                                                    {item.status === 0 && <CollapseBelumDiajukan pengajuanKlaim={item} />}

                                                    {item.status === 1 && (
                                                        <PengajuanKlaimCollapse
                                                            item={item}
                                                            formatTanggal={formatTanggal}
                                                            getStatusBadge={getStatusBadge}
                                                            expanded={openRow === item.id}
                                                        />
                                                    )}

                                                    {item.status === 2 && (
                                                        <>
                                                            <PengajuanKlaimCollapse
                                                                item={item}
                                                                formatTanggal={formatTanggal}
                                                                getStatusBadge={getStatusBadge}
                                                                expanded={openRow === item.id}
                                                            />
                                                            <GroupingOneCollapse pengajuanKlaim={item} />
                                                        </>
                                                    )}

                                                    {item.status === 3 && <FinalGroupingCollapse pengajuanKlaim={item} />}

                                                    {item.status === 4 && <SudahTerkirimCollapse pengajuanKlaim={item} />}
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
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Baris per halaman:</span>
                        <select
                            className="rounded border px-2 py-1"
                            value={data.perPage}
                            onChange={(e) => {
                                setFilters((prev) => ({ ...prev, perPage: Number(e.target.value), page: 1 }));
                                fetchData({ ...filtersState, perPage: Number(e.target.value), page: 1 });
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
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
