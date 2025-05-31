import axios from "axios";
import { toast } from "sonner";

export const cetakResumeMedis = async (
    pendaftaranNomor: string,
    jenis: string,
    setPreviewSEPData: (url: string | null) => void,
    setPreviewPDF: (state: boolean | null) => void,
) => {
    try {
        const response = await axios.get(route("previewResumeMedis", {
            pendaftaran: "2503210001",
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
            const pdfBlob = new Blob([response.data], { type: "application/pdf" });
            const pdfUrl = URL.createObjectURL(pdfBlob);
            setPreviewSEPData(pdfUrl);
            setPreviewPDF(true); // Tampilkan modal
        } else if (jenis === "download") {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", pendaftaranNomor + ".pdf"); // Nama file PDF
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
    }
}

// export const cetakResumeMedis = async (
//     data: [],
//     jenis: string,
//     setPreviewSEPData: (url: string | null) => void,
//     setPreviewPDF: (state: boolean | null) => void,
// ) => {
//     try {
//         function hitungSelisihHari(tanggalAwal: string, tanggalAkhir: string): number {
//             if (!tanggalAwal || !tanggalAkhir) return 0; // Jika salah satu tanggal tidak ada, kembalikan 0
//             const dateAwal = new Date(tanggalAwal);
//             const dateAkhir = new Date(tanggalAkhir);
//             const selisihWaktu = dateAkhir.getTime() - dateAwal.getTime(); // Selisih dalam milidetik
//             return Math.ceil(selisihWaktu / (1000 * 60 * 60 * 24)); // Konversi ke hari
//         }

//         function formatTanggalIndo(tgl: string) {
//             if (!tgl) return "-";
//             const bulan = [
//                 "Januari", "Februari", "Maret", "April", "Mei", "Juni",
//                 "Juli", "Agustus", "September", "Oktober", "November", "Desember"
//             ];
//             const [tahun, bulanIdx, tanggal] = tgl.split("-");
//             if (!tahun || !bulanIdx || !tanggal) return tgl;
//             return `${parseInt(tanggal)} ${bulan[parseInt(bulanIdx, 10) - 1]} ${tahun}`;
//         }

//         const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

//         // Header dengan Border
//         const headerHeight = 19; // Tinggi header
//         doc.rect(10, 10, 190, headerHeight); // Gambar kotak untuk header (x, y, width, height)

//         // Tambahkan Gambar Logo
//         const imgWidth = 15; // Lebar gambar (mm)
//         const imgHeight = 15; // Tinggi gambar (mm)
//         doc.addImage(logo, "PNG", 17, 12, imgWidth, imgHeight); // Tambahkan gambar di posisi (12, 12)

//         // Tambahkan Teks Header
//         const headerText = "KLINIK RAWAT INAP UTAMA MUHAMMADIYAH KEDUNGADEM";
//         const subHeaderText = "Jl. PUK Desa Drokilo, Kec. Kedungadem Kab. Bojonegoro";
//         const subHeaderText2 = "Email : klinik.muh.kedungadem@gmail.com | WA : 0822-4224-4646";
//         const titleText = "RINGKASAN PULANG";

//         // KOP
//         doc.setFont("helvetica", "bold");
//         doc.setFontSize(14);
//         doc.text(headerText, 35, 18); // Teks header
//         doc.setFont("helvetica", "normal");
//         doc.setFontSize(9);
//         doc.text(subHeaderText, 35, 22,); // Sub-header
//         doc.text(subHeaderText2, 35, 26); // Sub-header 2

//         doc.setFillColor(0, 0, 0)
//         doc.rect(10, 29, 190, 10, "F"); // Gambar kotak untuk header (x, y, width, height)
//         doc.setFont("helvetica", "bold");
//         doc.setFontSize(12);
//         doc.setTextColor(255, 255, 255)
//         doc.text(titleText, 105, 35, { align: "center" }); // Judul di tengah

//         // Data Dokumen
//         doc.rect(10, 39, 190, 20); // Gambar kotak untuk header (x, y, width, height)
//         doc.setTextColor(0, 0, 0); // Reset warna teks ke hitam
//         doc.setFont("helvetica", "normal");
//         doc.setFontSize(10);
//         doc.text("Nama Pasien : ", 11, 45);
//         doc.setFont("helvetica", "bold");
//         doc.text(data.pasien.NAMA, 11, 50);

//         doc.line(70, 39, 70, 59);

//         doc.setFont("helvetica", "normal");
//         doc.setFontSize(10);
//         doc.text("Nomor RM : ", 71, 45);
//         doc.setFont("helvetica", "bold");
//         doc.text(String(data.pasien.NORM), 71, 50);

//         doc.line(100, 39, 100, 59);

//         doc.setFont("helvetica", "normal");
//         doc.setFontSize(10);
//         doc.text("Tanggal Lahir : ", 101, 45);
//         doc.setFont("helvetica", "bold");
//         doc.text(formatTanggalIndo(data.pasien.TANGGAL_LAHIR), 101, 50);

//         doc.line(160, 39, 160, 59);

//         doc.setFont("helvetica", "normal");
//         doc.setFontSize(10);
//         doc.text("Jenis Kelamin : ", 161, 45);
//         doc.setFont("helvetica", "bold");
//         doc.text(String(data.pasien.JENIS_KELAMIN == 1 ? "Laki-laki" : "Perempuan"), 161, 50);

//         doc.rect(10, 59.1, 190, 20); // Gambar kotak untuk header (x, y, width, height)

//         doc.setFont("helvetica", "normal");
//         doc.setFontSize(10);
//         doc.text("Tanggal Masuk : ", 11, 65);
//         doc.setFont("helvetica", "bold");
//         doc.text(formatTanggalIndo(data.TANGGAL), 11, 70);
//         doc.line(70, 59, 70, 79);

//         doc.setFont("helvetica", "normal");
//         doc.setFontSize(10);
//         doc.text("Tanggal Keluar : ", 41, 65);
//         doc.setFont("helvetica", "bold");
//         doc.text(data.pendaftaran_tagihan.pembayaran_tagihan ? formatTanggalIndo(data.pendaftaran_tagihan.pembayaran_tagihan.TANGGAL) : " - ", 41, 70);
//         doc.line(40, 59, 40, 79);


//         doc.setFont("helvetica", "normal");
//         doc.setFontSize(10);
//         doc.text("Lama dirawat : ", 71, 65);
//         doc.setFont("helvetica", "bold");
//         doc.text(`${hitungSelisihHari(data.TANGGAL, data.pendaftaran_tagihan.pembayaran_tagihan ? data.pendaftaran_tagihan.pembayaran_tagihan.TANGGAL : new Date().toISOString())} Hari`, 71, 70);
//         doc.line(100, 59, 100, 79);

//         doc.setFont("helvetica", "normal");
//         doc.setFontSize(10);
//         doc.text("Ruang Rawat Terakhir : ", 101, 65);
//         doc.setFont("helvetica", "bold");
//         doc.text(data.pasien_pulang ? data.pasien_pulang.kunjungan_pasien.ruangan?.DESKRIPSI : " Pasien belum dipulangkan ", 100, 70);

//         doc.rect(10, 79.1, 190, 20);

//         doc.setFont("helvetica", "normal");
//         doc.setFontSize(10);
//         doc.text("Penjamin : ", 11, 85);
//         doc.setFont("helvetica", "bold");
//         doc.text(data.penjamin?.jenis_penjamin.DESKRIPSI || " - ", 11, 90);
//         doc.line(100, 79, 100, 99);

//         doc.setFont("helvetica", "normal");
//         doc.setFontSize(10);
//         doc.text("Indikasi Rawat Inap : ", 101, 85);
//         doc.setFont("helvetica", "bold");
//         doc.text(data.resume_medis?.INDIKASI_RAWAT_INAP ? data.resume_medis.INDIKASI_RAWAT_INAP : " Tidak Ada ", 100, 90);

//         doc.rect(10, 99.1, 190, 80);
//         doc.setFont("helvetica", "normal");
//         doc.setFontSize(10);
//         doc.text("Ringkasan Riwayat ", 11, 105,);
//         doc.text("Sekarang : ", 11, 110,);

//         doc.line(50, 99, 50, 179);
//         doc.setFont("helvetica", "bold");
//         doc.setFontSize(10);
//         doc.text("Ringkasan Penyakit Sekarang : ", 51, 105);
//         doc.setFont("helvetica", "normal");
//         doc.text(data.anamnesis?.[data.anamnesis.length - 1]?.DESKRIPSI ? data.anamnesis?.[data.anamnesis.length - 1]?.DESKRIPSI : " Tidak Ada ", 50, 110, { maxWidth: 145, align: "justify" });
//         // doc.text("Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.", 51, 110, { maxWidth: 145, align: "justify" });

//         doc.setFont("helvetica", "bold");
//         doc.text("Riwayat Penyakit Dahulu : ", 51, 145);
//         doc.setFont("helvetica", "normal");
//         doc.text(data.riwayat_kunjungan.rpp ? data.riwayat_kunjungan.rpp?.DESKRIPSI : "Tidak ada", 51, 150, { maxWidth: 145, align: "justify" });

//         // Pemeriksaan Fisik
//         doc.setFont("helvetica", "normal");
//         doc.setFontSize(10);
//         doc.text("Pemeriksaan Fisik : ", 11, 185);

//         // Garis vertikal awal
//         var yStart = 179; // Posisi awal vertikal garis
//         var yEnd = 199; // Posisi akhir vertikal garis (akan diperbarui secara dinamis)

//         // Data Pemeriksaan Fisik
//         const pemeriksaanFisik = data.pemeriksaan_fisik || []; // Gunakan array kosong jika null
//         let yPosition = 185; // Posisi awal vertikal teks
//         const maxHeight = 280; // Batas tinggi halaman (A4)

//         if (pemeriksaanFisik.length > 0) {
//             pemeriksaanFisik.forEach((item: { DESKRIPSI: string }) => {
//                 const maxWidth = 145; // Lebar maksimum teks
//                 const lineHeight = 6; // Tinggi baris
//                 const lines = doc.splitTextToSize(item.DESKRIPSI, maxWidth); // Pecah teks menjadi beberapa baris

//                 lines.forEach((line) => {
//                     // Tambahkan halaman baru jika posisi vertikal melebihi batas tinggi halaman
//                     if (yPosition + lineHeight > maxHeight) {
//                         doc.addPage(); // Tambahkan halaman baru
//                         yPosition = 20; // Reset posisi vertikal untuk halaman baru
//                     }

//                     doc.text(line, 51, yPosition); // Render setiap baris teks
//                     yPosition += lineHeight; // Tambahkan tinggi baris
//                 });
//             });

//             // Perbarui posisi akhir garis vertikal berdasarkan posisi akhir teks
//             yEnd = yPosition;
//         } else {
//             // Jika data kosong, tampilkan "Tidak Ada"
//             doc.text("Tidak Ada", 51, yPosition);
//             yPosition += 6; // Tambahkan tinggi baris
//             yEnd = yPosition; // Perbarui posisi akhir garis
//         }

//         // Gambar garis vertikal dinamis
//         doc.line(50, yStart, 50, yEnd);

//         // Gambar kotak dinamis berdasarkan tinggi teks
//         const boxHeight = yEnd - yStart; // Hitung tinggi kotak berdasarkan posisi akhir teks
//         doc.rect(10, yStart, 190, boxHeight); // Gambar kotak dengan tinggi dinamis

//         doc.rect(10, yEnd - 1 + 1, 190, 20); // Gambar kotak untuk header (x, y, width, height)
//         doc.setFont("helvetica", "normal");
//         doc.setFontSize(10);
//         doc.text("Hasil Konsultasi : ", 11, yEnd + 7);
//         doc.setFont("helvetica", "bold");
//         doc.line(50, yEnd, 50, yEnd + 20);

//         doc.setFont("helvetica", "normal");
//         doc.text(data.resume_medis ? data.resume_medis.DESKRIPSI_KONSUL : "Tidak Ada", 51, yEnd + 7, { maxWidth: 145, align: "justify" });

//         let newYend = 0; // Perbarui posisi vertikal
//         // Diagnosa Utama
//         doc.addPage(); // Tambahkan halaman baru untuk Diagnosa Utama
//         doc.rect(10, newYend + 20, 190, 20); // Gambar kotak untuk header (x, y, width, height)
//         doc.setFont("helvetica", "bold");
//         doc.setFontSize(10);
//         doc.text("Diagnosa Utama", 11, newYend + 25);
//         doc.setFont("helvetica", "normal");
//         if (data.diagnosa_pasien?.UTAMA == 1) {
//             doc.text(data.diagnosa_pasien?.nama_diagnosa.STR, 11, newYend + 30); // Tampilkan teks jika kondisi terpenuhi
//         } else {
//             doc.text("Tidak Ada", 11, newYend + 30); // Tampilkan teks jika kondisi tidak terpenuhi
//         }
//         doc.line(60, newYend + 20, 60, newYend + 40);
//         doc.setFont("helvetica", "bold");
//         doc.text("ICD 10", 61, newYend + 25);
//         doc.setFont("helvetica", "normal");
//         if (data.diagnosa_pasien?.UTAMA == 1) {
//             doc.text(data.diagnosa_pasien?.KODE, 61, newYend + 30); // Tampilkan teks jika kondisi terpenuhi
//         } else {
//             doc.text("-", 61, newYend + 30); // Tampilkan teks jika kondisi tidak terpenuhi
//         }
//         doc.setFont("helvetica", "bold");
//         doc.line(75, newYend + 20, 75, newYend + 40);
//         doc.text("Terapi", 76, newYend + 25);
//         doc.line(125, newYend + 20, 125, newYend + 40);
//         doc.setFont("helvetica", "bold");
//         doc.text("Procedure", 126, newYend + 25);
//         doc.setFont("helvetica", "normal");
//         doc.text(data.prosedur_pasien[0]?.nama_prosedur.STR ? data.prosedur_pasien[0]?.nama_prosedur.STR : "Tidak Ada", 126, newYend + 30); // Tampilkan teks jika kondisi terpenuhi
//         doc.line(180, newYend + 20, 180, newYend + 40);
//         doc.setFont("helvetica", "bold");
//         doc.text("ICD 9", 181, newYend + 25);
//         doc.setFont("helvetica", "normal");
//         doc.text(data.prosedur_pasien[0]?.nama_prosedur.KODE ? data.prosedur_pasien[0]?.nama_prosedur.KODE : "-", 181, newYend + 30); // Tampilkan teks jika kondisi terpenuhi

//         //Diagnosa Sekunder
//         doc.rect(10, newYend + 40, 190, 20); // Gambar kotak untuk header (x, y, width, height)
//         doc.setFont("helvetica", "bold");
//         doc.setFontSize(10);
//         doc.text("Diagnosa Sekunder", 11, newYend + 45);
//         doc.setFont("helvetica", "normal");
//         if (data.diagnosa_pasien?.UTAMA == 2) {
//             doc.text(data.diagnosa_pasien?.nama_diagnosa.STR, 11, newYend + 50); // Tampilkan teks jika kondisi terpenuhi
//         } else {
//             doc.text("Tidak Ada", 11, newYend + 50); // Tampilkan teks jika kondisi tidak terpenuhi
//         }
//         doc.line(60, newYend + 40, 60, newYend + 60);
//         doc.setFont("helvetica", "bold");
//         doc.text("ICD 10", 61, newYend + 45);
//         doc.setFont("helvetica", "normal");
//         if (data.diagnosa_pasien?.UTAMA == 2) {
//             doc.text(data.diagnosa_pasien?.KODE, 61, newYend + 50); // Tampilkan teks jika kondisi terpenuhi
//         } else {
//             doc.text("-", 61, newYend + 50); // Tampilkan teks jika kondisi tidak terpenuhi
//         }
//         doc.setFont("helvetica", "bold");
//         doc.line(75, newYend + 40, 75, newYend + 60);
//         doc.text("Terapi", 76, newYend + 45);
//         doc.line(125, newYend + 40, 125, newYend + 60);
//         doc.setFont("helvetica", "bold");
//         doc.text("Procedure", 126, newYend + 45);
//         doc.setFont("helvetica", "normal");
//         doc.text(data.prosedur_pasien[1]?.nama_prosedur.STR ? data.prosedur_pasien[1]?.nama_prosedur.STR : "Tidak Ada", 126, newYend + 50); // Tampilkan teks jika kondisi terpenuhi
//         doc.line(180, newYend + 40, 180, newYend + 60);
//         doc.setFont("helvetica", "bold");
//         doc.text("ICD 9", 181, newYend + 45);
//         doc.setFont("helvetica", "normal");
//         doc.text(data.prosedur_pasien[1]?.nama_prosedur.KODE ? data.prosedur_pasien[1]?.nama_prosedur.KODE : "-", 181, newYend + 50); // Tampilkan teks jika kondisi terpenuhi

//         doc.rect(10, newYend + 60, 190, 10); // Gambar kotak untuk header (x, y, width, height)
//         doc.setFont("helvetica", "bold");
//         doc.setFontSize(10);
//         doc.text("Kondisi Pulang", 11, newYend + 65);
//         doc.setFont("helvetica", "normal");
//         doc.text(" : " + (data.pasien_pulang?.keadaan_pulang.DESKRIPSI ? data.pasien_pulang?.keadaan_pulang.DESKRIPSI : " - "), 40, newYend + 65);
//         doc.rect(10, newYend + 70, 190, 10); // Gambar kotak untuk header (x, y, width, height)
//         doc.setFont("helvetica", "bold");
//         doc.text("Cara Pulang", 11, newYend + 75);
//         doc.setFont("helvetica", "normal");
//         doc.text(" : " + (data.pasien_pulang?.cara_pulang.DESKRIPSI ? data.pasien_pulang?.cara_pulang.DESKRIPSI : " - "), 40, newYend + 75);

//         doc.rect(10, newYend + 80, 190, 20); // Gambar kotak untuk header (x, y, width, height)
//         doc.setFont("helvetica", "bold");
//         doc.text("Kontrol : ", 11, newYend + 90);
//         doc.setFont("helvetica", "normal");
//         doc.text(data.pasien_pulang?.kunjungan_pasien?.jadwal_kontrol ? formatTanggalIndo(data.pasien_pulang?.kunjungan_pasien.jadwal_kontrol.TANGGAL) : " - ", 40, newYend + 90);
//         doc.rect(10, newYend + 100, 190, 20); // Gambar kotak untuk header (x, y, width, height)
//         doc.setFont("helvetica", "bold");
//         doc.text("Jam Kontrol : ", 11, newYend + 110);
//         doc.setFont("helvetica", "normal");
//         doc.text(data.pasien_pulang?.kunjungan_pasien?.jadwal_kontrol ? data.pasien_pulang?.kunjungan_pasien.jadwal_kontrol.JAM : " - ", 40, newYend + 110);

//         console.log(data);

//         // Simpan atau Preview PDF
//         if (jenis === "preview") {
//             const pdfBlob = doc.output("blob");
//             setPreviewSEPData(URL.createObjectURL(pdfBlob));
//             setPreviewPDF(true); // Tampilkan modal
//         } else if (jenis === "download") {
//             doc.save(`Resume_Medis_${data.NORM}.pdf`);
//         } else if (jenis === "merge") {
//             // Kembalikan Blob untuk proses merge
//             return doc.output("blob");
//         }
//     } catch (error) {
//         console.error("Error generating PDF:", error);
//     }
// };
