import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner'; // atau react-hot-toast

interface AppLayoutProps {
    children: ReactNode;
    pasien?: any;
    ruangan?: any;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, pasien, ruangan, ...props }: AppLayoutProps) => {
    const { success, error } = usePage().props;

    useEffect(() => {
        if (success) toast.success(success);
        if (error) toast.error(error);
    }, [success, error]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} pasien={pasien} ruangan={ruangan} {...props}>
            {children}
        </AppLayoutTemplate>
    );
};
