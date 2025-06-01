import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import { Home } from "lucide-react";

export default function EditRadiologi() {
    const dataKlaim = usePage().props.pengajuanKlaim;
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: <Home className="inline mr-1" />,
            href: route('eklaim.klaim.index'),
        },
        {
            title: 'List Pengajuan Klaim',
            href: route('eklaim.klaim.indexPengajuanKlaim'),
        },
        {
            title: dataKlaim.nomor_SEP,
            href: route('eklaim.klaim.dataKlaim', { dataKlaim: dataKlaim.id }),
        },
        {
            title: 'Edit Data Radiologi',
            href: '#',
        }
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Radiologi" />
            <div className="p-4">
                <h1 className="text-2xl font-bold">Edit Radiologi</h1>
                {/* Form untuk mengedit radiologi */}
            </div>
        </AppLayout>
    )
}
