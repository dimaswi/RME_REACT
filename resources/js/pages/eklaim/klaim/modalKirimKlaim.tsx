import SearchableDropdown from "@/components/SearchableDropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { router } from "@inertiajs/react";
import { Calendar, Loader, PlusCircle, Send, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function ModalKirimKlaim({ open, onOpenChange }: Props) {
    const modalRef = useRef<HTMLDivElement>(null);

    const [loadingKirim, setLoadingKirim] = useState(false);
    const [jenisKunjungan, setJenisKunjungan] = useState("3");
    const [jenisTanggal, setJenisTanggal] = useState("1");
    const [tanggalAwal, setTanggalAwal] = useState(new Date().toISOString().slice(0, 10));
    const [tanggalAkhir, setTanggalAkhir] = useState(new Date().toISOString().slice(0, 10));

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onOpenChange(false);
        }
    };
    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-10 text-sm" onMouseDown={handleBackdropClick}>
            <div
                ref={modalRef}
                className="animate-in fade-in zoom-in-95 relative w-full max-w-7xl rounded-sm bg-white p-6 shadow-2xl"
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
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
                    <Send className="mr-2 inline text-emerald-600" size={24} />
                    <span className="text-l font-semibold">Kirim Data Klaim</span>
                </div>
                {/* Content */}
                <div className="flex flex-col gap-2">
                    <table>
                        <tr>
                            <td className="w-1/8 p-2">
                                <div>
                                    <Calendar className="mr-2 inline text-gray-500" size={20} />
                                    <span>Tanggal Awal</span>
                                </div>
                            </td>
                            <td className="p-2">
                                <Input
                                    type="date"
                                    className="w-full"
                                    value={tanggalAwal}
                                    onChange={(e) => setTanggalAwal(e.target.value)}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="w-1/8 p-2">
                                <div>
                                    <Calendar className="mr-2 inline text-gray-500" size={20} />
                                    <span>Tanggal Akhir</span>
                                </div>
                            </td>
                            <td className="p-2">
                                <Input
                                    type="date"
                                    className="w-full"
                                    value={tanggalAkhir}
                                    onChange={(e) => setTanggalAkhir(e.target.value)}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="w-1/8 p-2">
                                <div>
                                    <PlusCircle className="mr-2 inline text-gray-500" size={20} />
                                    <span>Jenis Kunjungan</span>
                                </div>
                            </td>
                            <td className="p-2">
                                <SearchableDropdown
                                    data={[
                                        { ID: '1', DESKRIPSI: "Rawat Inap" },
                                        { ID: '2', DESKRIPSI: "Rawat Jalan" },
                                        { ID: '3', DESKRIPSI: "Rawat Inap dan Rawat Jalan" },
                                    ]}
                                    value={jenisKunjungan}
                                    setValue={setJenisKunjungan}
                                    getOptionLabel={(item) => item?.DESKRIPSI}
                                    getOptionValue={(item) => item?.ID}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="w-1/8 p-2">
                                <div>
                                    <PlusCircle className="mr-2 inline text-gray-500" size={20} />
                                    <span>Jenis Tanggal</span>
                                </div>
                            </td>
                            <td className="p-2">
                                <SearchableDropdown
                                    data={[
                                        { ID: '1', DESKRIPSI: "Tanggal Pulang" },
                                        { ID: '2', DESKRIPSI: "Tanggal Grouping" },
                                    ]}
                                    value={jenisTanggal}
                                    setValue={setJenisTanggal}
                                    getOptionLabel={(item) => item?.DESKRIPSI}
                                    getOptionValue={(item) => item?.ID}
                                />
                            </td>
                        </tr>
                    </table>

                    <div className="flex items-center justify-end gap-2 p-2">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 bg-red-400 hover:bg-red-500 text-white"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="inline" size={16} /> Batal
                        </Button>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 bg-emerald-400 hover:bg-emerald-500 text-white"
                            onClick={ async () => {
                                await router.post(route('eklaim.klaim.kirimDataKolektifHari'), {
                                    tanggal_awal: tanggalAwal,
                                    tanggal_akhir: tanggalAkhir,
                                    jenis_rawat: jenisKunjungan,
                                    date_type: jenisTanggal,
                                }, {
                                    onStart: () => {
                                        toast.loading("Mengirim data klaim...")
                                        setLoadingKirim(true);
                                    },
                                    onFinish: () => setLoadingKirim(false),
                                })
                            }}
                            disabled={loadingKirim}
                        >
                            {loadingKirim ? (
                                <span className="animate-spin">
                                    <Loader className="inline" size={16} />
                                </span>
                            ) : (
                                <Send className="inline" size={16} />
                            )}
                            Kirim Klaim
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}