import { useEffect, useState } from "react";
import axios from "axios";
import { set } from "date-fns";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Check } from "lucide-react";
import SearchableDropdown from "@/components/SearchableDropdown";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TriageProps {
    imageBase64: string;
    onChange?: (data: any) => void;
    nomorKunjungan?: string | null;
    mode?: number | null;
}


export default function Triage({ imageBase64, onChange, nomorKunjungan, mode }: TriageProps) {
    const handleLoadData = async () => {
        console.log("mode triage", mode);
        if (mode === 1) {
            const response = await axios.get(route('eklaim.getDataTriageEdit', { nomorKunjungan: nomorKunjungan }))
                .then(response => {
                    setNamaPasien(response.data.nama_pasien || "");
                    setTanggalLahir(response.data.tanggal_lahir || "");
                    setNORM(response.data.no_rm || "");
                    setJenisKelamin(response.data.jenis_kelamin);
                    setTanggalKedatangan(response.data.tanggal_kedatangan || "-");
                    setCaraDatang(response.data.cara_datang || "");
                    setAlatTransportasi(response.data.alat_transportasi || "Tidak ada");
                    setPengantar(response.data.pengantar || "Tidak ada");
                    setPasienRujukan(response.data.asal_rujukan || "Tidak");
                    setPasienRujukanSisrute(response.data.pasien_rujukan_sisrute ? true : false);
                    setDikirimPolisi(response.data.dikirim_polisi || "Tidak");
                    setPermintaanVisum(response.data.permintaan_visum ? true : false);
                    setJenisKasus(response.data.jenis_kasus || "");
                    setLokasiKasus(response.data.lokasi_kasus || "");
                    setLakaLantas(response.data.laka_lantas ? true : false);
                    setKecelakaanKerja(response.data.kecelakaan_kerja ? true : false);
                    setKeluhanUtama(response.data.keluhan_utama || "");
                    setAnamnesaTerpimpin(response.data.anamnesa_terpimpin || "");
                    setTekananDarah(response.data.tekanan_darah || "");
                    setNadi(response.data.nadi || "");
                    setPernapasan(response.data.pernapasan || "");
                    setSuhu(response.data.suhu || "");
                    setNyeri(response.data.nyeri || "");
                    setMetodeUkurNyeri(response.data.metode_ukur_nyeri || "");
                    setResustasi(response.data.resustasi ? true : false);
                    setEmergency(response.data.emergency ? true : false);
                    setUrgent(response.data.urgent ? true : false);
                    setLessUrgent(response.data?.less_urgent ? true : false);
                    setNonUrgent(response.data?.non_urgent ? true : false);
                    setZonaHitam(response.data?.zona_hitam ? true : false);

                    setForm({
                        namaPasien: namaPasien || "",
                        tanggalLahir: tanggalLahir || "",
                        noRM: NORM || "",
                        jenisKelamin: jenisKelamin || "",
                        nomorKunjungan: nomorKunjungan || "",
                        tanggalKedatangan: tanggalKedatangan || "",
                        alatTransportasi: alatTransportasi || "",
                        caraDatang: caraDatang || "",
                        pengantar: pengantar || "",
                        pasienRujukan: pasienRujukan || "",
                        pasienRujukanSisrute: pasienRujukanSisrute || false,
                        dikirimPolisi: dikirimPolisi || "",
                        permintaanVisum: permintaanVisum || false,
                        jenisKasus: jenisKasus || "",
                        lokasiKasus: lokasiKasus || "",
                        lakaLantas: lakaLantas || false,
                        kecelakaanKerja: kecelakaanKerja || false,
                        keluhanUtama: keluhanUtama || "",
                        anamnesaTerpimpin: anamnesaTerpimpin || "",
                        tekananDarah: tekananDarah || "",
                        nadi: nadi || "",
                        pernapasan: pernapasan || "",
                        suhu: suhu || "",
                        nyeri: nyeri || "",
                        metodeUkurNyeri: metodeUkurNyeri || "",
                        resustasi: resustasi || false,
                        emergency: emergency || false,
                        urgent: urgent || false,
                        less_urgent: lessUrgent || false,
                        non_urgent: nonUrgent || false,
                        zona_hitam: zonaHitam || false,
                    });
                })
                .catch(error => {
                    console.error("Error fetching data:", error);
                });

        }


        if (mode === 0) {
            await axios.get(route('eklaim.getDataTriage', { nomorKunjungan: nomorKunjungan }))
                .then(response => {
                    setForm({
                        namaPasien: namaPasien || "",
                        tanggalLahir: tanggalLahir || "",
                        noRM: NORM || "",
                        jenisKelamin: jenisKelamin || "",
                        nomorKunjungan: nomorKunjungan || "",
                        tanggalKedatangan: tanggalKedatangan || "",
                        alatTransportasi: alatTransportasi || "",
                        caraDatang: caraDatang || "",
                        pengantar: pengantar || "",
                        pasienRujukan: pasienRujukan || "",
                        pasienRujukanSisrute: pasienRujukanSisrute || false,
                        dikirimPolisi: dikirimPolisi || "",
                        permintaanVisum: permintaanVisum || false,
                        jenisKasus: jenisKasus || "",
                        lokasiKasus: lokasiKasus || "",
                        lakaLantas: lakaLantas || false,
                        kecelakaanKerja: kecelakaanKerja || false,
                        keluhanUtama: keluhanUtama || "",
                        anamnesaTerpimpin: anamnesaTerpimpin || "",
                        tekananDarah: tekananDarah || "",
                        nadi: nadi || "",
                        pernapasan: pernapasan || "",
                        suhu: suhu || "",
                        nyeri: nyeri || "",
                        metodeUkurNyeri: metodeUkurNyeri || "",
                        resustasi: resustasi || false,
                        emergency: emergency || false,
                        urgent: urgent || false,
                        less_urgent: lessUrgent || false,
                        non_urgent: nonUrgent || false,
                        zona_hitam: zonaHitam || false,
                    });

                    const kedatangan = JSON.parse(response.data.KEDATANGAN || "{}");
                    const kasus = JSON.parse(response.data.KASUS || "{}");
                    const anamnesis = JSON.parse(response.data.ANAMNESE || "{}");
                    const tandaVital = JSON.parse(response.data.TANDA_VITAL || "{}");
                    const dataResusitas = JSON.parse(response.data.RESUSITAS || "{}");
                    const dataEmergency = JSON.parse(response.data.EMERGENCY || "{}");
                    const dataUrgent = JSON.parse(response.data.URGENT || "{}");
                    const dataLessUrgent = JSON.parse(response.data.LESS_URGENT || "{}");
                    const dataNonUrgent = JSON.parse(response.data.NON_URGENT || "{}");
                    const dataZonaHitam = JSON.parse(response.data.DOA || "{}");

                    setNamaPasien(response.data.pasien.NAMA || "");
                    setTanggalLahir(response.data.pasien.TANGGAL_LAHIR || "");
                    setNORM(response.data.pasien.NORM || "");
                    setJenisKelamin(response.data.pasien.JENIS_KELAMIN == 1 ? "Laki-laki" : "Perempuan");
                    setTanggalKedatangan(kedatangan.TANGGAL || "-");
                    setCaraDatang(kedatangan.JENIS == 1 ? "Datang Sendiri" : "");
                    setAlatTransportasi(kedatangan.ALAT_TRANSPORTASI || "Tidak ada");
                    setPengantar(kedatangan.PENGANTAR || "Tidak ada");
                    setPasienRujukan(kedatangan.ASAL_RUJUKAN || "Tidak");
                    setPasienRujukanSisrute(kedatangan.SISRUTE ? true : false);
                    setDikirimPolisi(kedatangan.KEPOLISIAN || "Tidak");
                    setPermintaanVisum(kedatangan.PERMINTAAN_VISUM ? true : false);
                    setJenisKasus(kasus.JENIS ?? "");
                    setLokasiKasus(kasus.DIMANA || "");
                    setLakaLantas(kasus.LAKA_LANTAS ? true : false);
                    setKecelakaanKerja(kasus.KECELAKAAN_KERJA ? true : false);
                    setKeluhanUtama(anamnesis.KELUHAN_UTAMA || "");
                    setAnamnesaTerpimpin(anamnesis.TERPIMPIN || "");
                    setTekananDarah(tandaVital.SISTOLE + "/" + tandaVital.DIASTOLE || "");
                    setNadi(tandaVital.FREK_NADI || "");
                    setPernapasan(tandaVital.FREK_NAFAS || "");
                    setSuhu(tandaVital.SUHU || "");
                    setNyeri(tandaVital.SKALA_NYERI || "");
                    setMetodeUkurNyeri(tandaVital.METODE_UKUR || "");
                    setResustasi(dataResusitas?.CHECKED == 1 ? true : false);
                    setEmergency(dataEmergency?.CHECKED == 1 ? true : false);
                    setUrgent(dataUrgent?.CHECKED == 1 ? true : false);
                    setLessUrgent(dataLessUrgent?.CHECKED == 1 ? true : false);
                    setNonUrgent(dataNonUrgent?.CHECKED == 1 ? true : false);
                    setZonaHitam(dataZonaHitam?.CHECKED == 1 ? true : false);
                })
                .catch(error => {
                    console.error("Error fetching data:", error);
                });
        }
    }

    useEffect(() => {
        handleLoadData();
    }, []); // atau [] jika hanya ingin sekali saat mount

    // State untuk data tampilan
    const [namaPasien, setNamaPasien] = useState("");
    const [tanggalLahir, setTanggalLahir] = useState("");
    const [NORM, setNORM] = useState("");
    const [jenisKelamin, setJenisKelamin] = useState("");
    const [tanggalKedatangan, setTanggalKedatangan] = useState("");
    const [alatTransportasi, setAlatTransportasi] = useState("");
    const [caraDatang, setCaraDatang] = useState("");
    const [pengantar, setPengantar] = useState("");
    const [pasienRujukan, setPasienRujukan] = useState("");
    const [pasienRujukanSisrute, setPasienRujukanSisrute] = useState(false);
    const [dikirimPolisi, setDikirimPolisi] = useState("");
    const [permintaanVisum, setPermintaanVisum] = useState(false);
    const [jenisKasus, setJenisKasus] = useState("");
    const [lokasiKasus, setLokasiKasus] = useState("");
    const [lakaLantas, setLakaLantas] = useState(false);
    const [kecelakaanKerja, setKecelakaanKerja] = useState(false);
    const [keluhanUtama, setKeluhanUtama] = useState("");
    const [anamnesaTerpimpin, setAnamnesaTerpimpin] = useState("");
    const [tekananDarah, setTekananDarah] = useState("");
    const [nadi, setNadi] = useState("");
    const [pernapasan, setPernapasan] = useState("");
    const [suhu, setSuhu] = useState("");
    const [nyeri, setNyeri] = useState("");
    const [metodeUkurNyeri, setMetodeUkurNyeri] = useState("");
    const [resustasi, setResustasi] = useState(false);
    const [emergency, setEmergency] = useState(false);
    const [urgent, setUrgent] = useState(false);
    const [lessUrgent, setLessUrgent] = useState(false);
    const [nonUrgent, setNonUrgent] = useState(false);
    const [zonaHitam, setZonaHitam] = useState(false);

    const [form, setForm] = useState({
        nama_pasien: "",
        tanggal_lahir: "",
        no_rm: "",
        jenis_kelamin: "",
        nomor_kunjungan: "",
        tanggal_kedatangan: "",
        alat_transportasi: "",
        cara_datang: "",
        pengantar: "",
        pasien_rujukan: "",
        pasien_rujukan_sisrute: false,
        dikirim_polisi: "",
        permintaan_visum: false,
        jenis_kasus: "",
        lokasi_kasus: "",
        laka_lantas: false,
        kecelakaan_kerja: false,
        keluhan_utama: "",
        anamnesa_terpimpin: "",
        tekanan_darah: "",
        nadi: "",
        pernapasan: "",
        suhu: "",
        nyeri: "",
        metode_ukur_nyeri: "",
        resustasi: false,
        emergency: false,
        urgent: false,
        less_urgent: false,
        non_urgent: false,
        zona_hitam: false,
    });

    useEffect(() => {
        setForm({
            nama_pasien: namaPasien || "",
            tanggal_lahir: tanggalLahir || "",
            no_rm: NORM || "",
            jenis_kelamin: jenisKelamin || "",
            nomor_kunjungan: nomorKunjungan || "",
            tanggal_kedatangan: tanggalKedatangan || "",
            alat_transportasi: alatTransportasi || "",
            cara_datang: caraDatang || "",
            pengantar: pengantar || "",
            pasien_rujukan: pasienRujukan || "",
            pasien_rujukan_sisrute: pasienRujukanSisrute || false,
            dikirim_polisi: dikirimPolisi || "",
            permintaan_visum: permintaanVisum || false,
            jenis_kasus: jenisKasus || "",
            lokasi_kasus: lokasiKasus || "",
            laka_lantas: lakaLantas || false,
            kecelakaan_kerja: kecelakaanKerja || false,
            keluhan_utama: keluhanUtama || "",
            anamnesa_terpimpin: anamnesaTerpimpin || "",
            tekanan_darah: tekananDarah || "",
            nadi: nadi || "",
            pernapasan: pernapasan || "",
            suhu: suhu || "",
            nyeri: nyeri || "",
            metode_ukur_nyeri: metodeUkurNyeri || "",
            resustasi: resustasi || false,
            emergency: emergency || false,
            urgent: urgent || false,
            less_urgent: lessUrgent || false,
            non_urgent: nonUrgent || false,
            zona_hitam: zonaHitam || false,
        });
    }, [
        namaPasien,
        tanggalLahir,
        NORM,
        jenisKelamin,
        nomorKunjungan,
        tanggalKedatangan,
        alatTransportasi,
        caraDatang,
        pengantar,
        pasienRujukan,
        pasienRujukanSisrute,
        dikirimPolisi,
        permintaanVisum,
        jenisKasus,
        lokasiKasus,
        lakaLantas,
        kecelakaanKerja,
        keluhanUtama,
        anamnesaTerpimpin,
        tekananDarah,
        nadi,
        pernapasan,
        suhu,
        nyeri,
        metodeUkurNyeri,
        resustasi,
        emergency,
        urgent,
        lessUrgent,
        nonUrgent,
        zonaHitam,
    ])

    useEffect(() => {
        if (onChange) onChange(form);
    }, [form]);

    // Tambahkan fungsi handler
    const handleTriageCheck = (type: string) => {
        setResustasi(type === "resustasi");
        setEmergency(type === "emergency");
        setUrgent(type === "urgent");
        setLessUrgent(type === "lessUrgent");
        setNonUrgent(type === "nonUrgent");
        setZonaHitam(type === "zonaHitam");
    };

    return (
        <div className="pt-4">
            {

                <>
                    <table style={{ fontFamily: "halvetica, sans-serif", width: "100%", borderCollapse: "collapse", border: "1px solid #000" }}>
                        <tbody>

                            {/* KOP */}
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
                            </tr>
                            <tr style={{ background: "black", color: "white", textAlign: "center" }}>
                                <td colSpan={8}>
                                    <h3>TRIAGE </h3>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={8} className="text-center border border-black">
                                    Triage dilakukan pada saat pasien masuk ke IGD dan sebelum pasien mendaftar. <br />
                                </td>
                            </tr>

                            {/* JUDUL */}
                            <tr>
                                <td colSpan={4} className="border border-black">
                                    <div className="text-center p-2">
                                        <h3 className="align-middle font-bold text-xl">LEMBAR TRIAGE</h3>
                                    </div>
                                </td>
                                <td colSpan={4} className="border border-black pl-2">
                                    <div className="text-left grid grid-cols-2 w-9/12">
                                        <div>
                                            Nama Pasien
                                        </div>

                                        <div>
                                            : {namaPasien}
                                        </div>
                                    </div>

                                    <div className="text-left grid grid-cols-2 w-9/12">
                                        <div>
                                            Tanggal Lahir
                                        </div>

                                        <div>
                                            : {tanggalLahir}
                                        </div>
                                    </div>

                                    <div className="text-left grid grid-cols-2 w-9/12">
                                        <div>
                                            No. RM
                                        </div>

                                        <div>
                                            : {NORM}
                                        </div>
                                    </div>

                                    <div className="text-left grid grid-cols-2 w-9/12">
                                        <div>
                                            Jenis Kelamin
                                        </div>

                                        <div>
                                            : {jenisKelamin}
                                        </div>
                                    </div>

                                </td>
                            </tr>

                            {/* Cara Masuk */}
                            <tr className="border border-black">
                                <td colSpan={1} className="border border-black">
                                    <div className="text-center align-middle">
                                        <h3 className="align-middle font-bold text-lg">Cara Masuk</h3>
                                    </div>
                                </td>
                                <td colSpan={7} className="border border-black p-2">
                                    <div className="text-left grid grid-cols-10 w-full">
                                        <div className="col-span-2">
                                            Waktu Kedatangan
                                        </div>

                                        <div className="col-span-8">
                                            <Input
                                                type="datetime-local"
                                                value={tanggalKedatangan}
                                                onChange={(e) => setTanggalKedatangan(e.target.value)}
                                                className="w-full h-8"
                                                placeholder="YYYY-MM-DD HH:mm:ss"
                                            />
                                        </div>
                                    </div>
                                    <div className="text-left grid grid-cols-10 w-full">
                                        <div className="col-span-2">
                                            Cara Datang
                                        </div>

                                        <div className="col-span-8">
                                            <Input
                                                type="text"
                                                value={caraDatang}
                                                onChange={(e) => setCaraDatang(e.target.value)}
                                                className="w-full h-8"
                                                placeholder="Cara Datang"
                                            />
                                        </div>
                                    </div>

                                    <div className="text-left grid grid-cols-10 w-full">
                                        <div className="col-span-2">
                                            Transportasi
                                        </div>

                                        <div className="col-span-8">
                                            <Input
                                                type="text"
                                                value={alatTransportasi}
                                                onChange={(e) => setAlatTransportasi(e.target.value)}
                                                className="w-full h-8"
                                                placeholder="Transportasi"
                                            />
                                        </div>
                                    </div>

                                    <div className="text-left grid grid-cols-10 w-full">
                                        <div className="col-span-2">
                                            Pengantar
                                        </div>

                                        <div className="col-span-8">
                                            <Input
                                                type="text"
                                                value={pengantar}
                                                onChange={(e) => setPengantar(e.target.value)}
                                                className="w-full h-8"
                                                placeholder="Pengantar"
                                            />
                                        </div>
                                    </div>

                                    <div className="text-left grid grid-cols-10 w-full">
                                        <div className="col-span-2">
                                            Pasien Rujukan
                                        </div>

                                        <div className="col-span-8">
                                            <div className="grid grid-cols-2">
                                                <div>
                                                    <Input
                                                        type="text"
                                                        value={pasienRujukan}
                                                        onChange={(e) => setPasienRujukan(e.target.value)}
                                                        className="w-full h-8"
                                                        placeholder="Pasien Rujukan"
                                                    />
                                                </div>
                                                <div className="pt-1">
                                                    <Checkbox
                                                        checked={pasienRujukanSisrute}
                                                        onCheckedChange={(checked) => setPasienRujukanSisrute(checked)}
                                                        className="mx-2"
                                                    /> Melalui SISRUTE
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-left grid grid-cols-10 w-full">
                                        <div className="col-span-2">
                                            Dikirim dari Kepolisian
                                        </div>

                                        <div className="col-span-8">
                                            <div className="grid grid-cols-2">
                                                <div>
                                                    <Input
                                                        type="text"
                                                        value={dikirimPolisi}
                                                        onChange={(e) => setDikirimPolisi(e.target.value)}
                                                        className="w-full h-8"
                                                        placeholder="Dikirim dari Kepolisian"
                                                    />
                                                </div>
                                                <div className="pt-1">
                                                    <Checkbox
                                                        checked={permintaanVisum}
                                                        onCheckedChange={(checked) => setPermintaanVisum(checked)}
                                                        className="mx-2"
                                                    /> Permintaan Visum
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>

                            {/* Macam Kasus */}
                            <tr className="border border-black">
                                <td colSpan={1} className="border border-black">
                                    <div className="text-center align-middle">
                                        <h3 className="align-middle font-bold text-lg">Macam Kasus</h3>
                                    </div>
                                </td>
                                <td colSpan={7} className="border border-black p-2">
                                    <div className="text-left grid grid-cols-10 w-full">
                                        <div className="col-span-2">
                                            Jenis Kasus
                                        </div>

                                        <div className="col-span-8">
                                            <Select value={String(jenisKasus)} onValueChange={setJenisKasus}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Jenis Kasus" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">Trauma</SelectItem>
                                                    <SelectItem value="0">Non Trauma</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {
                                        jenisKasus === "1" ? (
                                            <>
                                                <div className="text-left grid grid-cols-10 w-full">
                                                    <div className="col-span-2">
                                                        Kasus
                                                    </div>

                                                    <div className="col-span-8">
                                                        <div className="">
                                                            <Checkbox
                                                                checked={kecelakaanKerja}
                                                                onCheckedChange={(checked) => setKecelakaanKerja(checked)}
                                                                className=""
                                                            /> <span className="mx-2">Kecelakaan Kerja</span>
                                                        </div>

                                                        <div className="">
                                                            <Checkbox
                                                                checked={lakaLantas}
                                                                onCheckedChange={(checked) => setLakaLantas(checked)}
                                                                className=""
                                                            /> <span className="mx-2">Kecelakaan Lalu Lintas</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-left grid grid-cols-10 w-full">
                                                    <div className="col-span-2">
                                                        Lokasi Kasus
                                                    </div>

                                                    <div className="col-span-8">
                                                        <Input
                                                            type="text"
                                                            value={lokasiKasus}
                                                            onChange={(e) => setLokasiKasus(e.target.value)}
                                                            className="w-full h-8"
                                                            placeholder="Lokasi Kasus"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-left grid grid-cols-10 w-full">
                                                <div className="col-span-2">
                                                    Lokasi Kasus
                                                </div>
                                                <div className="col-span-8">
                                                    <Input
                                                        type="text"
                                                        value={lokasiKasus}
                                                        onChange={(e) => setLokasiKasus(e.target.value)}
                                                        className="w-full h-8"
                                                        placeholder="Lokasi Kasus"
                                                    />
                                                </div>
                                            </div>
                                        )
                                    }
                                </td>
                            </tr>

                            {/* Anamnesis */}
                            <tr className="border border-black">
                                <td colSpan={1} className="border border-black p-2">
                                    <div className="text-center align-middle">
                                        <h3 className="font-bold text-lg">Anamnesis</h3>
                                    </div>
                                </td>

                                <td colSpan={7} className="border border-black p-2">
                                    <div className="text-left grid grid-cols-5 w-full">
                                        <div className="col-span-1">
                                            Keluhan Utama
                                        </div>
                                        <div className="col-span-4">
                                            <Textarea
                                                value={keluhanUtama}
                                                onChange={(e) => setKeluhanUtama(e.target.value)}
                                                className="w-full h-24"
                                                placeholder="Keluhan Utama"
                                            />
                                        </div>
                                    </div>

                                    <div className="text-left grid grid-cols-5 w-full">
                                        <div className="col-span-1">
                                            Anamnesa Terpimpin
                                        </div>
                                        <div className="col-span-4">
                                            <Textarea
                                                value={anamnesaTerpimpin}
                                                onChange={(e) => setAnamnesaTerpimpin(e.target.value)}
                                                className="w-full h-24"
                                                placeholder="Anamnesa Terpimpin"
                                            />
                                        </div>
                                    </div>
                                </td>
                            </tr>

                            {/* Tanda Vital */}
                            <tr>
                                <td colSpan={1} className="border border-black p-2">
                                    <div className="text-center align-middle">
                                        <h3 className="font-bold text-lg">Tanda Vital</h3>
                                    </div>
                                </td>
                                <td colSpan={7} className="border border-black p-2">
                                    <div className="text-left grid grid-cols-10 w-full">
                                        <div className="col-span-2">
                                            Tekanan darah
                                        </div>
                                        <div className="col-span-8">
                                            <Input
                                                type="text"
                                                value={tekananDarah}
                                                onChange={(e) => setTekananDarah(e.target.value)}
                                                className="w-full h-8"
                                                placeholder="Tekanan darah (mmHg)"
                                            />
                                        </div>
                                    </div>

                                    <div className="text-left grid grid-cols-10 w-full">
                                        <div className="col-span-2">
                                            Nadi
                                        </div>
                                        <div className="col-span-8">
                                            <Input
                                                type="text"
                                                value={nadi}
                                                onChange={(e) => setNadi(e.target.value)}
                                                className="w-full h-8"
                                                placeholder="Nadi (x/menit)"
                                            />
                                        </div>
                                    </div>

                                    <div className="text-left grid grid-cols-10 w-full">
                                        <div className="col-span-2">
                                            Pernapasan
                                        </div>
                                        <div className="col-span-8">
                                            <Input
                                                type="text"
                                                value={pernapasan}
                                                onChange={(e) => setPernapasan(e.target.value)}
                                                className="w-full h-8"
                                                placeholder="Pernapasan (x/menit)"
                                            />
                                        </div>
                                    </div>

                                    <div className="text-left grid grid-cols-10 w-full">
                                        <div className="col-span-2">
                                            Suhu
                                        </div>
                                        <div className="col-span-8">
                                            <Input
                                                type="text"
                                                value={suhu}
                                                onChange={(e) => setSuhu(e.target.value)}
                                                className="w-full h-8"
                                                placeholder="Suhu (°C)"
                                            />
                                        </div>
                                    </div>

                                    <div className="text-left grid grid-cols-10 w-full">
                                        <div className="col-span-2">
                                            Nyeri
                                        </div>
                                        <div className="col-span-5">
                                            <Input
                                                type="text"
                                                value={nyeri}
                                                onChange={(e) => setNyeri(e.target.value)}
                                                className="w-full h-8"
                                                placeholder="Nyeri"
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <Input
                                                type="text"
                                                value={metodeUkurNyeri}
                                                onChange={(e) => setMetodeUkurNyeri(e.target.value)}
                                                className="w-full h-8"
                                                placeholder="Metode Ukur"
                                            />
                                        </div>
                                    </div>
                                </td>
                            </tr>

                            {/* Triage */}
                            <tr>
                                <td colSpan={1} className="border border-black p-2">
                                    <div className="text-center align-middle">
                                        <h3 className="font-bold text-lg">Pemeriksaan</h3>
                                    </div>
                                </td>

                                <td colSpan={1} className="border border-black p-2 bg-blue-600">
                                    <div className="text-center align-middle text-white">
                                        Resustasi(P1)
                                    </div>
                                    <div className="text-center align-middle text-white">
                                        <Checkbox
                                            checked={resustasi}
                                            onCheckedChange={() => handleTriageCheck("resustasi")}
                                            className="mx-2"
                                        />
                                    </div>
                                </td>

                                <td colSpan={1} className="border border-black p-2 bg-red-600">
                                    <div className="text-center align-middle text-white">
                                        Emergency(P2)
                                    </div>
                                    <div className="text-center align-middle text-white">
                                        <Checkbox
                                            checked={emergency}
                                            onCheckedChange={() => handleTriageCheck("emergency")}
                                            className="mx-2"
                                        />
                                    </div>
                                </td>

                                <td colSpan={1} className="border border-black p-2 bg-yellow-600">
                                    <div className="text-center align-middle text-white">
                                        Urgent(P3)
                                    </div>
                                    <div className="text-center align-middle text-white">
                                        <Checkbox
                                            checked={urgent}
                                            onCheckedChange={() => handleTriageCheck("urgent")}
                                            className="mx-2"
                                        />
                                    </div>
                                </td>

                                <td colSpan={1} className="border border-black p-2 bg-green-600">
                                    <div className="text-center align-middle text-white">
                                        Less Urgent(P4)
                                    </div>

                                    <div className="text-center align-middle text-white">
                                        <Checkbox
                                            checked={lessUrgent}
                                            onCheckedChange={() => handleTriageCheck("lessUrgent")}
                                            className="mx-2"
                                        />
                                    </div>
                                </td>

                                <td colSpan={1} className="border border-black p-2 bg-white">
                                    <div className="text-center align-middle text-black">
                                        Non Urgent(P5)
                                    </div>

                                    <div className="text-center align-middle text-black">
                                        <Checkbox
                                            checked={nonUrgent}
                                            onCheckedChange={() => handleTriageCheck("nonUrgent")}
                                            className="mx-2"
                                        />
                                    </div>
                                </td>

                                <td colSpan={2} className="border border-black p-2 bg-black">
                                    <div className="text-center align-middle text-white">
                                        Zona Hitam (P0)
                                    </div>

                                    <div className="text-center align-middle text-white">
                                        <Checkbox
                                            checked={zonaHitam}
                                            onCheckedChange={() => handleTriageCheck("zonaHitam")}
                                            className="mx-2"
                                        />
                                    </div>
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </>

            }
        </div>
    );
}
