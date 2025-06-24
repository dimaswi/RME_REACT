import axios from "axios";
import { jsPDF } from "jspdf";
import bpjsLogo from "../../image/bpjs.png"; // Impor gambar PNG

export const fetchSEPData = async (pendaftaranNomor: string) => {
    try {
        const response = await axios.get(route('previewSEP', {
            pendaftaran: pendaftaranNomor,
        }));
        return response.data; // Kembalikan data dari respons
    } catch (error) {
        console.error("Error fetching SEP data:", error);
        throw error; // Lempar error agar bisa ditangani di tempat lain
    }
};

export const cetakSEP = async (
    data: any,
    jenis: string,
    setPreviewSEPData: (url: string | null) => void,
    setPreviewPDF: (state: boolean) => void,
    setBerkasKlaimUrl: (url: string | null) => void
) => {
    try {
        // Ubah ukuran halaman menjadi A5 (148 x 210 mm) dengan orientasi landscape
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [120, 300] });

        // Tambahkan Gambar BPJS
        const imgWidth = 85; // Lebar gambar (mm)
        const imgHeight = 14; // Tinggi gambar (mm)
        doc.addImage(bpjsLogo, "PNG", 10, 10, imgWidth, imgHeight); // Tambahkan gambar di posisi (10, 10)

        // Header
        doc.setFontSize(18);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0); // Warna hitam untuk teks lainnya
        doc.text("SURAT ELIGIBILITAS PESERTA", 98, 15); // Geser teks ke kanan agar tidak menabrak gambar
        doc.text("KLINIK RAWAT INAP UTAMA", 98, 22);

        // Konten Kiri
        const content = [
            { label: "No. SEP", value: data.penjamin.kunjungan_b_p_j_s?.noSEP ?? "Tidak Ada" },
            { label: "Tgl. SEP", value: data.penjamin.kunjungan_b_p_j_s?.tglSEP ?? "Tidak Ada" },
            { label: "No. Kartu", value: data.penjamin.kunjungan_b_p_j_s?.noKartu + " (" + data.pasien?.NORM + ")" },
            { label: "Nama Peserta", value: data.pasien?.NAMA ?? "Tidak Ada" },
            { label: "Tgl. Lahir", value: data.pasien?.TANGGAL_LAHIR ?? "Tidak Ada" },
            { label: "No. Telepon", value: data.penjamin.kunjungan_b_p_j_s?.noTelp ?? "Tidak Ada" },
            { label: "Sub/Spesialis", value: data.penjamin.kunjungan_b_p_j_s?.poli_tujuan?.nama ?? "Tidak Ada" },
            { label: "Dokter", value: data.penjamin.kunjungan_b_p_j_s?.dokter_d_p_j_p?.nama ?? "Tidak Ada" },
            { label: "Faskes Perujuk", value: data.penjamin.kunjungan_b_p_j_s?.faskes_perujuk?.NAMA ?? "Tidak Ada" },
            { label: "Diagnosa Awal", value: data.penjamin.kunjungan_b_p_j_s?.diagAwal ?? "Tidak Ada" },
        ];

        const rightContent = [
            { label: "Peserta", value: data.penjamin.kunjungan_b_p_j_s?.data_peserta?.nmJenisPeserta ?? "Tidak Ada" },
            { label: "Jns. Rawat", value: data.penjamin.kunjungan_b_p_j_s?.jenisPelayanan == 1 ? "Rawat Inap" : "Rawat Jalan" },
            { label: "Jns. Kunjungan", value: data.penjamin.kunjungan_b_p_j_s?.tujuanKunj == 0 ? "Normal" : data.penjamin.kunjungan_b_p_j_s?.tujuanKunj == 1 ? "Prosedur" : "Konsul Dokter" },
            { label: "Prosedur", value: data.penjamin.kunjungan_b_p_j_s.flagProcedure === "" ? "Tidak Ada" : data.penjamin.kunjungan_b_p_j_s.flagProcedure == 1 ? "Tidak Berkelanjutan" : "Terapi Berkelanjutan" },
            { label: "Assesment plyn", value: data.penjamin.kunjungan_b_p_j_s.assesmentPel === "" ? "Tidak Ada" : data.penjamin.kunjungan_b_p_j_s.assesmentPel == 1 ? "Poli spesialis tidak tersedia pada hari sebelumnya" : data.penjamin.kunjungan_b_p_j_s.assesmentPel == 2 ? "am Poli telah berakhir pada hari sebelumnya" : data.penjamin.kunjungan_b_p_j_s.assesmentPel == 3 ? "Dokter Spesialis yang dimaksud tidak praktek pada hari sebelumnya" : data.penjamin.kunjungan_b_p_j_s.assesmentPel == 4 ? "Atas Instruksi RS" : "Tujuan Kontrol" },
            { label: "Poli Perujuk", value: "-" },
            { label: "Kelas Hak", value: data.penjamin.kunjungan_b_p_j_s.data_peserta.nmKelas },
            { label: "Kelas Rawat", value: data.penjamin.KELAS == 0 ? "-" : data.penjamin.KELAS },
            { label: "Penjamin", value: "-" },
        ];

        // Konten Kiri
        let y = 30;
        doc.setFontSize(12);
        content.forEach((item) => {
            doc.text(`${item.label}`, 10, y);
            doc.text(" : " + item.value, 60, y);
            y += 6;
        });

        // Konten Kanan
        y = 30;
        const rightContentXLabel = 190; // Posisi label konten kanan
        const rightContentXValue = 225; // Posisi nilai konten kanan
        rightContent.forEach((item) => {
            doc.text(`${item.label}`, rightContentXLabel, y);
            doc.text(" : " + item.value, rightContentXValue, y);
            y += 6;
        });

        // Catatan
        doc.setFontSize(9);
        doc.text(
            "* Saya Menyetujui BPJS Kesehatan menggunakan Informasi Medis pasien jika diperlukan.",
            10,
            95
        );
        doc.text("* SEP bukan sebagai bukti penjamin peserta.", 10, 100);
        doc.text(
            "** Dengan diterbitkannya SEP ini, Peserta rawat inap telah mendapatkan informasi dan memahami",
            10,
            105
        );
        doc.text(
            "kelas rawat sesuai hak kelasnya (terkait kelas penuh atau naik kelas atas keinginan yang berlaku).",
            10,
            110
        );

        // Tanda Tangan
        doc.setFontSize(12);
        doc.text("Pasien/Keluarga Pasien", 200, 90); // Pindahkan teks lebih ke bawah dengan meningkatkan nilai y
        doc.line(200, 110, 250, 110); // Pindahkan garis lebih ke bawah dengan meningkatkan nilai y

        // Footer
        doc.setFontSize(8);
        doc.text("Cetakan Ke 1 28-05-2025 22:26:20", 10, 150);
        setBerkasKlaimUrl(null); // Reset URL berkas klaim sebelum menyimpan PDF

        if (jenis === "preview") {
            // Simpan PDF ke state
            const pdfBlob = doc.output("blob");
            setPreviewSEPData(URL.createObjectURL(pdfBlob));
            setPreviewPDF(true); // Tampilkan modal
        } else if (jenis === "download") {
            // Simpan PDF ke file
            doc.save(`SEP_${data.penjamin.kunjungan_b_p_j_s.noSEP}.pdf`);
        } else if (jenis === "merge") {
            return doc.output("blob");
        }
    } catch (error) {
        console.error("Error generating PDF:", error);
    }
};
