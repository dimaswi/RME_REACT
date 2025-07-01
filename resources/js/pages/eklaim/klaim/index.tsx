import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import { CalendarIcon, Check, Home, List, ListCollapse, Loader, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const FILTER_STORAGE_KEY = 'klaim_filter_state';

export default function KlaimIndex() {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: <Home className="mr-1 inline" />,
            href: '/eklaim/klaim',
        },
    ];
    // Ambil filter dari localStorage jika ada, jika tidak pakai default
    const getInitialFilters = () => {
        const saved = localStorage.getItem(FILTER_STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return {
                    q: '',
                    kelas: 'ALL',
                    poli: 'ALL',
                    status: 'ALL',
                    tanggal_awal: '',
                    tanggal_akhir: '',
                    perPage: 10,
                    page: 1,
                };
            }
        }
        return {
            q: '',
            kelas: 'ALL',
            poli: 'ALL',
            status: 'ALL',
            tanggal_awal: '',
            tanggal_akhir: '',
            perPage: 10,
            page: 1,
        };
    };

    const getInitialDataPendaftaran = () => {
        const saved = localStorage.getItem('klaim_data_pendaftaran');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return { data: [], links: [], current_page: 1, last_page: 1, perPage: 10 };
            }
        }
        return { data: [], links: [], current_page: 1, last_page: 1, perPage: 10 };
    };

    const [filters, setFilters] = useState(getInitialFilters);
    const [dataPendaftaran, setDataPendaftaran] = useState(getInitialDataPendaftaran);
    const [itemsPerPage, setItemsPerPage] = useState(filters.perPage);
    const [query, setQuery] = useState(filters.q);
    const [selectedKelas, setSelectedKelas] = useState(filters.kelas);
    const [selectedPoli, setSelectedPoli] = useState(filters.poli);
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: filters.tanggal_awal ? new Date(filters.tanggal_awal) : undefined,
        to: filters.tanggal_akhir ? new Date(filters.tanggal_akhir) : undefined,
    });
    const [selectedJenisTanggal, setSelectedJenisTanggal] = useState(filters.jenis_tanggal || 'MASUK'); // Default ke 'MASUK'
    const [selectedStatus, setSelectedStatus] = useState(filters.status);
    const [modalData, setModalData] = useState<any | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [loadingAjukan, setLoadingAjukan] = useState(false);
    const [loadingAmbilData, setLoadingAmbilData] = useState(false);

    // Simpan filter ke localStorage setiap kali filters berubah
    useEffect(() => {
        localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
    }, [filters]);

    useEffect(() => {
        localStorage.setItem('klaim_data_pendaftaran', JSON.stringify(dataPendaftaran));
    }, [dataPendaftaran]);

    // Fetch data from server pakai axios
    const fetchData = async (customFilters = filters) => {
        setLoadingAmbilData(true);
        toast.loading('Mengambil data.....');
        await axios
            .post('/eklaim/klaim/filter', customFilters)
            .then((response) => {
                console.log('Response data:', response.data);
                setDataPendaftaran(response.data.dataPendaftaran); // <-- ambil dataPendaftaran saja!
                toast.dismiss();
                toast.success('Data berhasil diambil');
            })
            .catch((error) => {
                toast.error('Gagal mengambil data');
            })
            .finally(() => setLoadingAmbilData(false));
    };

    // Handler untuk Next/Previous
    const handlePageChange = (page: number) => {
        setFilters((prev) => ({ ...prev, page }));
        fetchData({ ...filters, page }); // Panggil fetchData manual saat ganti page
    };

    // Handler submit filter
    const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFilters((prev) => ({ ...prev, page: 1 }));
        fetchData({ ...filters, page: 1 }); // Fetch manual saat submit filter
    };

    const handleRowClick = (item: any) => {
        setModalData(item);
        setShowModal(true);
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

    const prevLink = Array.isArray(dataPendaftaran.links)
        ? dataPendaftaran.links.find((l) => l.label === 'Previous' || l.label === '&laquo; Previous')
        : null;
    const nextLink = Array.isArray(dataPendaftaran.links)
        ? dataPendaftaran.links.find((l) => l.label === 'Next' || l.label === 'Next &raquo;')
        : null;
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
            nama_pasien: modalData.data_peserta.nama,
            nomor_pendaftaran: modalData.penjamin_pendaftaran.NOPEN,
            tgl_lahir: modalData.data_peserta.tglLahir,
            gender: modalData.data_peserta.sex == 'L' ? '1' : '2',
            jenis_perawatan: modalData.poliTujuan == 'IGD' ? 'Gawat Darurat' : modalData.poliTujuan == '' ? 'Rawat Inap' : 'Rawat Jalan',
        };

        router.post(route('eklaim.klaim.storePengajuanKlaim'), data, {
            onStart: () => setLoadingAjukan(true),
            onFinish: async () => {
                setLoadingAjukan(false);
                setShowModal(false);
                await fetchData(); // Refresh data setelah submit
            },
        });
    };

    useEffect(() => {
        setFilters((prev) => ({ ...prev, jenis_tanggal: selectedJenisTanggal }));
    }, [selectedJenisTanggal]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Klaim" />
            <div className="p-4">
                <div className="w-full overflow-x-auto rounded-md border">
                    {/* === Pindahkan Form Filter ke sini === */}
                    <form onSubmit={handleFilterSubmit} className="flex items-center justify-end gap-2 border-b bg-gray-50 p-4">
                        <Select
                            name="kelas"
                            value={filters.kelas}
                            onValueChange={(val) => {
                                setSelectedKelas(val);
                                setFilters((prev) => ({ ...prev, kelas: val }));
                            }}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue>
                                    {selectedKelas === 'ALL' || !selectedKelas
                                        ? 'Semua Kelas'
                                        : selectedKelas === '1'
                                            ? 'Kelas 1'
                                            : selectedKelas === '2'
                                                ? 'Kelas 2'
                                                : selectedKelas === '3'
                                                    ? 'Kelas 3'
                                                    : selectedKelas}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Semua Kelas</SelectItem>
                                <SelectItem value="1">Kelas 1</SelectItem>
                                <SelectItem value="2">Kelas 2</SelectItem>
                                <SelectItem value="3">Kelas 3</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            name="poli"
                            value={filters.poli}
                            onValueChange={(val) => {
                                setSelectedPoli(val);
                                setFilters((prev) => ({ ...prev, poli: val }));
                            }}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue>
                                    {selectedPoli === 'ALL'
                                        ? 'Semua Poli'
                                        : selectedPoli === 'RAWAT_INAP'
                                            ? 'Rawat Inap'
                                            : selectedPoli === 'INT'
                                                ? 'Poli Penyakit Dalam'
                                                : selectedPoli === 'ANA'
                                                    ? 'Poli Anak'
                                                    : selectedPoli === 'OBG'
                                                        ? 'Poli Obgyn'
                                                        : selectedPoli === 'BED'
                                                            ? 'Poli Bedah'
                                                            : selectedPoli === 'IGD'
                                                                ? 'Gawat Darurat'
                                                                : selectedPoli}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Semua Poli</SelectItem>
                                <SelectItem value="RAWAT_INAP">Rawat Inap</SelectItem>
                                <SelectItem value="INT">Poli Penyakit Dalam</SelectItem>
                                <SelectItem value="ANA">Poli Anak</SelectItem>
                                <SelectItem value="OBG">Poli Obgyn</SelectItem>
                                <SelectItem value="BED">Poli Bedah</SelectItem>
                                <SelectItem value="IGD">Gawat Darurat</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            name="status"
                            value={filters.status}
                            onValueChange={(val) => {
                                setSelectedStatus(val);
                                setFilters((prev) => ({ ...prev, status: val }));
                            }}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue>
                                    {selectedStatus === 'ALL'
                                        ? 'Semua Status'
                                        : selectedStatus == 0
                                            ? 'Belum Diajukan'
                                            : selectedStatus == 1
                                                ? 'Sudah Diajukan'
                                                : selectedStatus}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Semua Status</SelectItem>
                                <SelectItem value="0">Belum Diajukan</SelectItem>
                                <SelectItem value="1">Sudah Diajukan</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select name="jenis_tanggal" value={selectedJenisTanggal} onValueChange={(val) => setSelectedJenisTanggal(val)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue>
                                    {selectedJenisTanggal === 'SEP'
                                        ? 'Tanggal SEP'
                                        : selectedJenisTanggal === 'MASUK'
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
                                            setFilters((prev) => ({ ...prev, tanggal_awal: '', tanggal_akhir: '' }));
                                        }}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                        {loadingAmbilData ? (
                            <Button variant="outline" disabled className="flex items-center gap-2">
                                <Loader className="h-4 w-4 animate-spin" />
                                Filter
                            </Button>
                        ) : (
                            <Button type="submit" variant="outline">
                                <ListCollapse className="mr-2 h-4 w-4" />
                                Filter
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => {
                                router.visit(route('eklaim.klaim.indexPengajuanKlaim'));
                            }}
                        >
                            <List className="mr-2 h-4 w-4" />
                            List Pengajuan Klaim
                        </Button>
                    </form>
                    {/* === END Form Filter === */}

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No.</TableHead>
                                <TableHead>Nama Pasien</TableHead>
                                <TableHead>No Kartu</TableHead>
                                <TableHead>No SEP</TableHead>
                                <TableHead>Tanggal Masuk</TableHead>
                                <TableHead>Tanggal Keluar</TableHead>
                                <TableHead>Ruangan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.isArray(dataPendaftaran.data) && dataPendaftaran.data.length > 0 ? (
                                dataPendaftaran.data.map((item: any, idx: number) => (
                                    <TableRow
                                        key={item.noSEP || idx}
                                        onClick={() => handleRowClick(item)}
                                        className="cursor-pointer hover:bg-blue-50"
                                    >
                                        <TableCell>{(dataPendaftaran.current_page - 1) * dataPendaftaran.perPage + idx + 1}</TableCell> {/* Nomor urut */}
                                        <TableCell>{item.data_peserta?.nama || '-'}</TableCell>
                                        <TableCell>{item.data_peserta?.noKartu || '-'}</TableCell>
                                        <TableCell>{item.noSEP || '-'}</TableCell>
                                        <TableCell>
                                            {formatTanggalIndo(
                                                Array.isArray(item?.penjamin_pendaftaran?.kunjungan_pasien) &&
                                                    item.penjamin_pendaftaran.kunjungan_pasien.length > 0
                                                    ? item.penjamin_pendaftaran.kunjungan_pasien[
                                                        item.penjamin_pendaftaran.kunjungan_pasien.length - 1
                                                    ]?.MASUK
                                                    : '',
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {formatTanggalIndo(
                                                Array.isArray(item?.penjamin_pendaftaran?.kunjungan_pasien) &&
                                                    item.penjamin_pendaftaran.kunjungan_pasien.length > 0
                                                    ? item.penjamin_pendaftaran.kunjungan_pasien[
                                                        item.penjamin_pendaftaran.kunjungan_pasien.length - 1
                                                    ]?.KELUAR
                                                    : '',
                                            )}
                                        </TableCell>
                                        <TableCell>{item.poliTujuan || 'Rawat Inap'}</TableCell>
                                        <TableCell>{badgeStatus(item.klaimStatus)}</TableCell>
                                        {item.klaimStatus === 0 ? (
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent row click
                                                        handleRowClick(item);
                                                    }}
                                                >
                                                    <Save className="mr-2 h-4 w-4 text-green-400" />
                                                    Ajukan Klaim
                                                </Button>
                                            </TableCell>
                                        ) : (
                                            <TableCell>
                                                <Button variant="outline" size="sm" disabled className="cursor-not-allowed">
                                                    <Check className="mr-2 h-4 w-4 text-green-400" />
                                                    Klaim Diajukan
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center">
                                        Data tidak ditemukan
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between py-2">
                    <div>
                        Halaman {dataPendaftaran.current_page} dari {dataPendaftaran.last_page}
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Baris per halaman:</span>
                        <select
                            className="rounded border px-2 py-1"
                            value={filters.perPage}
                            onChange={(e) => {
                                setFilters((prev) => ({ ...prev, perPage: Number(e.target.value), page: 1 }));
                                fetchData({ ...filters, perPage: Number(e.target.value), page: 1 });
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(dataPendaftaran.current_page - 1)}
                            disabled={dataPendaftaran.current_page <= 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(dataPendaftaran.current_page + 1)}
                            disabled={dataPendaftaran.current_page >= dataPendaftaran.last_page}
                        >
                            Next
                        </Button>
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
