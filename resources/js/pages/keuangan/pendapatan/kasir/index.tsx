import React, { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, usePage, router } from "@inertiajs/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from "@/components/ui/button";

export default function PendapatanKasirIndex() {
    const { transaksiKasir, filters } = usePage().props as {
        transaksiKasir: {
            data: any[],
            links: any[],
            current_page: number,
            last_page: number,
            per_page: number,
        },
        filters: {
            perPage: number,
        }
    };

    const [itemsPerPage, setItemsPerPage] = useState(filters?.perPage || transaksiKasir.per_page || 10);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Keuangan',
            href: '/pendapatan/kasir',
        },
    ];

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        router.get(
            route('pendapatan.kasir.index'),
            { page: 1, per_page: e.target.value },
            { preserveState: true }
        );
    };

    const handlePageChange = (url: string | null) => {
        if (url) {
            // Ambil per_page dari state agar tetap konsisten saat pindah halaman
            const urlObj = new URL(url, window.location.origin);
            urlObj.searchParams.set('per_page', String(itemsPerPage));
            router.get(urlObj.pathname + urlObj.search, {}, { preserveState: true });
        }
    };

    const prevLink = transaksiKasir.links.find((l: any) => l.label === 'Previous' || l.label === '&laquo; Previous');
    const nextLink = transaksiKasir.links.find((l: any) => l.label === 'Next' || l.label === 'Next &raquo;');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pendapatan Kasir"/>
            <div className="p-4">
                <h1 className="text-xl font-bold mb-4">Total Pendapatan Kasir</h1>
                <div className="w-full overflow-x-auto rounded-md border">
                    <Table className="w-full min-w-max">
                        <TableHeader>
                            <TableRow>
                                <TableHead>No</TableHead>
                                <TableHead>Nama Kasir</TableHead>
                                <TableHead>Jam Buka</TableHead>
                                <TableHead>Jam Tutup</TableHead>
                                <TableHead>Total Pendapatan</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transaksiKasir.data.length > 0 ? (
                                transaksiKasir.data.map((item, idx) => (
                                    <TableRow key={item.NOMOR}>
                                        <TableCell>{idx + 1 + ((transaksiKasir.current_page - 1) * itemsPerPage)}</TableCell>
                                        <TableCell>{item.nama_kasir}</TableCell>
                                        <TableCell>{item.buka}</TableCell>
                                        <TableCell>{item.tutup}</TableCell>
                                        <TableCell>
                                            <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded">
                                                {Number(item.total).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded
                                                ${item.status === 'TUTUP' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                                                {item.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
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
                {/* Pagination dan item per page */}
                <div className="flex flex-wrap justify-between items-center mt-4">
                    {/* Informasi Halaman */}
                    <div className="text-sm text-gray-700">
                        Page {transaksiKasir.current_page} of {transaksiKasir.last_page}
                    </div>
                    {/* Selector untuk jumlah item per halaman */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm">Rows per page:</span>
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
                    {/* Pagination dan item per page */}
                    <div className="flex items-center space-x-4">
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
