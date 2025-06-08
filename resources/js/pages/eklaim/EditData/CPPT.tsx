import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CPPTProps {
    imageBase64: string;
    onChange?: (value: any) => void;
    nomorKunjungan?: string;
    mode?: number; // Tambahkan tipe data yang sesuai jika ada
}

interface CPPTRow {
    nomor_kunjungan?: string;
    tanggal_jam: string;
    profesi: string;
    nama_petugas: string;
    subyektif: string;
    obyektif: string;
    assesment: string;
    planning: string;
    instruksi: string;
}

export default function CPPT({ imageBase64, onChange, nomorKunjungan, mode }: CPPTProps) {
    const [rows, setRows] = useState<CPPTRow[]>(
        [
            {
                nomor_kunjungan: nomorKunjungan || "",
                tanggal_jam: "",
                profesi: "",
                nama_petugas: "",
                subyektif: "",
                obyektif: "",
                assesment: "",
                planning: "",
                instruksi: "",
            },
        ]
    );
    function stripHtml(html: string) {
        // Hilangkan tag HTML
        let text = html.replace(/<[^>]*>?/gm, "");
        // Decode HTML entities (termasuk &nbsp;)
        const textarea = document.createElement("textarea");
        textarea.innerHTML = text;
        return textarea.value;
    }

    const handleLoadData = async () => {
        try {

            if (mode === 1) {
                const response = await axios.get(route('eklaim.getDataCPPTEdit', { nomorKunjungan }));
                const data = Array.isArray(response.data) && response.data.length > 0
                    ? response.data.map(item => ({
                        nomor_kunjungan: nomorKunjungan || "",
                        tanggal_jam: item.tanggal_jam || "",
                        profesi: item.profesi || "",
                        nama_petugas: item.nama_petugas || "",
                        subyektif: item.subyektif || "",
                        obyektif: item.obyektif || "",
                        assesment: item.assesment || "",
                        planning: item.planning || "",
                        instruksi: item.instruksi || "",
                    }))
                    : [{
                        nomor_kunjungan: "",
                        tanggal_jam: "",
                        profesi: "",
                        nama_petugas: "",
                        subyektif: "",
                        obyektif: "",
                        assesment: "",
                        planning: "",
                        instruksi: "",
                    }];
                setRows(data);
                if (onChange) onChange(data);
            } else if (mode === 0) {
                const response = await axios.get(route('eklaim.getDataCPPT', { nomorKunjungan }));
                const data = Array.isArray(response.data) && response.data.length > 0
                    ? response.data.map(item => ({
                        nomor_kunjungan: nomorKunjungan || "",
                        tanggal_jam: item.TANGGAL || "",
                        profesi: item.petugas.pegawai.profesi.DESKRIPSI || "",
                        nama_petugas: item.petugas.pegawai.NAMA || "",
                        subyektif: stripHtml(item.SUBYEKTIF || ""),
                        obyektif: stripHtml(item.OBYEKTIF || ""),
                        assesment: stripHtml(item.ASSESMENT || ""),
                        planning: stripHtml(item.PLANNING || ""),
                        instruksi: stripHtml(item.INSTRUKSI || ""),
                    }))
                    : [{
                        nomor_kunjungan: "",
                        tanggal_jam: "",
                        profesi: "",
                        nama_petugas: "",
                        subyektif: "",
                        obyektif: "",
                        assesment: "",
                        planning: "",
                        instruksi: "",
                    }];
                setRows(data);
                if (onChange) onChange(data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // Saat handleChange (edit field)
    const handleChange = (idx: number, field: keyof CPPTRow, value: string) => {
        const newRows = [...rows];
        newRows[idx][field] = value;
        // Pastikan nomor_kunjungan tetap terisi
        newRows[idx].nomor_kunjungan = nomorKunjungan || "";
        setRows(newRows);
        if (onChange) onChange(newRows);
    };

    // Saat tambah/hapus baris
    const handleAddRow = () => {
        const newRows = [
            ...rows,
            {
                nomor_kunjungan: nomorKunjungan || "",
                tanggal_jam: "",
                profesi: "",
                nama_petugas: "",
                subyektif: "",
                obyektif: "",
                assesment: "",
                planning: "",
                instruksi: "",
            },
        ];
        setRows(newRows);
        if (onChange) onChange(newRows);
    };

    const handleRemoveRow = (idx: number) => {
        const newRows = rows.filter((_, i) => i !== idx);
        setRows(newRows);
        if (onChange) onChange(newRows);
    };

    useEffect(() => {
        handleLoadData();
    }, []); // atau [] jika hanya ingin sekali saat mount

    useEffect(() => {
        if (onChange) onChange(rows);
    }, [rows]);

    return (
        <div className="pt-4">
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
                        {/* <td>
                            <div className="flex justify-end h-full p-4">
                                <Button
                                    variant={"outline"}
                                    onClick={handleLoadData}
                                    className="h-8 w-24 bg-blue-500 text-white hover:bg-blue-600"
                                >
                                    Load
                                </Button>
                            </div>
                        </td> */}
                    </tr>
                    <tr style={{ background: "black", color: "white", textAlign: "center" }}>
                        <td colSpan={8}>
                            <h3 style={{ fontSize: 16 }}>CATATAN PERKEMBANGAN PASIEN TERINTEGRASI</h3>
                        </td>
                    </tr>
                </tbody>
            </table>

            <table style={{ fontFamily: "halvetica, sans-serif", width: "100%", borderCollapse: "collapse", border: "1px solid #000" }}>
                <tbody>
                    <tr className="border-b border-black">
                        <td colSpan={2} className="text-center border border-black" style={{ width: "10%" }}>
                            <strong>TANGGAL DAN JAM</strong>
                        </td>
                        <td colSpan={2} className="text-center border border-black" style={{ width: "20%" }}>
                            <strong>PROFESI DAN PA</strong>
                        </td>
                        <td colSpan={2} className="text-center border border-black" style={{ width: "30%" }}>
                            <strong>HASIL ASSESSMENT PENATALAKSANAAN PASIEN/SOAP</strong>
                        </td>
                        <td colSpan={2} className="text-center border border-black" style={{ width: "30%" }}>
                            <strong>INSTRUKSI</strong>
                        </td>
                        <td colSpan={2} className="text-center border border-black" style={{ width: "10%" }}>
                            <strong>*</strong>
                        </td>
                    </tr>
                    {rows.map((row, idx) => (
                        <tr key={idx} className="border-b border-black">
                            <td colSpan={2} className="text-center border border-black p-2" style={{ width: "10%" }}>
                                <Input
                                    type="datetime-local"
                                    value={row.tanggal_jam}
                                    onChange={e => handleChange(idx, "tanggal_jam", e.target.value)}
                                    placeholder="DD/MM/YYYY HH:MM"
                                    className="w-full"
                                />
                            </td>
                            <td colSpan={2} className="text-center border border-black p-2" style={{ width: "20%" }}>
                                <Input
                                    type="text"
                                    value={row.profesi}
                                    onChange={e => handleChange(idx, "profesi", e.target.value)}
                                    placeholder="Dokter/Perawat"
                                    className="w-full"
                                />
                                <Input
                                    type="text"
                                    value={row.nama_petugas}
                                    onChange={e => handleChange(idx, "nama_petugas", e.target.value)}
                                    placeholder="Nama Petugas"
                                    className="w-full mt-1"
                                />
                            </td>
                            <td colSpan={2} className="text-center border border-black p-2" style={{ width: "30%" }}>
                                <Input
                                    type="text"
                                    value={row.subyektif}
                                    onChange={e => handleChange(idx, "subyektif", e.target.value)}
                                    placeholder="Subyektif"
                                    className="w-full"
                                />
                                <Input
                                    type="text"
                                    value={row.obyektif}
                                    onChange={e => handleChange(idx, "obyektif", e.target.value)}
                                    placeholder="Obyektif"
                                    className="w-full mt-1"
                                />
                                <Input
                                    type="text"
                                    value={row.assesment}
                                    onChange={e => handleChange(idx, "assesment", e.target.value)}
                                    placeholder="Assesment"
                                    className="w-full mt-1"
                                />
                                <Input
                                    type="text"
                                    value={row.planning}
                                    onChange={e => handleChange(idx, "planning", e.target.value)}
                                    placeholder="Planning"
                                    className="w-full mt-1"
                                />
                            </td>
                            <td colSpan={2} className="text-center border border-black p-2" style={{ width: "30%" }}>
                                <Textarea
                                    value={row.instruksi}
                                    onChange={e => handleChange(idx, "instruksi", e.target.value)}
                                    placeholder="Instruksi"
                                    className="w-full"
                                    rows={3}
                                />
                            </td>
                            <td colSpan={2} className="text-center border border-black p-2" style={{ width: "10%" }}>
                                <Button
                                    variant="outline"
                                    onClick={() => handleRemoveRow(idx)}
                                    className="w-full bg-red-500 text-white hover:bg-red-600"
                                >
                                    Hapus
                                </Button>
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan={10} className="text-center border border-black p-2">
                            <Button
                                variant="outline"
                                onClick={handleAddRow}
                                className="w-full bg-green-500 text-white hover:bg-green-600"
                            >
                                Tambah Baris
                            </Button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
