import { Button } from "@/components/ui/button";

export default function ModalDaftarPasien({ open, onClose, pasien }) {
    if (!open) return null;

    console.log("ModalDaftarPasien pasien", pasien);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-bold mb-4">Pendaftaran Pasien</h2>
                {/* Tampilkan data pasien */}
                <div className="mb-4">
                    <div><b>NORM:</b> {pasien?.NORM}</div>
                    <div><b>Nama:</b> {pasien?.NAMA}</div>
                    <div><b>Tanggal Lahir:</b> {pasien?.TANGGAL_LAHIR}</div>
                    {/* Tambahkan field lain sesuai kebutuhan */}
                </div>
                {/* Form atau aksi pendaftaran di sini */}
                <div className="flex justify-end mt-6">
                    <Button
                        variant="outline"
                        className="mr-2"
                        onClick={onClose}
                    >
                        Batal
                    </Button>
                    <Button
                        className="bg-green-600 text-white hover:bg-green-700"
                        // onClick={...}
                    >
                        Simpan
                    </Button>
                </div>
            </div>
        </div>
    );
}
