import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { Toaster } from '@/components/ui/sonner';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children, breadcrumbs = [], pasien }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[], pasien?: any }>) {
    return (
        <>
            <Toaster position="top-right" richColors />
            <AppShell variant="sidebar">
                <AppSidebar />
                <AppContent variant="sidebar">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} pasien={pasien} />
                    {children}
                </AppContent>
            </AppShell>
        </>
    );
}
