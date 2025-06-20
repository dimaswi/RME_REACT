import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { AlignJustify, CalendarIcon, Check, Home, Pencil, Trash } from 'lucide-react';
import React, { useState } from 'react';
import ModalBuatPengajuanBaru from './ModalBuatPengajuanBaru';
import PengajuanKlaimCollapse from './collapseListPengajuan';
import GroupingOneCollapse from './collapseGroupingOne';
import axios from 'axios';
import { toast } from 'sonner';
import FinalGroupingCollapse from './collapseFinalGrouping';
import CollapseBelumDiajukan from './collapseBelumDiajukan';

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

export default function ListPengajuan() {
    const props = usePage().props as any;
    const tanggal_awal = props.tanggal_awal || '';
    const tanggal_akhir = props.tanggal_akhir || '';

    function parseDate(str: string): Date | undefined {
        if (!str) return undefined;
        const d = new Date(str);
        return isNaN(d.getTime()) ? undefined : d;
    }

    const { pengajuanKlaim, filters } = usePage().props as unknown as {
        pengajuanKlaim: {
            data: any[];
            links: any[];
            current_page: number;
            last_page: number;
        };
        filters: {
            perPage: number;
        };
    };

    console.log(pengajuanKlaim);
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: parseDate(tanggal_awal),
        to: parseDate(tanggal_akhir),
    });

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

    const statusFilter = props.status ?? '';
    const [status, setStatus] = useState<string>(statusFilter);
    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(
                url,
                {
                    tanggal_awal: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
                    tanggal_akhir: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
                    status,
                },
                { preserveState: true },
            );
        }
    };

    const handlePerPageChange = (value: string) => {
        router.get(
            route('eklaim.klaim.indexPengajuanKlaim'),
            {
                per_page: value,
                tanggal_awal: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
                tanggal_akhir: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
                status,
            },
            { preserveState: true },
        );
    };

    const prevLink = pengajuanKlaim.links.find((l) => l.label === 'Previous' || l.label === '&laquo; Previous');
    const nextLink = pengajuanKlaim.links.find((l) => l.label === 'Next' || l.label === 'Next &raquo;');

    const [openRow, setOpenRow] = useState<number | null>(null);
    const [openModalBaru, setOpenModalBaru] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="List Pengajuan Klaim" />
            <div className="p-4">
                <div className="w-full overflow-x-auto rounded-md border">
                    <div className="flex items-center justify-end gap-2 border-b bg-gray-50 p-4">
                        {/* <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-400 text-white hover:bg-green-600"
                            onClick={() => setOpenModalBaru(true)}
                        >
                            Buat Pengajuan Klaim Baru
                        </Button> */}
                        <Select
                            value={status}
                            onValueChange={(val) => {
                                setStatus(val);
                                let statusParam = val;
                                try {
                                    const arr = JSON.parse(val);
                                    if (Array.isArray(arr)) statusParam = arr;
                                } catch {}
                                router.get(
                                    route('eklaim.klaim.indexPengajuanKlaim'),
                                    {
                                        ...filters,
                                        tanggal_awal: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
                                        tanggal_akhir: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
                                        status: statusParam,
                                    },
                                    { preserveState: true },
                                );
                            }}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter Status Klaim" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={JSON.stringify([0, 1, 2, 3, 4])}>
                                    <Badge className="bg-white text-black">Semua Status</Badge>
                                </SelectItem>
                                <SelectItem value="0">
                                    <Badge className="bg-red-500 text-white">Belum Diajukan</Badge>
                                </SelectItem>
                                <SelectItem value="1">
                                    <Badge className="bg-yellow-500 text-white">Sudah Diajukan</Badge>
                                </SelectItem>
                                <SelectItem value="2">
                                    <Badge className="bg-blue-500 text-white">Grouper</Badge>
                                </SelectItem>
                                <SelectItem value="3">
                                    <Badge className="bg-green-500 text-white">Final</Badge>
                                </SelectItem>
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
                                                    route('eklaim.klaim.indexPengajuanKlaim'),
                                                    {
                                                        ...filters,
                                                        tanggal_awal: format(range.from, 'yyyy-MM-dd'),
                                                        tanggal_akhir: format(range.to, 'yyyy-MM-dd'),
                                                        status,
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
                                                route('eklaim.klaim.indexPengajuanKlaim'),
                                                {
                                                    ...filters,
                                                    tanggal_awal: '',
                                                    tanggal_akhir: '',
                                                    status,
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
                                <TableHead>No</TableHead>
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
                            {pengajuanKlaim.data.length > 0 ? (
                                pengajuanKlaim.data.map((item, idx) => (
                                    <React.Fragment key={item.id}>
                                        <TableRow
                                            className="cursor-pointer transition hover:bg-gray-100"
                                            onClick={() => setOpenRow(openRow === item.id ? null : item.id)}
                                        >
                                            <TableCell>
                                                <div className="pl-5">{idx + 1 + (pengajuanKlaim.current_page - 1) * filters.perPage}</div>
                                            </TableCell>
                                            <TableCell>{item.NORM}</TableCell>
                                            <TableCell>{item.pendaftaran_poli.pasien.NAMA}</TableCell>
                                            <TableCell>
                                                <p>{item.nomor_SEP}</p>
                                            </TableCell>
                                            <TableCell>
                                                <center>{getStatusBadge(item.status, item.id)}</center>
                                            </TableCell>
                                            <TableCell>
                                                <center>{formatTanggal(item.tanggal_pengajuan)}</center>
                                            </TableCell>
                                            <TableCell>
                                                <center>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={e => e.stopPropagation()}
                                                            >
                                                                <AlignJustify size={16} />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>    
                                                            <DropdownMenuItem
                                                                    
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            router.get(route('eklaim.klaim.dataKlaim', { dataKlaim: item.id }));
                                                                        }}
                                                                        className="flex items-center gap-2"
                                                                    >
                                                                        <Pencil size={16} className="text-yellow-600" />
                                                                        Isi Data Klaim
                                                                    </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </center>
                                            </TableCell>
                                        </TableRow>
                                        {openRow === item.id && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="bg-gray-50">
                                                    {
                                                        item.status === 0 && (
                                                            <CollapseBelumDiajukan
                                                                pengajuanKlaim={item}
                                                            />
                                                        )
                                                    }

                                                    {
                                                        item.status === 1 && (
                                                            <PengajuanKlaimCollapse
                                                                item={item}
                                                                formatTanggal={formatTanggal}
                                                                getStatusBadge={getStatusBadge}
                                                                expanded={openRow === item.id}
                                                            />
                                                        )
                                                    }

                                                    {
                                                        item.status === 2 && (
                                                            <GroupingOneCollapse
                                                                pengajuanKlaim={item}
                                                            />
                                                        )
                                                    }

                                                    {
                                                        item.status === 3 && (
                                                            <FinalGroupingCollapse 
                                                                pengajuanKlaim={item}
                                                            />
                                                        )
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">
                                        Data tidak ditemukan
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {/* Pagination */}
                <div className="mt-4 flex items-center justify-end gap-2">
                    <Select defaultValue={filters.perPage.toString()} onValueChange={handlePerPageChange}>
                        <SelectTrigger className="w-24">
                            <SelectValue placeholder="Per Page" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => handlePageChange(prevLink?.url)} disabled={!prevLink?.url}>
                        Previous
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handlePageChange(nextLink?.url)} disabled={!nextLink?.url}>
                        Next
                    </Button>
                </div>
                <ModalBuatPengajuanBaru
                    open={openModalBaru}
                    onOpenChange={setOpenModalBaru}
                    onSuccess={() => {
                        setOpenModalBaru(false);
                        router.reload({ only: ['pengajuanKlaim', 'success', 'error'] }); // reload data table saja
                    }}
                />
            </div>
        </AppLayout>
    );
}
