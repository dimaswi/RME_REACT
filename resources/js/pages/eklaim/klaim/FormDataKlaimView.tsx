import SearchableDropdown from '@/components/SearchableDropdown';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { Plus, PlusCircle, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import DiagnosaModal from './DiagnosaModal';
import ProcedureModal from './ProcedureModal';

export default function FormDataKlaimView({ pengajuanKlaimId }: { pengajuanKlaimId: string }) {
    // Semua state yang dibutuhkan untuk FORM DATA
    const [caraMasuk, setCaraMasuk] = useState('');
    const [jenisPerawatan, setJenisPerawatan] = useState('');
    const [dataDischargeStatus, setDataDischargeStatus] = useState('');
    const [dataPenjaminKlaim, setDataPenjaminKlaim] = useState('');
    const [adlSubAcute, setAdlSubAcute] = useState('');
    const [adlChronic, setAdlChronic] = useState('');
    const [icuIndicator, setIcuIndicator] = useState('');
    const [icuLos, setIcuLos] = useState('');
    const [adaVentilator, setAdaVentilator] = useState(false);
    const [pemasangan, setPemasangan] = useState('');
    const [pencabutan, setPencabutan] = useState('');
    const [upgradeKelas, setUpgradeKelas] = useState(false);
    const [upgradeKelasKe, setUpgradeKelasKe] = useState('');
    const [lamaUpgradeKelas, setLamaUpgradeKelas] = useState('');
    const [upgradeKelasPayor, setUpgradeKelasPayor] = useState('');
    const [paymentPct, setPaymentPct] = useState('');
    const [penggunaanDarah, setPenggunaanDarah] = useState(false);
    const [kantongDarahPenggunaan, setKantongDarahPenggunaan] = useState('');
    const [dataSistole, setDataSistole] = useState('');
    const [dataDiastole, setDataDiastole] = useState('');
    const [selectedDiagnosa, setSelectedDiagnosa] = useState<any[]>([]);
    const [selectedProcedure, setSelectedProcedure] = useState<any[]>([]);
    const [showDiagnosaModal, setShowDiagnosaModal] = useState(false);
    const [showProcedureModal, setShowProcedureModal] = useState(false);
    const [diagnosaSearch, setDiagnosaSearch] = useState('');
    const [procedureSearch, setProcedureSearch] = useState('');
    const [tarifProsedurNonBedah, setTarifProsedurNonBedah] = useState('');
    const [tarifProsedurBedah, setTarifProsedurBedah] = useState('');
    const [tarifKonsultasi, setTarifKonsultasi] = useState('');
    const [tarifTenagaAhli, setTarifTenagaAhli] = useState('');
    const [tarifKeperawatan, setTarifKeperawatan] = useState('');
    const [tarifPenunjang, setTarifPenunjang] = useState('');
    const [tarifRadiologi, setTarifRadiologi] = useState('');
    const [tarifLaboratorium, setTarifLaboratorium] = useState('');
    const [tarifPelayananDarah, setTarifPelayananDarah] = useState('');
    const [tarifRehabilitasi, setTarifRehabilitasi] = useState('');
    const [tarifKamar, setTarifKamar] = useState('');
    const [tarifRawatIntensif, setTarifRawatIntensif] = useState('');
    const [tarifObat, setTarifObat] = useState('');
    const [tarifObatKronis, setTarifObatKronis] = useState('');
    const [tarifObatKemoterapi, setTarifObatKemoterapi] = useState('');
    const [tarifAlkes, setTarifAlkes] = useState('');
    const [tarifBMHP, setTarifBMHP] = useState('');
    const [tarifSewaAlat, setTarifSewaAlat] = useState('');
    const [usiaPersalinan, setUsiaPersalinan] = useState('');
    const [gravida, setGravida] = useState('');
    const [partus, setPartus] = useState('');
    const [abortus, setAbortus] = useState('');
    const [onsetKontraksi, setOnsetKontraksi] = useState('');
    const [deliveryForms, setDeliveryForms] = useState<any>({});
    const [poliEksekutif, setPoliEksekutif] = useState(false);
    const [namaDokterPoliEksekutif, setNamaDokterPoliEksekutif] = useState('');
    const [tarifPoliEksekutif, setTarifPoliEksekutif] = useState('');
    const [apgarApparance1, setApgarApparance1] = useState('');
    const [apgarPulse1, setApgarPulse1] = useState('');
    const [apgarGrimace1, setApgarGrimace1] = useState('');
    const [apgarActivity1, setApgarActivity1] = useState('');
    const [apgarRespiration1, setApgarRespiration1] = useState('');
    const [apgarApparance5, setApgarApparance5] = useState('');
    const [apgarPulse5, setApgarPulse5] = useState('');
    const [apgarGrimace5, setApgarGrimace5] = useState('');
    const [apgarActivity5, setApgarActivity5] = useState('');
    const [apgarRespiration5, setApgarRespiration5] = useState('');
    const [hemodialisa, setHemodialisa] = useState('');
    const [covid19StatusCD, setCovid19StatusCD] = useState(false);
    const [covidKartuPenjamin, setCovidKartuPenjamin] = useState('');
    const [nomorKartuPenjamin, setNomorKartuPenjamin] = useState('');
    const [covidEpisodesList, setCovidEpisodesList] = useState([{ episode: '', hari: '' }]);
    const [covid19CCIndonesia, setCovid19CCIndonesia] = useState(false);
    const [covid19RsDaruratIndonesia, setCovid19RsDaruratIndonesia] = useState(false);
    const [covidIsoman, setCovidIsoman] = useState(false);
    const [covid19COInsidenseIndonesia, setCovid19InsidenseIndonesia] = useState(false);
    const [covid19COinsidenseSEP, setCovid19COinsidenseSEP] = useState('');
    const [covidTerapiKovalen, setCovidTerapiKovalen] = useState('');
    const [covidBayiLahirStatus, setCovidBayiLahirStatus] = useState('');
    const [covidLabAsamLaktat, setCovidLabAsamLaktat] = useState(false);
    const [covidLabProcalcitonin, setCovidLabProcalcitonin] = useState(false);
    const [covidLabCRP, setCovidLabCRP] = useState(false);
    const [covidLabKultur, setCovidLabKultur] = useState(false);
    const [covidLabDDimer, setCovidLabDDimer] = useState(false);
    const [covidLabPT, setCovidLabPT] = useState(false);
    const [covidLabAPTT, setCovidLabAPTT] = useState(false);
    const [covidLabWaktuPendarahan, setCovidLabWaktuPendarahan] = useState(false);
    const [covidLabAntiHIV, setCovidLabAntiHIV] = useState(false);
    const [covidLabAnalisaGas, setCovidLabAnalisaGas] = useState(false);
    const [covidLabAlbumin, setCovidLabAlbumin] = useState(false);
    const [covidRadThoraxApPA, setCovidRadThoraxApPA] = useState(false);
    const [pasienMeninggal, setPasienMeninggal] = useState(false);
    const [pemulasaranJenazah, setPemulasaranJenazah] = useState(false);
    const [kantongJenazah, setKantongJenazah] = useState(false);
    const [petiJenazah, setPetiJenazah] = useState(false);
    const [plastikErat, setPlastikErat] = useState(false);
    const [disinfektanJenazah, setDisinfektanJenazah] = useState(false);
    const [mobilJenazah, setMobilJenazah] = useState(false);
    const [disinfektanMobilJenazah, setDisinfektanMobilJenazah] = useState(false);

    // Tambahkan semua dropdown options dan function yang dibutuhkan sesuai kebutuhan Anda
    // Misal: caraMasukOptions, jenisPerawatanOptions, listDischargeStatus, dst

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

    const listOnsetKontraksi = [
        { ID: 'spontan', DESKRIPSI: 'Spontan' },
        { ID: 'induksi', DESKRIPSI: 'Induksi' },
        { ID: 'non_spontan_non_induksi', DESKRIPSI: 'Tidak Spontan dan Tidak Induksi' },
    ];

    const listPenggunaanHemodialisa = [
        { ID: '1', DESKRIPSI: 'Single Use' },
        { ID: '2', DESKRIPSI: 'Multiple Use' },
    ];

    const listCovidKartuPenjamin = [
        { ID: 'nik', DESKRIPSI: 'NIK' },
        { ID: 'kitas', DESKRIPSI: 'KITAS (Kartu Izin Tinggal Terbatas) / KITAP (Kartu Izin Tinggal Tetap)' },
        { ID: 'paspor', DESKRIPSI: 'Paspor' },
        { ID: 'kartu_jkn', DESKRIPSI: 'Kartu Peserta JKN' },
        { ID: 'kk', DESKRIPSI: 'Kartu Keluarga' },
        { ID: 'unhcr', DESKRIPSI: 'Dokumen Dari UNHCR' },
        { ID: 'kelurahan', DESKRIPSI: 'Dokumen Dari Kelurahan' },
        { ID: 'dinsos', DESKRIPSI: 'Dokumen Dari Dinas Sosial' },
        { ID: 'dinkes', DESKRIPSI: 'Dokumen Dari Dinas Kesehatan' },
        { ID: 'sjp', DESKRIPSI: 'Surat Jaminan Perawatan' },
        { ID: 'klaim_ibu', DESKRIPSI: 'Jaminan Bayi Baru Lahir' },
        { ID: 'lainnya', DESKRIPSI: 'Dokumen yang dapat dipertanggungjawabkan' },
    ];

    const listEpisodeCovid = [
        { ID: 1, DESKRIPSI: 'ICU dengan Ventilator' },
        { ID: 2, DESKRIPSI: 'ICU tanpa Ventilator' },
        { ID: 3, DESKRIPSI: 'Isolasi tekanan negatif dengan ventilator' },
        { ID: 4, DESKRIPSI: 'Isolasi tekanan negatif tanpa ventilator' },
        { ID: 5, DESKRIPSI: 'Isolasi non tekanan negatif dengan ventilator' },
        { ID: 6, DESKRIPSI: 'Isolasi non tekanan negatif tanpa ventilator' },
        { ID: 7, DESKRIPSI: 'ICU tekanan negatif dengan ventilator' },
        { ID: 8, DESKRIPSI: 'ICU tekanan negatif tanpa ventilator' },
        { ID: 9, DESKRIPSI: 'ICU tanpa tekanan negatif dengan ventilator' },
        { ID: 10, DESKRIPSI: 'ICU tanpa tekanan negatif tanpa ventilator' },
        { ID: 11, DESKRIPSI: 'Isolasi tekanan negatif' },
        { ID: 12, DESKRIPSI: 'Isolasi tanpa tekanan negatif' },
    ];

    const listCovidBayiLahirStatus = [
        { ID: 1, DESKRIPSI: 'Tanpa Kelainan' },
        { ID: 2, DESKRIPSI: 'Dengan Kelainan' },
    ];

    function formatRupiah(value: string) {
        if (!value) return '';
        return 'Rp ' + value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    function addDeliveryForm() {
        const newId = Date.now().toString();
        setDeliveryForms((prev: any) => ({
            ...prev,
            [newId]: {
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
                shk_alasan: '',
                shk_spesimen_dttm: '',
            },
        }));
    }

    function removeDeliveryForm(id: string) {
        setDeliveryForms((prev: any) => {
            const updatedForms = { ...prev };
            delete updatedForms[id];
            return updatedForms;
        });
    }

    function updateDeliveryForm(id: string, field: string, value: any) {
        setDeliveryForms((prev: any) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value,
            },
        }));
    }

    function addCovidEpisode(index: number) {
        setCovidEpisodesList((prev) => [...prev.slice(0, index + 1), { episode: '', hari: '' }, ...prev.slice(index + 1)]);
    }

    function removeCovidEpisode(index: number) {
        setCovidEpisodesList((prev) => prev.filter((_, i) => i !== index));
    }

    function updateCovidEpisode(index: number, field: string, value: any) {
        setCovidEpisodesList((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
    }

    // Tambahkan state dan fungsi untuk Diagnosa
    const [diagnosaOptions, setDiagnosaOptions] = useState<any[]>([]);

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

    // Tambahkan state dan fungsi untuk Procedure
    const [procedureOptions, setProcedureOptions] = useState<any[]>([]);

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

    function klaimStringToArray(str: string) {
        if (!str || str === '#') return [];
        const result: string[] = [];
        const parts = str.split('#');
        for (const part of parts) {
            const match = part.match(/^(.+)\+(\d+)$/);
            if (match) {
                const val = match[1];
                const count = parseInt(match[2], 10);
                for (let i = 0; i < count; i++) result.push(val);
            } else {
                result.push(part);
            }
        }
        return result;
    }

    useEffect(() => {
        if (!pengajuanKlaimId) return;
        axios
            .get(`/eklaim/get/pengajuan-klaim/${pengajuanKlaimId}`)
            .then((res) => {
                const data = res.data;
                if (data.klaimData) {
                    const klaim = data.klaimData;
                    setCaraMasuk(klaim.cara_masuk || '');
                    setJenisPerawatan(klaim.jenis_rawat || '');
                    setDataDischargeStatus(klaim.discharge_status || '');
                    setDataPenjaminKlaim(klaim.payor_id || '');
                    setAdlSubAcute(klaim.adl_sub_acute || '');
                    setAdlChronic(klaim.adl_chronic || '');
                    setIcuIndicator(klaim.icu_indikator || '');
                    setIcuLos(klaim.icu_los || '');
                    setAdaVentilator(klaim.ventilator_use_ind == 0 ? false : true);
                    setPemasangan(klaim.ventilator_start_dttm || '');
                    setPencabutan(klaim.ventilator_stop_dttm || '');
                    setUpgradeKelas(klaim.upgrade_class_ind == 0 ? false : true);
                    setUpgradeKelasKe(klaim.upgrade_class_class || '');
                    setLamaUpgradeKelas(klaim.upgrade_class_los || '');
                    setUpgradeKelasPayor(klaim.upgrade_class_payor || '');
                    setPaymentPct(klaim.add_payment_pct || '');
                    setPenggunaanDarah(!!klaim.kantong_darah);
                    setKantongDarahPenggunaan(klaim.kantong_darah || '');
                    setDataSistole(klaim.sistole || '');
                    setDataDiastole(klaim.diastole || '');
                    setTarifProsedurNonBedah(klaim.tarif_rs?.prosedur_non_bedah || '');
                    setTarifProsedurBedah(klaim.tarif_rs?.prosedur_bedah || '');
                    setTarifKonsultasi(klaim.tarif_rs?.konsultasi || '');
                    setTarifTenagaAhli(klaim.tarif_rs?.tenaga_ahli || '');
                    setTarifKeperawatan(klaim.tarif_rs?.keperawatan || '');
                    setTarifPenunjang(klaim.tarif_rs?.penunjang || '');
                    setTarifRadiologi(klaim.tarif_rs?.radiologi || '');
                    setTarifLaboratorium(klaim.tarif_rs?.laboratorium || '');
                    setTarifPelayananDarah(klaim.tarif_rs?.pelayanan_darah || '');
                    setTarifRehabilitasi(klaim.tarif_rs?.rehabilitasi || '');
                    setTarifKamar(klaim.tarif_rs?.kamar || '');
                    setTarifRawatIntensif(klaim.tarif_rs?.rawat_intensif || '');
                    setTarifObat(klaim.tarif_rs?.obat || '');
                    setTarifObatKronis(klaim.tarif_rs?.obat_kronis || '');
                    setTarifObatKemoterapi(klaim.tarif_rs?.obat_kemoterapi || '');
                    setTarifAlkes(klaim.tarif_rs?.alkes || '');
                    setTarifBMHP(klaim.tarif_rs?.bmhp || '');
                    setTarifSewaAlat(klaim.tarif_rs?.sewa_alat || '');
                    setUsiaPersalinan(klaim.persalinan?.usia_kehamilan || '');
                    setGravida(klaim.persalinan?.gravida || '');
                    setPartus(klaim.persalinan?.partus || '');
                    setAbortus(klaim.persalinan?.abortus || '');
                    setOnsetKontraksi(klaim.persalinan?.onset_kontraksi || '');
                    // Delivery
                    if (data.delivery && Array.isArray(data.delivery)) {
                        const forms: any = {};
                        data.delivery.forEach((item: any, idx: number) => {
                            forms[item.id || idx] = item;
                        });
                        setDeliveryForms(forms);
                    }
                    setPoliEksekutif(klaim.tarif_poli_eks > 0 ? true : false);
                    setNamaDokterPoliEksekutif(klaim.nama_dokter || '');
                    setTarifPoliEksekutif(klaim.tarif_poli_eks || '');
                    // Apgar
                    if (data.apgar) {
                        setApgarApparance1(data.apgar.appearance_1 || '');
                        setApgarPulse1(data.apgar.pulse_1 || '');
                        setApgarGrimace1(data.apgar.grimace_1 || '');
                        setApgarActivity1(data.apgar.activity_1 || '');
                        setApgarRespiration1(data.apgar.respiration_1 || '');
                        setApgarApparance5(data.apgar.appearance_5 || '');
                        setApgarPulse5(data.apgar.pulse_5 || '');
                        setApgarGrimace5(data.apgar.grimace_5 || '');
                        setApgarActivity5(data.apgar.activity_5 || '');
                        setApgarRespiration5(data.apgar.respiration_5 || '');
                    }
                    setHemodialisa(klaim.dializer_single_use || '');
                    setCovid19StatusCD(!!klaim.covid19_status_cd);
                    setCovidKartuPenjamin(klaim.nomor_kartu_t || '');
                    setNomorKartuPenjamin(klaim.nomor_kartu_t || '');
                    setCovidEpisodesList(klaim.episodes || [{ episode: '', hari: '' }]);
                    setCovid19CCIndonesia(!!klaim.covid19_cc_ind);
                    setCovid19RsDaruratIndonesia(!!klaim.covid19_rs_darurat_ind);
                    setCovidIsoman(!!klaim.isoman_ind);
                    setCovid19InsidenseIndonesia(!!klaim.covid19_co_insidense_ind);
                    setCovid19COinsidenseSEP(klaim.covid19_co_insidense_sep || '');
                    setCovidTerapiKovalen(klaim.terapi_konvalesen || '');
                    setCovidBayiLahirStatus(klaim.bayi_lahir_status_cd || '');
                    // Penunjang COVID
                    setCovidLabAsamLaktat(!!klaim.covid19_penunjang_pengurang?.lab_asam_laktat);
                    setCovidLabProcalcitonin(!!klaim.covid19_penunjang_pengurang?.lab_procalcitonin);
                    setCovidLabCRP(!!klaim.covid19_penunjang_pengurang?.lab_crp);
                    setCovidLabKultur(!!klaim.covid19_penunjang_pengurang?.lab_kultur);
                    setCovidLabDDimer(!!klaim.covid19_penunjang_pengurang?.lab_d_dimer);
                    setCovidLabPT(!!klaim.covid19_penunjang_pengurang?.lab_pt);
                    setCovidLabAPTT(!!klaim.covid19_penunjang_pengurang?.lab_aptt);
                    setCovidLabWaktuPendarahan(!!klaim.covid19_penunjang_pengurang?.lab_waktu_pendarahan);
                    setCovidLabAntiHIV(!!klaim.covid19_penunjang_pengurang?.lab_anti_hiv);
                    setCovidLabAnalisaGas(!!klaim.covid19_penunjang_pengurang?.lab_analisa_gas);
                    setCovidLabAlbumin(!!klaim.covid19_penunjang_pengurang?.lab_albumin);
                    setCovidRadThoraxApPA(!!klaim.covid19_penunjang_pengurang?.rad_thorax_ap_pa);
                    setPasienMeninggal(!!klaim.pasien_meninggal);
                    setPemulasaranJenazah(!!klaim.pemulasaraan_jenazah);
                    setKantongJenazah(!!klaim.kantong_jenazah);
                    setPetiJenazah(!!klaim.peti_jenazah);
                    setPlastikErat(!!klaim.plastik_erat);
                    setDisinfektanJenazah(!!klaim.desinfektan_jenazah);
                    setMobilJenazah(!!klaim.mobil_jenazah);
                    setDisinfektanMobilJenazah(!!klaim.desinfektan_mobil_jenazah);
                    setSelectedDiagnosa(
                        klaimStringToArray(klaim.diagnosa).map((id: string) => ({
                            id,
                            description: '', // Anda bisa fetch deskripsi jika perlu
                        })),
                    );
                    setSelectedProcedure(
                        klaimStringToArray(klaim.procedure).map((id: string) => ({
                            id,
                            description: '', // Anda bisa fetch deskripsi jika perlu
                        })),
                    );
                    // ...state lain...
                }
                // Jika data dari kunjungan, Anda bisa isi state dari data.kunjungan sesuai kebutuhan
            })
            .catch((err) => {
                // Optional: tampilkan error
                // console.error(err);
            });
    }, [pengajuanKlaimId]);

    return (
        <div className="">
            <table className="w-full table-fixed rounded-lg border border-gray-300">
                <tbody>
                    {/* Cara Masuk dan Jenis Perawatan */}
                    <tr className="hover:bg-gray-50">
                        <td colSpan={8} className="border-r border-b border-l border-gray-300 bg-gray-100 px-4 py-2">
                            <center>
                                <h2>Administrasi Umum</h2>
                            </center>
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Cara Masuk</td>
                        <td className="relative border-r border-b border-l border-gray-300 px-4 py-2">
                            <SearchableDropdown
                                data={caraMasukOptions}
                                value={caraMasuk}
                                setValue={setCaraMasuk}
                                placeholder="Pilih Cara Masuk"
                                getOptionLabel={(item) => (item && item.DESKRIPSI ? item.DESKRIPSI : '')}
                                getOptionValue={(item) => (item && item.ID ? item.ID : '')}
                            />
                        </td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Jenis Perawatan</td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <SearchableDropdown
                                data={jenisPerawatanOptions}
                                value={jenisPerawatan}
                                setValue={setJenisPerawatan}
                                placeholder="Pilih Jenis Perawatan"
                                getOptionLabel={(item) => item.DESKRIPSI}
                                getOptionValue={(item) => item.ID}
                            />
                        </td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Cara Pulang</td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <SearchableDropdown
                                data={listDischargeStatus}
                                value={dataDischargeStatus}
                                setValue={setDataDischargeStatus}
                                placeholder="Pilih Cara Pulang"
                                getOptionLabel={(item) => item.DESKRIPSI}
                                getOptionValue={(item) => item.ID}
                            />
                        </td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Penjamin</td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">
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
                                getOptionLabel={(item) => (item && item.DESKRIPSI ? item.DESKRIPSI : '')}
                                getOptionValue={(item) => (item && item.ID ? item.ID : '')}
                            />
                        </td>
                    </tr>

                    {/* ICU Fields */}
                    <tr className="hover:bg-gray-50">
                        <td colSpan={8} className="border-r border-b border-l border-gray-300 bg-gray-100 px-4 py-2">
                            <center>
                                <h2>ICU</h2>
                            </center>
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">ADL Sub Acute</td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                id="adl_sub_acute"
                                name="adl_sub_acute"
                                type="text"
                                placeholder="Masukkan ADL Sub Acute"
                                value={adlSubAcute}
                                onChange={(e) => setAdlSubAcute(e.target.value)}
                            />
                        </td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">ADL Chronic</td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                id="adl_chronic"
                                name="adl_chronic"
                                type="text"
                                placeholder="Masukkan ADL Chronic"
                                value={adlChronic}
                                onChange={(e) => setAdlChronic(e.target.value)}
                            />
                        </td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">ICU Indicator</td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                id="icu_indicator"
                                name="icu_indicator"
                                type="text"
                                placeholder="Masukkan ICU Indicator"
                                value={icuIndicator}
                                onChange={(e) => setIcuIndicator(e.target.value)}
                            />
                        </td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">ICU LOS</td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                id="icu_los"
                                name="icu_los"
                                type="text"
                                placeholder="Masukkan ICU LOS"
                                value={icuLos}
                                onChange={(e) => setIcuLos(e.target.value)}
                            />
                        </td>
                    </tr>

                    {/* Ventilator */}
                    <tr className="hover:bg-gray-50">
                        <td colSpan={8} className="border-r border-b border-l border-gray-300 bg-gray-100 px-4 py-2">
                            <center>
                                <h2>Oksigen</h2>
                            </center>
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Pemakaian Oksigen</td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Checkbox id="ada_ventilator" checked={adaVentilator} onCheckedChange={setAdaVentilator} />
                        </td>
                        {adaVentilator ? (
                            <>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">Pemasangan</td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Input id="pemasangan" type="datetime-local" value={pemasangan} onChange={(e) => setPemasangan(e.target.value)} />
                                </td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">Pencabutan</td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Input
                                        id="pencabutan"
                                        name="pencabutan"
                                        type="datetime-local"
                                        value={pencabutan}
                                        onChange={(e) => setPencabutan(e.target.value)}
                                    />
                                </td>
                                <td colSpan={2} className="border-r border-b border-l border-gray-300 px-4 py-2"></td>
                            </>
                        ) : (
                            <td colSpan={6} className="border-r border-b border-l border-gray-300 px-4 py-2"></td>
                        )}
                    </tr>

                    {/* Upgrade Kelas */}
                    <tr className="hover:bg-gray-50">
                        <td colSpan={8} className="border-r border-b border-l border-gray-300 bg-gray-100 px-4 py-2">
                            <center>
                                <h2>Naik Kelas</h2>
                            </center>
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Upgrade Kelas</td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Checkbox id="kelas_pasien" checked={upgradeKelas} onCheckedChange={setUpgradeKelas} />
                        </td>
                        <td colSpan={6} className="border-r border-b border-l border-gray-300 px-4 py-2"></td>
                    </tr>
                    {upgradeKelas && (
                        <>
                            <tr className="hover:bg-gray-50">
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">Upgrade Kelas Ke</td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <SearchableDropdown
                                        data={listUpgradeKelas}
                                        value={upgradeKelasKe}
                                        setValue={setUpgradeKelasKe}
                                        placeholder="Pilih Upgrade Kelas"
                                        getOptionLabel={(item) => item.DESKRIPSI}
                                        getOptionValue={(item) => item.ID}
                                    />
                                </td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">LOS</td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Input
                                        id="lama_upgrade"
                                        name="lama_upgrade"
                                        type="number"
                                        placeholder="Masukkan Lama Upgrade Kelas (dalam hari)"
                                        value={lamaUpgradeKelas}
                                        onChange={(e) => setLamaUpgradeKelas(e.target.value)}
                                    />
                                </td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">Pembayar</td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <SearchableDropdown
                                        data={listPayorUpgradeKelas}
                                        value={upgradeKelasPayor}
                                        setValue={setUpgradeKelasPayor}
                                        placeholder="Pilih Penanggung Jawab"
                                        getOptionLabel={(item) => item.DESKRIPSI}
                                        getOptionValue={(item) => item.ID}
                                    />
                                </td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">Payment PCT</td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Input
                                        id="payment_pct"
                                        name="payment_pct"
                                        type="number"
                                        placeholder="Koefisien tambahan biaya khusus"
                                        value={paymentPct}
                                        onChange={(e) => setPaymentPct(e.target.value)}
                                    />
                                </td>
                            </tr>
                        </>
                    )}
                    <tr className="hover:bg-gray-50">
                        <td colSpan={8} className="border-r border-b border-l border-gray-300 bg-gray-100 px-4 py-2">
                            <center>
                                <h2>Penggunaan Darah</h2>
                            </center>
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Penggunanaan Darah</td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Checkbox id="darah_penggunaan" checked={penggunaanDarah} onCheckedChange={setPenggunaanDarah} />
                        </td>

                        {penggunaanDarah ? (
                            <>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">Kantong Darah</td>
                                <td colSpan={5} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Input
                                        id="kantong_darah_penggunaan"
                                        name="kantong_darah_penggunaan"
                                        type="number"
                                        placeholder="Masukkan Jumlah Kantong Darah"
                                        value={kantongDarahPenggunaan}
                                        onChange={(e) => setKantongDarahPenggunaan(e.target.value)}
                                    />
                                </td>
                            </>
                        ) : (
                            <td colSpan={6} className="border-r border-b border-l border-gray-300 px-4 py-2"></td>
                        )}
                    </tr>

                    {/* Data Klinis */}
                    <tr className="hover:bg-gray-50">
                        <td colSpan={8} className="border-r border-b border-l border-gray-300 bg-gray-100 px-4 py-2">
                            <center>
                                <h2>Data Klinis</h2>
                            </center>
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td colSpan={2} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            Sistole
                        </td>
                        <td colSpan={2} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                id="sistole"
                                name="sistole"
                                type="number"
                                placeholder="Masukkan Data Sistole"
                                value={dataSistole}
                                onChange={(e) => setDataSistole(e.target.value)}
                            />
                        </td>
                        <td colSpan={2} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            Diastole
                        </td>
                        <td colSpan={2} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                id="diastole"
                                name="diastole"
                                type="number"
                                placeholder="Masukkan Data Diastole"
                                value={dataDiastole}
                                onChange={(e) => setDataDiastole(e.target.value)}
                            />
                        </td>
                    </tr>

                    {/* Diagnosa dan Procedure */}
                    <tr className="hover:bg-gray-50">
                        <td colSpan={8} className="border-r border-b border-l border-gray-300 bg-gray-100 px-4 py-2">
                            <center>
                                <h2>Diagnosa dan Procedure</h2>
                            </center>
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Diagnosa</td>
                        <td colSpan={3} className="border-r border-b border-l border-gray-300 px-4 py-2">
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
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Procedure</td>
                        <td colSpan={3} className="border-r border-b border-l border-gray-300 px-4 py-2">
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

                    {/* TARIF RUMAH SAKIT */}
                    <tr className="hover:bg-gray-50">
                        <td colSpan={8} className="border-r border-b border-l border-gray-300 bg-gray-100 px-4 py-2">
                            <center>
                                <h2>Tarif Rumah Sakit</h2>
                            </center>
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Prosedur Non Bedah</td>
                        <td colSpan={3} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                id="prosedur_non_bedah"
                                name="prosedur_non_bedah"
                                type="text"
                                placeholder="Masukkan Prosedur Non Bedah"
                                value={formatRupiah(tarifProsedurNonBedah)} // Format nilai menjadi Rupiah
                                onChange={(e) => {
                                    let rawValue = e.target.value.replace(/[^0-9]/g, ''); // Hanya angka
                                    if (rawValue.startsWith('0')) {
                                        rawValue = rawValue.replace(/^0+/, ''); // Hilangkan angka 0 di awal
                                    }
                                    setTarifProsedurNonBedah(rawValue); // Simpan nilai asli tanpa format
                                }}
                            />
                        </td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Tarif Prosedur Bedah</td>
                        <td colSpan={3} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                id="prosedur_bedah"
                                name="prosedur_bedah"
                                type="text"
                                placeholder="Masukkan Prosedur Bedah"
                                value={formatRupiah(tarifProsedurBedah)} // Format nilai menjadi Rupiah
                                onChange={(e) => {
                                    let rawValue = e.target.value.replace(/[^0-9]/g, ''); // Hanya angka
                                    if (rawValue.startsWith('0')) {
                                        rawValue = rawValue.replace(/^0+/, ''); // Hilangkan angka 0 di awal
                                    }
                                    setTarifProsedurBedah(rawValue); // Simpan nilai asli tanpa format
                                }}
                            />
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Tarif Konsultasi</td>
                        <td colSpan={3} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                id="tarif_konsultasi"
                                name="tarif_konsultasi"
                                type="text"
                                placeholder="Masukkan Tarif Konsultasi"
                                value={formatRupiah(tarifKonsultasi)} // Format nilai menjadi Rupiah
                                onChange={(e) => {
                                    let rawValue = e.target.value.replace(/[^0-9]/g, ''); // Hanya angka
                                    if (rawValue.startsWith('0')) {
                                        rawValue = rawValue.replace(/^0+/, ''); // Hilangkan angka 0 di awal
                                    }
                                    setTarifKonsultasi(rawValue); // Simpan nilai asli tanpa format
                                }}
                            />
                        </td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Tarif Tenaga Ahli</td>
                        <td colSpan={3} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                id="tarif_tenaga_ahli"
                                name="tarif_tenaga_ahli"
                                type="text"
                                placeholder="Masukkan Tarif Tenaga Ahli"
                                value={formatRupiah(tarifTenagaAhli)} // Format nilai menjadi Rupiah
                                onChange={(e) => {
                                    let rawValue = e.target.value.replace(/[^0-9]/g, ''); // Hanya angka
                                    if (rawValue.startsWith('0')) {
                                        rawValue = rawValue.replace(/^0+/, ''); // Hilangkan angka 0 di awal
                                    }
                                    setTarifTenagaAhli(rawValue); // Simpan nilai asli tanpa format
                                }}
                            />
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Tarif Keperawatan</td>
                        <td colSpan={3} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                id="tarif_keperawatan"
                                name="tarif_keperawatan"
                                type="text"
                                placeholder="Masukkan Tarif Keperawatan"
                                value={formatRupiah(tarifKeperawatan)} // Format nilai menjadi Rupiah
                                onChange={(e) => {
                                    let rawValue = e.target.value.replace(/[^0-9]/g, ''); // Hanya angka
                                    if (rawValue.startsWith('0')) {
                                        rawValue = rawValue.replace(/^0+/, ''); // Hilangkan angka 0 di awal
                                    }
                                    setTarifKeperawatan(rawValue); // Simpan nilai asli tanpa format
                                }}
                            />
                        </td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Tarif Penunjang</td>
                        <td colSpan={3} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                id="tarif_penunjang"
                                name="tarif_penunjang"
                                type="text"
                                placeholder="Masukkan Tarif Penunjang"
                                value={formatRupiah(tarifPenunjang)} // Format nilai menjadi Rupiah
                                onChange={(e) => {
                                    let rawValue = e.target.value.replace(/[^0-9]/g, ''); // Hanya angka
                                    if (rawValue.startsWith('0')) {
                                        rawValue = rawValue.replace(/^0+/, ''); // Hilangkan angka 0 di awal
                                    }
                                    setTarifPenunjang(rawValue); // Simpan nilai asli tanpa format
                                }}
                            />
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Tarif Radiologi</td>
                        <td colSpan={3} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                id="tarif_radiologi"
                                name="tarif_radiologi"
                                type="text"
                                placeholder="Masukkan Tarif Radiologi"
                                value={formatRupiah(tarifRadiologi)} // Format nilai menjadi Rupiah
                                onChange={(e) => {
                                    let rawValue = e.target.value.replace(/[^0-9]/g, ''); // Hanya angka
                                    if (rawValue.startsWith('0')) {
                                        rawValue = rawValue.replace(/^0+/, ''); // Hilangkan angka 0 di awal
                                    }
                                    setTarifRadiologi(rawValue); // Simpan nilai asli tanpa format
                                }}
                            />
                        </td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Tarif Laboratorium</td>
                        <td colSpan={3} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                id="tarif_laboratorium"
                                name="tarif_laboratorium"
                                type="text"
                                placeholder="Masukkan Tarif Laboratorium"
                                value={formatRupiah(tarifLaboratorium)} // Format nilai menjadi Rupiah
                                onChange={(e) => {
                                    let rawValue = e.target.value.replace(/[^0-9]/g, ''); // Hanya angka
                                    if (rawValue.startsWith('0')) {
                                        rawValue = rawValue.replace(/^0+/, ''); // Hilangkan angka 0 di awal
                                    }
                                    setTarifLaboratorium(rawValue); // Simpan nilai asli tanpa format
                                }}
                            />
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Tarif Pelayanan Darah</td>
                        <td colSpan={3} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                id="tarif_pelayanan_darah"
                                name="tarif_pelayanan_darah"
                                type="text"
                                placeholder="Masukkan Tarif Pelayanan Darah"
                                value={formatRupiah(tarifPelayananDarah)} // Format nilai menjadi Rupiah
                                onChange={(e) => {
                                    let rawValue = e.target.value.replace(/[^0-9]/g, ''); // Hanya angka
                                    if (rawValue.startsWith('0')) {
                                        rawValue = rawValue.replace(/^0+/, ''); // Hilangkan angka 0 di awal
                                    }
                                    setTarifPelayananDarah(rawValue); // Simpan nilai asli tanpa format
                                }}
                            />
                        </td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Tarif Rehabilitasi</td>
                        <td colSpan={3} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                id="tarif_rehabilitasi"
                                name="tarif_rehabilitasi"
                                type="text"
                                placeholder="Masukkan Tarif Rehabilitasi"
                                value={formatRupiah(tarifRehabilitasi)} // Format nilai menjadi Rupiah
                                onChange={(e) => {
                                    let rawValue = e.target.value.replace(/[^0-9]/g, ''); // Hanya angka
                                    if (rawValue.startsWith('0')) {
                                        rawValue = rawValue.replace(/^0+/, ''); // Hilangkan angka 0 di awal
                                    }
                                    setTarifRehabilitasi(rawValue); // Simpan nilai asli tanpa format
                                }}
                            />
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Tarif Kamar</td>
                        <td colSpan={3} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                id="tarif_kamar"
                                name="tarif_kamar"
                                type="text"
                                placeholder="Masukkan Tarif Kamar"
                                value={formatRupiah(tarifKamar)} // Format nilai menjadi Rupiah
                                onChange={(e) => {
                                    let rawValue = e.target.value.replace(/[^0-9]/g, ''); // Hanya angka
                                    if (rawValue.startsWith('0')) {
                                        rawValue = rawValue.replace(/^0+/, ''); // Hilangkan angka 0 di awal
                                    }
                                    setTarifKamar(rawValue); // Simpan nilai asli tanpa format
                                }}
                            />
                        </td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Tarif Rawat Intensif</td>
                        <td colSpan={3} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                id="tarif_rawat_intensif"
                                name="tarif_rawat_intensif"
                                type="text"
                                placeholder="Masukkan Tarif Rawat Intensif"
                                value={formatRupiah(tarifRawatIntensif)} // Format nilai menjadi Rupiah
                                onChange={(e) => {
                                    let rawValue = e.target.value.replace(/[^0-9]/g, ''); // Hanya angka
                                    if (rawValue.startsWith('0')) {
                                        rawValue = rawValue.replace(/^0+/, ''); // Hilangkan angka 0 di awal
                                    }
                                    setTarifRawatIntensif(rawValue); // Simpan nilai asli tanpa format
                                }}
                            />
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Tarif Obat</td>
                        <td colSpan={3} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                id="tarif_obat"
                                name="tarif_obat"
                                type="text"
                                placeholder="Masukkan Tarif Obat"
                                value={formatRupiah(tarifObat)} // Format nilai menjadi Rupiah
                                onChange={(e) => {
                                    let rawValue = e.target.value.replace(/[^0-9]/g, ''); // Hanya angka
                                    if (rawValue.startsWith('0')) {
                                        rawValue = rawValue.replace(/^0+/, ''); // Hilangkan angka 0 di awal
                                    }
                                    setTarifObat(rawValue); // Simpan nilai asli tanpa format
                                }}
                            />
                        </td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Tarif Obat Kronis</td>
                        <td colSpan={3} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                id="tarif_obat_kronis"
                                name="tarif_obat_kronis"
                                type="text"
                                placeholder="Masukkan Tarif Obat Kronis"
                                value={formatRupiah(tarifObatKronis)} // Format nilai menjadi Rupiah
                                onChange={(e) => {
                                    let rawValue = e.target.value.replace(/[^0-9]/g, ''); // Hanya angka
                                    if (rawValue.startsWith('0')) {
                                        rawValue = rawValue.replace(/^0+/, ''); // Hilangkan angka 0 di awal
                                    }
                                    setTarifObatKronis(rawValue); // Simpan nilai asli tanpa format
                                }}
                            />
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Tarif Obat Kemoterapi</td>
                        <td colSpan={3} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                id="tarif_obat_kemoterapi"
                                name="tarif_obat_kemoterapi"
                                type="text"
                                placeholder="Masukkan Tarif Obat Kemoterapi"
                                value={formatRupiah(tarifObatKemoterapi)} // Format nilai menjadi Rupiah
                                onChange={(e) => {
                                    let rawValue = e.target.value.replace(/[^0-9]/g, ''); // Hanya angka
                                    if (rawValue.startsWith('0')) {
                                        rawValue = rawValue.replace(/^0+/, ''); // Hilangkan angka 0 di awal
                                    }
                                    setTarifObatKemoterapi(rawValue); // Simpan nilai asli tanpa format
                                }}
                            />
                        </td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Tarif Alkes</td>
                        <td colSpan={3} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                id="tarif_alkes"
                                name="tarif_alkes"
                                type="text"
                                placeholder="Masukkan Tarif Alkes"
                                value={formatRupiah(tarifAlkes)} // Format nilai menjadi Rupiah
                                onChange={(e) => {
                                    let rawValue = e.target.value.replace(/[^0-9]/g, ''); // Hanya angka
                                    if (rawValue.startsWith('0')) {
                                        rawValue = rawValue.replace(/^0+/, ''); // Hilangkan angka 0 di awal
                                    }
                                    setTarifAlkes(rawValue); // Simpan nilai asli tanpa format
                                }}
                            />
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Tarif BMHP</td>
                        <td colSpan={3} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                id="tarif_bmhp"
                                name="tarif_bmhp"
                                type="text"
                                placeholder="Masukkan Tarif BMHP"
                                value={formatRupiah(tarifBMHP)} // Format nilai menjadi Rupiah
                                onChange={(e) => {
                                    let rawValue = e.target.value.replace(/[^0-9]/g, ''); // Hanya angka
                                    if (rawValue.startsWith('0')) {
                                        rawValue = rawValue.replace(/^0+/, ''); // Hilangkan angka 0 di awal
                                    }
                                    setTarifBMHP(rawValue); // Simpan nilai asli tanpa format
                                }}
                            />
                        </td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Tarif Sewa Alat</td>
                        <td colSpan={3} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                id="tarif_sewa_alat"
                                name="tarif_sewa_alat"
                                type="text"
                                placeholder="Masukkan Tarif Sewa Alat"
                                value={formatRupiah(tarifSewaAlat)} // Format nilai menjadi Rupiah
                                onChange={(e) => {
                                    let rawValue = e.target.value.replace(/[^0-9]/g, ''); // Hanya angka
                                    if (rawValue.startsWith('0')) {
                                        rawValue = rawValue.replace(/^0+/, ''); // Hilangkan angka 0 di awal
                                    }
                                    setTarifSewaAlat(rawValue); // Simpan nilai asli tanpa format
                                }}
                            />
                        </td>
                    </tr>

                    {/* Persalinan */}
                    <tr className="hover:bg-gray-50">
                        <td colSpan={8} className="border-r border-b border-l border-gray-300 bg-gray-100 px-4 py-2">
                            <center>
                                <h2>Persalinan</h2>
                            </center>
                        </td>
                    </tr>

                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Usia Persalinan</td>
                        <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                type="number"
                                placeholder="Masukan Usia Persalinan"
                                value={usiaPersalinan}
                                onChange={(e) => setUsiaPersalinan(e.target.value)}
                            />
                        </td>
                    </tr>

                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Gravida</td>
                        <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input type="number" placeholder="Masukan Gravida" value={gravida} onChange={(e) => setGravida(e.target.value)} />
                        </td>
                    </tr>

                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Partus</td>
                        <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input type="number" placeholder="Masukan Partus" value={partus} onChange={(e) => setPartus(e.target.value)} />
                        </td>
                    </tr>

                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Abortus</td>
                        <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input type="number" placeholder="Masukan Abortus" value={abortus} onChange={(e) => setAbortus(e.target.value)} />
                        </td>
                    </tr>

                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Onset Kontraksi</td>
                        <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <SearchableDropdown
                                data={listOnsetKontraksi}
                                value={onsetKontraksi}
                                setValue={setOnsetKontraksi}
                                placeholder="Pilih Onset Kontraksi"
                                getOptionLabel={(item) => item.DESKRIPSI}
                                getOptionValue={(item) => item.ID}
                            />
                        </td>
                    </tr>

                    <tr className="hover:bg-gray-50">
                        <td colSpan={8} className="border-r border-b border-l border-gray-300 px-4 py-2 font-bold">
                            Delivery
                            <span className="float-right">
                                <Button
                                    className="bg-blue-500 text-white hover:bg-blue-600"
                                    onClick={addDeliveryForm} // Tambahkan form baru
                                >
                                    <PlusCircle size={24} className="h-4 w-4" />
                                </Button>
                            </span>
                        </td>
                    </tr>
                    {Object.entries(deliveryForms).map(([id, form]) => (
                        <>
                            <tr key={`${id}-judul`} className="bg-blue-50">
                                <td colSpan={8} className="border-r border-b border-l border-gray-300 bg-gray-100 px-4 py-2">
                                    Form Kelahiran
                                    <span className="float-right">
                                        <Button
                                            className="bg-red-500 text-white hover:bg-red-600"
                                            onClick={() => removeDeliveryForm(id)} // Hapus form
                                        >
                                            ✕
                                        </Button>
                                    </span>
                                </td>
                            </tr>
                            <tr key={id} className="bg-blue-50">
                                <td colSpan={1} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    Kelahiran ke
                                </td>
                                <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Input
                                        type="number"
                                        placeholder="Masukkan Kelahiran ke"
                                        value={form.delivery_sequence}
                                        onChange={(e) => updateDeliveryForm(form.id, 'delivery_sequence', e.target.value)} // Perbarui metode kelahiran
                                    />
                                </td>
                            </tr>

                            <tr key={`${id}-method`} className="bg-blue-50">
                                <td colSpan={1} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    Jenis Kelahiran
                                </td>
                                <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <SearchableDropdown
                                        data={[
                                            { ID: 'vaginal', DESKRIPSI: 'Normal' },
                                            { ID: 'sc', DESKRIPSI: 'Operasi Caesar' },
                                        ]}
                                        value={form.delivery_method}
                                        setValue={(value) => updateDeliveryForm(form.id, 'delivery_method', value)}
                                        placeholder="Pilih Jenis Kelahiran"
                                        getOptionLabel={(item) => item.DESKRIPSI}
                                        getOptionValue={(item) => item.ID}
                                    />
                                </td>
                            </tr>

                            <tr key={`${id}-dttm`} className="bg-blue-50">
                                <td colSpan={1} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    Tanggal & Waktu Kelahiran
                                </td>
                                <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Input
                                        type="datetime-local"
                                        value={form.delivery_dttm}
                                        onChange={(e) => updateDeliveryForm(form.id, 'delivery_dttm', e.target.value)} // Perbarui tanggal & waktu kelahiran
                                    />
                                </td>
                            </tr>

                            <tr key={`${id}-letak_janin`} className="bg-blue-50">
                                <td colSpan={1} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    Letak Janin
                                </td>
                                <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <SearchableDropdown
                                        data={[
                                            { ID: 'kepala', DESKRIPSI: 'Kepala' },
                                            { ID: 'sungsang', DESKRIPSI: 'Sungsang' },
                                            { ID: 'lintang', DESKRIPSI: 'Lintang' },
                                        ]}
                                        value={form.letak_janin}
                                        setValue={(value) => updateDeliveryForm(form.id, 'letak_janin', value)}
                                        placeholder="Pilih Letak Janin"
                                        getOptionLabel={(item) => item.DESKRIPSI}
                                        getOptionValue={(item) => item.ID}
                                    />
                                </td>
                            </tr>

                            <tr key={`${id}-lahir_bantuan_manual`} className="bg-blue-50">
                                <td colSpan={1} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    Bantuan Manual
                                </td>
                                <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <SearchableDropdown
                                        data={[
                                            { ID: 1, DESKRIPSI: 'Ya' },
                                            { ID: 0, DESKRIPSI: 'Tidak' },
                                        ]}
                                        value={form.use_manual}
                                        setValue={(value) => updateDeliveryForm(form.id, 'use_manual', value)}
                                        placeholder="Pilih Lahir dengan bantuan manual"
                                        getOptionLabel={(item) => item.DESKRIPSI}
                                        getOptionValue={(item) => item.ID}
                                    />
                                </td>
                            </tr>

                            <tr key={`${id}-penggunaan_forcep`} className="bg-blue-50">
                                <td colSpan={1} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    Penggunaan Forcep
                                </td>
                                <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <SearchableDropdown
                                        data={[
                                            { ID: 1, DESKRIPSI: 'Ya' },
                                            { ID: 0, DESKRIPSI: 'Tidak' },
                                        ]}
                                        value={form.use_forcep}
                                        setValue={(value) => updateDeliveryForm(form.id, 'use_forcep', value)}
                                        placeholder="Pilih Penggunaan Forcep"
                                        getOptionLabel={(item) => item.DESKRIPSI}
                                        getOptionValue={(item) => item.ID}
                                    />
                                </td>
                            </tr>

                            <tr key={`${id}-penggunaan_vacuum`} className="bg-blue-50">
                                <td colSpan={1} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    Penggunaan Vacuum
                                </td>
                                <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <SearchableDropdown
                                        data={[
                                            { ID: 1, DESKRIPSI: 'Ya' },
                                            { ID: 0, DESKRIPSI: 'Tidak' },
                                        ]}
                                        value={form.use_vacuum}
                                        setValue={(value) => updateDeliveryForm(form.id, 'use_vacuum', value)}
                                        placeholder="Pilih Penggunaan Vacuum"
                                        getOptionLabel={(item) => item.DESKRIPSI}
                                        getOptionValue={(item) => item.ID}
                                    />
                                </td>
                            </tr>

                            <tr key={`${id}-shk_diambil`} className="bg-blue-50">
                                <td colSpan={1} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    Sampel Darah
                                </td>
                                <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <SearchableDropdown
                                        data={[
                                            { ID: 'ya', DESKRIPSI: 'Ya' },
                                            { ID: 'tidak', DESKRIPSI: 'Tidak' },
                                        ]}
                                        value={form.shk_spesimen_ambil}
                                        setValue={(value) => updateDeliveryForm(form.id, 'shk_spesimen_ambil', value)}
                                        placeholder="Pilih Sampel Darah diambil"
                                        getOptionLabel={(item) => item.DESKRIPSI}
                                        getOptionValue={(item) => item.ID}
                                    />
                                </td>
                            </tr>

                            <tr key={`${id}-lokasi_shk_diambil`} className="bg-blue-50">
                                <td colSpan={1} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    Lokasi Pengambilan
                                </td>
                                <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <SearchableDropdown
                                        data={[
                                            { ID: 'tumit', DESKRIPSI: 'Tumit' },
                                            { ID: 'vena', DESKRIPSI: 'Vena' },
                                        ]}
                                        value={form.shk_lokasi}
                                        setValue={(value) => updateDeliveryForm(form.id, 'shk_lokasi', value)}
                                        placeholder="Pilih Lokasi Pengambilan"
                                        getOptionLabel={(item) => item.DESKRIPSI}
                                        getOptionValue={(item) => item.ID}
                                    />
                                </td>
                            </tr>

                            <tr key={`${id}-alasan_shk_diambil`} className="bg-blue-50">
                                <td colSpan={1} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    Alasan Pengambilan
                                </td>
                                <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <SearchableDropdown
                                        data={[
                                            { ID: 'tidak-dapat', DESKRIPSI: 'Tidak Dapat' },
                                            { ID: 'akses-sulit', DESKRIPSI: 'Akses Sulit' },
                                        ]}
                                        value={form.shk_alasan}
                                        setValue={(value) => updateDeliveryForm(form.id, 'shk_alasan', value)}
                                        placeholder="Pilih Alasan Pengambilan"
                                        getOptionLabel={(item) => item.DESKRIPSI}
                                        getOptionValue={(item) => item.ID}
                                    />
                                </td>
                            </tr>

                            <tr key={`${id}-shk_spesimen_dttm`} className="bg-blue-50">
                                <td colSpan={1} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    Tanggal Pengambilan
                                </td>
                                <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Input
                                        type="datetime-local"
                                        placeholder="Masukkan Tanggal & Waktu Pengambilan Darah"
                                        value={form.shk_spesimen_dttm}
                                        onChange={(e) => updateDeliveryForm(form.id, 'shk_spesimen_dttm', e.target.value)} // Perbarui tanggal & waktu kelahiran
                                    />
                                </td>
                            </tr>
                        </>
                    ))}
                    {/* Poli Eksekutif */}
                    <tr className="hover:bg-gray-50">
                        <td colSpan={8} className="border-r border-b border-l border-gray-300 bg-gray-100 px-4 py-2">
                            <center>
                                <h2>Poli Eksekutif</h2>
                            </center>
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Pasien Poli Eksekutif</td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Checkbox id="ada_ventilator" checked={poliEksekutif} onCheckedChange={setPoliEksekutif} />
                        </td>
                        <td colSpan={6} className="border-r border-b border-l border-gray-300 px-4 py-2"></td>
                    </tr>
                    {poliEksekutif && (
                        <tr className="hover:bg-gray-50">
                            <td colSpan={2} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                Nama Dokter Poli Eksekutif
                            </td>
                            <td colSpan={2} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                <Input
                                    id="nama_dokter_poli_eksekutif"
                                    name="nama_dokter_poli_eksekutif"
                                    type="text"
                                    placeholder="Masukkan Nama Dokter Poli Eksekutif"
                                    value={namaDokterPoliEksekutif}
                                    onChange={(e) => setNamaDokterPoliEksekutif(e.target.value)}
                                />
                            </td>
                            <td colSpan={2} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                Tarif Poli Eksekutif
                            </td>
                            <td colSpan={2} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                <Input
                                    id="tarif_poli_eksekutif"
                                    name="tarif_poli_eksekutif"
                                    type="text"
                                    placeholder="Masukkan Tarif Poli Eksekutif"
                                    value={formatRupiah(tarifPoliEksekutif)} // Format nilai menjadi Rupiah
                                    onChange={(e) => {
                                        let rawValue = e.target.value.replace(/[^0-9]/g, ''); // Hanya angka
                                        if (rawValue.startsWith('0')) {
                                            rawValue = rawValue.replace(/^0+/, ''); // Hilangkan angka 0 di awal
                                        }
                                        setTarifPoliEksekutif(rawValue); // Simpan nilai asli tanpa format
                                    }}
                                />
                            </td>
                        </tr>
                    )}

                    {/* Apgar Score */}
                    <tr className="hover:bg-gray-50">
                        <td colSpan={8} className="border-r border-b border-l border-gray-300 bg-gray-100 px-4 py-2">
                            <center>
                                <h2>Apgar Score</h2>
                            </center>
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td colSpan={8} className="border-r border-b border-l border-gray-300 px-4 py-2 font-bold">
                            Menit 1
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Apparance</td>
                        <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                type="number"
                                placeholder="Masukan Apparance"
                                value={apgarApparance1}
                                onChange={(e) => setApgarApparance1(e.target.value)}
                            />
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Pulse</td>
                        <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input type="number" placeholder="Masukan Pulse" value={apgarPulse1} onChange={(e) => setApgarPulse1(e.target.value)} />
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Grimace</td>
                        <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                type="number"
                                placeholder="Masukan Grimace"
                                value={apgarGrimace1}
                                onChange={(e) => setApgarGrimace1(e.target.value)}
                            />
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Activity</td>
                        <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                type="number"
                                placeholder="Masukan Activity"
                                value={apgarActivity1}
                                onChange={(e) => setApgarActivity1(e.target.value)}
                            />
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Respiration</td>
                        <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                type="number"
                                placeholder="Masukan Respiration"
                                value={apgarRespiration1}
                                onChange={(e) => setApgarRespiration1(e.target.value)}
                            />
                        </td>
                    </tr>

                    <tr className="hover:bg-gray-50">
                        <td colSpan={8} className="border-r border-b border-l border-gray-300 px-4 py-2 font-bold">
                            Menit 5
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Apparance</td>
                        <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                type="number"
                                placeholder="Masukan Apparance"
                                value={apgarApparance5}
                                onChange={(e) => setApgarApparance5(e.target.value)}
                            />
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Pulse</td>
                        <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input type="number" placeholder="Masukan Pulse" value={apgarPulse5} onChange={(e) => setApgarPulse5(e.target.value)} />
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Grimace</td>
                        <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                type="number"
                                placeholder="Masukan Grimace"
                                value={apgarGrimace5}
                                onChange={(e) => setApgarGrimace5(e.target.value)}
                            />
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Activity</td>
                        <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                type="number"
                                placeholder="Masukan Activity"
                                value={apgarActivity5}
                                onChange={(e) => setApgarActivity5(e.target.value)}
                            />
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Respiration</td>
                        <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Input
                                type="number"
                                placeholder="Masukan Respiration"
                                value={apgarRespiration5}
                                onChange={(e) => setApgarRespiration5(e.target.value)}
                            />
                        </td>
                    </tr>

                    {/* Hemodialisa */}
                    <tr className="hover:bg-gray-50">
                        <td colSpan={8} className="border-r border-b border-l border-gray-300 bg-gray-100 px-4 py-2">
                            <center>
                                <h2>Hemodialisa</h2>
                            </center>
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Dializer</td>
                        <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <SearchableDropdown
                                data={listPenggunaanHemodialisa}
                                value={hemodialisa}
                                setValue={setHemodialisa}
                                placeholder="Pilih Dializer"
                                getOptionLabel={(item) => item.DESKRIPSI}
                                getOptionValue={(item) => item.ID}
                            />
                        </td>
                    </tr>

                    {/* Covid 19 */}
                    <tr className="hover:bg-gray-50">
                        <td colSpan={8} className="border-r border-b border-l border-gray-300 bg-gray-100 px-4 py-2">
                            <center>
                                <h2>COVID-19</h2>
                            </center>
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Pasien COVID-19</td>
                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                            <Checkbox id="ada_ventilator" checked={covid19StatusCD} onCheckedChange={setCovid19StatusCD} />
                        </td>
                        <td colSpan={6} className="border-r border-b border-l border-gray-300 px-4 py-2"></td>
                    </tr>

                    {covid19StatusCD && (
                        <>
                            <tr className="hover:bg-gray-50">
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">Kartu</td>
                                <td colSpan={2} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <SearchableDropdown
                                        data={listCovidKartuPenjamin}
                                        value={covidKartuPenjamin}
                                        setValue={setCovidKartuPenjamin}
                                        placeholder="Pilih Penjamin"
                                        getOptionLabel={(item) => item.DESKRIPSI}
                                        getOptionValue={(item) => item.ID}
                                    />
                                </td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">Nomor Kartu</td>
                                <td colSpan={4} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Input
                                        id="nomor_kartu"
                                        name="nomor_kartu"
                                        type="text"
                                        placeholder="Masukkan Nomor Kartu"
                                        value={nomorKartuPenjamin}
                                        onChange={(e) => setNomorKartuPenjamin(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">Episode</td>
                                <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    {covidEpisodesList.map((item, index) => (
                                        <div key={index} className="mb-2 flex items-center gap-2">
                                            <SearchableDropdown
                                                data={listEpisodeCovid}
                                                value={item.episode}
                                                setValue={(value) => updateCovidEpisode(index, 'episode', value)}
                                                placeholder="Pilih Episode Covid"
                                                getOptionLabel={(item) => (item && item.DESKRIPSI ? item.DESKRIPSI : '')}
                                                getOptionValue={(item) => (item && item.ID ? item.ID : '')}
                                            />
                                            <Input
                                                id={`episode_hari_${index}`}
                                                name={`episode_hari_${index}`}
                                                type="text"
                                                placeholder="Masukkan Hari"
                                                value={item.hari}
                                                onChange={(e) => updateCovidEpisode(index, 'hari', e.target.value)}
                                            />
                                            {covidEpisodesList.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={() => removeCovidEpisode(index)}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="text-green-500 hover:text-green-700"
                                                onClick={() => addCovidEpisode(index)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">Complexity</td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Checkbox id="ada_ventilator" checked={covid19CCIndonesia} onCheckedChange={setCovid19CCIndonesia} />
                                </td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">RS Darurat</td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Checkbox
                                        id="ada_ventilator"
                                        checked={covid19RsDaruratIndonesia}
                                        onCheckedChange={setCovid19RsDaruratIndonesia}
                                    />
                                </td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">Isolasi Mandiri</td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Checkbox id="ada_ventilator" checked={covidIsoman} onCheckedChange={setCovidIsoman} />
                                </td>
                                <td colSpan={2} className="border-r border-b border-l border-gray-300 px-4 py-2"></td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">Co-Insiden</td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Checkbox
                                        id="ada_ventilator"
                                        checked={covid19COInsidenseIndonesia}
                                        onCheckedChange={setCovid19InsidenseIndonesia}
                                    />
                                </td>
                                {covid19COInsidenseIndonesia ? (
                                    <>
                                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">SEP Covid</td>
                                        <td colSpan={5} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                            <Input
                                                id="ada_ventilator"
                                                type="text"
                                                placeholder="Masukan Nomor SEP Covid"
                                                value={covid19COinsidenseSEP}
                                                onChange={(e) => setCovid19COinsidenseSEP(e.target.value)}
                                            />
                                        </td>
                                    </>
                                ) : (
                                    <td colSpan={6} className="border-r border-b border-l border-gray-300 px-4 py-2"></td>
                                )}
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">Terapi Kovalen</td>
                                <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Input
                                        id="terapi_kovalen"
                                        type="text"
                                        placeholder="Masukan Jumlah Kantong"
                                        value={covidTerapiKovalen}
                                        onChange={(e) => setCovidTerapiKovalen(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">Kelahiran Bayi</td>
                                <td colSpan={7} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <SearchableDropdown
                                        data={listCovidBayiLahirStatus}
                                        value={covidBayiLahirStatus}
                                        setValue={setCovidBayiLahirStatus}
                                        placeholder="Pilih Episode Covid"
                                        getOptionLabel={(item) => (item && item.DESKRIPSI ? item.DESKRIPSI : '')}
                                        getOptionValue={(item) => (item && item.ID ? item.ID : '')}
                                    />
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">Asam Laktat</td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Checkbox id="asam_laktat" checked={covidLabAsamLaktat} onCheckedChange={setCovidLabAsamLaktat} />
                                </td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">Procalcitonin</td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Checkbox id="procalcitonin" checked={covidLabProcalcitonin} onCheckedChange={setCovidLabProcalcitonin} />
                                </td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">CRP</td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Checkbox id="CRP" checked={covidLabCRP} onCheckedChange={setCovidLabCRP} />
                                </td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">Kultur MO</td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Checkbox id=" Kultur_mo" checked={covidLabKultur} onCheckedChange={setCovidLabKultur} />
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">D Dimer</td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Checkbox id="dimer" checked={covidLabDDimer} onCheckedChange={setCovidLabDDimer} />
                                </td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">PT</td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Checkbox id="pt" checked={covidLabPT} onCheckedChange={setCovidLabPT} />
                                </td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">APTT</td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Checkbox id="APTT" checked={covidLabAPTT} onCheckedChange={setCovidLabAPTT} />
                                </td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">Pendarahan</td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Checkbox id=" pendarahan" checked={covidLabWaktuPendarahan} onCheckedChange={setCovidLabWaktuPendarahan} />
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">Anti HIV</td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Checkbox id="procalcitonin" checked={covidLabAntiHIV} onCheckedChange={setCovidLabAntiHIV} />
                                </td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">Analisa Gas</td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Checkbox id="analisa_gas" checked={covidLabAnalisaGas} onCheckedChange={setCovidLabAnalisaGas} />
                                </td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">Albumin</td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Checkbox id=" albumin" checked={covidLabAlbumin} onCheckedChange={setCovidLabAlbumin} />
                                </td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">Thorax AP/PA</td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Checkbox id="asam_laktat" checked={covidRadThoraxApPA} onCheckedChange={setCovidRadThoraxApPA} />
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">Pasien Meninggal</td>
                                <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                    <Checkbox id="ada_ventilator" checked={pasienMeninggal} onCheckedChange={setPasienMeninggal} />
                                </td>
                                <td colSpan={6} className="border-r border-b border-l border-gray-300 px-4 py-2"></td>
                            </tr>

                            {pasienMeninggal && (
                                <>
                                    <tr className="hover:bg-gray-50">
                                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Pemulasaran Jenazah</td>
                                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                            <Checkbox id="pemulasaran_jenazah" checked={pemulasaranJenazah} onCheckedChange={setPemulasaranJenazah} />
                                        </td>
                                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Kantong Jenazah</td>
                                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                            <Checkbox id="kantong_jenazah" checked={kantongJenazah} onCheckedChange={setKantongJenazah} />
                                        </td>
                                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Peti Jenazah</td>
                                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                            <Checkbox id="peti_jenazah" checked={petiJenazah} onCheckedChange={setPetiJenazah} />
                                        </td>
                                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Plastik Erat</td>
                                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                            <Checkbox id="plastik_erat" checked={plastikErat} onCheckedChange={setPlastikErat} />
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Disinfektan Jenazah</td>
                                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                            <Checkbox id="disinfektan_jenazah" checked={disinfektanJenazah} onCheckedChange={setDisinfektanJenazah} />
                                        </td>
                                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">Mobil Jenazah</td>
                                        <td className="border-r border-b border-l border-gray-300 px-4 py-2">
                                            <Checkbox id="mobil_jenazah" checked={mobilJenazah} onCheckedChange={setMobilJenazah} />
                                        </td>
                                        <td colSpan={2} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                            Disinfektan Mobil Jenazah
                                        </td>
                                        <td colSpan={2} className="border-r border-b border-l border-gray-300 px-4 py-2">
                                            <Checkbox
                                                id="disinfektan_mobil_jenazah"
                                                checked={disinfektanMobilJenazah}
                                                onCheckedChange={setDisinfektanMobilJenazah}
                                            />
                                        </td>
                                    </tr>
                                </>
                            )}
                        </>
                    )}
                </tbody>
            </table>

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
        </div>
    );
}
