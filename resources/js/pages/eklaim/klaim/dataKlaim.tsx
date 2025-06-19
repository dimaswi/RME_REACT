import { ModalUpload } from '@/components/modalUpload';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { cetakLaboratoriumPDF } from '@/PDF/Laboratorium';
import { cetakRadiologiPDF } from '@/PDF/Radiologi';
import { cetakTagihanPDF } from '@/PDF/Tagihan';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Download, Loader, Pencil, Search, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import '../../../../css/dataKlaim.css';
import { cetakBerkasKlaim } from '../../../PDF/BerkasKlaim';
import { mergePDFs } from '../../../PDF/MergePDF';
import { cetakResumeMedis } from '../../../PDF/ResumeMedis';
import { cetakSEP, fetchSEPData } from '../../../PDF/SEP';
import FormDataKlaimView from './FormDataKlaimView';

export default function DataKlaim() {
    const { dataKlaim } = usePage().props as { dataKlaim: any };
    const { pasien } = usePage().props as { pasien: any };
    const { dataPendaftaran } = usePage().props as { dataPendaftaran: any };

    // Parse dataKlaim.request (JSON string) menjadi object
    const isiRequestKlaim = useMemo(() => {
        try {
            return dataKlaim.request ? JSON.parse(dataKlaim.request) : {};
        } catch {
            return {};
        }
    }, [dataKlaim.request]);

    function formatTanggalIndo(tgl: string) {
        if (!tgl) return '-';
        const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const [tahun, bulanIdx, tanggal] = tgl.split('-');
        if (!tahun || !bulanIdx || !tanggal) return tgl;
        return `${parseInt(tanggal)} ${bulan[parseInt(bulanIdx, 10) - 1]} ${tahun}`;
    }

    //Loading State
    const [loadingResumeMedis, setLoadingResumeMedis] = useState(false);
    const [loadingLoadTagihan, setLoadingLoadTagihan] = useState(false);
    const [loadingDownloadSEP, setLoadingDownloadSEP] = useState(false);
    const [loadingDownloadBerkasKlaim, setLoadingDownloadBerkasKlaim] = useState(false);
    const [loadingDownloadTagihan, setLoadingDownloadTagihan] = useState(false);
    const [loadingDownloadResumeMedis, setLoadingDownloadResumeMedis] = useState(false);
    const [loadingDownloadAll, setLoadingDownloadAll] = useState(false);
    const [loadingDownloadLaboratorium, setLoadingDownloadLaboratorium] = useState(false);
    const [loadingDownloadRadiologi, setLoadingDownloadRadiologi] = useState(false);
    const [previewSEP, setPreviewSEP] = useState(false);
    const [previewBerkasKlaim, setPreviewBerkasKlaim] = useState(false);
    const [previewTagihan, setPreviewTagihan] = useState(false);
    const [previewResumeMedis, setPreviewResumeMedis] = useState(false);
    const [previewLaboratorium, setPreviewLaboratorium] = useState(false);
    const [previewRadiologi, setPreviewRadiologi] = useState(false);
    const [previewAll, setPreviewAll] = useState(false);

    // Preview PDF
    const [previewPDF, setPreviewPDF] = useState(false);
    const [previewSEPData, setPreviewSEPData] = useState<string | null>(null);
    const [berkasKlaimUrl, setBerkasKlaimUrl] = useState<string | null>(null);
    const handleSEPPDF = async (data: any, jenis) => {
        await cetakSEP(data, jenis, pasien, setPreviewSEPData, setPreviewPDF, setBerkasKlaimUrl);
    };

    const [showUpload, setShowUpload] = useState(false);
    const [uploadUrl, setUploadUrl] = useState('');

    return (
        <AppLayout>
            <Head title="Pengisian Data Klaim" />
            <div className="p-4">
                <div className="mb-4">
                    <div className="mb-4">
                        <table className="w-full table-fixed overflow-auto rounded-lg border border-gray-300">
                            <tbody>
                                {/* Cara Masuk dan Jenis Perawatan */}
                                <tr className="hover:bg-gray-50">
                                    <td colSpan={8} className="border-r border-b border-l border-gray-300 bg-gray-100 px-4 py-2">
                                        <center>
                                            <h2>Data Kunjungan SIMRS</h2>
                                        </center>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-r border-b border-l border-gray-300 px-4 py-2">SEP</td>
                                    <td colSpan={6} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                        <div className="grid-cols-1 gap-2 lg:grid">
                                            <Button
                                                variant="outline"
                                                className="button-preview flex w-full items-center justify-center bg-white hover:bg-gray-300"
                                                disabled={previewSEP}
                                                onClick={async () => {
                                                    setPreviewSEP(true);
                                                    toast.info('Memproses mengambil data SEP, mohon tunggu...');
                                                    try {
                                                        const data = await fetchSEPData(dataPendaftaran.NOMOR); // Panggil fungsi untuk mengambil data
                                                        toast.success('Data SEP berhasil diambil');
                                                        console.log('Data SEP:', data);
                                                        cetakSEP(data, 'preview', setPreviewSEPData, setPreviewPDF, setBerkasKlaimUrl); // Panggil fungsi untuk membuat PDF
                                                    } catch (error) {
                                                        console.log(error);
                                                        setPreviewSEP(false);
                                                    } finally {
                                                        setPreviewSEP(false);
                                                    }
                                                }}
                                            >
                                                {previewSEP ? (
                                                    <>
                                                        <Loader className="animate-spin" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Search />
                                                        Preview
                                                    </>
                                                )}
                                            </Button>
                                            {/* <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                disabled={loadingDownloadSEP}
                                                onClick={async () => {
                                                    setLoadingDownloadSEP(true);
                                                    toast.info("Memproses mengambil data SEP, mohon tunggu...");
                                                    try {
                                                        const data = await fetchSEPData(dataPendaftaran.NOMOR); // Panggil fungsi untuk mengambil data
                                                        toast.success("Data SEP berhasil diambil");
                                                        cetakSEP(data, 'download', setPreviewSEPData, setPreviewPDF, setBerkasKlaimUrl); // Panggil fungsi untuk membuat PDF
                                                    } catch (error) {
                                                        console.log(error)
                                                        setLoadingDownloadSEP(false);
                                                    } finally {
                                                        setLoadingDownloadSEP(false);
                                                    }

                                                }}
                                            >
                                                {loadingDownloadSEP ? (
                                                    <>
                                                        <Loader className="animate-spin" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download />
                                                        Download
                                                    </>
                                                )}
                                            </Button> */}
                                        </div>
                                    </td>
                                    <td rowSpan={14} className="h-[60px] p-0 align-middle">
                                        <div className="grid h-full grid-rows-2 items-stretch gap-2">
                                            <Button
                                                variant="outline"
                                                className="flex h-full w-full items-center justify-center bg-white hover:bg-gray-300"
                                                disabled={previewAll}
                                                onClick={async () => {
                                                    setPreviewAll(true);
                                                    try {
                                                        await mergePDFs(dataPendaftaran.NOMOR, dataKlaim.nomor_SEP, dataKlaim, 'preview');
                                                    } catch (error) {
                                                        console.log(error);
                                                        setPreviewAll(false);
                                                    } finally {
                                                        setPreviewAll(false);
                                                    }
                                                }}
                                            >
                                                {previewAll ? (
                                                    <>
                                                        <Loader className="animate-spin" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Search />
                                                        Preview All
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex h-full w-full items-center justify-center bg-white hover:bg-gray-300"
                                                disabled={loadingDownloadAll}
                                                onClick={async () => {
                                                    setLoadingDownloadAll(true);
                                                    try {
                                                        await mergePDFs(dataPendaftaran.NOMOR, dataKlaim.nomor_SEP, dataKlaim, 'download');
                                                    } catch (error) {
                                                        console.log(error);
                                                        setLoadingDownloadAll(false);
                                                    } finally {
                                                        setLoadingDownloadAll(false);
                                                    }
                                                }}
                                            >
                                                {loadingDownloadAll ? (
                                                    <>
                                                        <Loader className="animate-spin" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download />
                                                        Download All
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-r border-b border-l border-gray-300 px-4 py-2">Berkas Klaim</td>
                                    <td colSpan={6} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                        <div className="grid-cols-1 gap-2 lg:grid">
                                            <Button
                                                variant="outline"
                                                className="button-preview flex w-full items-center justify-center bg-white hover:bg-gray-300"
                                                disabled={previewBerkasKlaim}
                                                onClick={async () => {
                                                    setPreviewBerkasKlaim(true);
                                                    toast.info('Memproses mengambil PDF, mohon tunggu...');
                                                    try {
                                                        await cetakBerkasKlaim(
                                                            dataKlaim.nomor_SEP,
                                                            'preview',
                                                        );
                                                    } catch (error) {
                                                        console.log(error);
                                                        setPreviewBerkasKlaim(false);
                                                    } finally {
                                                        setPreviewBerkasKlaim(false);
                                                    }
                                                }}
                                            >
                                                {previewBerkasKlaim ? (
                                                    <>
                                                        <Loader className="animate-spin" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Search />
                                                        Preview
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-r border-b border-l border-gray-300 px-4 py-2">Resume Medis</td>
                                    <td colSpan={6} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                        <div className="grid-cols-4 gap-2 lg:grid">
                                            <Button
                                                variant="outline"
                                                className="flex w-full items-center justify-center bg-white hover:bg-gray-300"
                                                onClick={() =>
                                                    router.get(
                                                        route('eklaim.editData.resumeMedis', {
                                                            pengajuanKlaim: dataKlaim.id,
                                                        }),
                                                    )
                                                }
                                            >
                                                <Pencil />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="button-preview flex w-full items-center justify-center bg-white hover:bg-gray-300"
                                                disabled={previewResumeMedis}
                                                onClick={async () => {
                                                    setPreviewResumeMedis(true);
                                                    setTimeout(async () => {
                                                        try {
                                                            await cetakResumeMedis(dataPendaftaran.NOMOR, 'preview', dataKlaim);
                                                        } catch (error) {
                                                            console.error(error);
                                                        } finally {
                                                            setPreviewResumeMedis(false);
                                                        }
                                                    }, 100); // Timeout selama 0,5 detik
                                                }}
                                            >
                                                {previewResumeMedis ? (
                                                    <>
                                                        <Loader className="animate-spin" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Search />
                                                        Preview
                                                    </>
                                                )}
                                            </Button>
                                            {/* <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                disabled={loadingDownloadResumeMedis}
                                                onClick={async () => {
                                                    setLoadingDownloadResumeMedis(true);
                                                    try {
                                                        await router.get(
                                                            route('loadDataResumeMedis', {
                                                                pendaftaran: dataPendaftaran.NOMOR
                                                            }),
                                                            {},
                                                            {
                                                                onFinish: () => setLoadingDownloadResumeMedis(false)
                                                            }
                                                        );
                                                        console.log("Ambil Data Resume Medis");
                                                    } catch (error) {
                                                        console.log(error)
                                                        setLoadingDownloadResumeMedis(false);
                                                    }
                                                }}
                                            >
                                                {loadingDownloadResumeMedis ? (
                                                    <>
                                                        <Loader className="animate-spin" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download />
                                                        Download
                                                    </>
                                                )}
                                            </Button> */}
                                            <Button
                                                variant="outline"
                                                className="button-preview flex w-full items-center justify-center bg-white hover:bg-gray-300"
                                                disabled={loadingResumeMedis}
                                                onClick={async () => {
                                                    setLoadingResumeMedis(true);
                                                    try {
                                                        const response = await axios.get(
                                                            route('loadDataResumeMedis', {
                                                                pendaftaran: dataPendaftaran.NOMOR,
                                                            }),
                                                        );
                                                        console.log('Ambil Data Resume Medis', response.data);
                                                        toast.success('Data resume medis berhasil diambil');
                                                    } catch (error) {
                                                        console.error('Error:', error);
                                                        toast.error('Gagal mengambil data resume medis');
                                                        setLoadingResumeMedis(false);
                                                    } finally {
                                                        setLoadingResumeMedis(false);
                                                    }
                                                }}
                                            >
                                                {loadingResumeMedis ? (
                                                    <>
                                                        <Loader className="animate-spin" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Loader />
                                                        Ambil Data
                                                    </>
                                                )}
                                            </Button>
                                            <Button variant="outline" className="flex w-full items-center justify-center bg-white hover:bg-gray-300">
                                                <Upload />
                                                Kirim
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-r border-b border-l border-gray-300 px-4 py-2">Tagihan</td>
                                    <td colSpan={6} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                        <div className="grid-cols-4 gap-2 lg:grid">
                                            <Button
                                                variant="outline"
                                                className="flex w-full items-center justify-center bg-white hover:bg-gray-300"
                                                onClick={() =>
                                                    router.get(
                                                        route('eklaim.editData.tagihan', {
                                                            pengajuanKlaim: dataKlaim.id,
                                                        }),
                                                    )
                                                }
                                            >
                                                <Pencil />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="button-preview flex w-full items-center justify-center bg-white hover:bg-gray-300"
                                                disabled={previewTagihan}
                                                onClick={async () => {
                                                    setPreviewTagihan(true);
                                                    setTimeout(async () => {
                                                        try {
                                                            await cetakTagihanPDF(dataKlaim.id, 'preview');
                                                        } catch (error) {
                                                            console.error(error);
                                                        } finally {
                                                            setPreviewTagihan(false);
                                                        }
                                                    }, 100); // Timeout selama 0,5 detik
                                                }}
                                            >
                                                {previewTagihan ? (
                                                    <>
                                                        <Loader className="animate-spin" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Search />
                                                        Preview
                                                    </>
                                                )}
                                            </Button>
                                            {/* <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                disabled={loadingDownloadTagihan}
                                                onClick={async () => {
                                                    setLoadingDownloadTagihan(true);
                                                    try {
                                                        await router.get(
                                                            route('loadDataResumeMedis', {
                                                                pendaftaran: dataPendaftaran.NOMOR
                                                            }),
                                                            {},
                                                            {
                                                                onFinish: () => setLoadingDownloadTagihan(false)
                                                            }
                                                        );
                                                        console.log("Ambil Data Resume Medis");
                                                    } catch (error) {
                                                        console.log(error)
                                                        setLoadingDownloadTagihan(false);
                                                    }
                                                }}
                                            >
                                                {loadingDownloadTagihan ? (
                                                    <>
                                                        <Loader className="animate-spin" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download />
                                                        Download
                                                    </>
                                                )}
                                            </Button> */}
                                            <Button
                                                variant="outline"
                                                className="button-preview flex w-full items-center justify-center bg-white hover:bg-gray-300"
                                                disabled={loadingLoadTagihan}
                                                onClick={async () => {
                                                    setLoadingLoadTagihan(true);
                                                    try {
                                                        const response = await axios.get(
                                                            route('loadDataTagihan', {
                                                                pendaftaran: dataPendaftaran.NOMOR,
                                                            }),
                                                        );
                                                        console.log('Ambil Data Tagihan', response.data);
                                                        setTarifProsedurBedah(Number(response.data.pendaftaran_tagihan.tagihan.PROSEDUR_BEDAH));
                                                        setTarifProsedurNonBedah(
                                                            Number(response.data.pendaftaran_tagihan.tagihan.PROSEDUR_NON_BEDAH),
                                                        );
                                                        setTarifKonsultasi(Number(response.data.pendaftaran_tagihan.tagihan.KONSULTASI));
                                                        setTarifTenagaAhli(Number(response.data.pendaftaran_tagihan.tagihan.TENAGA_AHLI));
                                                        setTarifKeperawatan(Number(response.data.pendaftaran_tagihan.tagihan.KEPERAWATAN));
                                                        setTarifPenunjang(Number(response.data.pendaftaran_tagihan.tagihan.PENUNJANG));
                                                        setTarifRadiologi(Number(response.data.pendaftaran_tagihan.tagihan.RADIOLOGI));
                                                        setTarifLaboratorium(Number(response.data.pendaftaran_tagihan.tagihan.LABORATORIUM));
                                                        setTarifPelayananDarah(Number(response.data.pendaftaran_tagihan.tagihan.PELAYANAN_DARAH));
                                                        setTarifRehabilitasi(Number(response.data.pendaftaran_tagihan.tagihan.REHABILITASI));
                                                        setTarifKamar(Number(response.data.pendaftaran_tagihan.tagihan.AKOMODASI));
                                                        setTarifRawatIntensif(Number(response.data.pendaftaran_tagihan.tagihan.RAWAT_INTENSIF));
                                                        setTarifObat(Number(response.data.pendaftaran_tagihan.tagihan.OBAT));
                                                        setTarifObatKronis(Number(response.data.pendaftaran_tagihan.tagihan.OBAT_KRONIS));
                                                        setTarifObatKemoterapi(Number(response.data.pendaftaran_tagihan.tagihan.OBAT_KEMOTERAPI));
                                                        setTarifAlkes(Number(response.data.pendaftaran_tagihan.tagihan.ALKES));
                                                        setTarifBMHP(Number(response.data.pendaftaran_tagihan.tagihan.BMHP));
                                                        setTarifSewaAlat(Number(response.data.pendaftaran_tagihan.tagihan.SEWA_ALAT));
                                                        toast.success('Data tagihan berhasil diambil');
                                                    } catch (error) {
                                                        console.error('Error:', error);
                                                        toast.error('Gagal mengambil data tagihan');
                                                        setLoadingLoadTagihan(false);
                                                    } finally {
                                                        setLoadingLoadTagihan(false);
                                                    }
                                                }}
                                            >
                                                {loadingLoadTagihan ? (
                                                    <>
                                                        <Loader className="animate-spin" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Loader />
                                                        Ambil Data
                                                    </>
                                                )}
                                            </Button>
                                            <Button variant="outline" className="flex w-full items-center justify-center bg-white hover:bg-gray-300">
                                                <Upload />
                                                Kirim
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-r border-b border-l border-gray-300 px-4 py-2">Laboratorium</td>
                                    <td colSpan={6} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                        <div className="grid-cols-3 gap-2 lg:grid">
                                            <Button
                                                variant="outline"
                                                className="flex w-full items-center justify-center bg-white hover:bg-gray-300"
                                                onClick={() =>
                                                    router.get(
                                                        route('eklaim.editData.laboratorium', {
                                                            pengajuanKlaim: dataKlaim.id,
                                                        }),
                                                    )
                                                }
                                            >
                                                <Pencil />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="button-preview flex w-full items-center justify-center bg-white hover:bg-gray-300"
                                                disabled={previewLaboratorium}
                                                onClick={async () => {
                                                    setPreviewLaboratorium(true);
                                                    setTimeout(async () => {
                                                        try {
                                                            await cetakLaboratoriumPDF(dataKlaim.id, 'preview');
                                                        } catch (error) {
                                                            console.error(error);
                                                        } finally {
                                                            setPreviewLaboratorium(false);
                                                        }
                                                    }, 100); // Timeout selama 0,1 detik
                                                }}
                                            >
                                                {previewLaboratorium ? (
                                                    <>
                                                        <Loader className="animate-spin" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Search />
                                                        Preview
                                                    </>
                                                )}
                                            </Button>
                                            {/* <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                disabled={loadingDownloadLaboratorium}
                                                onClick={async () => {
                                                    setLoadingDownloadLaboratorium(true);
                                                    try {
                                                        await router.get(
                                                            route('downloadLaboratorium', {
                                                                pendaftaran: dataPendaftaran.NOMOR
                                                            }),
                                                            {},
                                                            {
                                                                onFinish: () => setLoadingDownloadLaboratorium(false)
                                                            }
                                                        );
                                                        console.log("Ambil Data Laboratorium");
                                                    } catch (error) {
                                                        console.log(error)
                                                        setLoadingDownloadLaboratorium(false);
                                                    }
                                                }}
                                            >
                                                {loadingDownloadLaboratorium ? (
                                                    <>
                                                        <Loader className="animate-spin" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download />
                                                        Download
                                                    </>
                                                )}
                                            </Button> */}
                                            <Button variant="outline" className="flex w-full items-center justify-center bg-white hover:bg-gray-300">
                                                <Upload />
                                                Kirim
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-r border-b border-l border-gray-300 px-4 py-2">Radiologi</td>
                                    <td colSpan={6} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                        <div className="grid-cols-3 gap-2 lg:grid">
                                            <Button
                                                variant="outline"
                                                className="flex w-full items-center justify-center bg-white hover:bg-gray-300"
                                                onClick={() =>
                                                    router.get(
                                                        route('eklaim.editData.radiologi', {
                                                            pengajuanKlaim: dataKlaim.id,
                                                        }),
                                                    )
                                                }
                                            >
                                                <Pencil />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="button-preview flex w-full items-center justify-center bg-white hover:bg-gray-300"
                                                disabled={previewRadiologi}
                                                onClick={async () => {
                                                    setPreviewRadiologi(true);
                                                    setTimeout(async () => {
                                                        try {
                                                            await cetakRadiologiPDF(dataKlaim.id, 'preview');
                                                        } catch (error) {
                                                            console.error(error);
                                                        } finally {
                                                            setPreviewRadiologi(false);
                                                        }
                                                    }, 100); // Timeout selama 0,1 detik
                                                }}
                                            >
                                                {previewRadiologi ? (
                                                    <>
                                                        <Loader className="animate-spin" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Search />
                                                        Preview
                                                    </>
                                                )}
                                            </Button>
                                            {/* <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                disabled={loadingDownloadRadiologi}
                                                onClick={async () => {
                                                    setLoadingDownloadRadiologi(true);
                                                    try {
                                                        await router.get(
                                                            route('downloadRadiologi', {
                                                                pendaftaran: dataPendaftaran.NOMOR
                                                            }),
                                                            {},
                                                            {
                                                                onFinish: () => setLoadingDownloadRadiologi(false)
                                                            }
                                                        );
                                                        console.log("Ambil Data Resume Medis");
                                                    } catch (error) {
                                                        console.log(error)
                                                        setLoadingDownloadRadiologi(false);
                                                    }
                                                }}
                                            >
                                                {loadingDownloadRadiologi ? (
                                                    <>
                                                        <Loader className="animate-spin" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download />
                                                        Download
                                                    </>
                                                )}
                                            </Button> */}
                                            <Button variant="outline" className="flex w-full items-center justify-center bg-white hover:bg-gray-300">
                                                <Upload />
                                                Kirim
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-r border-b border-l border-gray-300 px-4 py-2">Dokumen Bebas Biaya</td>
                                    <td colSpan={6} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                        <div className="grid-cols-2 gap-2 lg:grid">
                                            <Button
                                                variant="outline"
                                                className="flex w-full items-center justify-center bg-white hover:bg-gray-300"
                                                onClick={() => {
                                                    setUploadUrl(`/api/upload-dokumen/123`); // atau url lain sesuai kebutuhan
                                                    setShowUpload(true);
                                                }}
                                            >
                                                <Upload />
                                                Upload
                                            </Button>
                                            <Button variant="outline" className="flex w-full items-center justify-center bg-white hover:bg-gray-300">
                                                <Upload />
                                                Kirim
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-r border-b border-l border-gray-300 px-4 py-2">Surat Kematian</td>
                                    <td colSpan={6} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                        <div className="grid-cols-2 gap-2 lg:grid">
                                            <Button
                                                variant="outline"
                                                className="flex w-full items-center justify-center bg-white hover:bg-gray-300"
                                                onClick={() => {
                                                    setUploadUrl(`/api/upload-dokumen/123`); // atau url lain sesuai kebutuhan
                                                    setShowUpload(true);
                                                }}
                                            >
                                                <Upload />
                                                Upload
                                            </Button>
                                            <Button variant="outline" className="flex w-full items-center justify-center bg-white hover:bg-gray-300">
                                                <Upload />
                                                Kirim
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-r border-b border-l border-gray-300 px-4 py-2">Ruang Perawatan</td>
                                    <td colSpan={6} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                        <div className="grid-cols-2 gap-2 lg:grid">
                                            <Button
                                                variant="outline"
                                                className="flex w-full items-center justify-center bg-white hover:bg-gray-300"
                                                onClick={() => {
                                                    setUploadUrl(`/api/upload-dokumen/123`); // atau url lain sesuai kebutuhan
                                                    setShowUpload(true);
                                                }}
                                            >
                                                <Upload />
                                                Upload
                                            </Button>
                                            <Button variant="outline" className="flex w-full items-center justify-center bg-white hover:bg-gray-300">
                                                <Upload />
                                                Kirim
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-r border-b border-l border-gray-300 px-4 py-2">Surat Kematian</td>
                                    <td colSpan={6} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                        <div className="grid-cols-2 gap-2 lg:grid">
                                            <Button
                                                variant="outline"
                                                className="flex w-full items-center justify-center bg-white hover:bg-gray-300"
                                                onClick={() => {
                                                    setUploadUrl(`/api/upload-dokumen/123`); // atau url lain sesuai kebutuhan
                                                    setShowUpload(true);
                                                }}
                                            >
                                                <Upload />
                                                Upload
                                            </Button>
                                            <Button variant="outline" className="flex w-full items-center justify-center bg-white hover:bg-gray-300">
                                                <Upload />
                                                Kirim
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-r border-b border-l border-gray-300 px-4 py-2">Dokumen Penunjang Lainnya</td>
                                    <td colSpan={6} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                        <div className="grid-cols-2 gap-2 lg:grid">
                                            <Button
                                                variant="outline"
                                                className="flex w-full items-center justify-center bg-white hover:bg-gray-300"
                                                onClick={() => {
                                                    setUploadUrl(`/api/upload-dokumen/123`); // atau url lain sesuai kebutuhan
                                                    setShowUpload(true);
                                                }}
                                            >
                                                <Upload />
                                                Upload
                                            </Button>
                                            <Button variant="outline" className="flex w-full items-center justify-center bg-white hover:bg-gray-300">
                                                <Upload />
                                                Kirim
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-r border-b border-l border-gray-300 px-4 py-2">Resep Obat/Alkes</td>
                                    <td colSpan={6} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                        <div className="grid-cols-2 gap-2 lg:grid">
                                            <Button
                                                variant="outline"
                                                className="flex w-full items-center justify-center bg-white hover:bg-gray-300"
                                                onClick={() => {
                                                    setUploadUrl(`/api/upload-dokumen/123`); // atau url lain sesuai kebutuhan
                                                    setShowUpload(true);
                                                }}
                                            >
                                                <Upload />
                                                Upload
                                            </Button>
                                            <Button variant="outline" className="flex w-full items-center justify-center bg-white hover:bg-gray-300">
                                                <Upload />
                                                Kirim
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-r border-b border-l border-gray-300 px-4 py-2">Dokumen KIPI</td>
                                    <td colSpan={6} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                        <div className="grid-cols-2 gap-2 lg:grid">
                                            <Button
                                                variant="outline"
                                                className="flex w-full items-center justify-center bg-white hover:bg-gray-300"
                                                onClick={() => {
                                                    setUploadUrl(`/api/upload-dokumen/123`); // atau url lain sesuai kebutuhan
                                                    setShowUpload(true);
                                                }}
                                            >
                                                <Upload />
                                                Upload
                                            </Button>
                                            <Button variant="outline" className="flex w-full items-center justify-center bg-white hover:bg-gray-300">
                                                <Upload />
                                                Kirim
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-r border-b border-l border-gray-300 px-4 py-2">Dokumen Lainnya</td>
                                    <td colSpan={6} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                        <div className="grid-cols-2 gap-2 lg:grid">
                                            <Button
                                                variant="outline"
                                                className="flex w-full items-center justify-center bg-white hover:bg-gray-300"
                                                onClick={() => {
                                                    setUploadUrl(`/api/upload-dokumen/123`); // atau url lain sesuai kebutuhan
                                                    setShowUpload(true);
                                                }}
                                            >
                                                <Upload />
                                                Upload
                                            </Button>
                                            <Button variant="outline" className="flex w-full items-center justify-center bg-white hover:bg-gray-300">
                                                <Upload />
                                                Kirim
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="mb-3 rounded border bg-blue-50 p-2 text-sm">
                        <div>
                            <b>Tanggal Pengajuan:</b> {formatTanggalIndo(dataKlaim.tanggal_pengajuan)}
                        </div>
                        <div>
                            <b>Tanggal SEP:</b> {formatTanggalIndo(isiRequestKlaim.tanggal_sep)}
                        </div>
                        <div>
                            <b>Nomor Kartu:</b> {isiRequestKlaim.nomor_kartu || '-'}
                        </div>
                        <div>
                            <b>Nomor SEP:</b> {isiRequestKlaim.nomor_sep || '-'}
                        </div>
                        <div>
                            <b>Nomor RM:</b> {isiRequestKlaim.nomor_rm || '-'}
                        </div>
                        <div>
                            <b>Nama Pasien:</b> {pasien.NAMA || '-'}
                        </div>
                        <div>
                            <b>Tanggal Masuk :</b> {formatTanggalIndo(dataPendaftaran.TANGGAL)}
                        </div>
                        <div>
                            <b>Tanggal Kealur :</b>{' '}
                            {dataPendaftaran.pasien_pulang?.TANGGAL
                                ? formatTanggalIndo(dataPendaftaran.pasien_pulang.TANGGAL)
                                : 'Pasien belum pulang'}
                        </div>
                    </div>
                </div>

                <FormDataKlaimView pengajuanKlaimId={dataKlaim.id} />
                
                <ModalUpload
                    open={showUpload}
                    onClose={() => setShowUpload(false)}
                    uploadUrl={uploadUrl}
                    onSuccess={(res) => {
                        /* handle sukses */
                    }}
                    title="Upload Dokumen"
                    description="Pilih file yang akan diupload."
                />

                {/* Modal untuk Preview PDF */}
                {previewPDF && (berkasKlaimUrl || previewSEPData) && (
                    <div
                        className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 py-6"
                        onClick={() => {
                            setPreviewPDF(false);
                            setBerkasKlaimUrl(null);
                        }} // Tutup modal jika klik di luar
                    >
                        <div
                            className="relative h-full w-full max-w-7xl rounded-lg bg-transparent shadow-lg"
                            onClick={(e) => e.stopPropagation()} // Hentikan propagasi klik agar tidak menutup modal
                        >
                            {previewSEPData ? (
                                <iframe src={previewSEPData} className="h-full w-full rounded border"></iframe>
                            ) : berkasKlaimUrl ? (
                                <iframe src={berkasKlaimUrl} className="h-full w-full rounded border"></iframe>
                            ) : (
                                <p>Loading PDF...</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
