import axios from "axios";
import { toast } from "sonner";

// Fungsi modal
function hidePDFModal() {
    const modal = document.getElementById('resume-pdf-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

function showPDFModal(pdfUrl: string) {
    const modal = document.createElement('div');
    modal.id = 'resume-pdf-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.95)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '10000';
    modal.innerHTML = `
        <div id="resume-pdf-content" style="background: white; border-radius: 0; position: relative; width: 85vw; height: 85vh; max-width: 85vw; max-height: 85vh; padding: 0; display: flex; flex-direction: column; box-shadow: 0 0 24px #0008;">
            <div style="width: 100%; height: 5vh; background: #f5f5f5; border-bottom: 1px solid #ddd;"></div>
            <iframe src="${pdfUrl}" style="width: 100%; height: 95vh; border: none; display: block;"></iframe>
        </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('mousedown', (e) => {
        const content = document.getElementById('resume-pdf-content');
        if (content && !content.contains(e.target as Node)) {
            hidePDFModal();
        }
    });
}

// Fungsi utama cetak berkas klaim
export const cetakBerkasKlaim = async (
    nomor_sep: string,
    jenis: "preview" | "download" | "merge"
) => {
    try {
        const response = await axios.get(route("downloadBerkasKlaim", {
            pengajuanKlaim: nomor_sep,
        }), {
            responseType: "blob",
            validateStatus: (status) => status === 200
        });

        if (response.status !== 200) {
            toast.error("Gagal pada pengambilan berkas klaim");
            return;
        }
        

        if (jenis === "preview") {
            const pdfBlob = new Blob([response.data], { type: "application/pdf" });
            const pdfUrl = URL.createObjectURL(pdfBlob);
            showPDFModal(pdfUrl);
            toast.success("PDF berhasil diambil untuk preview");
        } else if (jenis === "download") {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", nomor_sep + ".pdf");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("PDF berhasil diunduh");
        } else if (jenis === "merge") {
            return new Blob([response.data], { type: "application/pdf" });
        }

    } catch (error) {
        console.error("Error fetching PDF:", error);
        toast.error("Gagal mengambil PDF atau Klaim belum dilakukan grouping");
    }
};
