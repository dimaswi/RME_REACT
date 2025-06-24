import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatRupiah } from '@/lib/utils';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Home, Loader, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function EditTagihan() {
    const { pengajuanKlaim: dataKlaim, rincian } = usePage().props as any;
    const [tagihan, setTagihan] = useState(rincian || []);

    const fetchTagihan = async () => {
        try {
            const response = await axios.get(route('eklaim.editData.tagihan', { pengajuanKlaim: dataKlaim?.id }));
        } catch (error) {
            console.error('Error fetching tagihan:', error);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: <Home className="mr-1 inline" />,
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
        },
    ];

    const [newItem, setNewItem] = useState({
        jenis: 1,
        jumlah: 1,
        id_tarif: 0,
        ref: '',
    });

    const getDetailByJenis = (item: any) => {
        switch (item.jenis) {
            case 1:
                return item.tarif_administrasi;
            case 2:
                return item.tarif_ruang_rawat;
            case 3:
                return item.tarif_tindakan;
            case 4:
                return item.harga_barang;
            case 5:
                return item.paket;
            case 6:
                return item.tarif_oksigen;
            default:
                return null;
        }
    };

    const getItemName = (item: any) => {
        const detail = getDetailByJenis(item);
        if (!detail) return item.NAMA_ITEM || 'Tidak diketahui';

        switch (item.JENIS) {
            case 1:
                return detail?.ruangan.DESKRIPSI || 'Administrasi';
            case 2:
                return detail ? `Ruang Perawatan Rawat Inap (${detail.ruangan_kelas.DESKRIPSI})` : 'Ruang Rawat';
            case 3:
                return detail?.tindakan.NAMA || 'Tindakan';
            case 4:
                return detail?.obat.NAMA || 'Barang';
            case 5:
                return detail?.NAMA || 'Paket';
            case 6:
                return detail?.DESKRIPSI || 'Oksigen';
            default:
                return 'Item lain';
        }
    };

    const getJenisLabel = (jenis: number) => {
        switch (jenis) {
            case 1:
                return { text: 'Administrasi', color: 'bg-blue-100 text-blue-800' };
            case 2:
                return { text: 'Ruang Rawat', color: 'bg-green-100 text-green-800' };
            case 3:
                return { text: 'Tindakan', color: 'bg-purple-100 text-purple-800' };
            case 4:
                return { text: 'Barang', color: 'bg-orange-100 text-orange-800' };
            case 5:
                return { text: 'Paket', color: 'bg-yellow-100 text-yellow-800' };
            case 6:
                return { text: 'Oksigen', color: 'bg-cyan-100 text-cyan-800' };
            default:
                return { text: 'Lainnya', color: 'bg-gray-100 text-gray-800' };
        }
    };

    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    // Total tagihan
    const totalTagihan = tagihan.reduce((total: number, item: any) => total + Number(item.jumlah) * Number(item.tarif), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Tagihan" />
            <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {loading == false ? (
                            <Button
                                onClick={async () => {
                                    try {
                                        setLoading(true);
                                        router.visit(route('eklaim.syncTagihan', { pengajuanKlaim: dataKlaim?.id }), {
                                            method: 'get',
                                            only: ['rincian', 'error', 'success'], // hanya refresh prop rincian
                                            preserveScroll: true,
                                        });
                                    } catch (error) {
                                        console.error(error);
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="h-10 bg-yellow-500 text-white hover:bg-yellow-600"
                            >
                                <Loader className="mr-2 h-4 w-4" />
                                Sinkronasi
                            </Button>
                        ) : (
                            <Button className="h-10 bg-yellow-500 text-white hover:bg-yellow-600">
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                Sinkronasi
                            </Button>
                        )}
                    </div>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <Table>
                            <TableCaption>Total Tagihan: {formatRupiah(totalTagihan)}</TableCaption>
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
                                        const jenisLabel = getJenisLabel(Number(item.jenis));
                                        // Ambil nama item dari ref, atau dari relasi jika ingin lebih detail
                                        return (
                                            <TableRow key={`row-${index}`}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>
                                                    <Badge className={jenisLabel.color}>{jenisLabel.text}</Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {item.jenis === '1' && <>Tarif Admisi {item.tarif_administrasi?.ruangan?.DESKRIPSI ?? ''}</>}
                                                    {item.jenis === '2' && (
                                                        <>Tarif Ruang Perawatan {item.tarif_ruang_rawat?.ruangan_kelas?.DESKRIPSI ?? ''}</>
                                                    )}
                                                    {item.jenis === '3' && <>Tarif Tindakan {item.tarif_tindakan?.tindakan?.NAMA ?? ''}</>}
                                                    {item.jenis === '4' && <>Tarif Obat {item.harga_barang?.obat?.NAMA ?? ''}</>}
                                                    {item.jenis === '5' && <>Tarif Paket Pengobatan</>}
                                                    {item.jenis === '6' && <>Tarif Oksigen</>}
                                                    {['1', '2', '3', '4', '5', '6'].indexOf(item.jenis) === -1 && <>-</>}

                                                    {item.edit === '1' ? (
                                                        <Badge className="ml-2 bg-amber-400">Rekondisi</Badge>
                                                    ) : (
                                                        <Badge className="ml-2 bg-green-400">Real</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>{Number(item.jumlah) || 1}</TableCell>
                                                <TableCell className="text-right">{formatRupiah(item.tarif)}</TableCell>
                                                <TableCell className="text-right">{formatRupiah(Number(item.jumlah) * Number(item.tarif))}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={loading}
                                                        onClick={() => {
                                                            try {
                                                                setSelectedId(item.id);
                                                                setShowConfirm(true);
                                                            } catch (error) {
                                                                console.error(error);
                                                            } finally {
                                                                setLoading(false);
                                                            }
                                                        }}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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
                <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Konfirmasi Hapus</DialogTitle>
                            <DialogDescription>Yakin ingin menghapus tagihan ini? Tindakan ini tidak dapat dibatalkan.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={loading}>
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={loading}
                                onClick={async () => {
                                    setLoading(true);
                                    try {
                                        router.visit(route('eklaim.deleteRincianTagihan', { rincianTagihan: selectedId }), {
                                            method: 'get', // atau 'delete' jika route Anda pakai method delete
                                            only: ['rincian', 'error', 'success'], // agar hanya prop rincian yang di-refresh
                                            preserveScroll: true,
                                        });
                                        setShowConfirm(false);
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                            >
                                {loading ? <Loader className="h-4 w-4 animate-spin" /> : 'Hapus'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                ;
            </div>
        </AppLayout>
    );
}
