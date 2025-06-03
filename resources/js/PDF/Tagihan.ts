import axios from "axios";
import { toast } from "sonner";

export const cetakTagihanPDF = async (
    nomor_pendaftaran : string
) => {
    try {
        // Panggil API untuk mengunduh PDF
        const response = await axios.get(route("downloadBerkasKlaim", {
            pengajuanKlaim: nomor_pendaftaran, // Ganti dengan parameter yang sesuai
        }), {
            responseType: "blob", // Pastikan responseType adalah blob untuk PDF
            validateStatus: (status) => status === 200
        });

        // Periksa status respons
        if (response.status !== 200) {
            toast.error("Gagal pada pengambilan berkas klaim");
            return; // Jangan lanjutkan jika status bukan 200
        }


        if (jenis === "preview") {
            setPreviewSEPData(null); // Reset preview SEP sebelum mengambil berkas klaim
            // Preview PDF
            const pdfBlob = new Blob([response.data], { type: "application/pdf" });
            const pdfUrl = URL.createObjectURL(pdfBlob);

            // // Simpan URL ke state untuk ditampilkan di modal
            setBerkasKlaimUrl(pdfUrl);
            setPreviewPDF(true);
            toast.success("PDF berhasil diambil untuk preview");
        } else if (jenis === "download") {
            // Unduh PDF
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", nomor_sep + ".pdf"); // Nama file PDF
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("PDF berhasil diunduh");
        } else if (jenis === "merge") {
            return new Blob([response.data], { type: "application/pdf" });
        }

    } catch (error) {
        console.error("Error fetching PDF:", error);
        toast.error("Gagal mengambil PDF");
    } finally {
        setLoadingDownloadBerkasKlaim(false);
        setPreviewBerkasKlaim(false);
    }
}
