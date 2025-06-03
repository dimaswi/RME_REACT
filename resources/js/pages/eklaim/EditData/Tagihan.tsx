import AppLayout from "@/layouts/app-layout";
import { Head, usePage, useForm } from "@inertiajs/react";
import { Home, Trash2, Plus, X, Save, DockIcon } from "lucide-react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CustomModal, CustomModalHeader, CustomModalContent, CustomModalFooter } from "@/components/customModal";

export default function EditTagihan() {
    const { pengajuanKlaim: dataKlaim, tagihanPendaftaran } = usePage().props as any;
    // Gunakan useState untuk mengelola data yang bisa diubah
    const [tagihan, setTagihan] = useState(
        (tagihanPendaftaran?.tagihan?.rincian_tagihan || []).map((item: any, index: number) => ({
            ...item,
            tempId: item.ID || `temp-${index}` // Gunakan ID asli atau buat tempId
        }))
    );
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    // Form untuk data baru
    const [newItem, setNewItem] = useState({
        JENIS: 1,
        JUMLAH: 1,
        TARIF: 0,
        ID_REFERENSI: "",
        NAMA_ITEM: ""
    });

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

    // Helper functions (yang sudah ada)
    const getDetailByJenis = (item: any) => {
        switch (item.JENIS) {
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

    // Fungsi untuk menghapus item
    const handleDeleteItem = (tempId: string | number) => {
        // Debug untuk membantu troubleshooting
        console.log("Menghapus item dengan ID:", tempId);
        console.log("Current tagihan:", tagihan);

        setTagihan(prevTagihan =>
            prevTagihan.filter((item: any) =>
                item.tempId !== tempId && String(item.ID) !== String(tempId)
            )
        );

        toast.success("Item berhasil dihapus");
    };

    // Fungsi untuk menambah item baru
    const handleAddItem = () => {
        if (!newItem.NAMA_ITEM) {
            toast.error("Nama item harus diisi");
            return;
        }

        if (newItem.TARIF <= 0) {
            toast.error("Tarif harus lebih dari 0");
            return;
        }

        // Buat ID sementara untuk item baru (negatif untuk membedakan dari ID asli di database)
        const tempId = -Math.floor(Math.random() * 10000);

        setTagihan([...tagihan, {
            ID: tempId,
            JENIS: Number(newItem.JENIS),
            JUMLAH: Number(newItem.JUMLAH),
            TARIF: Number(newItem.TARIF),
            ID_REFERENSI: newItem.ID_REFERENSI,
            NAMA_ITEM: newItem.NAMA_ITEM,
            // Tambahkan field lain yang diperlukan
            is_new: true // Penanda bahwa ini item baru
        }]);

        // Reset form dan tutup dialog
        setNewItem({
            JENIS: 1,
            JUMLAH: 1,
            TARIF: 0,
            ID_REFERENSI: "",
            NAMA_ITEM: ""
        });
        setIsAddDialogOpen(false);
        toast.success("Item berhasil ditambahkan");
    };

    // Form untuk menyimpan semua perubahan
    const { post, processing } = useForm({
        tagihan: [],
        id_tagihan_pendaftaran: tagihanPendaftaran?.ID
    });

    // Fungsi untuk menyimpan perubahan
    const handleSaveChanges = () => {
        console.log("Menyimpan perubahan tagihan:", tagihan);
        post(route('eklaim.storeEditTagihan'), {
            data: {
                tagihan: tagihan,
                id_tagihan_pendaftaran: tagihanPendaftaran?.ID
            },
            onSuccess: () => {
                toast.success("Data tagihan berhasil disimpan");
            }
        });
    };

    // Total tagihan
    const totalTagihan = tagihan.reduce((total: number, item: any) =>
        total + (item.JUMLAH * item.TARIF), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Tagihan" />
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <Button
                            // Hapus variant="outline" agar konsisten dengan tombol lain
                            onClick={() => setIsAddDialogOpen(true)}
                            className="bg-green-500 text-white hover:bg-green-600 h-10"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Tambah Item
                        </Button>
                        <Button
                            onClick={handleSaveChanges}
                            disabled={processing}
                            className="bg-blue-500 text-white hover:bg-blue-600 h-10"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Simpan Perubahan
                        </Button>
                        <Button
                            onClick={() => window.print()}
                            disabled={processing}
                            className="bg-yellow-500 text-white hover:bg-yellow-600 h-10"
                        >
                            <DockIcon className="w-4 h-4 mr-2" />
                            Cetak PDF
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
                                        const jenisLabel = getJenisLabel(item.JENIS);
                                        const itemName = item.NAMA_ITEM || getItemName(item);

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
                                                <TableCell>{Number(item.JUMLAH) || 1}</TableCell>
                                                <TableCell className="text-right">
                                                    {formatRupiah(item.TARIF)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatRupiah(item.JUMLAH * item.TARIF)}
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

            {/* Dialog untuk tambah item */}
            {isAddDialogOpen && (
                <CustomModal isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
                    <CustomModalHeader onClose={() => setIsAddDialogOpen(false)}>
                        Tambah Item Tagihan
                    </CustomModalHeader>
                    <CustomModalContent>
                        <div className="grid gap-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="jenis" className="text-right">Jenis</Label>
                                <Select
                                    value={String(newItem.JENIS)}
                                    onValueChange={(value) => setNewItem({ ...newItem, JENIS: Number(value) })}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Pilih jenis" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Administrasi</SelectItem>
                                        <SelectItem value="2">Ruang Rawat</SelectItem>
                                        <SelectItem value="3">Tindakan</SelectItem>
                                        <SelectItem value="4">Barang</SelectItem>
                                        <SelectItem value="5">Paket</SelectItem>
                                        <SelectItem value="6">Oksigen</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Input fields lainnya... */}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="nama" className="text-right">Nama Item</Label>
                                <Input
                                    id="nama"
                                    value={newItem.NAMA_ITEM}
                                    onChange={(e) => setNewItem({ ...newItem, NAMA_ITEM: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="jumlah" className="text-right">Jumlah</Label>
                                <Input
                                    id="jumlah"
                                    type="number"
                                    min="1"
                                    value={newItem.JUMLAH}
                                    onChange={(e) => setNewItem({ ...newItem, JUMLAH: Number(e.target.value) })}
                                    className="col-span-3"
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="tarif" className="text-right">Tarif</Label>
                                <Input
                                    id="tarif"
                                    type="number"
                                    value={newItem.TARIF}
                                    onChange={(e) => setNewItem({ ...newItem, TARIF: Number(e.target.value) })}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                    </CustomModalContent>
                    <CustomModalFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsAddDialogOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={handleAddItem}
                            className="bg-green-500 text-white hover:bg-green-600"
                        >
                            Tambahkan
                        </Button>
                    </CustomModalFooter>
                </CustomModal>
            )}
        </AppLayout>
    );
}
