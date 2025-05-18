import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pasiens',
        href: route('master.pasiens.index'),
    },
    {
        title: 'Detail Pasien',
        href: '/pasiens/detail',
    },
];

type Pasien = {
    NORM: string;
    NAMA: string;
    TEMPAT_LAHIR: string;
    TANGGAL_LAHIR: string;
    ALAMAT: string;
    RT: string;
    RW: string;
    KELURAHAN: string;
    KECAMATAN: string;
    KABUPATEN: string;
    PROVINSI: string;
    agama?: { DESKRIPSI: string };
    pendidikan?: { DESKRIPSI: string };
    pekerjaan?: { DESKRIPSI: string };
    kawin?: { DESKRIPSI: string };
    golda?: { DESKRIPSI: string };
    keluarga_pasien?: keluarga_pasien[];
    kartuIdentitas?: KartuIdentitas[];
    riwayatPendaftaran?: RiwayatPendaftaran[];
};

type keluarga_pasien = {
    NAMA: string;
    hubungan?: { DESKRIPSI: string };
    ALAMAT?: string;
    TELEPON?: string;
    JENIS_KELAMIN?: number;
};

type KartuIdentitas = {
    jenisKartuIdentitas?: { DESKRIPSI: string };
    NOMOR?: string;
    KETERANGAN?: string;
};

type RiwayatPendaftaran = {
    NOMOR?: string;
    TANGGAL?: string;
    KETERANGAN?: string;
};

type PageProps = {
    pasien: Pasien;
};

export default function Detail() {
    const { props } = usePage<{ props: PageProps }>();
    const { pasien } = props;
    const [activeTab, setActiveTab] = useState("detail-pasien");

    // Pagination states
    const [currentPageKeluarga, setCurrentPageKeluarga] = useState(1);
    const [currentPageIdentitas, setCurrentPageIdentitas] = useState(1);
    const [currentPageKunjungan, setCurrentPageKunjungan] = useState(1);

    const itemsPerPage = 10;

    // console.log(props);

    // Helper function to paginate data
    const paginate = (data: any[], page: number) => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(startIndex, endIndex);
    };

    const calculateAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);

        let years = today.getFullYear() - birth.getFullYear();
        let months = today.getMonth() - birth.getMonth();
        let days = today.getDate() - birth.getDate();

        if (days < 0) {
            months -= 1;
            days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        }

        if (months < 0) {
            years -= 1;
            months += 12;
        }

        return `${years} tahun ${months} bulan ${days} hari`;
    };

    const tabs = [
        { id: "detail-pasien", label: "Detail Pasien" },
        { id: "keluarga-pasien", label: "Keluarga" },
        { id: "kartu-identitas", label: "Kartu Identitas" },
        { id: "riwayat-kunjungan", label: "Riwayat Kunjungan" },
        { id: "berkas-klaim", label: "Berkas Klaim" },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} pasien={props.pasien} ruangan={props.ruangan}>
            <Head title={pasien.NAMA} />
            <div className="p-4">
                {/* Tabs */}
                <div className="flex">
                    <div className="flex bg-gray-100 p-1 rounded-md">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 px-4 py-2 text-sm font-medium text-center rounded-md whitespace-nowrap ${activeTab === tab.id
                                    ? "bg-white text-black shadow"
                                    : "text-gray-500 hover:text-black"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="mt-4">
                    {/* Detail Pasien */}
                    {activeTab === "detail-pasien" && (
                        <div className="my-6 w-full overflow-y-auto">
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-bold w-[20%]">Nama Pasien</TableCell>
                                        <TableCell>{pasien.NAMA} <span className="font-bold">({pasien.NORM})</span></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-bold w-[20%]">Tempat Tanggal Lahir</TableCell>
                                        <TableCell>
                                            {pasien.TEMPAT_LAHIR}, {new Date(pasien.TANGGAL_LAHIR).toLocaleDateString("id-ID")}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-bold w-[20%]">Usia</TableCell>
                                        <TableCell>
                                            <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded">
                                                {calculateAge(pasien.TANGGAL_LAHIR)}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-bold w-[20%]">Alamat</TableCell>
                                        <TableCell>{pasien.ALAMAT}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-bold w-[20%]">RT/RW</TableCell>
                                        <TableCell>RT {pasien.RT}/ RW {pasien.RW}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-bold w-[20%]">Kelurahan</TableCell>
                                        <TableCell>{pasien.KELURAHAN}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-bold w-[20%]">Kecamatan</TableCell>
                                        <TableCell>{pasien.KECAMATAN}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-bold w-[20%]">Kabupaten</TableCell>
                                        <TableCell>{pasien.KABUPATEN}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-bold w-[20%]">Provinsi</TableCell>
                                        <TableCell>{pasien.PROVINSI}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-bold w-[20%]">Agama</TableCell>
                                        <TableCell>{pasien.agama?.DESKRIPSI || "-"}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-bold w-[20%]">Pendidikan</TableCell>
                                        <TableCell>{pasien.pendidikan?.DESKRIPSI || "-"}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-bold w-[20%]">Pekerjaan</TableCell>
                                        <TableCell>{pasien.pekerjaan?.DESKRIPSI || "-"}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-bold w-[20%]">Status Perkawinan</TableCell>
                                        <TableCell>{pasien.kawin?.DESKRIPSI || "-"}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-bold w-[20%]">Golongan Darah</TableCell>
                                        <TableCell>{pasien.golda?.DESKRIPSI || "-"}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Keluarga Pasien */}
                    {activeTab === "keluarga-pasien" && (
                        <div className="my-6 w-full overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[5%] text-center">No.</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Hubungan</TableHead>
                                        <TableHead>Alamat</TableHead>
                                        <TableHead>Telepon</TableHead>
                                        <TableHead>Jenis Kelamin</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginate(pasien.keluarga_pasien || [], currentPageKeluarga).map((keluarga, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="text-center">
                                                {(currentPageKeluarga - 1) * itemsPerPage + index + 1}
                                            </TableCell>
                                            <TableCell>{keluarga.NAMA}</TableCell>
                                            <TableCell>{keluarga.hubungan?.DESKRIPSI || "-"}</TableCell>
                                            <TableCell>{keluarga.ALAMAT || "-"}</TableCell>
                                            <TableCell>{keluarga.TELEPON || "-"}</TableCell>
                                            <TableCell>{keluarga.JENIS_KELAMIN === 1 ? "Laki-laki" : "Perempuan"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {/* Pagination Controls */}
                            <div className="flex justify-end items-center mt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPageKeluarga((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPageKeluarga === 1}
                                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                                >
                                    Previous
                                </Button>
                                <span className="mx-4 text-sm font-medium">
                                    Page {currentPageKeluarga} of{" "}
                                    {Math.ceil((pasien.keluarga_pasien?.length || 0) / itemsPerPage)}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setCurrentPageKeluarga((prev) =>
                                            Math.min(prev + 1, Math.ceil((pasien.keluarga_pasien?.length || 0) / itemsPerPage))
                                        )
                                    }
                                    disabled={
                                        currentPageKeluarga ===
                                        Math.ceil((pasien.keluarga_pasien?.length || 0) / itemsPerPage)
                                    }
                                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Kartu Identitas */}
                    {activeTab === "kartu-identitas" && (
                        <div className="my-6 w-full overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[5%] text-center">No.</TableHead>
                                        <TableHead>Jenis Kartu</TableHead>
                                        <TableHead>Nomor Kartu</TableHead>
                                        <TableHead>Keterangan</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginate(pasien.kartu_identitas || [], currentPageIdentitas).map((kartu, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="text-center">
                                                {(currentPageIdentitas - 1) * itemsPerPage + index + 1}
                                            </TableCell>
                                            <TableCell>{kartu.jenis_kartu_identitas?.DESKRIPSI || "-"}</TableCell>
                                            <TableCell>{kartu.NOMOR || "-"}</TableCell>
                                            <TableCell>{kartu.KETERANGAN || "-"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {/* Pagination Controls */}
                            <div className="flex justify-end items-center mt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPageIdentitas((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPageIdentitas === 1}
                                >
                                    Previous
                                </Button>
                                <span className="mx-4 text-sm font-medium">
                                    Page {currentPageIdentitas} of{" "}
                                    {Math.ceil((pasien.kartu_identitas?.length || 0) / itemsPerPage)}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setCurrentPageIdentitas((prev) =>
                                            Math.min(prev + 1, Math.ceil((pasien.kartu_identitas?.length || 0) / itemsPerPage))
                                        )
                                    }
                                    disabled={
                                        currentPageIdentitas ===
                                        Math.ceil((pasien.kartu_identitas?.length || 0) / itemsPerPage)
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Riwayat Kunjungan */}
                    {activeTab === "riwayat-kunjungan" && (
                        <div className="my-6 w-full overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[5%] text-center">No.</TableHead>
                                        <TableHead>Nomor Kunjungan</TableHead>
                                        <TableHead>Tanggal Kunjungan</TableHead>
                                        <TableHead>Ruangan</TableHead>
                                        <TableHead>Keterangan</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginate(
                                        pasien.riwayat_pendaftaran?.flatMap((pendaftaran) =>
                                            pendaftaran.riwayat_kunjungan || []
                                        ) || [],
                                        currentPageKunjungan
                                    ).map((kunjungan, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="text-center">
                                                {(currentPageKunjungan - 1) * itemsPerPage + index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="inline-block px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded">
                                                    {kunjungan.NOMOR || "-"}
                                                </div>
                                            </TableCell>
                                            <TableCell>{kunjungan.MASUK || "-"}</TableCell>
                                            <TableCell>{kunjungan.ruangan?.DESKRIPSI || "-"}</TableCell>
                                            <TableCell>
                                                {kunjungan.STATUS == 2 ? (
                                                    <div className="inline-flex items-center px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded">
                                                        ✔
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded">
                                                        ✖
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {/* Pagination Controls */}
                            <div className="flex justify-end items-center mt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPageKunjungan((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPageKunjungan === 1}
                                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                                >
                                    Previous
                                </Button>
                                <span className="mx-4 text-sm font-medium">
                                    Page {currentPageKunjungan} of{" "}
                                    {Math.ceil(
                                        (pasien.riwayat_pendaftaran?.flatMap((pendaftaran) =>
                                            pendaftaran.riwayat_kunjungan || []
                                        ).length || 0) / itemsPerPage
                                    )}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setCurrentPageKunjungan((prev) =>
                                            Math.min(
                                                prev + 1,
                                                Math.ceil(
                                                    (pasien.riwayat_pendaftaran?.flatMap((pendaftaran) =>
                                                        pendaftaran.riwayat_kunjungan || []
                                                    ).length || 0) / itemsPerPage
                                                )
                                            )
                                        )
                                    }
                                    disabled={
                                        currentPageKunjungan ===
                                        Math.ceil(
                                            (pasien.riwayat_pendaftaran?.flatMap((pendaftaran) =>
                                                pendaftaran.riwayat_kunjungan || []
                                            ).length || 0) / itemsPerPage
                                        )
                                    }
                                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Berkas Klaim */}
                    {activeTab === "berkas-klaim" && (
                        <div className="my-6 w-full overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[5%] text-center">No.</TableHead>
                                        <TableHead>Nomor Berkas</TableHead>
                                        <TableHead>Tanggal Berkas</TableHead>
                                        <TableHead>Keterangan</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {/* Add your berkas klaim data here */}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
