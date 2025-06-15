import { PDFDocument } from 'pdf-lib';
import { toast } from 'sonner';
import { cetakBerkasKlaim } from './BerkasKlaim';
import { cetakLaboratoriumPDF } from './Laboratorium';
import { cetakRadiologiPDF } from './Radiologi';
import { cetakResumeMedis } from './ResumeMedis';
import { cetakSEP, fetchSEPData } from './SEP';
import { cetakTagihanPDF } from './Tagihan';

function showLoadingModal() {
    const modal = document.createElement('div');
    modal.id = 'resume-loading-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.3)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';
    modal.innerHTML = `
        <div style="background: white; padding: 24px 32px; border-radius: 8px; font-size: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.2)">
            Memuat dokumen Resume Medis...
        </div>
    `;
    document.body.appendChild(modal);
}

// Fungsi untuk menghilangkan modal loading
function hideLoadingModal() {
    const modal = document.getElementById('resume-loading-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

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

export const mergePDFs = async (
    nomorPendaftaran: string,
    nomorSEP: string,
    pengajuanKlaim: any, // gunakan objek, bukan array kosong
    setPreviewPDF: (state: boolean) => void,
    setPreviewMergedPDF: (url: string | null) => void,
) => {
    showLoadingModal();

    try {
        toast.info('Menggabungkan PDF...');

        const resumeMedisBlob = await cetakResumeMedis(nomorPendaftaran, 'merge', pengajuanKlaim);
        const tagihanBlob = await cetakTagihanPDF(pengajuanKlaim.id, 'merge');
        const laboratoriumBlob = await cetakLaboratoriumPDF(pengajuanKlaim.id, 'merge');
        const radiologiBlob = await cetakRadiologiPDF(pengajuanKlaim.id, 'merge'); // perbaiki typo
        const sepData = await fetchSEPData(nomorPendaftaran);
        const sepBlob = await cetakSEP(
            sepData,
            'merge',
            () => {},
            () => {},
            () => {},
        );
        const berkasKlaimBlob = await cetakBerkasKlaim(
            nomorSEP,
            'merge',
            () => {},
            () => {},
            () => {},
            () => {},
            () => {},
        );

        // Cek semua blob
        if (!resumeMedisBlob || !tagihanBlob || !laboratoriumBlob || !radiologiBlob || !sepBlob || !berkasKlaimBlob) {
            hideLoadingModal();
            toast.error('Gagal mengambil salah satu dokumen PDF!');
            return;
        }

        const mergedPdf = await PDFDocument.create();

        const sepPdf = await PDFDocument.load(await sepBlob.arrayBuffer());
        const berkasKlaimPdf = await PDFDocument.load(await berkasKlaimBlob.arrayBuffer());
        const resumeMedisPdf = await PDFDocument.load(await resumeMedisBlob.arrayBuffer());
        const tagihanPDF = await PDFDocument.load(await tagihanBlob.arrayBuffer());
        const LaboratoriumPDF = await PDFDocument.load(await laboratoriumBlob.arrayBuffer());
        const radiologiPDF = await PDFDocument.load(await radiologiBlob.arrayBuffer());

        const sepPages = await mergedPdf.copyPages(sepPdf, sepPdf.getPageIndices());
        sepPages.forEach((page) => mergedPdf.addPage(page));

        const berkasKlaimPages = await mergedPdf.copyPages(berkasKlaimPdf, berkasKlaimPdf.getPageIndices());
        berkasKlaimPages.forEach((page) => mergedPdf.addPage(page));

        const resumeMedisPages = await mergedPdf.copyPages(resumeMedisPdf, resumeMedisPdf.getPageIndices());
        resumeMedisPages.forEach((page) => mergedPdf.addPage(page));

        const tagihanPage = await mergedPdf.copyPages(tagihanPDF, tagihanPDF.getPageIndices());
        tagihanPage.forEach((page) => mergedPdf.addPage(page));

        const laboratoriumPage = await mergedPdf.copyPages(LaboratoriumPDF, LaboratoriumPDF.getPageIndices());
        laboratoriumPage.forEach((page) => mergedPdf.addPage(page));

        const radiologiPage = await mergedPdf.copyPages(radiologiPDF, radiologiPDF.getPageIndices());
        radiologiPage.forEach((page) => mergedPdf.addPage(page));

        const mergedPdfBytes = await mergedPdf.save();
        const mergedPdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf'});
        const mergedPdfUrl = URL.createObjectURL(mergedPdfBlob);

        hideLoadingModal();
        showPDFModal(mergedPdfUrl);
    } catch (error) {
        hideLoadingModal();
        toast.error('Error merging PDFs: ' + (error as any)?.message);
        console.error('Error merging PDFs:', error);
    }
};
