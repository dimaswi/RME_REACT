import SearchableDropdown from '@/components/SearchableDropdown';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { Loader } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import DiagnosaModal from './DiagnosaModal';
import ProcedureModal from './ProcedureModal';

type Props = {
    item: any;
    formatTanggal: (tanggal: string | null) => string;
    getStatusBadge: (status: number, id: string) => React.ReactNode;
    expanded: boolean;
};

export default function PengajuanKlaimCollapse({ item, formatTanggal, getStatusBadge, expanded }: Props) {
    // --- State ---
    const [caraMasuk, setCaraMasuk] = useState('');
    const [dataDischargeStatus, setDataDischargeStatus] = useState('');
    const [dataPenjaminKlaim, setDataPenjaminKlaim] = useState('');
    const [jenisPerawatan, setJenisPerawatan] = useState('');
    const [adlSubAcute, setAdlSubAcute] = useState('');
    const [adlChronic, setAdlChronic] = useState('');
    const [icuIndicator, setIcuIndicator] = useState('');
    const [icuLos, setIcuLos] = useState('');
    const [pemasangan, setPemasangan] = useState('');
    const [pencabutan, setPencabutan] = useState('');
    const [naikKelas, setNaikKelas] = useState(false);
    const [rawatIntensif, setRawatIntensif] = useState(false);
    const [ventilator, setVentilator] = useState(false);
    const [tanggalMasuk, setTanggalMasuk] = useState('');
    const [tanggalKeluar, setTanggalKeluar] = useState('');
    const [upgradeKelasKe, setUpgradeKelasKe] = useState('');
    const [upgradeKelasPayor, setUpgradeKelasPayor] = useState('');
    const [lamaUpgradeKelas, setLamaUpgradeKelas] = useState('');
    const [paymentPct, setPaymentPct] = useState('');
    const [lamaKunjungan, setLamaKunjungan] = useState<number>(0);
    const [tarifRs, setTarifRs] = useState(Number('0'));
    const [tarifProsedurNonBedah, setTarifProsedurNonBedah] = useState(Number(''));
    const [tarifProsedurBedah, setTarifProsedurBedah] = useState(Number(''));
    const [tarifKonsultasi, setTarifKonsultasi] = useState(Number(''));
    const [tarifTenagaAhli, setTarifTenagaAhli] = useState(Number(''));
    const [tarifKeperawatan, setTarifKeperawatan] = useState(Number(''));
    const [tarifPenunjang, setTarifPenunjang] = useState(Number(''));
    const [tarifRadiologi, setTarifRadiologi] = useState(Number(''));
    const [tarifLaboratorium, setTarifLaboratorium] = useState(Number(''));
    const [tarifPelayananDarah, setTarifPelayananDarah] = useState(Number(''));
    const [tarifRehabilitasi, setTarifRehabilitasi] = useState(Number(''));
    const [tarifKamar, setTarifKamar] = useState(Number(''));
    const [tarifRawatIntensif, setTarifRawatIntensif] = useState(Number(''));
    const [tarifObat, setTarifObat] = useState(Number(''));
    const [tarifObatKronis, setTarifObatKronis] = useState(Number(''));
    const [tarifObatKemoterapi, setTarifObatKemoterapi] = useState(Number(''));
    const [tarifAlkes, setTarifAlkes] = useState(Number(''));
    const [tarifBMHP, setTarifBMHP] = useState(Number(''));
    const [tarifSewaAlat, setTarifSewaAlat] = useState(Number(''));
    const [dataDokter, setDataDokter] = useState<any[]>([]);
    const [namaDokter, setNamaDokter] = useState('');
    const [kodeTarifRumahSAkit, setKodeTarifRumahSAkit] = useState('DS');
    const [tarifPoliEks, setTarifPoliEks] = useState(Number(''));
    const [payorCd, setPayorCd] = useState('');
    const [cobCd, setCobCd] = useState('');
    const [dokterPoliEksekutif, setDokterPoliEksekutif] = useState('');
    const [kodeTarifRsPoliEksekutif, setKodeTarifRsPoliEksekutif] = useState('DS');

    // --- Persalinan State ---
    const [persalinan, setPersalinan] = useState({
        usia_kehamilan: '',
        gravida: '',
        partus: '',
        abortus: '',
        onset_kontraksi: '',
        delivery: [
            {
                delivery_sequence: '',
                delivery_method: '',
                delivery_dttm: '',
                letak_janin: '',
                kondisi: '',
                use_manual: '',
                use_forcep: '',
                use_vacuum: '',
                shk_spesimen_ambil: '',
                shk_lokasi: '',
                shk_spesimen_dttm: '',
                shk_alasan: '',
            },
        ],
    });

    const addDelivery = () => {
        setPersalinan((prev) => ({
            ...prev,
            delivery: [
                ...prev.delivery,
                {
                    delivery_sequence: '',
                    delivery_method: '',
                    delivery_dttm: '',
                    letak_janin: '',
                    kondisi: '',
                    use_manual: '',
                    use_forcep: '',
                    use_vacuum: '',
                    shk_spesimen_ambil: '',
                    shk_lokasi: '',
                    shk_spesimen_dttm: '',
                    shk_alasan: '',
                },
            ],
        }));
    };

    const removeDelivery = (idx: number) => {
        setPersalinan((prev) => ({
            ...prev,
            delivery: prev.delivery.filter((_, i) => i !== idx),
        }));
    };

    const updateDelivery = (idx: number, field: string, value: string) => {
        setPersalinan((prev) => ({
            ...prev,
            delivery: prev.delivery.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
        }));
    };

    // --- Diagnosa & Procedure Modal State ---
    const [showDiagnosaModal, setShowDiagnosaModal] = useState(false);
    const [showProcedureModal, setShowProcedureModal] = useState(false);
    const [diagnosaOptions, setDiagnosaOptions] = useState<any[]>([]);
    const [diagnosaSearch, setDiagnosaSearch] = useState('');
    const [selectedDiagnosa, setSelectedDiagnosa] = useState<any[]>([]);
    const [procedureOptions, setProcedureOptions] = useState<any[]>([]);
    const [procedureSearch, setProcedureSearch] = useState('');
    const [selectedProcedure, setSelectedProcedure] = useState<any[]>([]);

    // --- Dropdown Options ---
    const caraMasukOptions = [
        { ID: 'gp', DESKRIPSI: 'Rujukan FKTP' },
        { ID: 'hosp-trans', DESKRIPSI: 'Rujukan FKRTL' },
        { ID: 'mp', DESKRIPSI: 'Rujukan Spesialis' },
        { ID: 'outp', DESKRIPSI: 'Dari Rawat Jalan' },
        { ID: 'inp', DESKRIPSI: 'Dari Rawat Inap' },
        { ID: 'emd', DESKRIPSI: 'Dari Rawat Darurat' },
        { ID: 'born', DESKRIPSI: 'Lahir di RS' },
        { ID: 'nursing', DESKRIPSI: 'Rujukan Panti Jompo' },
        { ID: 'psych', DESKRIPSI: 'Rujukan dari RS Jiwa' },
        { ID: 'rehab', DESKRIPSI: 'Rujukan Fasilitas Rehab' },
        { ID: 'other', DESKRIPSI: 'Lain-lain' },
    ];

    const jenisPerawatanOptions = [
        { ID: 1, DESKRIPSI: 'Rawat Inap' },
        { ID: 2, DESKRIPSI: 'Rawat Jalan' },
        { ID: 3, DESKRIPSI: 'Unit Gawat Darurat' },
    ];

    const listDischargeStatus = [
        { ID: 1, DESKRIPSI: 'Atas Persetujuan Dokter' },
        { ID: 2, DESKRIPSI: 'Dirujuk' },
        { ID: 3, DESKRIPSI: 'Atas Permintaan Sendiri' },
        { ID: 4, DESKRIPSI: 'Meninggal' },
        { ID: 5, DESKRIPSI: 'Lain-Lain' },
    ];

    const listUpgradeKelas = [
        { ID: 'kelas_1', DESKRIPSI: 'Kelas 1' },
        { ID: 'kelas_2', DESKRIPSI: 'Kelas 2' },
        { ID: 'vip', DESKRIPSI: 'VIP' },
        { ID: 'vvip', DESKRIPSI: 'VVIP' },
    ];

    const listPayorUpgradeKelas = [
        { ID: 'peserta', DESKRIPSI: 'Peserta' },
        { ID: 'pemberi_kerja', DESKRIPSI: 'Pemberi Kerja' },
        { ID: 'asuransi_tambahan', DESKRIPSI: 'Asuransi Tambahan' },
    ];

    // --- Utility ---
    function formatRupiah(value: string | number): string {
        if (!value) return 'Rp 0';
        const numberString = value.toString().replace(/[^,\d]/g, '');
        const split = numberString.split(',');
        const sisa = split[0].length % 3;
        let rupiah = split[0].substr(0, sisa);
        const ribuan = split[0].substr(sisa).match(/\d{3}/g);

        if (ribuan) {
            const separator = sisa ? '.' : '';
            rupiah += separator + ribuan.join('.');
        }

        return `Rp ${rupiah}${split[1] ? ',' + split[1] : ''}`;
    }

    function hitungLamaKunjungan(masuk: string, keluar: string): number {
        if (!masuk || !keluar) return 0;
        const tglMasuk = new Date(masuk);
        const tglKeluar = new Date(keluar);
        const diffMs = tglKeluar.getTime() - tglMasuk.getTime();
        const diffJam = diffMs / (1000 * 60 * 60);
        if (diffJam <= 1) return 1;
        return Math.ceil(diffJam / 24);
    }

    // --- Fetch Diagnosa/Procedure ---
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

    // --- Fetch Data Kunjungan ---
    const [loadingKunjungan, setLoadingKunjungan] = useState(false);
    const [dataKunjungan, setDataKunjungan] = useState<any>(null);
    const fetchDataKunjungan = async () => {
        setLoadingKunjungan(true);
        try {
            const response = await axios.get(`/eklaim/get/pengajuan-klaim/${item.id}`);
            setDataKunjungan(response.data);
            setJenisPerawatan(response.data.jenis_perawatan === 'Rawat Jalan' ? '2' : response.data.jenis_perawatan === 'IGD' ? '3' : '1');
            setDataPenjaminKlaim('3');
            const masuk = response.data.pendaftaran_poli.kunjungan_pasien[0].MASUK;
            const keluar = response.data.pendaftaran_poli.kunjungan_pasien[0].KELUAR;
            setTanggalMasuk(masuk);
            setTanggalKeluar(keluar);
            setDataDischargeStatus('1');
            setLamaKunjungan(hitungLamaKunjungan(masuk, keluar));
            setDataDokter(Array.isArray(response.data.dokter) ? response.data.dokter : []);
            setTarifProsedurBedah(Number(response.data.tagihan.PROSEDUR_BEDAH) || 0);
            setTarifProsedurNonBedah(Number(response.data.tagihan.PROSEDUR_NON_BEDAH) || 0);
            setTarifKonsultasi(Number(response.data.tagihan.KONSULTASI) || 0);
            setTarifTenagaAhli(Number(response.data.tagihan.TENAGA_AHLI) || 0);
            setTarifKeperawatan(Number(response.data.tagihan.KEPERAWATAN) || 0);
            setTarifPenunjang(Number(response.data.tagihan.PENUNJANG) || 0);
            setTarifRadiologi(Number(response.data.tagihan.RADIOLOGI) || 0);
            setTarifLaboratorium(Number(response.data.tagihan.LABORATORIUM) || 0);
            setTarifPelayananDarah(Number(response.data.tagihan.PELAYANAN_DARAH) || 0);
            setTarifRehabilitasi(Number(response.data.tagihan.REHABILITASI) || 0);
            setTarifKamar(Number(response.data.tagihan.KAMAR) || 0);
            setTarifRawatIntensif(Number(response.data.tagihan.RAWAT_INTENSIF) || 0);
            setTarifObat(Number(response.data.tagihan.OBAT) || 0);
            setTarifObatKronis(Number(response.data.tagihan.OBAT_KRONIS) || 0);
            setTarifObatKemoterapi(Number(response.data.tagihan.OBAT_KEMOTERAPI) || 0);
            setTarifAlkes(Number(response.data.tagihan.ALKES) || 0);
            setTarifBMHP(Number(response.data.tagihan.BMHP) || 0);
            setTarifSewaAlat(Number(response.data.tagihan.SEWA_ALAT) || 0);
            setTarifKamar(Number(response.data.tagihan.AKOMODASI) || 0);
            setNamaDokter(response.data.dokter.NAMA || '');
        } catch (error) {
            setDataKunjungan(null);
            console.error('Gagal mengambil data kunjungan:', error);
        } finally {
            setLoadingKunjungan(false);
        }
    };

    React.useEffect(() => {
        if (expanded) {
            fetchDataKunjungan();
        }
    }, [expanded, item.id]);

    React.useEffect(() => {
        setLamaKunjungan(hitungLamaKunjungan(tanggalMasuk, tanggalKeluar));
    }, [tanggalMasuk, tanggalKeluar]);

    React.useEffect(() => {
        // Hitung total tarif rumah sakit
        const total = [
            tarifProsedurNonBedah,
            tarifProsedurBedah,
            tarifKonsultasi,
            tarifTenagaAhli,
            tarifKeperawatan,
            tarifPenunjang,
            tarifRadiologi,
            tarifLaboratorium,
            tarifPelayananDarah,
            tarifRehabilitasi,
            tarifKamar,
            tarifRawatIntensif,
            tarifObat,
            tarifObatKronis,
            tarifObatKemoterapi,
            tarifAlkes,
            tarifBMHP,
            tarifSewaAlat,
        ].reduce((sum, val) => sum + (Number(val) || 0), 0);
        setTarifRs(total);
    }, [
        tarifProsedurNonBedah,
        tarifProsedurBedah,
        tarifKonsultasi,
        tarifTenagaAhli,
        tarifKeperawatan,
        tarifPenunjang,
        tarifRadiologi,
        tarifLaboratorium,
        tarifPelayananDarah,
        tarifRehabilitasi,
        tarifKamar,
        tarifRawatIntensif,
        tarifObat,
        tarifObatKronis,
        tarifObatKemoterapi,
        tarifAlkes,
        tarifBMHP,
        tarifSewaAlat,
    ]);

    // --- Handle Simpan ---
    const handleSimpan = async () => {
        try {
            const payload = {
                tanggal_masuk: tanggalMasuk,
                tanggal_pulang: tanggalKeluar,
                cara_masuk: caraMasuk,
                jenis_rawat: jenisPerawatan,
                kelas_rawat: '', // isi jika ada
                adl_sub_acute: adlSubAcute,
                adl_chronic: adlChronic,
                icu_indikator: icuIndicator,
                icu_los: icuLos,
                ventilator_hour: '', // isi jika ada
                ventilator: {
                    use_ind: ventilator ? 1 : 0,
                    start_dttm: pemasangan,
                    stop_dttm: pencabutan,
                },
                upgrade_class_ind: naikKelas ? 1 : 0,
                upgrade_class_class: upgradeKelasKe,
                upgrade_class_los: lamaUpgradeKelas,
                upgrade_class_payor: upgradeKelasPayor,
                add_payment_pct: paymentPct,
                birth_weight: '', // isi jika ada
                sistole: '', // isi jika ada
                diastole: '', // isi jika ada
                discharge_status: dataDischargeStatus,
                diagnosa: selectedDiagnosa.map((d) => d.id),
                procedure: selectedProcedure.map((p) => p.id),
                diagnosa_inagrouper: [],
                procedure_inagrouper: [],
                tarif_rs: {
                    prosedur_non_bedah: tarifProsedurNonBedah,
                    prosedur_bedah: tarifProsedurBedah,
                    tenaga_ahli: tarifTenagaAhli,
                    keperawatan: tarifKeperawatan,
                    penunjang: tarifPenunjang,
                    radiologi: tarifRadiologi,
                    laboratorium: tarifLaboratorium,
                    pelayanan_darah: tarifPelayananDarah,
                    rehabilitasi: tarifRehabilitasi,
                    kamar: tarifKamar,
                    rawat_intensif: tarifRawatIntensif,
                    obat: tarifObat,
                    obat_kronis: tarifObatKronis,
                    obat_kemoterapi: tarifObatKemoterapi,
                    alkes: tarifAlkes,
                    bmhp: tarifBMHP,
                    sewa_alat: tarifSewaAlat,
                },
                persalinan: {
                    usia_kehamilan: persalinan.usia_kehamilan,
                    gravida: persalinan.gravida,
                    partus: persalinan.partus,
                    abortus: persalinan.abortus,
                    onset_kontraksi: persalinan.onset_kontraksi,
                    delivery: persalinan.delivery,
                },
                tarif_poli_eks: tarifPoliEks,
                nama_dokter: namaDokter,
                kode_tarif: kodeTarifRumahSAkit,
                payor_id: dataPenjaminKlaim,
                payor_cd: payorCd,
                cob_cd: cobCd,
                // coder_nik: '3522133010010003', // diisi di backend
            };

            await axios.post(`/eklaim/klaim/update-klaim/${item.id}`, payload);

            toast.success('Data berhasil disimpan!');
        } catch (error: any) {
            toast.error('Gagal menyimpan data!');
            console.error(error);
        }
    };

    // --- Render ---
    return (
        <>
            {loadingKunjungan ? (
                <div className="flex items-center gap-2 px-4 py-2">
                    <Loader className="h-6 w-6 animate-spin text-gray-500" />
                    <span>Mengambil Data ...</span>
                </div>
            ) : (
                <>
                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                        <tbody>
                            <tr>
                                <td className="border px-4 py-2">Jenis Perawatan</td>
                                <td className="relative px-4 py-2">
                                    <SearchableDropdown
                                        data={jenisPerawatanOptions}
                                        value={jenisPerawatan}
                                        setValue={setJenisPerawatan}
                                        placeholder="Pilih Jenis Perawatan"
                                        getOptionLabel={(item) => item.DESKRIPSI}
                                        getOptionValue={(item) => item.ID}
                                    />
                                </td>
                                <td colSpan={2} className="relative px-4 py-2">
                                    <SearchableDropdown
                                        data={[
                                            { ID: 3, DESKRIPSI: 'JKN' },
                                            { ID: 71, DESKRIPSI: 'JAMINAN COVID-19' },
                                            { ID: 72, DESKRIPSI: 'JAMINAN KIPI' },
                                            { ID: 73, DESKRIPSI: 'JAMINAN BAYI BARU LAHIR' },
                                            { ID: 74, DESKRIPSI: 'JAMINAN PERPANJANG MASA RAWAT' },
                                            { ID: 75, DESKRIPSI: 'JAMINAN CO-INSIDENSE' },
                                            { ID: 76, DESKRIPSI: 'JAMPERSAL' },
                                            { ID: 77, DESKRIPSI: 'JAMINAN PEMULIHAN KESEHATAN PRIORITAS' },
                                            { ID: 5, DESKRIPSI: 'JAMKESDA' },
                                            { ID: 6, DESKRIPSI: 'JAMKESOS' },
                                            { ID: 1, DESKRIPSI: 'PASIEN BAYAR' },
                                        ]}
                                        value={dataPenjaminKlaim}
                                        setValue={setDataPenjaminKlaim}
                                        placeholder="Pilih Penjamin"
                                        getOptionLabel={(item) => item.DESKRIPSI}
                                        getOptionValue={(item) => item.ID}
                                    />
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="w-1/8 border px-4 py-4">Tanggal Rawat</td>
                                <td colSpan={3} className="px-4 py-2">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            className="w-1/2"
                                            id="tanggalMasuk"
                                            name="tanggalMasuk"
                                            type="datetime-local"
                                            value={tanggalMasuk}
                                            onChange={(e) => setTanggalMasuk(e.target.value)}
                                        />
                                        <Input
                                            className="w-1/2"
                                            id="tanggalKeluar"
                                            name="tanggalKeluar"
                                            type="datetime-local"
                                            value={tanggalKeluar}
                                            onChange={(e) => setTanggalKeluar(e.target.value)}
                                        />
                                    </div>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="w-1/8 border px-4 py-4">Kelas Pelayanan</td>
                                <td colSpan={3} className="px-4 py-2">
                                    <Checkbox id="naikKelas" checked={naikKelas} onCheckedChange={(checked) => setNaikKelas(checked === true)} />
                                    <label htmlFor="naikKelas" className="cursor-pointer px-2 text-black select-none">
                                        Naik Kelas
                                    </label>
                                    <Checkbox
                                        id="rawatIntensif"
                                        checked={rawatIntensif}
                                        onCheckedChange={(checked) => setRawatIntensif(checked === true)}
                                    />
                                    <label htmlFor="rawatIntensif" className="cursor-pointer px-2 text-black select-none">
                                        Rawat Intensif
                                    </label>
                                    {rawatIntensif && (
                                        <>
                                            <Checkbox
                                                id="ventilator"
                                                checked={ventilator}
                                                onCheckedChange={(checked) => setVentilator(checked === true)}
                                            />
                                            <label htmlFor="ventilator" className="cursor-pointer px-2 text-black select-none">
                                                Ventilator
                                            </label>
                                        </>
                                    )}
                                    <strong className="pl-10">Lama Kunjungan :</strong> {lamaKunjungan} hari
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="w-1/8 border px-4 py-2">Cara Masuk</td>
                                <td className="relative w-3/8 px-4 py-2">
                                    <SearchableDropdown
                                        data={caraMasukOptions}
                                        value={caraMasuk}
                                        setValue={setCaraMasuk}
                                        placeholder="Pilih Cara Masuk"
                                        getOptionLabel={(item) => item.DESKRIPSI}
                                        getOptionValue={(item) => item.ID}
                                    />
                                </td>
                                <td className="w-1/8 border px-4 py-2">Cara Pulang</td>
                                <td className="relative w-3/8 px-4 py-2">
                                    <SearchableDropdown
                                        data={listDischargeStatus}
                                        value={dataDischargeStatus}
                                        setValue={setDataDischargeStatus}
                                        placeholder="Pilih Cara Pulang"
                                        getOptionLabel={(item) => item.DESKRIPSI}
                                        getOptionValue={(item) => item.ID}
                                    />
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="w-1/8 border px-4 py-2">Dokter DPJP</td>
                                <td className="relative w-3/8 px-4 py-2">
                                    <Input
                                        id="namaDokter"
                                        name="namaDokter"
                                        type="text"
                                        placeholder="Masukkan Nama Dokter DPJP"
                                        value={namaDokter}
                                        onChange={(e) => setNamaDokter(e.target.value)}
                                    />
                                </td>
                                <td className="w-1/8 border px-4 py-2">Tarif Rumah Sakit</td>
                                <td className="relative w-3/8 px-4 py-2">
                                    <SearchableDropdown
                                        data={[
                                            { ID: 'AP', DESKRIPSI: 'RS KELAS A PEMERINTAH' },
                                            { ID: 'AS', DESKRIPSI: 'RS KELAS A SWASTA' },
                                            { ID: 'BP', DESKRIPSI: 'RS KELAS B PEMERINTAH' },
                                            { ID: 'BS', DESKRIPSI: 'RS KELAS B SWASTA' },
                                            { ID: 'CP', DESKRIPSI: 'RS KELAS C PEMERINTAH' },
                                            { ID: 'CS', DESKRIPSI: 'RS KELAS C SWASTA' },
                                            { ID: 'DP', DESKRIPSI: 'RS KELAS D PEMERINTAH' },
                                            { ID: 'DS', DESKRIPSI: 'RS KELAS D SWASTA' },
                                            { ID: 'RSCM', DESKRIPSI: 'RSUPN CIPTO MANGUNKUSUMO' },
                                            { ID: 'RSJP', DESKRIPSI: 'RSJPD HARAPAN KITA' },
                                            { ID: 'RSD', DESKRIPSI: 'KANKER DHARMAIS' },
                                            { ID: 'RSAB', DESKRIPSI: 'RSAB HARAPAN KITA' },
                                        ]}
                                        value={kodeTarifRumahSAkit}
                                        setValue={setKodeTarifRumahSAkit}
                                        placeholder="Pilih Tarif Rumah Sakit"
                                        getOptionLabel={(item) => item.DESKRIPSI}
                                        getOptionValue={(item) => item.ID}
                                    />
                                </td>
                            </tr>

                            {/* <tr className="hover:bg-gray-50">
                                <td className="px-4 py-2">
                                    <Input
                                        id="adl_sub_acute"
                                        name="adl_sub_acute"
                                        type="text"
                                        placeholder="Masukkan ADL Sub Acute"
                                        value={adlSubAcute}
                                        onChange={(e) => setAdlSubAcute(e.target.value)}
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <Input
                                        id="adl_chronic"
                                        name="adl_chronic"
                                        type="text"
                                        placeholder="Masukkan ADL Chronic"
                                        value={adlChronic}
                                        onChange={(e) => setAdlChronic(e.target.value)}
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <Input
                                        id="icu_indicator"
                                        name="icu_indicator"
                                        type="text"
                                        placeholder="Masukkan ICU Indicator"
                                        value={icuIndicator}
                                        onChange={(e) => setIcuIndicator(e.target.value)}
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <Input
                                        id="icu_los"
                                        name="icu_los"
                                        type="text"
                                        placeholder="Masukkan ICU LOS"
                                        value={icuLos}
                                        onChange={(e) => setIcuLos(e.target.value)}
                                    />
                                </td>
                            </tr> */}

                            {ventilator && rawatIntensif && (
                                <tr>
                                    <td className="border px-4 py-2">Ventilator</td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                className="w-1/2"
                                                id="pemasangan"
                                                name="pemasangan"
                                                type="datetime-local"
                                                value={pemasangan}
                                                onChange={(e) => setPemasangan(e.target.value)}
                                            />
                                            <Input
                                                className="w-1/2"
                                                id="pencabutan"
                                                name="pencabutan"
                                                type="datetime-local"
                                                value={pencabutan}
                                                onChange={(e) => setPencabutan(e.target.value)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {naikKelas && (
                                <tr>
                                    <td className="border px-4 py-2">Naik Kelas</td>
                                    <td colSpan={3} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                        <div className="flex items-center gap-2">
                                            <SearchableDropdown
                                                data={listUpgradeKelas}
                                                value={upgradeKelasKe}
                                                setValue={setUpgradeKelasKe}
                                                placeholder="Pilih Upgrade Kelas"
                                                getOptionLabel={(item) => item.DESKRIPSI}
                                                getOptionValue={(item) => item.ID}
                                            />
                                            <Input
                                                id="lama_upgrade"
                                                name="lama_upgrade"
                                                type="number"
                                                placeholder="Masukkan Lama Upgrade Kelas (dalam hari)"
                                                value={lamaUpgradeKelas}
                                                onChange={(e) => setLamaUpgradeKelas(e.target.value)}
                                            />
                                            <SearchableDropdown
                                                data={listPayorUpgradeKelas}
                                                value={upgradeKelasPayor}
                                                setValue={setUpgradeKelasPayor}
                                                placeholder="Pilih Penanggung Jawab"
                                                getOptionLabel={(item) => item.DESKRIPSI}
                                                getOptionValue={(item) => item.ID}
                                            />
                                            <Input
                                                id="payment_pct"
                                                name="payment_pct"
                                                type="number"
                                                placeholder="Koefisien tambahan biaya khusus"
                                                value={paymentPct}
                                                onChange={(e) => setPaymentPct(e.target.value)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            )}

                            <tr className="mt-2 hover:bg-gray-50">
                                <td colSpan={4} className="border px-4 py-2">
                                    <center>Tarif Rumah Sakit {formatRupiah(tarifRs)}</center>
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2">Prosedur Non Bedah</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        id="prosedur_non_bedah"
                                        name="prosedur_non_bedah"
                                        type="text"
                                        placeholder="Masukkan Prosedur Non Bedah"
                                        value={formatRupiah(tarifProsedurNonBedah)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, '');
                                            if (rawValue.startsWith('0')) {
                                                rawValue = rawValue.replace(/^0+/, '');
                                            }
                                            setTarifProsedurNonBedah(Number(rawValue) || 0);
                                        }}
                                    />
                                </td>
                                <td className="border px-4 py-2">Tarif Prosedur Bedah</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        id="prosedur_bedah"
                                        name="prosedur_bedah"
                                        type="text"
                                        placeholder="Masukkan Tarif Prosedur Bedah"
                                        value={formatRupiah(tarifProsedurBedah)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, '');
                                            if (rawValue.startsWith('0')) {
                                                rawValue = rawValue.replace(/^0+/, '');
                                            }
                                            setTarifProsedurBedah(Number(rawValue) || 0);
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2">Tarif Konsultasi</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        id="tarif_konsultasi"
                                        name="tarif_konsultasi"
                                        type="text"
                                        placeholder="Masukkan Tarif Konsultasi"
                                        value={formatRupiah(tarifKonsultasi)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, '');
                                            if (rawValue.startsWith('0')) {
                                                rawValue = rawValue.replace(/^0+/, '');
                                            }
                                            setTarifKonsultasi(Number(rawValue) || 0);
                                        }}
                                    />
                                </td>
                                <td className="border px-4 py-2">Tarif Tenaga Ahli</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        id="tarif_tenaga_ahli"
                                        name="tarif_tenaga_ahli"
                                        type="text"
                                        placeholder="Masukkan Tarif Tenaga Ahli"
                                        value={formatRupiah(tarifTenagaAhli)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, '');
                                            if (rawValue.startsWith('0')) {
                                                rawValue = rawValue.replace(/^0+/, '');
                                            }
                                            setTarifTenagaAhli(Number(rawValue) || 0);
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2">Tarif Keperawatan</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        id="tarif_keperawatan"
                                        name="tarif_keperawatan"
                                        type="text"
                                        placeholder="Masukkan Tarif Keperawatan"
                                        value={formatRupiah(tarifKeperawatan)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, '');
                                            if (rawValue.startsWith('0')) {
                                                rawValue = rawValue.replace(/^0+/, '');
                                            }
                                            setTarifKeperawatan(Number(rawValue) || 0);
                                        }}
                                    />
                                </td>
                                <td className="border px-4 py-2">Tarif Penunjang</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        id="tarif_penunjang"
                                        name="tarif_penunjang"
                                        type="text"
                                        placeholder="Masukkan Tarif Penunjang"
                                        value={formatRupiah(tarifPenunjang)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, '');
                                            if (rawValue.startsWith('0')) {
                                                rawValue = rawValue.replace(/^0+/, '');
                                            }
                                            setTarifPenunjang(Number(rawValue) || 0);
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2">Tarif Radiologi</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        id="tarif_radiologi"
                                        name="tarif_radiologi"
                                        type="text"
                                        placeholder="Masukkan Tarif Radiologi"
                                        value={formatRupiah(tarifRadiologi)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, '');
                                            if (rawValue.startsWith('0')) {
                                                rawValue = rawValue.replace(/^0+/, '');
                                            }
                                            setTarifRadiologi(Number(rawValue) || 0);
                                        }}
                                    />
                                </td>
                                <td className="border px-4 py-2">Tarif Laboratorium</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        id="tarif_laboratorium"
                                        name="tarif_laboratorium"
                                        type="text"
                                        placeholder="Masukkan Tarif Laboratorium"
                                        value={formatRupiah(tarifLaboratorium)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, '');
                                            if (rawValue.startsWith('0')) {
                                                rawValue = rawValue.replace(/^0+/, '');
                                            }
                                            setTarifLaboratorium(Number(rawValue) || 0);
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2">Tarif Rehab</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        id="tarif_rehabilitasi"
                                        name="tarif_rehabilitasi"
                                        type="text"
                                        placeholder="Masukkan Tarif Rehabilitasi"
                                        value={formatRupiah(tarifRehabilitasi)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, '');
                                            if (rawValue.startsWith('0')) {
                                                rawValue = rawValue.replace(/^0+/, '');
                                            }
                                            setTarifRehabilitasi(Number(rawValue) || 0);
                                        }}
                                    />
                                </td>
                                <td className="border px-4 py-2">Tarif Pelayanan Darah</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        id="tarif_pelayanan_darah"
                                        name="tarif_pelayanan_darah"
                                        type="text"
                                        placeholder="Masukkan Tarif Pelayanan Darah"
                                        value={formatRupiah(tarifPelayananDarah)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, '');
                                            if (rawValue.startsWith('0')) {
                                                rawValue = rawValue.replace(/^0+/, '');
                                            }
                                            setTarifPelayananDarah(Number(rawValue) || 0);
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2">Tarif Kamar</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        id="tarif_kamar"
                                        name="tarif_kamar"
                                        type="text"
                                        placeholder="Masukkan Tarif Kamar"
                                        value={formatRupiah(tarifKamar)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, '');
                                            if (rawValue.startsWith('0')) {
                                                rawValue = rawValue.replace(/^0+/, '');
                                            }
                                            setTarifKamar(Number(rawValue) || 0);
                                        }}
                                    />
                                </td>
                                <td className="border px-4 py-2">Tarif Rawat Intensif</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        id="tarif_rawat_intensif"
                                        name="tarif_rawat_intensif"
                                        type="text"
                                        placeholder="Masukkan Tarif Rawat Intensif"
                                        value={formatRupiah(tarifRawatIntensif)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, '');
                                            if (rawValue.startsWith('0')) {
                                                rawValue = rawValue.replace(/^0+/, '');
                                            }
                                            setTarifRawatIntensif(Number(rawValue) || 0);
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2">Tarif Obat</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        id="tarif_obat"
                                        name="tarif_obat"
                                        type="text"
                                        placeholder="Masukkan Tarif Obat"
                                        value={formatRupiah(tarifObat)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, '');
                                            if (rawValue.startsWith('0')) {
                                                rawValue = rawValue.replace(/^0+/, '');
                                            }
                                            setTarifObat(Number(rawValue) || 0);
                                        }}
                                    />
                                </td>
                                <td className="border px-4 py-2">Tarif Obat Kronis</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        id="tarif_obat_kronis"
                                        name="tarif_obat_kronis"
                                        type="text"
                                        placeholder="Masukkan Tarif Obat Kronis"
                                        value={formatRupiah(tarifObatKronis)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, '');
                                            if (rawValue.startsWith('0')) {
                                                rawValue = rawValue.replace(/^0+/, '');
                                            }
                                            setTarifObatKronis(Number(rawValue) || 0);
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2">Tarif Obat Kemoterapi</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        id="tarif_obat_kemoterapi"
                                        name="tarif_obat_kemoterapi"
                                        type="text"
                                        placeholder="Masukkan Tarif Obat Kemoterapi"
                                        value={formatRupiah(tarifObatKemoterapi)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, '');
                                            if (rawValue.startsWith('0')) {
                                                rawValue = rawValue.replace(/^0+/, '');
                                            }
                                            setTarifObatKemoterapi(Number(rawValue) || 0);
                                        }}
                                    />
                                </td>
                                <td className="border px-4 py-2">Tarif Alkes</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        id="tarif_alkes"
                                        name="tarif_alkes"
                                        type="text"
                                        placeholder="Masukkan Tarif Alkes"
                                        value={formatRupiah(tarifAlkes)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, '');
                                            if (rawValue.startsWith('0')) {
                                                rawValue = rawValue.replace(/^0+/, '');
                                            }
                                            setTarifAlkes(Number(rawValue) || 0);
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2">Tarif BMHP</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        id="tarif_bmhp"
                                        name="tarif_bmhp"
                                        type="text"
                                        placeholder="Masukkan Tarif BMHP"
                                        value={formatRupiah(tarifBMHP)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, '');
                                            if (rawValue.startsWith('0')) {
                                                rawValue = rawValue.replace(/^0+/, '');
                                            }
                                            setTarifBMHP(Number(rawValue) || 0);
                                        }}
                                    />
                                </td>
                                <td className="border px-4 py-2">Tarif Sewa Alat</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        id="tarif_sewa_alat"
                                        name="tarif_sewa_alat"
                                        type="text"
                                        placeholder="Masukkan Tarif Sewa Alat"
                                        value={formatRupiah(tarifSewaAlat)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, '');
                                            if (rawValue.startsWith('0')) {
                                                rawValue = rawValue.replace(/^0+/, '');
                                            }
                                            setTarifSewaAlat(Number(rawValue) || 0);
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2 font-semibold" colSpan={4}>
                                    Data Tambahan
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2">Tarif Poli Eks</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        placeholder="Tarif Poli Eks"
                                        value={formatRupiah(tarifPoliEks)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/[^0-9]/g, '');
                                            if (rawValue.startsWith('0')) {
                                                rawValue = rawValue.replace(/^0+/, '');
                                            }
                                            setTarifPoliEks(Number(rawValue) || 0);
                                        }}
                                    />
                                </td>
                                <td className="border px-4 py-2">Nama Dokter Poli Eksekutif</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        placeholder="Nama Dokter"
                                        value={dokterPoliEksekutif}
                                        onChange={(e) => setDokterPoliEksekutif(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2">Kode Tarif</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        placeholder="Kode Tarif"
                                        value={kodeTarifRsPoliEksekutif}
                                        onChange={(e) => setKodeTarifRsPoliEksekutif(e.target.value)}
                                    />
                                </td>
                                <td className="border px-4 py-2">Payor ID</td>
                                <td className="border px-4 py-2">
                                    <Input placeholder="Payor ID" value={dataPenjaminKlaim} onChange={(e) => setDataPenjaminKlaim(e.target.value)} />
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2">Payor CD</td>
                                <td className="border px-4 py-2">
                                    <Input placeholder="Payor CD" value={payorCd} onChange={(e) => setPayorCd(e.target.value)} />
                                </td>
                                <td className="border px-4 py-2">COB CD</td>
                                <td className="border px-4 py-2">
                                    <Input placeholder="COB CD" value={cobCd} onChange={(e) => setCobCd(e.target.value)} />
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2">Diagnosa</td>
                                <td className="border px-4 py-2" colSpan={3}>
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
                                                <span>{`${item.id} - ${item.description}`}</span> {/* Gabungkan ID dan DESKRIPSI */}
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
                                <td className="border px-4 py-2">Procedure</td>
                                <td className="border px-4 py-2" colSpan={3}>
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
                                                <span>{`${item.id} - ${item.description}`}</span> {/* Gabungkan ID dan DESKRIPSI */}
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

                            {/* Data Persalinan */}
                            <tr>
                                <td className="border px-4 py-2 font-semibold" colSpan={4}>
                                    Data Persalinan
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2">Usia Kehamilan</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        placeholder="Dalam Minggu"
                                        type='number'
                                        value={persalinan.usia_kehamilan}
                                        onChange={(e) => setPersalinan((prev) => ({ ...prev, usia_kehamilan: e.target.value }))}
                                    />
                                </td>
                                <td className="border px-4 py-2">Gravida</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        placeholder="Gravida"
                                        type='number'
                                        value={persalinan.gravida}
                                        onChange={(e) => setPersalinan((prev) => ({ ...prev, gravida: e.target.value }))}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2">Partus</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        placeholder="Partus"
                                        type='number'
                                        value={persalinan.partus}
                                        onChange={(e) => setPersalinan((prev) => ({ ...prev, partus: e.target.value }))}
                                    />
                                </td>
                                <td className="border px-4 py-2">Abortus</td>
                                <td className="border px-4 py-2">
                                    <Input
                                        placeholder="Abortus"
                                        type='number'
                                        value={persalinan.abortus}
                                        onChange={(e) => setPersalinan((prev) => ({ ...prev, abortus: e.target.value }))}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2">Onset Kontraksi</td>
                                <td className="border px-4 py-2" colSpan={3}>
                                    <SearchableDropdown
                                        data={[
                                            { ID: 'spontan', DESKRIPSI: 'Spontan' },
                                            { ID: 'induksi', DESKRIPSI: 'Induksi' },
                                            { ID: 'non_spontan_non_induksi', DESKRIPSI: 'Non Spontan Non Induksi' },
                                        ]}
                                        value={persalinan.onset_kontraksi}
                                        setValue={(value) => setPersalinan((prev) => ({ ...prev, onset_kontraksi: value }))}
                                        placeholder="Pilih Onset Kontraksi"
                                        getOptionLabel={(item) => item.DESKRIPSI}
                                        getOptionValue={(item) => item.ID}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2 font-semibold" colSpan={4}>
                                    Delivery
                                </td>
                            </tr>
                            {persalinan.delivery.map((item, idx) => (
                                <React.Fragment key={idx}>
                                    <tr>
                                        <td className="border px-4 py-2">Sequence</td>
                                        <td className="border px-4 py-2">
                                            <Input
                                                placeholder="Sequence"
                                                type='number'
                                                value={item.delivery_sequence}
                                                onChange={(e) => updateDelivery(idx, 'delivery_sequence', e.target.value)}
                                            />
                                        </td>
                                        <td className="border px-4 py-2">Method</td>
                                        <td className="border px-4 py-2">
                                            <SearchableDropdown
                                                data={[
                                                    { ID: 'vaginal', DESKRIPSI: 'Vaginal' },
                                                    { ID: 'sc', DESKRIPSI: 'Caesar' },
                                                ]}
                                                value={item.delivery_method}
                                                setValue={(value) => updateDelivery(idx, 'delivery_method', value)}
                                                placeholder="Pilih Method"
                                                getOptionLabel={(item) => item.DESKRIPSI}
                                                getOptionValue={(item) => item.ID}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border px-4 py-2">Tanggal & Jam</td>
                                        <td className="border px-4 py-2">
                                            <Input
                                                placeholder="Tanggal & Jam"
                                                type="datetime-local"
                                                value={item.delivery_dttm}
                                                onChange={(e) => updateDelivery(idx, 'delivery_dttm', e.target.value)}
                                            />
                                        </td>
                                        <td className="border px-4 py-2">Letak Janin</td>
                                        <td className="border px-4 py-2">
                                            <SearchableDropdown
                                                data={[
                                                    { ID: 'kepala', DESKRIPSI: 'Kepala' },
                                                    { ID: 'sungsang', DESKRIPSI: 'Sungsang' },
                                                    { ID: 'lintang', DESKRIPSI: 'Lintang' },
                                                ]}
                                                value={item.letak_janin}
                                                setValue={(value) => updateDelivery(idx, 'letak_janin', value)}
                                                placeholder="Pilih Letak Janin"
                                                getOptionLabel={(item) => item.DESKRIPSI}
                                                getOptionValue={(item) => item.ID}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border px-4 py-2">Kondisi</td>
                                        <td className="border px-4 py-2">
                                            <SearchableDropdown
                                                data={[
                                                    { ID: 'livebirth', DESKRIPSI: 'Live Birth' },
                                                    { ID: 'stillbirth', DESKRIPSI: 'Still Birth' },
                                                ]}
                                                value={item.kondisi}
                                                setValue={(value) => updateDelivery(idx, 'kondisi', value)}
                                                placeholder="Pilih Kondisi"
                                                getOptionLabel={(item) => item.DESKRIPSI}
                                                getOptionValue={(item) => item.ID}
                                            />
                                        </td>
                                        <td className="border px-4 py-2">Manual</td>
                                        <td className="border px-4 py-2">
                                            <SearchableDropdown
                                                data={[
                                                    { ID: '1', DESKRIPSI: 'Iya' },
                                                    { ID: '0', DESKRIPSI: 'Tidak' },
                                                ]}
                                                value={item.manual}
                                                setValue={(value) => updateDelivery(idx, 'manual', value)}
                                                placeholder="Pilih Manual"
                                                getOptionLabel={(item) => item.DESKRIPSI}
                                                getOptionValue={(item) => item.ID}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border px-4 py-2">Forcep</td>
                                        <td className="border px-4 py-2">
                                            <SearchableDropdown
                                                data={[
                                                    { ID: '1', DESKRIPSI: 'Iya' },
                                                    { ID: '0', DESKRIPSI: 'Tidak' },
                                                ]}
                                                value={item.use_forcep}
                                                setValue={(value) => updateDelivery(idx, 'use_forcep', value)}
                                                placeholder="Pilih Forsep"
                                                getOptionLabel={(item) => item.DESKRIPSI}
                                                getOptionValue={(item) => item.ID}
                                            />
                                        </td>
                                        <td className="border px-4 py-2">Vacuum</td>
                                        <td className="border px-4 py-2">
                                            <SearchableDropdown
                                                data={[
                                                    { ID: '1', DESKRIPSI: 'Iya' },
                                                    { ID: '0', DESKRIPSI: 'Tidak' },
                                                ]}
                                                value={item.use_vacuum}
                                                setValue={(value) => updateDelivery(idx, 'use_vacuum', value)}
                                                placeholder="Pilih Vacuum"
                                                getOptionLabel={(item) => item.DESKRIPSI}
                                                getOptionValue={(item) => item.ID}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border px-4 py-2">SHK Spesimen Ambil</td>
                                        <td className="border px-4 py-2">
                                            <SearchableDropdown
                                                data={[
                                                    { ID: 'ya', DESKRIPSI: 'Iya' },
                                                    { ID: 'tidak', DESKRIPSI: 'Tidak' },
                                                ]}
                                                value={item.shk_spesimen_ambil}
                                                setValue={(value) => updateDelivery(idx, 'shk_spesimen_ambil', value)}
                                                placeholder="Pilih SHK Spesimen Ambil"
                                                getOptionLabel={(item) => item.DESKRIPSI}
                                                getOptionValue={(item) => item.ID}
                                            />
                                        </td>
                                        <td className="border px-4 py-2">SHK Lokasi</td>
                                        <td className="border px-4 py-2">
                                            <SearchableDropdown
                                                data={[
                                                    { ID: 'tumit', DESKRIPSI: 'Tumit' },
                                                    { ID: 'vena', DESKRIPSI: 'Vena' },
                                                ]}
                                                value={item.shk_lokasi}
                                                setValue={(value) => updateDelivery(idx, 'shk_lokasi', value)}
                                                placeholder="Pilih SHK Lokasi"
                                                getOptionLabel={(item) => item.DESKRIPSI}
                                                getOptionValue={(item) => item.ID}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border px-4 py-2">Waktu Pengambilan SHK</td>
                                        <td className="border px-4 py-2">
                                            <Input
                                                placeholder="Waktu Pengambilan SHK"
                                                type="datetime-local"
                                                value={item.shk_spesimen_dttm}
                                                onChange={(e) => updateDelivery(idx, 'shk_spesimen_dttm', e.target.value)}
                                            />
                                        </td>
                                        <td className="border px-4 py-2">SHK Alasan</td>
                                        <td className="border px-4 py-2">
                                            <SearchableDropdown
                                                data={[
                                                    { ID: "tidak-dapat", DESKRIPSI: 'Tidak Dapat' },
                                                    { ID:  "akses-sulit", DESKRIPSI: 'Akses Sulit' },
                                                ]}
                                                value={item.shk_alasan}
                                                setValue={(value) => updateDelivery(idx, 'shk_alasan', value)}
                                                placeholder="Pilih SHK Alasan"
                                                getOptionLabel={(item) => item.DESKRIPSI}
                                                getOptionValue={(item) => item.ID}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border px-4 py-2" colSpan={4}>
                                            <button
                                                type="button"
                                                className="mt-2 text-red-500"
                                                onClick={() => removeDelivery(idx)}
                                                disabled={persalinan.delivery.length === 1}
                                            >
                                                Hapus Delivery
                                            </button>
                                        </td>
                                    </tr>
                                </React.Fragment>
                            ))}
                            <tr>
                                <td className="border px-4 py-2" colSpan={4}>
                                    <button type="button" className="rounded bg-blue-500 px-2 py-1 text-white" onClick={addDelivery}>
                                        Tambah Delivery
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div>
                        <Button variant="outline" className="mt-4 bg-blue-500 text-white hover:bg-blue-600" onClick={handleSimpan}>
                            Simpan
                        </Button>
                    </div>
                    {/* Diagnosa & Procedure Modal */}
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
                </>
            )}
        </>
    );
}
