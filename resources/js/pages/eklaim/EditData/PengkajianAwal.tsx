import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { use, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react"; // Tambahkan impor pustaka QR Code
import SignatureCanvas from "react-signature-canvas"; // Tambahkan impor pustaka Signature Canvas
import { router, usePage } from "@inertiajs/react";
import { set } from "date-fns";

interface PengkajianAwalProps {
    imageBase64: any;
    nomorKunjungan: any;
    dataResumeMedis: any; // Tambahkan tipe data yang sesuai jika perlu
}

export default function PengkajianAwal({ imageBase64, nomorKunjungan = null, dataResumeMedis }: PengkajianAwalProps) {

    const { success, error } = usePage().props;

    useEffect(() => {
        if (success) toast.success(success);
        if (error) toast.error(error);
    }, [success, error]);

    const [dataKlaim, setDataKlaim] = useState(usePage().props.pengajuanKlaim);
    const [editMode, setEditMode] = useState(dataKlaim.edit);

    // Ambil kunjungan_pasien dari penjamin, handle jika array/object/undefined
    const filteredKunjungan = (() => {
        if (editMode === 1 && dataKlaim.resume_medis_edit) {
            return [dataKlaim.resume_medis_edit];
        } else if (editMode === 0 && dataKlaim.penjamin) {
            const kunjunganPasienArr = Array.isArray(dataKlaim.penjamin.kunjungan_pasien)
                ? dataKlaim.penjamin.kunjungan_pasien
                : dataKlaim.penjamin.kunjungan_pasien
                    ? [dataKlaim.penjamin.kunjungan_pasien]
                    : [];
            return kunjunganPasienArr.filter(
                (k: any) =>
                    k?.ruangan &&
                    [1, 3, 17].includes(Number(k.ruangan.JENIS_KUNJUNGAN))
            );
        }
        return [];
    })();

    useEffect(() => {
        // filteredKunjungan selalu hasil dari dataKlaim, tidak pernah berubah akibat setState di bawah
        const k = (() => {
            if (editMode === 1 && dataKlaim.resume_medis_edit) {
                return dataKlaim.resume_medis_edit;
            } else if (editMode === 0 && dataKlaim.penjamin) {
                const kunjunganPasienArr = Array.isArray(dataKlaim.penjamin.kunjungan_pasien)
                    ? dataKlaim.penjamin.kunjungan_pasien
                    : dataKlaim.penjamin.kunjungan_pasien
                        ? [dataKlaim.penjamin.kunjungan_pasien]
                        : [];
                return kunjunganPasienArr.find(
                    (k: any) =>
                        k?.ruangan &&
                        [1, 3, 17].includes(Number(k.ruangan.JENIS_KUNJUNGAN))
                );
            }
            return null;
        })();

        if (!k) return;

        if (editMode === 1 && dataKlaim.resume_medis_edit) {
            const d = filteredKunjungan[0];
            console.log("Data :", d);
            setNamaPasien(d?.nama_pasien ?? "");
            setAlamat(d?.alamat ?? "");
            setTanggalMasuk(d?.tanggal_masuk ?? "");
            setRuangan(d?.pengkajian_awal_edit.ruangan ?? "");
            setNomorRM(d?.NORM ?? "");
            setTanggalLahir(d?.tanggal_lahir ?? "");
            setJenisKelamin(d?.jenis_kelamin ?? "");
            setAlamat(d.pengkajian_awal_edit?.alamat ?? "");

            setAutoAnamnesis(d.pengkajian_awal_edit?.anamnesa_edit?.anamnesa_diperoleh === "Auto Anamnesis" ? true : false);
            setAlloAnamnesis(d.pengkajian_awal_edit?.anamnesa_edit?.anamnesa_diperoleh !== "Auto Anamnesis" ? true : false);
            setDari(d.pengkajian_awal_edit?.anamnesa_edit?.anamnesa_diperoleh_dari ?? "");
            setKeluhanUtama(d.pengkajian_awal_edit?.anamnesa_edit?.keluhan_utama ?? "");
            setRiwayatPenyakit(d.pengkajian_awal_edit?.anamnesa_edit?.riwayat_penyakit_sekarang ?? "");
            setFaktorResiko(d.pengkajian_awal_edit?.anamnesa_edit?.riwayat_penyakit_dulu ?? "");
            setRiwayatPengobatan(d.pengkajian_awal_edit?.anamnesa_edit?.riwayat_pengobatan ?? "");
            setRiwayatPenyakitKeluarga(d.pengkajian_awal_edit?.anamnesa_edit?.riwayat_penyakit_keluarga ?? "");
            setKeadaanUmum(d.pengkajian_awal_edit?.keadaan_umum_edit.keadaan_umum ?? "");
            setTingkatKesadaran(d.pengkajian_awal_edit?.keadaan_umum_edit.tingkat_kesadaran ?? "");
            setGCS(d.pengkajian_awal_edit?.keadaan_umum_edit.GCS ?? "");
            setEye(d.pengkajian_awal_edit?.keadaan_umum_edit.eye ?? "");
            setMotorik(d.pengkajian_awal_edit?.keadaan_umum_edit.motorik ?? "");
            setVerbal(d.pengkajian_awal_edit?.keadaan_umum_edit.verbal ?? "");
            setTekananDarah(d.pengkajian_awal_edit?.keadaan_umum_edit.tekanan_darah ?? "");
            setFrekuensiNadi(d.pengkajian_awal_edit?.keadaan_umum_edit.frekuensi_nadi ?? "");
            setFrekuensiNafas(d.pengkajian_awal_edit?.keadaan_umum_edit.frekuensi_nafas ?? "");
            setSuhu(d.pengkajian_awal_edit?.keadaan_umum_edit.suhu ?? "");
            setBeratBadan(d.pengkajian_awal_edit?.keadaan_umum_edit.berat_badan ?? "");
            setSaturasiO2(d.pengkajian_awal_edit?.keadaan_umum_edit.saturasi_oksigen ?? "");

            setMata(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.mata ?? "");
            setIkterus(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.ikterus ?? "");
            setPupil(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.pupil ?? "");
            setDiameterMata(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.diameter_mata ?? "");
            setUdemapalpebrae(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.udem_palpebrae ?? "");
            setKelainanMata(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.kelainan_mata ?? "");
            setTHT(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.tht ?? "");
            setTongsil(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.tongsil ?? "");
            setFaring(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.faring ?? "");
            setLidah(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.lidah ?? "");
            setBibir(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.bibir ?? "");
            setLeher(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.leher ?? "");
            setJVP(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.jvp ?? "");
            setLimfe(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.limfe ?? "");
            setKakuKuduk(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.kaku_kuduk ?? "");
            setThoraks(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.thoraks ?? "");
            setCor(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.cor ?? "");
            setS1S2(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.s1s2 ?? "");
            setMurMur(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.mur_mur ?? "");
            setPulmo(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.pulmo ?? "");
            setSuaraNafas(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.suara_nafas ?? "");
            setRonchi(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.ronchi ?? "");
            setWheezing(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.wheezing ?? "");
            setAbdomen(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.abdomen ?? "");
            setMeteorismus(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.meteorismus ?? "");
            setPeristaltik(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.peristaltik ?? "");
            setAsites(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.asites ?? "");
            setNyeriTekan(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.nyeri_tekan ?? "");
            setHepar(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.hepar ?? "");
            setLien(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.lien ?? "");
            setExtremitas(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.extremitas ?? "");
            setUdem(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.udem ?? "");
            setDefeksesi(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.defeksesi ?? "");
            setUrin(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.urin ?? "");
            setPemeriksaanLainLain(d.pengkajian_awal_edit?.pemeriksaan_fisik_edit?.lain_lain ?? "");

            setRiwayatAlergi(d.pengkajian_awal_edit?.riwayat_alergi ?? "");
            setStatusPsikologis(d.pengkajian_awal_edit?.psikologi_edit?.status_psikologi ?? "");
            setStatusMental(d.pengkajian_awal_edit?.psikologi_edit?.status_mental ?? "");
            setHubunganKeluarga(d.pengkajian_awal_edit?.psikologi_edit?.hubungan_keluarga ?? "");
            setTempatTinggal(d.pengkajian_awal_edit?.psikologi_edit?.tempat_tinggal ?? "");
            setAgama(d.pengkajian_awal_edit?.psikologi_edit?.agama ?? "");
            setKebiasaanBeribadah(d.pengkajian_awal_edit?.psikologi_edit?.kebiasaan_beribadah ?? "");
            setPekerjaan(d.pengkajian_awal_edit?.psikologi_edit?.pekerjaan ?? "");
            setPenghasilan(d.pengkajian_awal_edit?.psikologi_edit?.penghasilan ?? "");

            setNyeri(d.pengkajian_awal_edit?.nyeri_edit?.nyeri ?? "");
            setOnsetNyeri(d.pengkajian_awal_edit?.nyeri_edit?.onset ?? "");
            setPencetusNyeri(d.pengkajian_awal_edit?.nyeri_edit?.pencetus ?? "");
            setLokasiNyeri(d.pengkajian_awal_edit?.nyeri_edit?.lokasi_nyeri ?? "");
            setGambaranNyeri(d.pengkajian_awal_edit?.nyeri_edit?.gambaran_nyeri ?? "");
            setDurasiNyeri(d.pengkajian_awal_edit?.nyeri_edit?.durasi ?? "");
            setSkalaNyeri(d.pengkajian_awal_edit?.nyeri_edit?.skala ?? "");
            setMetodeNyeri(d.pengkajian_awal_edit?.nyeri_edit?.metode ?? "");

            setResikoJatuh(d.pengkajian_awal_edit?.resiko_jatuh ?? "");
            setSkorResikoJatuh(d.pengkajian_awal_edit?.skor_resiko_jatuh ?? "");
            setMetodeResikoJatuh(d.pengkajian_awal_edit?.metode_penilaian_resiko_jatuh ?? "");

            setResikoDekubitas(d.pengkajian_awal_edit?.resiko_dekubitus ?? "");
            setSkorResikoDekubitas(d.pengkajian_awal_edit?.skor_resiko_dekubitus ?? "");

            setPenurunanBeratBadan(d.pengkajian_awal_edit?.penurunan_berat_badan ?? "");
            setPenurunanAsupan(d.pengkajian_awal_edit?.nafsu_makan ?? "");
            setDiagnosisKhusus(d.pengkajian_awal_edit?.diagnosa_khusus ?? "");

            setEdukasiPasien(d.pengkajian_awal_edit?.edukasi_pasien ?? "");

            setSkrinningDischargePlanning(d.pengkajian_awal_edit?.skrining_rencana_pulang ?? "");
            setFaktorResikoDischargePlanning(d.pengkajian_awal_edit?.faktor_risiko_rencana_pulang ?? "");
            setTindakLanjutDischargePlanning(d.pengkajian_awal_edit?.tindak_lanjut_rencana_pulang ?? "");

            setRencanaKeperawatan(d.pengkajian_awal_edit?.rencana_keperawatan ?? "");
            setDiagnosaKeperawatan(d.pengkajian_awal_edit?.diagnosa_medis ?? "");
            setMasalahMedis(d.pengkajian_awal_edit?.masalah_medis ?? "");
            setRencanaTerapi(d.pengkajian_awal_edit?.rencana_terapi ?? "");

            setNamaDokter(d.pengkajian_awal_edit?.nama_dokter ?? "");
            setTanggalTandaTangan(d?.tanggal_keluar ?? "");


        }
        // Jika dari kunjungan pasien
        else if (editMode === 0 && dataKlaim.penjamin) {
            const k = dataKlaim.penjamin.kunjungan_pasien?.[0]
                ?.gabung_tagihan?.kunjungan_pasien
                ?.find?.((kp: any) => kp?.ruangan?.JENIS_KUNJUNGAN === 2);

            if (!k) return;
            setNamaPasien(k.pendaftaran_pasien?.pasien.NAMA ?? "");
            setAlamat(k.pendaftaran_pasien?.pasien.ALAMAT ?? "");
            setTanggalMasuk(k?.MASUK ?? "");
            setRuangan(k.ruangan.DESKRIPSI ?? "");
            setNomorRM(k.pendaftaran_pasien?.pasien.NORM ?? "");
            setTanggalLahir(k.pendaftaran_pasien?.pasien.TANGGAL_LAHIR ?? "");
            setJenisKelamin(k.pendaftaran_pasien?.pasien.JENIS_KELAMIN == 1 ? "Laki-laki" : "Perempuan");

            // Data Anamnesa
            if (k.anamnesis_pasien_diperoleh?.AUTOANAMNESIS == 1) {
                setAutoAnamnesis(true);
                setAlloAnamnesis(false);
            } else if (k.anamnesis_pasien_diperoleh?.ALLOANAMNESIS == 1) {
                setAutoAnamnesis(false);
                setAlloAnamnesis(true);
            }
            setDari(k.anamnesis_pasien_diperoleh?.DARI ?? "");
            setKeluhanUtama(k.keluhan_utama?.DESKRIPSI ?? "");
            setRiwayatPenyakit(k.anamnesis_pasien?.DESKRIPSI ?? "");
            setFaktorResiko(k.rpp?.DESKRIPSI ?? "");

            const riwayatOrderObatPasien = k.order_resep?.map((item: any) => item.order_resep_detil)
            const getNamaRiwayatObat = riwayatOrderObatPasien?.map((item: any) =>
                item.map((detail: any) => detail.nama_obat.NAMA).join(", ")
            ).join(", ") || "";

            setRiwayatPengobatan(getNamaRiwayatObat);
            setRiwayatPenyakitKeluarga(k.riwayat_penyakit_keluarga?.DESKRIPSI ?? "");

            // Data Keadaan Umum
            setKeadaanUmum(k.tanda_vital?.KEADAAN_UMUM ?? "");
            setTingkatKesadaran(k.tanda_vital?.KESADARAN ?? "");
            setGCS(k.tanda_vital?.GCS ?? "");
            setEye(k.tanda_vital?.EYE ?? "");
            setMotorik(k.tanda_vital?.MOTORIK ?? "");
            setVerbal(k.tanda_vital?.VERBAL ?? "");
            setTekananDarah(k.tanda_vital ? `${Math.ceil(k.tanda_vital.SISTOLIK)}/${Math.ceil(k.tanda_vital.DISTOLIK)}` : "");
            setFrekuensiNadi(k.tanda_vital?.FREKUENSI_NADI ?? "");
            setFrekuensiNafas(k.tanda_vital?.FREKUENSI_NAFAS ?? "");
            setSuhu(k.tanda_vital?.SUHU ?? "");
            setBeratBadan(k.tanda_vital?.BERAT_BADAN ?? "");
            setSaturasiO2(k.tanda_vital?.SATURASI_O2 ?? "");

            const riwayatAlergiPasien = k.riwayat_alergi?.map((item: any) => item.DESKRIPSI).join(", ");
            setRiwayatAlergi(riwayatAlergiPasien);
            setMasalahMedis(k.anamnesis_pasien?.DESKRIPSI ?? "");

            const diagnosaPasien = k.diagnosa_pasien?.map((item: any) => item.nama_diagnosa.STR + " (" + item.KODE + ")").join(", ");
            setDiagnosaKeperawatan(diagnosaPasien);

            setRencanaTerapi(k.rencana_terapi?.DESKRIPSI ?? "");
            setNamaDokter((k.dokter_d_p_j_p?.GELAR_DEPAN ? k.dokter_d_p_j_p?.GELAR_DEPAN + "." : "") + k.dokter_d_p_j_p?.NAMA + (k.dokter_d_p_j_p?.GELAR_BELAKANG ? " " + k.dokter_d_p_j_p?.GELAR_BELAKANG : ""));
            setTanggalTandaTangan(formatTanggalIndo(k.MASUK) ?? "");

        }

    }, [editMode, dataKlaim]);

    // State untuk data administrasi pasien
    const [ruangan, setRuangan] = useState("");
    const [tanggalMasuk, setTanggalMasuk] = useState("");
    const [namaPasien, setNamaPasien] = useState("");
    const [alamat, setAlamat] = useState("");
    const [nomorRM, setNomorRM] = useState("");
    const [tanggalLahir, setTanggalLahir] = useState("");
    const [jenisKelamin, setJenisKelamin] = useState("");

    // State untuk data anamnesa
    const [keluhanUtama, setKeluhanUtama] = useState("");
    const [riwayatPenyakit, setRiwayatPenyakit] = useState("");
    const [faktorResiko, setFaktorResiko] = useState("");
    const [riwayatPengobatan, setRiwayatPengobatan] = useState("");
    const [riwayatPenyakitKeluarga, setRiwayatPenyakitKeluarga] = useState("");
    const [autoAnamnesis, setAutoAnamnesis] = useState(false);
    const [alloAnamnesis, setAlloAnamnesis] = useState(false);
    const [dari, setDari] = useState("");

    // State untuk data keadaan umum
    const [keadaanUmum, setKeadaanUmum] = useState("");
    const [tingkatKesadaran, setTingkatKesadaran] = useState("");
    const [gcs, setGCS] = useState("");
    const [eye, setEye] = useState("");
    const [motorik, setMotorik] = useState("");
    const [verbal, setVerbal] = useState("");
    const [tekananDarah, setTekananDarah] = useState("");
    const [frekuensiNadi, setFrekuensiNadi] = useState("");
    const [frekuensiNafas, setFrekuensiNafas] = useState("");
    const [suhu, setSuhu] = useState("");
    const [beratBadan, setBeratBadan] = useState("");
    const [saturasiO2, setSaturasiO2] = useState("");

    // State untuk data pemeriksaan fisik
    const [mata, setMata] = useState("");
    const [ikterus, setIkterus] = useState("");
    const [pupil, setPupil] = useState("");
    const [diameterMata, setDiameterMata] = useState("");
    const [udemaPalpebrae, setUdemapalpebrae] = useState("");
    const [kelainanMata, setKelainanMata] = useState("");
    const [tht, setTHT] = useState("");
    const [tongsil, setTongsil] = useState("");
    const [faring, setFaring] = useState("");
    const [lidah, setLidah] = useState("");
    const [bibir, setBibir] = useState("");
    const [leher, setLeher] = useState("");
    const [jvp, setJVP] = useState("");
    const [limfe, setLimfe] = useState("");
    const [kakuKuduk, setKakuKuduk] = useState("");
    const [thoraks, setThoraks] = useState("");
    const [cor, setCor] = useState("");
    const [s1S2, setS1S2] = useState("");
    const [murMur, setMurMur] = useState("");
    const [pulmo, setPulmo] = useState("");
    const [suaraNafas, setSuaraNafas] = useState("");
    const [ronchi, setRonchi] = useState("");
    const [wheezing, setWheezing] = useState("");
    const [abdomen, setAbdomen] = useState("");
    const [meteorismus, setMeteorismus] = useState("");
    const [peristaltik, setPeristaltik] = useState("");
    const [asites, setAsites] = useState("");
    const [nyeriTekan, setNyeriTekan] = useState("");
    const [hepar, setHepar] = useState("");
    const [lien, setLien] = useState("");
    const [extremitas, setExtremitas] = useState("");
    const [udem, setUdem] = useState("");
    const [defeksesi, setDefeksesi] = useState("");
    const [urin, setUrin] = useState("");
    const [pemeriksaanLainLain, setPemeriksaanLainLain] = useState("");

    // State untuk status psiokososial
    const [statusPsikologis, setStatusPsikologis] = useState("");
    const [statusMental, setStatusMental] = useState("");
    const [hubunganKeluarga, setHubunganKeluarga] = useState("");
    const [tempatTinggal, setTempatTinggal] = useState("");
    const [agama, setAgama] = useState("");
    const [kebiasaanBeribadah, setKebiasaanBeribadah] = useState("");
    const [pekerjaan, setPekerjaan] = useState("");
    const [penghasilan, setPenghasilan] = useState("");

    // State untuk riwayat alergi
    const [riwayatAlergi, setRiwayatAlergi] = useState("");

    // State untuk penilaian nyeri
    const [nyeri, setNyeri] = useState("");
    const [onsetNyeri, setOnsetNyeri] = useState("");
    const [pencetusNyeri, setPencetusNyeri] = useState("");
    const [lokasiNyeri, setLokasiNyeri] = useState("");
    const [gambaranNyeri, setGambaranNyeri] = useState("");
    const [durasiNyeri, setDurasiNyeri] = useState("");
    const [skalaNyeri, setSkalaNyeri] = useState("");
    const [metodeNyeri, setMetodeNyeri] = useState("");

    // State untuk resiko jatuh
    const [resikoJatuh, setResikoJatuh] = useState("");
    const [skorResikoJatuh, setSkorResikoJatuh] = useState("");
    const [metodeResikoJatuh, setMetodeResikoJatuh] = useState("");


    // State untuk resiko dekubitas
    const [resikoDekubitas, setResikoDekubitas] = useState("");
    const [skorResikoDekubitas, setSkorResikoDekubitas] = useState("");

    // State untuk resiko gizi
    const [penurunanBeratBadan, setPenurunanBeratBadan] = useState("");
    const [penurunanAsupan, setPenurunanAsupan] = useState("");
    const [diagnosisKhusus, setDiagnosisKhusus] = useState("");

    // State edukasi pasien
    const [edukasiPasien, setEdukasiPasien] = useState("");

    // State untuk discharge planning
    const [skrinningDischargePlanning, setSkrinningDischargePlanning] = useState("");
    const [faktorResikoDischargePlanning, setFaktorResikoDischargePlanning] = useState("");
    const [tindakLanjutDischargePlanning, setTindakLanjutDischargePlanning] = useState("");

    // State untuk rencana keperawatan
    const [rencanaKeperawatan, setRencanaKeperawatan] = useState("");

    // State untuk diagnosa keperawatan
    const [diagnosaKeperawatan, setDiagnosaKeperawatan] = useState("");

    // State untuk masalah medis
    const [masalahMedis, setMasalahMedis] = useState("");

    // State untuk rencana terapi
    const [rencanaTerapi, setRencanaTerapi] = useState("");

    const [namaDokter, setNamaDokter] = useState(""); // State untuk nama dokter
    const [tanggalTandaTangan, setTanggalTandaTangan] = useState(""); // State untuk tanggal tanda tangan

    const handleSave = async () => {
        try {
            // Kumpulkan semua data form
            const pengkajianData = {
                // Nomor kunjungan
                nomor_kunjungan: nomorKunjungan,

                // 1. Data administrasi pasien
                ruangan,
                tanggal_masuk: tanggalMasuk,
                nama_pasien: namaPasien,
                alamat,
                nomor_rm: nomorRM,
                tanggal_lahir: tanggalLahir,
                jenis_kelamin: jenisKelamin,

                // 2. Data anamnesa
                anamnesis: {
                    auto_anamnesis: autoAnamnesis,
                    allo_anamnesis: alloAnamnesis,
                    dari: dari,
                    keluhan_utama: keluhanUtama,
                    riwayat_penyakit_sekarang: riwayatPenyakit,
                    riwayat_penyakit_lalu: faktorResiko,
                    riwayat_pengobatan: riwayatPengobatan,
                    riwayat_penyakit_keluarga: riwayatPenyakitKeluarga,
                },

                // 3. Data keadaan umum dan tanda vital
                tanda_vital: {
                    tingkat_kesadaran: tingkatKesadaran,
                    keadaan_umum: keadaanUmum,
                    gcs,
                    eye,
                    motorik,
                    verbal,
                    tekanan_darah: tekananDarah,
                    frekuensi_nadi: frekuensiNadi,
                    frekuensi_nafas: frekuensiNafas,
                    suhu,
                    berat_badan: beratBadan,
                    saturasi_o2: saturasiO2,
                },

                // 4. Data pemeriksaan fisik
                pemeriksaan_fisik: {
                    mata,
                    ikterus,
                    pupil,
                    diameter_mata: diameterMata,
                    udem_palpebrae: udemaPalpebrae,
                    kelainan_mata: kelainanMata,
                    tht,
                    tongsil,
                    faring,
                    lidah,
                    bibir,
                    leher,
                    jvp,
                    limfe,
                    kaku_kuduk: kakuKuduk,
                    thoraks,
                    cor,
                    s1s2: s1S2,
                    murmur: murMur,
                    pulmo,
                    suara_nafas: suaraNafas,
                    ronchi,
                    wheezing,
                    abdomen,
                    meteorismus,
                    peristaltik,
                    asites,
                    nyeri_tekan: nyeriTekan,
                    hepar,
                    lien,
                    extremitas,
                    udem,
                    defeksesi,
                    urin,
                    pemeriksaan_lain_lain: pemeriksaanLainLain,
                },

                // 5. Data status psikososial
                status_psikososial: {
                    status_psikologis: statusPsikologis,
                    status_mental: statusMental,
                    hubungan_keluarga: hubunganKeluarga,
                    tempat_tinggal: tempatTinggal,
                    agama,
                    kebiasaan_beribadah: kebiasaanBeribadah,
                    pekerjaan,
                    penghasilan,
                },

                // 6. Riwayat alergi
                riwayat_alergi: riwayatAlergi,

                // 7. Data penilaian nyeri
                penilaian_nyeri: {
                    nyeri,
                    onset: onsetNyeri,
                    pencetus: pencetusNyeri,
                    lokasi: lokasiNyeri,
                    gambaran: gambaranNyeri,
                    durasi: durasiNyeri,
                    skala: skalaNyeri,
                    metode: metodeNyeri,
                },

                // 8. Data resiko jatuh
                resiko_jatuh: {
                    resiko: resikoJatuh,
                    skor: skorResikoJatuh,
                    metode: metodeResikoJatuh,
                },

                // 9. Data resiko dekubitas
                resiko_dekubitas: {
                    resiko: resikoDekubitas,
                    skor: skorResikoDekubitas,
                },

                // 10. Data resiko gizi
                resiko_gizi: {
                    penurunan_berat_badan: penurunanBeratBadan,
                    penurunan_asupan: penurunanAsupan,
                    diagnosis_khusus: diagnosisKhusus,
                },

                // 11. Edukasi pasien
                edukasi_pasien: edukasiPasien,

                // 12. Discharge planning
                discharge_planning: {
                    skrinning: skrinningDischargePlanning,
                    faktor_resiko: faktorResikoDischargePlanning,
                    tindak_lanjut: tindakLanjutDischargePlanning,
                },

                // 13. Rencana keperawatan
                rencana_keperawatan: rencanaKeperawatan,

                // 14. Diagnosa keperawatan
                diagnosa_keperawatan: diagnosaKeperawatan,

                // 15. Masalah medis
                masalah_medis: masalahMedis,

                // 16. Rencana terapi
                rencana_terapi: rencanaTerapi,

                // 17. Data tanda tangan dan dokter
                nama_dokter: namaDokter,
                tanggal_tanda_tangan: tanggalTandaTangan,
                tanda_tangan: signatureData,
            };

            // Dengan definisi yang lebih eksplisit seperti ini:
            const resumeMedis = {
                // Data Administrasi
                id_pengajuan_klaim: dataResumeMedis?.id_pengajuan_klaim ?? null,
                tanggal_masuk: dataResumeMedis?.tanggal_masuk ?? null,
                tanggal_keluar: dataResumeMedis?.tanggal_keluar ?? null,
                lama_dirawat: dataResumeMedis?.lama_dirawat ?? null,

                // Data Anamnesa & Pemeriksaan Fisik
                riwayat_penyakit_sekarang: dataResumeMedis?.riwayat_penyakit_sekarang ?? null,
                riwayat_penyakit_lalu: dataResumeMedis?.riwayat_penyakit_lalu ?? null,
                pemeriksaan_fisik: dataResumeMedis?.pemeriksaan_fisik ?? null,

                // Data Konsultasi
                permintaan_konsul: dataResumeMedis?.permintaan_konsul ?? [],

                // Data Diagnosa & Tindakan
                diagnosa_utama: dataResumeMedis?.diagnosa_utama ?? null,
                icd10_utama: dataResumeMedis?.icd10_utama ?? null,
                tindakan_prosedur: dataResumeMedis?.tindakan_prosedur ?? null,
                icd9_utama: dataResumeMedis?.icd9_utama ?? null,
                diagnosa_sekunder: dataResumeMedis?.diagnosa_sekunder ?? null,
                icd10_sekunder: dataResumeMedis?.icd10_sekunder ?? null,
                tindakan_prosedur_sekunder: dataResumeMedis?.tindakan_prosedur_sekunder ?? null,
                icd9_sekunder: dataResumeMedis?.icd9_sekunder ?? null,

                // Data Alergi & Status Pulang
                riwayat_alergi: dataResumeMedis?.riwayat_alergi ?? null,
                keadaan_pulang: dataResumeMedis?.keadaan_pulang ?? null,
                cara_pulang: dataResumeMedis?.cara_pulang ?? null,

                // Data Obat & Terapi
                obat: dataResumeMedis?.obat ?? null,
                terapi_pulang: dataResumeMedis?.terapi_pulang ?? [],

                // Tanda tangan & metadata
                tanda_tangan: dataResumeMedis?.tanda_tangan ?? null,
                timestamp: dataResumeMedis?.timestamp ?? new Date().toISOString(),
                user_id: dataResumeMedis?.user_id ?? null,

                // Data Kunjungan
                filtered_kunjungan: dataResumeMedis?.filtered_kunjungan ?? [],

                // Apapun properti lain yang ada di dataResumeMedis
                ...dataResumeMedis
            };

            // Kirim data ke server
            const response = await axios.post(route("eklaim.editData.storeResumeMedis"), { jenisSave: dataKlaim.edit, resumeMedis: resumeMedis, pengkajianAwal: pengkajianData });
            if (response.data.success) {
                toast.success(response.data.success);
                window.location.reload(); // Reload halaman setelah sukses
            }
            if (response.data.error) toast.error(response.data.error);
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.error) {
                toast.error(error.response.data.error);
            } else if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error(error.response.message || "Terjadi kesalahan saat menyimpan data.");
            }
            console.error("Error saving data:", error);
        }
    };

    // Tambahkan fungsi ini di dalam komponen PengkajianAwal

    // const handleLoadData = async () => {
    //     console.log("Memuat data pengkajian awal untuk nomor kunjungan:", nomorKunjungan);
    //     try {
    //         const response = await axios.get(
    //             route("eklaim.loadDataPengkajianAwalRIRD", {
    //                 nomorKunjungan: nomorKunjungan,
    //             })
    //         );
    //         const data = response.data.kunjungan;
    //         console.log(data);
    //         toast.success("Data pengkajian awal berhasil dimuat.");

    //         // Data Administrasi Pasien
    //         setNamaPasien(data.pendaftaran_pasien?.pasien.NAMA ?? "");
    //         setAlamat(data.pendaftaran_pasien?.pasien.ALAMAT ?? "");
    //         setTanggalMasuk(data?.MASUK ?? "");
    //         setRuangan(data.ruangan.DESKRIPSI ?? "");
    //         setNomorRM(data.pendaftaran_pasien?.pasien.NORM ?? "");
    //         setTanggalLahir(data.pendaftaran_pasien?.pasien.TANGGAL_LAHIR ?? "");
    //         setJenisKelamin(data.pendaftaran_pasien?.pasien.JENIS_KELAMIN == 1 ? "Laki-laki" : "Perempuan");

    //         // Data Anamnesa
    //         if (data.anamnesis_pasien_diperoleh?.AUTOANAMNESIS == 1) {
    //             setAutoAnamnesis(true);
    //             setAlloAnamnesis(false);
    //         } else if (data.anamnesis_pasien_diperoleh?.ALLOANAMNESIS == 1) {
    //             setAutoAnamnesis(false);
    //             setAlloAnamnesis(true);
    //         }
    //         setDari(data.anamnesis_pasien_diperoleh?.DARI ?? "");
    //         setKeluhanUtama(data.keluhan_utama?.DESKRIPSI ?? "");
    //         setRiwayatPenyakit(data.anamnesis_pasien?.DESKRIPSI ?? "");
    //         setFaktorResiko(data.rpp.DESKRIPSI ?? "");

    //         const riwayatOrderObatPasien = data.order_resep?.map((item: any) => item.order_resep_detil)
    //         const getNamaRiwayatObat = riwayatOrderObatPasien?.map((item: any) =>
    //             item.map((detail: any) => detail.nama_obat.NAMA).join(", ")
    //         ).join(", ") || "";

    //         setRiwayatPengobatan(getNamaRiwayatObat);
    //         setRiwayatPenyakitKeluarga(data.riwayat_penyakit_keluarga?.DESKRIPSI ?? "");

    //         // Data Keadaan Umum
    //         setKeadaanUmum(data.tanda_vital?.KEADAAN_UMUM ?? "");
    //         setTingkatKesadaran(data.tanda_vital?.KESADARAN ?? "");
    //         setGCS(data.tanda_vital?.GCS ?? "");
    //         setEye(data.tanda_vital?.EYE ?? "");
    //         setMotorik(data.tanda_vital?.MOTORIK ?? "");
    //         setVerbal(data.tanda_vital?.VERBAL ?? "");
    //         setTekananDarah(data.tanda_vital ? `${Math.ceil(data.tanda_vital.SISTOLIK)}/${Math.ceil(data.tanda_vital.DISTOLIK)}` : "");
    //         setFrekuensiNadi(data.tanda_vital?.FREKUENSI_NADI ?? "");
    //         setFrekuensiNafas(data.tanda_vital?.FREKUENSI_NAFAS ?? "");
    //         setSuhu(data.tanda_vital?.SUHU ?? "");
    //         setBeratBadan(data.tanda_vital?.BERAT_BADAN ?? "");
    //         setSaturasiO2(data.tanda_vital?.SATURASI_O2 ?? "");

    //         const riwayatAlergiPasien = data.riwayat_alergi?.map((item: any) => item.DESKRIPSI).join(", ");
    //         setRiwayatAlergi(riwayatAlergiPasien);
    //         setMasalahMedis(data.anamnesis_pasien?.DESKRIPSI ?? "");

    //         const diagnosaPasien = data.diagnosa_pasien?.map((item: any) => item.nama_diagnosa.STR + " (" + item.KODE + ")").join(", ");
    //         setDiagnosaKeperawatan(diagnosaPasien);

    //         setRencanaTerapi(data.rencana_terapi?.DESKRIPSI ?? "");
    //         setNamaDokter((data.dokter_d_p_j_p?.GELAR_DEPAN ? data.dokter_d_p_j_p?.GELAR_DEPAN + "." : "") + data.dokter_d_p_j_p?.NAMA + (data.dokter_d_p_j_p?.GELAR_BELAKANG ? " " + data.dokter_d_p_j_p?.GELAR_BELAKANG : ""));
    //         setTanggalTandaTangan(formatTanggalIndo(data.MASUK) ?? "");

    //     } catch (error) {
    //         console.error(error);
    //         toast.error("Gagal memuat data pengkajian awal.");
    //         // Bisa juga tampilkan notifikasi error di sini
    //     }
    // }

    const [showSignaturePad, setShowSignaturePad] = useState(false); // State untuk menampilkan pad tanda tangan
    const [signatureData, setSignatureData] = useState<string | null>(null); // State untuk menyimpan tanda tangan

    const handleClearSignature = (sigCanvas: SignatureCanvas) => {
        sigCanvas.clear();
        setSignatureData(null);
    };

    const handleSaveSignature = (sigCanvas: SignatureCanvas) => {
        const dataURL = sigCanvas.toDataURL(); // Simpan tanda tangan sebagai data URL
        setSignatureData(dataURL);
        setShowSignaturePad(false); // Sembunyikan pad tanda tangan setelah disimpan
        toast.success("Tanda tangan berhasil disimpan.");
    };

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

    return (
        <div className="pt-4">
            <table style={{ fontFamily: "halvetica, sans-serif", width: "100%", borderCollapse: "collapse", border: "1px solid #000" }}>
                <tbody>
                    <tr>
                        <td colSpan={2}>
                            {/* Gunakan data Base64 untuk menampilkan gambar */}
                            <center>
                                <img
                                    src={imageBase64}
                                    alt="Logo Klinik"
                                    style={{ width: 50, height: 50 }}
                                />
                            </center>
                        </td>
                        <td colSpan={4}>
                            <div style={{ lineHeight: "1.2" }}>
                                <h3 style={{ fontSize: 20, textAlign: "left", }}>
                                    KLINIK RAWAT INAP UTAMA MUHAMMADIYAH KEDUNGADEM
                                </h3>
                                <p style={{ fontSize: 12, textAlign: "left", }}>
                                    Jl. PUK Desa Drokilo. Kec. Kedungadem Kab. Bojonegoro <br />
                                    Email : klinik.muh.kedungadem@gmail.com | WA : 082242244646 <br />
                                </p>
                            </div>
                        </td>
                        {/* <td>
                            <div className="flex justify-end h-full p-4">
                                <Button
                                    variant={"outline"}
                                    onClick={handleLoadData}
                                    className="h-8 w-24 bg-blue-500 text-white hover:bg-blue-600"
                                >
                                    Load
                                </Button>
                            </div>
                        </td> */}
                    </tr>
                    <tr style={{ background: "black", color: "white", textAlign: "center" }}>
                        <td colSpan={8}>
                            <h3 style={{ fontSize: 16 }}>PENGKAJIAN AWAL RAWAT DARURAT / RAWAT INAP</h3>
                        </td>
                    </tr>
                </tbody>
            </table>
            <table style={{ fontFamily: "halvetica, sans-serif", width: "100%", borderCollapse: "collapse", border: "1px solid #000" }}>
                <tr style={{ borderBottom: "1px solid #000" }}>
                    <td colSpan={4} style={{ padding: "5px", textAlign: "left" }}>
                        <div className="flex items-center gap-2">
                            <label htmlFor="ruangan" className="whitespace-nowrap">
                                Ruangan
                            </label>
                            <Input
                                id="ruangan"
                                type="text"
                                value={ruangan}
                                onChange={(e) => setRuangan(e.target.value)}
                                placeholder="Masukkan Ruangan"
                                className="border border-gray-300 rounded-md"
                                style={{ width: "200px" }} // Atur lebar input
                            />
                        </div>
                    </td>
                    <td colSpan={2} style={{ padding: "5px", textAlign: "left" }}>
                        <div className="flex items-center gap-2">
                            <label htmlFor="tanggal_masuk" className="whitespace-nowrap">
                                Tanggal Masuk
                            </label>
                            <Input
                                id="tanggal_masuk"
                                type="datetime-local"
                                value={tanggalMasuk}
                                onChange={(e) => setTanggalMasuk(e.target.value)}
                                placeholder="Masukkan Tanggal Masuk"
                                className="border border-gray-300 rounded-md"
                                style={{ width: "200px" }} // Atur lebar input
                            />
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colSpan={4} style={{ padding: "5px", textAlign: "left" }}>
                        <div className="flex items-center gap-2">
                            <label htmlFor="nama_pasien" className="whitespace-nowrap">
                                Nama Pasien
                            </label>
                            <Input
                                id="nama_pasien"
                                type="text"
                                value={namaPasien}
                                onChange={(e) => setNamaPasien(e.target.value)}
                                placeholder="Masukkan Nama Pasien"
                                className="border border-gray-300 rounded-md"
                                style={{ width: "300px" }} // Atur lebar input
                            />
                        </div>
                    </td>
                    <td colSpan={4} style={{ padding: "5px", textAlign: "left" }}>
                        <div className="flex items-center gap-2">
                            <label htmlFor="alamat" className="whitespace-nowrap">
                                Alamat
                            </label>
                            <Input
                                id="alamat"
                                type="text"
                                value={alamat}
                                onChange={(e) => setAlamat(e.target.value)}
                                placeholder="Masukkan Alamat"
                                className="border border-gray-300 rounded-md"
                                style={{ width: "300px" }} // Atur lebar input
                            />
                        </div>
                    </td>
                </tr>

                <tr style={{ borderBottom: "1px solid #000" }}>
                    <td colSpan={3} style={{ textAlign: "left", padding: "5px" }}>
                        <div className="flex items-center gap-2">
                            <label htmlFor="nomor_rm" className="whitespace-nowrap">
                                No. RM
                            </label>
                            <Input
                                id="nomor_rm"
                                type="text"
                                value={nomorRM}
                                onChange={(e) => setNomorRM(e.target.value)}
                                placeholder="Masukkan Nomor RM"
                                className="border border-gray-300 rounded-md"
                            />
                        </div>
                    </td>
                    <td colSpan={2} style={{ textAlign: "left", padding: "5px" }}>
                        <div className="flex items-center gap-2">
                            <label htmlFor="tanggal_lahir" className="whitespace-nowrap">
                                Tanggal Lahir
                            </label>
                            <Input
                                id="tanggal_lahir"
                                type="datetime-local"
                                value={tanggalLahir}
                                onChange={(e) => setTanggalLahir(e.target.value)}
                                placeholder="Masukkan Tanggal Lahir"
                                className="border border-gray-300 rounded-md"
                            />
                        </div>
                    </td>
                    <td colSpan={3} style={{ textAlign: "left", padding: "5px" }}>
                        <div className="flex items-center gap-2">
                            <label htmlFor="jenis_kelamin" className="whitespace-nowrap">
                                Jenis Kelamin
                            </label>
                            <Input
                                id="jenis_kelamin"
                                value={jenisKelamin}
                                onChange={(e) => setJenisKelamin(e.target.value)}
                                type="text"
                                placeholder="Masukkan Jenis Kelamin"
                                className="border border-gray-300 rounded-md"
                            />
                        </div>
                    </td>
                </tr>

                {/* ANAMNESA */}
                <tr style={{ borderBottom: "1px solid #000" }}>
                    <td colSpan={8} style={{ textAlign: "left", padding: "5px" }}>
                        <div>
                            <u className="text-xl font-bold">Anamnesa</u>
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-4">
                            <div>
                                Diperoleh secara :
                                <Checkbox
                                    id="autoanamnesis"
                                    className="mr-2"
                                    checked={autoAnamnesis}
                                    onCheckedChange={(checked: boolean) => {
                                        setAutoAnamnesis(checked);
                                        if (checked) setAlloAnamnesis(false);
                                    }}
                                />
                                <span className="ml-2">Autoanamnesis</span>
                                <Checkbox
                                    id="alloanamnesis"
                                    className="mr-2"
                                    checked={alloAnamnesis}
                                    onCheckedChange={(checked: boolean) => {
                                        setAlloAnamnesis(checked);
                                        if (checked) setAutoAnamnesis(false);
                                    }}
                                />
                                <span className="ml-2">Alloanamnesis</span>,
                            </div>

                            <div className="flex">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="dari" className="whitespace-nowrap">
                                        Dari :
                                    </label>
                                    <Input
                                        id="dari"
                                        type="text"
                                        value={dari}
                                        onChange={(e) => setDari(e.target.value)}
                                        placeholder="Masukkan Dari"
                                        className="border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-1 items-center p-2"> {/* Kurangi gap dan padding */}
                            <div className="whitespace-nowrap pl-4">
                                1. Keluhan Utama
                            </div>

                            <div className="col-span-3 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="keluhan_utama"
                                    value={keluhanUtama}
                                    onChange={(e) => setKeluhanUtama(e.target.value)}
                                    type="text"
                                    placeholder="Masukkan Keluhan Utama"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-1 items-center p-2"> {/* Kurangi gap dan padding */}
                            <div className="whitespace-nowrap pl-4">
                                2. Riwayat Penyakit Sekarang
                            </div>

                            <div className="col-span-3 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="riwayat_penyakit"
                                    value={riwayatPenyakit}
                                    onChange={(e) => setRiwayatPenyakit(e.target.value)}
                                    type="text"
                                    placeholder="Masukkan Riwayat Penyakit"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-1 items-center p-2"> {/* Kurangi gap dan padding */}
                            <div className="whitespace-nowrap pl-4">
                                3. Riwayat Penyakit Dahulu/Faktor Resiko
                            </div>

                            <div className="col-span-3 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="faktor_resiko"
                                    type="text"
                                    value={faktorResiko}
                                    onChange={(e) => setFaktorResiko(e.target.value)}
                                    placeholder="Masukkan Faktor Resiko"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-1 items-center p-2"> {/* Kurangi gap dan padding */}
                            <div className=" pl-4">
                                4. Riwayat Pengobatan (Termasuk obat yang sedang dikonsumsi)
                            </div>

                            <div className="col-span-3 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="riwayat_pengobatan"
                                    type="text"
                                    value={riwayatPengobatan}
                                    onChange={(e) => setRiwayatPengobatan(e.target.value)}
                                    placeholder="Masukkan Riwayat Pengobatan"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-1 items-center p-2"> {/* Kurangi gap dan padding */}
                            <div className=" pl-4">
                                5. Riwayat Penyakit Keluarga
                            </div>

                            <div className="col-span-3 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="riwayat_penyakit_keluarga"
                                    type="text"
                                    value={riwayatPenyakitKeluarga}
                                    onChange={(e) => setRiwayatPenyakitKeluarga(e.target.value)}
                                    placeholder="Masukkan Riwayat Penyakit Keluarga"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>
                    </td>
                </tr>

                {/* KEADAAN UMUM */}
                <tr style={{ borderBottom: "1px solid #000" }}>
                    <td colSpan={8} style={{ textAlign: "left", padding: "5px" }}>
                        <div>
                            <u className="text-xl font-bold">Keadaan Umum</u>
                        </div>

                        <div className="grid grid-cols-4 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4">
                                Keadaan Umum
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="keadaan_umum"
                                    type="text"
                                    value={keadaanUmum}
                                    onChange={(e) => setKeadaanUmum(e.target.value)}
                                    placeholder="Masukkan Keadaan Umum"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                            <div className="whitespace-nowrap pl-4">
                                Tingkat Kesadaran
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="tingkat_kesadaran"
                                    type="text"
                                    value={tingkatKesadaran}
                                    onChange={(e) => setTingkatKesadaran(e.target.value)}
                                    placeholder="Masukkan Tingkat Kesadaran"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-8 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4">
                                GCS
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="gcs"
                                    type="text"
                                    value={gcs}
                                    onChange={(e) => setGCS(e.target.value)}
                                    placeholder="Masukkan GCS"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Eye
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="eye"
                                    type="text"
                                    value={eye}
                                    onChange={(e) => setEye(e.target.value)}
                                    placeholder="Masukkan Eye"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Motorik
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="motorik"
                                    type="text"
                                    value={motorik}
                                    onChange={(e) => setMotorik(e.target.value)}
                                    placeholder="Masukkan Motorik"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Verbal
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="verbal"
                                    type="text"
                                    value={verbal}
                                    onChange={(e) => setVerbal(e.target.value)}
                                    placeholder="Masukkan Verbal"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4">
                                Tekanan Darah
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="tekanan_darah"
                                    type="text"
                                    value={tekananDarah}
                                    onChange={(e) => setTekananDarah(e.target.value)}
                                    placeholder="Masukkan Tekanan Darah"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Frekuensi Nadi
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="frekuensi_nadi"
                                    type="text"
                                    value={frekuensiNadi}
                                    onChange={(e) => setFrekuensiNadi(e.target.value)}
                                    placeholder="Masukkan Frekuensi Nadi"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Frekuensi Nafas
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="frekuensi_nafas"
                                    type="text"
                                    value={frekuensiNafas}
                                    onChange={(e) => setFrekuensiNafas(e.target.value)}
                                    placeholder="Masukkan Frekuensi Nafas"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4">
                                Suhu
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="suhu"
                                    type="text"
                                    value={suhu}
                                    onChange={(e) => setSuhu(e.target.value)}
                                    placeholder="Masukkan Suhu"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Berat Badan
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="berat_badan"
                                    type="text"
                                    value={beratBadan}
                                    onChange={(e) => setBeratBadan(e.target.value)}
                                    placeholder="Masukkan Berat Badan"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Saturasi O2
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="saturasi_o2"
                                    type="text"
                                    value={saturasiO2}
                                    onChange={(e) => setSaturasiO2(e.target.value)}
                                    placeholder="Masukkan Saturasi O2"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>
                    </td>
                </tr>

                {/* PEMERIKSAAN FISIK */}
                <tr style={{ borderBottom: "1px solid #000" }}>
                    <td colSpan={8} style={{ textAlign: "left", padding: "5px" }}>
                        <div>
                            <u className="text-xl font-bold">Pemeriksaan Fisik</u>
                        </div>
                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4">
                                Mata
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="mata"
                                    type="text"
                                    value={mata}
                                    onChange={(e) => setMata(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Mata"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Ikterus
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="ikterus"
                                    type="text"
                                    value={ikterus}
                                    onChange={(e) => setIkterus(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Ikterus"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Pupil
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="pupil"
                                    type="text"
                                    value={pupil}
                                    onChange={(e) => setPupil(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Pupil"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4">
                                Diameter Mata
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="diameter_mata"
                                    type="text"
                                    value={diameterMata}
                                    onChange={(e) => setDiameterMata(e.target.value)}
                                    placeholder="Masukkan Diameter Mata"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Udem Palpebrae
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="udema_palpebrae"
                                    type="text"
                                    value={udemaPalpebrae}
                                    onChange={(e) => setUdemapalpebrae(e.target.value)}
                                    placeholder="Masukkan Udem Palpebrae"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Kelainan Mata
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="kelainan_mata"
                                    type="text"
                                    value={kelainanMata}
                                    onChange={(e) => setKelainanMata(e.target.value)}
                                    placeholder="Masukkan Kelainan Mata"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4">
                                THT
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="tht"
                                    type="text"
                                    value={tht}
                                    onChange={(e) => setTHT(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan THT"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Tongsil
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="tongsil"
                                    type="text"
                                    value={tongsil}
                                    onChange={(e) => setTongsil(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Tongsil"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Faring
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="faring"
                                    type="text"
                                    value={faring}
                                    onChange={(e) => setFaring(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Faring"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4">
                                Lidah
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="lidah"
                                    type="text"
                                    value={lidah}
                                    onChange={(e) => setLidah(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Lidah"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Bibir
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="bibir"
                                    type="text"
                                    value={bibir}
                                    onChange={(e) => setBibir(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Bibir"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Leher
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="leher"
                                    type="text"
                                    value={leher}
                                    onChange={(e) => setLeher(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Leher"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4">
                                JVP
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="jvp"
                                    type="text"
                                    value={jvp}
                                    onChange={(e) => setJVP(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan JVP"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Limfe
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="limfe"
                                    type="text"
                                    value={limfe}
                                    onChange={(e) => setLimfe(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Limfe"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Kaku Kuduk
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="kaku_kuduk"
                                    type="text"
                                    value={kakuKuduk}
                                    onChange={(e) => setKakuKuduk(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Kaku Kuduk"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4">
                                Thoraks
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="thoraks"
                                    type="text"
                                    value={thoraks}
                                    onChange={(e) => setThoraks(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Thoraks"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Cor
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="cor"
                                    type="text"
                                    value={cor}
                                    onChange={(e) => setCor(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Cor"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                S1/S2
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="s1_s2"
                                    type="text"
                                    value={s1S2}
                                    onChange={(e) => setS1S2(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan S1/S2"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4">
                                Mur-Mur
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="mur_mur"
                                    type="text"
                                    value={murMur}
                                    onChange={(e) => setMurMur(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Mur-Mur"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Pulmo
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="pulmo"
                                    type="text"
                                    value={pulmo}
                                    onChange={(e) => setPulmo(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Pulmo"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Suara Nafas
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="suara_nafas"
                                    type="text"
                                    value={suaraNafas}
                                    onChange={(e) => setSuaraNafas(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Suara Nafas"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4">
                                Ronchi
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="ronchi"
                                    type="text"
                                    value={ronchi}
                                    onChange={(e) => setRonchi(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Ronchi"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Wheezing
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="wheezing"
                                    type="text"
                                    value={wheezing}
                                    onChange={(e) => setWheezing(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Wheezing"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Abdomen
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="abdomen"
                                    type="text"
                                    value={abdomen}
                                    onChange={(e) => setAbdomen(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Abdomen"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4">
                                Meteorismus
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="meteorismus"
                                    type="text"
                                    value={meteorismus}
                                    onChange={(e) => setMeteorismus(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Meteorismus"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Peristaltik
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="peristaltik"
                                    type="text"
                                    value={peristaltik}
                                    onChange={(e) => setPeristaltik(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Peristaltik"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Asites
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="asites"
                                    type="text"
                                    value={asites}
                                    onChange={(e) => setAsites(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Asites"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4">
                                Nyeri Tekan
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="nyeri_tekan"
                                    type="text"
                                    value={nyeriTekan}
                                    onChange={(e) => setNyeriTekan(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Nyeri Tekan"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Hepar
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="hepar"
                                    type="text"
                                    value={hepar}
                                    onChange={(e) => setHepar(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Hepar"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Lien
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="lien"
                                    type="text"
                                    value={lien}
                                    onChange={(e) => setLien(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Lien"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4">
                                Extremitas
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="mata"
                                    type="text"
                                    value={extremitas}
                                    onChange={(e) => setExtremitas(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Extremitas"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Udem
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="udem"
                                    type="text"
                                    value={udem}
                                    onChange={(e) => setUdem(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Udem"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Defeksesi
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="defeksesi"
                                    type="text"
                                    value={defeksesi}
                                    onChange={(e) => setDefeksesi(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Defeksesi"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4">
                                Urin
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="urin"
                                    type="text"
                                    value={urin}
                                    onChange={(e) => setUrin(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Urin"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="whitespace-nowrap pl-4">
                                Lain - Lain
                            </div>
                            <div className="col-span-3 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="lain-lain"
                                    type="text"
                                    value={pemeriksaanLainLain}
                                    onChange={(e) => setPemeriksaanLainLain(e.target.value)}
                                    placeholder="Masukkan Pemeriksaan Lain - Lain"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>
                    </td>
                </tr>

                {/* RIWAYAT ALERGI */}
                <tr style={{ borderBottom: "1px solid #000" }}>
                    <td colSpan={8} style={{ textAlign: "left", padding: "5px" }}>
                        <div>
                            <u className="text-xl font-bold">Riwayat Alergi</u>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="col-span-6 flex items-center gap-2">
                                <Textarea
                                    id="riwayat_alergi"
                                    value={riwayatAlergi}
                                    onChange={(e) => setRiwayatAlergi(e.target.value)}
                                    placeholder="Masukkan Riwayat Alergi"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%", height: "100px" }}
                                />
                            </div>
                        </div>
                    </td>
                </tr>

                {/* HUBUNGAN STATUS DAN PSIKOSOSIAL SPIRITUAL */}
                <tr style={{ borderBottom: "1px solid #000" }}>
                    <td colSpan={8} style={{ textAlign: "left", padding: "5px" }}>
                        <div>
                            <u className="text-xl font-bold">HUBUNGAN STATUS DAN PSIKOSOSIAL SPIRITUAL</u>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4 col-span-1">
                                Status Psikologi
                            </div>

                            <div className="col-span-5 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="status_psikologi"
                                    type="text"
                                    value={statusPsikologis}
                                    onChange={(e) => setStatusPsikologis(e.target.value)}
                                    placeholder="Masukkan Status Psikologi"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4 col-span-1">
                                Status Mental
                            </div>

                            <div className="col-span-5 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="status_mental"
                                    type="text"
                                    value={statusMental}
                                    onChange={(e) => setStatusMental(e.target.value)}
                                    placeholder="Masukkan Status Mental"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4 col-span-1">
                                Hubungan Keluarga
                            </div>

                            <div className="col-span-5 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="hubungan_keluarga"
                                    type="text"
                                    value={hubunganKeluarga}
                                    onChange={(e) => setHubunganKeluarga(e.target.value)}
                                    placeholder="Masukkan Hubungan Keluarga"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4 col-span-1">
                                Tempat Tinggal
                            </div>

                            <div className="col-span-5 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="tempat_tinggal"
                                    type="text"
                                    value={tempatTinggal}
                                    onChange={(e) => setTempatTinggal(e.target.value)}
                                    placeholder="Masukkan Tempat Tinggal"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4 col-span-1">
                                Agama
                            </div>

                            <div className="col-span-5 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="agama"
                                    type="text"
                                    value={agama}
                                    onChange={(e) => setAgama(e.target.value)}
                                    placeholder="Masukkan Agama"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4 col-span-1">
                                Kebiasaan Beribadah
                            </div>

                            <div className="col-span-5 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="kebiasaan_beribadah"
                                    type="text"
                                    value={kebiasaanBeribadah}
                                    onChange={(e) => setKebiasaanBeribadah(e.target.value)}
                                    placeholder="Masukkan Kebiasaan Beribadah"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4 col-span-1">
                                Pekerjaan
                            </div>

                            <div className="col-span-5 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="pekerjaan"
                                    type="text"
                                    value={pekerjaan}
                                    onChange={(e) => setPekerjaan(e.target.value)}
                                    placeholder="Masukkan Pekerjaan"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4 col-span-1">
                                Penghasilan
                            </div>

                            <div className="col-span-5 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="penghasilan"
                                    type="text"
                                    value={penghasilan}
                                    onChange={(e) => setPenghasilan(e.target.value)}
                                    placeholder="Masukkan Penghasilan"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>
                    </td>
                </tr>

                {/* PENILAIAN NYERI */}
                <tr style={{ borderBottom: "1px solid #000" }}>
                    <td colSpan={8} style={{ textAlign: "left", padding: "5px" }}>
                        <div>
                            <u className="text-xl font-bold">PENILAIAN NYERI</u>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4 col-span-1">
                                Nyeri
                            </div>

                            <div className="col-span-5 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="nyeri"
                                    type="text"
                                    value={nyeri}
                                    onChange={(e) => setNyeri(e.target.value)}
                                    placeholder="Masukkan Nyeri"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4 col-span-1">
                                Onset
                            </div>

                            <div className="col-span-5 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="onset"
                                    type="text"
                                    value={onsetNyeri}
                                    onChange={(e) => setOnsetNyeri(e.target.value)}
                                    placeholder="Masukkan Onset"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4 col-span-1">
                                Pencetus
                            </div>

                            <div className="col-span-5 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="pencetus"
                                    type="text"
                                    value={pencetusNyeri}
                                    onChange={(e) => setPencetusNyeri(e.target.value)}
                                    placeholder="Masukkan Pencetus"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4 col-span-1">
                                Lokasi Nyeri
                            </div>

                            <div className="col-span-5 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="lokasi_nyeri"
                                    type="text"
                                    value={lokasiNyeri}
                                    onChange={(e) => setLokasiNyeri(e.target.value)}
                                    placeholder="Masukkan Lokasi Nyeri"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4 col-span-1">
                                Gambaran Nyeri
                            </div>

                            <div className="col-span-5 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="gambaran_nyeri"
                                    type="text"
                                    value={gambaranNyeri}
                                    onChange={(e) => setGambaranNyeri(e.target.value)}
                                    placeholder="Masukkan Gambaran Nyeri"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4 col-span-1">
                                Durasi
                            </div>

                            <div className="col-span-5 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="durasi"
                                    type="text"
                                    value={durasiNyeri}
                                    onChange={(e) => setDurasiNyeri(e.target.value)}
                                    placeholder="Masukkan Durasi"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4 col-span-1">
                                Skala
                            </div>

                            <div className="col-span-5 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="skala"
                                    type="text"
                                    value={skalaNyeri}
                                    onChange={(e) => setSkalaNyeri(e.target.value)}
                                    placeholder="Masukkan Skala"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4 col-span-1">
                                Metode
                            </div>

                            <div className="col-span-5 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="metode"
                                    type="text"
                                    value={metodeNyeri}
                                    onChange={(e) => setMetodeNyeri(e.target.value)}
                                    placeholder="Masukkan Metode"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>
                    </td>
                </tr>

                {/* RESIKO JATUH */}
                <tr style={{ borderBottom: "1px solid #000" }}>
                    <td colSpan={8} style={{ textAlign: "left", padding: "5px" }}>
                        <div>
                            <u className="text-xl font-bold">RESIKO JATUH</u>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4 col-span-1">
                                Resiko Jatuh
                            </div>

                            <div className="col-span-5 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="resiko_jatuh"
                                    type="text"
                                    value={resikoJatuh}
                                    onChange={(e) => setResikoJatuh(e.target.value)}
                                    placeholder="Masukkan Resiko Jatuh"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4 col-span-1">
                                Skor
                            </div>

                            <div className="col-span-5 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="skor"
                                    type="text"
                                    value={skorResikoJatuh}
                                    onChange={(e) => setSkorResikoJatuh(e.target.value)}
                                    placeholder="Masukkan Skor"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4 col-span-1">
                                Metode Penilaian
                            </div>

                            <div className="col-span-5 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="metode"
                                    type="text"
                                    value={metodeResikoJatuh}
                                    onChange={(e) => setMetodeResikoJatuh(e.target.value)}
                                    placeholder="Masukkan Metode"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>
                    </td>
                </tr>

                {/* PENILAIAN DEKUBITUS */}
                <tr style={{ borderBottom: "1px solid #000" }}>
                    <td colSpan={8} style={{ textAlign: "left", padding: "5px" }}>
                        <div>
                            <u className="text-xl font-bold">RESIKO DEKUBITUS</u>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4 col-span-1">
                                Resiko Dekubitus
                            </div>

                            <div className="col-span-5 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="resiko_dekubitus"
                                    type="text"
                                    value={resikoDekubitas}
                                    onChange={(e) => setResikoDekubitas(e.target.value)}
                                    placeholder="Masukkan Resiko Dekubitus"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4 col-span-1">
                                Skor
                            </div>

                            <div className="col-span-5 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="skor"
                                    type="text"
                                    value={skorResikoDekubitas}
                                    onChange={(e) => setSkorResikoDekubitas(e.target.value)}
                                    placeholder="Masukkan Skor"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>
                    </td>
                </tr>

                {/* RESIKO GIZI */}
                <tr style={{ borderBottom: "1px solid #000" }}>
                    <td colSpan={8} style={{ textAlign: "left", padding: "5px" }}>
                        <div>
                            <u className="text-xl font-bold">RESIKO GIZI</u>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4 col-span-4">
                                Apakah pasien mengalami penurunan berat badan yang tidak
                                diinginkan dalam 6 bulan terakhir ?
                            </div>

                            <div className="col-span-2 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="penurunan_berat_badan"
                                    type="number"
                                    value={penurunanBeratBadan}
                                    onChange={(e) => setPenurunanBeratBadan(e.target.value)}
                                    placeholder="Jumlah Penurunan Berat Badan"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4 col-span-4">
                                Apakah asupan makanan berkurang karena tidak nafsu makan ?
                            </div>

                            <div className="col-span-2 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="asupan_makanan"
                                    type="text"
                                    value={penurunanAsupan}
                                    onChange={(e) => setPenurunanAsupan(e.target.value)}
                                    placeholder="Ya/Tidak"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="whitespace-nowrap pl-4 col-span-4">
                                Pasien dengan diagnosis khusus:
                            </div>

                            <div className="col-span-2 flex items-center gap-2">
                                <strong>:</strong>
                                <Input
                                    id="diagnosis_khusus"
                                    type="text"
                                    value={diagnosisKhusus}
                                    onChange={(e) => setDiagnosisKhusus(e.target.value)}
                                    placeholder="Masukan Diagnosis Khusus"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>
                    </td>
                </tr>

                {/* KEBUTUHAN EDUKASI PASIEN DAN KELUARGA */}
                <tr style={{ borderBottom: "1px solid #000" }}>
                    <td colSpan={8} style={{ textAlign: "left", padding: "5px" }}>
                        <div>
                            <u className="text-xl font-bold">EDUKASI PASIEN DAN KELUARGA</u>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="col-span-6 flex items-center gap-2">
                                <Textarea
                                    id="edukasi"
                                    value={edukasiPasien}
                                    onChange={(e) => setEdukasiPasien(e.target.value)}
                                    placeholder="Masukkan Edukasi Pasien dan Keluarga"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%", height: "100px" }}
                                />
                            </div>
                        </div>
                    </td>
                </tr>

                {/* RENCANA PULANG */}
                <tr style={{ borderBottom: "1px solid #000" }}>
                    <td colSpan={8} style={{ textAlign: "left", padding: "5px" }}>
                        <div>
                            <u className="text-xl font-bold">RENCANA PULANG/DISCHARGE PLANNING</u>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="col-span-6 flex items-center gap-2">
                                Skrinning Faktor Resiko Pasien Pulang
                            </div>
                            <div className="col-span-6 flex items-center gap-2">
                                <Textarea
                                    id="skrinning_faktor_resiko"
                                    value={skrinningDischargePlanning}
                                    onChange={(e) => setSkrinningDischargePlanning(e.target.value)}
                                    placeholder="Masukkan Skrinning Faktor Resiko Pasien Pulang"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%", height: "100px" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="col-span-6 flex items-center gap-2">
                                Faktor Resiko Pasien Pulang
                            </div>
                            <div className="col-span-6 flex items-center gap-2">
                                <Textarea
                                    id="faktor_resiko"
                                    value={faktorResikoDischargePlanning}
                                    onChange={(e) => setFaktorResikoDischargePlanning(e.target.value)}
                                    placeholder="Masukkan Faktor Resiko Pasien Pulang"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%", height: "100px" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="col-span-6 flex items-center gap-2">
                                Tindak Lanjut
                            </div>
                            <div className="col-span-6 flex items-center gap-2">
                                <Textarea
                                    id="tindak_lanjut"
                                    value={tindakLanjutDischargePlanning}
                                    onChange={(e) => setTindakLanjutDischargePlanning(e.target.value)}
                                    placeholder="Masukkan Tindak Lanjut"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%", height: "100px" }}
                                />
                            </div>
                        </div>
                    </td>
                </tr>

                {/* RENCANA KEPERAWATAN */}
                <tr style={{ borderBottom: "1px solid #000" }}>
                    <td colSpan={8} style={{ textAlign: "left", padding: "5px" }}>
                        <div>
                            <u className="text-xl font-bold">RENCANA KEPERAWATAN</u>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="col-span-6 flex items-center gap-2">
                                <Textarea
                                    id="rencana_keperawatan"
                                    value={rencanaKeperawatan}
                                    onChange={(e) => setRencanaKeperawatan(e.target.value)}
                                    placeholder="Masukkan Rencana Keperawatan"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%", height: "100px" }}
                                />
                            </div>
                        </div>
                    </td>
                </tr>

                {/* MASALAH MEDIS */}
                <tr style={{ borderBottom: "1px solid #000" }}>
                    <td colSpan={8} style={{ textAlign: "left", padding: "5px" }}>
                        <div>
                            <u className="text-xl font-bold">MASALAH MEDIS</u>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="col-span-6 flex items-center gap-2">
                                <Textarea
                                    id="maslah_medis"
                                    value={masalahMedis}
                                    onChange={(e) => setMasalahMedis(e.target.value)}
                                    placeholder="Masukkan Masalah Medis"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%", height: "100px" }}
                                />
                            </div>
                        </div>
                    </td>
                </tr>

                {/* DIAGNOSA MEDIS */}
                <tr style={{ borderBottom: "1px solid #000" }}>
                    <td colSpan={8} style={{ textAlign: "left", padding: "5px" }}>
                        <div>
                            <u className="text-xl font-bold">DIAGNOSA MEDIS</u>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="col-span-6 flex items-center gap-2">
                                <Textarea
                                    id="diagnosa_medis"
                                    value={diagnosaKeperawatan}
                                    onChange={(e) => setDiagnosaKeperawatan(e.target.value)}
                                    placeholder="Masukkan Diagnosa Medis"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%", height: "100px" }}
                                />
                            </div>
                        </div>
                    </td>
                </tr>

                {/* RENCANA TERAPI */}
                <tr style={{ borderBottom: "1px solid #000" }}>
                    <td colSpan={8} style={{ textAlign: "left", padding: "5px" }}>
                        <div>
                            <u className="text-xl font-bold">RENCANA TERAPI</u>
                        </div>

                        <div className="grid grid-cols-6 gap-1 items-center p-2">
                            <div className="col-span-6 flex items-center gap-2">
                                <Textarea
                                    id="rencana_terapi"
                                    value={rencanaTerapi}
                                    onChange={(e) => setRencanaTerapi(e.target.value)}
                                    placeholder="Masukkan Rencana Terapi"
                                    className="border border-gray-300 rounded-md"
                                    style={{ width: "100%", height: "100px" }}
                                />
                            </div>
                        </div>
                    </td>
                </tr>

                {/* TANDA TANGAN */}
                {
                    namaDokter && (
                        <>
                            <tr style={{ borderBottom: "1px solid #000" }}>
                                <td colSpan={8} style={{ textAlign: "left", padding: "5px" }}>
                                    <div className="mt-[-1px] flex justify-center items-center h-full p-4">
                                        <div className="text-center mx-4 flex-1">
                                            <br />
                                            <strong>Perawat</strong>
                                            <br />
                                            {/* Tampilkan tanda tangan jika ada */}
                                            {signatureData && (
                                                <div className="">
                                                    <img src={signatureData} alt="Tanda Tangan" className="" />
                                                </div>
                                            )}
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowSignaturePad(true)} // Tampilkan pad tanda tangan
                                                className="border border-gray-300 rounded-md p-2 bg-blue-500 text-white hover:bg-blue-600"
                                            >
                                                Tanda Tangan
                                            </Button>

                                        </div>
                                        <div className="ml-100 flex-1">
                                            <strong>Bojonegoro, </strong> {tanggalTandaTangan}
                                            <br />
                                            <strong>DPJP Pelayanan</strong>
                                            <div className="m-4">
                                                <QRCodeSVG
                                                    value={namaDokter}
                                                    size={128}
                                                    bgColor={"#ffffff"}
                                                    fgColor={"#000000"}
                                                    level={"L"}
                                                />
                                            </div>
                                            <strong>{namaDokter}</strong>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </>
                    )
                }
            </table>

            <div>
                <div className="flex justify-end mt-4">
                    <Button
                        type="submit"
                        variant="outline"
                        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        onClick={handleSave}
                    >
                        Simpan
                    </Button>
                </div>
            </div>

            {showSignaturePad && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-4 rounded-md shadow-md">
                        <SignatureCanvas
                            penColor="black"
                            canvasProps={{
                                width: 500,
                                height: 200,
                                className: "border border-gray-300 rounded-md",
                            }}
                            ref={(ref) => (window.sigCanvas = ref)}
                        />
                        <div className="flex justify-between mt-4">
                            <Button
                                variant="outline"
                                onClick={() => handleClearSignature(window.sigCanvas)}
                                className="border border-gray-300 rounded-md p-2 bg-red-500 text-white hover:bg-red-600"
                            >
                                Clear
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleSaveSignature(window.sigCanvas)}
                                className="border border-gray-300 rounded-md p-2 bg-green-500 text-white hover:bg-green-600"
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
