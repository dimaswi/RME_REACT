import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { Loader, Pencil, Printer, Send, Trash } from 'lucide-react';
import React from 'react';
import GroupingOneCollapse from './collapseGroupingOne';
import { cetakBerkasKlaim } from '@/PDF/BerkasKlaim';
import { set } from 'date-fns';
import { toast } from 'sonner';

export default function SudahTerkirimCollapse({ pengajuanKlaim }: { pengajuanKlaim: any }) {
    const [loadingEditUlang, setLoadingEditUlang] = React.useState(false);
    const [loadingHapus, setLoadingHapus] = React.useState(false);
    const [loadingCetak, setLoadingCetak] = React.useState(false);
    const [loadingKirim, setLoadingKirim] = React.useState(false);

    return (
        <>
            <GroupingOneCollapse pengajuanKlaim={pengajuanKlaim} />

            <div className="mb-4 flex justify-end gap-2">
                {loadingEditUlang ? (
                    <Button variant="outline" disabled>
                        <Loader className="mr-2 h-4 w-4 animate-spin text-blue-500" />
                        Mengedit Ulang...
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        onClick={async () => {
                            await router.post(
                                route('eklaim.klaim.editUlangKlaim', { pengajuanKlaim: pengajuanKlaim.id }),
                                {},
                                {
                                    preserveState: true,
                                    preserveScroll: true,
                                    onStart: () => {
                                        setLoadingEditUlang(true);
                                    },
                                    onFinish: () => {
                                        setLoadingEditUlang(false);
                                    },
                                    onError: () => {
                                        setLoadingEditUlang(false);
                                    },
                                    onSuccess: () => {
                                        setLoadingEditUlang(false);
                                    },
                                },
                            );
                        }}
                    >
                        <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                        Edit Ulang
                    </Button>
                )}

                {loadingCetak ? (
                    <Button variant="outline" disabled>
                        <Loader className="mr-2 h-4 w-4 animate-spin text-green-500" />
                        Mencetak...
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        onClick={async () => {
                            setLoadingCetak(true);
                            try {
                                await cetakBerkasKlaim(pengajuanKlaim.nomor_SEP, "preview");
                            } catch (error) {
                                console.error("Error fetching PDF:", error);
                                toast.error("Gagal mengambil PDF");
                            } finally {
                                setLoadingCetak(false);
                            }
                        }}
                    >
                        <Printer className="mr-2 h-4 w-4 text-green-500" />
                        Cetak
                    </Button>
                )}
            </div>
        </>
    );
}
