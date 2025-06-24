import AppLayoutTemplate from '@/layouts/app/app-header-layout';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { type ReactNode, useEffect } from 'react';
import { toast, Toaster } from 'sonner';

interface AppLayoutProps {
    children: ReactNode;
    pasien?: any;
    ruangan?: any;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, pasien, ruangan, ...props }: AppLayoutProps) => {
    const { success, error } = usePage().props;

    useEffect(() => {
        if (success) {
            // Event ID berdasarkan waktu sekarang
            const eventId = Date.now().toString();
            toast.success(success, { id: eventId });
        }
        if (error) {
            const eventId = Date.now().toString();
            toast.error(error, { id: eventId });
        }
    }, [success, error]);

    return (
        <>
            <Toaster
                position="top-right"
                richColors
                toastOptions={{
                    // Gunakan 'dismissible' bukan 'enableDismiss'
                    dismissible: true,
                    // Pastikan toast baru tidak ditumpuk di atas yang lama
                    duration: 4000,
                }}
            />
            <AppLayoutTemplate breadcrumbs={breadcrumbs} pasien={pasien} ruangan={ruangan} {...props}>
                {children}
            </AppLayoutTemplate>
        </>
    );
};
