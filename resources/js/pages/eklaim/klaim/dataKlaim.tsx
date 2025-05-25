import AppLayout from "@/layouts/app-layout";
import SearchableDropdown from "@/components/SearchableDropdown";
import { BreadcrumbItem } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";

export default function DataKlaim() {
    const { dataKlaim } = usePage().props as { dataKlaim: any };
    const { pasien } = usePage().props as { pasien: any };
    const { dataPendaftaran } = usePage().props as { dataPendaftaran: any };
    const [caraMasuk, setCaraMasuk] = useState("");

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
                    <div className="mb-3 p-2 border rounded bg-blue-50 text-l">
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
                {/* Konten lainnya bisa ditambahkan di sini */}
            </div>
        </AppLayout>
    )
}
