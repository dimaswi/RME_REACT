import SearchableDropdown from '@/components/SearchableDropdown';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import DiagnosaModal from './DiagnosaModal';
import ProcedureModal from './ProcedureModal';
import axios, { Axios } from 'axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner'; // Jika Anda pakai react-toastify untuk notifikasi
import { Loader } from 'lucide-react';

type Props = {
    item: any;
    formatTanggal: (tanggal: string | null) => string;
    getStatusBadge: (status: number, id: string) => React.ReactNode;
    expanded: boolean; // Tambahkan prop ini
};

export default function PengajuanKlaimCollapse({ item, formatTanggal, getStatusBadge, expanded }: Props) {
    const [caraMasuk, setCaraMasuk] = useState('');
    const [dataDischargeStatus, setDataDischargeStatus] = useState('');
    const [dataPenjaminKlaim, setDataPenjaminKlaim] = useState('');
    const [jenisPerawatan, setJenisPerawatan] = useState('');
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

    React.useEffect(() => {
        const nonBedah = Number(tarifProsedurNonBedah) || 0;
        const bedah = Number(tarifProsedurBedah) || 0;
        const tarifKonsultasiValue = Number(tarifKonsultasi) || 0;
        const tarifTenagaAhliValue = Number(tarifTenagaAhli) || 0;
        const tarifKeperawatanValue = Number(tarifKeperawatan) || 0;
        const tarifPenunjangValue = Number(tarifPenunjang) || 0;
        const tarifRadiologiValue = Number(tarifRadiologi) || 0;
        const tarifLaboratoriumValue = Number(tarifLaboratorium) || 0;
        const tarifPelayananDarahValue = Number(tarifPelayananDarah) || 0;
        const tarifRehabilitasiValue = Number(tarifRehabilitasi) || 0;
        const tarifKamarValue = Number(tarifKamar) || 0;
        const tarifRawatIntensifValue = Number(tarifRawatIntensif) || 0;
        const tarifObatValue = Number(tarifObat) || 0;
        const tarifObatKronisValue = Number(tarifObatKronis) || 0;
        const tarifObatKemoterapiValue = Number(tarifObatKemoterapi) || 0;
        const tarifAlkesValue = Number(tarifAlkes) || 0;
        const tarifBMHPValue = Number(tarifBMHP) || 0;
        const tarifSewaAlatValue = Number(tarifSewaAlat) || 0;

        setTarifRs(
            nonBedah +
            bedah +
            tarifKonsultasiValue +
            tarifTenagaAhliValue +
            tarifKeperawatanValue +
            tarifPenunjangValue +
            tarifRadiologiValue +
            tarifLaboratoriumValue +
            tarifPelayananDarahValue +
            tarifRehabilitasiValue +
            tarifKamarValue +
            tarifRawatIntensifValue +
            tarifObatValue +
            tarifObatKronisValue +
            tarifObatKemoterapiValue +
            tarifAlkesValue +
            tarifBMHPValue +
            tarifSewaAlatValue
        );
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

    const [showDiagnosaModal, setShowDiagnosaModal] = useState(false);
    const [showProcedureModal, setShowProcedureModal] = useState(false);

    // Contoh state dan handler untuk diagnosa/procedure (silakan sesuaikan dengan kebutuhan Anda)
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

    function hitungLamaKunjungan(masuk: string, keluar: string): number {
        if (!masuk || !keluar) return 0;
        const tglMasuk = new Date(masuk);
        const tglKeluar = new Date(keluar);
        const diffMs = tglKeluar.getTime() - tglMasuk.getTime();
        const diffJam = diffMs / (1000 * 60 * 60);
        if (diffJam <= 1) return 1;
        return Math.ceil(diffJam / 24);
    }

    // Fungsi untuk simpan data
    const handleSimpan = async () => {
        try {
            const payload = {
                id: item.id,
                jenisPerawatan,
                dataPenjaminKlaim,
                tanggalMasuk,
                tanggalKeluar,
                naikKelas,
                rawatIntensif,
                ventilator,
                pemasangan,
                pencabutan,
                upgradeKelasKe,
                lamaUpgradeKelas,
                upgradeKelasPayor,
                paymentPct,
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
                caraMasuk,
                dataDischargeStatus,
                selectedDiagnosa,
                selectedProcedure,
            };

            const response = await axios.post('/eklaim/klaim/update-pengajuan', payload);

            toast.success('Data berhasil disimpan!');
            // Jika perlu refresh data atau tutup collapse/modal, lakukan di sini
        } catch (error: any) {
            toast.error('Gagal menyimpan data!');
            console.error(error);
        }
    };

    const [loadingKunjungan, setLoadingKunjungan] = useState(false);
    const [dataKunjungan, setDataKunjungan] = useState<any>(null);

    const fetchDataKunjungan = async () => {
        setLoadingKunjungan(true);
        try {
            const response = await axios.get(`/eklaim/get/pengajuan-klaim/${item.id}`);
            setDataKunjungan(response.data);
            setJenisPerawatan(
                response.data.jenis_perawatan === 'Rawat Jalan'
                    ? '2'
                    : response.data.jenis_perawatan === 'IGD'
                        ? '3'
                        : '1'
            );
            setDataPenjaminKlaim('3');
            const masuk = response.data.pendaftaran_poli.kunjungan_pasien[0].MASUK;
            const keluar = response.data.pendaftaran_poli.kunjungan_pasien[0].KELUAR;
            setTanggalMasuk(masuk);
            setTanggalKeluar(keluar);
            setDataDischargeStatus('1');
            setLamaKunjungan(hitungLamaKunjungan(masuk, keluar));
            setDataDokter(response.data.dokter)
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

    return (
        <>
            {loadingKunjungan ? (
                <div className="px-4 py-2 flex items-center gap-2">
                    <Loader className="animate-spin h-6 w-6 text-gray-500" />
                    <span>
                        Mengambil Data ...
                    </span>
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
                                    <Checkbox id="rawatIntensif" checked={rawatIntensif} onCheckedChange={(checked) => setRawatIntensif(checked === true)} />
                                    <label htmlFor="rawatIntensif" className="cursor-pointer px-2 text-black select-none">
                                        Rawat Intensif
                                    </label>
                                    {rawatIntensif && (
                                        <>
                                            <Checkbox id="ventilator" checked={ventilator} onCheckedChange={(checked) => setVentilator(checked === true)} />
                                            <label htmlFor="ventilator" className="cursor-pointer px-2 text-black select-none">
                                                Ventilator
                                            </label>
                                        </>
                                    )}
                                    <strong className='pl-10' >Lama Kunjungan :</strong> {lamaKunjungan} hari
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
                                    <SearchableDropdown
                                        data={dataDokter}
                                        value={namaDokter}
                                        setValue={setNamaDokter}
                                        placeholder="Pilih Dokter DPJP"
                                        getOptionLabel={(item) => item.NAMA}
                                        getOptionValue={(item) => item.NIP}
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
                                <td colSpan={2} className="border px-4 py-2">
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
                                <td colSpan={2} className="border px-4 py-2">
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
                        </tbody>
                    </table>
                    <div>
                        <Button
                            variant="outline"
                            className="mt-4 bg-blue-500 text-white hover:bg-blue-600"
                            onClick={handleSimpan}
                        >
                            Simpan
                        </Button>
                    </div>

                    {/* Tambahkan DiagnosaModal dan ProcedureModal di bawah */}
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
