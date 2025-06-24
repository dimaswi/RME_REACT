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
export const mergePDFs = async (nomorPendaftaran: string, nomorSEP: string, pengajuanKlaim: any, jenis: 'preview' | 'download' = 'preview') => {
    toast.info('Menggabungkan PDF membutuhkan waktu, harap tunggu...');

    try {
        // Resume Medis dan SEP selalu diambil
        const resumeMedisBlob = await cetakResumeMedis(nomorPendaftaran, 'merge', pengajuanKlaim);
        const sepData = await fetchSEPData(nomorPendaftaran);
        const sepBlob = await cetakSEP(
            sepData,
            'merge',
            () => {},
            () => {},
            () => {},
        );

        // Siapkan array dokumen lain yang akan diambil jika value === 1
        const blobPromises: { key: string; name: string; promise: Promise<Blob> }[] = [];

        if (pengajuanKlaim.berkas_klaim === 1) {
            blobPromises.push({
                key: 'berkasKlaim',
                name: 'Berkas Klaim',
                promise: cetakBerkasKlaim(nomorSEP, 'merge'),
            });
        }
        if (pengajuanKlaim.laboratorium === 1) {
            blobPromises.push({
                key: 'laboratorium',
                name: 'Laboratorium',
                promise: cetakLaboratoriumPDF(pengajuanKlaim.id, 'merge'),
            });
        }
        if (pengajuanKlaim.radiologi === 1) {
            blobPromises.push({
                key: 'radiologi',
                name: 'Radiologi',
                promise: cetakRadiologiPDF(pengajuanKlaim.id, 'merge'),
            });
        }

        if (pengajuanKlaim.tagihan === 1) {
            blobPromises.push({
                key: 'tagihan',
                name: 'Tagihan',
                promise: cetakTagihanPDF(pengajuanKlaim.id, 'merge'),
            });
        }

        // Tunggu semua dokumen yang diperlukan
        const blobs = await Promise.all(blobPromises.map((b) => b.promise));

        // Pisahkan tagihan dari dokumen lain
        const dokumenLain = [];
        let tagihanBlobObj = null;
        blobPromises.forEach((b, i) => {
            if (b.key === 'tagihan') {
                tagihanBlobObj = {
                    key: b.key,
                    name: b.name,
                    blob: blobs[i],
                };
            } else {
                dokumenLain.push({
                    key: b.key,
                    name: b.name,
                    blob: blobs[i],
                });
            }
        });

        const filteredBlobs = [
            { key: 'sep', name: 'SEP', blob: sepBlob },
            ...dokumenLain,
            { key: 'resumeMedis', name: 'Resume Medis', blob: resumeMedisBlob },
        ];
        if (tagihanBlobObj) {
            filteredBlobs.push(tagihanBlobObj);
        }

        // Validasi dokumen yang wajib ada
        for (const { name, blob } of filteredBlobs) {
            if (!blob) {
                toast.error(`Gagal mengambil dokumen PDF: ${name}`);
                return;
            }
        }

        // Load only selected PDFs
        const pdfDocs = await Promise.all(filteredBlobs.map(async ({ blob }) => PDFDocument.load(await blob.arrayBuffer())));

        // Merge all PDFs
        const mergedPdf = await PDFDocument.create();
        for (const pdfDoc of pdfDocs) {
            const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            pages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        const mergedPdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const mergedPdfUrl = URL.createObjectURL(mergedPdfBlob);

        if (jenis === 'download') {
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
