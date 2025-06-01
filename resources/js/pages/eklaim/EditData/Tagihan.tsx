import AppLayout from "@/layouts/app-layout";
import { Head, usePage } from "@inertiajs/react";
import { Home } from "lucide-react";

export default function EditTagihan() {
    const dataKlaim = usePage().props.pengajuanKlaim;
    console.log("Data Klaim:", dataKlaim);
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
            title: 'Edit Data Tagihan',
            href: '#',
        }
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Tagihan" />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Edit Tagihan</h1>
                {/* Konten untuk mengedit tagihan akan ditambahkan di sini */}
            </div>
        </AppLayout>
    )
}
