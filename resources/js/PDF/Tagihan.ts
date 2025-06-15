import axios from 'axios';
import { toast } from 'sonner';

// Fungsi untuk menampilkan PDF di modal
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

    // Tutup modal jika klik di luar konten PDF
    modal.addEventListener('mousedown', (e) => {
        const content = document.getElementById('resume-pdf-content');
        if (content && !content.contains(e.target as Node)) {
            hidePDFModal();
        }
    });
}

function hidePDFModal() {
    const modal = document.getElementById('resume-pdf-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

export const cetakTagihanPDF = async (nomor_pendaftaran: string, jenis: string) => {
    try {
        // Panggil API untuk mengunduh PDF
        const response = await axios.get(
            route('previewTagihan', {
                nomor_pendaftaran: nomor_pendaftaran, // Ganti dengan parameter yang sesuai
            }),
            {
                responseType: 'blob', // Pastikan responseType adalah blob untuk PDF
                validateStatus: (status) => status === 200,
            },
        );

        // Periksa status respons
        if (response.status !== 200) {
            toast.error('Gagal pada pengambilan berkas klaim');
            return; // Jangan lanjutkan jika status bukan 200
        }

        if (jenis === 'preview') {
            const pdfBlob = new Blob([response.data], { type: "application/pdf" });
            const pdfUrl = URL.createObjectURL(pdfBlob);
            showPDFModal(pdfUrl);
        } else if (jenis === 'download') {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "Tagihan.pdf"); // Nama file PDF
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (jenis === 'merge') {
            return new Blob([response.data], { type: 'application/pdf' });
        }
    } catch (error) {
        console.error('Error merging PDF:', error);
        toast.error('Gagal mengambil/gabung PDF');
        hidePDFModal();
    } finally {
    }
};
