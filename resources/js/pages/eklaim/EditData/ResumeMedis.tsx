import SearchableDropdown from '@/components/SearchableDropdown';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { Home } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DiagnosaModal from '../klaim/DiagnosaModal';
import ProcedureModal from '../klaim/ProcedureModal';
import CPPT from './CPPT';
import PengkajianAwal from './PengkajianAwal';
import Triage from './Triage';

interface ResumeMedisProps {
    imageBase64: string;
    dataKlaim: any;
    dataKunjungan: any;
}

export default function EditResumeMedis(props: ResumeMedisProps) {
    const { imageBase64, dataKlaim, dataKunjungan } = props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: <Home className="mr-1 inline" />,
            href: route('eklaim.klaim.index'),
        },
        {
            title: 'List Pengajuan Klaim',
            href: route('eklaim.klaim.indexPengajuanKlaim'),
        },
        {
            title: 'Edit Data Resume Medis',
            href: '#',
        },
    ];

    function formatTanggalIndo(tgl: string) {
        if (!tgl) return '-';
        const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const [tahun, bulanIdx, tanggal] = tgl.split('-');
        if (!tahun || !bulanIdx || !tanggal) return tgl;
        return `${parseInt(tanggal)} ${bulan[parseInt(bulanIdx, 10) - 1]} ${tahun}`;
    }

    function toDatetimeLocal(value: string | Date | null): string {
        if (!value) return '';
        let date: Date;
        if (typeof value === 'string' && !isNaN(Date.parse(value))) {
            date = new Date(value);
        } else if (value instanceof Date) {
            date = value;
        } else {
            return '';
        }
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }

    // State untuk diagnosa dan prosedur
    const [showDiagnosaModal, setShowDiagnosaModal] = useState(false);
    const [showProcedureModal, setShowProcedureModal] = useState(false);
    const [diagnosaOptions, setDiagnosaOptions] = useState<any[]>([]);
    const [diagnosaSearch, setDiagnosaSearch] = useState('');
    const [selectedDiagnosa, setSelectedDiagnosa] = useState<any[]>([]);
    const [procedureOptions, setProcedureOptions] = useState<any[]>([]);
    const [procedureSearch, setProcedureSearch] = useState('');
    const [selectedProcedure, setSelectedProcedure] = useState<any[]>([]);

    const fetchDiagnosa = async (keyword: string) => {
        try {
            const response = await axios.get('/proxy/diagnosa', {
                params: { keyword },
            });

            if (response.data && response.data.response && Array.isArray(response.data.response.data)) {
                setDiagnosaOptions(response.data.response.data); // Simpan data ke state
            } else {
                setDiagnosaOptions([]); // Jika respons tidak valid, set ke array kosong
            }
        } catch (error) {
            console.error('Error fetching diagnosa:', error);
            setDiagnosaOptions([]); // Set ke array kosong jika terjadi error
        }
    };
    const fetchProcedure = async (keyword: string) => {
        try {
            const response = await axios.get('/proxy/procedure', {
                params: { keyword },
            });

            if (response.data && response.data.response && Array.isArray(response.data.response.data)) {
                setProcedureOptions(response.data.response.data); // Simpan data ke state
            } else {
                setProcedureOptions([]); // Jika respons tidak valid, set ke array kosong
            }
        } catch (error) {
            console.error('Error fetching procedure:', error);
            setProcedureOptions([]); // Set ke array kosong jika terjadi error
        }
    };

    const [idResumeMedis, setIdResumeMedis] = useState<number | null>(null);
    const [namaPasien, setNamaPasien] = useState<string | null>(null);
    const [noRM, setNoRM] = useState<string | null>(null);
    const [tanggalLahir, setTanggalLahir] = useState<string | null>(null);
    const [jenisKelamin, setJenisKelamin] = useState<number | null>(null);
    const [ruangRawat, setRuangRawat] = useState<string | null>(null);
    const [indikasiRawatInap, setIndikasiRawatInap] = useState<string | null>(null);
    const [penjamin, setPenjamin] = useState<string | null>(null);
    const [tanggalMasuk, setTanggalMasuk] = useState<string | null>(null);
    const [tanggalKeluar, setTanggalKeluar] = useState<string | null>(null);
    const [lamaDirawat, setLamaDirawat] = useState<string | null>(null);
    const [riwayatPenyakitSekarang, setRiwayatPenyakitSekarang] = useState<string | null>(null);
    const [riwayatPenyakitLalu, setRiwayatPenyakitLalu] = useState<string | null>(null);
    const [pemeriksaanFisik, setPemeriksaanFisik] = useState<string | null>(null);
    const [permintaanKonsul, setPermintaanKonsul] = useState<{ permintaan: string; jawaban: string }[]>([]);
    const [diagnosaUtama, setDiagnosaUtama] = useState<string | null>(null);
    const [icd10, setIcd10] = useState<string | null>(null);
    const [tindakanProsedur, setTindakanProsedur] = useState<string | null>(null);
    const [icd9, setIcd9] = useState<string | null>(null);
    const [diagnosaSekunder, setDiagnosaSekunder] = useState<string | null>(null);
    const [icd10Sekunder, setIcd10Sekunder] = useState<string | null>(null);
    const [tindakanProsedurSekunder, setTindakanProsedurSekunder] = useState<string | null>(null);
    const [icd9Sekunder, setIcd9Sekunder] = useState<string | null>(null);
    const [riwayatAlergi, setRiwayatAlergi] = useState<string | null>(null);
    const [keadaanPulang, setKeadaanPulang] = useState<string | null>(null);
    const [caraPulang, setCaraPulang] = useState<string | null>(null);
    const [poliTujuan, setPoliTujuan] = useState<string | null>(null);
    const [tanggalKontrol, setTanggalKontrol] = useState<string | null>(null);
    const [jamKontrol, setJamKontrol] = useState<string | null>(null);
    const [noSuratBPJS, setNoSuratBPJS] = useState<string | null>(null);
    const [gelarDepanDokter, setGelarDepanDokter] = useState<string | null>(null);
    const [gelarBelakangDokter, setGelarBelakangDokter] = useState<string | null>(null);
    const [namaDokter, setNamaDokter] = useState<string | null>(null);
    const [nomorKunjunganRawatInap, setNomorKunjunganRawatInap] = useState<string | null>(null);
    const [nomorKunjunganPoli, setNomorKunjunganPoli] = useState<string | null>(null);
    const [nomorKunjunganIGD, setNomorKunjunganIGD] = useState<string | null>(null);
    const [terapiPulang, setTerapiPulang] = useState<{ namaObat: string; jumlah: string; frekuensi: string; caraPemberian: string }[]>([]);
    const [dokumenPengkajianAwalLoaded, setDokumenPengkajianAwalLoaded] = useState<any>(false);
    const [dokumenTriageLoaded, setDokumenTriageLoaded] = useState<any>(false);
    const [dokumenCPPTLoaded, setDokumenCPPTLoaded] = useState<any>(false);
    const [keadaanUmum, setKeadaanUmum] = useState<string | null>(null);
    const [nadi, setNadi] = useState<string | null>(null);
    const [suhu, setSuhu] = useState<string | null>(null);
    const [sistole, setSistole] = useState<string | null>(null);
    const [diastole, setDiastole] = useState<string | null>(null);
    const [respirasi, setRespirasi] = useState<string | null>(null);

    useEffect(() => {
        setDiagnosaUtama(formatDiagnosaString(selectedDiagnosa));
        setTindakanProsedur(formatProcedureString(selectedProcedure));
    }, [selectedDiagnosa, selectedProcedure]);

    function formatDiagnosaString(selectedDiagnosa: any[]): string {
        // Gabungkan kode dan description
        const codes = selectedDiagnosa.map((item) => `${item.id}`);

        // Hitung kemunculan setiap kode-description
        const count: Record<string, number> = {};
        codes.forEach((code) => {
            count[code] = (count[code] || 0) + 1;
        });

        // Susun hasil sesuai urutan kemunculan pertama
        const result: string[] = [];
        const seen = new Set<string>();
        codes.forEach((code) => {
            if (!seen.has(code)) {
                if (count[code] > 1) {
                    result.push(`${code}+${count[code]}`);
                } else {
                    result.push(code);
                }
                seen.add(code);
            }
        });

        return result.join('#');
    }

    function formatProcedureString(selectedProcedure: any[]): string {
        // Gabungkan kode dan description
        const codes = selectedProcedure.map((item) => `${item.id}`);

        // Hitung kemunculan setiap kode-description
        const count: Record<string, number> = {};
        codes.forEach((code) => {
            count[code] = (count[code] || 0) + 1;
        });

        // Susun hasil sesuai urutan kemunculan pertama
        const result: string[] = [];
        const seen = new Set<string>();
        codes.forEach((code) => {
            if (!seen.has(code)) {
                if (count[code] > 1) {
                    result.push(`${code}+${count[code]}`);
                } else {
                    result.push(code);
                }
                seen.add(code);
            }
        });

        return result.join('#');
    }

    useEffect(() => {
        const kunjungan = Array.isArray(dataKunjungan) ? dataKunjungan[0] : dataKunjungan;
        if (dataKlaim.edit !== 1 && kunjungan) {
            setNamaPasien(kunjungan?.pendaftaran_pasien?.pasien?.NAMA || null);
            setNoRM(kunjungan?.pendaftaran_pasien?.pasien?.NORM || null);
            setTanggalLahir(kunjungan?.pendaftaran_pasien?.pasien?.TANGGAL_LAHIR || null);
            setJenisKelamin(kunjungan?.pendaftaran_pasien?.pasien?.JENIS_KELAMIN || null);
            setTanggalMasuk(kunjungan?.MASUK || null);
            setTanggalKeluar(kunjungan?.KELUAR || toDatetimeLocal(new Date()));
            setLamaDirawat(handleLamaDirawat(kunjungan?.MASUK, kunjungan?.KELUAR || toDatetimeLocal(new Date())));
            setRuangRawat(kunjungan?.ruangan?.DESKRIPSI || null);
            setPenjamin(kunjungan?.penjamin_pasien?.jenis_penjamin.DESKRIPSI || null);
            setIndikasiRawatInap(kunjungan?.resume_medis || null);
            setRiwayatPenyakitSekarang(kunjungan?.anamnesis_pasien?.DESKRIPSI || null);
            setRiwayatPenyakitLalu(kunjungan?.rpp?.DESKRIPSI || null);
            setPemeriksaanFisik(kunjungan?.pemeriksaan_fisik?.DESKRIPSI || null);
            setRiwayatAlergi(kunjungan?.riwayat_alergi?.DESKRIPSI || null);
            setKeadaanPulang(kunjungan?.pasien_pulang?.keadaan_pulang?.DESKRIPSI || 'Belum Pulang');
            setCaraPulang(kunjungan?.pasien_pulang?.cara_pulang?.DESKRIPSI || 'Belum Pulang');
            setSelectedDiagnosa(
                Array.isArray(kunjungan?.diagnosa_pasien)
                    ? kunjungan.diagnosa_pasien.map((item: any) => ({
                          id: item.nama_diagnosa?.CODE || '',
                          description: item.nama_diagnosa?.STR || '',
                      }))
                    : [],
            );
            setSelectedProcedure(
                Array.isArray(kunjungan?.prosedur_pasien)
                    ? kunjungan.prosedur_pasien.map((item: any) => ({
                          id: item.nama_prosedur?.CODE || '',
                          description: item.nama_prosedur?.STR || '',
                      }))
                    : [],
            );
            setDiagnosaUtama(formatDiagnosaString(selectedDiagnosa));
            setTindakanProsedur(formatProcedureString(selectedProcedure));
            setNomorKunjunganRawatInap(kunjungan?.NOMOR || null);
            setNomorKunjunganIGD(kunjungan?.nomor_kunjungan_igd || null);
            setPoliTujuan(kunjungan?.jadwal_kontrol?.ruangan?.DESKRIPSI || null);
            setTanggalKontrol(kunjungan?.jadwal_kontrol?.TANGGAL || null);
            setJamKontrol(kunjungan?.jadwal_kontrol?.JAM || null);
            setNoSuratBPJS(kunjungan?.jadwal_kontrol?.NOMOR_REFERENSI || null);

            const gelarDepan = kunjungan?.dokter_d_p_j_p?.pegawai?.GELAR_DEPAN ? kunjungan.dokter_d_p_j_p.pegawai.GELAR_DEPAN + '.' : '';
            const gelarBelakang = kunjungan?.dokter_d_p_j_p?.pegawai?.GELAR_BELAKANG ? ', ' + kunjungan.dokter_d_p_j_p.pegawai.GELAR_BELAKANG : '';
            const namaDokterLengkap = `${gelarDepan} ${kunjungan?.dokter_d_p_j_p?.pegawai?.NAMA || ''}${gelarBelakang}`;
            setNamaDokter(namaDokterLengkap);

            const resepPulang =
                Array.isArray(kunjungan?.order_resep_pulang) && kunjungan.order_resep_pulang.length > 0 ? kunjungan.order_resep_pulang[0] : null;

            if (resepPulang && Array.isArray(resepPulang.order_resep_detil)) {
                setTerapiPulang(
                    resepPulang.order_resep_detil.map((resep: any) => ({
                        namaObat: resep?.nama_obat?.NAMA || '',
                        jumlah: resep?.JUMLAH || '',
                        frekuensi: resep?.frekuensi_obat?.FREKUENSI || '',
                        caraPemberian: resep?.cara_pakai?.DESKRIPSI || '',
                    })),
                );
            } else if (resepPulang && resepPulang.order_resep_detil?.nama_obat) {
                setTerapiPulang([
                    {
                        namaObat: resepPulang.order_resep_detil.nama_obat.NAMA || '',
                        jumlah: resepPulang.order_resep_detil.JUMLAH || '',
                        frekuensi: resepPulang.order_resep_detil.frekuensi_obat?.FREKUENSI || '',
                        caraPemberian: resepPulang.order_resep_detil.cara_pakai?.DESKRIPSI || '',
                    },
                ]);
            } else {
                setTerapiPulang([]);
            }
        }

        if (dataKlaim.edit === 1 && kunjungan) {
            setNamaPasien(kunjungan?.resume_medis?.nama_pasien || null);
            setNoRM(kunjungan?.resume_medis?.no_rm || null);
            setTanggalLahir(kunjungan?.resume_medis?.tanggal_lahir || null);
            setJenisKelamin(kunjungan?.resume_medis?.jenis_kelamin || null);
            setRuangRawat(kunjungan?.resume_medis?.ruang_rawat || null);
            setPenjamin(kunjungan?.resume_medis?.penjamin || null);
            setIndikasiRawatInap(kunjungan?.resume_medis?.indikasi_rawat_inap || null);
            setTanggalMasuk(kunjungan?.resume_medis?.tanggal_masuk || null);
            setTanggalKeluar(kunjungan?.resume_medis?.tanggal_keluar || toDatetimeLocal(new Date()));
            setLamaDirawat(
                handleLamaDirawat(kunjungan?.resume_medis?.tanggal_masuk, kunjungan?.resume_medis?.tanggal_keluar || toDatetimeLocal(new Date())),
            );
            setRiwayatPenyakitSekarang(kunjungan?.resume_medis?.riwayat_penyakit_sekarang || null);
            setRiwayatPenyakitLalu(kunjungan?.resume_medis?.riwayat_penyakit_lalu || null);
            setPemeriksaanFisik(kunjungan?.resume_medis?.pemeriksaan_fisik || null);
            setRiwayatAlergi(kunjungan?.resume_medis?.riwayat_alergi || null);
            setKeadaanPulang(kunjungan?.resume_medis?.keadaan_pulang || 'Belum Pulang');
            setCaraPulang(kunjungan?.resume_medis?.cara_pulang || 'Belum Pulang');
            setKeadaanUmum(kunjungan?.resume_medis?.keadaan_umum || null);
            setNadi(kunjungan?.resume_medis?.nadi || null);
            setSuhu(kunjungan?.resume_medis?.suhu || null);
            setSistole(kunjungan?.resume_medis?.sistole || null);
            setDiastole(kunjungan?.resume_medis?.diastole || null);
            setRespirasi(kunjungan?.resume_medis?.respirasi || null);
            setSelectedDiagnosa(
                (kunjungan?.resume_medis?.diagnosa_utama || '')
                    .split('#')
                    .filter(Boolean)
                    .flatMap((item: string) => {
                        const [id, countStr] = item.split('+');
                        const count = countStr ? parseInt(countStr, 10) : 1;
                        return Array(count).fill({ id, description: '' });
                    }),
            );
            setSelectedProcedure(
                (kunjungan?.resume_medis?.tindakan_prosedur || '')
                    .split('#')
                    .filter(Boolean)
                    .flatMap((item: string) => {
                        const [id, countStr] = item.split('+');
                        const count = countStr ? parseInt(countStr, 10) : 1;
                        return Array(count).fill({ id, description: '' });
                    }),
            );
        }
    }, [dataKlaim.edit, dataKunjungan]);

    const dataResumeMedis = {
        nomor_kunjungan_rawat_inap: nomorKunjunganRawatInap || null,
        nomor_kunjungan_igd: nomorKunjunganIGD || null,
        nomor_kunjungan_poli: nomorKunjunganPoli || null,
        id_resume_medis: idResumeMedis || null,
        id_pengajuan_klaim: dataKlaim.id,
        nama_pasien: namaPasien || null,
        no_rm: noRM || null,
        tanggal_lahir: tanggalLahir || null,
        jenis_kelamin: jenisKelamin || null,
        ruang_rawat: ruangRawat || null,
        penjamin: penjamin || null,
        indikasi_rawat_inap: indikasiRawatInap || null,
        tanggal_masuk: tanggalMasuk || null,
        tanggal_keluar: tanggalKeluar || null,
        lama_dirawat: lamaDirawat || null,
        riwayat_penyakit_sekarang: riwayatPenyakitSekarang || null,
        riwayat_penyakit_lalu: riwayatPenyakitLalu || null,
        pemeriksaan_fisik: pemeriksaanFisik || null,
        diagnosa_utama: diagnosaUtama || null,
        tindakan_prosedur: tindakanProsedur || null,
        riwayat_alergi: riwayatAlergi || null,
        keadaan_pulang: keadaanPulang || null,
        cara_pulang: caraPulang || null,
        dokter: namaDokter || null,
        permintaan_konsul: permintaanKonsul || null,
        terapi_pulang: terapiPulang || null,
        instruksi_tindak_lanjut: {
            poliTujuan: poliTujuan || null,
            tanggal: tanggalKontrol || null,
            jam: jamKontrol || null,
            nomor_bpjs: noSuratBPJS || null,
        },
        lembar_pengkajian_awal: dokumenPengkajianAwalLoaded,
        lembar_triage: dokumenTriageLoaded,
        lembar_cppt: dokumenCPPTLoaded,
        keadaan_umum: keadaanUmum || null,
        nadi: nadi || null,
        suhu: suhu || null,
        sistole: sistole || null,
        diastole: diastole || null,
        respirasi: respirasi || null,
    };

    function handleLamaDirawat(tanggalMasuk: string | null | undefined, tanggalKeluar: string | null | undefined): string {
        if (tanggalMasuk && tanggalKeluar) {
            const masuk = new Date(tanggalMasuk);
            const keluar = new Date(tanggalKeluar);
            masuk.setHours(0, 0, 0, 0);
            keluar.setHours(0, 0, 0, 0);
            if (masuk > keluar) {
                toast.error('Tanggal masuk tidak boleh lebih besar dari tanggal keluar.');
                return '';
            }
            const diffDays = (keluar.getTime() - masuk.getTime()) / (1000 * 60 * 60 * 24) + 1;
            return `${diffDays} hari`;
        }
        return '';
    }

    const handleAddKonsul = () => {
        setPermintaanKonsul([...permintaanKonsul, { permintaan: '', jawaban: '' }]);
    };

    const handleUpdateKonsul = (index: number, field: 'permintaan' | 'jawaban', value: string) => {
        const updatedKonsul = [...permintaanKonsul];
        updatedKonsul[index][field] = value;
        setPermintaanKonsul(updatedKonsul);
    };

    const handleRemoveKonsul = (index: number) => {
        const updatedKonsul = permintaanKonsul.filter((_, i) => i !== index);
        setPermintaanKonsul(updatedKonsul);
    };

    const handleLoadKonsul = () => {
        const konsulData = Array.isArray(dataKunjungan)
            ? dataKunjungan.flatMap((k: any) => k.permintaan_konsul || [])
            : dataKunjungan?.permintaan_konsul
              ? dataKunjungan.permintaan_konsul
              : [];

        if (!konsulData || konsulData.length === 0) {
            toast.error('Data permintaan konsul tidak tersedia.');
            return;
        }

        toast.success('Data permintaan konsul berhasil dimuat.');

        const konsulList = konsulData.map((item: any) => {
            const permintaan = item.PERMINTAAN_TINDAKAN || '';
            const jawaban = item.jawaban_konsul?.JAWABAN || '';

            if (!jawaban) {
                toast.error(`Jawaban kosong untuk permintaan: ${permintaan}`);
            }

            return { permintaan, jawaban };
        });

        setPermintaanKonsul(konsulList);
    };

    function stripHtmlTags(html: string): string {
        return html.replace(/<\/?[^>]+(>|$)/g, ''); // Hapus semua tag HTML
    }

    const handleAddTerapi = () => {
        setTerapiPulang([...terapiPulang, { namaObat: '', jumlah: '', frekuensi: '', caraPemberian: '' }]);
    };

    const handleRemoveTerapi = (index: number) => {
        const updatedTerapi = terapiPulang.filter((_, i) => i !== index);
        setTerapiPulang(updatedTerapi);
    };

    const handleUpdateTerapi = (index: number, field: 'namaObat' | 'jumlah' | 'frekuensi' | 'caraPemberian', value: string) => {
        const updatedTerapi = [...terapiPulang];
        updatedTerapi[index][field] = value;
        setTerapiPulang(updatedTerapi);
    };

    //State untuk dokumen lainnya
    const [dokumenPengkajianAwal, setDokumenPengkajianAwal] = useState<any>(false);
    const [dokumenTriage, setDokumenTriage] = useState<any>(false);
    const [dokumenCPPT, setDokumenCPPT] = useState<any>(false);

    const handleTriageChange = (data: any) => {
        setDokumenTriage(data === false ? false : data);
    };

    const handlePengkajianAwalChange = (data: any) => {
        setDokumenPengkajianAwal(data === false ? false : data);
    };

    const handleCPPTChange = (data: any) => {
        setDokumenCPPT(data === false ? false : data);
    };

    const handleSave = async () => {
        try {
            const response = await axios.post(
                route('eklaim.editData.storeResumeMedis'),
                {
                    jenisSave: dataKlaim.edit,
                    resumeMedis: dataResumeMedis,
                    pengkajianAwal: dokumenPengkajianAwal,
                    triage: dokumenTriage,
                    cppt: dokumenCPPT,
                },
                { headers: { 'Content-Type': 'application/json' } },
            );
            if (response.data.success) {
                toast.success(response.data.success);
                window.location.reload(); // Reload halaman setelah sukses
            }
            if (response.data.error) toast.error(response.data.error);
        } catch (error: any) {
            // Tangani error dari axios
            if (error.response && error.response.data && error.response.data.error) {
                toast.error(error.response.data.error);
            } else if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Terjadi kesalahan saat menyimpan data.');
            }
            console.error('Error saving data:', error);
        }
    };

    const [obatOptions, setObatOptions] = useState<any[]>([]);

    const handleSearchObat = async (keyword: string) => {
        try {
            const res = await axios.get(route('getNamaObat'), { params: { q: keyword } });
            setObatOptions(res.data);
        } catch {
            setObatOptions([]);
        }
    };

    const getObatDropdownData = (value: string, options: any[]) => {
        if (!value) return options;
        // Cek apakah value sudah ada di options
        const exists = options.some((item) => item?.DESKRIPSI === value);
        if (!exists) {
            // Tambahkan value manual agar tetap muncul di dropdown
            return [{ DESKRIPSI: value, ID: value }, ...options];
        }
        return options;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Resume Medis" />
            <div className="p-4">
                <div>
                    <ul className="list-disc">
                        <>
                            <table
                                style={{
                                    fontFamily: 'halvetica, sans-serif',
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    border: '1px solid #000',
                                }}
                            >
                                <tbody>
                                    <tr>
                                        <td colSpan={2}>
                                            {/* Gunakan data Base64 untuk menampilkan gambar */}
                                            <center>
                                                <img src={imageBase64} alt="Logo Klinik" style={{ width: 50, height: 50 }} />
                                            </center>
                                        </td>
                                        <td colSpan={4}>
                                            <div style={{ lineHeight: '1.2' }}>
                                                <h3 style={{ fontSize: 20, textAlign: 'left' }}>KLINIK RAWAT INAP UTAMA MUHAMMADIYAH KEDUNGADEM</h3>
                                                <p style={{ fontSize: 12, textAlign: 'left' }}>
                                                    Jl. PUK Desa Drokilo. Kec. Kedungadem Kab. Bojonegoro <br />
                                                    Email : klinik.muh.kedungadem@gmail.com | WA : 082242244646 <br />
                                                </p>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="mb-4 flex items-center gap-4">
                                                <Label htmlFor="mode-switch" className="text-base">
                                                    Asli
                                                </Label>
                                                <Switch
                                                    id="mode-switch"
                                                    checked={dataKlaim.edit === 1}
                                                    onCheckedChange={async (checked) => {
                                                        try {
                                                            await router.get(
                                                                route('eklaim.klaim.switchEdit', { pengajuanKlaim: dataKlaim.id }),
                                                                {},
                                                                {
                                                                    preserveScroll: true,
                                                                    preserveState: false,
                                                                },
                                                            );
                                                        } catch (error) {
                                                            toast.error('Gagal switch mode data.');
                                                            console.error('Error switching mode:', error);
                                                        }
                                                    }}
                                                    className="scale-150" // Membesarkan switch
                                                />
                                                <span className="ml-2 text-lg">Edit</span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr style={{ background: 'black', color: 'white', textAlign: 'center' }}>
                                        <td colSpan={8}>
                                            <h3 style={{ fontSize: 16 }}>RINGKASAN PULANG</h3>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table
                                style={{
                                    fontFamily: 'halvetica, sans-serif',
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    border: '1px solid #000',
                                }}
                            >
                                <tbody>
                                    <tr>
                                        <td
                                            colSpan={2}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <strong>Nama Pasien :</strong>
                                            <br />
                                            {namaPasien || 'Tidak ada nama'}
                                        </td>
                                        <td
                                            colSpan={2}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <strong>No. RM :</strong>
                                            <br />
                                            {noRM || 'Tidak ada No. RM'}
                                        </td>
                                        <td
                                            colSpan={2}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <strong>Tanggal Lahir :</strong>
                                            <br />
                                            {tanggalLahir ? formatTanggalIndo(tanggalLahir) : 'Tidak ada tanggal lahir'}
                                        </td>
                                        <td
                                            colSpan={2}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <strong>Jenis Kelamin :</strong>
                                            <br />
                                            {jenisKelamin === 1 ? 'Laki-laki' : jenisKelamin === 2 ? 'Perempuan' : jenisKelamin}
                                        </td>
                                    </tr>

                                    {/* Administrasi Pasien */}
                                    <tr>
                                        <td
                                            colSpan={2}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <strong>Tanggal Masuk :</strong>
                                            <br />
                                            <div className="mt-2 flex items-center space-x-2 px-3 pb-4">
                                                <Input
                                                    type="dateTime-local"
                                                    value={tanggalMasuk || ''}
                                                    onChange={(e) => setTanggalMasuk(e.target.value)}
                                                    className="rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                                {/* <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                if (k.pendaftaran_pasien?.TANGGAL) {
                                                                    setTanggalMasuk(k?.pendaftaran_pasien?.TANGGAL)
                                                                } else {
                                                                    toast.error("Tanggal masuk tidak tersedia untuk kunjungan ini.");
                                                                }
                                                            }}
                                                            className="border border-gray-300 rounded-md p-2 bg-blue-500 text-white hover:bg-blue-600"
                                                        >
                                                            Load
                                                        </Button> */}
                                            </div>
                                        </td>
                                        <td
                                            colSpan={2}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <strong>Tanggal Keluar :</strong>
                                            <br />
                                            <div className="mt-2 flex items-center space-x-2 px-3 pb-4">
                                                <Input
                                                    type="dateTime-local"
                                                    value={tanggalKeluar || ''}
                                                    onChange={(e) => setTanggalKeluar(e.target.value)}
                                                    className="rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />

                                                {/* <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                if (k.KELUAR) {
                                                                    setTanggalKeluar(k?.KELUAR)
                                                                } else {
                                                                    toast.error("Tanggal keluar tidak tersedia untuk kunjungan ini.");
                                                                }
                                                            }}
                                                            className="border border-gray-300 rounded-md p-2 bg-blue-500 text-white hover:bg-blue-600"
                                                        >
                                                            Load
                                                        </Button> */}
                                            </div>
                                        </td>
                                        <td
                                            colSpan={2}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <strong>Lama Dirawat:</strong>
                                            <br />
                                            <div className="mt-2 flex items-center space-x-2 px-3 pb-4">
                                                <Input
                                                    type="text"
                                                    value={lamaDirawat || ''}
                                                    readOnly
                                                    placeholder="Lama dirawat"
                                                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        if (tanggalMasuk && tanggalKeluar) {
                                                            // Konversi tanggal masuk dan keluar ke objek Date
                                                            const masuk = new Date(tanggalMasuk);
                                                            const keluar = new Date(tanggalKeluar);

                                                            // Normalisasi waktu ke pukul 00:00:00
                                                            masuk.setHours(0, 0, 0, 0);
                                                            keluar.setHours(0, 0, 0, 0);

                                                            // Validasi jika tanggal masuk lebih besar dari tanggal keluar
                                                            if (masuk > keluar) {
                                                                toast.error('Tanggal masuk tidak boleh lebih besar dari tanggal keluar.');
                                                                return;
                                                            }

                                                            // Hitung jumlah hari berdasarkan pergantian hari kalender
                                                            const diffDays = (keluar.getTime() - masuk.getTime()) / (1000 * 60 * 60 * 24) + 1;

                                                            // Set hasil lama dirawat
                                                            setLamaDirawat(`${diffDays} hari`);
                                                        } else {
                                                            toast.error('Tanggal masuk dan keluar harus diisi untuk menghitung lama dirawat.');
                                                        }
                                                    }}
                                                    className="rounded-md border border-gray-300 bg-blue-500 p-2 text-white hover:bg-blue-600"
                                                >
                                                    Hitung
                                                </Button>
                                            </div>
                                        </td>
                                        <td
                                            colSpan={2}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <strong>Ruang Rawat :</strong>
                                            <br />
                                            {ruangRawat || 'Tidak ada Ruang Rawat'}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td
                                            colSpan={4}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <strong>Penjamin :</strong>
                                            <br />
                                            {penjamin || 'Tidak ada Penjamin'}
                                        </td>
                                        <td
                                            colSpan={4}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <strong>Indikasi Rawat Inap :</strong>
                                            <br />
                                            {indikasiRawatInap || 'Tidak ada Indikasi Rawat Inap'}
                                        </td>
                                    </tr>

                                    {/* Riwayat Penyakit */}
                                    <tr>
                                        <td
                                            colSpan={2}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <strong>Riwayat Penyakit :</strong>
                                        </td>
                                        <td
                                            colSpan={6}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <div className="flex flex-col space-y-2 px-2">
                                                <strong>Riwayat Penyakit Sekarang :</strong>
                                                <Textarea
                                                    value={riwayatPenyakitSekarang || ''}
                                                    onChange={(e) => setRiwayatPenyakitSekarang(e.target.value)}
                                                    placeholder="Masukkan riwayat penyakit sekarang"
                                                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                            </div>
                                            <div className="flex flex-col space-y-2 px-2 py-4">
                                                <strong>Riwayat Penyakit Lalu :</strong>
                                                <Textarea
                                                    value={riwayatPenyakitLalu || ''}
                                                    onChange={(e) => setRiwayatPenyakitLalu(e.target.value)}
                                                    placeholder="Masukkan riwayat penyakit lalu"
                                                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Pemeriksaan Fisik */}
                                    <tr>
                                        <td
                                            colSpan={2}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <strong>Pemeriksaan Fisik :</strong>
                                        </td>
                                        <td
                                            colSpan={6}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <div className="flex flex-col space-y-2 px-2 py-4">
                                                <Textarea
                                                    value={pemeriksaanFisik || ''}
                                                    onChange={(e) => setPemeriksaanFisik(e.target.value)}
                                                    placeholder="Masukkan pemeriksaan fisik"
                                                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Konsultasi */}
                                    <tr>
                                        <td
                                            colSpan={2}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <strong>Hasil Konsultasi :</strong>
                                        </td>
                                        <td
                                            colSpan={6}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 'auto',
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <div className="py-2">
                                                {/* Render semua permintaan konsul */}
                                                {permintaanKonsul.length === 0 ? (
                                                    <div className="px-2 pb-2 text-gray-400 italic">Belum ada permintaan konsul.</div>
                                                ) : (
                                                    permintaanKonsul.map((konsul, index) => (
                                                        <div key={index} className="px-2">
                                                            <div className="mb-2 flex items-center justify-between gap-2">
                                                                <Input
                                                                    type="text"
                                                                    value={konsul.permintaan}
                                                                    onChange={(e) => handleUpdateKonsul(index, 'permintaan', e.target.value)}
                                                                    placeholder="Masukkan permintaan konsul"
                                                                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                                />
                                                                <Input
                                                                    type="text"
                                                                    value={stripHtmlTags(konsul.jawaban)}
                                                                    onChange={(e) => handleUpdateKonsul(index, 'jawaban', e.target.value)}
                                                                    placeholder="Masukkan jawaban konsul"
                                                                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                                />
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => handleRemoveKonsul(index)}
                                                                    className="rounded-md border border-gray-300 bg-red-500 p-2 text-white hover:bg-red-600"
                                                                >
                                                                    Hapus
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}

                                                {/* Tombol Tambah Konsul */}
                                                <div className="flex px-2 pb-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={handleAddKonsul}
                                                        className="rounded-md border border-gray-300 bg-blue-500 p-2 text-white hover:bg-blue-600"
                                                    >
                                                        Tambah Konsul
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={handleLoadKonsul}
                                                        className="rounded-md border border-gray-300 bg-blue-500 p-2 text-white hover:bg-blue-600"
                                                    >
                                                        Load
                                                    </Button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Diagnosa */}
                                    <tr>
                                        <td
                                            colSpan={2}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '40%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <strong>Diagnosa</strong>
                                        </td>
                                        <td className="border border-black px-2 py-2" colSpan={6}>
                                            <div
                                                className="flex w-full cursor-pointer flex-wrap gap-2 rounded border px-3 py-2"
                                                onClick={() => setShowDiagnosaModal(true)} // Tampilkan modal saat diklik
                                            >
                                                {selectedDiagnosa.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex cursor-pointer items-center gap-2 rounded bg-blue-100 px-2 py-1 text-blue-700"
                                                        onClick={() => {
                                                            setDiagnosaSearch(item.id); // Masukkan ID ke input pencarian
                                                            fetchDiagnosa(item.id); // Panggil fetchDiagnosa untuk memperbarui tabel
                                                            setShowDiagnosaModal(true); // Tampilkan modal
                                                        }}
                                                    >
                                                        <span>{`${item.id}${item.description || ''}`}</span> {/* Gabungkan ID dan DESKRIPSI */}
                                                        <button
                                                            className="text-red-500 hover:text-red-700"
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Hentikan event klik badge agar tidak memicu onClick parent
                                                                setSelectedDiagnosa(
                                                                    (prev) => prev.filter((_, i) => i !== index), // Hapus item berdasarkan index
                                                                );
                                                            }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                                <input
                                                    type="text"
                                                    className="flex-1 outline-none"
                                                    placeholder="Pilih Diagnosa"
                                                    onClick={() => setShowDiagnosaModal(true)} // Tampilkan modal saat diklik
                                                    readOnly
                                                />
                                            </div>
                                            <small className="text-red-500">* Untuk diagnosa primary pastikan pada pilihan pertama (ICD-10)</small>
                                            <br />
                                            <small className="text-red-500">* Pilih 2 kali jika diagnosa digunakan lebih dari sekali</small>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td
                                            colSpan={2}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '40%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <strong>Procedure</strong>
                                        </td>
                                        <td className="border border-black px-2 py-2" colSpan={6}>
                                            <div
                                                className="flex w-full cursor-pointer flex-wrap gap-2 rounded border px-3 py-2"
                                                onClick={() => setShowProcedureModal(true)} // Tampilkan modal saat diklik
                                            >
                                                {selectedProcedure.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex cursor-pointer items-center gap-2 rounded bg-green-100 px-2 py-1 text-green-700"
                                                        onClick={() => {
                                                            setProcedureSearch(item.id); // Masukkan ID ke input pencarian
                                                            fetchProcedure(item.id); // Panggil fetchProcedure untuk memperbarui tabel
                                                            setShowProcedureModal(true); // Tampilkan modal
                                                        }}
                                                    >
                                                        <span>{`${item.id} ${item.description || ''}`}</span> {/* Gabungkan ID dan DESKRIPSI */}
                                                        <button
                                                            className="text-red-500 hover:text-red-700"
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Hentikan event klik badge agar tidak memicu onClick parent
                                                                setSelectedProcedure(
                                                                    (prev) => prev.filter((_, i) => i !== index), // Hapus item berdasarkan index
                                                                );
                                                            }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                                <input
                                                    type="text"
                                                    className="flex-1 outline-none"
                                                    placeholder="Pilih Procedure"
                                                    onClick={() => setShowProcedureModal(true)} // Tampilkan modal saat diklik
                                                    readOnly
                                                />
                                            </div>
                                            <small className="text-red-500">* Untuk procedure primary pastikan pada pilihan pertama (ICD-9)</small>
                                            <br />
                                            <small className="text-red-500">* Pilih 2 kali jika procedure digunakan lebih dari sekali</small>
                                        </td>
                                    </tr>

                                    {/* Keadaan Umum */}
                                    <tr>
                                        <td
                                            colSpan={2}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '5%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <strong>Keadaan Umum</strong>
                                        </td>
                                        <td
                                            colSpan={6}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '5%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <div className="gap-2 px-2 py-4">
                                                <Input
                                                    type="text"
                                                    value={keadaanUmum || ''}
                                                    onChange={(e) => setKeadaanUmum(e.target.value)}
                                                    placeholder="Masukkan keadaan umum"
                                                    className="mb-2 w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                                <Input
                                                    type="text"
                                                    value={suhu || ''}
                                                    onChange={(e) => setSuhu(e.target.value)}
                                                    placeholder="Masukkan suhu"
                                                    className="mb-2 w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                                <Input
                                                    type="text"
                                                    value={respirasi || ''}
                                                    onChange={(e) => setRespirasi(e.target.value)}
                                                    placeholder="Masukkan respirasi"
                                                    className="mb-2 w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                                <Input
                                                    type="text"
                                                    value={sistole || ''}
                                                    onChange={(e) => setSistole(e.target.value)}
                                                    placeholder="Masukkan sistole"
                                                    className="mb-2 w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                                <Input
                                                    type="text"
                                                    value={diastole || ''}
                                                    onChange={(e) => setDiastole(e.target.value)}
                                                    placeholder="Masukkan diastole"
                                                    className="mb-2 w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                                <Input
                                                    type="text"
                                                    value={nadi || ''}
                                                    onChange={(e) => setNadi(e.target.value)}
                                                    placeholder="Masukkan nadi"
                                                    className="mb-2 w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Riwayat Alergi */}
                                    <tr>
                                        <td
                                            colSpan={2}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '5%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <strong>Riwayat Alergi</strong>
                                        </td>
                                        <td
                                            colSpan={6}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '5%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <div className="flex gap-2 px-2 py-4">
                                                <Input
                                                    type="text"
                                                    value={riwayatAlergi || ''}
                                                    onChange={(e) => setRiwayatAlergi(e.target.value)}
                                                    placeholder="Masukkan riwayat alergi"
                                                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Pasien Pulang */}
                                    <tr>
                                        <td
                                            colSpan={2}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <strong>Keadaan Pulang</strong>
                                        </td>
                                        <td
                                            colSpan={6}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '5%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <div className="flex gap-2 px-2 py-4">
                                                <Input
                                                    type="text"
                                                    value={keadaanPulang || ''}
                                                    onChange={(e) => setKeadaanPulang(e.target.value)}
                                                    placeholder="Masukkan keadaan pulang"
                                                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td
                                            colSpan={2}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <strong>Cara Pulang</strong>
                                        </td>
                                        <td
                                            colSpan={6}
                                            style={{
                                                verticalAlign: 'top',
                                                height: 70,
                                                width: '5%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <div className="flex gap-2 px-2 py-4">
                                                <Input
                                                    type="text"
                                                    value={caraPulang || ''}
                                                    onChange={(e) => setCaraPulang(e.target.value)}
                                                    placeholder="Masukkan cara pulang"
                                                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Terapi Pulang */}
                                    <tr>
                                        <td
                                            colSpan={8}
                                            style={{
                                                verticalAlign: 'middle',
                                                textAlign: 'center',
                                                height: 70,
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            <strong>Terapi Pulang</strong>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td
                                            colSpan={2}
                                            style={{
                                                verticalAlign: 'middle',
                                                textAlign: 'center',
                                                height: 70,
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            Nama Obat
                                        </td>
                                        <td
                                            style={{
                                                verticalAlign: 'middle',
                                                textAlign: 'center',
                                                height: 70,
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            Jumlah
                                        </td>
                                        <td
                                            colSpan={2}
                                            style={{
                                                verticalAlign: 'middle',
                                                textAlign: 'center',
                                                height: 70,
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            Frekuensi
                                        </td>
                                        <td
                                            colSpan={2}
                                            style={{
                                                verticalAlign: 'middle',
                                                textAlign: 'center',
                                                height: 70,
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                            }}
                                        >
                                            Cara Pemberian
                                        </td>
                                        <td></td>
                                    </tr>

                                    {terapiPulang.map((terapi, index) => (
                                        <tr key={index}>
                                            <td
                                                colSpan={2}
                                                style={{
                                                    verticalAlign: 'middle',
                                                    height: 70,
                                                    width: '20%',
                                                    border: '1px solid #000',
                                                    paddingLeft: 10,
                                                    paddingRight: 10,
                                                }}
                                            >
                                                <SearchableDropdown
                                                    data={getObatDropdownData(terapi.namaObat, obatOptions)}
                                                    value={terapi.namaObat}
                                                    setValue={(val: string) => handleUpdateTerapi(index, 'namaObat', val)}
                                                    placeholder="Cari nama obat"
                                                    getOptionLabel={(item) => item?.DESKRIPSI ?? ''}
                                                    getOptionValue={(item) => item?.DESKRIPSI ?? ''}
                                                    onSearch={handleSearchObat}
                                                />
                                            </td>
                                            <td
                                                style={{
                                                    verticalAlign: 'middle',
                                                    height: 70,
                                                    width: '20%',
                                                    border: '1px solid #000',
                                                    paddingLeft: 10,
                                                    paddingRight: 10,
                                                }}
                                            >
                                                <Input
                                                    type="number"
                                                    value={Number(terapi.jumlah)}
                                                    onChange={(e) => handleUpdateTerapi(index, 'jumlah', e.target.value)}
                                                    placeholder="Masukkan jumlah"
                                                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                            </td>
                                            <td
                                                colSpan={2}
                                                style={{
                                                    verticalAlign: 'middle',
                                                    height: 70,
                                                    width: '20%',
                                                    border: '1px solid #000',
                                                    paddingLeft: 10,
                                                    paddingRight: 10,
                                                }}
                                            >
                                                <Input
                                                    type="text"
                                                    value={terapi.frekuensi}
                                                    onChange={(e) => handleUpdateTerapi(index, 'frekuensi', e.target.value)}
                                                    placeholder="Masukkan frekuensi"
                                                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                            </td>
                                            <td
                                                colSpan={2}
                                                style={{
                                                    verticalAlign: 'middle',
                                                    height: 70,
                                                    width: '20%',
                                                    border: '1px solid #000',
                                                    paddingLeft: 10,
                                                    paddingRight: 10,
                                                }}
                                            >
                                                <Input
                                                    type="text"
                                                    value={terapi.caraPemberian}
                                                    onChange={(e) => handleUpdateTerapi(index, 'caraPemberian', e.target.value)}
                                                    placeholder="Masukkan cara pemberian"
                                                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                            </td>
                                            <td
                                                style={{
                                                    verticalAlign: 'middle',
                                                    height: 70,
                                                    width: '20%',
                                                    border: '1px solid #000',
                                                    paddingLeft: 10,
                                                    paddingRight: 10,
                                                }}
                                            >
                                                <div className="flex h-full items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleAddTerapi(index)}
                                                        className="rounded-md border border-gray-300 bg-green-500 p-2 text-white hover:bg-green-600"
                                                    >
                                                        Tambah
                                                    </Button>
                                                    {/* {
                                                                index < 1 && (
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={() => handleLoadObat(k.order_resep)}
                                                                        className="border border-gray-300 rounded-md p-2 bg-blue-500 text-white hover:bg-blue-600"
                                                                    >
                                                                        Load
                                                                    </Button>
                                                                )
                                                            } */}
                                                    {terapiPulang.length > 1 &&
                                                        index > 0 && ( // Tampilkan tombol Hapus hanya jika lebih dari satu item
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => handleRemoveTerapi(index)}
                                                                className="rounded-md border border-gray-300 bg-red-500 p-2 text-white hover:bg-red-600"
                                                            >
                                                                Hapus
                                                            </Button>
                                                        )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {/* Intruksi Tidak Lanjut */}
                                    <tr>
                                        <td
                                            colSpan={2}
                                            style={{
                                                verticalAlign: 'middle',
                                                height: 70,
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                                paddingRight: 5,
                                            }}
                                        >
                                            <strong>Intruksi Tindak Lanjut</strong>
                                        </td>
                                        <td
                                            colSpan={6}
                                            style={{
                                                verticalAlign: 'middle',
                                                height: 70,
                                                width: '5%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                                paddingRight: 5,
                                            }}
                                        >
                                            <div className="gap-2 px-2 py-4">
                                                <strong>Poli Tujuan :</strong> {poliTujuan ?? 'Tidak ada'}
                                                <br />
                                                <strong>Tanggal :</strong> {tanggalKontrol ?? 'Tidak ada'}
                                                <br />
                                                <strong>Jam :</strong> {jamKontrol ?? 'Tidak ada'}
                                                <br />
                                                <strong>No Surat BPJS :</strong> {noSuratBPJS ?? 'Tidak ada'}
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Tambahan Dokumen Lainnya */}
                                    <tr
                                        style={{
                                            verticalAlign: 'middle',
                                            height: 70,
                                            width: '20%',
                                            border: '1px solid #000',
                                            paddingLeft: 5,
                                            paddingRight: 5,
                                        }}
                                    >
                                        <td
                                            colSpan={8}
                                            style={{
                                                verticalAlign: 'middle',
                                                textAlign: 'center',
                                                height: 70,
                                                width: '20%',
                                                border: '1px solid #000',
                                                paddingLeft: 5,
                                                paddingRight: 5,
                                            }}
                                        >
                                            <strong>Tambahan Dokumen Lainnya</strong>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td
                                            colSpan={6}
                                            style={{
                                                verticalAlign: 'middle',
                                                height: 70,
                                                border: '1px solid #000',
                                            }}
                                        >
                                            <div className="gap-2 px-2 py-4 text-center">Pengkajian Awal</div>
                                        </td>
                                        <td
                                            colSpan={2}
                                            style={{
                                                verticalAlign: 'middle',
                                                height: 70,
                                                border: '1px solid #000',
                                            }}
                                        >
                                            <div className="gap-2 px-2 py-4 text-center">
                                                <Checkbox
                                                    className="h-8 w-8"
                                                    checked={dokumenPengkajianAwalLoaded}
                                                    onCheckedChange={(checked) => {
                                                        setDokumenPengkajianAwalLoaded(checked);
                                                        if (!checked) setDokumenPengkajianAwal(false);
                                                    }}
                                                />
                                            </div>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td
                                            colSpan={6}
                                            style={{
                                                verticalAlign: 'middle',
                                                height: 70,
                                                border: '1px solid #000',
                                            }}
                                        >
                                            <div className="gap-2 px-2 py-4 text-center">Triage</div>
                                        </td>
                                        <td
                                            colSpan={2}
                                            style={{
                                                verticalAlign: 'middle',
                                                height: 70,
                                                border: '1px solid #000',
                                            }}
                                        >
                                            <div className="gap-2 px-2 py-4 text-center">
                                                <Checkbox
                                                    className="h-8 w-8"
                                                    checked={dokumenTriageLoaded}
                                                    onCheckedChange={(checked) => {
                                                        setDokumenTriageLoaded(checked);
                                                        if (!checked) setDokumenTriage(false);
                                                    }}
                                                />
                                            </div>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td
                                            colSpan={6}
                                            style={{
                                                verticalAlign: 'middle',
                                                height: 70,
                                                border: '1px solid #000',
                                            }}
                                        >
                                            <div className="gap-2 px-2 py-4 text-center">CPPT</div>
                                        </td>
                                        <td
                                            colSpan={2}
                                            style={{
                                                verticalAlign: 'middle',
                                                height: 70,
                                                border: '1px solid #000',
                                            }}
                                        >
                                            <div className="gap-2 px-2 py-4 text-center">
                                                <Checkbox
                                                    className="h-8 w-8"
                                                    checked={dokumenCPPTLoaded}
                                                    onCheckedChange={(checked) => {
                                                        setDokumenCPPTLoaded(checked);
                                                        if (!checked) setDokumenCPPT(false);
                                                    }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {dokumenPengkajianAwalLoaded && (
                                <div>
                                    <PengkajianAwal
                                        imageBase64={imageBase64}
                                        onChange={handlePengkajianAwalChange}
                                        nomorKunjungan={nomorKunjunganIGD}
                                        mode={dataKlaim.edit}
                                    />
                                </div>
                            )}

                            {dokumenTriageLoaded && (
                                <div>
                                    <Triage
                                        imageBase64={imageBase64}
                                        onChange={handleTriageChange}
                                        nomorKunjungan={nomorKunjunganIGD}
                                        mode={dataKlaim.edit}
                                    />
                                </div>
                            )}

                            {dokumenCPPTLoaded && (
                                <div>
                                    <CPPT
                                        imageBase64={imageBase64}
                                        onChange={handleCPPTChange}
                                        nomorKunjungan={nomorKunjunganRawatInap}
                                        mode={dataKlaim.edit}
                                    />
                                </div>
                            )}

                            <div>
                                <div className="mt-4 flex justify-end">
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        onClick={handleSave}
                                        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                    >
                                        Simpan
                                    </Button>
                                </div>
                            </div>
                        </>
                    </ul>
                </div>
            </div>
            <DiagnosaModal
                open={showDiagnosaModal}
                onClose={() => setShowDiagnosaModal(false)}
                diagnosaOptions={diagnosaOptions}
                diagnosaSearch={diagnosaSearch}
                setDiagnosaSearch={setDiagnosaSearch}
                fetchDiagnosa={fetchDiagnosa}
                selectedDiagnosa={selectedDiagnosa}
                setSelectedDiagnosa={setSelectedDiagnosa}
            />
            <ProcedureModal
                open={showProcedureModal}
                onClose={() => setShowProcedureModal(false)}
                procedureOptions={procedureOptions}
                procedureSearch={procedureSearch}
                setProcedureSearch={setProcedureSearch}
                fetchProcedure={fetchProcedure}
                selectedProcedure={selectedProcedure}
                setSelectedProcedure={setSelectedProcedure}
            />
        </AppLayout>
    );
}
