import { Head, router, usePage } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Trash, Pencil, PlusCircle } from 'lucide-react';


type Pasien = {
    NORM: string;
    NAMA: string;
    TANGGAL_LAHIR: string;
    JENIS_KELAMIN: number;
    ALAMAT: string;
    KELURAHAN: string;
    KECAMATAN: string;
    KABUPATEN: string;
    PROVINSI: string;
    RT: string;
    RW: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pasiens',
        href: '/pasiens',
    },
];

export default function PasienIndex() {
    const { props } = usePage<{
        pasiens: { data: Pasien[]; links: any[]; current_page: number; last_page: number };
        filters: { search: string; itemsPerPage: number };
    }>();

    const [search, setSearch] = useState(props.filters.search || '');
    const [itemsPerPage, setItemsPerPage] = useState(props.filters.itemsPerPage || 10);

    // Fungsi untuk menghitung usia dalam format "X tahun Y bulan Z hari"
    const calculateAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);

        let years = today.getFullYear() - birth.getFullYear();
        let months = today.getMonth() - birth.getMonth();
        let days = today.getDate() - birth.getDate();

        if (days < 0) {
            months -= 1;
            days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        }

        if (months < 0) {
            years -= 1;
            months += 12;
        }

        return `${years} tahun ${months} bulan ${days} hari`;
    };

    // Fungsi untuk menangani pencarian
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/master/pasiens', { search, itemsPerPage }, { preserveState: true });
    };

    // Fungsi untuk menangani perubahan jumlah item per halaman
    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        router.get('/master/pasiens', { search, itemsPerPage: Number(e.target.value) }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pasiens" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-hidden">
                <h1 className="text-2xl font-bold mb-4">Data Pasien</h1>

                <div className='flex justify-between items-center mb-4'>
                    {/* Search Input */}
                    <form onSubmit={handleSearch} className="relative w-full sm:max-w-sm mb-4">
                        <Input
                            placeholder="Search pasien..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoComplete="off"
                            className="pr-10"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    router.get('/master/pasiens', { search: '', itemsPerPage }, { preserveState: true });
                                }}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                aria-label="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </form>

                    {/* Add New Pasien Button */}
                    <Button
                        variant="outline"
                        onClick={() => router.get(route('master.pasien.create'))} // Pastikan nama rute sesuai
                        className="mb-4"
                    >
                        <PlusCircle />
                        Tambah
                    </Button>

                </div>

                {/* Table */}
                <div className="w-full overflow-x-hidden rounded-md border">
                    <Table className="w-full min-w-max">
                        <TableHeader>
                            <TableRow>
                                <TableHead>NORM</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Umur</TableHead>
                                <TableHead>Tanggal Lahir</TableHead>
                                <TableHead>Jenis Kelamin</TableHead>
                                <TableHead>Kelurahan</TableHead>
                                <TableHead>Alamat</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {props.pasiens.data.length > 0 ? (
                                props.pasiens.data.map((pasien) => (
                                    <TableRow
                                        key={pasien.NORM}
                                        onClick={() => router.get(`/master/pasiens/${pasien.NORM}`)}
                                        className="cursor-pointer hover:bg-gray-100"
                                    >
                                        <TableCell>{pasien.NORM}</TableCell>
                                        <TableCell>{pasien.NAMA}</TableCell>
                                        <TableCell>
                                            <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded">
                                                {calculateAge(pasien.TANGGAL_LAHIR)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {(() => {
                                                const date = new Date(pasien.TANGGAL_LAHIR);
                                                const day = String(date.getDate()).padStart(2, '0');
                                                const monthNames = [
                                                    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                                                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                                                ];
                                                const month = monthNames[date.getMonth()];
                                                const year = date.getFullYear();
                                                return `${day} ${month} ${year}`;
                                            })()}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-block px-2 py-1 text-xs font-semibold text-white rounded ${pasien.JENIS_KELAMIN === 1 ? 'bg-blue-500' : 'bg-pink-500'
                                                    }`}
                                            >
                                                {pasien.JENIS_KELAMIN === 1 ? 'Laki-laki' : 'Perempuan'}
                                            </span>
                                        </TableCell>
                                        <TableCell>{pasien.KECAMATAN}</TableCell>
                                        <TableCell>DESA {pasien.KELURAHAN}, {pasien.ALAMAT}, RT {pasien.RT} - RW {pasien.RW}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="px-2 py-1 text-xs font-semibold text-white bg-gray-500 rounded hover:bg-gray-600">
                                                        Actions
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        className="flex items-center space-x-2 hover:bg-blue-100"
                                                        onClick={() => router.get(`/master/pasiens/${pasien.NORM}/edit`)}
                                                    >
                                                        <Pencil className="h-4 w-4 text-blue-500" />
                                                        <span>Edit</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="flex items-center space-x-2 hover:bg-red-100"
                                                        onClick={() => {
                                                            if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                                                                router.delete(`/master/pasiens/${pasien.NORM}`);
                                                            }
                                                        }}
                                                    >
                                                        <Trash className="h-4 w-4 text-red-500" />
                                                        <span>Delete</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center">
                                        Data pasien tidak ditemukan
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-wrap justify-between items-center mt-4">
                    {/* Informasi Halaman */}
                    <div className="text-sm text-gray-700">
                        Page {props.pasiens.current_page} of {props.pasiens.last_page}
                    </div>

                    {/* Selector untuk jumlah item per halaman */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-700">Rows per page:</span>
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
                                onClick={() => router.get(props.pasiens.links.find((link) => link.label.includes('Previous'))?.url || '', { preserveState: true })}
                                disabled={!props.pasiens.links.find((link) => link.label.includes('Previous'))?.url}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.get(props.pasiens.links.find((link) => link.label.includes('Next'))?.url || '', { preserveState: true })}
                                disabled={!props.pasiens.links.find((link) => link.label.includes('Next'))?.url}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
