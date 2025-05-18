import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetTrigger,
} from "@/components/ui/sheet";
import SearchableDropdown from "./SearchableDropdown";

export default function ModalDaftarPasien({ open, onClose, pasien, trigger, ruangan }) {
    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetTrigger asChild>
                {trigger || <Button>Daftar Pasien</Button>}
            </SheetTrigger>
            <SheetContent style={{ maxWidth: '50vw' }}>
                <SheetHeader>
                    <SheetTitle>Pendaftaran Pasien</SheetTitle>
                    <SheetDescription>
                        Silakan cek data pasien sebelum melanjutkan pendaftaran.
                    </SheetDescription>
                </SheetHeader>
                <div className="mx-6">
                    <SearchableDropdown
                    data={ruangan}
                    placeholder={"Masukan Nama Ruangan"} />
                </div>
                <SheetFooter className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={onClose}>
                        Batal
                    </Button>
                    <Button className="bg-green-600 text-white hover:bg-green-700">
                        Simpan
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
