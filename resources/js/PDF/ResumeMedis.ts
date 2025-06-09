import axios from "axios";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib"; // install dengan: npm install pdf-lib


// Fungsi untuk menampilkan modal loading
function showLoadingModal() {
    const modal = document.createElement("div");
    modal.id = "resume-loading-modal";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100vw";
    modal.style.height = "100vh";
    modal.style.background = "rgba(0,0,0,0.3)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "9999";
    modal.innerHTML = `
        <div style="background: white; padding: 24px 32px; border-radius: 8px; font-size: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.2)">
            Memuat dokumen Resume Medis...
        </div>
    `;
    document.body.appendChild(modal);
}

// Fungsi untuk menghilangkan modal loading
function hideLoadingModal() {
    const modal = document.getElementById("resume-loading-modal");
    if (modal) {
        document.body.removeChild(modal);
    }
}

// Fungsi untuk menampilkan PDF di modal
function showPDFModal(pdfUrl: string) {
    const modal = document.createElement("div");
    modal.id = "resume-pdf-modal";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100vw";
    modal.style.height = "100vh";
    modal.style.background = "rgba(0,0,0,0.95)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "10000";
    modal.innerHTML = `
        <div id="resume-pdf-content" style="background: white; border-radius: 0; position: relative; width: 85vw; height: 85vh; max-width: 85vw; max-height: 85vh; padding: 0; display: flex; flex-direction: column; box-shadow: 0 0 24px #0008;">
            <div style="width: 100%; height: 5vh; background: #f5f5f5; border-bottom: 1px solid #ddd;"></div>
            <iframe src="${pdfUrl}" style="width: 100%; height: 95vh; border: none; display: block;"></iframe>
        </div>
    `;
    document.body.appendChild(modal);

    // Tutup modal jika klik di luar konten PDF
    modal.addEventListener("mousedown", (e) => {
        const content = document.getElementById("resume-pdf-content");
        if (content && !content.contains(e.target as Node)) {
            hidePDFModal();
        }
    });
}

function hidePDFModal() {
    const modal = document.getElementById("resume-pdf-modal");
    if (modal) {
        document.body.removeChild(modal);
    }
}

export const cetakResumeMedis = async (
    pendaftaranNomor: string,
    jenis: string,
) => {
    try {
        showLoadingModal();

        // 1. Fetch semua PDF (ubah route sesuai kebutuhan Anda)
        const [resResume, resPengkajian, resTriage, resCppt] = await Promise.all([
            axios.get(route("previewResumeMedis", { pendaftaran: pendaftaranNomor }), { responseType: "blob" }),
            axios.get(route("previewPengkajianAwal", { pendaftaran: pendaftaranNomor }), { responseType: "blob" }),
            axios.get(route("previewTriage", { pendaftaran: pendaftaranNomor }), { responseType: "blob" }),
            axios.get(route("previewCPPT", { pendaftaran: pendaftaranNomor }), { responseType: "blob" }),
        ]);

        // 2. Gabungkan PDF dengan pdf-lib
        const mergedPdf = await PDFDocument.create();

        for (const res of [resResume, resPengkajian, resTriage, resCppt]) {
            const pdfBytes = await res.data.arrayBuffer();
            const pdf = await PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        const mergedBlob = new Blob([mergedPdfBytes], { type: "application/pdf" });
        const mergedUrl = URL.createObjectURL(mergedBlob);

        hideLoadingModal();

        if (jenis === "preview") {
            showPDFModal(mergedUrl);
            toast.success("PDF gabungan berhasil ditampilkan");
        } else if (jenis === "download") {
            const link = document.createElement("a");
            link.href = mergedUrl;
            link.setAttribute("download", pendaftaranNomor + "_gabungan.pdf");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("PDF gabungan berhasil diunduh");
        }
    } catch (error) {
        console.error("Error merging PDF:", error);
        toast.error("Gagal mengambil/gabung PDF");
        hidePDFModal();
    } finally {
        hideLoadingModal();
    }
};
