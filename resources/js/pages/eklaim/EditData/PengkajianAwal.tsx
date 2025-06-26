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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface PengkajianAwalProps {
    imageBase64: string | null;
    nomorKunjungan: string | null;
    onChange?: (value: any) => void;
}

export default function PengkajianAwal({ imageBase64, nomorKunjungan, onChange }: PengkajianAwalProps) {
    const [componentMode, setComponentMode] = useState(0);


    const { success, error } = usePage().props;
    useEffect(() => {
        if (success) toast.success(success);
        if (error) toast.error(error);
    }, [success, error]);

    const handleLoadData = async () => {
        try {
            if (componentMode == 0) {
                const response = await axios.get(route('eklaim.getDataPengkajianAwal', { nomorKunjungan }));
                const data = response.data;
                const riwayatOrderObatPasien = data.order_resep?.map((item: any) => item.order_resep_detil)
                const getNamaRiwayatObat = riwayatOrderObatPasien?.map((item: any) =>
                    item.map((detail: any) => detail.nama_obat.NAMA).join(", ")
                ).join(", ") || "";
                const diagnosaPasien = data.diagnosa_pasien?.map((item: any) => item.nama_diagnosa.STR + " (" + item.KODE + ")").join(", ");
                const riwayatAlergiPasien = data.riwayat_alergi?.map((item: any) => item.DESKRIPSI).join(", ");

                setNamaPasien(data.pendaftaran_pasien?.pasien.NAMA ?? "");
                setAlamat(data.pendaftaran_pasien?.pasien.ALAMAT ?? "");
                setTanggalMasuk(data?.MASUK ?? "");
                setRuangan(data.ruangan.DESKRIPSI ?? "");
                setNomorRM(data.pendaftaran_pasien?.pasien.NORM ?? "");
                setTanggalLahir(data.pendaftaran_pasien?.pasien.TANGGAL_LAHIR ?? "");
                setJenisKelamin(data.pendaftaran_pasien?.pasien.JENIS_KELAMIN == 1 ? "Laki-laki" : "Perempuan");
                if (data.anamnesis_pasien_diperoleh?.AUTOANAMNESIS == 1) {
                    setAutoAnamnesis(true);
                    setAlloAnamnesis(false);
                } else if (data.anamnesis_pasien_diperoleh?.ALLOANAMNESIS == 1) {
                    setAutoAnamnesis(false);
                    setAlloAnamnesis(true);
                }
                setDari(data.anamnesis_pasien_diperoleh?.DARI ?? "");
                setKeluhanUtama(data.keluhan_utama?.DESKRIPSI ?? "");
                setRiwayatPenyakit(data.anamnesis_pasien?.DESKRIPSI ?? "");
                setFaktorResiko(data.rpp?.DESKRIPSI ?? "");
                setRiwayatPengobatan(getNamaRiwayatObat);
                setRiwayatPenyakitKeluarga(data.riwayat_penyakit_keluarga?.DESKRIPSI ?? "");
                setKeadaanUmum(data.tanda_vital?.KEADAAN_UMUM ?? "");
                setTingkatKesadaran(data.tanda_vital?.KESADARAN ?? "");
                setGCS(data.tanda_vital?.GCS ?? "");
                setEye(data.tanda_vital?.EYE ?? "");
                setMotorik(data.tanda_vital?.MOTORIK ?? "");
                setVerbal(data.tanda_vital?.VERBAL ?? "");
                setTekananDarah(data.tanda_vital ? `${Math.ceil(data.tanda_vital.SISTOLIK)}/${Math.ceil(data.tanda_vital.DISTOLIK)}` : "");
                setFrekuensiNadi(data.tanda_vital?.FREKUENSI_NADI ?? "");
                setFrekuensiNafas(data.tanda_vital?.FREKUENSI_NAFAS ?? "");
                setSuhu(data.tanda_vital?.SUHU ?? "");
                setBeratBadan(data.tanda_vital?.BERAT_BADAN ?? "");
                setSaturasiO2(data.tanda_vital?.SATURASI_O2 ?? "");
                setRiwayatAlergi(riwayatAlergiPasien);
                setMasalahMedis(data.anamnesis_pasien?.DESKRIPSI ?? "");
                setDiagnosaKeperawatan(diagnosaPasien);
                setRencanaTerapi(data.rencana_terapi?.DESKRIPSI ?? "");
                setNamaDokter((data.dokter_d_p_j_p?.GELAR_DEPAN ? data.dokter_d_p_j_p?.GELAR_DEPAN + "." : "") + data.dokter_d_p_j_p?.NAMA + (data.dokter_d_p_j_p?.GELAR_BELAKANG ? " " + data.dokter_d_p_j_p?.GELAR_BELAKANG : ""));
                setTanggalTandaTangan(formatTanggalIndo(data.MASUK) ?? "");
                if (onChange) onChange([
                    {
                        nomor_kunjungan: nomorKunjungan,
                        ruangan,
                        tanggal_masuk: tanggalMasuk,
                        nama_pasien: namaPasien,
                        alamat,
                        nomor_rm: nomorRM,
                        tanggal_lahir: tanggalLahir,
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
                        riwayat_alergi: riwayatAlergi,
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
                        resiko_jatuh: {
                            resiko: resikoJatuh,
                            skor: skorResikoJatuh,
                            metode: metodeResikoJatuh,
                        },
                        resiko_dekubitas: {
                            resiko: resikoDekubitas,
                            skor: skorResikoDekubitas,
                        },
                        resiko_gizi: {
                            penurunan_berat_badan: penurunanBeratBadan,
                            penurunan_asupan: penurunanAsupan,
                            diagnosis_khusus: diagnosisKhusus,
                        },
                        edukasi_pasien: edukasiPasien,
                        discharge_planning: {
                            skrinning: skrinningDischargePlanning,
                            faktor_resiko: faktorResikoDischargePlanning,
                            tindak_lanjut: tindakLanjutDischargePlanning,
                        },
                        rencana_keperawatan: rencanaKeperawatan,
                        diagnosa_keperawatan: diagnosaKeperawatan,
                        masalah_medis: masalahMedis,
                        rencana_terapi: rencanaTerapi,
                        nama_dokter: namaDokter,
                        tanggal_tanda_tangan: tanggalTandaTangan,
                    }
                ]);
            } else if (componentMode == 1) {
                const response = await axios.get(route('eklaim.getDataPengkajianAwalEdit', { nomorKunjungan }));
                const data = response.data;
                setNamaPasien(data.nama_pasien ?? "");
                setAlamat(data.alamat ?? "");
                setTanggalMasuk(data?.tanggal_masuk ?? "");
                setRuangan(data.ruangan ?? "");
                setNomorRM(data.nomor_rm ?? "");
                setTanggalLahir(data.tanggal_lahir ?? "");
                setJenisKelamin(data.jenis_kelamin ?? "");
                if (data.anamnesis.allo_anamnesis === "Ya") {
                    setAutoAnamnesis(false);
                    setAlloAnamnesis(true);
                } else if (data.anamnesis.auto_anamnesis === "Ya") {
                    setAutoAnamnesis(true);
                    setAlloAnamnesis(false);
                }
                setDari(data.anamnesis?.dari ?? "");
                setKeluhanUtama(data.anamnesis.keluhan_utama ?? "");
                setRiwayatPenyakit(data.anamnesis.riwayat_penyakit_sekarang ?? "");
                setFaktorResiko(data.anamnesis.riwayat_penyakit_lalu ?? "");
                setRiwayatPengobatan(data.anamnesis.riwayat_pengobatan ?? "");
                setRiwayatPenyakitKeluarga(data.anamnesis.riwayat_penyakit_keluarga ?? "");
                setKeadaanUmum(data.tanda_vital?.keadaan_umum ?? "");
                setTingkatKesadaran(data.tanda_vital?.tingkat_kesadaran ?? "");
                setGCS(data.tanda_vital?.gcs ?? "");
                setEye(data.tanda_vital?.eye ?? "");
                setMotorik(data.tanda_vital?.motorik ?? "");
                setVerbal(data.tanda_vital?.verbal ?? "");
                setTekananDarah(data.tanda_vital?.tekanan_darah ?? "");
                setFrekuensiNadi(data.tanda_vital?.frekuensi_nadi ?? "");
                setFrekuensiNafas(data.tanda_vital?.frekuensi_nafas ?? "");
                setSuhu(data.tanda_vital?.suhu ?? "");
                setBeratBadan(data.tanda_vital?.berat_badan ?? "");
                setSaturasiO2(data.tanda_vital?.saturasi_o2 ?? "");
                setRiwayatAlergi(data.riwayat_alergi ?? "");
                setMasalahMedis(data.masalah_medis ?? "");
                setDiagnosaKeperawatan(data.diagnosa_keperawatan ?? "");
                setRencanaTerapi(data.rencana_terapi ?? "");
                setMata(data.pemeriksaan_fisik?.mata ?? "");
                setIkterus(data.pemeriksaan_fisik?.ikterus ?? "");
                setPupil(data.pemeriksaan_fisik?.pupil ?? "");
                setDiameterMata(data.pemeriksaan_fisik?.diameter_mata ?? "");
                setUdemapalpebrae(data.pemeriksaan_fisik?.udem_palpebrae ?? "");
                setKelainanMata(data.pemeriksaan_fisik?.kelainan_mata ?? "");
                setTHT(data.pemeriksaan_fisik?.tht ?? "");
                setTongsil(data.pemeriksaan_fisik?.tongsil ?? "");
                setFaring(data.pemeriksaan_fisik?.faring ?? "");
                setLidah(data.pemeriksaan_fisik?.lidah ?? "");
                setBibir(data.pemeriksaan_fisik?.bibir ?? "");
                setLeher(data.pemeriksaan_fisik?.leher ?? "");
                setJVP(data.pemeriksaan_fisik?.jvp ?? "");
                setLimfe(data.pemeriksaan_fisik?.limfe ?? "");
                setKakuKuduk(data.pemeriksaan_fisik?.kaku_kuduk ?? "");
                setThoraks(data.pemeriksaan_fisik?.thoraks ?? "");
                setCor(data.pemeriksaan_fisik?.cor ?? "");
                setS1S2(data.pemeriksaan_fisik?.s1s2 ?? "");
                setMurMur(data.pemeriksaan_fisik?.murmur ?? "");
                setPulmo(data.pemeriksaan_fisik?.pulmo ?? "");
                setSuaraNafas(data.pemeriksaan_fisik?.suara_nafas ?? "");
                setRonchi(data.pemeriksaan_fisik?.ronchi ?? "");
                setWheezing(data.pemeriksaan_fisik?.wheezing ?? "");
                setAbdomen(data.pemeriksaan_fisik?.abdomen ?? "");
                setMeteorismus(data.pemeriksaan_fisik?.meteorismus ?? "");
                setPeristaltik(data.pemeriksaan_fisik?.peristaltik ?? "");
                setAsites(data.pemeriksaan_fisik?.asites ?? "");
                setNyeriTekan(data.pemeriksaan_fisik?.nyeri_tekan ?? "");
                setHepar(data.pemeriksaan_fisik?.hepar ?? "");
                setLien(data.pemeriksaan_fisik?.lien ?? "");
                setExtremitas(data.pemeriksaan_fisik?.extremitas ?? "");
                setUdem(data.pemeriksaan_fisik?.udem ?? "");
                setDefeksesi(data.pemeriksaan_fisik?.defeksesi ?? "");
                setUrin(data.pemeriksaan_fisik?.urin ?? "");
                setRiwayatAlergi(data.riwayat_alergi ?? "");
                setStatusPsikologis(data.psikososial?.status_psikologis ?? "");
                setStatusMental(data.psikososial?.status_mental ?? "");
                setHubunganKeluarga(data.psikososial?.hubungan_keluarga ?? "");
                setTempatTinggal(data.psikososial?.tempat_tinggal ?? "");
                setAgama(data.psikososial?.agama ?? "");
                setKebiasaanBeribadah(data.psikososial?.kebiasaan_beribadah ?? "");
                setPekerjaan(data.psikososial?.pekerjaan ?? "");
                setPenghasilan(data.psikososial?.penghasilan ?? "");
                setNyeri(data.penilaian_nyeri?.nyeri ?? "");
                setOnsetNyeri(data.penilaian_nyeri?.onset ?? "");
                setPencetusNyeri(data.penilaian_nyeri?.pencetus ?? "");
                setLokasiNyeri(data.penilaian_nyeri?.lokasi ?? "");
                setGambaranNyeri(data.penilaian_nyeri?.gambaran ?? "");
                setDurasiNyeri(data.penilaian_nyeri?.durasi ?? "");
                setSkalaNyeri(data.penilaian_nyeri?.skala ?? "");
                setMetodeNyeri(data.penilaian_nyeri?.metode ?? "");
                setResikoJatuh(data.resiko_jatuh?.resiko ?? "");
                setSkorResikoJatuh(data.resiko_jatuh?.skor ?? "");
                setMetodeResikoJatuh(data.resiko_jatuh?.metode ?? "");
                setPenurunanBeratBadan(data.resiko_gizi?.penurunan_berat_badan ?? "");
                setPenurunanAsupan(data.resiko_gizi?.penurunan_asupan ?? "");
                setDiagnosisKhusus(data.resiko_gizi?.diagnosis_khusus ?? "");
                setEdukasiPasien(data.edukasi_pasien ?? "");
                setSkrinningDischargePlanning(data.discharge_planning?.skrinning ?? "");
                setFaktorResikoDischargePlanning(data.discharge_planning?.faktor_resiko ?? "");
                setTindakLanjutDischargePlanning(data.discharge_planning?.tindak_lanjut ?? "");
                setRencanaKeperawatan(data.rencana_keperawatan ?? "");
                setDiagnosaKeperawatan(data.diagnosa_keperawatan ?? "");
                setMasalahMedis(data.masalah_medis ?? "");
                // setNamaDokter((data.dokter_d_p_j_p?.GELAR_DEPAN ? data.dokter_d_p_j_p?.GELAR_DEPAN + "." : "") + data.dokter_d_p_j_p?.NAMA + (data.dokter_d_p_j_p?.GELAR_BELAKANG ? " " + data.dokter_d_p_j_p?.GELAR_BELAKANG : ""));
                // setTanggalTandaTangan(formatTanggalIndo(data.MASUK) ?? "");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const [ruangan, setRuangan] = useState("");
    const [tanggalMasuk, setTanggalMasuk] = useState("");
    const [namaPasien, setNamaPasien] = useState("");
    const [alamat, setAlamat] = useState("");
    const [nomorRM, setNomorRM] = useState("");
    const [tanggalLahir, setTanggalLahir] = useState("");
    const [jenisKelamin, setJenisKelamin] = useState("");
    const [keluhanUtama, setKeluhanUtama] = useState("");
    const [riwayatPenyakit, setRiwayatPenyakit] = useState("");
    const [faktorResiko, setFaktorResiko] = useState("");
    const [riwayatPengobatan, setRiwayatPengobatan] = useState("");
    const [riwayatPenyakitKeluarga, setRiwayatPenyakitKeluarga] = useState("");
    const [autoAnamnesis, setAutoAnamnesis] = useState(false);
    const [alloAnamnesis, setAlloAnamnesis] = useState(false);
    const [dari, setDari] = useState("");
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
    const [statusPsikologis, setStatusPsikologis] = useState("");
    const [statusMental, setStatusMental] = useState("");
    const [hubunganKeluarga, setHubunganKeluarga] = useState("");
    const [tempatTinggal, setTempatTinggal] = useState("");
    const [agama, setAgama] = useState("");
    const [kebiasaanBeribadah, setKebiasaanBeribadah] = useState("");
    const [pekerjaan, setPekerjaan] = useState("");
    const [penghasilan, setPenghasilan] = useState("");
    const [riwayatAlergi, setRiwayatAlergi] = useState("");
    const [nyeri, setNyeri] = useState("");
    const [onsetNyeri, setOnsetNyeri] = useState("");
    const [pencetusNyeri, setPencetusNyeri] = useState("");
    const [lokasiNyeri, setLokasiNyeri] = useState("");
    const [gambaranNyeri, setGambaranNyeri] = useState("");
    const [durasiNyeri, setDurasiNyeri] = useState("");
    const [skalaNyeri, setSkalaNyeri] = useState("");
    const [metodeNyeri, setMetodeNyeri] = useState("");
    const [resikoJatuh, setResikoJatuh] = useState("");
    const [skorResikoJatuh, setSkorResikoJatuh] = useState("");
    const [metodeResikoJatuh, setMetodeResikoJatuh] = useState("");
    const [resikoDekubitas, setResikoDekubitas] = useState("");
    const [skorResikoDekubitas, setSkorResikoDekubitas] = useState("");
    const [penurunanBeratBadan, setPenurunanBeratBadan] = useState("");
    const [penurunanAsupan, setPenurunanAsupan] = useState("");
    const [diagnosisKhusus, setDiagnosisKhusus] = useState("");
    const [edukasiPasien, setEdukasiPasien] = useState("");
    const [skrinningDischargePlanning, setSkrinningDischargePlanning] = useState("");
    const [faktorResikoDischargePlanning, setFaktorResikoDischargePlanning] = useState("");
    const [tindakLanjutDischargePlanning, setTindakLanjutDischargePlanning] = useState("");
    const [rencanaKeperawatan, setRencanaKeperawatan] = useState("");
    const [diagnosaKeperawatan, setDiagnosaKeperawatan] = useState("");
    const [masalahMedis, setMasalahMedis] = useState("");
    const [rencanaTerapi, setRencanaTerapi] = useState("");
    const [namaDokter, setNamaDokter] = useState("");
    const [tanggalTandaTangan, setTanggalTandaTangan] = useState("");

    const [form, setForm] = useState({
        nomor_kunjungan: "",
        ruangan: "",
        tanggal_masuk: "",
        nama_pasien: "",
        alamat: "",
        nomor_rm: "",
        tanggal_lahir: "",
        jenis_kelamin: "",
        anamnesis: {
            auto_anamnesis: "",
            allo_anamnesis: "",
            dari: "",
            keluhan_utama: keluhanUtama,
            riwayat_penyakit_sekarang: "",
            riwayat_penyakit_lalu: "",
            riwayat_pengobatan: "",
            riwayat_penyakit_keluarga: "",
        },
        tanda_vital: {
            tingkat_kesadaran: "",
            keadaan_umum: "",
            gcs: "",
            eye: "",
            motorik: "",
            verbal: "",
            tekanan_darah: "",
            frekuensi_nadi: "",
            frekuensi_nafas: "",
            suhu: "",
            berat_badan: "",
            saturasi_o2: "",
        },
        pemeriksaan_fisik: {
            mata: "",
            ikterus: "",
            pupil: "",
            diameter_mata: "",
            udem_palpebrae: "",
            kelainan_mata: "",
            tht: "",
            tongsil: "",
            faring: "",
            lidah: "",
            bibir: "",
            leher: "",
            jvp: "",
            limfe: "",
            kaku_kuduk: "",
            thoraks: "",
            cor: "",
            s1s2: "",
            murmur: "",
            pulmo: "",
            suara_nafas: "",
            ronchi: "",
            wheezing: "",
            abdomen: "",
            meteorismus: "",
            peristaltik: "",
            asites: "",
            nyeri_tekan: "",
            hepar: "",
            lien: "",
            extremitas: "",
            udem: "",
            defeksesi: "",
            urin: "",
            pemeriksaan_lain_lain: "",
        },
        status_psikososial: {
            status_psikologis: "",
            status_mental: "",
            hubungan_keluarga: "",
            tempat_tinggal: "",
            agama: "",
            kebiasaan_beribadah: "",
            pekerjaan: "",
            penghasilan: "",
        },
        riwayat_alergi: riwayatAlergi,
        penilaian_nyeri: {
            nyeri: "",
            onset: "",
            pencetus: "",
            lokasi: "",
            gambaran: "",
            durasi: "",
            skala: "",
            metode: "",
        },
        resiko_jatuh: {
            resiko: "",
            skor: "",
            metode: "",
        },
        resiko_dekubitas: {
            resiko: "",
            skor: "",
        },
        resiko_gizi: {
            penurunan_berat_badan: "",
            penurunan_asupan: "",
            diagnosis_khusus: "",
        },
        edukasi_pasien: "",
        discharge_planning: {
            skrinning: "",
            faktor_resiko: "",
            tindak_lanjut: "",
        },
        rencana_keperawatan: "",
        diagnosa_keperawatan: "",
        masalah_medis: "",
        rencana_terapi: "",
        nama_dokter: "",
        tanggal_tanda_tangan: "",
    })

    useEffect(() => {
        setForm({
            nomor_kunjungan: nomorKunjungan || "",
            ruangan: ruangan || "",
            tanggal_masuk: tanggalMasuk || "",
            nama_pasien: namaPasien || "",
            alamat: alamat || "",
            nomor_rm: nomorRM || "",
            tanggal_lahir: tanggalLahir || "",
            jenis_kelamin: jenisKelamin || "",
            anamnesis: {
                auto_anamnesis: autoAnamnesis ? "Ya" : "Tidak",
                allo_anamnesis: alloAnamnesis ? "Ya" : "Tidak",
                dari: dari || "",
                keluhan_utama: keluhanUtama || "",
                riwayat_penyakit_sekarang: riwayatPenyakit || "",
                riwayat_penyakit_lalu: faktorResiko || "",
                riwayat_pengobatan: riwayatPengobatan || "",
                riwayat_penyakit_keluarga: riwayatPenyakitKeluarga || "",
            },
            tanda_vital: {
                tingkat_kesadaran: tingkatKesadaran || "",
                keadaan_umum: keadaanUmum || "",
                gcs: gcs || "",
                eye: eye || "",
                motorik: motorik || "",
                verbal: verbal || "",
                tekanan_darah: tekananDarah || "",
                frekuensi_nadi: frekuensiNadi || "",
                frekuensi_nafas: frekuensiNafas || "",
                suhu: suhu || "",
                berat_badan: beratBadan || "",
                saturasi_o2: saturasiO2 || "",
            },
            pemeriksaan_fisik: {
                mata: mata || "",
                ikterus: ikterus || "",
                pupil: pupil || "",
                diameter_mata: diameterMata || "",
                udem_palpebrae: udemaPalpebrae || "",
                kelainan_mata: kelainanMata || "",
                tht: tht || "",
                tongsil: tongsil || "",
                faring: faring || "",
                lidah: lidah || "",
                bibir: bibir || "",
                leher: leher || "",
                jvp: jvp || "",
                limfe: limfe || "",
                kaku_kuduk: kakuKuduk || "",
                thoraks: thoraks || "",
                cor: cor || "",
                s1s2: s1S2 || "",
                murmur: murMur || "",
                pulmo: pulmo || "",
                suara_nafas: suaraNafas || "",
                ronchi: ronchi || "",
                wheezing: wheezing || "",
                abdomen: abdomen || "",
                meteorismus: meteorismus || "",
                peristaltik: peristaltik || "",
                asites: asites || "",
                nyeri_tekan: nyeriTekan || "",
                hepar: hepar || "",
                lien: lien || "",
                extremitas: extremitas || "",
                udem: udem || "",
                defeksesi: defeksesi || "",
                urin: urin || "",
                pemeriksaan_lain_lain: pemeriksaanLainLain || "",
            },
            status_psikososial: {
                status_psikologis: statusPsikologis || "",
                status_mental: statusMental || "",
                hubungan_keluarga: hubunganKeluarga || "",
                tempat_tinggal: tempatTinggal || "",
                agama: agama || "",
                kebiasaan_beribadah: kebiasaanBeribadah || "",
                pekerjaan: pekerjaan || "",
                penghasilan: penghasilan || "",
            },
            riwayat_alergi: riwayatAlergi || "",
            penilaian_nyeri: {
                nyeri: nyeri || "",
                onset: onsetNyeri || "",
                pencetus: pencetusNyeri || "",
                lokasi: lokasiNyeri || "",
                gambaran: gambaranNyeri || "",
                durasi: durasiNyeri || "",
                skala: skalaNyeri || "",
                metode: metodeNyeri || "",
            },
            resiko_jatuh: {
                resiko: resikoJatuh || "",
                skor: skorResikoJatuh || "",
                metode: metodeResikoJatuh || "",
            },
            resiko_dekubitas: {
                resiko: resikoDekubitas || "",
                skor: skorResikoDekubitas || "",
            },
            resiko_gizi: {
                penurunan_berat_badan: penurunanBeratBadan || "",
                penurunan_asupan: penurunanAsupan || "",
                diagnosis_khusus: diagnosisKhusus || "",
            },
            edukasi_pasien: edukasiPasien || "",
            discharge_planning: {
                skrinning: skrinningDischargePlanning || "",
                faktor_resiko: faktorResikoDischargePlanning || "",
                tindak_lanjut: tindakLanjutDischargePlanning || "",
            },
            rencana_keperawatan: rencanaKeperawatan || "",
            diagnosa_keperawatan: diagnosaKeperawatan || "",
            masalah_medis: masalahMedis || "",
            rencana_terapi: rencanaTerapi || "",
            nama_dokter: namaDokter || "",
            tanggal_tanda_tangan: tanggalTandaTangan || "",
        });
    }, [
        nomorKunjungan, ruangan, tanggalMasuk, namaPasien, alamat, nomorRM, tanggalLahir, jenisKelamin,
        autoAnamnesis, alloAnamnesis, dari, keluhanUtama, riwayatPenyakit, faktorResiko, riwayatPengobatan, riwayatPenyakitKeluarga,
        keadaanUmum, tingkatKesadaran, gcs, eye, motorik, verbal, tekananDarah, frekuensiNadi, frekuensiNafas, suhu, beratBadan, saturasiO2,
        mata, ikterus, pupil, diameterMata, udemaPalpebrae, kelainanMata, tht, tongsil, faring, lidah, bibir, leher, jvp, limfe, kakuKuduk, thoraks, cor, s1S2, murMur, pulmo, suaraNafas, ronchi, wheezing, abdomen, meteorismus, peristaltik, asites, nyeriTekan, hepar, lien, extremitas, udem, defeksesi, urin, pemeriksaanLainLain,
        statusPsikologis, statusMental, hubunganKeluarga, tempatTinggal, agama, kebiasaanBeribadah, pekerjaan, penghasilan,
        riwayatAlergi, nyeri, onsetNyeri, pencetusNyeri, lokasiNyeri, gambaranNyeri, durasiNyeri, skalaNyeri, metodeNyeri,
        resikoJatuh, skorResikoJatuh, metodeResikoJatuh, resikoDekubitas, skorResikoDekubitas,
        penurunanBeratBadan, penurunanAsupan, diagnosisKhusus, edukasiPasien,
        skrinningDischargePlanning, faktorResikoDischargePlanning, tindakLanjutDischargePlanning,
        rencanaKeperawatan, diagnosaKeperawatan, masalahMedis, rencanaTerapi, namaDokter, tanggalTandaTangan
    ])

    useEffect(() => {
        if (onChange) onChange(form);
    }, [form]);

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
                        <td>
                            <div className="mb-4 flex items-center gap-4">
                                <Label htmlFor="mode-switch" className="text-base">
                                    Asli
                                </Label>
                                <Switch
                                    id="mode-switch"
                                    checked={componentMode === 1}
                                    onCheckedChange={async (checked) => {
                                        try {
                                            setComponentMode(checked ? 1 : 0);
                                            await handleLoadData();
                                            toast.success('Berhasil switch mode data.');
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

            </table>
        </div>
    )
}
