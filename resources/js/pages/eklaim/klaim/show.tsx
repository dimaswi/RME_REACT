import AppLayout from "@/layouts/app-layout"
import { BreadcrumbItem } from "@/types"
import { Head, usePage, router } from "@inertiajs/react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import React, { useState } from "react"
import { PlusCircle, X, Search, Calendar as CalendarIcon, Check, AlignJustify, Pencil, Trash, Home } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import id from "date-fns/locale/id"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function KlaimShow() {
    const { pasien, pengajuan_klaim, klaimFilter, kunjungan } = usePage().props as {
        pasien: { NAMA: string, NORM: string, ALAMAT: string },
        pengajuan_klaim: any[],
        klaimFilter?: { q?: string },
        kunjungan: any[],
    };


    const [activeTab, setActiveTab] = useState<"pasien" | "klaim">("pasien");
    const [searchKlaim, setSearchKlaim] = useState(klaimFilter?.q || "");
    const [showModal, setShowModal] = useState(false);
    const [selectedSEP, setSelectedSEP] = useState<string>("");
    const [selectedKunjungan, setSelectedKunjungan] = useState<any>(null);
    const [showKunjunganModal, setShowKunjunganModal] = useState(false);
    const [tanggalPengajuan, setTanggalPengajuan] = useState("");

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: <Home className="inline mr-1" />,
            href: '/eklaim/klaim',
        },
        {
            title: pasien.NAMA,
            href: '#',
        }
    ];
    // Handler search pengajuan klaim
    const handleSearchKlaimChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchKlaim(value);
        router.get(
            route('eklaim.klaim.show', { pasien: pasien.NORM }),
            { q: value },
            { preserveState: true, replace: true }
        );
    };

    // Handler tambah pengajuan klaim
    const handleTambahPengajuan = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    // Handler submit form pada modal (dummy, silakan sesuaikan)
    const handleSubmitPengajuan = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedKunjungan) return;

        router.post(
            route('eklaim.klaim.storePengajuanKlaim'),
            {
                NORM: pasien.NORM,
                nomor_SEP: selectedKunjungan.noSEP,
                nomor_pendaftaran: selectedKunjungan.nomorPendaftaran,
                tanggal_pengajuan: tanggalPengajuan,
                nomor_kartu: selectedKunjungan.noKartu,
                nomor_sep: selectedKunjungan.noSEP,
                nomor_rm: pasien.NORM,
                nama_pasien: pasien.NAMA,
                tgl_lahir: pasien.TANGGAL_LAHIR,
                gender: pasien.JENIS_KELAMIN,
                tanggal_sep: selectedKunjungan.tglSEP,
            },
            {
                preserveScroll: true,
                preserveState: false, // pastikan ini false!
                onSuccess: () => {
                    setShowModal(false);
                    setSelectedSEP("");
                    setSelectedKunjungan(null);
                    setTanggalPengajuan("");
                },
            }
        );
    };

    // Handler untuk mengajukan klaim ke Eklaim
    const handleAjukanKlaim = (item: any) => {
        router.post(route('eklaim.klaim.pengajuanUlang', item))
    };

    // Helper untuk flatten daftar kunjungan BPJS dari hasil relasi
const daftarSEP = React.useMemo(() => {
    if (!Array.isArray(kunjungan)) return [];
    return kunjungan.flatMap((pendaftaran: any) => {
        // Pastikan penjamin adalah array
        let penjaminArr: any[] = [];
        if (Array.isArray(pendaftaran.penjamin)) {
            penjaminArr = pendaftaran.penjamin;
        } else if (pendaftaran.penjamin) {
            penjaminArr = [pendaftaran.penjamin];
        }
        return penjaminArr.flatMap((penjamin: any) => {
            // Pastikan kunjungan_b_p_j_s adalah array
            const bpjsArr = Array.isArray(penjamin.kunjungan_b_p_j_s)
                ? penjamin.kunjungan_b_p_j_s
                : penjamin.kunjungan_b_p_j_s
                    ? [penjamin.kunjungan_b_p_j_s]
                    : [];
            return bpjsArr.map((bpjs: any) => ({
                noKartu: bpjs.noKartu || "-",
                nomorPendaftaran: pendaftaran.NOMOR,
                noSEP: bpjs.noSEP,
                tglSEP: bpjs.tglSEP,
                NORM: pendaftaran.NORM,
                tanggalLahir: pasien.TANGGAL_LAHIR,
                jenisKelamin: pasien.JENIS_KELAMIN,
                ruangTujuan: (pendaftaran.riwayat_kunjungan?.[0]?.ruangan?.DESKRIPSI) || "-",
                diagnosa: bpjs.diagAwal,
                statusPulang: bpjs.statusPulang,
            }));
        });
    });
}, [kunjungan, pasien]);

    const handleSEPChange = (value: string) => {
        setSelectedSEP(value);
        const detail = daftarSEP.find((k: any) => k.noSEP === value);
        setSelectedKunjungan(detail || null);
    };

    function formatTanggalIndo(tgl: string) {
        if (!tgl) return "-";
        const bulan = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        const [tahun, bulanIdx, tanggal] = tgl.split("-");
        if (!tahun || !bulanIdx || !tanggal) return tgl;
        return `${parseInt(tanggal)} ${bulan[parseInt(bulanIdx, 10) - 1]} ${tahun}`;
    }


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Klaim - ${pasien.NAMA}`} />
            <div className="p-4">
                {/* Custom Tabs */}
                <div className="mb-4 border-b border-gray-300 flex">
                    <button
                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === "pasien"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-700 hover:text-blue-600"
                            }`}
                        onClick={() => setActiveTab("pasien")}
                        type="button"
                    >
                        Detail Pasien
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === "klaim"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-700 hover:text-blue-600"
                            }`}
                        onClick={() => setActiveTab("klaim")}
                        type="button"
                    >
                        Pengajuan Klaim
                    </button>
                </div>
                {/* Tab Content */}
                {activeTab === "pasien" && (
                    <div>
                        <div className="mb-2">NORM: {pasien.NORM}</div>
                        <div className="mb-2">Nama: {pasien.NAMA}</div>
                        <div className="mb-2">Alamat: {pasien.ALAMAT}</div>
                    </div>
                )}
                {activeTab === "klaim" && (
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <Button onClick={handleTambahPengajuan} size="sm" className="bg-green-400 hover:bg-green-700 flex gap-1 items-center">
                                <PlusCircle size={16} />
                                Tambah Pengajuan
                            </Button>
                        </div>
                        <div className="w-full overflow-x-auto rounded-md border">
                            <Table className="w-full min-w-max">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No</TableHead>
                                        <TableHead>Nomor Pendaftaran</TableHead>
                                        <TableHead>Nomor SEP</TableHead>
                                        <TableHead>Tanggal Pengajuan</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pengajuan_klaim && pengajuan_klaim.length > 0 ? (
                                        pengajuan_klaim.map((item: any, idx: number) => (
                                            <TableRow key={item.id || idx}>
                                                <TableCell>{idx + 1}</TableCell>
                                                <TableCell>{item.nomor_pendaftaran || '-'}</TableCell>
                                                <TableCell>{item.nomor_SEP || '-'}</TableCell>
                                                <TableCell>{item.tanggal_pengajuan || '-'}</TableCell>
                                                <TableCell>
                                                    {item.status === 0 && (
                                                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-yellow-400 text-white">
                                                            Belum Diajukan
                                                        </span>
                                                    )}
                                                    {item.status === 1 && (
                                                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-green-400 text-white">
                                                            Diajukan
                                                        </span>
                                                    )}
                                                    {item.status === 2 && (
                                                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-400 text-white">
                                                            Final
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
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
                                                                    onClick={() => handleAjukanKlaim(item.id)}
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
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center">
                                                Data pengajuan klaim tidak ditemukan
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {/* Modal Tambah Pengajuan */}
                        {showModal && (
                            <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40">
                                <div className="bg-white rounded-lg shadow-lg w-full max-w-7xl p-0 relative mt-10">
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 rounded-t-lg bg-gradient-to-r from-blue-50 to-blue-100">
                                        <h2 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                                            <PlusCircle size={30} className="text-blue-500" />
                                            Buat Klaim Baru
                                        </h2>
                                        <button
                                            className="text-gray-500 hover:text-red-500 transition-colors"
                                            onClick={handleCloseModal}
                                            type="button"
                                        >
                                            <X size={22} />
                                        </button>
                                    </div>
                                    {/* Modal Body */}
                                    <form onSubmit={handleSubmitPengajuan} className="px-6 py-4">
                                        <div className="mb-3">
                                            <Label className="block text-sm mb-1" htmlFor="no_klaim">Nomor SEP</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="no_klaim"
                                                    value={selectedSEP}
                                                    readOnly
                                                    placeholder="Pilih Nomor SEP"
                                                    className="cursor-pointer bg-gray-100"
                                                    onClick={() => setShowKunjunganModal(true)}
                                                />
                                                <Button type="button" onClick={() => setShowKunjunganModal(true)}>
                                                    Pilih SEP
                                                </Button>
                                            </div>
                                        </div>
                                        {selectedKunjungan && (
                                            <div className="mb-3 p-2 border rounded bg-blue-50 text-xs">
                                                <div>
                                                    <b>Tanggal SEP:</b> {formatTanggalIndo(selectedKunjungan.tglSEP)}
                                                </div>
                                                <div>
                                                    <b>Nomor Kartu:</b> {selectedKunjungan.noKartu || "-"}
                                                </div>
                                                <div>
                                                    <b>Nomor SEP:</b> {selectedKunjungan.noSEP || "-"}
                                                </div>
                                                <div>
                                                    <b>Nomor RM:</b> {selectedKunjungan.NORM || "-"}
                                                </div>
                                                <div>
                                                    <b>Nama Pasien:</b> {pasien.NAMA || "-"}
                                                </div>
                                                <div>
                                                    <b>Tgl Lahir:</b> {selectedKunjungan.tanggalLahir ? formatTanggalIndo(selectedKunjungan.tanggalLahir.split(" ")[0]) : "-"}
                                                </div>
                                                <div>
                                                    <b>Gender:</b> {selectedKunjungan.jenisKelamin == 1 ? "Laki-laki" : selectedKunjungan.jenisKelamin == 2 ? "Perempuan" : "-"}
                                                </div>
                                            </div>
                                        )}
                                        <div className="mb-3">
                                            <Label className="block text-sm mb-1" htmlFor="tanggal_pengajuan">Tanggal Pengajuan</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <div className="relative w-full">
                                                        <Input
                                                            id="tanggal_pengajuan"
                                                            value={tanggalPengajuan ? format(new Date(tanggalPengajuan), "dd/MM/yyyy", { locale: id }) : ""}
                                                            readOnly
                                                            placeholder="Pilih tanggal pengajuan klaim"
                                                            className="cursor-pointer bg-white font-semibold rounded-lg pl-10 border-2 border-blue-200 focus:border-blue-500 transition-colors"
                                                        />
                                                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={20} />
                                                    </div>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 rounded-xl shadow-2xl border-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={tanggalPengajuan ? new Date(tanggalPengajuan) : undefined}
                                                        onSelect={date => {
                                                            setTanggalPengajuan(date ? format(date, "yyyy-MM-dd") : "");
                                                        }}
                                                        initialFocus
                                                        fromYear={1940}
                                                        toYear={new Date().getFullYear()}
                                                        classNames={{
                                                            months: "rounded-xl",
                                                            // Tambahkan grid-cols-7 pada 'table' atau 'days'
                                                            table: "w-full border-collapse",
                                                            head_row: "",
                                                            row: "",
                                                            cell: "",
                                                            day: "rounded-md hover:bg-blue-100 transition-colors",
                                                            day_selected: "bg-blue-600 text-white hover:bg-blue-700",
                                                            day_today: "border-blue-500",
                                                            // Ini penting!
                                                            days: "grid grid-cols-7 gap-1", // pastikan ini ada!
                                                        }}
                                                    />
                                                    <div className="flex justify-end px-3 py-2 border-t bg-blue-50 rounded-b-xl">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                                                            onClick={() => setTanggalPengajuan(format(new Date(), "yyyy-MM-dd"))}
                                                        >
                                                            Ambil Tanggal Hari Ini
                                                        </Button>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="flex justify-end gap-2 mt-4">
                                            <Button type="button" variant="outline" onClick={handleCloseModal}>Batal</Button>
                                            <Button type="submit" className="bg-blue-600 text-white">Simpan</Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                        {/* Modal Pilih SEP */}
                        {showKunjunganModal && (
                            <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40">
                                <div className="bg-white rounded-lg shadow-lg w-full max-w-7xl p-0 relative mt-10">
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 rounded-t-lg bg-gradient-to-r from-blue-50 to-blue-100">
                                        <h2 className="text-lg font-bold text-blue-700">Pilih Kunjungan SEP</h2>
                                        <button
                                            className="text-gray-500 hover:text-red-500 transition-colors"
                                            onClick={() => setShowKunjunganModal(false)}
                                            type="button"
                                        >
                                            <X size={22} />
                                        </button>
                                    </div>
                                    <div className="p-4 max-h-[60vh] overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>No</TableHead>
                                                    <TableHead>Nomor SEP</TableHead>
                                                    <TableHead>Tanggal SEP</TableHead>
                                                    <TableHead>Ruang Tujuan</TableHead>
                                                    <TableHead>Diagnosa</TableHead>
                                                    <TableHead>Status Pulang</TableHead>
                                                    <TableHead>Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {daftarSEP.length > 0 ? (
                                                    daftarSEP.map((k: any, idx: number) => (
                                                        <TableRow key={k.noSEP + '-' + idx}>
                                                            <TableCell>{idx + 1}</TableCell>
                                                            <TableCell>{k.noSEP}</TableCell>
                                                            <TableCell>{formatTanggalIndo(k.tglSEP)}</TableCell>
                                                            <TableCell>{k.ruangTujuan}</TableCell>
                                                            <TableCell>{k.diagnosa || '-'}</TableCell>
                                                            <TableCell>{k.statusPulang || '-'}</TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedSEP(k.noSEP);
                                                                        setSelectedKunjungan(k);
                                                                        setShowKunjunganModal(false);
                                                                    }}
                                                                >
                                                                    Pilih
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="text-center">
                                                            Data kunjungan tidak ditemukan
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
