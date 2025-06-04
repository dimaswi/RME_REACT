import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { set } from "date-fns";
import { id, tr } from "date-fns/locale";
import { Home } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react"; // Tambahkan impor pustaka QR Code
import SignatureCanvas from "react-signature-canvas"; // Tambahkan impor pustaka Signature Canvas
import PengkajianAwal from "./PengkajianAwal";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";


export default function EditResumeMedis() {
    const imageBase64 = usePage().props.imageBase64;

    const [dataKlaim, setDataKlaim] = useState(usePage().props.pengajuanKlaim);
    const [editMode, setEditMode] = useState(dataKlaim.edit);

    // Ambil kunjungan_pasien dari penjamin, handle jika array/object/undefined
    const filteredKunjungan = (() => {
        if (editMode === 1 && dataKlaim.resume_medis_edit) {
            return [dataKlaim.resume_medis_edit];
        } else if (editMode === 0 && dataKlaim.penjamin) {
            const kunjunganPasienArr = Array.isArray(dataKlaim.penjamin.kunjungan_pasien)
                ? dataKlaim.penjamin.kunjungan_pasien
                : dataKlaim.penjamin.kunjungan_pasien
                    ? [dataKlaim.penjamin.kunjungan_pasien]
                    : [];
            return kunjunganPasienArr.filter(
                (k: any) =>
                    k?.ruangan &&
                    [1, 3, 17].includes(Number(k.ruangan.JENIS_KUNJUNGAN))
            );
        }
        return [];
    })();

    useEffect(() => {
        // filteredKunjungan selalu hasil dari dataKlaim, tidak pernah berubah akibat setState di bawah
        const k = (() => {
            if (editMode === 1 && dataKlaim.resume_medis_edit) {
                return dataKlaim.resume_medis_edit;
            } else if (editMode === 0 && dataKlaim.penjamin) {
                const kunjunganPasienArr = Array.isArray(dataKlaim.penjamin.kunjungan_pasien)
                    ? dataKlaim.penjamin.kunjungan_pasien
                    : dataKlaim.penjamin.kunjungan_pasien
                        ? [dataKlaim.penjamin.kunjungan_pasien]
                        : [];
                return kunjunganPasienArr.find(
                    (k: any) =>
                        k?.ruangan &&
                        [1, 3, 17].includes(Number(k.ruangan.JENIS_KUNJUNGAN))
                );
            }
            return null;
        })();

        if (!k) return;

        if (editMode === 1 && dataKlaim.resume_medis_edit) {
            const d = filteredKunjungan[0];
            // console.log("Data Resume Medis Edit:", d);
            setNamaPasien(d.nama_pasien ?? "");
            setNomorKunjungan(d.pengkajian_awal_edit?.nomor_kunjungan ?? "");
            setNoRM(d.NORM ?? "");
            setTanggalLahir(d.tanggal_lahir ?? "");
            setJenisKelamin(d.jenis_kelamin ?? "");
            setRuangRawat(d.ruang_rawat ?? "");
            setIndikasiRawatInap(d.indikasi_rawat_inap ?? "");
            setPenjamin(d.penjamin ?? "");
            setTanggalMasuk(d.tanggal_masuk ?? "");
            setTanggalKeluar(d.tanggal_keluar ?? "");
            setLamaDirawat(handleLamaDirawat(d.tanggal_masuk, d.tanggal_keluar));
            setRiwayatPenyakitSekarang(d.riwayat_penyakit_sekarang ?? "");
            setRiwayatPenyakitLalu(d.riwayat_penyakit_dulu ?? "");
            setPemeriksaanFisik(d.pemeriksaan_fisik ?? "");
            setPermintaanKonsul(
                Array.isArray(d.konsultasi_edit)
                    ? d.konsultasi_edit.map((item: any) => ({
                        permintaan: item.pertanyaan || "",
                        jawaban: item.jawaban || "",
                    }))
                    : []
            );
            setTerapiPulang(
                Array.isArray(d.terapi_pulang_edit)
                    ? d.terapi_pulang_edit.map((item: any) => ({
                        namaObat: item.nama_obat || "",
                        jumlah: item.jumlah || "",
                        frekuensi: item.frekuensi || "",
                        caraPemberian: item.cara_pemakaian || "",
                    }))
                    : []
            );
            setDiagnosaUtama(d.diagnosa_utama ?? "");
            setIcd10(d.icd10_utama ?? "");
            setTindakanProsedur(d.prosedur_utama ?? "");
            setIcd9(d.icd9_utama ?? "");
            setDiagnosaSekunder(d.diagnosa_sekunder ?? "");
            setIcd10Sekunder(d.icd10_sekunder ?? "");
            setTindakanProsedurSekunder(d.prosedur_sekunder ?? "");
            setIcd9Sekunder(d.icd9_sekunder ?? "");
            setRiwayatAlergi(d.riwayat_alergi ?? "");
            setKeadaanPulang(d.keadaan_pulang ?? "");
            setCaraPulang(d.cara_pulang ?? "");
            setPoliTujuan(d.intruksi_tindak_lanjut_edit.poli_tujuan ?? "");
            setTanggalKontrol(d.intruksi_tindak_lanjut_edit.tanggal ?? "");
            setJamKontrol(d.intruksi_tindak_lanjut_edit.jam ?? "");
            setNoSuratBPJS(d.intruksi_tindak_lanjut_edit.nomor_bpjs ?? "");
            setNamaDokter(d.dokter ?? "");
            setIdResumeMedis(d.id ?? null);
        }
        // Jika dari kunjungan pasien
        else if (
            editMode === 0 &&
            dataKlaim.penjamin &&
            (Array.isArray(dataKlaim.penjamin.kunjungan_pasien) || dataKlaim.penjamin.kunjungan_pasien)
        ) {
            const k = filteredKunjungan[0];
            setIdResumeMedis(null);
            setNamaPasien(k.pendaftaran_pasien?.pasien?.NAMA ?? "");
            setNomorKunjungan(dataKlaim.penjamin.kunjungan_pasien?.[0]
                ?.gabung_tagihan?.kunjungan_pasien
                ?.find?.((kp: any) => kp?.ruangan?.JENIS_KUNJUNGAN === 2)
                ?.NOMOR);
            setNoRM(k.pendaftaran_pasien?.pasien?.NORM ?? "");
            setTanggalLahir(k.pendaftaran_pasien?.pasien?.TANGGAL_LAHIR ?? "");
            setJenisKelamin(k.pendaftaran_pasien?.pasien?.JENIS_KELAMIN ?? null);
            setRuangRawat(k.ruangan?.DESKRIPSI ?? "");
            setIndikasiRawatInap(k.pendaftaran_pasien?.resume_medis?.INDIKASI_RAWAT_INAP ?? "");
            setPenjamin(k.penjamin_pasien?.jenis_penjamin?.DESKRIPSI ?? "");
            setTanggalMasuk(k.pendaftaran_pasien?.TANGGAL ?? "");
            setTanggalKeluar(k.KELUAR ?? "");
            setLamaDirawat(handleLamaDirawat(k.pendaftaran_pasien?.TANGGAL, k.KELUAR));
            setRiwayatPenyakitSekarang(k.anamnesis_pasien?.DESKRIPSI ?? "");
            setRiwayatPenyakitLalu(k.rpp?.DESKRIPSI ?? "");
            setPemeriksaanFisik(k.pemeriksaan_fisik?.DESKRIPSI ?? "");
            setDiagnosaUtama(k.diagnosa_pasien?.find((d: any) => d.UTAMA === 1)?.DIAGNOSA ?? "");
            setIcd10(k.diagnosa_pasien?.find((d: any) => d.UTAMA === 1)?.KODE ?? "");
            setTindakanProsedur(k.prosedur_pasien?.map((p: any) => p.TINDAKAN).join(", ") ?? "");
            setIcd9(k.prosedur_pasien?.map((p: any) => p.KODE).join(", ") ?? "");
            setDiagnosaSekunder(k.diagnosa_pasien?.filter((d: any) => d.UTAMA === 2).map((d: any) => d.DIAGNOSA).join(", ") ?? "");
            setIcd10Sekunder(k.diagnosa_pasien?.filter((d: any) => d.UTAMA === 2).map((d: any) => d.KODE).join(", ") ?? "");
            setTindakanProsedurSekunder(k.prosedur_pasien?.filter((p: any) => p.UTAMA === 2).map((p: any) => p.TINDAKAN).join(", ") ?? "");
            setIcd9Sekunder(k.prosedur_pasien?.filter((p: any) => p.UTAMA === 2).map((p: any) => p.KODE).join(", ") ?? "");
            setRiwayatAlergi(k.riwayat_alergi?.map((a: any) => a.DESKRIPSI).join(", ") ?? "");
            setKeadaanPulang(k.pasien_pulang?.keadaan_pulang?.DESKRIPSI ?? "");
            setCaraPulang(k.pasien_pulang?.cara_pulang?.DESKRIPSI ?? "");
            setPoliTujuan(k.jadwal_kontrol?.ruangan.DESKRIPSI ?? "");
            setTanggalKontrol(k.jadwal_kontrol?.TANGGAL ?? "");
            setJamKontrol(k.jadwal_kontrol?.JAM ?? "");
            setNoSuratBPJS(k.jadwal_kontrol?.NOMOR_REFERENSI ?? "");
            setPermintaanKonsul(
                Array.isArray(k.permintaan_konsul)
                    ? k.permintaan_konsul.map((item: any) => ({
                        permintaan: item.PERMINTAAN_TINDAKAN || "",
                        jawaban: item.jawaban_konsul?.JAWABAN || "",
                    }))
                    : []
            );
            setTerapiPulang(
                Array.isArray(k.order_resep)
                    ? k.order_resep
                        .filter((resep: any) => resep.RESEP_PASIEN_PULANG === 1)
                        .flatMap((resep: any) =>
                            Array.isArray(resep.order_resep_detil)
                                ? resep.order_resep_detil.map((detil: any) => ({
                                    namaObat: detil.nama_obat?.NAMA || "",
                                    jumlah: detil.JUMLAH || "",
                                    frekuensi: detil.frekuensi_obat?.FREKUENSI || "",
                                    caraPemberian: detil.cara_pakai?.DESKRIPSI || "",
                                }))
                                : []
                        )
                    : []
            );
            setGelarDepanDokter(k.dokter_d_p_j_p?.GELAR_DEPAN + "." || "");
            setGelarBelakangDokter(k.dokter_d_p_j_p?.GELAR_BELAKANG || "");
            setNamaDokter(k.dokter_d_p_j_p?.NAMA || "");
        }

    }, [editMode, dataKlaim]);

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

    const [idResumeMedis, setIdResumeMedis] = useState<number | null>(null);
    const [namaPasien, setNamaPasien] = useState<string | null>(null);
    const [noRM, setNoRM] = useState<string | null>(null);
    const [tanggalLahir, setTanggalLahir] = useState<string | null>(null);
    const [jenisKelamin, setJenisKelamin] = useState<number | null>(null);
    const [ruangRawat, setRuangRawat] = useState<string | null>(null);
    const [indikasiRawatInap, setIndikasiRawatInap] = useState<string | null>(null);
    const [penjamin, setPenjamin] = useState<string | null>(null);
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
    const [poliTujuan, setPoliTujuan] = useState<string | null>(null);
    const [tanggalKontrol, setTanggalKontrol] = useState<string | null>(null);
    const [jamKontrol, setJamKontrol] = useState<string | null>(null);
    const [noSuratBPJS, setNoSuratBPJS] = useState<string | null>(null);
    const [gelarDepanDokter, setGelarDepanDokter] = useState<string | null>(null);
    const [gelarBelakangDokter, setGelarBelakangDokter] = useState<string | null>(null);
    const [namaDokter, setNamaDokter] = useState<string | null>(null);
    const [gabungTagihan, setGabungTagihan] = useState<[]>(false);
    const [nomorKunjungan, setNomorKunjungan] = useState<string | null>(null);
    const [terapiPulang, setTerapiPulang] = useState<{ namaObat: string; jumlah: string; frekuensi: string; caraPemberian: string }[]>([]);

    const dataResumeMedis = {
        id_resume_medis: idResumeMedis || null,
        id_pengajuan_klaim: dataKlaim.id,
        nama_pasien: namaPasien || null,
        no_rm: noRM || null,
        tanggal_lahir: tanggalLahir || null,
        jenis_kelamin: jenisKelamin || null,
        ruang_rawat: ruangRawat || null,
        penjamin: penjamin || null,
        indikasi_rawat_inap: indikasiRawatInap || null,
        tanggal_masuk: tanggalMasuk || null,
        tanggal_keluar: tanggalKeluar || null,
        lama_dirawat: lamaDirawat || null,
        riwayat_penyakit_sekarang: riwayatPenyakitSekarang || null,
        riwayat_penyakit_lalu: riwayatPenyakitLalu || null,
        pemeriksaan_fisik: pemeriksaanFisik || null,
        diagnosa_utama: diagnosaUtama || null,
        icd10_utama: icd10 || null,
        diagnosa_sekunder: diagnosaSekunder || null,
        icd10_sekunder: icd10Sekunder || null,
        tindakan_prosedur: tindakanProsedur || null,
        icd9_utama: icd9 || null,
        tindakan_prosedur_sekunder: tindakanProsedurSekunder || null,
        icd9_sekunder: icd9Sekunder || null,
        riwayat_alergi: riwayatAlergi || null,
        keadaan_pulang: keadaanPulang || null,
        cara_pulang: caraPulang || null,
        dokter: gelarDepanDokter + " " + namaDokter + " " + gelarBelakangDokter || null,
        // tanda_tangan_pasien: signatureData || null,
        permintaan_konsul: permintaanKonsul || null,
        terapi_pulang: terapiPulang || null,
        instruksi_tindak_lanjut: {
            poliTujuan: poliTujuan || null,
            tanggal: tanggalKontrol || null,
            jam: jamKontrol || null,
            nomor_bpjs: noSuratBPJS || null,
        }
    };

    function handleLamaDirawat(tanggalMasuk: string | null | undefined, tanggalKeluar: string | null | undefined): string {
        if (tanggalMasuk && tanggalKeluar) {
            const masuk = new Date(tanggalMasuk);
            const keluar = new Date(tanggalKeluar);
            masuk.setHours(0, 0, 0, 0);
            keluar.setHours(0, 0, 0, 0);
            if (masuk > keluar) {
                toast.error("Tanggal masuk tidak boleh lebih besar dari tanggal keluar.");
                return "";
            }
            const diffDays = (keluar.getTime() - masuk.getTime()) / (1000 * 60 * 60 * 24) + 1;
            return `${diffDays} hari`;
        }
        return "";
    }

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
        // Ambil data asli dari penjamin.kunjungan_pasien
        let kunjunganPasienArr = [];
        if (Array.isArray(dataKlaim.penjamin?.kunjungan_pasien)) {
            kunjunganPasienArr = dataKlaim.penjamin.kunjungan_pasien;
        } else if (dataKlaim.penjamin?.kunjungan_pasien) {
            kunjunganPasienArr = [dataKlaim.penjamin.kunjungan_pasien];
        }

        console.log("Kunjungan Pasien Array:", dataKlaim);

        // Cari kunjungan dengan JENIS_KUNJUNGAN 1, 3, atau 17
        const k = kunjunganPasienArr.find(
            (item: any) =>
                item?.ruangan &&
                [1, 3, 17].includes(Number(item.ruangan.JENIS_KUNJUNGAN))
        );

        if (!k) {
            toast.error("Data kunjungan tidak ditemukan.");
            return;
        }

        setNamaPasien(k.pendaftaran_pasien?.pasien?.NAMA ?? "");
        setNoRM(k.pendaftaran_pasien?.pasien?.NORM ?? "");
        setTanggalLahir(k.pendaftaran_pasien?.pasien?.TANGGAL_LAHIR ?? "");
        setJenisKelamin(k.pendaftaran_pasien?.pasien?.JENIS_KELAMIN ?? null);
        setRuangRawat(k.ruangan?.DESKRIPSI ?? "");
        setIndikasiRawatInap(k.pendaftaran_pasien?.resume_medis?.INDIKASI_RAWAT_INAP ?? "");
        setPenjamin(k.penjamin_pasien?.jenis_penjamin?.DESKRIPSI ?? "");
        setTanggalMasuk(k.pendaftaran_pasien?.TANGGAL ?? "");
        setTanggalKeluar(k.KELUAR ?? "");
        setLamaDirawat(handleLamaDirawat(k.pendaftaran_pasien?.TANGGAL, k.KELUAR));
        setRiwayatPenyakitSekarang(k.anamnesis_pasien?.DESKRIPSI ?? "");
        setRiwayatPenyakitLalu(k.rpp?.DESKRIPSI ?? "");
        setPemeriksaanFisik(k.pemeriksaan_fisik?.DESKRIPSI ?? "");
        setDiagnosaUtama(
            Array.isArray(k.diagnosa_pasien)
                ? k.diagnosa_pasien.filter((d: any) => d.UTAMA === 1).map((d: any) => d.DIAGNOSA).join(", ")
                : ""
        );
        setIcd10(
            Array.isArray(k.diagnosa_pasien)
                ? k.diagnosa_pasien.filter((d: any) => d.UTAMA === 1).map((d: any) => d.KODE).join(", ")
                : ""
        );
        setDiagnosaSekunder(
            Array.isArray(k.diagnosa_pasien)
                ? k.diagnosa_pasien.filter((d: any) => d.UTAMA === 2).map((d: any) => d.DIAGNOSA).join(", ")
                : ""
        );
        setIcd10Sekunder(
            Array.isArray(k.diagnosa_pasien)
                ? k.diagnosa_pasien.filter((d: any) => d.UTAMA === 2).map((d: any) => d.KODE).join(", ")
                : ""
        );
        setTindakanProsedur(
            Array.isArray(k.prosedur_pasien)
                ? k.prosedur_pasien.map((p: any) => p.TINDAKAN).join(", ")
                : ""
        );
        setIcd9(
            Array.isArray(k.prosedur_pasien)
                ? k.prosedur_pasien.map((p: any) => p.KODE).join(", ")
                : ""
        );
        setTindakanProsedurSekunder(
            Array.isArray(k.prosedur_pasien)
                ? k.prosedur_pasien.filter((p: any) => p.UTAMA === 2).map((p: any) => p.TINDAKAN).join(", ")
                : ""
        );
        setIcd9Sekunder(
            Array.isArray(k.prosedur_pasien)
                ? k.prosedur_pasien.filter((p: any) => p.UTAMA === 2).map((p: any) => p.KODE).join(", ")
                : ""
        );
        setRiwayatAlergi(
            Array.isArray(k.riwayat_alergi)
                ? k.riwayat_alergi.map((a: any) => a.DESKRIPSI).join(", ")
                : ""
        );
        setKeadaanPulang(k.pasien_pulang?.keadaan_pulang?.DESKRIPSI ?? "");
        setCaraPulang(k.pasien_pulang?.cara_pulang?.DESKRIPSI ?? "");
        setPoliTujuan(k.jadwal_kontrol?.ruangan?.DESKRIPSI ?? "");
        setTanggalKontrol(k.jadwal_kontrol?.TANGGAL ?? "");
        setJamKontrol(k.jadwal_kontrol?.JAM ?? "");
        setNoSuratBPJS(k.jadwal_kontrol?.NOMOR_REFERENSI ?? "");
        setPermintaanKonsul(
            Array.isArray(k.permintaan_konsul)
                ? k.permintaan_konsul.map((item: any) => ({
                    permintaan: item.PERMINTAAN_TINDAKAN || "",
                    jawaban: item.jawaban_konsul?.JAWABAN || "",
                }))
                : []
        );
        setTerapiPulang(
            Array.isArray(k.order_resep)
                ? k.order_resep
                    .filter((resep: any) => resep.RESEP_PASIEN_PULANG === 1)
                    .flatMap((resep: any) =>
                        Array.isArray(resep.order_resep_detil)
                            ? resep.order_resep_detil.map((detil: any) => ({
                                namaObat: detil.nama_obat?.NAMA || "",
                                jumlah: detil.JUMLAH || "",
                                frekuensi: detil.frekuensi_obat?.FREKUENSI || "",
                                caraPemberian: detil.cara_pakai?.DESKRIPSI || "",
                            }))
                            : []
                    )
                : []
        );
        setGelarDepanDokter(k.dokter_d_p_j_p?.GELAR_DEPAN + "." || "");
        setGelarBelakangDokter(k.dokter_d_p_j_p?.GELAR_BELAKANG || "");
        setNamaDokter(k.dokter_d_p_j_p?.NAMA || "");

        toast.success("Data kunjungan pasien berhasil dimuat dari sumber asli.");
    };


    const handleSave = async () => {
        try {
            const response = await axios.post(route("eklaim.editData.storeResumeMedis"), { jenisSave: dataKlaim.edit, resumeMedis: dataResumeMedis }, { headers: { 'Content-Type': 'application/json' } });
            if (response.data.success) {
                toast.success(response.data.success);
                window.location.reload(); // Reload halaman setelah sukses
            }
            if (response.data.error) toast.error(response.data.error);
        } catch (error: any) {
            // Tangani error dari axios
            if (error.response && error.response.data && error.response.data.error) {
                toast.error(error.response.data.error);
            } else if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Terjadi kesalahan saat menyimpan data.");
            }
            console.error("Error saving data:", error);
        }
    };

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
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <Label htmlFor="mode-switch" className=" text-base">
                                                            Asli
                                                        </Label>
                                                        <Switch
                                                            id="mode-switch"
                                                            checked={editMode === 1}
                                                            onCheckedChange={async (checked) => {
                                                                try {
                                                                    router.get(route('eklaim.klaim.switchEdit', { pengajuanKlaim: dataKlaim.id }), {}, {
                                                                        preserveScroll: true,
                                                                        preserveState: false,
                                                                    });
                                                                } catch (error) {
                                                                    toast.error("Gagal switch mode data.");
                                                                    console.error("Error switching mode:", error);
                                                                }
                                                            }}
                                                            className="scale-150" // Membesarkan switch
                                                        />
                                                        <span className="ml-2 text-lg">
                                                            Edit
                                                        </span>
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
                                                    {namaPasien || "Tidak ada nama"}
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
                                                    {noRM || "Tidak ada No. RM"}
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
                                                    {tanggalLahir
                                                        ? formatTanggalIndo(tanggalLahir)
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
                                                    {jenisKelamin === 1
                                                        ? "Laki-laki"
                                                        : jenisKelamin === 2
                                                            ? "Perempuan"
                                                            : jenisKelamin}
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
                                                    {ruangRawat || "Tidak ada Ruang Rawat"}
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
                                                    {penjamin || "Tidak ada Penjamin"}
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
                                                    {indikasiRawatInap || "Tidak ada Indikasi Rawat Inap"}
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
                                                    </div>
                                                    <div className="py-4 px-2 flex flex-col space-y-2">
                                                        <strong>Riwayat Penyakit Lalu :</strong>
                                                        <Textarea
                                                            value={riwayatPenyakitLalu || ""}
                                                            onChange={(e) => setRiwayatPenyakitLalu(e.target.value)}
                                                            placeholder="Masukkan riwayat penyakit lalu"
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
                                                        {permintaanKonsul.length === 0 ? (
                                                            <div className="text-gray-400 italic px-2 pb-2">Belum ada permintaan konsul.</div>
                                                        ) : (
                                                            permintaanKonsul.map((konsul, index) => (
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
                                                                            value={stripHtmlTags(konsul.jawaban)}
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
                                                            ))
                                                        )}

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
                                                                onClick={handleLoadKonsul}
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
                                                        <strong>Poli Tujuan :</strong> {poliTujuan ?? "Tidak ada"}
                                                        <br />
                                                        <strong>Tanggal :</strong> {tanggalKontrol ?? "Tidak ada"}
                                                        <br />
                                                        <strong>Jam :</strong> {jamKontrol ?? "Tidak ada"}
                                                        <br />
                                                        <strong>No Surat BPJS :</strong> {noSuratBPJS ?? "Tidak ada"}
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
                                            <strong>Bojonegoro, </strong> {formatTanggalIndo(tanggalKeluar)}
                                            <br />
                                            <strong>DPJP Pelayanan</strong>
                                            <div className="m-4">
                                                <QRCodeSVG
                                                    value={(gelarDepanDokter ? gelarDepanDokter + "." : "") + namaDokter + (gelarBelakangDokter ? " " + gelarBelakangDokter : "")}
                                                    size={128}
                                                    bgColor={"#ffffff"}
                                                    fgColor={"#000000"}
                                                    level={"L"}
                                                />
                                            </div>
                                            <strong>{(gelarDepanDokter ? gelarDepanDokter + "." : "") + namaDokter + (gelarBelakangDokter ? " " + gelarBelakangDokter : "")}</strong>
                                        </div>
                                    </div>

                                    {
                                        gabungTagihan != null ? (
                                            <PengkajianAwal
                                                imageBase64={imageBase64}
                                                nomorKunjungan={nomorKunjungan}
                                                dataResumeMedis={dataResumeMedis}
                                            />
                                        ) : (
                                            <div>
                                                <div className="flex justify-end mt-4">
                                                    <Button
                                                        type="submit"
                                                        variant="outline"
                                                        onClick={handleSave}
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
