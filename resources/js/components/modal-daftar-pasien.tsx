import { useRef, useEffect } from "react";
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

export default function ModalDaftarPasien({ open, onClose, pasien, trigger, children }) {
    // Ref untuk dummy focusable element
    const focusRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                document.querySelectorAll('[aria-hidden="true"]').forEach(el => {
                    el.removeAttribute('aria-hidden');
                });
                // Fokus ke elemen dummy yang bisa difokuskan
                if (focusRef.current) {
                    focusRef.current.focus();
                }
            }, 0);
        }
    }, [open]);

    return (
        <>
            {/* Dummy focusable element */}
            <div tabIndex={-1} ref={focusRef} style={{ position: "fixed", width: 0, height: 0, outline: "none" }} />
            <Sheet open={open} onOpenChange={onClose}>
                <SheetTrigger asChild autoFocus={open}>
                    {/* {trigger || <Button>Daftar Pasien</Button>} */}
                </SheetTrigger>
                <SheetContent className="modal-daftar-pasien" style={{ maxWidth: '100vw' }}>
                    <SheetHeader>
                        <SheetTitle>Pendaftaran Pasien</SheetTitle>
                        <SheetDescription>
                            {pasien?.NAMA} ( {pasien?.NORM} )
                        </SheetDescription>
                    </SheetHeader>
                    <div className="">
                        {children}
                    </div>
                    <SheetFooter className="flex justify-end gap-2 mx-6 ">
                        <Button className="bg-green-600 text-white hover:bg-green-700">
                            Simpan
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}
