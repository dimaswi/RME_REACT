import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { Check, Loader } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

export default function CollapseBelumDiajukan({ pengajuanKlaim }: { pengajuanKlaim: any }) {
    const [loadingPengajuan, setLoadingPengajuan] = React.useState(false);

    return (
        <div className="flex justify-end gap-2">
            {loadingPengajuan ? (
                <Button variant="outline" disabled>
                    <Loader className="mr-2 h-4 w-4 animate-spin text-green-500" />
                    Proses Pengajuan...
                </Button>
            ) : (
                <Button
                    variant="outline"
                    onClick={async () => {
                        await router.post(
                            route('eklaim.klaim.pengajuanUlang', { pengajuanKlaim: pengajuanKlaim.id }),
                            {
                                pengajuanKlaim,
                            },
                            {
                                preserveState: true,
                                preserveScroll: true,
                                onStart: () => {
                                    setLoadingPengajuan(true);
                                },
                                onFinish: () => {
                                    setLoadingPengajuan(false);
                                },
                                onError: () => {
                                    setLoadingPengajuan(false);
                                },
                                onSuccess: () => {
                                    setLoadingPengajuan(false);
                                },
                            },
                        );
                    }}
                >
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Buat Pengajuan
                </Button>
            )}
        </div>
    );
}
