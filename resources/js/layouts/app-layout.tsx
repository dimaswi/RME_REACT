import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
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
            toast.success(success);
            // Reset flash agar toast bisa muncul lagi pada pesan yang sama
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        }
        if (error) {
            toast.error(error);
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        }
    }, [success, error]);

    return (
        <>
            <Toaster position="top-right" richColors />
            <AppLayoutTemplate breadcrumbs={breadcrumbs} pasien={pasien} ruangan={ruangan} {...props}>
                {children}
            </AppLayoutTemplate>
        </>
    );
};
