import axios from "axios";
import { toast } from "sonner";

// Fungsi untuk menampilkan PDF di modal
function showPDFModal(pdfUrl: string) {
    const modal = document.createElement("div");
    modal.id = "triage-pdf-modal";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100vw";
    modal.style.height = "100vh";
    modal.style.background = "rgba(0,0,0,0.7)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "10000";
    modal.innerHTML = `
        <div style="background: white; border-radius: 8px; padding: 8px; position: relative; max-width: 90vw; max-height: 90vh;">
            <button id="close-triage-pdf-modal" style="position: absolute; top: 8px; right: 8px; font-size: 18px; background: #eee; border: none; border-radius: 4px; cursor: pointer;">&times;</button>
            <iframe src="${pdfUrl}" style="width: 70vw; height: 80vh; border: none;"></iframe>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById("close-triage-pdf-modal")?.addEventListener("click", () => {
        hidePDFModal();
    });
}

function hidePDFModal() {
    const modal = document.getElementById("triage-pdf-modal");
    if (modal) {
        document.body.removeChild(modal);
    }
}

export const cetakTriage = async (
    pendaftaranNomor: string,
    jenis: string,
) => {
    try {
        const response = await axios.get(route("previewTriage", {
            pendaftaran: pendaftaranNomor,
        }), {
            responseType: "blob",
        });
        if (jenis === "preview") {
            const pdfBlob = new Blob([response.data], { type: "application/pdf" });
            const pdfUrl = URL.createObjectURL(pdfBlob);
            showPDFModal(pdfUrl);
        } else if (jenis === "download") {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", pendaftaranNomor + ".pdf");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("PDF berhasil diunduh");
        } else if (jenis === "merge") {
            return new Blob([response.data], { type: "application/pdf" });
        }
        if (jenis !== "download") {
            toast.success("PDF berhasil diambil untuk preview");
        }
    } catch (error) {
        console.error("Error fetching PDF:", error);
        toast.error("Gagal mengambil PDF");
        hidePDFModal();
    } finally {
    }
}
