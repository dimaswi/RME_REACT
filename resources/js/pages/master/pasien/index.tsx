import { Head, router, usePage } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Trash, Pencil, PlusCircle, Hospital } from 'lucide-react';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from '@/components/ui/context-menu';
import ModalDaftarPasien from "@/components/modal-daftar-pasien";
import ModalBookingBed from "@/./pages/booking/bed/booking-modal";
import SearchableDropdown from "@/components/SearchableDropdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


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
    TIDAK_DIKENAL: number;
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
    const [modalDaftarOpen, setModalDaftarOpen] = useState(false);
    const [selectedPasien, setSelectedPasien] = useState<any>(null);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [modalBedOpen, setModalBedOpen] = useState(false);
    const [selectedBed, setSelectedBed] = useState(null);
    const [ppkList, setPpkList] = useState<any[]>([]);
    const [selectedPpk, setSelectedPpk] = useState("");

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

    // State Context Menu Daftar Pasien
    const [selectedRuangan5, setSelectedRuangan5] = useState("");
    const [selectedRuangan7, setSelectedRuangan7] = useState("");
    const [selectedRuangan9, setSelectedRuangan9] = useState("");
    const [open, setOpen] = useState(false);
    const [dokterList, setDokterList] = useState<any[]>([]);
    const [selectedDokter, setSelectedDokter] = useState("");

    // Filter ruangan 5 digit
    const ruangan5Digit = (props.ruangan || []).filter(r => r.JENIS == 3);
    // Filter ruangan 7 digit yang mengandung selectedRuangan5
    const ruangan7Digit = (props.ruangan || []).filter(
        r =>
            r.JENIS == 4 &&
            selectedRuangan5.length === 5 &&
            String(r.ID).includes(selectedRuangan5)
    );
    // Filter ruangan 9 digit yang mengandung selectedRuangan7
    const ruangan9Digit = (props.ruangan || []).filter(
        r =>
            r.JENIS == 5 &&
            selectedRuangan7.length === 7 &&
            String(r.ID).includes(selectedRuangan7)
    );

    // Ambil data dokter sesuai dengan ruangan
    useEffect(() => {
        if (selectedRuangan9) {
            fetch(route('master.dokter.ajax', { ruangan_id: selectedRuangan9 }))
                .then(res => res.json())
                .then(data => setDokterList(data.dokter || []));
        } else {
            setDokterList([]);
        }
    }, [selectedRuangan9]);

    // Load data PPK (Rumah Sakit Perujuk) via controller endpoint
    useEffect(() => {
        fetch('/master/ppk-list')
            .then(res => res.json())
            .then(data => setPpkList(data || []));
    }, []);

    const handleCloseModal = (open: boolean) => {
        setModalDaftarOpen(open);
        if (!open) {
            setTimeout(() => {
                const active = document.activeElement as HTMLElement | null;
                if (active && active.closest('.modal-daftar-pasien')) {
                    document.body.focus();
                }
            }, 0);
        }
    };

    // Ref untuk menyimpan NORM pasien yang diklik kanan
    const rightClickRowRef = useRef<string | null>(null);

    // Handler klik kanan pada row
    const handleRowContextMenu = (e: React.MouseEvent, pasien: Pasien) => {
        e.preventDefault();
        rightClickRowRef.current = pasien.NORM;
        setSelectedPasien(pasien);
        setModalDaftarOpen(true);
        setSelectedRuangan5("");
        setSelectedRuangan7("");
        setSelectedRuangan9("");
        setSelectedDokter("");
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
                    <div className='flex space-x-2'>
                        <Button
                            variant="outline"
                            onClick={() => router.get(route('master.pasien.create'))} // Pastikan nama rute sesuai
                            className="mb-4"
                        >
                            <PlusCircle />
                            Tambah
                        </Button>
                    </div>

                </div>

                {/* Table */}
                <div className="w-full overflow-x-hidden rounded-md border">
                    <Table className="w-full min-w-max">
                        <TableHeader>
                            <TableRow>
                                <TableHead>NORM</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Tanggal Lahir</TableHead>
                                <TableHead>Umur</TableHead>
                                <TableHead>Jenis Kelamin</TableHead>
                                <TableHead>Kelurahan</TableHead>
                                <TableHead><center>Alamat</center></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {props.pasiens.data.length > 0 ? (
                                props.pasiens.data.map((pasien) => (
                                    <TableRow
                                        key={pasien.NORM}
                                        className="cursor-pointer hover:bg-gray-100"
                                        onClick={() => router.get(`/master/pasiens/${pasien.NORM}`)}
                                        onContextMenu={e => handleRowContextMenu(e, pasien)}
                                    >
                                        <TableCell>{pasien.NORM}</TableCell>
                                        <TableCell>{pasien.NAMA}</TableCell>
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
                                            <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded">
                                                {calculateAge(pasien.TANGGAL_LAHIR)}
                                            </span>
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
                                        <TableCell>
                                            {pasien.TIDAK_DIKENAL == 1 ? (
                                                <center>
                                                    <span className="inline-block px-3 py-1 text-xs font-bold text-white bg-red-600 rounded">
                                                        Pasien Tidak Dikenal
                                                    </span>
                                                </center>
                                            ) : (
                                                <>DESA {pasien.KELURAHAN}, {pasien.ALAMAT}, RT {pasien.RT} - RW {pasien.RW}</>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">
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

                {/* Modal Daftar Pasien */}
                <ModalDaftarPasien
                    open={modalDaftarOpen}
                    onClose={handleCloseModal}
                    pasien={selectedPasien}
                >
                    <div className="grid grid-cols-2 gap-4 mx-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tujuan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 mb-2">
                                    <div>
                                        <SearchableDropdown
                                            placeholder="Pilih Instalasi"
                                            data={ruangan5Digit}
                                            value={selectedRuangan5}
                                            setValue={val => {
                                                setSelectedRuangan5(val);
                                                setSelectedRuangan7("");
                                                setSelectedRuangan9("");
                                            }}
                                            getOptionLabel={item => item.DESKRIPSI}
                                            getOptionValue={item => item.ID}
                                            autoFocus={false}
                                        />
                                    </div>
                                </div>
                                <div className='grid grid-cols-2 gap-4 mb-2'>
                                    <div>
                                        <SearchableDropdown
                                            placeholder="Pilih Unit"
                                            data={ruangan7Digit}
                                            value={selectedRuangan7}
                                            setValue={val => {
                                                setSelectedRuangan7(val);
                                                setSelectedRuangan9("");
                                            }}
                                            getOptionLabel={item => item.DESKRIPSI}
                                            getOptionValue={item => item.ID}
                                            disabled={!selectedRuangan5}
                                            autoFocus={false}
                                        />
                                    </div>
                                    <div>
                                        <SearchableDropdown
                                            placeholder="Pilih Ruangan"
                                            data={ruangan9Digit}
                                            value={selectedRuangan9}
                                            setValue={setSelectedRuangan9}
                                            getOptionLabel={item => item.DESKRIPSI}
                                            getOptionValue={item => item.ID}
                                            disabled={!selectedRuangan7}
                                            autoFocus={false}
                                        />
                                    </div>
                                </div>
                                <div className='grid grid-cols-1'>
                                    {selectedRuangan9 && (() => {
                                        const ruanganObj = ruangan9Digit.find(r => String(r.ID) === String(selectedRuangan9));
                                        if (ruanganObj && Number(ruanganObj.JENIS_KUNJUNGAN) === 3) {
                                            // Jika rawat inap, tampilkan dropdown dokter DAN input booking bed
                                            return (
                                                <>
                                                    <div className="mb-2">
                                                        <SearchableDropdown
                                                            placeholder="Pilih Dokter"
                                                            data={dokterList}
                                                            value={selectedDokter}
                                                            setValue={setSelectedDokter}
                                                            getOptionLabel={item => {
                                                                if (!item || !item.data_dokter || !item.data_dokter.pegawai) return 'Tanpa Nama';
                                                                const pegawai = item.data_dokter.pegawai;
                                                                const gelarDepan = pegawai.GELAR_DEPAN ? pegawai.GELAR_DEPAN + ' ' : '';
                                                                const nama = pegawai.NAMA || '';
                                                                const gelarBelakang = pegawai.GELAR_BELAKANG ? ' ' + pegawai.GELAR_BELAKANG : '';
                                                                return `${gelarDepan}${nama}${gelarBelakang}`.trim() || 'Tanpa Nama';
                                                            }}
                                                            getOptionValue={item => item.DOKTER}
                                                            autoFocus={false}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Input
                                                            readOnly
                                                            value={selectedBed ? `${selectedBed.kamar} - ${selectedBed.nama}` : ""}
                                                            placeholder="Pilih Tempat Tidur"
                                                            className="cursor-pointer bg-white"
                                                            onClick={() => setModalBedOpen(true)}
                                                        />
                                                    </div>
                                                </>
                                            );
                                        }

                                        if (ruanganObj && [1, 2, 17].includes(Number(ruanganObj.JENIS_KUNJUNGAN))) {
                                            return (
                                                <div className="mb-4">
                                                    <SearchableDropdown
                                                        placeholder="Pilih Dokter"
                                                        data={dokterList}
                                                        value={selectedDokter}
                                                        setValue={setSelectedDokter}
                                                        getOptionLabel={item => {
                                                            if (!item || !item.data_dokter || !item.data_dokter.pegawai) return 'Tanpa Nama';
                                                            const pegawai = item.data_dokter.pegawai;
                                                            const gelarDepan = pegawai.GELAR_DEPAN ? pegawai.GELAR_DEPAN + ' ' : '';
                                                            const nama = pegawai.NAMA || '';
                                                            const gelarBelakang = pegawai.GELAR_BELAKANG ? ' ' + pegawai.GELAR_BELAKANG : '';
                                                            return `${gelarDepan}${nama}${gelarBelakang}`.trim() || 'Tanpa Nama';
                                                        }}
                                                        getOptionValue={item => item.DOKTER}
                                                        autoFocus={false}
                                                    />
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Rujukan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 mb-2">
                                    <div>
                                        <SearchableDropdown
                                            placeholder="Pilih Rumah Sakit Perujuk"
                                            data={ppkList}
                                            value={selectedPpk}
                                            setValue={setSelectedPpk}
                                            getOptionLabel={item => item.NAMA}
                                            getOptionValue={item => item.ID}
                                            autoFocus={false}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className='grid grid-cols-2 gap-4 mx-6 mt-4'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Penjamin</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 mb-2">
                                    <div>

                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Kecelakaan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 mb-2">
                                    <div>

                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className='grid grid-cols-2 gap-4 mx-6 mt-4'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Penjamin</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 mb-2">
                                    <div>

                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Kecelakaan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 mb-2">
                                    <div>

                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </ModalDaftarPasien>
                <ModalBookingBed
                    open={modalBedOpen}
                    onClose={() => setModalBedOpen(false)}
                    selectedRuangan9={selectedRuangan9}
                    onSelectBed={setSelectedBed}
                />
            </div>
        </AppLayout>
    );
}
