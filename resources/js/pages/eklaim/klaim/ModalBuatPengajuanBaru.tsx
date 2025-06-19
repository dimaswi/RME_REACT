import SearchableDropdownPasien from '@/components/SearchableDropdownPasien';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle } from 'lucide-react';
import React, { useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { router, usePage } from '@inertiajs/react';

function formatTanggalIndo(tanggal: string) {
    if (!tanggal) return '';
    const date = new Date(tanggal);
    if (isNaN(date.getTime())) return tanggal;
    const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
}

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
};

export default function ModalBuatPengajuanBaru({ open, onOpenChange, onSuccess }: Props) {
    const modalRef = useRef<HTMLDivElement>(null);
    const [selectedPasien, setSelectedPasien] = React.useState<any>(null);
    const [dataSEP, setDataSEP] = React.useState<any[]>([]);
    const [loadingSEP, setLoadingSEP] = React.useState(false);
    const [page, setPage] = React.useState(1);
    const perPage = 10;
    const [selectedSEP, setSelectedSEP] = React.useState<any>(null);
    const [jenisPerawatan, setJenisPerawatan] = React.useState('');
    const [saving, setSaving] = React.useState(false);

    const totalPage = Math.ceil(dataSEP.length / perPage);
    const paginatedSEP = dataSEP.slice((page - 1) * perPage, page * perPage);

    React.useEffect(() => {
        setPage(1);
    }, [dataSEP]);

    // Reset all state when modal closed
    React.useEffect(() => {
        if (!open) {
            setSelectedPasien(null);
            setDataSEP([]);
            setLoadingSEP(false);
            setPage(1);
            setSelectedSEP(null);
            setJenisPerawatan('');
        }
    }, [open]);

    if (!open) return null;

    // Handler untuk klik di luar modal
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onOpenChange(false);
        }
    };

    const handleCariSEP = async () => {
        const nomorBPJS = selectedPasien?.nomor_b_p_j_s?.NOMOR;
        if (!nomorBPJS) {
            toast.error("Nomor kartu tidak ditemukan pada data pasien.");
            return;
        }
        setLoadingSEP(true);
        try {
            const res = await fetch(`/api/kunjungan/sep/search/${nomorBPJS}`);
            const json = await res.json();
            setDataSEP(json.data || []);
            router.reload({ only: ['success', 'error'] });
        } catch (err) {
            toast.error("Terjadi kesalahan saat mengambil data SEP.");
            setDataSEP([]);
        }
        setLoadingSEP(false);
    };

    console.log(usePage().props);

    const handleSimpan = async () => {
        if (!selectedSEP || !selectedPasien || !jenisPerawatan || saving) return;
        setSaving(true);
        const data = {
            nomor_kartu: selectedSEP.noKartu || selectedPasien.nomor_b_p_j_s?.NOMOR || "",
            nomor_sep: selectedSEP.noSEP || "",
            nomor_rm: selectedPasien.NORM || "",
            nama_pasien: selectedPasien.NAMA || "",
            nomor_pendaftaran: selectedSEP.penjamin_pendaftaran.NOPEN || "",
            tgl_lahir: selectedPasien.TANGGAL_LAHIR || "",
            gender: selectedPasien.JENIS_KELAMIN || "",
            jenis_perawatan: jenisPerawatan, // <-- tambahkan ini
        };

            router.post(route('eklaim.klaim.storePengajuanKlaim'), data, {
                preserveState: true,
                preserveScroll: true,
                onStart: () => {
                    setSaving(true);
                },
                onFinish: () => {
                    setSaving(false);
                },
                onError: () => {
                    setSaving(false);
                },
                onSuccess: () => {
                    setSaving(false);
                },
            });
            
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-10 text-sm" onMouseDown={handleBackdropClick}>
            <div
                ref={modalRef}
                className="animate-in fade-in zoom-in-95 relative w-full max-w-7xl rounded-sm bg-white p-6 shadow-2xl"
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    className="absolute top-3 right-3 text-gray-400 transition hover:text-gray-700"
                    onClick={() => onOpenChange(false)}
                    aria-label="Tutup"
                >
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
                    </svg>
                </button>
                {/* Header */}
                <div className="-mx-6 -mt-6 mb-4 rounded-t-xl bg-gray-100 px-6 py-4 align-middle">
                    <PlusCircle className="mr-2 inline text-emerald-600" size={24} />
                    Buat Pengajuan Klaim Baru
                </div>
                {/* Content */}
                <div className="">
                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                            <label className="mb-2 block font-medium">Cari Pasien</label>
                            <SearchableDropdownPasien value={selectedPasien?.nomor_b_p_j_s?.NOMOR || ''} onChange={setSelectedPasien} />
                        </div>
                        <Button variant="outline" onClick={handleCariSEP} className="">
                            {loadingSEP ? 'Mencari...' : 'Cari SEP'}
                        </Button>
                        {selectedSEP && selectedPasien && (
                            <Button variant="outline" onClick={() => setSelectedSEP(null)}>
                                Batal
                            </Button>
                        )}
                        {dataSEP.length > 0 && !selectedSEP && (
                            <Button variant="outline" onClick={() => setDataSEP([])}>
                                Reset SEP
                            </Button>
                        )}
                    </div>

                    {paginatedSEP.length > 0 && !selectedSEP && (
                        <div className="mt-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No SEP</TableHead>
                                        <TableHead>Tgl SEP</TableHead>
                                        {/* Kolom lain */}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedSEP.map((sep: any, idx: number) => (
                                        <TableRow key={sep.noSEP + '-' + idx}>
                                            <TableCell>
                                                <button
                                                    className="text-blue-600 hover:underline"
                                                    onClick={() => setSelectedSEP(sep)}
                                                    type="button"
                                                >
                                                    {sep.noSEP}
                                                </button>
                                            </TableCell>
                                            <TableCell>{formatTanggalIndo(sep.tglSEP)}</TableCell>
                                            {/* Kolom lain */}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {totalPage > 1 && (
                                <div className="mt-2 flex justify-end gap-2">
                                    <button className="rounded border px-3 py-1 text-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                                        Prev
                                    </button>
                                    <span className="px-2 py-1">
                                        {page} / {totalPage}
                                    </span>
                                    <button
                                        className="rounded border px-3 py-1 text-sm"
                                        disabled={page === totalPage}
                                        onClick={() => setPage(page + 1)}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Detail SEP & Pasien */}
                    {selectedSEP && selectedPasien && (
                        <>
                            <div className="mt-4 rounded bg-blue-50 p-2 text-[11px]">
                                <div>
                                    <b>Nama Pasien:</b> {selectedPasien.NAMA}
                                </div>
                                <div>
                                    <b>Nomor RM:</b> {selectedPasien.NORM}
                                </div>
                                <div>
                                    <b>Tanggal Lahir:</b> {formatTanggalIndo(selectedPasien.TANGGAL_LAHIR)}
                                </div>
                                <div>
                                    <b>Jenis Kelamin:</b> {selectedPasien.JENIS_KELAMIN === 1 ? 'Laki-laki' : 'Perempuan'}
                                </div>
                                <div>
                                    <b>No SEP:</b> {selectedSEP.noSEP}
                                </div>
                                <div>
                                    <b>Tgl SEP:</b> {formatTanggalIndo(selectedSEP.tglSEP)}
                                </div>
                                <div>
                                    <b>Ruangan</b> : {selectedSEP.poliTujuan || 'Rawat Inap'}
                                </div>
                            </div>
                            {/* Tambahan Select Jenis Perawatan */}
                            <div className="mt-4">
                                <label className="block mb-1 font-medium text-xs">Jenis Perawatan</label>
                                <select
                                    className="w-full rounded border px-3 py-2 text-sm"
                                    value={jenisPerawatan}
                                    onChange={e => setJenisPerawatan(e.target.value)}
                                >
                                    <option value="">Pilih Jenis Perawatan</option>
                                    <option value="Rawat Inap">Rawat Inap</option>
                                    <option value="Rawat Jalan">Rawat Jalan</option>
                                    <option value="IGD">IGD</option>
                                </select>
                            </div>
                        </>
                    )}
                </div>
                {/* Footer */}
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-100"
                        onClick={() => onOpenChange(false)}
                    >
                        Batal
                    </button>
                    <button
                        className="rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
                        onClick={handleSimpan}
                        disabled={!selectedSEP || !selectedPasien || saving}
                    >
                        {saving ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>
            </div>
        </div>
    );
}
