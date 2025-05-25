import AppLayout from "@/layouts/app-layout"
import { BreadcrumbItem } from "@/types"
import { Head, usePage, router } from "@inertiajs/react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import React, { useState } from "react"
import { PlusCircle, X, Search } from "lucide-react"

export default function KlaimShow() {
    const { pasien, pengajuan_klaim, klaimFilter } = usePage().props as {
        pasien: {
            NAMA: string,
            NORM: string,
            ALAMAT: string,
        },
        pengajuan_klaim: any[],
        klaimFilter?: { q?: string }
    };

    const [activeTab, setActiveTab] = useState<"pasien" | "klaim">("pasien");
    const [searchKlaim, setSearchKlaim] = useState(klaimFilter?.q || "");
    const [showModal, setShowModal] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Klaim',
            href: '/eklaim/klaim',
        },
        {
            title: 'Detail Klaim',
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
        // Lakukan submit data di sini
        setShowModal(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Klaim - ${pasien.NAMA}`} />
            <div className="p-4">
                {/* Custom Tabs */}
                <div className="mb-4 border-b border-gray-300 flex">
                    <button
                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                            activeTab === "pasien"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-700 hover:text-blue-600"
                        }`}
                        onClick={() => setActiveTab("pasien")}
                        type="button"
                    >
                        Detail Pasien
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                            activeTab === "klaim"
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
                            <div className="relative w-64">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">
                                    <Search size={16} />
                                </span>
                                <input
                                    type="text"
                                    value={searchKlaim}
                                    onChange={handleSearchKlaimChange}
                                    className="border rounded-md p-1 text-sm pl-8 w-full focus:ring-2 focus:ring-blue-200"
                                    placeholder="Cari No Klaim / Status"
                                />
                            </div>
                            <Button onClick={handleTambahPengajuan} size="sm" className="bg-green-400 hover:bg-green-700 flex gap-1 items-center">
                                <PlusCircle size={16}/>
                                Tambah Pengajuan
                            </Button>
                        </div>
                        <div className="w-full overflow-x-auto rounded-md border">
                            <Table className="w-full min-w-max">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No</TableHead>
                                        <TableHead>No Klaim</TableHead>
                                        <TableHead>Tanggal Pengajuan</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pengajuan_klaim && pengajuan_klaim.length > 0 ? (
                                        pengajuan_klaim.map((item: any, idx: number) => (
                                            <TableRow key={item.id || idx}>
                                                <TableCell>{idx + 1}</TableCell>
                                                <TableCell>{item.no_klaim || '-'}</TableCell>
                                                <TableCell>{item.tanggal_pengajuan || '-'}</TableCell>
                                                <TableCell>
                                                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-500 text-white">
                                                        {item.status || '-'}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">
                                                Data pengajuan klaim tidak ditemukan
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {/* Modal Tambah Pengajuan */}
                        {showModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                                <div className="bg-white rounded-lg shadow-lg w-full max-w-7xl p-0 relative">
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
                                            <label className="block text-sm mb-1">No Klaim</label>
                                            <input type="text" className="border rounded-md p-1 w-full" required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm mb-1">Tanggal Pengajuan</label>
                                            <input type="date" className="border rounded-md p-1 w-full" required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm mb-1">Status</label>
                                            <input type="text" className="border rounded-md p-1 w-full" required />
                                        </div>
                                        <div className="flex justify-end gap-2 mt-4">
                                            <Button type="button" variant="outline" onClick={handleCloseModal}>Batal</Button>
                                            <Button type="submit" className="bg-blue-600 text-white">Simpan</Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
