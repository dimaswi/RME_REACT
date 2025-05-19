import { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bed } from "lucide-react";

export default function ModalBookingBed({ open, onClose, selectedRuangan9, onSelectBed }) {
    const [data, setData] = useState<any[]>([]);
    const [selectedRuangan, setSelectedRuangan] = useState<string>(""); // akan di-set dari selectedRuangan9
    const [selectedBed, setSelectedBed] = useState<any>(null);

    useEffect(() => {
        if (open) {
            fetch("/master/bed-list")
                .then(res => res.json())
                .then((result) => {
                    setData(result);
                    // Otomatis set selectedRuangan dari selectedRuangan9 jika ada di data
                    if (selectedRuangan9 && result.some(kamar => String(kamar.ruangan) === String(selectedRuangan9))) {
                        setSelectedRuangan(selectedRuangan9);
                    } else if (result.length > 0) {
                        setSelectedRuangan(result[0].ruangan);
                    }
                });
            setSelectedBed(null);
        }
    }, [open, selectedRuangan9]);

    // Ambil semua ruangan unik dari data, label pakai nama_ruangan
    const ruanganOptions = Array.from(
        new Map(data.map(kamar => [kamar.ruangan, kamar])).values()
    ).map(kamar => ({
        value: kamar.ruangan,
        label: kamar.nama_ruangan || kamar.ruangan,
    }));

    // Filter kamar berdasarkan selectedRuangan
    const kamarDalamRuangan = data.filter(kamar => String(kamar.ruangan) === String(selectedRuangan));

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent
                side="bottom"
                className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white w-screen h-screen max-w-none p-0 overflow-auto"
                style={{ maxWidth: "100vw", maxHeight: "100vh" }}
            >
                <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="w-full max-w-5xl mx-auto">
                        <h2 className="text-xl font-bold mb-4 text-center">Booking Tempat Tidur</h2>
                        {!selectedBed ? (
                            <>
                                {ruanganOptions.length > 0 && (
                                    <div className="mb-4">
                                        <label className="block mb-1 font-semibold">Pilih Ruangan</label>
                                        <select
                                            className="border rounded px-3 py-2 w-full"
                                            value={selectedRuangan}
                                            onChange={e => setSelectedRuangan(e.target.value)}
                                        >
                                            {ruanganOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {kamarDalamRuangan.length > 0 ? (
                                    <div className="mb-6 w-full">
                                        {/* Nama kamar horizontal */}
                                        <div className="flex flex-row gap-6 justify-center mb-2">
                                            {kamarDalamRuangan.map(kamar => (
                                                <div key={kamar.id} className="min-w-[120px] text-center font-semibold">
                                                    {kamar.nama_kamar}
                                                </div>
                                            ))}
                                        </div>
                                        {/* Bed per kamar vertical */}
                                        <div className="flex flex-row gap-6 justify-center">
                                            {kamarDalamRuangan.map(kamar => (
                                                <div key={kamar.id} className="flex flex-col items-center min-w-[120px]">
                                                    {kamar.beds.map(bed => (
                                                        <div
                                                            key={bed.id}
                                                            className={`w-16 h-16 mb-2 flex flex-col items-center justify-center border rounded cursor-pointer text-lg font-bold
                                                                ${bed.status == 1 ? "bg-white text-black border-gray-400" : bed.status == 3 ? "bg-red-500 text-white border-red-500" : "bg-gray-200"}
                                                            `}
                                                            onClick={() => {
                                                                setSelectedBed({ ...bed, kamar: kamar.nama_kamar });
                                                            }}
                                                            title={`Bed ${bed.nama} (${bed.status == 1 ? "Kosong" : bed.status == 3 ? "Terisi" : "Tidak diketahui"})`}
                                                        >
                                                            <Bed className="w-8 h-8 mb-1" />
                                                            <span>{bed.nama}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-6 text-gray-500">Tidak ada data tempat tidur.</div>
                                )}
                            </>
                        ) : (
                            // Informasi detail bed
                            <div className="flex flex-col items-center justify-center h-full w-full">
                                <h3 className="text-lg font-bold mb-2">
                                    Bed {selectedBed.nama} - {selectedBed.kamar}
                                </h3>
                                <div className="mb-4">
                                    Status:{" "}
                                    <span className={
                                        selectedBed.status == 3
                                            ? "text-red-600"
                                            : selectedBed.status == 1
                                            ? "text-green-600"
                                            : "text-gray-600"
                                    }>
                                        {selectedBed.status == 3
                                            ? "Terisi"
                                            : selectedBed.status == 1
                                            ? "Kosong"
                                            : "Tidak diketahui"}
                                    </span>
                                </div>
                                {/* Tambahkan info lain jika ada, misal ID bed */}
                                <div className="mb-2 text-gray-600">ID Bed: {selectedBed.id}</div>
                                <Button variant="outline" className="mt-4" onClick={() => setSelectedBed(null)}>
                                    Kembali
                                </Button>
                                {selectedBed.status == 1 ? (
                                    <Button className="bg-green-600 text-white hover:bg-green-700 mt-2" onClick={() => {
                                        if (onSelectBed) {
                                            onSelectBed(selectedBed);
                                            onClose();
                                        }
                                    }}>
                                        Booking Tempat Tidur
                                    </Button>
                                ) : (
                                    <Button disabled className="bg-gray-400 text-white mt-2">
                                        Sudah Terisi
                                    </Button>
                                )}
                            </div>
                        )}
                        <Button variant="outline" className="mt-4" onClick={onClose}>
                            Tutup
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
