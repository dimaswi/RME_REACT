import AppLayout from "@/layouts/app-layout";
import SearchableDropdown from "@/components/SearchableDropdown";
import { BreadcrumbItem } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function DataKlaim() {
    const { dataKlaim } = usePage().props as { dataKlaim: any };
    const { pasien } = usePage().props as { pasien: any };
    const { dataPendaftaran } = usePage().props as { dataPendaftaran: any };
    const [caraMasuk, setCaraMasuk] = useState("");

    // State untuk ventilator fields
    const [openVentilator, setOpenVentilator] = useState(false);
    const [adaVentilator, setAdaVentilator] = useState(false);
    const [pemasangan, setPemasangan] = useState("");
    const [pencabutan, setPencabutan] = useState("");

    // Tambahkan state untuk ICU fields
    const [jenisPerawatan, setJenisPerawatan] = useState("");
    const [openICU, setOpenICU] = useState(false);
    const [adlSubAcute, setAdlSubAcute] = useState("");
    const [adlChronic, setAdlChronic] = useState("");
    const [icuIndicator, setIcuIndicator] = useState("");
    const [icuLos, setIcuLos] = useState("");

    // State untuk kelas pasien
    const [openKelasPasien, setOpenKelasPasien] = useState(false);


    console.log("Data Pendaftaran:", dataPendaftaran);

    // Parse dataKlaim.request (JSON string) menjadi object
    const isiRequestKlaim = useMemo(() => {
        try {
            return dataKlaim.request ? JSON.parse(dataKlaim.request) : {};
        } catch {
            return {};
        }
    }, [dataKlaim.request]);

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

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Klaim',
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengisian Data Klaim" />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Pengisian Data Klaim</h1>
                <div className="mb-4">
                    <div className="mb-3 p-2 border rounded bg-blue-50 text-sm">
                        <div>
                            <b>Tanggal Pengajuan:</b> {formatTanggalIndo(dataKlaim.tanggal_pengajuan)}
                        </div>
                        <div>
                            <b>Tanggal SEP:</b> {formatTanggalIndo(isiRequestKlaim.tglSEP)}
                        </div>
                        <div>
                            <b>Nomor Kartu:</b> {isiRequestKlaim.noKartu || "-"}
                        </div>
                        <div>
                            <b>Nomor SEP:</b> {isiRequestKlaim.noSEP || "-"}
                        </div>
                        <div>
                            <b>Nomor RM:</b> {isiRequestKlaim.NORM || "-"}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" htmlFor="cara_masuk">
                            Cara Masuk
                        </label>
                        <SearchableDropdown
                            data={caraMasukOptions}
                            value={caraMasuk}
                            setValue={setCaraMasuk}
                            placeholder="Pilih Cara Masuk"
                            getOptionLabel={item => item.DESKRIPSI}
                            getOptionValue={item => item.ID}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" htmlFor="jenis_perawatan">
                            Jenis Perawatan
                        </label>
                        <SearchableDropdown
                            data={jenisPerawatanOptions}
                            value={jenisPerawatan}
                            setValue={setJenisPerawatan}
                            placeholder="Pilih Jenis Perawatan"
                            getOptionLabel={item => item.DESKRIPSI}
                            getOptionValue={item => item.ID}
                        />
                    </div>
                </div>

                {/* FORM ICU */}
                <div className="mb-6 border rounded-lg">
                    <button
                        type="button"
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 rounded-t-lg hover:bg-gray-200 transition"
                        onClick={() => setOpenICU(v => !v)}
                    >
                        <span className="text-lg font-semibold">ICU</span>
                        {openICU ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                    {openICU && (
                        <div className="p-4 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label htmlFor="adl_sub_acute" className="block text-sm font-medium mb-1">
                                        ADL Sub Acute
                                    </label>
                                    <Input
                                        id="adl_sub_acute"
                                        name="adl_sub_acute"
                                        type="text"
                                        placeholder="Masukkan ADL Sub Acute"
                                        value={adlSubAcute}
                                        onChange={e => setAdlSubAcute(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="adl_chronic" className="block text-sm font-medium mb-1">
                                        ADL Chronic
                                    </label>
                                    <Input
                                        id="adl_chronic"
                                        name="adl_chronic"
                                        type="text"
                                        placeholder="Masukkan ADL Chronic"
                                        value={adlChronic}
                                        onChange={e => setAdlChronic(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="icu_indicator" className="block text-sm font-medium mb-1">
                                        ICU Indicator
                                    </label>
                                    <Input
                                        id="icu_indicator"
                                        name="icu_indicator"
                                        type="text"
                                        placeholder="Masukkan ICU Indicator"
                                        value={icuIndicator}
                                        onChange={e => setIcuIndicator(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="icu_los" className="block text-sm font-medium mb-1">
                                        ICU LOS
                                    </label>
                                    <Input
                                        id="icu_los"
                                        name="icu_los"
                                        type="text"
                                        placeholder="Masukkan ICU LOS"
                                        value={icuLos}
                                        onChange={e => setIcuLos(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* FORM VENTILATOR */}
                <div className="mb-6 border rounded-lg">
                    <button
                        type="button"
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 rounded-t-lg hover:bg-gray-200 transition"
                        onClick={() => setOpenVentilator(v => !v)}
                    >
                        <span className="text-lg font-semibold">Ventilator</span>
                        {openVentilator ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                    {openVentilator && (
                        <div className="p-4 border-t">
                            <div className="mb-4 flex items-center gap-2">
                                <Checkbox
                                    id="ada_ventilator"
                                    checked={adaVentilator}
                                    onCheckedChange={setAdaVentilator}
                                />
                                <label htmlFor="ada_ventilator" className="text-sm font-medium select-none cursor-pointer">
                                    Ada Ventilator
                                </label>
                            </div>
                            {adaVentilator && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="pemasangan" className="block text-sm font-medium mb-1">
                                            Pemasangan
                                        </label>
                                        <Input
                                            id="pemasangan"
                                            name="pemasangan"
                                            type="datetime-local"
                                            value={pemasangan}
                                            onChange={e => setPemasangan(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="pencabutan" className="block text-sm font-medium mb-1">
                                            Pencabutan
                                        </label>
                                        <Input
                                            id="pencabutan"
                                            name="pencabutan"
                                            type="datetime-local"
                                            value={pencabutan}
                                            onChange={e => setPencabutan(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {/* Konten lainnya bisa ditambahkan di sini */}
            </div>
        </AppLayout>
    )
}
