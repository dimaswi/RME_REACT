import { jsPDF } from "jspdf";
import logo from "../../image/kop.png"; // Impor gambar PNG

export const cetakResumeMedis = async (
    data: [],
    jenis: string,
    setPreviewSEPData: (url: string | null) => void,
    setPreviewPDF: (state: boolean | null) => void,
) => {
    try {
        function hitungSelisihHari(tanggalAwal: string, tanggalAkhir: string): number {
            if (!tanggalAwal || !tanggalAkhir) return 0; // Jika salah satu tanggal tidak ada, kembalikan 0
            const dateAwal = new Date(tanggalAwal);
            const dateAkhir = new Date(tanggalAkhir);
            const selisihWaktu = dateAkhir.getTime() - dateAwal.getTime(); // Selisih dalam milidetik
            return Math.ceil(selisihWaktu / (1000 * 60 * 60 * 24)); // Konversi ke hari
        }

        function formatTanggalIndo(tgl: string) {
            if (!tgl) return "-";
            const bulan = [
                "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                "Juli", "Agustus", "September", "Oktober", "November", "Desember"
            ];
            const [tahun, bulanIdx, tanggal] = tgl.split("-");
            if (!tahun || !bulanIdx || !tanggal) return tgl;
            return `${parseInt(tanggal)} ${bulan[parseInt(bulanIdx, 10) - 1]} ${tahun}`;
        }

        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

        // Header dengan Border
        const headerHeight = 19; // Tinggi header
        doc.rect(10, 10, 190, headerHeight); // Gambar kotak untuk header (x, y, width, height)

        // Tambahkan Gambar Logo
        const imgWidth = 15; // Lebar gambar (mm)
        const imgHeight = 15; // Tinggi gambar (mm)
        doc.addImage(logo, "PNG", 17, 12, imgWidth, imgHeight); // Tambahkan gambar di posisi (12, 12)

        // Tambahkan Teks Header
        const headerText = "KLINIK RAWAT INAP UTAMA MUHAMMADIYAH KEDUNGADEM";
        const subHeaderText = "Jl. PUK Desa Drokilo, Kec. Kedungadem Kab. Bojonegoro";
        const subHeaderText2 = "Email : klinik.muh.kedungadem@gmail.com | WA : 0822-4224-4646";
        const titleText = "RINGKASAN PULANG";

        // KOP
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(headerText, 35, 18); // Teks header
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(subHeaderText, 35, 22,); // Sub-header
        doc.text(subHeaderText2, 35, 26); // Sub-header 2

        doc.setFillColor(0, 0, 0)
        doc.rect(10, 29, 190, 10, "F"); // Gambar kotak untuk header (x, y, width, height)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255)
        doc.text(titleText, 105, 35, { align: "center" }); // Judul di tengah

        // Data Dokumen
        doc.rect(10, 39, 190, 20); // Gambar kotak untuk header (x, y, width, height)
        doc.setTextColor(0, 0, 0); // Reset warna teks ke hitam
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Nama Pasien : ", 11, 45);
        doc.setFont("helvetica", "bold");
        doc.text(data.pasien.NAMA, 11, 50);

        doc.line(70, 39, 70, 59);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Nomor RM : ", 71, 45);
        doc.setFont("helvetica", "bold");
        doc.text(String(data.pasien.NORM), 71, 50);

        doc.line(100, 39, 100, 59);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Tanggal Lahir : ", 101, 45);
        doc.setFont("helvetica", "bold");
        doc.text(formatTanggalIndo(data.pasien.TANGGAL_LAHIR), 101, 50);

        doc.line(160, 39, 160, 59);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Jenis Kelamin : ", 161, 45);
        doc.setFont("helvetica", "bold");
        doc.text(String(data.pasien.JENIS_KELAMIN == 1 ? "Laki-laki" : "Perempuan"), 161, 50);

        doc.rect(10, 59.1, 190, 20); // Gambar kotak untuk header (x, y, width, height)

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Tanggal Masuk : ", 11, 65);
        doc.setFont("helvetica", "bold");
        doc.text(formatTanggalIndo(data.TANGGAL), 11, 70);
        doc.line(70, 59, 70, 79);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Tanggal Keluar : ", 41, 65);
        doc.setFont("helvetica", "bold");
        doc.text(data.pendaftaran_tagihan.pembayaran_tagihan ? formatTanggalIndo(data.pendaftaran_tagihan.pembayaran_tagihan.TANGGAL) : " - ", 41, 70);
        doc.line(40, 59, 40, 79);


        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Lama dirawat : ", 71, 65);
        doc.setFont("helvetica", "bold");
        doc.text(`${hitungSelisihHari(data.TANGGAL, data.pendaftaran_tagihan.pembayaran_tagihan ? data.pendaftaran_tagihan.pembayaran_tagihan.TANGGAL : new Date().toISOString())} Hari`, 71, 70);
        doc.line(100, 59, 100, 79);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Ruang Rawat Terakhir : ", 101, 65);
        doc.setFont("helvetica", "bold");
        doc.text(data.pasien_pulang ? data.pasien_pulang.kunjungan_pasien.ruangan?.DESKRIPSI : " Pasien belum dipulangkan ", 100, 70);

        doc.rect(10, 79.1, 190, 20);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Penjamin : ", 11, 85);
        doc.setFont("helvetica", "bold");
        doc.text(data.penjamin?.jenis_penjamin.DESKRIPSI || " - ", 11, 90);
        doc.line(100, 79, 100, 99);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Indikasi Rawat Inap : ", 101, 85);
        doc.setFont("helvetica", "bold");
        doc.text(data.resume_medis?.INDIKASI_RAWAT_INAP ? data.resume_medis.INDIKASI_RAWAT_INAP : " Tidak Ada ", 100, 90);

        doc.rect(10, 99.1, 190, 80);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Ringkasan Riwayat ", 11, 105,);
        doc.text("Sekarang : ", 11, 110,);

        doc.line(50, 99, 50, 179);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Ringkasan Penyakit Sekarang : ", 51, 105);
        doc.setFont("helvetica", "normal");
        doc.text(data.anamnesis?.[data.anamnesis.length - 1]?.DESKRIPSI ? data.anamnesis?.[data.anamnesis.length - 1]?.DESKRIPSI : " Tidak Ada ", 50, 110, { maxWidth: 145, align: "justify" });
        // doc.text("Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.", 51, 110, { maxWidth: 145, align: "justify" });

        doc.setFont("helvetica", "bold");
        doc.text("Riwayat Penyakit Dahulu : ", 51, 145);
        doc.setFont("helvetica", "normal");
        doc.text(data.riwayat_kunjungan.rpp ? data.riwayat_kunjungan.rpp?.DESKRIPSI : "Tidak ada", 51, 150, { maxWidth: 145, align: "justify" });

        // Pemeriksaan Fisik
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Pemeriksaan Fisik : ", 11, 185);

        // Garis vertikal awal
        let yStart = 179; // Posisi awal vertikal garis
        let yEnd = 199; // Posisi akhir vertikal garis (akan diperbarui secara dinamis)

        // Data Pemeriksaan Fisik
        const pemeriksaanFisik = data.pemeriksaan_fisik || []; // Gunakan array kosong jika null
        let yPosition = 185; // Posisi awal vertikal teks

        if (pemeriksaanFisik.length > 0) {
            pemeriksaanFisik.forEach((item: { DESKRIPSI: string }) => {
                const maxWidth = 145; // Lebar maksimum teks
                const lineHeight = 6; // Tinggi baris
                const lines = doc.splitTextToSize(item.DESKRIPSI, maxWidth); // Pecah teks menjadi beberapa baris

                lines.forEach((line) => {
                    doc.text(line, 51, yPosition); // Render setiap baris teks
                    yPosition += lineHeight; // Tambahkan tinggi baris
                });
            });

            // Perbarui posisi akhir garis vertikal berdasarkan posisi akhir teks
            yEnd = yPosition;
        } else {
            // Jika data kosong, tampilkan "Tidak Ada"
            doc.text("Tidak Ada", 51, yPosition);
            yPosition += 6; // Tambahkan tinggi baris
            yEnd = yPosition; // Perbarui posisi akhir garis
        }

        // Gambar garis vertikal dinamis
        doc.line(50, yStart, 50, yEnd);

        // Gambar kotak dinamis berdasarkan tinggi teks
        const boxHeight = yEnd - yStart; // Hitung tinggi kotak berdasarkan posisi akhir teks
        doc.rect(10, yStart, 190, boxHeight); // Gambar kotak dengan tinggi dinamis


        console.log(data);

        // Simpan atau Preview PDF
        if (jenis === "preview") {
            const pdfBlob = doc.output("blob");
            setPreviewSEPData(URL.createObjectURL(pdfBlob));
            setPreviewPDF(true); // Tampilkan modal
        } else if (jenis === "download") {
            doc.save(`Resume_Medis_${data.NORM}.pdf`);
        }
    } catch (error) {
        console.error("Error generating PDF:", error);
    }
};
