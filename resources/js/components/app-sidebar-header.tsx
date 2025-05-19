import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { useEffect, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import ModalDaftarPasien from "@/components/modal-daftar-pasien";
import { Hospital, PencilRuler, Search, Trash } from 'lucide-react';
import SearchableDropdown from './SearchableDropdown';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AppSidebarHeader({ breadcrumbs = [], pasien, ruangan }: { breadcrumbs?: BreadcrumbItemType[], pasien?: any, ruangan?: any[] }) {
    const { filters } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');

    const handleGlobalSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/master/pasiens', { search }, { preserveState: true });
    };

    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2 flex-1">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <form onSubmit={handleGlobalSearch} className="relative w-full max-w-xs ml-auto">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Search className="h-5 w-5" />
                </span>
                <Input
                    placeholder="Cari NORM/Nama pasien..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    autoComplete="off"
                    className="pl-10 pr-10"
                />
                {search && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setSearch('');
                            window.history.back();
                        }}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                        aria-label="Clear search"
                    >
                        ✕
                    </Button>
                )}
            </form>

            {/* Jika url /master/pasien/{RM} dan juga form untuk mendaftarkan pasien */}
            {window.location.pathname.match(/^\/master\/pasiens\/\d+$/) && (
                <div>
                    {pasien?.NORM && (
                        <Button
                            type="button"
                            variant="default"
                            className="bg-yellow-600 text-white hover:bg-yellow-700 mx-4"
                            onClick={() => router.get(route('master.pasien.edit', { pasien: pasien.NORM }))}
                        >
                            <PencilRuler className='h-5 w-5' />
                            Edit
                        </Button>
                    )}
                </div>
            )}

        </header>
    );
}
