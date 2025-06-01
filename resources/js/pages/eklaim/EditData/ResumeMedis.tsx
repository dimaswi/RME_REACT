import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import { Home } from "lucide-react";

export default function EditResumeMedis() {
    const dataKlaim = usePage().props.pengajuanKlaim;
    const imageBase64 = usePage().props.imageBase64;

    // Ambil kunjungan_pasien dari penjamin, handle jika array/object/undefined
    const kunjunganPasienArr = Array.isArray(dataKlaim?.penjamin?.kunjungan_pasien)
        ? dataKlaim.penjamin.kunjungan_pasien
        : dataKlaim?.penjamin?.kunjungan_pasien
            ? [dataKlaim.penjamin.kunjungan_pasien]
            : [];

    // Filter berdasarkan JENIS_KUNJUNGAN = 1, 3, 17 dan handle jika ruangan kosong
    const filteredKunjungan = kunjunganPasienArr.filter(
        (k: any) =>
            k?.ruangan &&
            [1, 3, 17].includes(Number(k.ruangan.JENIS_KUNJUNGAN))
    );

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
            title: 'Edit Data Resume Medis',
            href: '#',
        }
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Resume Medis" />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Edit Resume Medis</h1>
                <div>
                    <h2 className="font-semibold mb-2">Kunjungan Pasien (JENIS_KUNJUNGAN 1, 3, 17):</h2>
                    {filteredKunjungan.length === 0 ? (
                        <div className="text-gray-500">Tidak ada data kunjungan dengan JENIS_KUNJUNGAN 1, 3, atau 17.</div>
                    ) : (
                        <ul className="list-disc pl-5">
                            {filteredKunjungan.map((k: any, idx: number) => (
                                <>
                                    <table className="w-full border-collapse border">
                                        <tr>
                                            <td colSpan={2}>
                                                <img src={imageBase64} alt="Logo Klinik"/>
                                            </td>
                                            <td colSpan={6}>
                                                <div>
                                                    <h3>KLINIK RAWAT INAP UTAMA MUHAMMADIYAH
                                                        KEDUNGADEM</h3>
                                                    <p>
                                                        Jl. PUK Desa Drokilo. Kec. Kedungadem Kab. Bojonegoro <br />
                                                        Email : klinik.muh.kedungadem@gmail.com | WA : 082242244646 <br />
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={8}>
                                                <h3>RINGKASAN PULANG</h3>
                                            </td>
                                                </tr>
                                            </table>
                                        </>
                            ))}
                                    </ul>
                    )}
                                </div >
            </div>
        </AppLayout>
                )
}
