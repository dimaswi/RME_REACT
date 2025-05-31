import { jsPDF } from "jspdf"; // Tambahkan ini
import { PDFDocument } from "pdf-lib";
import { cetakResumeMedis } from "./ResumeMedis";
import { fetchSEPData, cetakSEP } from "./SEP";
import { cetakBerkasKlaim } from "./BerkasKlaim";
import { toast } from "sonner";

export const mergePDFs = async (
    nomorPendaftaran: string,
    nomorSEP: string,
    setPreviewPDF: (state: boolean) => void,
    setPreviewMergedPDF: (url: string | null) => void
) => {
    try {
        toast.info("Menggabungkan PDF...");

        // 1. Generate Resume Medis PDF
        const resumeMedisBlob = await cetakResumeMedis(nomorPendaftaran, "merge", () => { }, () => { });

        // 2. Generate SEP PDF
        const sepData = await fetchSEPData(nomorPendaftaran);
        const sepBlob = await cetakSEP(sepData, "merge", () => { }, () => { }, () => { });

        // 3. Generate Berkas Klaim PDF
        const berkasKlaimBlob = await cetakBerkasKlaim(nomorSEP, "merge", () => { }, () => { }, () => { }, () => { }, () => { });


        // 4. Load PDFs into pdf-lib
        const mergedPdf = await PDFDocument.create();

        const sepPdf = await PDFDocument.load(await sepBlob.arrayBuffer());
        const berkasKlaimPdf = await PDFDocument.load(await berkasKlaimBlob.arrayBuffer());
        const resumeMedisPdf = await PDFDocument.load(await resumeMedisBlob.arrayBuffer());

        // 5. Copy Pages from Each PDF
        const sepPages = await mergedPdf.copyPages(sepPdf, sepPdf.getPageIndices());
        sepPages.forEach((page) => mergedPdf.addPage(page));

        const berkasKlaimPages = await mergedPdf.copyPages(berkasKlaimPdf, berkasKlaimPdf.getPageIndices());
        berkasKlaimPages.forEach((page) => mergedPdf.addPage(page));

        const resumeMedisPages = await mergedPdf.copyPages(resumeMedisPdf, resumeMedisPdf.getPageIndices());
        resumeMedisPages.forEach((page) => mergedPdf.addPage(page));

        // 6. Save Merged PDF
        const mergedPdfBytes = await mergedPdf.save();
        const mergedPdfBlob = new Blob([mergedPdfBytes], { type: "application/pdf" });
        const mergedPdfUrl = URL.createObjectURL(mergedPdfBlob);

        // 7. Set Preview
        toast.success("PDF berhasil digabungkan");
        setPreviewMergedPDF(mergedPdfUrl);
        setPreviewPDF(true); // Tampilkan modal untuk preview PDF
    } catch (error) {
        console.error("Error merging PDFs:", error);
    }
};
