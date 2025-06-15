import axios from 'axios';
import { PDFDocument } from 'pdf-lib'; // install dengan: npm install pdf-lib
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

export const cetakResumeMedis = async (
    pendaftaranNomor: string,
    jenis: string,
    pengajuanKlaim?: { id?: string; edit?: number; pengkajian_awal?: number; triage?: number; cppt?: number } | null,
) => {
    try {

        // Siapkan daftar request dan urutan
        const pdfRequests: Promise<any>[] = [];
        // Resume Medis selalu diambil
        if (pengajuanKlaim && pengajuanKlaim.edit === 1) {
            pdfRequests.push(axios.get(route('previewResumeMedisEdit', { pendaftaran: pengajuanKlaim.id }), { responseType: 'blob' }));
            if (pengajuanKlaim.pengkajian_awal === 1)
                pdfRequests.push(axios.get(route('previewPengkajianAwalEdit', { pendaftaran: pengajuanKlaim.id }), { responseType: 'blob' }));
            if (pengajuanKlaim.triage === 1)
                pdfRequests.push(axios.get(route('previewTriageEdit', { pendaftaran: pengajuanKlaim.id }), { responseType: 'blob' }));
            if (pengajuanKlaim.cppt === 1)
                pdfRequests.push(axios.get(route('previewCPPTEdit', { pendaftaran: pengajuanKlaim.id }), { responseType: 'blob' }));
        } else {
            pdfRequests.push(axios.get(route('previewResumeMedis', { pendaftaran: pendaftaranNomor }), { responseType: 'blob' }));
            if (pengajuanKlaim?.pengkajian_awal === 1)
                pdfRequests.push(axios.get(route('previewPengkajianAwal', { pendaftaran: pendaftaranNomor }), { responseType: 'blob' }));
            if (pengajuanKlaim?.triage === 1)
                pdfRequests.push(axios.get(route('previewTriage', { pendaftaran: pendaftaranNomor }), { responseType: 'blob' }));
            if (pengajuanKlaim?.cppt === 1)
                pdfRequests.push(axios.get(route('previewCPPT', { pendaftaran: pendaftaranNomor }), { responseType: 'blob' }));
        }

        const responses = await Promise.all(pdfRequests);

        // Gabungkan PDF dengan pdf-lib
        const mergedPdf = await PDFDocument.create();
        for (const res of responses) {
            const pdfBytes = await res.data.arrayBuffer();
            const pdf = await PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        const mergedBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const mergedUrl = URL.createObjectURL(mergedBlob);


        if (jenis === 'preview') {
            showPDFModal(mergedUrl);
            toast.success('PDF gabungan berhasil ditampilkan');
        } else if (jenis === 'download') {
            const link = document.createElement('a');
            link.href = mergedUrl;
            link.setAttribute('download', pendaftaranNomor + '_gabungan.pdf');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('PDF gabungan berhasil diunduh');
        } else if (jenis === 'merge') {
            return mergedBlob;
        }
    } catch (error) {
        console.error('Error merging PDF:', error);
        toast.error('Gagal mengambil/gabung PDF');
        hidePDFModal();
    } finally {
    }
};
