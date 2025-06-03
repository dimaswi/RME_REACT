import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import { set } from "date-fns";
import { tr } from "date-fns/locale";
import { Home } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react"; // Tambahkan impor pustaka QR Code
import SignatureCanvas from "react-signature-canvas"; // Tambahkan impor pustaka Signature Canvas
import PengkajianAwal from "./PengkajianAwal";


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

    console.log("Data Klaim:", filteredKunjungan);

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

    const [tanggalMasuk, setTanggalMasuk] = useState<string | null>(null);
    const [tanggalKeluar, setTanggalKeluar] = useState<string | null>(null);
    const [lamaDirawat, setLamaDirawat] = useState<string | null>(null);
    const [riwayatPenyakitSekarang, setRiwayatPenyakitSekarang] = useState<string | null>(null);
    const [riwayatPenyakitLalu, setRiwayatPenyakitLalu] = useState<string | null>(null);
    const [pemeriksaanFisik, setPemeriksaanFisik] = useState<string | null>(null);
    const [permintaanKonsul, setPermintaanKonsul] = useState<{ permintaan: string; jawaban: string }[]>([]);
    const [diagnosaUtama, setDiagnosaUtama] = useState<string | null>(null);
    const [icd10, setIcd10] = useState<string | null>(null);
    const [tindakanProsedur, setTindakanProsedur] = useState<string | null>(null);
    const [icd9, setIcd9] = useState<string | null>(null);
    const [diagnosaSekunder, setDiagnosaSekunder] = useState<string | null>(null);
    const [icd10Sekunder, setIcd10Sekunder] = useState<string | null>(null);
    const [tindakanProsedurSekunder, setTindakanProsedurSekunder] = useState<string | null>(null);
    const [icd9Sekunder, setIcd9Sekunder] = useState<string | null>(null);
    const [riwayatAlergi, setRiwayatAlergi] = useState<string | null>(null);
    const [keadaanPulang, setKeadaanPulang] = useState<string | null>(null);
    const [caraPulang, setCaraPulang] = useState<string | null>(null);
    const [obat, setObat] = useState<string | null>(null);

    const handleAddKonsul = () => {
        setPermintaanKonsul([...permintaanKonsul, { permintaan: "", jawaban: "" }]);
    };

    const handleUpdateKonsul = (index: number, field: "permintaan" | "jawaban", value: string) => {
        const updatedKonsul = [...permintaanKonsul];
        updatedKonsul[index][field] = value;
        setPermintaanKonsul(updatedKonsul);
    };

    const handleRemoveKonsul = (index: number) => {
        const updatedKonsul = permintaanKonsul.filter((_, i) => i !== index);
        setPermintaanKonsul(updatedKonsul);
    };

    const handleLoadKonsul = () => {
        // Iterasi setiap elemen dalam filteredKunjungan untuk mengakses permintaan_konsul
        const konsulData = filteredKunjungan.flatMap((k: any) => k.permintaan_konsul || []);

        console.log("Konsul Data:", konsulData);

        // Validasi jika konsulData kosong
        if (!konsulData || konsulData.length === 0) {
            toast.error("Data permintaan konsul tidak tersedia.");
            return;
        }

        toast.success("Data permintaan konsul berhasil dimuat.");

        const konsulList = konsulData.map((item: any) => {
            const permintaan = item.PERMINTAAN_TINDAKAN || "";
            const jawaban = item.jawaban_konsul?.JAWABAN || "";

            // Tampilkan toast jika jawaban kosong
            if (!jawaban) {
                toast.error(`Jawaban kosong untuk permintaan: ${permintaan}`);
            }

            return { permintaan, jawaban };
        });

        setPermintaanKonsul(konsulList);
    };

    function stripHtmlTags(html: string): string {
        return html.replace(/<\/?[^>]+(>|$)/g, ""); // Hapus semua tag HTML
    }

    const [terapiPulang, setTerapiPulang] = useState([
        { namaObat: "", jumlah: "", frekuensi: "", caraPemberian: "" }, // Default satu array kosong
    ]);

    const handleAddTerapi = () => {
        setTerapiPulang([
            ...terapiPulang,
            { namaObat: "", jumlah: "", frekuensi: "", caraPemberian: "" },
        ]);
    };

    const handleRemoveTerapi = (index: number) => {
        const updatedTerapi = terapiPulang.filter((_, i) => i !== index);
        setTerapiPulang(updatedTerapi);
    };

    const handleUpdateTerapi = (
        index: number,
        field: "namaObat" | "jumlah" | "frekuensi" | "caraPemberian",
        value: string
    ) => {
        const updatedTerapi = [...terapiPulang];
        updatedTerapi[index][field] = value;
        setTerapiPulang(updatedTerapi);
    };

    // const handleLoadObat = (orderResep: any) => {
    //     if (!orderResep || orderResep.length === 0) {
    //         toast.error("Data order resep tidak tersedia.");
    //         return;
    //     }

    //     // Ambil data obat dari order_resep_detil
    //     const obatList = orderResep
    //         .filter((resep: any) => resep.RESEP_PASIEN_PULANG == 1)
    //         .flatMap((resep: any) =>
    //             resep.order_resep_detil?.map((detil: any) => ({
    //                 namaObat: detil.nama_obat?.NAMA || "Tidak ada nama obat",
    //                 jumlah: detil.JUMLAH || "Tidak ada jumlah",
    //                 frekuensi: detil.frekuensi_obat.FREKUENSI || "Tidak ada frekuensi",
    //                 caraPemberian: detil.cara_pakai.DESKRIPSI || "Tidak ada cara pemberian",
    //             })) || []
    //         );

    //     if (obatList.length === 0) {
    //         toast.error("Detail resep tidak tersedia.");
    //         return;
    //     }

    //     setTerapiPulang(obatList);
    //     setObat(obatList); // Simpan data obat ke state
    //     toast.success("Data obat berhasil dimuat.");
    // };

    const [showSignaturePad, setShowSignaturePad] = useState(false); // State untuk menampilkan pad tanda tangan
    const [signatureData, setSignatureData] = useState<string | null>(null); // State untuk menyimpan tanda tangan

    const handleClearSignature = (sigCanvas: SignatureCanvas) => {
        sigCanvas.clear();
        setSignatureData(null);
    };

    const handleSaveSignature = (sigCanvas: SignatureCanvas) => {
        const dataURL = sigCanvas.toDataURL(); // Simpan tanda tangan sebagai data URL
        setSignatureData(dataURL);
        setShowSignaturePad(false); // Sembunyikan pad tanda tangan setelah disimpan
        toast.success("Tanda tangan berhasil disimpan.");
    };

    const handleLoadAll = () => {
        // Load Tanggal Masuk
        if (filteredKunjungan[0]?.pendaftaran_pasien?.TANGGAL) {
            setTanggalMasuk(filteredKunjungan[0].pendaftaran_pasien.TANGGAL);
        } else {
            toast.error("Tanggal masuk tidak tersedia.");
        }

        // Load Tanggal Keluar
        if (filteredKunjungan[0]?.KELUAR) {
            setTanggalKeluar(filteredKunjungan[0].KELUAR);
        } else {
            toast.error("Tanggal keluar tidak tersedia.");
        }

        // Hitung Lama Dirawat
        if (filteredKunjungan[0]?.pendaftaran_pasien?.TANGGAL && filteredKunjungan[0]?.KELUAR) {
            const masuk = new Date(filteredKunjungan[0].pendaftaran_pasien.TANGGAL);
            const keluar = new Date(filteredKunjungan[0].KELUAR);
            masuk.setHours(0, 0, 0, 0);
            keluar.setHours(0, 0, 0, 0);

            if (masuk > keluar) {
                toast.error("Tanggal masuk tidak boleh lebih besar dari tanggal keluar.");
            } else {
                const diffDays = (keluar.getTime() - masuk.getTime()) / (1000 * 60 * 60 * 24) + 1;
                setLamaDirawat(`${diffDays} hari`);
            }
        }

        // Load Riwayat Penyakit Sekarang
        if (filteredKunjungan[0]?.anamnesis_pasien?.DESKRIPSI) {
            setRiwayatPenyakitSekarang(filteredKunjungan[0].anamnesis_pasien.DESKRIPSI);
        } else {
            toast.error("Riwayat penyakit sekarang tidak tersedia.");
        }

        // Load Riwayat Penyakit Lalu
        if (filteredKunjungan[0]?.rpp?.DESKRIPSI) {
            setRiwayatPenyakitLalu(filteredKunjungan[0].rpp.DESKRIPSI);
        } else {
            toast.error("Riwayat penyakit lalu tidak tersedia.");
        }

        // Load Pemeriksaan Fisik
        if (filteredKunjungan[0]?.pemeriksaan_fisik?.DESKRIPSI) {
            setPemeriksaanFisik(filteredKunjungan[0].pemeriksaan_fisik.DESKRIPSI);
        } else {
            toast.error("Pemeriksaan fisik tidak tersedia.");
        }

        // Load Diagnosa Utama
        if (filteredKunjungan[0]?.diagnosa_pasien?.length > 0) {
            const diagnosaList = filteredKunjungan[0].diagnosa_pasien
                .filter((d: any) => d.UTAMA === 1)
                .map((d: any) => d.DIAGNOSA)
                .join(", ");
            setDiagnosaUtama(diagnosaList);
            setIcd10(
                filteredKunjungan[0].diagnosa_pasien
                    .filter((d: any) => d.UTAMA === 1)
                    .map((d: any) => d.KODE)
                    .join(", ")
            );
        } else {
            toast.error("Diagnosa utama tidak tersedia.");
        }

        // Load Diagnosa Sekunder
        const filteredDiagnosaSekunder = filteredKunjungan[0]?.diagnosa_pasien?.filter((d: any) => d.UTAMA === 2);
        if (filteredDiagnosaSekunder?.length > 0) {
            const diagnosaList = filteredDiagnosaSekunder.map((d: any) => d.DIAGNOSA).join(", ");
            setDiagnosaSekunder(diagnosaList);
            setIcd10Sekunder(filteredDiagnosaSekunder.map((d: any) => d.KODE).join(", "));
        } else {
            toast.error("Diagnosa sekunder tidak tersedia.");
        }

        // Load Prosedur Pasien
        if (filteredKunjungan[0]?.prosedur_pasien?.length > 0) {
            const prosedurList = filteredKunjungan[0].prosedur_pasien.map((d: any) => d.TINDAKAN).join(", ");
            setTindakanProsedur(prosedurList);
            setIcd9(filteredKunjungan[0].prosedur_pasien.map((d: any) => d.KODE).join(", "));
        } else {
            toast.error("Prosedur pasien tidak tersedia.");
        }

        // Load Riwayat Alergi
        if (filteredKunjungan[0]?.riwayat_alergi?.length > 0) {
            const alergiList = filteredKunjungan[0].riwayat_alergi.map((a: any) => a.ALASAN).join(", ");
            setRiwayatAlergi(alergiList);
        } else {
            toast.error("Riwayat alergi tidak tersedia.");
        }

        // Load Keadaan Pulang
        if (filteredKunjungan[0]?.pasien_pulang?.keadaan_pulang?.DESKRIPSI) {
            setKeadaanPulang(filteredKunjungan[0].pasien_pulang.keadaan_pulang.DESKRIPSI);
        } else {
            toast.error("Keadaan pulang tidak tersedia.");
        }

        // Load Cara Pulang
        if (filteredKunjungan[0]?.pasien_pulang?.cara_pulang?.DESKRIPSI) {
            setCaraPulang(filteredKunjungan[0].pasien_pulang.cara_pulang.DESKRIPSI);
        } else {
            toast.error("Cara pulang tidak tersedia.");
        }

        // Load Terapi Pulang
        if (filteredKunjungan[0]?.order_resep?.length > 0) {
            const obatList = filteredKunjungan[0].order_resep
                .filter((resep: any) => resep.RESEP_PASIEN_PULANG === 1)
                .flatMap((resep: any) =>
                    resep.order_resep_detil?.map((detil: any) => ({
                        namaObat: detil.nama_obat?.NAMA || "Tidak ada nama obat",
                        jumlah: detil.JUMLAH || "Tidak ada jumlah",
                        frekuensi: detil.frekuensi_obat?.FREKUENSI || "Tidak ada frekuensi",
                        caraPemberian: detil.cara_pakai?.DESKRIPSI || "Tidak ada cara pemberian",
                    })) || []
                );
            setTerapiPulang(obatList);
        } else {
            toast.error("Terapi pulang tidak tersedia.");
        }

        toast.success("Semua data berhasil dimuat.");
    };

    const dataResumeMedis = {
        // Data Administrasi
        // Data klaim dan administrasi
        id_pengajuan_klaim: dataKlaim?.id,
        tanggal_masuk: tanggalMasuk,
        tanggal_keluar: tanggalKeluar,
        lama_dirawat: lamaDirawat,

        // Data Anamnesa & Pemeriksaan Fisik
        riwayat_penyakit_sekarang: riwayatPenyakitSekarang,
        riwayat_penyakit_lalu: riwayatPenyakitLalu,
        pemeriksaan_fisik: pemeriksaanFisik,

        // Data Konsultasi
        permintaan_konsul: permintaanKonsul,

        // Data Diagnosa & Tindakan Utama
        diagnosa_utama: diagnosaUtama,
        icd10_utama: icd10,
        tindakan_prosedur: tindakanProsedur,
        icd9_utama: icd9,

        // Data Diagnosa & Tindakan Sekunder
        diagnosa_sekunder: diagnosaSekunder,
        icd10_sekunder: icd10Sekunder,
        tindakan_prosedur_sekunder: tindakanProsedurSekunder,
        icd9_sekunder: icd9Sekunder,

        // Data Alergi
        riwayat_alergi: riwayatAlergi,

        // Data Status Pulang
        keadaan_pulang: keadaanPulang,
        cara_pulang: caraPulang,

        // Data Obat & Terapi
        obat: obat, // Ini field obat yang mungkin tidak digunakan lagi
        terapi_pulang: terapiPulang,

        // Tanda Tangan
        tanda_tangan: signatureData,

        // Data pendukung lainnya
        filtered_kunjungan: filteredKunjungan?.map(k => ({
            nomor: k.NOMOR,
            ruangan: k.ruangan?.DESKRIPSI,
            tanggal_pendaftaran: k.pendaftaran_pasien?.TANGGAL,
            tanggal_keluar: k.KELUAR,
            dpjp: k.dokter_d_p_j_p?.NAMA,
            penjamin: k.penjamin_pasien?.jenis_penjamin?.DESKRIPSI
        })),

        // Metadata
        timestamp: new Date().toISOString(),
        user_id: null // Sesuaikan dengan logic autentikasi aplikasi
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Resume Medis" />
            <div className="p-4">
                {/* Konten lainnya */}
                <div>
                    {filteredKunjungan.length === 0 ? (
                        <div className="text-gray-500">Tidak ada data kunjungan dengan JENIS_KUNJUNGAN 1, 3, atau 17.</div>
                    ) : (
                        <ul className="list-disc">
                            {filteredKunjungan.map((k: any, idx: number) => (
                                <>
                                    <table style={{ fontFamily: "halvetica, sans-serif", width: "100%", borderCollapse: "collapse", border: "1px solid #000" }}>
                                        <tbody>
                                            <tr>
                                                <td colSpan={2}>
                                                    {/* Gunakan data Base64 untuk menampilkan gambar */}
                                                    <center>
                                                        <img
                                                            src={imageBase64}
                                                            alt="Logo Klinik"
                                                            style={{ width: 50, height: 50 }}
                                                        />
                                                    </center>
                                                </td>
                                                <td colSpan={4}>
                                                    <div style={{ lineHeight: "1.2" }}>
                                                        <h3 style={{ fontSize: 20, textAlign: "left", }}>
                                                            KLINIK RAWAT INAP UTAMA MUHAMMADIYAH KEDUNGADEM
                                                        </h3>
                                                        <p style={{ fontSize: 12, textAlign: "left", }}>
                                                            Jl. PUK Desa Drokilo. Kec. Kedungadem Kab. Bojonegoro <br />
                                                            Email : klinik.muh.kedungadem@gmail.com | WA : 082242244646 <br />
                                                        </p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex justify-end h-full p-4">
                                                        <Button
                                                            variant="outline"
                                                            onClick={handleLoadAll}
                                                            className="h-8 w-24 bg-blue-500 text-white hover:bg-blue-600"
                                                        >
                                                            Load
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr style={{ background: "black", color: "white", textAlign: "center" }}>
                                                <td colSpan={8}>
                                                    <h3 style={{ fontSize: 16 }}>RINGKASAN PULANG</h3>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table style={{ fontFamily: "halvetica, sans-serif", width: "100%", borderCollapse: "collapse", border: "1px solid #000" }}>
                                        <tbody>
                                            <tr>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>Nama Pasien :</strong>
                                                    <br />
                                                    {k?.pendaftaran_pasien?.pasien?.NAMA || "Tidak ada nama pasien"}
                                                </td>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>No. RM :</strong>
                                                    <br />
                                                    {k?.pendaftaran_pasien?.pasien?.NORM || "Tidak ada No. RM"}
                                                </td>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>Tanggal Lahir :</strong>
                                                    <br />
                                                    {k?.pendaftaran_pasien?.pasien?.TANGGAL_LAHIR
                                                        ? formatTanggalIndo(k.pendaftaran_pasien.pasien.TANGGAL_LAHIR)
                                                        : "Tidak ada tanggal lahir"}
                                                </td>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>Jenis Kelamin :</strong>
                                                    <br />
                                                    {k?.pendaftaran_pasien?.pasien?.JENIS_KELAMIN === 1
                                                        ? "Laki-laki"
                                                        : k?.pendaftaran_pasien?.pasien?.JENIS_KELAMIN === 2
                                                            ? "Perempuan"
                                                            : "Tidak ada jenis kelamin"}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>Tanggal Masuk :</strong>
                                                    <br />
                                                    <div className="flex items-center space-x-2 mt-2 px-3 pb-4">
                                                        <Input
                                                            type="dateTime-local"
                                                            value={tanggalMasuk || ""}
                                                            onChange={(e) => setTanggalMasuk(e.target.value)}
                                                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        {/* <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                if (k.pendaftaran_pasien?.TANGGAL) {
                                                                    setTanggalMasuk(k?.pendaftaran_pasien?.TANGGAL)
                                                                } else {
                                                                    toast.error("Tanggal masuk tidak tersedia untuk kunjungan ini.");
                                                                }
                                                            }}
                                                            className="border border-gray-300 rounded-md p-2 bg-blue-500 text-white hover:bg-blue-600"
                                                        >
                                                            Load
                                                        </Button> */}
                                                    </div>
                                                </td>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>Tanggal Keluar :</strong>
                                                    <br />
                                                    <div className="flex items-center space-x-2 mt-2 px-3 pb-4">
                                                        <Input
                                                            type="dateTime-local"
                                                            value={tanggalKeluar || ""}
                                                            onChange={(e) => setTanggalKeluar(e.target.value)}
                                                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />

                                                        {/* <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                if (k.KELUAR) {
                                                                    setTanggalKeluar(k?.KELUAR)
                                                                } else {
                                                                    toast.error("Tanggal keluar tidak tersedia untuk kunjungan ini.");
                                                                }
                                                            }}
                                                            className="border border-gray-300 rounded-md p-2 bg-blue-500 text-white hover:bg-blue-600"
                                                        >
                                                            Load
                                                        </Button> */}
                                                    </div>
                                                </td>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>Lama Dirawat:</strong>
                                                    <br />
                                                    <div className="flex items-center space-x-2 mt-2 px-3 pb-4">
                                                        <Input
                                                            type="text"
                                                            value={lamaDirawat || ""}
                                                            readOnly
                                                            placeholder="Lama dirawat"
                                                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                if (tanggalMasuk && tanggalKeluar) {
                                                                    // Konversi tanggal masuk dan keluar ke objek Date
                                                                    const masuk = new Date(tanggalMasuk);
                                                                    const keluar = new Date(tanggalKeluar);

                                                                    // Normalisasi waktu ke pukul 00:00:00
                                                                    masuk.setHours(0, 0, 0, 0);
                                                                    keluar.setHours(0, 0, 0, 0);

                                                                    // Validasi jika tanggal masuk lebih besar dari tanggal keluar
                                                                    if (masuk > keluar) {
                                                                        toast.error("Tanggal masuk tidak boleh lebih besar dari tanggal keluar.");
                                                                        return;
                                                                    }

                                                                    // Hitung jumlah hari berdasarkan pergantian hari kalender
                                                                    const diffDays = (keluar.getTime() - masuk.getTime()) / (1000 * 60 * 60 * 24) + 1;

                                                                    // Set hasil lama dirawat
                                                                    setLamaDirawat(`${diffDays} hari`);
                                                                } else {
                                                                    toast.error("Tanggal masuk dan keluar harus diisi untuk menghitung lama dirawat.");
                                                                }
                                                            }}
                                                            className="border border-gray-300 rounded-md p-2 bg-blue-500 text-white hover:bg-blue-600"
                                                        >
                                                            Hitung
                                                        </Button>
                                                    </div>
                                                </td>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>Ruang Rawat :</strong>
                                                    <br />
                                                    {k?.ruangan?.DESKRIPSI || "Tidak ada Ruang Rawat"}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>Penjamin :</strong>
                                                    <br />
                                                    {k?.penjamin_pasien?.jenis_penjamin?.DESKRIPSI || "Tidak ada Penjamin"}
                                                </td>
                                                <td
                                                    colSpan={4}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>Indikasi Rawat Inap :</strong>
                                                    <br />
                                                    {k?.pendaftaran_pasien?.resume_medis?.INDIKASI_RAWAT_INAP || "Tidak ada Indikasi Rawat Inap"}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>Riwayat Penyakit :</strong>
                                                </td>
                                                <td
                                                    colSpan={6}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}>
                                                    <div className="px-2 flex flex-col space-y-2">
                                                        <strong>Riwayat Penyakit Sekarang :</strong>
                                                        <Textarea
                                                            value={riwayatPenyakitSekarang || ""}
                                                            onChange={(e) => setRiwayatPenyakitSekarang(e.target.value)}
                                                            placeholder="Masukkan riwayat penyakit sekarang"
                                                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                                        />
                                                        {/* <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                if (k.anamnesis_pasien?.DESKRIPSI) {
                                                                    setRiwayatPenyakitSekarang(k.anamnesis_pasien.DESKRIPSI);
                                                                } else {
                                                                    toast.error("Riwayat penyakit sekarang tidak tersedia untuk kunjungan ini.");
                                                                }
                                                            }}
                                                            className="border border-gray-300 rounded-md p-2 bg-blue-500 text-white hover:bg-blue-600"
                                                        >
                                                            Load
                                                        </Button> */}
                                                    </div>
                                                    <div className="py-4 px-2 flex flex-col space-y-2">
                                                        <strong>Riwayat Penyakit Lalu :</strong>
                                                        <Textarea
                                                            value={riwayatPenyakitLalu || ""}
                                                            onChange={(e) => setRiwayatPenyakitLalu(e.target.value)}
                                                            placeholder="Masukkan riwayat penyakit lalu"
                                                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                                        />
                                                        {/* <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                if (k.rpp?.DESKRIPSI) {
                                                                    setRiwayatPenyakitLalu(k.rpp.DESKRIPSI);
                                                                } else {
                                                                    toast.error("Riwayat penyakit sekarang tidak tersedia untuk kunjungan ini.");
                                                                }
                                                            }}
                                                            className="border border-gray-300 rounded-md p-2 bg-blue-500 text-white hover:bg-blue-600"
                                                        >
                                                            Load
                                                        </Button> */}
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>Pemeriksaan Fisik :</strong>
                                                </td>
                                                <td
                                                    colSpan={6}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <div className="px-2 py-4 flex flex-col space-y-2">
                                                        <Textarea
                                                            value={pemeriksaanFisik || ""}
                                                            onChange={(e) => setPemeriksaanFisik(e.target.value)}
                                                            placeholder="Masukkan pemeriksaan fisik"
                                                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                                        />
                                                        {/* <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                if (k.pemeriksaan_fisik?.DESKRIPSI) {
                                                                    setPemeriksaanFisik(k.pemeriksaan_fisik.DESKRIPSI);
                                                                } else {
                                                                    toast.error("Pemeriksaan fisik sekarang tidak tersedia untuk kunjungan ini.");
                                                                }
                                                            }}
                                                            className="border border-gray-300 rounded-md p-2 bg-blue-500 text-white hover:bg-blue-600"
                                                        >
                                                            Load
                                                        </Button> */}
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>Hasil Konsultasi :</strong>
                                                </td>
                                                <td
                                                    colSpan={6}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: "auto",
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5,
                                                    }}
                                                >
                                                    <div className="py-2">
                                                        {/* Render semua permintaan konsul */}
                                                        {permintaanKonsul.map((konsul, index) => (
                                                            <div key={index} className="px-2">
                                                                <div className="flex items-center justify-between mb-2 gap-2">
                                                                    <Input
                                                                        type="text"
                                                                        value={konsul.permintaan}
                                                                        onChange={(e) => handleUpdateKonsul(index, "permintaan", e.target.value)}
                                                                        placeholder="Masukkan permintaan konsul"
                                                                        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                                                    />
                                                                    <Input
                                                                        type="text"
                                                                        value={stripHtmlTags(konsul.jawaban)} // Bersihkan tag HTML sebelum ditampilkan
                                                                        onChange={(e) => handleUpdateKonsul(index, "jawaban", e.target.value)}
                                                                        placeholder="Masukkan jawaban konsul"
                                                                        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                                                    />
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={() => handleRemoveKonsul(index)}
                                                                        className="border border-gray-300 rounded-md p-2 bg-red-500 text-white hover:bg-red-600"
                                                                    >
                                                                        Hapus
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}


                                                        {/* Tombol Tambah Konsul */}
                                                        <div className="flex px-2 pb-2">
                                                            <Button
                                                                variant="outline"
                                                                onClick={handleAddKonsul}
                                                                className="border border-gray-300 rounded-md p-2 bg-blue-500 text-white hover:bg-blue-600"
                                                            >
                                                                Tambah Konsul
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => handleLoadKonsul()} // Bungkus dengan arrow function
                                                                className="border border-gray-300 rounded-md p-2 bg-blue-500 text-white hover:bg-blue-600"
                                                            >
                                                                Load
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "40%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>Diagnosa Utama</strong>
                                                </td>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "5%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>ICD 10</strong>
                                                </td>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "40%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>Tindakan/Prosedur</strong>
                                                </td>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "5%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>ICD 9</strong>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <div className="px-2 py-4 flex gap-2 space-y-2">
                                                        <Input
                                                            type="text"
                                                            value={diagnosaUtama || ""}
                                                            onChange={(e) => setDiagnosaUtama(e.target.value)}
                                                            placeholder="Masukkan diagnosa utama"
                                                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                                        />
                                                        {/* <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                if (k.diagnosa_pasien?.length > 0) {
                                                                    const diagnosaList = k.diagnosa_pasien?.filter((d: any) => d.UTAMA == 1).map((d: any) => d.DIAGNOSA).join(", ");
                                                                    setDiagnosaUtama(diagnosaList);
                                                                    setIcd10(k.diagnosa_pasien?.filter((d: any) => d.UTAMA == 1).map((d: any) => d.KODE).join(", "));
                                                                    toast.success(`Diagnosa utama berhasil dimuat: ${diagnosaList}`);
                                                                } else {
                                                                    toast.error("Diagnosa utama tidak tersedia untuk kunjungan ini.");
                                                                }
                                                            }}
                                                            className="border border-gray-300 rounded-md p-2 bg-blue-500 text-white hover:bg-blue-600"
                                                        >
                                                            Load
                                                        </Button> */}
                                                    </div>
                                                </td>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "5%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <div className="px-2 py-4 gap-2">
                                                        <Input
                                                            type="text"
                                                            value={icd10 || ""}
                                                            onChange={(e) => setIcd10(e.target.value)}
                                                            placeholder="Masukkan ICD 10"
                                                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                                        />
                                                    </div>
                                                </td>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <div className="px-2 py-4 flex space-y-2 gap-2">
                                                        <Input
                                                            type="text"
                                                            value={tindakanProsedur || ""}
                                                            onChange={(e) => setTindakanProsedur(e.target.value)}
                                                            placeholder="Prosedur Pasien"
                                                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                                        />
                                                        {/* <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                if (k.prosedur_pasien?.length > 0) {
                                                                    const prosedurList = k.prosedur_pasien.map((d: any) => d.TINDAKAN).join(", ");
                                                                    setTindakanProsedur(prosedurList);
                                                                    setIcd9(k.prosedur_pasien.map((d: any) => d.KODE).join(", "));
                                                                    toast.success(`Prosedur pasien berhasil dimuat: ${prosedurList}`);
                                                                } else {
                                                                    toast.error("Prosedur pasien tidak tersedia untuk kunjungan ini.");
                                                                }
                                                            }}
                                                            className="border border-gray-300 rounded-md p-2 bg-blue-500 text-white hover:bg-blue-600"
                                                        >
                                                            Load
                                                        </Button> */}
                                                    </div>
                                                </td>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "5%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <div className="px-2 py-4 gap-2">
                                                        <Input
                                                            type="text"
                                                            value={icd9 || ""}
                                                            onChange={(e) => setIcd9(e.target.value)}
                                                            placeholder="Masukkan ICD 9"
                                                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                                        />
                                                    </div>
                                                </td>

                                            </tr>
                                            <tr>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "40%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>Diagnosa Sekunder</strong>
                                                </td>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "5%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>ICD 10</strong>
                                                </td>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "40%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>Tindakan/Prosedur</strong>
                                                </td>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "5%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>ICD 9</strong>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <div className="px-2 py-4 flex gap-2 space-y-2">
                                                        <Input
                                                            type="text"
                                                            value={diagnosaSekunder || ""}
                                                            onChange={(e) => setDiagnosaSekunder(e.target.value)}
                                                            placeholder="Masukkan diagnosa sekunder"
                                                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                                        />
                                                        {/* <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                const filteredDiagnosa = k.diagnosa_pasien?.filter((d: any) => d.UTAMA == 2);
                                                                if (filteredDiagnosa?.length > 0) {
                                                                    const diagnosaList = filteredDiagnosa.map((d: any) => d.DIAGNOSA).join(", ");
                                                                    setDiagnosaSekunder(diagnosaList);
                                                                    setIcd10Sekunder(filteredDiagnosa.map((d: any) => d.KODE).join(", "));
                                                                    toast.success(`Diagnosa sekunder berhasil dimuat: ${diagnosaList}`);
                                                                } else {
                                                                    toast.error("Diagnosa sekunder tidak tersedia untuk kunjungan ini.");
                                                                }
                                                            }}
                                                            className="border border-gray-300 rounded-md p-2 bg-blue-500 text-white hover:bg-blue-600"
                                                        >
                                                            Load
                                                        </Button> */}
                                                    </div>
                                                </td>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "5%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <div className="px-2 py-4 gap-2">
                                                        <Input
                                                            type="text"
                                                            value={icd10Sekunder || ""}
                                                            onChange={(e) => setIcd10Sekunder(e.target.value)}
                                                            placeholder="Masukkan ICD 10"
                                                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                                        />
                                                    </div>
                                                </td>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <div className="px-2 py-4 flex space-y-2 gap-2">
                                                        <Input
                                                            type="text"
                                                            value={tindakanProsedurSekunder || ""}
                                                            onChange={(e) => setTindakanProsedurSekunder(e.target.value)}
                                                            placeholder="Prosedur Pasien"
                                                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                                        />
                                                        {/* <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                if (k.prosedur_pasien?.length > 0) {
                                                                    const prosedurList = k.prosedur_pasien.map((d: any) => d.TINDAKAN).join(", ");
                                                                    setTindakanProsedurSekunder(prosedurList);
                                                                    setIcd9Sekunder(k.prosedur_pasien.map((d: any) => d.KODE).join(", "));
                                                                    toast.success(`Prosedur pasien berhasil dimuat: ${prosedurList}`);
                                                                } else {
                                                                    toast.error("Prosedur pasien tidak tersedia untuk kunjungan ini.");
                                                                }
                                                            }}
                                                            className="border border-gray-300 rounded-md p-2 bg-blue-500 text-white hover:bg-blue-600"
                                                        >
                                                            Load
                                                        </Button> */}
                                                    </div>
                                                </td>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "5%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <div className="px-2 py-4 gap-2">
                                                        <Input
                                                            type="text"
                                                            value={icd9Sekunder || ""}
                                                            onChange={(e) => setIcd9Sekunder(e.target.value)}
                                                            placeholder="Masukkan ICD 9"
                                                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "5%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>Riwayat Alergi</strong>
                                                </td>
                                                <td
                                                    colSpan={6}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "5%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <div className="px-2 py-4 gap-2 flex">
                                                        <Input
                                                            type="text"
                                                            value={riwayatAlergi || ""}
                                                            onChange={(e) => setRiwayatAlergi(e.target.value)}
                                                            placeholder="Masukkan riwayat alergi"
                                                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                                        />
                                                        {/* <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                if (k.riwayat_alergi?.length > 0) {
                                                                    const alergiList = k.riwayat_alergi.map((a: any) => a.ALASAN).join(", ");
                                                                    setRiwayatAlergi(alergiList);
                                                                    toast.success(`Riwayat alergi berhasil dimuat: ${alergiList}`);
                                                                } else {
                                                                    toast.error("Riwayat alergi tidak tersedia untuk kunjungan ini.");
                                                                }
                                                            }}
                                                            className="border border-gray-300 rounded-md p-2 bg-blue-500 text-white hover:bg-blue-600"
                                                        >
                                                            Load
                                                        </Button> */}
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>Keadaan Pulang</strong>
                                                </td>
                                                <td
                                                    colSpan={6}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "5%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <div className="px-2 py-4 gap-2 flex">
                                                        <Input
                                                            type="text"
                                                            value={keadaanPulang || ""}
                                                            onChange={(e) => setKeadaanPulang(e.target.value)}
                                                            placeholder="Masukkan keadaan pulang"
                                                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                                        />
                                                        {/* <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                if (k.pasien_pulang) {
                                                                    const keadaanList = k.pasien_pulang.keadaan_pulang.DESKRIPSI;
                                                                    setKeadaanPulang(keadaanList);
                                                                    toast.success(`Keadaan pulang berhasil dimuat: ${keadaanList} `);
                                                                } else {
                                                                    toast.error("Keadaan pulang tidak tersedia untuk kunjungan ini.");
                                                                }
                                                            }}
                                                            className="border border-gray-300 rounded-md p-2 bg-blue-500 text-white hover:bg-blue-600"
                                                        >
                                                            Load
                                                        </Button> */}
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>Cara Pulang</strong>
                                                </td>
                                                <td
                                                    colSpan={6}
                                                    style={{
                                                        verticalAlign: "top",
                                                        height: 70,
                                                        width: "5%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <div className="px-2 py-4 gap-2 flex">
                                                        <Input
                                                            type="text"
                                                            value={caraPulang || ""}
                                                            onChange={(e) => setCaraPulang(e.target.value)}
                                                            placeholder="Masukkan cara pulang"
                                                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                                        />
                                                        {/* <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                if (k.pasien_pulang) {
                                                                    const caraList = k.pasien_pulang.cara_pulang.DESKRIPSI;
                                                                    setCaraPulang(caraList);
                                                                    toast.success(`Cara pulang berhasil dimuat: ${caraList} `);
                                                                } else {
                                                                    toast.error("Cara pulang tidak tersedia untuk kunjungan ini.");
                                                                }
                                                            }}
                                                            className="border border-gray-300 rounded-md p-2 bg-blue-500 text-white hover:bg-blue-600"
                                                        >
                                                            Load
                                                        </Button> */}
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    style={{
                                                        verticalAlign: "middle",
                                                        textAlign: "center",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    <strong>Terapi Pulang</strong>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "middle",
                                                        textAlign: "center",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    Nama Obat
                                                </td>
                                                <td
                                                    style={{
                                                        verticalAlign: "middle",
                                                        textAlign: "center",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    Jumlah
                                                </td>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "middle",
                                                        textAlign: "center",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    Frekuensi
                                                </td>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "middle",
                                                        textAlign: "center",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5
                                                    }}
                                                >
                                                    Cara Pemberian
                                                </td>
                                                <td></td>
                                            </tr>

                                            {terapiPulang.map((terapi, index) => (
                                                <tr key={index}>
                                                    <td
                                                        colSpan={2}
                                                        style={{
                                                            verticalAlign: "middle",
                                                            height: 70,
                                                            width: "20%",
                                                            border: "1px solid #000",
                                                            paddingLeft: 10,
                                                            paddingRight: 10,
                                                        }}
                                                    >
                                                        <Input
                                                            type="text"
                                                            value={terapi.namaObat}
                                                            onChange={(e) =>
                                                                handleUpdateTerapi(index, "namaObat", e.target.value)
                                                            }
                                                            placeholder="Masukkan nama obat"
                                                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                                        />
                                                    </td>
                                                    <td
                                                        style={{
                                                            verticalAlign: "middle",
                                                            height: 70,
                                                            width: "20%",
                                                            border: "1px solid #000",
                                                            paddingLeft: 10,
                                                            paddingRight: 10,
                                                        }}
                                                    >
                                                        <Input
                                                            type="number"
                                                            value={terapi.jumlah}
                                                            onChange={(e) =>
                                                                handleUpdateTerapi(index, "jumlah", e.target.value)
                                                            }
                                                            placeholder="Masukkan jumlah"
                                                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                                        />
                                                    </td>
                                                    <td
                                                        colSpan={2}
                                                        style={{
                                                            verticalAlign: "middle",
                                                            height: 70,
                                                            width: "20%",
                                                            border: "1px solid #000",
                                                            paddingLeft: 10,
                                                            paddingRight: 10,
                                                        }}
                                                    >
                                                        <Input
                                                            type="text"
                                                            value={terapi.frekuensi}
                                                            onChange={(e) =>
                                                                handleUpdateTerapi(index, "frekuensi", e.target.value)
                                                            }
                                                            placeholder="Masukkan frekuensi"
                                                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                                        />
                                                    </td>
                                                    <td
                                                        colSpan={2}
                                                        style={{
                                                            verticalAlign: "middle",
                                                            height: 70,
                                                            width: "20%",
                                                            border: "1px solid #000",
                                                            paddingLeft: 10,
                                                            paddingRight: 10,
                                                        }}
                                                    >
                                                        <Input
                                                            type="text"
                                                            value={terapi.caraPemberian}
                                                            onChange={(e) =>
                                                                handleUpdateTerapi(index, "caraPemberian", e.target.value)
                                                            }
                                                            placeholder="Masukkan cara pemberian"
                                                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                                        />
                                                    </td>
                                                    <td
                                                        style={{
                                                            verticalAlign: "middle",
                                                            height: 70,
                                                            width: "20%",
                                                            border: "1px solid #000",
                                                            paddingLeft: 10,
                                                            paddingRight: 10,
                                                        }}
                                                    >
                                                        <div className="flex items-center h-full gap-2">
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => handleAddTerapi(index)}
                                                                className="border border-gray-300 rounded-md p-2 bg-green-500 text-white hover:bg-green-600"
                                                            >
                                                                Tambah
                                                            </Button>
                                                            {/* {
                                                                index < 1 && (
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={() => handleLoadObat(k.order_resep)}
                                                                        className="border border-gray-300 rounded-md p-2 bg-blue-500 text-white hover:bg-blue-600"
                                                                    >
                                                                        Load
                                                                    </Button>
                                                                )
                                                            } */}
                                                            {terapiPulang.length > 1 && index > 0 && ( // Tampilkan tombol Hapus hanya jika lebih dari satu item
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => handleRemoveTerapi(index)}
                                                                    className="border border-gray-300 rounded-md p-2 bg-red-500 text-white hover:bg-red-600"
                                                                >
                                                                    Hapus
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td colSpan={2}
                                                    style={{
                                                        verticalAlign: "middle",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5,
                                                        paddingRight: 5,
                                                    }}>
                                                    <strong>Intruksi Tindak Lanjut</strong>
                                                </td>
                                                <td
                                                    colSpan={6}
                                                    style={{
                                                        verticalAlign: "middle",
                                                        height: 70,
                                                        width: "5%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5,
                                                        paddingRight: 5,
                                                    }}
                                                >
                                                    <div className="px-2 py-4 gap-2">
                                                        <strong>Poli Tujuan :</strong> {formatTanggalIndo(k.jadwal_kontrol?.ruangan.DESKRIPSI) ?? "Tidak ada"}
                                                        <br />
                                                        <strong>Tanggal :</strong> {formatTanggalIndo(k.jadwal_kontrol?.TANGGAL) ?? "Tidak ada"}
                                                        <br />
                                                        <strong>Jam :</strong> {k.jadwal_kontrol?.JAM ?? "Tidak ada"}
                                                        <br />
                                                        <strong>No Surat BPJS :</strong> {k.jadwal_kontrol?.NOMOR_REFERENSI ?? "Tidak ada"}
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div className="mt-[-1px] flex justify-center items-center h-full border border-black p-4">
                                        <div className="text-center mx-4 flex-1">
                                            <br />
                                            <strong>Keluarga Pasien</strong>
                                            <br />
                                            {/* Tampilkan tanda tangan jika ada */}
                                            {signatureData && (
                                                <div className="">
                                                    <img src={signatureData} alt="Tanda Tangan" className="" />
                                                </div>
                                            )}
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowSignaturePad(true)} // Tampilkan pad tanda tangan
                                                className="border border-gray-300 rounded-md p-2 bg-blue-500 text-white hover:bg-blue-600"
                                            >
                                                Tanda Tangan
                                            </Button>

                                        </div>
                                        <div className="ml-100 flex-1">
                                            <strong>Bojonegoro, </strong> {formatTanggalIndo(k.KELUAR)}
                                            <br />
                                            <strong>DPJP Pelayanan</strong>
                                            <div className="m-4">
                                                <QRCodeSVG
                                                    value={(k.dokter_d_p_j_p?.GELAR_DEPAN ? k.dokter_d_p_j_p?.GELAR_DEPAN + "." : "") + k.dokter_d_p_j_p?.NAMA + (k.dokter_d_p_j_p?.GELAR_BELAKANG ? " " + k.dokter_d_p_j_p?.GELAR_BELAKANG : "")}
                                                    size={128}
                                                    bgColor={"#ffffff"}
                                                    fgColor={"#000000"}
                                                    level={"L"}
                                                />
                                            </div>
                                            <strong>{(k.dokter_d_p_j_p?.GELAR_DEPAN ? k.dokter_d_p_j_p?.GELAR_DEPAN + "." : "") + k.dokter_d_p_j_p?.NAMA + (k.dokter_d_p_j_p?.GELAR_BELAKANG ? " " + k.dokter_d_p_j_p?.GELAR_BELAKANG : "")}</strong>
                                        </div>
                                    </div>

                                    {
                                        k.gabung_tagihan != null ? (
                                            <PengkajianAwal
                                                imageBase64={imageBase64}
                                                nomorKunjungan={k.gabung_tagihan?.kunjungan_pasien?.find?.(
                                                    (kp: any) => kp?.ruangan?.JENIS_KUNJUNGAN === 2
                                                )?.NOMOR || ""}
                                                dataResumeMedis={dataResumeMedis}
                                            />
                                        ) : (
                                            <div>
                                                <div className="flex justify-end mt-4">
                                                    <Button
                                                        type="submit"
                                                        variant="outline"
                                                        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                                    >
                                                        Simpan
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    }
                                </>
                            ))}
                        </ul>

                    )}
                </div >

            </div>

            {showSignaturePad && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-4 rounded-md shadow-md">
                        <SignatureCanvas
                            penColor="black"
                            canvasProps={{
                                width: 500,
                                height: 200,
                                className: "border border-gray-300 rounded-md",
                            }}
                            ref={(ref) => (window.sigCanvas = ref)}
                        />
                        <div className="flex justify-between mt-4">
                            <Button
                                variant="outline"
                                onClick={() => handleClearSignature(window.sigCanvas)}
                                className="border border-gray-300 rounded-md p-2 bg-red-500 text-white hover:bg-red-600"
                            >
                                Clear
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleSaveSignature(window.sigCanvas)}
                                className="border border-gray-300 rounded-md p-2 bg-green-500 text-white hover:bg-green-600"
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout >
    )
}
