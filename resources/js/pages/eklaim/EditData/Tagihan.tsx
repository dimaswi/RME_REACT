import AppLayout from "@/layouts/app-layout";
import { Head, usePage, useForm } from "@inertiajs/react";
import { Home, Trash2, Plus, X, Save, DockIcon, Loader, LoaderPinwheel, Loader2 } from "lucide-react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from 'axios';

export default function EditTagihan() {
    const { pengajuanKlaim: dataKlaim, rincian } = usePage().props as any;
    // Gunakan useState untuk mengelola data yang bisa diubah
    const [tagihan, setTagihan] = useState(
        (rincian || []).map((item: any, index: number) => ({
            ...item,
            jenis: Number(item.jenis ?? item.JENIS ?? 0), // pastikan selalu angka dan key 'jenis'
            tempId: item.ID || `temp-${index}`
        }))
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
            title: dataKlaim?.nomor_SEP || '',
            href: route('eklaim.klaim.dataKlaim', { dataKlaim: dataKlaim?.id }),
        },
        {
            title: 'Edit Data Tagihan',
            href: '#',
        }
    ];

    const [newItem, setNewItem] = useState({
        jenis: 1,
        jumlah: 1,
        id_tarif: 0,
        ref: "",
    });

    const getDetailByJenis = (item: any) => {
        console.log(item.jenis)
        switch (item.jenis) {
            case 1: return item.tarif_administrasi;
            case 2: return item.tarif_ruang_rawat;
            case 3: return item.tarif_tindakan;
            case 4: return item.harga_barang;
            case 5: return item.paket;
            case 6: return item.tarif_oksigen;
            default: return null;
        }
    };

    const getItemName = (item: any) => {
        const detail = getDetailByJenis(item);
        if (!detail) return item.NAMA_ITEM || "Tidak diketahui";

        switch (item.JENIS) {
            case 1: return detail?.ruangan.DESKRIPSI || "Administrasi";
            case 2: return detail ? `Ruang Perawatan Rawat Inap (${detail.ruangan_kelas.DESKRIPSI})` : "Ruang Rawat";
            case 3: return detail?.tindakan.NAMA || "Tindakan";
            case 4: return detail?.obat.NAMA || "Barang";
            case 5: return detail?.NAMA || "Paket";
            case 6: return detail?.DESKRIPSI || "Oksigen";
            default: return "Item lain";
        }
    };

    const getJenisLabel = (jenis: number) => {
        switch (jenis) {
            case 1: return { text: "Administrasi", color: "bg-blue-100 text-blue-800" };
            case 2: return { text: "Ruang Rawat", color: "bg-green-100 text-green-800" };
            case 3: return { text: "Tindakan", color: "bg-purple-100 text-purple-800" };
            case 4: return { text: "Barang", color: "bg-orange-100 text-orange-800" };
            case 5: return { text: "Paket", color: "bg-yellow-100 text-yellow-800" };
            case 6: return { text: "Oksigen", color: "bg-cyan-100 text-cyan-800" };
            default: return { text: "Lainnya", color: "bg-gray-100 text-gray-800" };
        }
    };

    // Total tagihan
    const totalTagihan = tagihan.reduce((total: number, item: any) =>
        total + (Number(item.jumlah) * Number(item.tarif)), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Tagihan" />
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <Button
                            onClick={
                                async () => {
                                    await axios.get(route('eklaim.syncTagihan', { pengajuanKlaim: dataKlaim?.id }))
                                    console.log("Sinkronisasi data...");
                                }
                            }
                            className="bg-yellow-500 text-white hover:bg-yellow-600 h-10"
                        >
                            <Loader className="w-4 h-4 mr-2" />
                            Sinkronasi
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <Table>
                            <TableCaption>
                                Total Tagihan: {formatRupiah(totalTagihan)}
                            </TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">No</TableHead>
                                    <TableHead>Jenis</TableHead>
                                    <TableHead>Nama Item</TableHead>
                                    <TableHead>Jumlah</TableHead>
                                    <TableHead className="text-right">Harga</TableHead>
                                    <TableHead className="text-right">Subtotal</TableHead>
                                    <TableHead className="w-[80px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tagihan.length > 0 ? (
                                    tagihan.map((item: any, index: number) => {
                                        const jenisLabel = getJenisLabel(item.jenis ?? item.JENIS);
                                        // Ambil nama item dari ref, atau dari relasi jika ingin lebih detail
                                        const itemName = item.ref || getItemName(item);

                                        return (
                                            <TableRow
                                                key={item.tempId || `row-${index}`}
                                                className={item.is_new ? "bg-green-50" : ""}
                                            >
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>
                                                    <Badge className={jenisLabel.color}>
                                                        {jenisLabel.text}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">{itemName}</TableCell>
                                                <TableCell>{Number(item.jumlah) || 1}</TableCell>
                                                <TableCell className="text-right">
                                                    {formatRupiah(item.tarif)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatRupiah(Number(item.jumlah) * Number(item.tarif))}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteItem(item.tempId || item.ID)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">
                                            Tidak ada data tagihan
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
