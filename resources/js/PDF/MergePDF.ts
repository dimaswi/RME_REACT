import { PDFDocument } from 'pdf-lib';
import { toast } from 'sonner';
import { cetakBerkasKlaim } from './BerkasKlaim';
import { cetakLaboratoriumPDF } from './Laboratorium';
import { cetakRadiologiPDF } from './Radiologi';
import { cetakResumeMedis } from './ResumeMedis';
import { cetakSEP, fetchSEPData } from './SEP';
import { cetakTagihanPDF } from './Tagihan';

// Modal helpers
function createModal(id: string, content: string, style: string) {
    const modal = document.createElement('div');
    modal.id = id;
    modal.style.cssText = style;
    modal.innerHTML = content;
    document.body.appendChild(modal);
    return modal;
}

function removeModal(id: string) {
    const modal = document.getElementById(id);
    if (modal) document.body.removeChild(modal);
}

function showPDFModal(pdfUrl: string) {
    createModal(
        'resume-pdf-modal',
        `<div id="resume-pdf-content" style="background: white; border-radius: 0; position: relative; width: 85vw; height: 85vh; max-width: 85vw; max-height: 85vh; padding: 0; display: flex; flex-direction: column; box-shadow: 0 0 24px #0008;">
            <div style="width: 100%; height: 5vh; background: #f5f5f5; border-bottom: 1px solid #ddd;"></div>
            <iframe src="${pdfUrl}" style="width: 100%; height: 95vh; border: none; display: block;"></iframe>
        </div>`,
        `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.95);display:flex;align-items:center;justify-content:center;z-index:10000;`,
    );
    // Close modal on click outside
    const modal = document.getElementById('resume-pdf-modal');
    modal?.addEventListener('mousedown', (e) => {
        const content = document.getElementById('resume-pdf-content');
        if (content && !content.contains(e.target as Node)) {
            hidePDFModal();
        }
    });
}

function hidePDFModal() {
    removeModal('resume-pdf-modal');
}

// Main merge function
export const mergePDFs = async (
    nomorPendaftaran: string,
    nomorSEP: string,
    pengajuanKlaim: any,
    jenis: "preview" | "download" = "preview" // Tambahkan parameter jenis
) => {
    toast.info('Menggabungkan PDF membutuhkan waktu, harap tunggu...');

    try {
        // Fetch all PDF blobs in parallel
        const [resumeMedisBlob, tagihanBlob, laboratoriumBlob, radiologiBlob, sepData] = await Promise.all([
            cetakResumeMedis(nomorPendaftaran, 'merge', pengajuanKlaim),
            cetakTagihanPDF(pengajuanKlaim.id, 'merge'),
            cetakLaboratoriumPDF(pengajuanKlaim.id, 'merge'),
            cetakRadiologiPDF(pengajuanKlaim.id, 'merge'),
            fetchSEPData(nomorPendaftaran),
        ]);

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

        // Validate all blobs
        const blobs = [
            { name: 'Resume Medis', blob: resumeMedisBlob },
            { name: 'Tagihan', blob: tagihanBlob },
            { name: 'Laboratorium', blob: laboratoriumBlob },
            { name: 'Radiologi', blob: radiologiBlob },
            { name: 'SEP', blob: sepBlob },
            { name: 'Berkas Klaim', blob: berkasKlaimBlob },
        ];
        for (const { name, blob } of blobs) {
            if (!blob) {
                toast.error(`Gagal mengambil dokumen PDF: ${name}`);
                return;
            }
        }

        // Load all PDFs
        const pdfDocs = await Promise.all([
            PDFDocument.load(await sepBlob.arrayBuffer()),
            PDFDocument.load(await berkasKlaimBlob.arrayBuffer()),
            PDFDocument.load(await resumeMedisBlob.arrayBuffer()),
            PDFDocument.load(await tagihanBlob.arrayBuffer()),
            PDFDocument.load(await laboratoriumBlob.arrayBuffer()),
            PDFDocument.load(await radiologiBlob.arrayBuffer()),
        ]);

        // Merge all PDFs
        const mergedPdf = await PDFDocument.create();
        for (const pdfDoc of pdfDocs) {
            const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            pages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        const mergedPdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const mergedPdfUrl = URL.createObjectURL(mergedPdfBlob);

        if (jenis === "download") {
            // Download file
            const link = document.createElement('a');
            link.href = mergedPdfUrl;
            link.download = `${nomorSEP}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('PDF berhasil diunduh.');
        } else {
            // Preview PDF
            showPDFModal(mergedPdfUrl);
            toast.success('PDF berhasil digabungkan dan siap untuk ditampilkan.');
        }
    } catch (error) {
        toast.error('Error merging PDFs: ' + (error as any)?.message);
        console.error('Error merging PDFs:', error);
    }
};
