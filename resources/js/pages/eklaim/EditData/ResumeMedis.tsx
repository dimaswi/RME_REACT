import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { Home } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import PengkajianAwal from "./PengkajianAwal";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import Triage from "./Triage";
import CPPT from "./CPPT";
import SearchableDropdown from "@/components/SearchableDropdown";


export default function EditResumeMedis() {
    const imageBase64 = usePage().props.imageBase64;

    // Hapus editMode dan resume_medis_edit, gunakan hanya data asli

    const [dataKlaim, setDataKlaim] = useState(usePage().props.pengajuanKlaim);

    // Ambil kunjungan_pasien dari penjamin, handle jika array/object/undefined
    const filteredKunjungan = (() => {
        // Jika mode edit, ambil dari data edit
        if (dataKlaim.edit === 1 && dataKlaim.resume_medis) {
            return Array.isArray(dataKlaim.resume_medis)
                ? dataKlaim.resume_medis
                : [dataKlaim.resume_medis];
        }
        // Jika bukan edit, ambil dari data asli
        if (dataKlaim.penjamin) {
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
        let sumberData: any = null;

        if (dataKlaim.edit === 1 && dataKlaim.resume_medis) {
            // Jika array, ambil elemen pertama; jika object, langsung pakai
            sumberData = Array.isArray(dataKlaim.resume_medis)
                ? dataKlaim.resume_medis[0]
                : dataKlaim.resume_medis;
        } else if (dataKlaim.penjamin) {
            const kunjunganPasienArr = Array.isArray(dataKlaim.penjamin.kunjungan_pasien)
                ? dataKlaim.penjamin.kunjungan_pasien
                : dataKlaim.penjamin.kunjungan_pasien
                    ? [dataKlaim.penjamin.kunjungan_pasien]
                    : [];
            sumberData = kunjunganPasienArr.find(
                (k: any) =>
                    k?.ruangan &&
                    [1, 3, 17].includes(Number(k.ruangan.JENIS_KUNJUNGAN))
            );

        }

        if (dataKlaim.edit === 1) {
            setNomorKunjunganIGD(sumberData.nomor_kunjungan_igd)
            setNomorKunjunganRawatInap(sumberData.nomor_kunjungan_rawat_inap);
        } else {
            // Jika bukan mode edit, ambil nomor_kunjungan dari sumberData
            setNomorKunjunganRawatInap(dataKlaim.penjamin.kunjungan_pasien?.find?.((kp: any) => kp?.ruangan?.JENIS_KUNJUNGAN === 3).NOMOR);
            setNomorKunjunganIGD(dataKlaim.penjamin.kunjungan_pasien?.find?.((kp: any) => kp?.ruangan?.JENIS_KUNJUNGAN === 3).tagihan_pendaftaran.gabung_tagihan.kunjungan_pasien.find?.((kp: any) => kp?.ruangan?.JENIS_KUNJUNGAN === 2).NOMOR);
        }

        if (!sumberData) return;
        setIdResumeMedis(sumberData.id_resume_medis ?? null);
        setNamaPasien(sumberData.nama_pasien ?? sumberData.pendaftaran_pasien?.pasien?.NAMA ?? "");
        setNoRM(sumberData.no_rm ?? sumberData.pendaftaran_pasien?.pasien?.NORM ?? "");
        setTanggalLahir(sumberData.tanggal_lahir ?? sumberData.pendaftaran_pasien?.pasien?.TANGGAL_LAHIR ?? "");
        setJenisKelamin(sumberData.jenis_kelamin ?? sumberData.pendaftaran_pasien?.pasien?.JENIS_KELAMIN ?? null);
        setRuangRawat(sumberData.ruang_rawat ?? sumberData.ruangan?.DESKRIPSI ?? "");
        setIndikasiRawatInap(sumberData.indikasi_rawat_inap ?? sumberData.pendaftaran_pasien?.resume_medis?.INDIKASI_RAWAT_INAP ?? "");
        setPenjamin(sumberData.penjamin ?? sumberData.penjamin_pasien?.jenis_penjamin?.DESKRIPSI ?? "");
        setTanggalMasuk(sumberData.tanggal_masuk ?? sumberData.pendaftaran_pasien?.TANGGAL ?? "");
        setTanggalKeluar(sumberData.tanggal_keluar ?? sumberData.KELUAR ?? "");
        setLamaDirawat(
            sumberData.lama_dirawat ??
            handleLamaDirawat(
                sumberData.tanggal_masuk ?? sumberData.pendaftaran_pasien?.TANGGAL,
                sumberData.tanggal_keluar ?? sumberData.KELUAR
            )
        );
        setRiwayatPenyakitSekarang(sumberData.riwayat_penyakit_sekarang ?? sumberData.anamnesis_pasien?.DESKRIPSI ?? "");
        setRiwayatPenyakitLalu(sumberData.riwayat_penyakit_lalu ?? sumberData.rpp?.DESKRIPSI ?? "");
        setPemeriksaanFisik(sumberData.pemeriksaan_fisik.DESKRIPSI ?? sumberData.pemeriksaan_fisik ?? "");
        setDiagnosaUtama(
            sumberData.diagnosa_utama ??
            sumberData.diagnosa_pasien?.find?.((d: any) => d.UTAMA === 1)?.DIAGNOSA ??
            ""
        );
        setIcd10(
            sumberData.icd10_utama ??
            sumberData.diagnosa_pasien?.find?.((d: any) => d.UTAMA === 1)?.KODE ??
            ""
        );
        setTindakanProsedur(
            sumberData.tindakan_prosedur ??
            sumberData.prosedur_pasien?.map?.((p: any) => p.TINDAKAN).join(", ") ??
            ""
        );
        setIcd9(
            sumberData.icd9_utama ??
            sumberData.prosedur_pasien?.map?.((p: any) => p.KODE).join(", ") ??
            ""
        );
        setDiagnosaSekunder(
            sumberData.diagnosa_sekunder ??
            sumberData.diagnosa_pasien?.filter?.((d: any) => d.UTAMA === 2).map((d: any) => d.DIAGNOSA).join(", ") ??
            ""
        );
        setIcd10Sekunder(
            sumberData.icd10_sekunder ??
            sumberData.diagnosa_pasien?.filter?.((d: any) => d.UTAMA === 2).map((d: any) => d.KODE).join(", ") ??
            ""
        );
        setTindakanProsedurSekunder(
            sumberData.tindakan_prosedur_sekunder ??
            sumberData.prosedur_pasien?.filter?.((p: any) => p.UTAMA === 2).map((p: any) => p.TINDAKAN).join(", ") ??
            ""
        );
        setIcd9Sekunder(
            sumberData.icd9_sekunder ??
            sumberData.prosedur_pasien?.filter?.((p: any) => p.UTAMA === 2).map((p: any) => p.KODE).join(", ") ??
            ""
        );
        setRiwayatAlergi(
            sumberData.riwayat_alergi?.map?.((a: any) => a.DESKRIPSI).join(", ") ??
            sumberData.riwayat_alergi ??
            ""
        );
        setKeadaanPulang(sumberData.keadaan_pulang ?? sumberData.pasien_pulang?.keadaan_pulang?.DESKRIPSI ?? "");
        setCaraPulang(sumberData.cara_pulang ?? sumberData.pasien_pulang?.cara_pulang?.DESKRIPSI ?? "");
        setPoliTujuan(sumberData.intruksi_tindak_lanjut?.poli_tujuan ?? sumberData.jadwal_kontrol?.ruangan?.DESKRIPSI ?? "");
        setTanggalKontrol(sumberData.intruksi_tindak_lanjut?.tanggal ?? sumberData.jadwal_kontrol?.TANGGAL ?? "");
        setJamKontrol(sumberData.intruksi_tindak_lanjut?.jam ?? sumberData.jadwal_kontrol?.JAM ?? "");
        setNoSuratBPJS(sumberData.intruksi_tindak_lanjut?.nomor_bpjs ?? sumberData.jadwal_kontrol?.NOMOR_REFERENSI ?? "");

        setPermintaanKonsul(
            Array.isArray(sumberData.permintaan_konsul)
                ? sumberData.permintaan_konsul.map((item: any) => ({
                    permintaan: item.PERMINTAAN_TINDAKAN || item.pertanyaan || "",
                    jawaban: item.jawaban_konsul?.JAWABAN || item.jawaban || "",
                }))
                : []
        );
        setTerapiPulang(
            Array.isArray(sumberData.terapi_pulang)
                ? sumberData.terapi_pulang.map((detil: any) => ({
                    namaObat: detil.nama_obat || "",
                    jumlah: detil.jumlah || "",
                    frekuensi: detil.frekuensi || "",
                    caraPemberian: detil.cara_pemberian || "",
                }))
                : Array.isArray(sumberData.order_resep)
                    ? sumberData.order_resep
                        .filter((resep: any) => resep.RESEP_PASIEN_PULANG === 1)
                        .flatMap((resep: any) =>
                            Array.isArray(resep.order_resep_detil)
                                ? resep.order_resep_detil.map((detil: any) => ({
                                    namaObat: detil.namaObat || detil.nama_obat?.NAMA || detil.NAMA || "",
                                    jumlah: detil.jumlah || detil.JUMLAH || "",
                                    frekuensi: detil.frekuensi || detil.frekuensi_obat?.FREKUENSI || "",
                                    caraPemberian: detil.caraPemberian || detil.cara_pakai?.DESKRIPSI || "",
                                }))
                                : []
                        )
                    : []
        );
        if (sumberData.dokter) {
            // Data edit: nama_dokter sudah satu string
            setNamaDokter(sumberData.dokter);
            setGelarDepanDokter(""); // Kosongkan agar tidak double
            setGelarBelakangDokter("");
        } else {
            // Data asli: field terpisah
            setNamaDokter(sumberData.dokter_d_p_j_p?.NAMA || "");
            setGelarDepanDokter(sumberData.dokter_d_p_j_p?.GELAR_DEPAN ? sumberData.dokter_d_p_j_p.GELAR_DEPAN + "." : "");
            setGelarBelakangDokter(sumberData.dokter_d_p_j_p?.GELAR_BELAKANG || "");
        }
        setDokumenPengkajianAwalLoaded(dataKlaim.pengkajian_awal || false);
        setDokumenTriageLoaded(dataKlaim.triage || false);
        setDokumenCPPTLoaded(dataKlaim.cppt || false);
    }, [dataKlaim]);

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
    const [nomorKunjunganRawatInap, setNomorKunjunganRawatInap] = useState<string | null>(null);
    const [nomorKunjunganIGD, setNomorKunjunganIGD] = useState<string | null>(null);
    const [terapiPulang, setTerapiPulang] = useState<{ namaObat: string; jumlah: string; frekuensi: string; caraPemberian: string }[]>([]);
    const [dokumenPengkajianAwalLoaded, setDokumenPengkajianAwalLoaded] = useState<any>(false);
    const [dokumenTriageLoaded, setDokumenTriageLoaded] = useState<any>(false);
    const [dokumenCPPTLoaded, setDokumenCPPTLoaded] = useState<any>(false);

    const dataResumeMedis = {
        nomor_kunjungan_rawat_inap: nomorKunjunganRawatInap || null,
        nomor_kunjungan_igd: nomorKunjunganIGD || null,
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
        permintaan_konsul: permintaanKonsul || null,
        terapi_pulang: terapiPulang || null,
        instruksi_tindak_lanjut: {
            poliTujuan: poliTujuan || null,
            tanggal: tanggalKontrol || null,
            jam: jamKontrol || null,
            nomor_bpjs: noSuratBPJS || null,
        },
        lembar_pengkajian_awal: dokumenPengkajianAwalLoaded,
        lembar_triage: dokumenTriageLoaded,
        lembar_cppt: dokumenCPPTLoaded,
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

    //State untuk dokumen lainnya
    const [dokumenPengkajianAwal, setDokumenPengkajianAwal] = useState<any>(false);
    const [dokumenTriage, setDokumenTriage] = useState<any>(false);
    const [dokumenCPPT, setDokumenCPPT] = useState<any>(false);

    const handleTriageChange = (data: any) => {
        setDokumenTriage(data === false ? false : data);
    };

    const handlePengkajianAwalChange = (data: any) => {
        setDokumenPengkajianAwal(data === false ? false : data);
    };

    const handleCPPTChange = (data: any) => {
        setDokumenCPPT(data === false ? false : data);
    };

    const handleSave = async () => {
        try {
            const response = await axios.post(route("eklaim.editData.storeResumeMedis"),
                {
                    jenisSave: dataKlaim.edit,
                    resumeMedis: dataResumeMedis,
                    pengkajianAwal: dokumenPengkajianAwal,
                    triage: dokumenTriage,
                    cppt: dokumenCPPT,

                }, { headers: { 'Content-Type': 'application/json' } });
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

    const [obatOptions, setObatOptions] = useState<any[]>([]);

    const handleSearchObat = async (keyword: string) => {
        try {
            const res = await axios.get(route("getNamaObat"), { params: { q: keyword } });
            setObatOptions(res.data);
        } catch {
            setObatOptions([]);
        }
    };

    const getObatDropdownData = (value: string, options: any[]) => {
        if (!value) return options;
        // Cek apakah value sudah ada di options
        const exists = options.some((item) => item?.DESKRIPSI === value);
        if (!exists) {
            // Tambahkan value manual agar tetap muncul di dropdown
            return [{ DESKRIPSI: value, ID: value }, ...options];
        }
        return options;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Resume Medis" />
            <div className="p-4">
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
                                                {
                                                    dataKlaim.resume_medis && (
                                                        <td>
                                                            <div className="flex items-center gap-4 mb-4">
                                                                <Label htmlFor="mode-switch" className=" text-base">
                                                                    Asli
                                                                </Label>
                                                                <Switch
                                                                    id="mode-switch"
                                                                    checked={dataKlaim.edit === 1}
                                                                    onCheckedChange={async (checked) => {
                                                                        try {
                                                                            await router.get(
                                                                                route('eklaim.klaim.switchEdit', { pengajuanKlaim: dataKlaim.id }),
                                                                                {},
                                                                                {
                                                                                    preserveScroll: true,
                                                                                    preserveState: false,
                                                                                }
                                                                            );
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
                                                    )
                                                }
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

                                            {/* Administrasi Pasien */}
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

                                            {/* Riwayat Penyakit */}
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

                                            {/* Pemeriksaan Fisik */}
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

                                            {/* Konsultasi */}
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

                                            {/* Diagnosa */}
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

                                            {/* Riwayat Alergi */}
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

                                            {/* Pasien Pulang */}
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

                                            {/* Terapi Pulang */}
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
                                                        <SearchableDropdown
                                                            data={getObatDropdownData(terapi.namaObat, obatOptions)}
                                                            value={terapi.namaObat}
                                                            setValue={(val: string) => handleUpdateTerapi(index, "namaObat", val)}
                                                            placeholder="Cari nama obat"
                                                            getOptionLabel={(item) => item?.DESKRIPSI ?? ""}
                                                            getOptionValue={(item) => item?.DESKRIPSI ?? ""}
                                                            onSearch={handleSearchObat}
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
                                                            value={Number(terapi.jumlah)}
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

                                            {/* Intruksi Tidak Lanjut */}
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

                                            {/* Tambahan Dokumen Lainnya */}
                                            <tr
                                                style={{
                                                    verticalAlign: "middle",
                                                    height: 70,
                                                    width: "20%",
                                                    border: "1px solid #000",
                                                    paddingLeft: 5,
                                                    paddingRight: 5,
                                                }}>
                                                <td
                                                    colSpan={8}
                                                    style={{
                                                        verticalAlign: "middle",
                                                        textAlign: "center",
                                                        height: 70,
                                                        width: "20%",
                                                        border: "1px solid #000",
                                                        paddingLeft: 5,
                                                        paddingRight: 5,
                                                    }}
                                                >
                                                    <strong>Tambahan Dokumen Lainnya</strong>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    style={{
                                                        verticalAlign: "middle",
                                                        height: 70,
                                                        border: "1px solid #000",
                                                    }}
                                                >
                                                    <div className="px-2 py-4 gap-2 text-center">
                                                        Pengkajian Awal
                                                    </div>
                                                </td>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "middle",
                                                        height: 70,
                                                        border: "1px solid #000",
                                                    }}
                                                >
                                                    <div className="px-2 py-4 gap-2 text-center">
                                                        <Checkbox
                                                            className="h-8 w-8"
                                                            checked={dokumenPengkajianAwalLoaded}
                                                            onCheckedChange={(checked) => {
                                                                setDokumenPengkajianAwalLoaded(checked);
                                                                if (!checked) setDokumenPengkajianAwal(false);
                                                            }} />
                                                    </div>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    style={{
                                                        verticalAlign: "middle",
                                                        height: 70,
                                                        border: "1px solid #000",
                                                    }}
                                                >
                                                    <div className="px-2 py-4 gap-2 text-center">
                                                        Triage
                                                    </div>
                                                </td>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "middle",
                                                        height: 70,
                                                        border: "1px solid #000",
                                                    }}
                                                >
                                                    <div className="px-2 py-4 gap-2 text-center">
                                                        <Checkbox
                                                            className="h-8 w-8"
                                                            checked={dokumenTriageLoaded}
                                                            onCheckedChange={(checked) => {
                                                                setDokumenTriageLoaded(checked);
                                                                if (!checked) setDokumenTriage(false);
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    style={{
                                                        verticalAlign: "middle",
                                                        height: 70,
                                                        border: "1px solid #000",
                                                    }}
                                                >
                                                    <div className="px-2 py-4 gap-2 text-center">
                                                        CPPT
                                                    </div>
                                                </td>
                                                <td
                                                    colSpan={2}
                                                    style={{
                                                        verticalAlign: "middle",
                                                        height: 70,
                                                        border: "1px solid #000",
                                                    }}
                                                >
                                                    <div className="px-2 py-4 gap-2 text-center">
                                                        <Checkbox
                                                            className="h-8 w-8"
                                                            checked={dokumenCPPTLoaded}
                                                            onCheckedChange={(checked) => {
                                                                setDokumenCPPTLoaded(checked);
                                                                if (!checked) setDokumenCPPT(false);
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>

                                        </tbody>
                                    </table>

                                    {
                                        dokumenPengkajianAwalLoaded && (
                                            <div>
                                                <PengkajianAwal
                                                    imageBase64={imageBase64}
                                                    onChange={handlePengkajianAwalChange}
                                                    nomorKunjungan={nomorKunjunganIGD}
                                                    mode={dataKlaim.edit}
                                                />
                                            </div>
                                        )
                                    }

                                    {
                                        dokumenTriageLoaded && (
                                            <div>
                                                <Triage
                                                    imageBase64={imageBase64}
                                                    onChange={handleTriageChange}
                                                    nomorKunjungan={nomorKunjunganIGD}
                                                    mode={dataKlaim.edit}
                                                />
                                            </div>
                                        )
                                    }

                                    {
                                        dokumenCPPTLoaded && (
                                            <div>
                                                <CPPT
                                                    imageBase64={imageBase64}
                                                    onChange={handleCPPTChange}
                                                    nomorKunjungan={nomorKunjunganRawatInap}
                                                    mode={dataKlaim.edit}
                                                />
                                            </div>
                                        )
                                    }

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


                                    {/* {
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
                                    } */}
                                </>
                            ))}
                        </ul>

                    )}
                </div >
            </div>
        </AppLayout >
    )
}
