import React, { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, usePage, router } from "@inertiajs/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ListCollapse } from "lucide-react";

export default function KlaimIndex() {
    const { dataPendaftaran, filters } = usePage().props as {
        dataPendaftaran: {
            data: any[],
            links: any[],
            current_page: number,
            last_page: number,
            per_page: number,
        },
        filters?: {
            q?: string,
            perPage?: number,
        }
    };

    const [itemsPerPage, setItemsPerPage] = useState(dataPendaftaran.per_page || 10);
    const [query, setQuery] = useState(filters?.q || "");

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Klaim',
            href: '/eklaim/klaim',
        },
    ];

    // Search otomatis setiap karakter diketik
    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        router.get(
            route('eklaim.klaim.index'),
            { page: 1, per_page: itemsPerPage, q: value },
            { preserveState: true, replace: true }
        );
    };

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        router.get(
            route('eklaim.klaim.index'),
            { page: 1, per_page: e.target.value, q: query },
            { preserveState: true }
        );
    };

    const handlePageChange = (url: string | null) => {
        if (url) {
            const urlObj = new URL(url, window.location.origin);
            urlObj.searchParams.set('per_page', String(itemsPerPage));
            urlObj.searchParams.set('q', query);
            router.get(urlObj.pathname + urlObj.search, {}, { preserveState: true });
        }
    };

    const handleRowClick = (norm: string) => {
        router.get(route('eklaim.klaim.show', { pasien: norm }));
    };

    const prevLink = dataPendaftaran.links.find((l) => l.label === 'Previous' || l.label === '&laquo; Previous');
    const nextLink = dataPendaftaran.links.find((l) => l.label === 'Next' || l.label === 'Next &raquo;');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Klaim"/>
            <div className="p-4">
                {/* Single Search Field */}
                <div className="mb-4 flex flex-wrap gap-2 items-end justify-between">
                    <input
                        type="text"
                        value={query}
                        onChange={handleQueryChange}
                        className="border rounded-md p-1 text-sm w-64"
                        placeholder="Cari Nama atau NORM"
                    />
                    <Button
                        variant="outline"
                        onClick={() => router.get(route('eklaim.klaim.indexPengajuanKlaim'), { page: 1, per_page: itemsPerPage, q: query }, { preserveState: true })}
                    >
                        <ListCollapse size={12}/>
                        Data Pengajuan
                    </Button>
                </div>
                <div className="w-full overflow-x-auto rounded-md border">
                    <Table className="w-full min-w-max">
                        <TableHeader>
                            <TableRow>
                                <TableHead>No</TableHead>
                                <TableHead>NORM</TableHead>
                                <TableHead>Nama Lengkap</TableHead>
                                <TableHead>Alamat</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dataPendaftaran.data.length > 0 ? (
                                dataPendaftaran.data.map((item, idx) => (
                                    <TableRow
                                        key={item.NORM}
                                        className="cursor-pointer hover:bg-blue-50"
                                        onClick={() => handleRowClick(item.NORM)}
                                    >
                                        <TableCell>{idx + 1 + ((dataPendaftaran.current_page - 1) * itemsPerPage)}</TableCell>
                                        <TableCell>{item.NORM}</TableCell>
                                        <TableCell>{item.NAMA}</TableCell>
                                        <TableCell>{item.ALAMAT}</TableCell>
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
                <div className="flex flex-wrap justify-between items-center mt-4">
                    {/* Informasi Halaman */}
                    <div className="text-sm text-gray-700">
                        Page {dataPendaftaran.current_page} of {dataPendaftaran.last_page}
                    </div>
                    {/* Pagination dan item per page */}
                    <div className="flex items-center space-x-4">
                        {/* Selector untuk jumlah item per halaman */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm">Baris :</span>
                            <select
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                className="border rounded-md p-1 text-sm"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                        {/* Tombol Pagination */}
                        <div className="flex space-x-2">
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
                </div>
            </div>
        </AppLayout>
    )
}
