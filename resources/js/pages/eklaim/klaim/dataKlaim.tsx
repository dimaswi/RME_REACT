import AppLayout from "@/layouts/app-layout";
import SearchableDropdown from "@/components/SearchableDropdown";
import { BreadcrumbItem } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronRight, Cross, CrossIcon, Download, Home, Loader, Pencil, Plus, PlusCircle, Search, Trash, Upload, X } from "lucide-react";
import { set } from "date-fns";
import axios from "axios";
import "../../../../css/dataKlaim.css"
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import bpjsLogo from "../../../../image/bpjs.png"; // Impor gambar PNG
import { cetakResumeMedis } from "../../../PDF/ResumeMedis";
import { cetakSEP, fetchSEPData } from "../../../PDF/SEP";
import { cetakBerkasKlaim } from "../../../PDF/BerkasKlaim";
import { mergePDFs } from "../../../PDF/MergePDF";
import { ModalUpload } from "@/components/modalUpload";

export default function DataKlaim() {
    const { dataKlaim } = usePage().props as { dataKlaim: any };
    const { pasien } = usePage().props as { pasien: any };
    const { dataPendaftaran } = usePage().props as { dataPendaftaran: any };
    const [caraMasuk, setCaraMasuk] = useState("");
    const [dataDischargeStatus, setDataDischargeStatus] = useState("");
    const [dataPenjaminKlaim, setDataPenjaminKlaim] = useState("");
    const caraMasukOptions = [
        { ID: "gp", DESKRIPSI: "Rujukan FKTP" },
        { ID: "hosp-trans", DESKRIPSI: "Rujukan FKRTL" },
        { ID: "mp", DESKRIPSI: "Rujukan Spesialis" },
        { ID: "outp", DESKRIPSI: "Dari Rawat Jalan" },
        { ID: "inp", DESKRIPSI: "Dari Rawat Inap" },
        { ID: "emd", DESKRIPSI: "Dari Rawat Darurat" },
        { ID: "born", DESKRIPSI: "Lahir di RS" },
        { ID: "nursing", DESKRIPSI: "Rujukan Panti Jompo" },
        { ID: "psych", DESKRIPSI: "Rujukan dari RS Jiwa" },
        { ID: "rehab", DESKRIPSI: "Rujukan Fasilitas Rehab" },
        { ID: "other", DESKRIPSI: "Lain-lain" },
    ];

    const jenisPerawatanOptions = [
        { ID: 1, DESKRIPSI: "Rawat Inap" },
        { ID: 2, DESKRIPSI: "Rawat Jalan" },
        { ID: 3, DESKRIPSI: "Unit Gawat Darurat" },
    ];

    const listDischargeStatus = [
        { ID: 1, DESKRIPSI: "Atas Persetujuan Dokter" },
        { ID: 2, DESKRIPSI: "Dirujuk" },
        { ID: 3, DESKRIPSI: "Atas Permintaan Sendiri" },
        { ID: 4, DESKRIPSI: "Meninggal" },
        { ID: 5, DESKRIPSI: "Lain-Lain" },
    ]

    // State untuk ventilator fields
    const [openVentilator, setOpenVentilator] = useState(true);
    const [adaVentilator, setAdaVentilator] = useState(false);
    const [pemasangan, setPemasangan] = useState("");
    const [pencabutan, setPencabutan] = useState("");

    // Tambahkan state untuk ICU fields
    const [jenisPerawatan, setJenisPerawatan] = useState("");
    const [openICU, setOpenICU] = useState(true);
    const [adlSubAcute, setAdlSubAcute] = useState("");
    const [adlChronic, setAdlChronic] = useState("");
    const [icuIndicator, setIcuIndicator] = useState("");
    const [icuLos, setIcuLos] = useState("");

    // State untuk kelas pasien
    const [openKelasPasien, setOpenKelasPasien] = useState(true);
    const [upgradeKelas, setUpgradeKelas] = useState(false);
    const [upgradeKelasKe, setUpgradeKelasKe] = useState("");
    const [lamaUpgradeKelas, setLamaUpgradeKelas] = useState("");
    const [upgradeKelasPayor, setUpgradeKelasPayor] = useState("");
    const [paymentPct, setPaymentPct] = useState("");

    const listUpgradeKelas = [
        { ID: "kelas_1", DESKRIPSI: "Kelas 1" },
        { ID: "kelas_2", DESKRIPSI: "Kelas 2" },
        { ID: "vip", DESKRIPSI: "VIP" },
        { ID: "vvip", DESKRIPSI: "VVIP" },
    ]

    const listPayorUpgradeKelas = [
        { ID: "peserta", DESKRIPSI: "Peserta" },
        { ID: "pemberi_kerja", DESKRIPSI: "Pemberi Kerja" },
        { ID: "asuransi_tambahan", DESKRIPSI: "Asuransi Tambahan" }
    ]

    // Data Klinis
    const [dataSistole, setDataSistole] = useState("");
    const [dataDiastole, setDataDiastole] = useState("");


    // Parse dataKlaim.request (JSON string) menjadi object
    const isiRequestKlaim = useMemo(() => {
        try {
            return dataKlaim.request ? JSON.parse(dataKlaim.request) : {};
        } catch {
            return {};
        }
    }, [dataKlaim.request]);

    // console.log("isiRequestKlaim:", isiRequestKlaim);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: <Home className="inline mr-1" />,
            href: route('eklaim.klaim.index'),
        },
        {
            title: pasien.NAMA,
            href: route('eklaim.klaim.show', { pasien: dataKlaim.NORM }),
        },
        {
            title: 'Pengisian Data Klaim',
            href: '/eklaim/klaim/data-klaim',
        }
    ]

    function formatTanggalIndo(tgl: string) {
        if (!tgl) return "-";
        const bulan = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        const [tahun, bulanIdx, tanggal] = tgl.split("-");
        if (!tahun || !bulanIdx || !tanggal) return tgl;
        return `${parseInt(tanggal)} ${bulan[parseInt(bulanIdx, 10) - 1]} ${tahun}`;
    }

    // Tambahkan state dan fungsi untuk Diagnosa
    const [diagnosaOptions, setDiagnosaOptions] = useState<any[]>([]);
    const [selectedDiagnosa, setSelectedDiagnosa] = useState<any[]>([]); // Array untuk diagnosa
    const [showDiagnosaModal, setShowDiagnosaModal] = useState(false);
    const [diagnosaSearch, setDiagnosaSearch] = useState<any[]>([]); // Array untuk diagnosa

    const fetchDiagnosa = async (keyword: string) => {
        try {
            const response = await axios.get("/proxy/diagnosa", {
                params: { keyword },
            });

            if (response.data && response.data.response && Array.isArray(response.data.response.data)) {
                setDiagnosaOptions(response.data.response.data); // Simpan data ke state
            } else {
                setDiagnosaOptions([]); // Jika respons tidak valid, set ke array kosong
            }
        } catch (error) {
            console.error("Error fetching diagnosa:", error);
            setDiagnosaOptions([]); // Set ke array kosong jika terjadi error
        }
    };

    // Tambahkan state dan fungsi untuk Procedure
    const [procedureOptions, setProcedureOptions] = useState<any[]>([]);
    const [selectedProcedure, setSelectedProcedure] = useState<any[]>([]); // Array untuk procedure
    const [showProcedureModal, setShowProcedureModal] = useState(false);
    const [procedureSearch, setProcedureSearch] = useState<any[]>([]); // Array untuk diagnosa

    const fetchProcedure = async (keyword: string) => {
        try {
            const response = await axios.get("/proxy/procedure", {
                params: { keyword },
            });

            if (response.data && response.data.response && Array.isArray(response.data.response.data)) {
                setProcedureOptions(response.data.response.data); // Simpan data ke state
            } else {
                setProcedureOptions([]); // Jika respons tidak valid, set ke array kosong
            }
        } catch (error) {
            console.error("Error fetching procedure:", error);
            setProcedureOptions([]); // Set ke array kosong jika terjadi error
        }
    };

    // Tarif Rumah Sakit
    const [tarifProsedurNonBedah, setTarifProsedurNonBedah] = useState("");
    const [tarifProsedurBedah, setTarifProsedurBedah] = useState("");
    const [tarifKonsultasi, setTarifKonsultasi] = useState("");
    const [tarifTenagaAhli, setTarifTenagaAhli] = useState("");
    const [tarifKeperawatan, setTarifKeperawatan] = useState("");
    const [tarifPenunjang, setTarifPenunjang] = useState("");
    const [tarifRadiologi, setTarifRadiologi] = useState("");
    const [tarifLaboratorium, setTarifLaboratorium] = useState("");
    const [tarifPelayananDarah, setTarifPelayananDarah] = useState("");
    const [tarifRehabilitasi, setTarifRehabilitasi] = useState("");
    const [tarifKamar, setTarifKamar] = useState("");
    const [tarifRawatIntensif, setTarifRawatIntensif] = useState("");
    const [tarifObat, setTarifObat] = useState("");
    const [tarifObatKronis, setTarifObatKronis] = useState("");
    const [tarifObatKemoterapi, setTarifObatKemoterapi] = useState("");
    const [tarifAlkes, setTarifAlkes] = useState("");
    const [tarifBMHP, setTarifBMHP] = useState("");
    const [tarifSewaAlat, setTarifSewaAlat] = useState("");

    function formatRupiah(value: string | number): string {
        if (!value) return "Rp 0";
        const numberString = value.toString().replace(/[^,\d]/g, "");
        const split = numberString.split(",");
        const sisa = split[0].length % 3;
        let rupiah = split[0].substr(0, sisa);
        const ribuan = split[0].substr(sisa).match(/\d{3}/g);

        if (ribuan) {
            const separator = sisa ? "." : "";
            rupiah += separator + ribuan.join(".");
        }

        return `Rp ${rupiah}${split[1] ? "," + split[1] : ""}`;
    }

    // Pasien Meninggal
    const [pasienMeninggal, setPasienMeninggal] = useState(false);
    const [pemulasaranJenazah, setPemulasaranJenazah] = useState(false);
    const [kantongJenazah, setKantongJenazah] = useState(false);
    const [petiJenazah, setPetiJenazah] = useState(false);
    const [plastikErat, setPlastikErat] = useState(false);
    const [disinfektanJenazah, setDisinfektanJenazah] = useState(false);
    const [mobilJenazah, setMobilJenazah] = useState(false);
    const [disinfektanMobilJenazah, setDisinfektanMobilJenazah] = useState(false);

    const listCovidKartuPenjamin = [
        { ID: "nik", DESKRIPSI: "NIK" },
        { ID: "kitas", DESKRIPSI: "KITAS (Kartu Izin Tinggal Terbatas) / KITAP (Kartu Izin Tinggal Tetap)" },
        { ID: "paspor", DESKRIPSI: "Paspor" },
        { ID: "kartu_jkn", DESKRIPSI: "Kartu Peserta JKN" },
        { ID: "kk", DESKRIPSI: "Kartu Keluarga" },
        { ID: "unhcr", DESKRIPSI: "Dokumen Dari UNHCR" },
        { ID: "kelurahan", DESKRIPSI: "Dokumen Dari Kelurahan" },
        { ID: "dinsos", DESKRIPSI: "Dokumen Dari Dinas Sosial" },
        { ID: "dinkes", DESKRIPSI: "Dokumen Dari Dinas Kesehatan" },
        { ID: "sjp", DESKRIPSI: "Surat Jaminan Perawatan" },
        { ID: "klaim_ibu", DESKRIPSI: "Jaminan Bayi Baru Lahir" },
        { ID: "lainnya", DESKRIPSI: "Dokumen yang dapat dipertanggungjawabkan" },
    ]

    const [covid19StatusCD, setCovid19StatusCD] = useState(false);
    const [covidKartuPenjamin, setCovidKartuPenjamin] = useState("");
    const [nomorKartuPenjamin, setNomorKartuPenjamin] = useState("");
    const [covidEpisodes, setCovidEpisodes] = useState([]);
    const [covidEpisodesHari, setCovidEpisodesHari] = useState([]);
    const [covidEpisodesList, setCovidEpisodesList] = useState([{ episode: "", hari: "" }]);
    const [covid19CCIndonesia, setCovid19CCIndonesia] = useState(false);
    const [covid19RsDaruratIndonesia, setCovid19RsDaruratIndonesia] = useState(false);
    const [covid19COInsidenseIndonesia, setCovid19InsidenseIndonesia] = useState(false);
    const [covid19COinsidenseSEP, setCovid19COinsidenseSEP] = useState("");
    const [covidLabAsamLaktat, setCovidLabAsamLaktat] = useState(false);
    const [covidLabProcalcitonin, setCovidLabProcalcitonin] = useState(false);
    const [covidLabCRP, setCovidLabCRP] = useState(false);
    const [covidLabKultur, setCovidLabKultur] = useState(false);
    const [covidLabDDimer, setCovidLabDDimer] = useState(false);
    const [covidLabPT, setCovidLabPT] = useState(false);
    const [covidLabAPTT, setCovidLabAPTT] = useState(false);
    const [covidLabWaktuPendarahan, setCovidLabWaktuPendarahan] = useState(false);
    const [covidLabAntiHIV, setCovidLabAntiHIV] = useState(false);
    const [covidLabAnalisaGas, setCovidLabAnalisaGas] = useState(false);
    const [covidLabAlbumin, setCovidLabAlbumin] = useState(false);
    const [covidRadThoraxApPA, setCovidRadThoraxApPA] = useState(false);
    const [covidTerapiKovalen, setCovidTerapiKovalen] = useState("");
    const [covidAksesNaat, setCovidAksesNaat] = useState(false);
    const [covidIsoman, setCovidIsoman] = useState(false);
    const [covidBayiLahirStatus, setCovidBayiLahirStatus] = useState("");

    const listCovidBayiLahirStatus = [
        { ID: 1, DESKRIPSI: "Tanpa Kelainan" },
        { ID: 2, DESKRIPSI: "Dengan Kelainan" }
    ]

    const listEpisodeCovid = [
        { ID: 1, DESKRIPSI: "ICU dengan Ventilator" },
        { ID: 2, DESKRIPSI: "ICU tanpa Ventilator" },
        { ID: 3, DESKRIPSI: "Isolasi tekanan negatif dengan ventilator" },
        { ID: 4, DESKRIPSI: "Isolasi tekanan negatif tanpa ventilator" },
        { ID: 5, DESKRIPSI: "Isolasi non tekanan negatif dengan ventilator" },
        { ID: 6, DESKRIPSI: "Isolasi non tekanan negatif tanpa ventilator" },
        { ID: 7, DESKRIPSI: "ICU tekanan negatif dengan ventilator" },
        { ID: 8, DESKRIPSI: "ICU tekanan negatif tanpa ventilator" },
        { ID: 9, DESKRIPSI: "ICU tanpa tekanan negatif dengan ventilator" },
        { ID: 10, DESKRIPSI: "ICU tanpa tekanan negatif tanpa ventilator" },
        { ID: 11, DESKRIPSI: "Isolasi tekanan negatif" },
        { ID: 12, DESKRIPSI: "Isolasi tanpa tekanan negatif" },
    ]

    const addCovidEpisode = () => {
        setCovidEpisodesList([...covidEpisodesList, { episode: "", hari: "" }]);
    };

    const removeCovidEpisode = (index: number) => {
        setCovidEpisodesList(covidEpisodesList.filter((_, i) => i !== index));
    };

    const updateCovidEpisode = (index: number, field: string, value: string) => {
        const updatedList = [...covidEpisodesList];
        updatedList[index][field] = value;
        setCovidEpisodesList(updatedList);
    };

    // Hemodialisa
    const [hemodialisa, setHemodialisa] = useState("");
    const [kantongDarah, setKantongDarah] = useState("");
    const [alteplaseInd, setAlteplaseInd] = useState("");
    const listPenggunaanHemodialisa = [
        { ID: "1", DESKRIPSI: "Single Use" },
        { ID: "2", DESKRIPSI: "Multiple Use" },
    ]

    // APGAR
    const [apgarApparance1, setApgarApparance1] = useState("");
    const [apgarApparance5, setApgarApparance5] = useState("");
    const [apgarPulse1, setApgarPulse1] = useState("");
    const [apgarPulse5, setApgarPulse5] = useState("");
    const [apgarGrimace1, setApgarGrimace1] = useState("");
    const [apgarGrimace5, setApgarGrimace5] = useState("");
    const [apgarActivity1, setApgarActivity1] = useState("");
    const [apgarActivity5, setApgarActivity5] = useState("");
    const [apgarRespiration1, setApgarRespiration1] = useState("");
    const [apgarRespiration5, setApgarRespiration5] = useState("");

    // Persalinan
    const [usiaPersalinan, setUsiaPersalinan] = useState("");
    const [gravida, setGravida] = useState("");
    const [partus, setPartus] = useState("");
    const [abortus, setAbortus] = useState("");
    const [onsetKontraksi, setOnsetKontraksi] = useState("");
    const [deliveryForms, setDeliveryForms] = useState([{ id: Date.now(), value: "" }]);

    const listOnsetKontraksi = [
        { ID: "spontan", DESKRIPSI: "Spontan" },
        { ID: "induksi", DESKRIPSI: "Induksi" },
        { ID: "non_spontan_non_induksi", DESKRIPSI: "Tidak Spontan dan Tidak Induksi" },
    ]

    const listMetodePersalinan = [
        { ID: "vaginal", DESKRIPSI: "Normal" },
        { ID: "sc", DESKRIPSI: "Operasi Caesar" },
    ]

    const addDeliveryForm = () => {
        const newId = Date.now().toString(); // Gunakan timestamp sebagai ID unik
        setDeliveryForms((prev) => ({
            ...prev,
            [newId]: {
                delivery_sequence: Object.keys(prev).length + 1, // Urutan berdasarkan jumlah item
                delivery_method: "",
                delivery_dttm: "",
                letak_janin: "",
                kondisi: "",
                use_manual: "",
                use_forcep: "",
                use_vacuum: "",
                shk_spesimen_ambil: "",
                shk_lokasi: "",
                shk_alasan: "",
                shk_spesimen_dttm: "",
            },
        }));
    };

    const removeDeliveryForm = (id) => {
        setDeliveryForms((prev) => {
            const updatedForms = { ...prev };
            delete updatedForms[id]; // Hapus item berdasarkan ID
            return updatedForms;
        });
    };

    const updateDeliveryForm = (id, field, value) => {
        console.log("Updating:", { id, field, value }); // Debugging
        setDeliveryForms((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value, // Perbarui field tertentu
            },
        }));
    };

    // Poli Eksekutif
    const [poliEksekutif, setPoliEksekutif] = useState(false);
    const [namaDokterPoliEksekutif, setNamaDokterPoliEksekutif] = useState("");
    const [tarifPoliEksekutif, setTarifPoliEksekutif] = useState("");

    // Penggunaan Darah
    const [penggunaanDarah, setPenggunaanDarah] = useState(false);
    const [kantongDarahPenggunaan, setKantongDarahPenggunaan] = useState("");

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
    const [uploadUrl, setUploadUrl] = useState("");



    return (
        <AppLayout>
            <Head title="Pengisian Data Klaim" />
            <div className="p-4">
                <div className="mb-4">
                    <div className="mb-4">
                        <table className="w-full border border-gray-300 rounded-lg table-fixed overflow-auto">
                            <tbody>
                                {/* Cara Masuk dan Jenis Perawatan */}
                                <tr className="hover:bg-gray-50">
                                    <td colSpan={8} className="bg-gray-100 border-b border-l border-r border-gray-300 px-4 py-2">
                                        <center>
                                            <h2>Data Kunjungan SIMRS</h2>
                                        </center>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        SEP
                                    </td>
                                    <td colSpan={6} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        <div className="lg:grid grid-cols-1 gap-2">
                                            <Button
                                                variant="outline"
                                                className="button-preview w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                disabled={previewSEP}
                                                onClick={async () => {
                                                    setPreviewSEP(true);
                                                    toast.info("Memproses mengambil data SEP, mohon tunggu...");
                                                    try {
                                                        const data = await fetchSEPData(dataPendaftaran.NOMOR); // Panggil fungsi untuk mengambil data
                                                        toast.success("Data SEP berhasil diambil");
                                                        console.log("Data SEP:", data);
                                                        cetakSEP(data, 'preview', setPreviewSEPData, setPreviewPDF, setBerkasKlaimUrl); // Panggil fungsi untuk membuat PDF
                                                    } catch (error) {
                                                        console.log(error)
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
                                        <div className="h-full items-stretch grid grid-rows-2 gap-2">
                                            <Button
                                                variant="outline"
                                                className="w-full h-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                disabled={previewAll}
                                                onClick={async () => {
                                                    setPreviewAll(true);
                                                    try {
                                                        await mergePDFs(
                                                            dataPendaftaran.NOMOR,
                                                            dataKlaim.nomor_SEP,
                                                            setPreviewPDF,
                                                            setPreviewSEPData,
                                                        );
                                                    } catch (error) {
                                                        console.log(error)
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
                                                className="w-full h-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                disabled={loadingDownloadAll}
                                                onClick={async () => {
                                                    setLoadingDownloadAll(true);
                                                    try {
                                                        await router.get(
                                                            route('loadDataResumeMedis', {
                                                                pendaftaran: dataPendaftaran.NOMOR
                                                            }),
                                                            {},
                                                            {
                                                                onFinish: () => setLoadingDownloadAll(false)
                                                            }
                                                        );
                                                        console.log("Ambil Data Resume Medis");
                                                    } catch (error) {
                                                        console.log(error)
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
                                    <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        Berkas Klaim
                                    </td>
                                    <td colSpan={6} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        <div className="lg:grid grid-cols-1 gap-2">
                                            <Button
                                                variant="outline"
                                                className="button-preview w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                disabled={previewBerkasKlaim}
                                                onClick={async () => {
                                                    setPreviewBerkasKlaim(true);
                                                    toast.info("Memproses mengambil PDF, mohon tunggu...");
                                                    try {
                                                        await cetakBerkasKlaim(
                                                            dataKlaim.nomor_SEP,
                                                            "preview",
                                                            setBerkasKlaimUrl,
                                                            setPreviewPDF,
                                                            setLoadingDownloadBerkasKlaim,
                                                            setPreviewBerkasKlaim,
                                                            setPreviewSEPData
                                                        );
                                                    } catch (error) {
                                                        console.log(error)
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
                                            {/* <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                disabled={loadingDownloadBerkasKlaim}
                                                onClick={async () => {
                                                    setLoadingDownloadBerkasKlaim(true);
                                                    toast.info("Memproses mengambil PDF, mohon tunggu...");
                                                    setTimeout(async () => {
                                                        try {
                                                            await cetakBerkasKlaim(
                                                                dataKlaim.nomor_SEP,
                                                                "download",
                                                                setBerkasKlaimUrl,
                                                                setPreviewPDF,
                                                                setLoadingDownloadBerkasKlaim,
                                                                setPreviewBerkasKlaim,
                                                                setPreviewSEPData
                                                            );
                                                        } catch (error) {
                                                            console.log(error)
                                                            setLoadingDownloadBerkasKlaim(false);
                                                        } finally {
                                                            setLoadingDownloadBerkasKlaim(false);
                                                        }
                                                    }, 500);
                                                }}
                                            >
                                                {loadingDownloadBerkasKlaim ? (
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
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        Resume Medis
                                    </td>
                                    <td colSpan={6} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        <div className="lg:grid grid-cols-4 gap-2">
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                onClick={() => router.get(route('eklaim.editData.resumeMedis', {
                                                    pengajuanKlaim: dataKlaim.id
                                                }))}
                                            >
                                                <Pencil />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="button-preview w-full bg-white hover:bg-gray-300 flex items-center justify-center"
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
                                                className="button-preview w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                disabled={loadingResumeMedis}
                                                onClick={async () => {
                                                    setLoadingResumeMedis(true);
                                                    try {
                                                        const response = await axios.get(route('loadDataResumeMedis', {
                                                            pendaftaran: dataPendaftaran.NOMOR
                                                        }));
                                                        console.log("Ambil Data Resume Medis", response.data);
                                                        toast.success("Data resume medis berhasil diambil");
                                                    } catch (error) {
                                                        console.error("Error:", error);
                                                        toast.error("Gagal mengambil data resume medis");
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
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                            >
                                                <Upload />
                                                Kirim
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        Tagihan
                                    </td>
                                    <td colSpan={6} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        <div className="lg:grid grid-cols-4 gap-2">
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                onClick={() => router.get(route('eklaim.editData.tagihan', {
                                                    pengajuanKlaim: dataKlaim.id
                                                }))}
                                            >
                                                <Pencil />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="button-preview w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                disabled={previewTagihan}
                                                onClick={async () => {
                                                    setPreviewTagihan(true);
                                                    try {
                                                        await router.get(
                                                            route('loadDataResumeMedis', {
                                                                pendaftaran: dataPendaftaran.NOMOR
                                                            }),
                                                            {},
                                                            {
                                                                onFinish: () => setPreviewTagihan(false)
                                                            }
                                                        );
                                                        console.log("Ambil Data Resume Medis");
                                                    } catch (error) {
                                                        console.log(error)
                                                        setPreviewTagihan(false);
                                                    }
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
                                                className="button-preview w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                disabled={loadingLoadTagihan}
                                                onClick={async () => {
                                                    setLoadingLoadTagihan(true);
                                                    try {
                                                        const response = await axios.get(route('loadDataTagihan', {
                                                            pendaftaran: dataPendaftaran.NOMOR
                                                        }));
                                                        console.log("Ambil Data Tagihan", response.data);
                                                        setTarifProsedurBedah(Number(response.data.pendaftaran_tagihan.tagihan.PROSEDUR_BEDAH));
                                                        setTarifProsedurNonBedah(Number(response.data.pendaftaran_tagihan.tagihan.PROSEDUR_NON_BEDAH));
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
                                                        toast.success("Data tagihan berhasil diambil");
                                                    } catch (error) {
                                                        console.error("Error:", error);
                                                        toast.error("Gagal mengambil data tagihan");
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
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                            >
                                                <Upload />
                                                Kirim
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        Laboratorium
                                    </td>
                                    <td colSpan={6} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        <div className="lg:grid grid-cols-3 gap-2">
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                onClick={() => router.get(route('eklaim.editData.laboratorium', {
                                                    pengajuanKlaim: dataKlaim.id
                                                }))}
                                            >
                                                <Pencil />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="button-preview w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                disabled={previewLaboratorium}
                                                onClick={async () => {
                                                    setPreviewLaboratorium(true);
                                                    try {
                                                        await router.get(
                                                            route('loadDataResumeMedis', {
                                                                pendaftaran: dataPendaftaran.NOMOR
                                                            }),
                                                            {},
                                                            {
                                                                onFinish: () => setPreviewLaboratorium(false)
                                                            }
                                                        );
                                                        console.log("Ambil Data Resume Medis");
                                                    } catch (error) {
                                                        console.log(error)
                                                        setPreviewLaboratorium(false);
                                                    }
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
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                            >
                                                <Upload />
                                                Kirim
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        Radiologi
                                    </td>
                                    <td colSpan={6} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        <div className="lg:grid grid-cols-3 gap-2">
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                onClick={() => router.get(route('eklaim.editData.radiologi', {
                                                    pengajuanKlaim: dataKlaim.id
                                                }))}
                                            >
                                                <Pencil />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="button-preview w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                disabled={previewRadiologi}
                                                onClick={async () => {
                                                    setPreviewRadiologi(true);
                                                    try {
                                                        await router.get(
                                                            route('loadDataResumeMedis', {
                                                                pendaftaran: dataPendaftaran.NOMOR
                                                            }),
                                                            {},
                                                            {
                                                                onFinish: () => setPreviewRadiologi(false)
                                                            }
                                                        );
                                                        console.log("Ambil Data Resume Medis");
                                                    } catch (error) {
                                                        console.log(error)
                                                        setPreviewRadiologi(false);
                                                    }
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
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                            >
                                                <Upload />
                                                Kirim
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        Dokumen Bebas Biaya
                                    </td>
                                    <td colSpan={6} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        <div className="lg:grid grid-cols-2 gap-2">
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                onClick={() => {
                                                    setUploadUrl(`/api/upload-dokumen/123`); // atau url lain sesuai kebutuhan
                                                    setShowUpload(true);
                                                }}
                                            >
                                                <Upload />
                                                Upload
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                            >
                                                <Upload />
                                                Kirim
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        Surat Kematian
                                    </td>
                                    <td colSpan={6} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        <div className="lg:grid grid-cols-2 gap-2">
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                onClick={() => {
                                                    setUploadUrl(`/api/upload-dokumen/123`); // atau url lain sesuai kebutuhan
                                                    setShowUpload(true);
                                                }}
                                            >
                                                <Upload />
                                                Upload
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                            >
                                                <Upload />
                                                Kirim
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        Ruang Perawatan
                                    </td>
                                    <td colSpan={6} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        <div className="lg:grid grid-cols-2 gap-2">
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                onClick={() => {
                                                    setUploadUrl(`/api/upload-dokumen/123`); // atau url lain sesuai kebutuhan
                                                    setShowUpload(true);
                                                }}
                                            >
                                                <Upload />
                                                Upload
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                            >
                                                <Upload />
                                                Kirim
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        Surat Kematian
                                    </td>
                                    <td colSpan={6} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        <div className="lg:grid grid-cols-2 gap-2">
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                onClick={() => {
                                                    setUploadUrl(`/api/upload-dokumen/123`); // atau url lain sesuai kebutuhan
                                                    setShowUpload(true);
                                                }}
                                            >
                                                <Upload />
                                                Upload
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                            >
                                                <Upload />
                                                Kirim
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        Dokumen Penunjang Lainnya
                                    </td>
                                    <td colSpan={6} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        <div className="lg:grid grid-cols-2 gap-2">
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                onClick={() => {
                                                    setUploadUrl(`/api/upload-dokumen/123`); // atau url lain sesuai kebutuhan
                                                    setShowUpload(true);
                                                }}
                                            >
                                                <Upload />
                                                Upload
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                            >
                                                <Upload />
                                                Kirim
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        Resep Obat/Alkes
                                    </td>
                                    <td colSpan={6} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        <div className="lg:grid grid-cols-2 gap-2">
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                onClick={() => {
                                                    setUploadUrl(`/api/upload-dokumen/123`); // atau url lain sesuai kebutuhan
                                                    setShowUpload(true);
                                                }}
                                            >
                                                <Upload />
                                                Upload
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                            >
                                                <Upload />
                                                Kirim
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        Dokumen KIPI
                                    </td>
                                    <td colSpan={6} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        <div className="lg:grid grid-cols-2 gap-2">
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                onClick={() => {
                                                    setUploadUrl(`/api/upload-dokumen/123`); // atau url lain sesuai kebutuhan
                                                    setShowUpload(true);
                                                }}
                                            >
                                                <Upload />
                                                Upload
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                            >
                                                <Upload />
                                                Kirim
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        Dokumen Lainnya
                                    </td>
                                    <td colSpan={6} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        <div className="lg:grid grid-cols-2 gap-2">
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                                onClick={() => {
                                                    setUploadUrl(`/api/upload-dokumen/123`); // atau url lain sesuai kebutuhan
                                                    setShowUpload(true);
                                                }}
                                            >
                                                <Upload />
                                                Upload
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white hover:bg-gray-300 flex items-center justify-center"
                                            >
                                                <Upload />
                                                Kirim
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="mb-3 p-2 border rounded bg-blue-50 text-sm">
                        <div>
                            <b>Tanggal Pengajuan:</b> {formatTanggalIndo(dataKlaim.tanggal_pengajuan)}
                        </div>
                        <div>
                            <b>Tanggal SEP:</b> {formatTanggalIndo(isiRequestKlaim.tanggal_sep)}
                        </div>
                        <div>
                            <b>Nomor Kartu:</b> {isiRequestKlaim.nomor_kartu || "-"}
                        </div>
                        <div>
                            <b>Nomor SEP:</b> {isiRequestKlaim.nomor_sep || "-"}
                        </div>
                        <div>
                            <b>Nomor RM:</b> {isiRequestKlaim.nomor_rm || "-"}
                        </div>
                        <div>
                            <b>Nama Pasien:</b> {pasien.NAMA || "-"}
                        </div>
                        <div>
                            <b>Tanggal Masuk :</b> {formatTanggalIndo(dataPendaftaran.TANGGAL)}
                        </div>
                        <div>
                            <b>Tanggal Kealur :</b>{" "}
                            {dataPendaftaran.pasien_pulang?.TANGGAL
                                ? formatTanggalIndo(dataPendaftaran.pasien_pulang.TANGGAL)
                                : "Pasien belum pulang"}
                        </div>
                    </div>
                </div>
                <div className="">
                    <table className="w-full border border-gray-300 rounded-lg table-fixed">
                        <tbody>
                            {/* Cara Masuk dan Jenis Perawatan */}
                            <tr className="hover:bg-gray-50">
                                <td colSpan={8} className="bg-gray-100 border-b border-l border-r border-gray-300 px-4 py-2">
                                    <center>
                                        <h2>Administrasi Umum</h2>
                                    </center>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Cara Masuk</td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2 relative">
                                    <SearchableDropdown
                                        data={caraMasukOptions}
                                        value={caraMasuk}
                                        setValue={setCaraMasuk}
                                        placeholder="Pilih Cara Masuk"
                                        getOptionLabel={(item) => item.DESKRIPSI}
                                        getOptionValue={(item) => item.ID}
                                    />
                                </td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Jenis Perawatan</td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <SearchableDropdown
                                        data={jenisPerawatanOptions}
                                        value={jenisPerawatan}
                                        setValue={setJenisPerawatan}
                                        placeholder="Pilih Jenis Perawatan"
                                        getOptionLabel={(item) => item.DESKRIPSI}
                                        getOptionValue={(item) => item.ID}
                                    />
                                </td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Cara Pulang</td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <SearchableDropdown
                                        data={listDischargeStatus}
                                        value={dataDischargeStatus}
                                        setValue={setDataDischargeStatus}
                                        placeholder="Pilih Cara Pulang"
                                        getOptionLabel={(item) => item.DESKRIPSI}
                                        getOptionValue={(item) => item.ID}
                                    />
                                </td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Penjamin</td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <SearchableDropdown
                                        data={[
                                            { ID: 3, DESKRIPSI: "JKN" },
                                            { ID: 71, DESKRIPSI: "JAMINAN COVID-19" },
                                            { ID: 72, DESKRIPSI: "JAMINAN KIPI" },
                                            { ID: 73, DESKRIPSI: "JAMINAN BAYI BARU LAHIR" },
                                            { ID: 74, DESKRIPSI: "JAMINAN PERPANJANG MASA RAWAT" },
                                            { ID: 75, DESKRIPSI: "JAMINAN CO-INSIDENSE" },
                                            { ID: 76, DESKRIPSI: "JAMPERSAL" },
                                            { ID: 77, DESKRIPSI: "JAMINAN PEMULIHAN KESEHATAN PRIORITAS" },
                                            { ID: 5, DESKRIPSI: "JAMKESDA" },
                                            { ID: 6, DESKRIPSI: "JAMKESOS" },
                                            { ID: 1, DESKRIPSI: "PASIEN BAYAR" },
                                        ]}
                                        value={dataPenjaminKlaim}
                                        setValue={setDataPenjaminKlaim}
                                        placeholder="Pilih Penjamin"
                                        getOptionLabel={(item) => item.DESKRIPSI}
                                        getOptionValue={(item) => item.ID}
                                    />
                                </td>
                            </tr>

                            {/* ICU Fields */}
                            <tr className="hover:bg-gray-50">
                                <td colSpan={8} className="bg-gray-100 border-b border-l border-r border-gray-300 px-4 py-2">
                                    <center>
                                        <h2>ICU</h2>
                                    </center>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">ADL Sub Acute</td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        id="adl_sub_acute"
                                        name="adl_sub_acute"
                                        type="text"
                                        placeholder="Masukkan ADL Sub Acute"
                                        value={adlSubAcute}
                                        onChange={e => setAdlSubAcute(e.target.value)}
                                    />
                                </td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">ADL Chronic</td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        id="adl_chronic"
                                        name="adl_chronic"
                                        type="text"
                                        placeholder="Masukkan ADL Chronic"
                                        value={adlChronic}
                                        onChange={e => setAdlChronic(e.target.value)}
                                    />
                                </td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">ICU Indicator</td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        id="icu_indicator"
                                        name="icu_indicator"
                                        type="text"
                                        placeholder="Masukkan ICU Indicator"
                                        value={icuIndicator}
                                        onChange={e => setIcuIndicator(e.target.value)}
                                    />
                                </td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">ICU LOS</td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        id="icu_los"
                                        name="icu_los"
                                        type="text"
                                        placeholder="Masukkan ICU LOS"
                                        value={icuLos}
                                        onChange={e => setIcuLos(e.target.value)}
                                    />
                                </td>
                            </tr>

                            {/* Ventilator */}
                            <tr className="hover:bg-gray-50">
                                <td colSpan={8} className="bg-gray-100 border-b border-l border-r border-gray-300 px-4 py-2">
                                    <center>
                                        <h2>Oksigen</h2>
                                    </center>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Pemakaian Oksigen</td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Checkbox
                                        id="ada_ventilator"
                                        checked={adaVentilator}
                                        onCheckedChange={setAdaVentilator}
                                    />
                                </td>
                                {adaVentilator ? (
                                    <>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">Pemasangan</td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Input
                                                id="pemasangan"
                                                name="pemasangan"
                                                type="datetime-local"
                                                value={pemasangan}
                                                onChange={e => setPemasangan(e.target.value)}
                                            />
                                        </td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">Pencabutan</td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Input
                                                id="pencabutan"
                                                name="pencabutan"
                                                type="datetime-local"
                                                value={pencabutan}
                                                onChange={e => setPencabutan(e.target.value)}
                                            />
                                        </td>
                                        <td colSpan={2} className="border-b border-l border-r border-gray-300 px-4 py-2"></td>
                                    </>
                                ) : (
                                    <td colSpan={6} className="border-b border-l border-r border-gray-300 px-4 py-2"></td>
                                )}
                            </tr>

                            {/* Upgrade Kelas */}
                            <tr className="hover:bg-gray-50">
                                <td colSpan={8} className="bg-gray-100 border-b border-l border-r border-gray-300 px-4 py-2">
                                    <center>
                                        <h2>Naik Kelas</h2>
                                    </center>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Upgrade Kelas</td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Checkbox
                                        id="kelas_pasien"
                                        checked={upgradeKelas}
                                        onCheckedChange={setUpgradeKelas}
                                    />
                                </td>
                                <td colSpan={6} className="border-b border-l border-r border-gray-300 px-4 py-2"></td>
                            </tr>
                            {upgradeKelas && (
                                <>
                                    <tr className="hover:bg-gray-50">
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">Upgrade Kelas Ke</td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <SearchableDropdown
                                                data={listUpgradeKelas}
                                                value={upgradeKelasKe}
                                                setValue={setUpgradeKelasKe}
                                                placeholder="Pilih Upgrade Kelas"
                                                getOptionLabel={item => item.DESKRIPSI}
                                                getOptionValue={item => item.ID}
                                            />
                                        </td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">LOS</td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Input
                                                id="lama_upgrade"
                                                name="lama_upgrade"
                                                type="number"
                                                placeholder="Masukkan Lama Upgrade Kelas (dalam hari)"
                                                value={lamaUpgradeKelas}
                                                onChange={e => setLamaUpgradeKelas(e.target.value)}
                                            />
                                        </td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">Pembayar</td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <SearchableDropdown
                                                data={listPayorUpgradeKelas}
                                                value={upgradeKelasPayor}
                                                setValue={setUpgradeKelasPayor}
                                                placeholder="Pilih Penanggung Jawab"
                                                getOptionLabel={item => item.DESKRIPSI}
                                                getOptionValue={item => item.ID}
                                            />
                                        </td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">Payment PCT</td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Input
                                                id="payment_pct"
                                                name="payment_pct"
                                                type="number"
                                                placeholder="Koefisien tambahan biaya khusus"
                                                value={paymentPct}
                                                onChange={e => setPaymentPct(e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                </>
                            )}
                            <tr className="hover:bg-gray-50">
                                <td colSpan={8} className="bg-gray-100 border-b border-l border-r border-gray-300 px-4 py-2">
                                    <center>
                                        <h2>Penggunaan Darah</h2>
                                    </center>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Penggunanaan Darah</td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Checkbox
                                        id="darah_penggunaan"
                                        checked={penggunaanDarah}
                                        onCheckedChange={setPenggunaanDarah}
                                    />
                                </td>

                                {penggunaanDarah ? (
                                    <>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">Kantong Darah</td>
                                        <td colSpan={5} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Input
                                                id="kantong_darah_penggunaan"
                                                name="kantong_darah_penggunaan"
                                                type="number"
                                                placeholder="Masukkan Jumlah Kantong Darah"
                                                value={kantongDarahPenggunaan}
                                                onChange={e => setKantongDarahPenggunaan(e.target.value)}
                                            />
                                        </td>
                                    </>
                                ) : (
                                    <td colSpan={6} className="border-b border-l border-r border-gray-300 px-4 py-2"></td>
                                )}
                            </tr>

                            {/* Data Klinis */}
                            <tr className="hover:bg-gray-50">
                                <td colSpan={8} className="bg-gray-100 border-b border-l border-r border-gray-300 px-4 py-2">
                                    <center>
                                        <h2>Data Klinis</h2>
                                    </center>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td colSpan={2} className="border-b border-l border-r border-gray-300 px-4 py-2">Sistole</td>
                                <td colSpan={2} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        id="sistole"
                                        name="sistole"
                                        type="number"
                                        placeholder="Masukkan Data Sistole"
                                        value={dataSistole}
                                        onChange={e => setDataSistole(e.target.value)}
                                    />
                                </td>
                                <td colSpan={2} className="border-b border-l border-r border-gray-300 px-4 py-2">Diastole</td>
                                <td colSpan={2} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        id="diastole"
                                        name="diastole"
                                        type="number"
                                        placeholder="Masukkan Data Diastole"
                                        value={dataDiastole}
                                        onChange={e => setDataDiastole(e.target.value)}
                                    />
                                </td>
                            </tr>

                            {/* Diagnosa dan Procedure */}
                            <tr className="hover:bg-gray-50">
                                <td colSpan={8} className="bg-gray-100 border-b border-l border-r border-gray-300 px-4 py-2">
                                    <center>
                                        <h2>Diagnosa dan Procedure</h2>
                                    </center>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Diagnosa</td>
                                <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <div className="w-full border px-3 py-2 rounded cursor-pointer flex flex-wrap gap-2"
                                        onClick={() => setShowDiagnosaModal(true)} // Tampilkan modal saat diklik
                                    >
                                        {selectedDiagnosa.map((item, index) => (
                                            <div
                                                key={index}
                                                className="bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-2 cursor-pointer"
                                                onClick={() => {
                                                    setDiagnosaSearch(item.id); // Masukkan ID ke input pencarian
                                                    fetchDiagnosa(item.id); // Panggil fetchDiagnosa untuk memperbarui tabel
                                                    setShowDiagnosaModal(true); // Tampilkan modal
                                                }}
                                            >
                                                <span>{`${item.id} - ${item.description}`}</span> {/* Gabungkan ID dan DESKRIPSI */}
                                                <button
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Hentikan event klik badge agar tidak memicu onClick parent
                                                        setSelectedDiagnosa((prev) =>
                                                            prev.filter((_, i) => i !== index) // Hapus item berdasarkan index
                                                        );
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                        <input
                                            type="text"
                                            className="flex-1 outline-none"
                                            placeholder="Pilih Diagnosa"
                                            onClick={() => setShowDiagnosaModal(true)} // Tampilkan modal saat diklik
                                            readOnly
                                        />
                                    </div>
                                    <small className="text-red-500">* Untuk diagnosa primary pastikan pada pilihan pertama (ICD-10)</small>
                                    <br />
                                    <small className="text-red-500">* Pilih 2 kali jika diagnosa digunakan lebih dari sekali</small>
                                </td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Procedure</td>
                                <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <div className="w-full border px-3 py-2 rounded cursor-pointer flex flex-wrap gap-2"
                                        onClick={() => setShowProcedureModal(true)} // Tampilkan modal saat diklik
                                    >
                                        {selectedProcedure.map((item, index) => (
                                            <div
                                                key={index}
                                                className="bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-2 cursor-pointer"
                                                onClick={() => {
                                                    setProcedureSearch(item.id); // Masukkan ID ke input pencarian
                                                    fetchProcedure(item.id); // Panggil fetchProcedure untuk memperbarui tabel
                                                    setShowProcedureModal(true); // Tampilkan modal
                                                }}
                                            >
                                                <span>{`${item.id} - ${item.description}`}</span> {/* Gabungkan ID dan DESKRIPSI */}
                                                <button
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Hentikan event klik badge agar tidak memicu onClick parent
                                                        setSelectedProcedure((prev) =>
                                                            prev.filter((_, i) => i !== index) // Hapus item berdasarkan index
                                                        );
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                        <input
                                            type="text"
                                            className="flex-1 outline-none"
                                            placeholder="Pilih Procedure"
                                            onClick={() => setShowProcedureModal(true)} // Tampilkan modal saat diklik
                                            readOnly
                                        />
                                    </div>
                                    <small className="text-red-500">* Untuk procedure primary pastikan pada pilihan pertama (ICD-9)</small>
                                    <br />
                                    <small className="text-red-500">* Pilih 2 kali jika procedure digunakan lebih dari sekali</small>

                                </td>
                            </tr>

                            {/* TARIF RUMAH SAKIT */}
                            <tr className="hover:bg-gray-50">
                                <td colSpan={8} className="bg-gray-100 border-b border-l border-r border-gray-300 px-4 py-2">
                                    <center>
                                        <h2>Tarif Rumah Sakit</h2>
                                    </center>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Prosedur Non Bedah</td>
                                <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        id="prosedur_non_bedah"
                                        name="prosedur_non_bedah"
                                        type="text"
                                        placeholder="Masukkan Prosedur Non Bedah"
                                        value={formatRupiah(tarifProsedurNonBedah)} // Format nilai menjadi Rupiah
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
                                            if (rawValue.startsWith("0")) {
                                                rawValue = rawValue.replace(/^0+/, ""); // Hilangkan angka 0 di awal
                                            }
                                            setTarifProsedurNonBedah(rawValue); // Simpan nilai asli tanpa format
                                        }}
                                    />
                                </td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Tarif Prosedur Bedah</td>
                                <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        id="prosedur_bedah"
                                        name="prosedur_bedah"
                                        type="text"
                                        placeholder="Masukkan Prosedur Bedah"
                                        value={formatRupiah(tarifProsedurBedah)} // Format nilai menjadi Rupiah
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
                                            if (rawValue.startsWith("0")) {
                                                rawValue = rawValue.replace(/^0+/, ""); // Hilangkan angka 0 di awal
                                            }
                                            setTarifProsedurBedah(rawValue); // Simpan nilai asli tanpa format
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Tarif Konsultasi</td>
                                <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        id="tarif_konsultasi"
                                        name="tarif_konsultasi"
                                        type="text"
                                        placeholder="Masukkan Tarif Konsultasi"
                                        value={formatRupiah(tarifKonsultasi)} // Format nilai menjadi Rupiah
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
                                            if (rawValue.startsWith("0")) {
                                                rawValue = rawValue.replace(/^0+/, ""); // Hilangkan angka 0 di awal
                                            }
                                            setTarifKonsultasi(rawValue); // Simpan nilai asli tanpa format
                                        }}
                                    />
                                </td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Tarif Tenaga Ahli</td>
                                <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        id="tarif_tenaga_ahli"
                                        name="tarif_tenaga_ahli"
                                        type="text"
                                        placeholder="Masukkan Tarif Tenaga Ahli"
                                        value={formatRupiah(tarifTenagaAhli)} // Format nilai menjadi Rupiah
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
                                            if (rawValue.startsWith("0")) {
                                                rawValue = rawValue.replace(/^0+/, ""); // Hilangkan angka 0 di awal
                                            }
                                            setTarifTenagaAhli(rawValue); // Simpan nilai asli tanpa format
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Tarif Keperawatan</td>
                                <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        id="tarif_keperawatan"
                                        name="tarif_keperawatan"
                                        type="text"
                                        placeholder="Masukkan Tarif Keperawatan"
                                        value={formatRupiah(tarifKeperawatan)} // Format nilai menjadi Rupiah
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
                                            if (rawValue.startsWith("0")) {
                                                rawValue = rawValue.replace(/^0+/, ""); // Hilangkan angka 0 di awal
                                            }
                                            setTarifKeperawatan(rawValue); // Simpan nilai asli tanpa format
                                        }}
                                    />
                                </td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Tarif Penunjang</td>
                                <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        id="tarif_penunjang"
                                        name="tarif_penunjang"
                                        type="text"
                                        placeholder="Masukkan Tarif Penunjang"
                                        value={formatRupiah(tarifPenunjang)} // Format nilai menjadi Rupiah
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
                                            if (rawValue.startsWith("0")) {
                                                rawValue = rawValue.replace(/^0+/, ""); // Hilangkan angka 0 di awal
                                            }
                                            setTarifPenunjang(rawValue); // Simpan nilai asli tanpa format
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Tarif Radiologi</td>
                                <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        id="tarif_radiologi"
                                        name="tarif_radiologi"
                                        type="text"
                                        placeholder="Masukkan Tarif Radiologi"
                                        value={formatRupiah(tarifRadiologi)} // Format nilai menjadi Rupiah
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
                                            if (rawValue.startsWith("0")) {
                                                rawValue = rawValue.replace(/^0+/, ""); // Hilangkan angka 0 di awal
                                            }
                                            setTarifRadiologi(rawValue); // Simpan nilai asli tanpa format
                                        }}
                                    />
                                </td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Tarif Laboratorium</td>
                                <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        id="tarif_laboratorium"
                                        name="tarif_laboratorium"
                                        type="text"
                                        placeholder="Masukkan Tarif Laboratorium"
                                        value={formatRupiah(tarifLaboratorium)} // Format nilai menjadi Rupiah
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
                                            if (rawValue.startsWith("0")) {
                                                rawValue = rawValue.replace(/^0+/, ""); // Hilangkan angka 0 di awal
                                            }
                                            setTarifLaboratorium(rawValue); // Simpan nilai asli tanpa format
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Tarif Pelayanan Darah</td>
                                <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        id="tarif_pelayanan_darah"
                                        name="tarif_pelayanan_darah"
                                        type="text"
                                        placeholder="Masukkan Tarif Pelayanan Darah"
                                        value={formatRupiah(tarifPelayananDarah)} // Format nilai menjadi Rupiah
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
                                            if (rawValue.startsWith("0")) {
                                                rawValue = rawValue.replace(/^0+/, ""); // Hilangkan angka 0 di awal
                                            }
                                            setTarifPelayananDarah(rawValue); // Simpan nilai asli tanpa format
                                        }}
                                    />
                                </td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Tarif Rehabilitasi</td>
                                <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        id="tarif_rehabilitasi"
                                        name="tarif_rehabilitasi"
                                        type="text"
                                        placeholder="Masukkan Tarif Rehabilitasi"
                                        value={formatRupiah(tarifRehabilitasi)} // Format nilai menjadi Rupiah
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
                                            if (rawValue.startsWith("0")) {
                                                rawValue = rawValue.replace(/^0+/, ""); // Hilangkan angka 0 di awal
                                            }
                                            setTarifRehabilitasi(rawValue); // Simpan nilai asli tanpa format
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Tarif Kamar</td>
                                <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        id="tarif_kamar"
                                        name="tarif_kamar"
                                        type="text"
                                        placeholder="Masukkan Tarif Kamar"
                                        value={formatRupiah(tarifKamar)} // Format nilai menjadi Rupiah
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
                                            if (rawValue.startsWith("0")) {
                                                rawValue = rawValue.replace(/^0+/, ""); // Hilangkan angka 0 di awal
                                            }
                                            setTarifKamar(rawValue); // Simpan nilai asli tanpa format
                                        }}
                                    />
                                </td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Tarif Rawat Intensif</td>
                                <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        id="tarif_rawat_intensif"
                                        name="tarif_rawat_intensif"
                                        type="text"
                                        placeholder="Masukkan Tarif Rawat Intensif"
                                        value={formatRupiah(tarifRawatIntensif)} // Format nilai menjadi Rupiah
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
                                            if (rawValue.startsWith("0")) {
                                                rawValue = rawValue.replace(/^0+/, ""); // Hilangkan angka 0 di awal
                                            }
                                            setTarifRawatIntensif(rawValue); // Simpan nilai asli tanpa format
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Tarif Obat</td>
                                <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        id="tarif_obat"
                                        name="tarif_obat"
                                        type="text"
                                        placeholder="Masukkan Tarif Obat"
                                        value={formatRupiah(tarifObat)} // Format nilai menjadi Rupiah
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
                                            if (rawValue.startsWith("0")) {
                                                rawValue = rawValue.replace(/^0+/, ""); // Hilangkan angka 0 di awal
                                            }
                                            setTarifObat(rawValue); // Simpan nilai asli tanpa format
                                        }}
                                    />
                                </td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Tarif Obat Kronis</td>
                                <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        id="tarif_obat_kronis"
                                        name="tarif_obat_kronis"
                                        type="text"
                                        placeholder="Masukkan Tarif Obat Kronis"
                                        value={formatRupiah(tarifObatKronis)} // Format nilai menjadi Rupiah
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
                                            if (rawValue.startsWith("0")) {
                                                rawValue = rawValue.replace(/^0+/, ""); // Hilangkan angka 0 di awal
                                            }
                                            setTarifObatKronis(rawValue); // Simpan nilai asli tanpa format
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Tarif Obat Kemoterapi</td>
                                <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        id="tarif_obat_kemoterapi"
                                        name="tarif_obat_kemoterapi"
                                        type="text"
                                        placeholder="Masukkan Tarif Obat Kemoterapi"
                                        value={formatRupiah(tarifObatKemoterapi)} // Format nilai menjadi Rupiah
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
                                            if (rawValue.startsWith("0")) {
                                                rawValue = rawValue.replace(/^0+/, ""); // Hilangkan angka 0 di awal
                                            }
                                            setTarifObatKemoterapi(rawValue); // Simpan nilai asli tanpa format
                                        }}
                                    />
                                </td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Tarif Alkes</td>
                                <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        id="tarif_alkes"
                                        name="tarif_alkes"
                                        type="text"
                                        placeholder="Masukkan Tarif Alkes"
                                        value={formatRupiah(tarifAlkes)} // Format nilai menjadi Rupiah
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
                                            if (rawValue.startsWith("0")) {
                                                rawValue = rawValue.replace(/^0+/, ""); // Hilangkan angka 0 di awal
                                            }
                                            setTarifAlkes(rawValue); // Simpan nilai asli tanpa format
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Tarif BMHP</td>
                                <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        id="tarif_bmhp"
                                        name="tarif_bmhp"
                                        type="text"
                                        placeholder="Masukkan Tarif BMHP"
                                        value={formatRupiah(tarifBMHP)} // Format nilai menjadi Rupiah
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
                                            if (rawValue.startsWith("0")) {
                                                rawValue = rawValue.replace(/^0+/, ""); // Hilangkan angka 0 di awal
                                            }
                                            setTarifBMHP(rawValue); // Simpan nilai asli tanpa format
                                        }}
                                    />
                                </td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Tarif Sewa Alat</td>
                                <td colSpan={3} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        id="tarif_sewa_alat"
                                        name="tarif_sewa_alat"
                                        type="text"
                                        placeholder="Masukkan Tarif Sewa Alat"
                                        value={formatRupiah(tarifSewaAlat)} // Format nilai menjadi Rupiah
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
                                            if (rawValue.startsWith("0")) {
                                                rawValue = rawValue.replace(/^0+/, ""); // Hilangkan angka 0 di awal
                                            }
                                            setTarifSewaAlat(rawValue); // Simpan nilai asli tanpa format
                                        }}
                                    />
                                </td>
                            </tr>

                            {/* Persalinan */}
                            <tr className="hover:bg-gray-50">
                                <td colSpan={8} className="bg-gray-100 border-b border-l border-r border-gray-300 px-4 py-2">
                                    <center>
                                        <h2>Persalinan</h2>
                                    </center>
                                </td>
                            </tr>

                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    Usia Persalinan
                                </td>
                                <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        type="number"
                                        placeholder="Masukan Usia Persalinan"
                                        value={usiaPersalinan}
                                        onChange={(e) => setUsiaPersalinan(e.target.value)}
                                    />
                                </td>
                            </tr>

                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    Gravida
                                </td>
                                <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        type="number"
                                        placeholder="Masukan Gravida"
                                        value={gravida}
                                        onChange={(e) => setGravida(e.target.value)}
                                    />
                                </td>
                            </tr>

                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    Partus
                                </td>
                                <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        type="number"
                                        placeholder="Masukan Partus"
                                        value={partus}
                                        onChange={(e) => setPartus(e.target.value)}
                                    />
                                </td>
                            </tr>

                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    Abortus
                                </td>
                                <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        type="number"
                                        placeholder="Masukan Abortus"
                                        value={abortus}
                                        onChange={(e) => setAbortus(e.target.value)}
                                    />
                                </td>
                            </tr>

                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    Onset Kontraksi
                                </td>
                                <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <SearchableDropdown
                                        data={listOnsetKontraksi}
                                        value={onsetKontraksi}
                                        setValue={setOnsetKontraksi}
                                        placeholder="Pilih Onset Kontraksi"
                                        getOptionLabel={(item) => item.DESKRIPSI}
                                        getOptionValue={(item) => item.ID}
                                    />
                                </td>
                            </tr>

                            <tr className="hover:bg-gray-50">
                                <td colSpan={8} className="border-b border-l border-r border-gray-300 px-4 py-2 font-bold">
                                    Delivery
                                    <span className="float-right">
                                        <Button
                                            className="bg-blue-500 text-white hover:bg-blue-600"
                                            onClick={addDeliveryForm} // Tambahkan form baru
                                        >
                                            <PlusCircle size={24} className="h-4 w-4" />
                                        </Button>
                                    </span>
                                </td>
                            </tr>
                            {Object.entries(deliveryForms).map(([id, form]) => (
                                <>
                                    <tr key={`${id}-judul`} className="bg-blue-50">
                                        <td colSpan={8} className="bg-gray-100 border-b border-l border-r border-gray-300 px-4 py-2">
                                            Form Kelahiran
                                            <span className="float-right">
                                                <Button
                                                    className="bg-red-500 text-white hover:bg-red-600"
                                                    onClick={() => removeDeliveryForm(id)} // Hapus form
                                                >
                                                    ✕
                                                </Button>
                                            </span>
                                        </td>
                                    </tr>
                                    <tr key={id} className="bg-blue-50">
                                        <td colSpan={1} className="border-b border-l border-r border-gray-300 px-4 py-2">Kelahiran ke</td>
                                        <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Input
                                                type="number"
                                                placeholder="Masukkan Kelahiran ke"
                                                value={form.delivery_sequence}
                                                onChange={(e) => updateDeliveryForm(id, "delivery_sequence", e.target.value)} // Perbarui metode kelahiran
                                            />
                                        </td>
                                    </tr>

                                    <tr key={`${id}-method`} className="bg-blue-50">
                                        <td colSpan={1} className="border-b border-l border-r border-gray-300 px-4 py-2">Jenis Kelahiran</td>
                                        <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <SearchableDropdown
                                                data={[
                                                    { ID: "vaginal", DESKRIPSI: "Normal" },
                                                    { ID: "sc", DESKRIPSI: "Operasi Caesar" },
                                                ]}
                                                value={form.delivery_method}
                                                setValue={(value) => updateDeliveryForm(id, "delivery_method", value)}
                                                placeholder="Pilih Jenis Kelahiran"
                                                getOptionLabel={(item) => item.DESKRIPSI}
                                                getOptionValue={(item) => item.ID}
                                            />
                                        </td>
                                    </tr>

                                    <tr key={`${id}-dttm`} className="bg-blue-50">
                                        <td colSpan={1} className="border-b border-l border-r border-gray-300 px-4 py-2">Tanggal & Waktu Kelahiran</td>
                                        <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Input
                                                type="datetime-local"
                                                placeholder="Masukkan Tanggal & Waktu Kelahiran"
                                                value={form.delivery_dttm}
                                                onChange={(e) => updateDeliveryForm(id, "delivery_dttm", e.target.value)} // Perbarui tanggal & waktu kelahiran
                                            />
                                        </td>
                                    </tr>

                                    <tr key={`${id}-letak_janin`} className="bg-blue-50">
                                        <td colSpan={1} className="border-b border-l border-r border-gray-300 px-4 py-2">Letak Janin</td>
                                        <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <SearchableDropdown
                                                data={[
                                                    { ID: "kepala", DESKRIPSI: "Kepala" },
                                                    { ID: "sungsang", DESKRIPSI: "Sungsang" },
                                                    { ID: "lintang", DESKRIPSI: "Lintang" },
                                                ]}
                                                value={form.letak_janin}
                                                setValue={(value) => updateDeliveryForm(id, "letak_janin", value)}
                                                placeholder="Pilih Letak Janin"
                                                getOptionLabel={(item) => item.DESKRIPSI}
                                                getOptionValue={(item) => item.ID}
                                            />
                                        </td>
                                    </tr>

                                    <tr key={`${id}-lahir_bantuan_manual`} className="bg-blue-50">
                                        <td colSpan={1} className="border-b border-l border-r border-gray-300 px-4 py-2">Bantuan Manual</td>
                                        <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <SearchableDropdown
                                                data={[
                                                    { ID: 1, DESKRIPSI: "Ya" },
                                                    { ID: 0, DESKRIPSI: "Tidak" },
                                                ]}
                                                value={form.use_manual}
                                                setValue={(value) => updateDeliveryForm(id, "use_manual", value)}
                                                placeholder="Pilih Lahir dengan bantuan manual"
                                                getOptionLabel={(item) => item.DESKRIPSI}
                                                getOptionValue={(item) => item.ID}
                                            />
                                        </td>
                                    </tr>

                                    <tr key={`${id}-penggunaan_forcep`} className="bg-blue-50">
                                        <td colSpan={1} className="border-b border-l border-r border-gray-300 px-4 py-2">Penggunaan Forcep</td>
                                        <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <SearchableDropdown
                                                data={[
                                                    { ID: 1, DESKRIPSI: "Ya" },
                                                    { ID: 0, DESKRIPSI: "Tidak" },
                                                ]}
                                                value={form.use_forcep}
                                                setValue={(value) => updateDeliveryForm(id, "use_forcep", value)}
                                                placeholder="Pilih Penggunaan Forcep"
                                                getOptionLabel={(item) => item.DESKRIPSI}
                                                getOptionValue={(item) => item.ID}
                                            />
                                        </td>
                                    </tr>

                                    <tr key={`${id}-penggunaan_vacuum`} className="bg-blue-50">
                                        <td colSpan={1} className="border-b border-l border-r border-gray-300 px-4 py-2">Penggunaan Vacuum</td>
                                        <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <SearchableDropdown
                                                data={[
                                                    { ID: 1, DESKRIPSI: "Ya" },
                                                    { ID: 0, DESKRIPSI: "Tidak" },
                                                ]}
                                                value={form.use_vacuum}
                                                setValue={(value) => updateDeliveryForm(id, "use_vacuum", value)}
                                                placeholder="Pilih Penggunaan Vacuum"
                                                getOptionLabel={(item) => item.DESKRIPSI}
                                                getOptionValue={(item) => item.ID}
                                            />
                                        </td>
                                    </tr>

                                    <tr key={`${id}-shk_diambil`} className="bg-blue-50">
                                        <td colSpan={1} className="border-b border-l border-r border-gray-300 px-4 py-2">Sampel Darah</td>
                                        <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <SearchableDropdown
                                                data={[
                                                    { ID: "ya", DESKRIPSI: "Ya" },
                                                    { ID: "tidak", DESKRIPSI: "Tidak" },
                                                ]}
                                                value={form.shk_spesimen_ambil}
                                                setValue={(value) => updateDeliveryForm(id, "shk_spesimen_ambil", value)}
                                                placeholder="Pilih Sampel Darah diambil"
                                                getOptionLabel={(item) => item.DESKRIPSI}
                                                getOptionValue={(item) => item.ID}
                                            />
                                        </td>
                                    </tr>

                                    <tr key={`${id}-lokasi_shk_diambil`} className="bg-blue-50">
                                        <td colSpan={1} className="border-b border-l border-r border-gray-300 px-4 py-2">Lokasi Pengambilan</td>
                                        <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <SearchableDropdown
                                                data={[
                                                    { ID: "tumit", DESKRIPSI: "Tumit" },
                                                    { ID: "vena", DESKRIPSI: "Vena" },
                                                ]}
                                                value={form.shk_lokasi}
                                                setValue={(value) => updateDeliveryForm(id, "shk_lokasi", value)}
                                                placeholder="Pilih Lokasi Pengambilan"
                                                getOptionLabel={(item) => item.DESKRIPSI}
                                                getOptionValue={(item) => item.ID}
                                            />
                                        </td>
                                    </tr>

                                    <tr key={`${id}-alasan_shk_diambil`} className="bg-blue-50">
                                        <td colSpan={1} className="border-b border-l border-r border-gray-300 px-4 py-2">Alasan Pengambilan</td>
                                        <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <SearchableDropdown
                                                data={[
                                                    { ID: "tidak-dapat", DESKRIPSI: "Tidak Dapat" },
                                                    { ID: "akses-sulit", DESKRIPSI: "Akses Sulit" },
                                                ]}
                                                value={form.shk_alasan}
                                                setValue={(value) => updateDeliveryForm(id, "shk_alasan", value)}
                                                placeholder="Pilih Alasan Pengambilan"
                                                getOptionLabel={(item) => item.DESKRIPSI}
                                                getOptionValue={(item) => item.ID}
                                            />
                                        </td>
                                    </tr>

                                    <tr key={`${id}-shk_spesimen_dttm`} className="bg-blue-50">
                                        <td colSpan={1} className="border-b border-l border-r border-gray-300 px-4 py-2">Tanggal Pengambilan</td>
                                        <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Input
                                                type="datetime-local"
                                                placeholder="Masukkan Tanggal & Waktu Pengambilan Darah"
                                                value={form.shk_spesimen_dttm}
                                                onChange={(e) => updateDeliveryForm(id, "shk_spesimen_dttm", e.target.value)} // Perbarui tanggal & waktu kelahiran
                                            />
                                        </td>
                                    </tr>
                                </>
                            ))}
                            {/* Poli Eksekutif */}
                            <tr className="hover:bg-gray-50">
                                <td colSpan={8} className="bg-gray-100 border-b border-l border-r border-gray-300 px-4 py-2">
                                    <center>
                                        <h2>Poli Eksekutif</h2>
                                    </center>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Pasien Poli Eksekutif</td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Checkbox
                                        id="ada_ventilator"
                                        checked={poliEksekutif}
                                        onCheckedChange={setPoliEksekutif}
                                    />
                                </td>
                                <td colSpan={6} className="border-b border-l border-r border-gray-300 px-4 py-2"></td>
                            </tr>
                            {poliEksekutif && (
                                <tr className="hover:bg-gray-50">
                                    <td colSpan={2} className="border-b border-l border-r border-gray-300 px-4 py-2">Nama Dokter Poli Eksekutif</td>
                                    <td colSpan={2} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        <Input
                                            id="nama_dokter_poli_eksekutif"
                                            name="nama_dokter_poli_eksekutif"
                                            type="text"
                                            placeholder="Masukkan Nama Dokter Poli Eksekutif"
                                            value={namaDokterPoliEksekutif}
                                            onChange={(e) => setNamaDokterPoliEksekutif(e.target.value)}
                                        />
                                    </td>
                                    <td colSpan={2} className="border-b border-l border-r border-gray-300 px-4 py-2">Tarif Poli Eksekutif</td>
                                    <td colSpan={2} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                        <Input
                                            id="tarif_poli_eksekutif"
                                            name="tarif_poli_eksekutif"
                                            type="text"
                                            placeholder="Masukkan Tarif Poli Eksekutif"
                                            value={formatRupiah(tarifPoliEksekutif)} // Format nilai menjadi Rupiah
                                            onChange={(e) => {
                                                let rawValue = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
                                                if (rawValue.startsWith("0")) {
                                                    rawValue = rawValue.replace(/^0+/, ""); // Hilangkan angka 0 di awal
                                                }
                                                setTarifPoliEksekutif(rawValue); // Simpan nilai asli tanpa format
                                            }}
                                        />
                                    </td>
                                </tr>
                            )}

                            {/* Apgar Score */}
                            <tr className="hover:bg-gray-50">
                                <td colSpan={8} className="bg-gray-100 border-b border-l border-r border-gray-300 px-4 py-2">
                                    <center>
                                        <h2>Apgar Score</h2>
                                    </center>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td colSpan={8} className="border-b border-l border-r border-gray-300 px-4 py-2 font-bold">Menit 1</td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    Apparance
                                </td>
                                <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        type="number"
                                        placeholder="Masukan Apparance"
                                        value={apgarApparance1}
                                        onChange={(e) => setApgarApparance1(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    Pulse
                                </td>
                                <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        type="number"
                                        placeholder="Masukan Pulse"
                                        value={apgarPulse1}
                                        onChange={(e) => setApgarPulse1(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    Grimace
                                </td>
                                <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        type="number"
                                        placeholder="Masukan Grimace"
                                        value={apgarGrimace1}
                                        onChange={(e) => setApgarGrimace1(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    Activity
                                </td>
                                <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        type="number"
                                        placeholder="Masukan Activity"
                                        value={apgarActivity1}
                                        onChange={(e) => setApgarActivity1(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    Respiration
                                </td>
                                <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        type="number"
                                        placeholder="Masukan Respiration"
                                        value={apgarRespiration1}
                                        onChange={(e) => setApgarRespiration1(e.target.value)}
                                    />
                                </td>
                            </tr>

                            <tr className="hover:bg-gray-50">
                                <td colSpan={8} className="border-b border-l border-r border-gray-300 px-4 py-2 font-bold">Menit 5</td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    Apparance
                                </td>
                                <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        type="number"
                                        placeholder="Masukan Apparance"
                                        value={apgarApparance5}
                                        onChange={(e) => setApgarApparance5(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    Pulse
                                </td>
                                <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        type="number"
                                        placeholder="Masukan Pulse"
                                        value={apgarPulse5}
                                        onChange={(e) => setApgarPulse5(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    Grimace
                                </td>
                                <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        type="number"
                                        placeholder="Masukan Grimace"
                                        value={apgarGrimace5}
                                        onChange={(e) => setApgarGrimace5(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    Activity
                                </td>
                                <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        type="number"
                                        placeholder="Masukan Activity"
                                        value={apgarActivity5}
                                        onChange={(e) => setApgarActivity5(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    Respiration
                                </td>
                                <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Input
                                        type="number"
                                        placeholder="Masukan Respiration"
                                        value={apgarRespiration5}
                                        onChange={(e) => setApgarRespiration5(e.target.value)}
                                    />
                                </td>
                            </tr>

                            {/* Hemodialisa */}
                            <tr className="hover:bg-gray-50">
                                <td colSpan={8} className="bg-gray-100 border-b border-l border-r border-gray-300 px-4 py-2">
                                    <center>
                                        <h2>Hemodialisa</h2>
                                    </center>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Dializer</td>
                                <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <SearchableDropdown
                                        data={listPenggunaanHemodialisa}
                                        value={hemodialisa}
                                        setValue={setHemodialisa}
                                        placeholder="Pilih Dializer"
                                        getOptionLabel={(item) => item.DESKRIPSI}
                                        getOptionValue={(item) => item.ID}
                                    />
                                </td>
                            </tr>

                            {/* Covid 19 */}
                            <tr className="hover:bg-gray-50">
                                <td colSpan={8} className="bg-gray-100 border-b border-l border-r border-gray-300 px-4 py-2">
                                    <center>
                                        <h2>COVID-19</h2>
                                    </center>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Pasien COVID-19</td>
                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                    <Checkbox
                                        id="ada_ventilator"
                                        checked={covid19StatusCD}
                                        onCheckedChange={setCovid19StatusCD}
                                    />
                                </td>
                                <td colSpan={6} className="border-b border-l border-r border-gray-300 px-4 py-2"></td>
                            </tr>

                            {covid19StatusCD && (
                                <>
                                    <tr className="hover:bg-gray-50">
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">Kartu</td>
                                        <td colSpan={2} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <SearchableDropdown
                                                data={listCovidKartuPenjamin}
                                                value={covidKartuPenjamin}
                                                setValue={setCovidKartuPenjamin}
                                                placeholder="Pilih Penjamin"
                                                getOptionLabel={(item) => item.DESKRIPSI}
                                                getOptionValue={(item) => item.ID}
                                            />
                                        </td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">Nomor Kartu</td>
                                        <td colSpan={4} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Input
                                                id="nomor_kartu"
                                                name="nomor_kartu"
                                                type="text"
                                                placeholder="Masukkan Nomor Kartu"
                                                value={nomorKartuPenjamin}
                                                onChange={(e) => setNomorKartuPenjamin(e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">Episode</td>
                                        <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            {covidEpisodesList.map((item, index) => (
                                                <div key={index} className="flex items-center gap-2 mb-2">
                                                    <SearchableDropdown
                                                        data={listEpisodeCovid}
                                                        value={item.episode}
                                                        setValue={(value) => updateCovidEpisode(index, "episode", value)}
                                                        placeholder="Pilih Episode Covid"
                                                        getOptionLabel={(item) => (item && item.DESKRIPSI ? item.DESKRIPSI : "")}
                                                        getOptionValue={(item) => (item && item.ID ? item.ID : "")}
                                                    />
                                                    <Input
                                                        id={`episode_hari_${index}`}
                                                        name={`episode_hari_${index}`}
                                                        type="text"
                                                        placeholder="Masukkan Hari"
                                                        value={item.hari}
                                                        onChange={(e) => updateCovidEpisode(index, "hari", e.target.value)}
                                                    />
                                                    {covidEpisodesList.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="text-red-500 hover:text-red-700"
                                                            onClick={() => removeCovidEpisode(index)}
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="text-green-500 hover:text-green-700"
                                                        onClick={() => addCovidEpisode(index)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">Complexity</td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Checkbox
                                                id="ada_ventilator"
                                                checked={covid19CCIndonesia}
                                                onCheckedChange={setCovid19CCIndonesia}
                                            />
                                        </td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">RS Darurat</td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Checkbox
                                                id="ada_ventilator"
                                                checked={covid19RsDaruratIndonesia}
                                                onCheckedChange={setCovid19RsDaruratIndonesia}
                                            />
                                        </td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">Isolasi Mandiri</td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Checkbox
                                                id="ada_ventilator"
                                                checked={covidIsoman}
                                                onCheckedChange={setCovidIsoman}
                                            />
                                        </td>
                                        <td colSpan={2} className="border-b border-l border-r border-gray-300 px-4 py-2"></td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">Co-Insiden</td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Checkbox
                                                id="ada_ventilator"
                                                checked={covid19COInsidenseIndonesia}
                                                onCheckedChange={setCovid19InsidenseIndonesia}
                                            />
                                        </td>
                                        {
                                            covid19COInsidenseIndonesia ? (
                                                <>
                                                    <td className="border-b border-l border-r border-gray-300 px-4 py-2">SEP Covid</td>
                                                    <td colSpan={5} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                                        <Input
                                                            id="ada_ventilator"
                                                            type="text"
                                                            placeholder="Masukan Nomor SEP Covid"
                                                            value={covid19COinsidenseSEP}
                                                            onChange={(e) => setCovid19COinsidenseSEP(e.target.value)}
                                                        />
                                                    </td>
                                                </>
                                            ) : (
                                                <td colSpan={6} className="border-b border-l border-r border-gray-300 px-4 py-2"></td>

                                            )
                                        }
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">Terapi Kovalen</td>
                                        <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Input
                                                id="terapi_kovalen"
                                                type="text"
                                                placeholder="Masukan Jumlah Kantong"
                                                value={covidTerapiKovalen}
                                                onChange={(e) => setCovidTerapiKovalen(e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">Kelahiran Bayi</td>
                                        <td colSpan={7} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <SearchableDropdown
                                                data={listCovidBayiLahirStatus}
                                                value={covidBayiLahirStatus}
                                                setValue={setCovidBayiLahirStatus}
                                                placeholder="Pilih Episode Covid"
                                                getOptionLabel={(item) => (item && item.DESKRIPSI ? item.DESKRIPSI : "")}
                                                getOptionValue={(item) => (item && item.ID ? item.ID : "")}
                                            />
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">Asam Laktat</td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Checkbox
                                                id="asam_laktat"
                                                checked={covidLabAsamLaktat}
                                                onCheckedChange={setCovidLabAsamLaktat}
                                            />
                                        </td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">Procalcitonin</td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Checkbox
                                                id="procalcitonin"
                                                checked={covidLabProcalcitonin}
                                                onCheckedChange={setCovidLabProcalcitonin}
                                            />
                                        </td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">CRP</td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Checkbox
                                                id="CRP"
                                                checked={covidLabCRP}
                                                onCheckedChange={setCovidLabCRP}
                                            />
                                        </td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">Kultur MO</td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Checkbox
                                                id=" Kultur_mo"
                                                checked={covidLabKultur}
                                                onCheckedChange={setCovidLabKultur}
                                            />
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">D Dimer</td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Checkbox
                                                id="dimer"
                                                checked={covidLabDDimer}
                                                onCheckedChange={setCovidLabDDimer}
                                            />
                                        </td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">PT</td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Checkbox
                                                id="pt"
                                                checked={covidLabPT}
                                                onCheckedChange={setCovidLabPT}
                                            />
                                        </td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">APTT</td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Checkbox
                                                id="APTT"
                                                checked={covidLabAPTT}
                                                onCheckedChange={setCovidLabAPTT}
                                            />
                                        </td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">Pendarahan</td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Checkbox
                                                id=" pendarahan"
                                                checked={covidLabWaktuPendarahan}
                                                onCheckedChange={setCovidLabWaktuPendarahan}
                                            />
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">Anti HIV</td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Checkbox
                                                id="procalcitonin"
                                                checked={covidLabAntiHIV}
                                                onCheckedChange={setCovidLabAntiHIV}
                                            />
                                        </td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">Analisa Gas</td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Checkbox
                                                id="analisa_gas"
                                                checked={covidLabAnalisaGas}
                                                onCheckedChange={setCovidLabAnalisaGas}
                                            />
                                        </td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">Albumin</td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Checkbox
                                                id=" albumin"
                                                checked={covidLabAlbumin}
                                                onCheckedChange={setCovidLabAlbumin}
                                            />
                                        </td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">Thorax AP/PA</td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Checkbox
                                                id="asam_laktat"
                                                checked={covidRadThoraxApPA}
                                                onCheckedChange={setCovidRadThoraxApPA}
                                            />
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">Pasien Meninggal</td>
                                        <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                            <Checkbox
                                                id="ada_ventilator"
                                                checked={pasienMeninggal}
                                                onCheckedChange={setPasienMeninggal}
                                            />
                                        </td>
                                        <td colSpan={6} className="border-b border-l border-r border-gray-300 px-4 py-2"></td>
                                    </tr>

                                    {pasienMeninggal && (
                                        <>
                                            <tr className="hover:bg-gray-50">
                                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Pemulasaran Jenazah</td>
                                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                                    <Checkbox
                                                        id="pemulasaran_jenazah"
                                                        checked={pemulasaranJenazah}
                                                        onCheckedChange={setPemulasaranJenazah}
                                                    />
                                                </td>
                                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Kantong Jenazah</td>
                                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                                    <Checkbox
                                                        id="kantong_jenazah"
                                                        checked={kantongJenazah}
                                                        onCheckedChange={setKantongJenazah}
                                                    />
                                                </td>
                                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Peti Jenazah</td>
                                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                                    <Checkbox
                                                        id="peti_jenazah"
                                                        checked={petiJenazah}
                                                        onCheckedChange={setPetiJenazah}
                                                    />
                                                </td>
                                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Plastik Erat</td>
                                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                                    <Checkbox
                                                        id="plastik_erat"
                                                        checked={plastikErat}
                                                        onCheckedChange={setPlastikErat}
                                                    />
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50">
                                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Disinfektan Jenazah</td>
                                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                                    <Checkbox
                                                        id="disinfektan_jenazah"
                                                        checked={disinfektanJenazah}
                                                        onCheckedChange={setDisinfektanJenazah}
                                                    />
                                                </td>
                                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">Mobil Jenazah</td>
                                                <td className="border-b border-l border-r border-gray-300 px-4 py-2">
                                                    <Checkbox
                                                        id="mobil_jenazah"
                                                        checked={mobilJenazah}
                                                        onCheckedChange={setMobilJenazah}
                                                    />
                                                </td>
                                                <td colSpan={2} className="border-b border-l border-r border-gray-300 px-4 py-2">Disinfektan Mobil Jenazah</td>
                                                <td colSpan={2} className="border-b border-l border-r border-gray-300 px-4 py-2">
                                                    <Checkbox
                                                        id="disinfektan_mobil_jenazah"
                                                        checked={disinfektanMobilJenazah}
                                                        onCheckedChange={setDisinfektanMobilJenazah}
                                                    />
                                                </td>

                                            </tr>
                                        </>
                                    )}
                                </>
                            )}



                        </tbody>
                    </table>
                </div>
                {/* Konten lainnya bisa ditambahkan di sini */}

                <ModalUpload
                    open={showUpload}
                    onClose={() => setShowUpload(false)}
                    uploadUrl={uploadUrl}
                    onSuccess={(res) => { /* handle sukses */ }}
                    title="Upload Dokumen"
                    description="Pilih file yang akan diupload."
                />

                {/* Modal untuk Preview PDF */}
                {previewPDF && (berkasKlaimUrl || previewSEPData) && (
                    <div
                        className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-auto py-6"
                        onClick={() => {
                            setPreviewPDF(false)
                            setBerkasKlaimUrl(null);
                        }} // Tutup modal jika klik di luar
                    >
                        <div
                            className="bg-transparent rounded-lg shadow-lg w-full h-full max-w-7xl relative"
                            onClick={(e) => e.stopPropagation()} // Hentikan propagasi klik agar tidak menutup modal
                        >
                            {previewSEPData ? (
                                <iframe
                                    src={previewSEPData}
                                    className="border rounded w-full h-full"
                                ></iframe>
                            ) : berkasKlaimUrl ? (
                                <iframe
                                    src={berkasKlaimUrl}
                                    className="border rounded w-full h-full"
                                ></iframe>
                            ) : (
                                <p>Loading PDF...</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {
                showDiagnosaModal && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-auto">
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-7xl p-0 relative mt-10">
                            <div className="p-4 border-b">
                                <h2 className="text-lg font-semibold">Pilih Diagnosa</h2>
                                <button
                                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowDiagnosaModal(false)}
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-4">
                                <Input
                                    type="text"
                                    className="w-full mb-4"
                                    placeholder="Cari Diagnosa"
                                    value={diagnosaSearch} // Tampilkan ID dari badge yang diklik
                                    autoFocus={true}
                                    onChange={(e) => {
                                        setDiagnosaSearch(e.target.value); // Perbarui pencarian
                                        fetchDiagnosa(e.target.value); // Panggil fetchDiagnosa untuk memperbarui tabel
                                    }}
                                />
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {selectedDiagnosa.map((item, index) => (
                                        <div
                                            key={`${item.id}-${index}`} // Gunakan kombinasi id dan index untuk memastikan key unik
                                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-2 cursor-pointer"
                                            onClick={() => {
                                                setDiagnosaSearch(item.id); // Masukkan ID ke input pencarian
                                                fetchDiagnosa(item.id); // Panggil fetchDiagnosa untuk memperbarui tabel
                                            }}
                                        >
                                            <span>{`${item.id} - ${item.description}`}</span>
                                            <button
                                                className="text-red-500 hover:text-red-700"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Hentikan event klik badge agar tidak memicu onClick parent
                                                    setSelectedDiagnosa((prev) =>
                                                        prev.filter((_, i) => i !== index) // Hapus item berdasarkan index
                                                    );
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <table className="w-full border border-gray-300 rounded-lg">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="border-b border-gray-300 px-4 py-2 text-left">ID</th>
                                            <th className="border-b border-gray-300 px-4 py-2 text-left">Deskripsi</th>
                                            <th className="border-b border-gray-300 px-4 py-2 text-left">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(diagnosaOptions) && diagnosaOptions.length > 0 ? (
                                            diagnosaOptions.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="border-b border-gray-300 px-4 py-2">{item[1]}</td>
                                                    <td className="border-b border-gray-300 px-4 py-2">{item[0]}</td>
                                                    <td className="border-b border-gray-300 px-4 py-2">
                                                        <button
                                                            className="text-blue-500 hover:underline"
                                                            onClick={() => {
                                                                setSelectedDiagnosa((prev) => [
                                                                    ...prev,
                                                                    { id: item[1], description: item[0] }, // Tambahkan item baru tanpa memeriksa duplikasi
                                                                ]);
                                                            }}
                                                        >
                                                            Tambah
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="border-b border-gray-300 px-4 py-2 text-center">
                                                    Tidak ada data diagnosa.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t">
                                <button
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    onClick={() => setShowDiagnosaModal(false)} // Tutup modal
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showProcedureModal && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-auto">
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-7xl p-0 relative mt-10">
                            <div className="p-4 border-b">
                                <h2 className="text-lg font-semibold">Pilih Procedure</h2>
                                <button
                                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowProcedureModal(false)}
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-4">
                                <Input
                                    type="text"
                                    className="w-full mb-4"
                                    placeholder="Cari Procedure"
                                    value={procedureSearch} // Tampilkan ID dari badge yang diklik
                                    autoFocus={true}
                                    onChange={(e) => {
                                        setProcedureSearch(e.target.value); // Perbarui pencarian
                                        fetchProcedure(e.target.value); // Panggil fetchProcedure untuk memperbarui tabel
                                    }}
                                />
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {selectedProcedure.map((item, index) => (
                                        <div
                                            key={`${item.id}-${index}`} // Gunakan kombinasi id dan index untuk memastikan key unik
                                            className="bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-2 cursor-pointer"
                                            onClick={() => {
                                                setProcedureSearch(item.id); // Masukkan ID ke input pencarian
                                                fetchProcedure(item.id); // Panggil fetchDiagnosa untuk memperbarui tabel
                                            }}
                                        >
                                            <span>{`${item.id} - ${item.description}`}</span>
                                            <button
                                                className="text-red-500 hover:text-red-700"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Hentikan event klik badge agar tidak memicu onClick parent
                                                    setSelectedProcedure((prev) =>
                                                        prev.filter((_, i) => i !== index) // Hapus item berdasarkan index
                                                    );
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <table className="w-full border border-gray-300 rounded-lg">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="border-b border-gray-300 px-4 py-2 text-left">ID</th>
                                            <th className="border-b border-gray-300 px-4 py-2 text-left">Deskripsi</th>
                                            <th className="border-b border-gray-300 px-4 py-2 text-left">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(procedureOptions) && procedureOptions.length > 0 ? (
                                            procedureOptions.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="border-b border-gray-300 px-4 py-2">{item[1]}</td>
                                                    <td className="border-b border-gray-300 px-4 py-2">{item[0]}</td>
                                                    <td className="border-b border-gray-300 px-4 py-2">
                                                        <button
                                                            className="text-blue-500 hover:underline"
                                                            onClick={() => {
                                                                setSelectedProcedure((prev) => [
                                                                    ...prev,
                                                                    { id: item[1], description: item[0] }, // Tambahkan item baru tanpa memeriksa duplikasi
                                                                ]);
                                                            }}
                                                        >
                                                            Tambah
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="border-b border-gray-300 px-4 py-2 text-center">
                                                    Tidak ada data procedure.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t">
                                <button
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    onClick={() => setShowProcedureModal(false)} // Tutup modal
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </AppLayout >
    )
}
