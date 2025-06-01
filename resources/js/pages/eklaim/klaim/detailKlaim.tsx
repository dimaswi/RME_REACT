import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import "../../../../css/dataKlaim.css";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Home } from "lucide-react";

type DataKlaim = {
    nama_pasien?: string;
    nomor_rm?: string;
    nomor_kartu?: string;
    tgl_masuk?: string;
    tgl_pulang?: string;
    grouper?: any;
    nama_dokter?: string;
    coder_nm?: string;
    tarif_rs?: any;
    // ...tambahkan field lain sesuai kebutuhan
};

export default function KlaimIndex() {
    const { dataKlaim } = usePage<{ dataKlaim: DataKlaim }>().props;
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
            title: dataKlaim?.nomor_sep || "-",
            href: '#'
        }
    ]

    function formatTanggalIndo(tgl?: string) {
        if (!tgl) return "-";
        const [tanggal, bulan, tahun] = tgl.split("/");
        if (!tanggal || !bulan || !tahun) return tgl;
        const bulanIndo = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        return `${parseInt(tanggal)} ${bulanIndo[parseInt(bulan, 10) - 1]} ${tahun}`;
    }

    function formatCurrency(amount?: number): string {
        if (typeof amount !== "number" || isNaN(amount)) return "Rp. 0";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    }

    // Helper untuk akses nested object dengan fallback
    const get = (obj: any, path: string[], fallback: any = "-") => {
        return path.reduce((acc, key) => (acc && acc[key] != null ? acc[key] : undefined), obj) ?? fallback;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Klaim" />
            <div className="p-4">
                <div className="mb-4">
                    <table className="w-full border border-gray-300 rounded-lg table-fixed">
                        {/* Detail Pasien */}
                        <tr className="hover:bg-gray-100 bg-gray-50">
                            <td colSpan={8} className="border-b border-l border-r border-gray-300 px-4 py-2 font-bold">
                                <center>
                                    Identitas Pasien
                                </center>
                            </td>
                        </tr>

                        <tr>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                Nama pasien
                            </td>
                            <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {dataKlaim?.nama_pasien || "-"}
                            </td>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                RM
                            </td>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {dataKlaim?.nomor_rm || "-"}
                            </td>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                Nomor Kartu
                            </td>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {dataKlaim?.nomor_kartu || "-"}
                            </td>
                        </tr>

                        {/* Detail Pasien */}
                        <tr className="hover:bg-gray-100 bg-gray-50">
                            <td colSpan={8} className="border-b border-l border-r border-gray-300 px-4 py-2 font-bold">
                                <center>
                                    Detail Pasien
                                </center>
                            </td>
                        </tr>

                        <tr>
                            <td colSpan={2} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                Tanggal Masuk
                            </td>
                            <td colSpan={2} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {formatTanggalIndo(dataKlaim?.tgl_masuk)}
                            </td>
                            <td colSpan={2} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                Tanggal Pulang
                            </td>
                            <td colSpan={2} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {formatTanggalIndo(dataKlaim?.tgl_pulang)}
                            </td>
                        </tr>

                        <tr>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                Kode CBG
                            </td>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {get(dataKlaim, ["grouper", "response", "cbg", "code"])}
                            </td>
                            <td colSpan={4} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {get(dataKlaim, ["grouper", "response", "cbg", "description"])}
                            </td>
                            <td colSpan={2} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {formatCurrency(get(dataKlaim, ["grouper", "response", "cbg", "tariff"], 0))}
                            </td>
                        </tr>

                        <tr>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                Dokter
                            </td>
                            <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {dataKlaim?.nama_dokter || "-"}
                            </td>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                Petugas
                            </td>
                            <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {dataKlaim?.coder_nm || "-"}
                            </td>
                        </tr>

                        {/* Tarif Rumah Sakit */}
                        <tr className="hover:bg-gray-100 bg-gray-50">
                            <td colSpan={8} className="border-b border-l border-r border-gray-300 px-4 py-2 font-bold">
                                <center>
                                    Tarif Rumah Sakit
                                </center>
                            </td>
                        </tr>

                        <tr>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                Alkes
                            </td>
                            <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {formatCurrency(dataKlaim?.tarif_rs?.alkes)}
                            </td>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                BMHP
                            </td>
                            <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {formatCurrency(dataKlaim?.tarif_rs?.bmhp)}
                            </td>
                        </tr>

                        <tr>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                Kamar
                            </td>
                            <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {formatCurrency(dataKlaim?.tarif_rs?.kamar)}
                            </td>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                Keperawatan
                            </td>
                            <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {formatCurrency(dataKlaim?.tarif_rs?.keperawatan)}
                            </td>
                        </tr>

                        <tr>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                Konsultasi
                            </td>
                            <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {formatCurrency(dataKlaim?.tarif_rs?.konsultasi)}
                            </td>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                Laboratorium
                            </td>
                            <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {formatCurrency(dataKlaim?.tarif_rs?.laboratorium)}
                            </td>
                        </tr>

                        <tr>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                Obat
                            </td>
                            <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {formatCurrency(dataKlaim?.tarif_rs?.obat)}
                            </td>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                Obt. Kemoterapi
                            </td>
                            <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {formatCurrency(dataKlaim?.tarif_rs?.obat_kemoterapi)}
                            </td>
                        </tr>

                        <tr>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                Obat Kronis
                            </td>
                            <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {formatCurrency(dataKlaim?.tarif_rs?.obat_kronis)}
                            </td>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                Pelayanan Darah
                            </td>
                            <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {formatCurrency(dataKlaim?.tarif_rs?.pelayanan_darah)}
                            </td>
                        </tr>

                        <tr>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                Penunjang
                            </td>
                            <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {formatCurrency(dataKlaim?.tarif_rs?.penunjang)}
                            </td>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                Prosedur Bedah
                            </td>
                            <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {formatCurrency(dataKlaim?.tarif_rs?.prosedur_bedah)}
                            </td>
                        </tr>

                        <tr>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                Prosedur Non Bedah
                            </td>
                            <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {formatCurrency(dataKlaim?.tarif_rs?.prosedur_non_bedah)}
                            </td>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                Radiologi
                            </td>
                            <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {formatCurrency(dataKlaim?.tarif_rs?.radiologi)}
                            </td>
                        </tr>

                        <tr>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                Rawat Intensif
                            </td>
                            <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {formatCurrency(dataKlaim?.tarif_rs?.rawat_intensif)}
                            </td>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                Rehabilitasi
                            </td>
                            <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {formatCurrency(dataKlaim?.tarif_rs?.rehabilitasi)}
                            </td>
                        </tr>

                        <tr>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                Sewa Alat
                            </td>
                            <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {formatCurrency(dataKlaim?.tarif_rs?.sewa_alat)}
                            </td>
                            <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                Tenaga Ahli
                            </td>
                            <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                {formatCurrency(dataKlaim?.tarif_rs?.tenaga_ahli)}
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </AppLayout>
    )
}
