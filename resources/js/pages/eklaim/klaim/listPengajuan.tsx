import React from "react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, usePage, router } from "@inertiajs/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Tab } from "@headlessui/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlignJustify, Check, Home, Pencil, Trash } from "lucide-react";

// Function untuk memformat tanggal
const formatTanggal = (tanggal: string | null) => {
    if (!tanggal) return "-";
    return format(new Date(tanggal), "d MMMM yyyy", { locale: id });
};

// Function untuk menampilkan badge status
const getStatusBadge = (status: number, id: string) => {
    switch (status) {
        case 0:
            return <Badge onClick={() => router.get(route('eklaim.klaim.getStatusKlaim', { pengajuanKlaim: id }))} variant="outline" className="hover:cursor-pointer hover:bg-yellow-300 bg-yellow-100 text-yellow-800">Belum Diajukan</Badge>;
        case 1:
            return <Badge onClick={() => router.get(route('eklaim.klaim.getStatusKlaim', { pengajuanKlaim: id }))} variant="outline" className="hover:cursor-pointer hover:bg-green-300 bg-green-100 text-green-800">Sudah Diajukan</Badge>;
        case 2:
            return <Badge onClick={() => router.get(route('eklaim.klaim.getStatusKlaim', { pengajuanKlaim: id }))} variant="outline" className="hover:cursor-pointer hover:bg-blue-300 bg-blue-100 text-blue-800">Group Stage 1</Badge>;
        case 3:
            return <Badge onClick={() => router.get(route('eklaim.klaim.getStatusKlaim', { pengajuanKlaim: id }))} variant="outline" className="hover:cursor-pointer hover:bg-blue-300 bg-blue-100 text-blue-800">Group Stage 2</Badge>;
        case 4:
            return <Badge onClick={() => router.get(route('eklaim.klaim.getStatusKlaim', { pengajuanKlaim: id }))} variant="outline" className="hover:cursor-pointer hover:bg-blue-300 bg-blue-100 text-blue-800">Final</Badge>;
        default:
            return <Badge onClick={() => router.get(route('eklaim.klaim.getStatusKlaim', { pengajuanKlaim: id }))} variant="outline" className="hover:cursor-pointer hover:bg-gray-300 bg-gray-100 text-gray-800">Unknown</Badge>;
    }
};

export default function ListPengajuan() {
    const { pengajuanKlaim, filters } = usePage().props as {
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

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: <Home className="inline mr-1" />,
            href: route("eklaim.klaim.index"),
        },
        {
            title: "List Pengajuan Klaim",
            href: route("eklaim.klaim.indexPengajuanKlaim"),
        },
    ];

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true });
        }
    };

    const handlePerPageChange = (value: string) => {
        router.get(route("eklaim.klaim.indexPengajuanKlaim"), { per_page: value }, { preserveState: true });
    };

    const prevLink = pengajuanKlaim.links.find((l) => l.label === "Previous" || l.label === "&laquo; Previous");
    const nextLink = pengajuanKlaim.links.find((l) => l.label === "Next" || l.label === "Next &raquo;");

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="List Pengajuan Klaim" />
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                </div>
                <div className="w-full overflow-x-auto rounded-md border">
                    <Table className="w-full min-w-max">
                        <TableHeader>
                            <TableRow>
                                <TableHead>No</TableHead>
                                <TableHead>NORM</TableHead>
                                <TableHead>Nomor SEP</TableHead>
                                <TableHead>
                                    <center>
                                        Status
                                    </center>
                                </TableHead>
                                <TableHead>
                                    <center>
                                        Tanggal Pengajuan
                                    </center>
                                </TableHead>
                                <TableHead>
                                    <center>
                                        #
                                    </center>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pengajuanKlaim.data.length > 0 ? (
                                pengajuanKlaim.data.map((item, idx) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{idx + 1 + (pengajuanKlaim.current_page - 1) * filters.perPage}</TableCell>
                                        <TableCell>{item.NORM}</TableCell>
                                        <TableCell>
                                            <div className="hover:underline cursor-pointer hover:text-blue-600"
                                                onClick={() => router.get(route('eklaim.klaim.getDataKlaim', { pengajuanKlaim: item.id }))}
                                            >
                                                {item.nomor_SEP}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <center>
                                                {getStatusBadge(item.status, item.id)}
                                            </center>
                                        </TableCell>
                                        <TableCell>
                                            <center>
                                                {formatTanggal(item.tanggal_pengajuan)}
                                            </center>
                                        </TableCell>
                                        <TableCell>
                                            <center>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant='outline'
                                                            size="sm"
                                                        >
                                                            <AlignJustify size={16} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        {item.status === 0 && (
                                                            <DropdownMenuItem
                                                                onClick={() => router.post(route('eklaim.klaim.pengajuanUlang', { pengajuanKlaim: item.id }))}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <Check size={16} className="text-green-600" />
                                                                Ajukan
                                                            </DropdownMenuItem>
                                                        )}
                                                        {
                                                            item.status === 1 && (
                                                                <>
                                                                    <DropdownMenuItem
                                                                        onClick={() => router.get(route('eklaim.klaim.dataKlaim', { dataKlaim: item.id }))}
                                                                        className="flex items-center gap-2"
                                                                    >
                                                                        <Pencil size={16} className="text-yellow-600" />
                                                                        Isi Data Klaim
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => router.post(route('eklaim.klaim.hapusDataKlaim', { pengajuanKlaim: item.id }))}
                                                                        className="flex items-center gap-2"
                                                                    >
                                                                        <Trash size={16} className="text-red-600" />
                                                                        Batalkan Klaim
                                                                    </DropdownMenuItem>
                                                                </>

                                                            )
                                                        }
                                                        {
                                                            item.status === 2 && (
                                                                <>
                                                                    <DropdownMenuItem
                                                                        onClick={() => router.post(route('eklaim.klaim.editUlangKlaim', { pengajuanKlaim: item.id }))}
                                                                        className="flex items-center gap-2"
                                                                    >
                                                                        <Pencil size={16} className="text-yellow-600" />
                                                                        Edit Ulang
                                                                    </DropdownMenuItem>
                                                                </>

                                                            )
                                                        }
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </center>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        Data tidak ditemukan
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {/* Pagination */}
                <div className="flex items-center mt-4 float-end gap-2">
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
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(prevLink?.url)}
                        disabled={!prevLink?.url}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(nextLink?.url)}
                        disabled={!nextLink?.url}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
