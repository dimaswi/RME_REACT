import SearchableDropdown from '@/components/SearchableDropdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatRupiah } from '@/lib/utils';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Home, Loader, PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EditTagihan() {
    const { pengajuanKlaim: dataKlaim, rincian } = usePage().props as any;
    const [tagihan, setTagihan] = useState(rincian || []);
    const tindakan = usePage().props.tindakan || [];

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

    // State untuk modal tambah tindakan
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTindakan, setSearchTindakan] = useState('');
    const [selectedTindakan, setSelectedTindakan] = useState<any>(null);
    const [jumlahTindakan, setJumlahTindakan] = useState(1);

    // State untuk modal tambah obat
    const [showAddObatModal, setShowAddObatModal] = useState(false);
    const [selectedObat, setSelectedObat] = useState<any>(null);
    const [jumlahObat, setJumlahObat] = useState(1);

    const obat = usePage().props.obat || [];
    const listObat = (obat || []).map((o: any) => ({
        ID: o.ID,
        NAMA: o.NAMA,
        KATEGORI: o.KATEGORI,
        SATUAN: o.SATUAN,
        harga_barang: o.harga_barang , // pastikan harga_barang ada di objek obat
        // tambahkan properti lain sesuai kebutuhan
    }));

    // Mapping data tindakan agar sesuai dengan struktur yang Anda lampirkan
    const listTindakan = (tindakan || []).map((t: any) => ({
        ID: t.ID,
        TINDAKAN: t.TINDAKAN,
        KELAS: t.KELAS,
        ADMINISTRASI: t.ADMINISTRASI,
        SARANA: t.SARANA,
        BHP: t.BHP,
        DOKTER_OPERATOR: t.DOKTER_OPERATOR,
        DOKTER_ANASTESI: t.DOKTER_ANASTESI,
        DOKTER_LAINNYA: t.DOKTER_LAINNYA,
        PENATA_ANASTESI: t.PENATA_ANASTESI,
        PARAMEDIS: t.PARAMEDIS,
        NON_MEDIS: t.NON_MEDIS,
        TARIF: t.TARIF,
        TANGGAL: t.TANGGAL,
        TANGGAL_SK: t.TANGGAL_SK,
        NOMOR_SK: t.NOMOR_SK,
        OLEH: t.OLEH,
        STATUS: t.STATUS,
        tindakan: t.tindakan, // sudah nested, pastikan backend mengirim field ini
    }));

    // Filter berdasarkan pencarian
    const filteredTindakan = listTindakan.filter((t: any) => t.tindakan?.NAMA?.toLowerCase().includes(searchTindakan.toLowerCase()));

    useEffect(() => {
        setTagihan(rincian || []);
    }, [rincian]);

    const handleAddTindakan = async () => {
        if (!selectedTindakan) return;

        setLoading(true);
        router.post(
            route('eklaim.editData.storeTagihan'),
            {
                pengajuanKlaim: dataKlaim?.id,
                tagihan: {
                    id: selectedTindakan.ID,
                    jumlah: jumlahTindakan,
                },
            },
            {
                preserveScroll: true,
                only: ['rincian', 'error', 'success'], // agar hanya prop rincian yang di-refresh
                onSuccess: () => {
                    setShowAddModal(false);
                    setSelectedTindakan(null);
                    setJumlahTindakan(1);
                    setSearchTindakan('');
                    toast.success('Tindakan berhasil ditambahkan');
                },
                onError: (error) => {
                    toast.error(error?.message || 'Gagal menambahkan tindakan');
                },
                onFinish: () => setLoading(false),
            },
        );
    };

    const handleAddObat = async () => {
        if (!selectedObat) return;
        setLoading(true);
        router.post(
            route('eklaim.editData.storeTagihanObat'),
            {
                pengajuanKlaim: dataKlaim?.id,
                tagihan: {
                    id: selectedObat.ID,
                    jumlah: jumlahObat,
                },
            },
            {
                preserveScroll: true,
                only: ['rincian', 'error', 'success'],
                onSuccess: () => {
                    setShowAddObatModal(false);
                    setSelectedObat(null);
                    setJumlahObat(1);
                    toast.success('Obat berhasil ditambahkan');
                },
                onError: (error) => {
                    toast.error(error?.message || 'Gagal menambahkan obat');
                },
                onFinish: () => setLoading(false),
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Tagihan" />
            <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {loading == false ? (
                            <Button
                                variant="outline"
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
                            >
                                <Loader className="mr-2 h-4 w-4" />
                                Sinkronasi
                            </Button>
                        ) : (
                            <Button variant="outline" disabled>
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                Sinkronasi
                            </Button>
                        )}

                        <Button variant="outline" onClick={() => setShowAddModal(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Tindakan
                        </Button>

                        <Button variant="outline" onClick={() => setShowAddObatModal(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Obat
                        </Button>
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
                                        router.get(route('eklaim.deleteRincianTagihan', { rincianTagihan: selectedId }), {
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

                {/* Modal Tambah Tindakan */}
                <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tambah Tindakan</DialogTitle>
                        </DialogHeader>
                        <div className="mb-4">
                            <label className="mb-1 block font-medium">Cari Tindakan</label>
                            <SearchableDropdown
                                data={listTindakan}
                                value={selectedTindakan ? selectedTindakan.ID.toString() : ''}
                                setValue={(val: string) => {
                                    const found = listTindakan.find((t: any) => t.ID.toString() === val);
                                    setSelectedTindakan(found || null);
                                }}
                                placeholder="Cari nama tindakan..."
                                getOptionLabel={(item: any) => item.tindakan?.NAMA + ' - ' + formatRupiah(item?.TARIF) || ''}
                                getOptionValue={(item: any) => item.ID?.toString() || ''}
                            />
                            {selectedTindakan && (
                                <div className="mt-2 text-sm text-gray-600">
                                    Tarif: <span className="font-semibold">{formatRupiah(selectedTindakan.TARIF)}</span>
                                </div>
                            )}
                        </div>
                        <div className="mb-4">
                            <label className="mb-1 block font-medium">Jumlah</label>
                            <Input
                                type="number"
                                min={1}
                                value={jumlahTindakan}
                                onChange={(e) => setJumlahTindakan(Number(e.target.value))}
                                className="w-24"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAddModal(false)}>
                                Batal
                            </Button>
                            <Button onClick={handleAddTindakan} disabled={!selectedTindakan} className="bg-blue-600 text-white hover:bg-blue-700">
                                Tambah
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Modal Tambah Obat */}
                <Dialog open={showAddObatModal} onOpenChange={setShowAddObatModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tambah Obat</DialogTitle>
                        </DialogHeader>
                        <div className="mb-4">
                            <label className="mb-1 block font-medium">Cari Obat</label>
                            <SearchableDropdown
                                data={listObat}
                                value={selectedObat ? selectedObat.ID.toString() : ''}
                                setValue={(val: string) => {
                                    const found = listObat.find((o: any) => o.ID.toString() === val);
                                    setSelectedObat(found || null);
                                }}
                                placeholder="Cari nama obat..."
                                getOptionLabel={(item: any) =>
                                    item.NAMA +
                                    (item.harga_barang && item.harga_barang.HARGA_JUAL
                                        ? ' - ' + formatRupiah(item.harga_barang.HARGA_JUAL)
                                        : '')
                                }
                                getOptionValue={(item: any) => item.ID?.toString() || ''}
                            />
                            {selectedObat && (
                                <div className="mt-2 text-sm text-gray-600">
                                    Harga: <span className="font-semibold">
                                        {selectedObat.harga_barang && selectedObat.harga_barang.HARGA_JUAL
                                            ? formatRupiah(selectedObat.harga_barang.HARGA_JUAL)
                                            : '-'}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="mb-4">
                            <label className="mb-1 block font-medium">Jumlah</label>
                            <Input
                                type="number"
                                min={1}
                                value={jumlahObat}
                                onChange={(e) => setJumlahObat(Number(e.target.value))}
                                className="w-24"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAddObatModal(false)}>
                                Batal
                            </Button>
                            <Button onClick={handleAddObat} disabled={!selectedObat} className="bg-blue-600 text-white hover:bg-blue-700">
                                Tambah
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
