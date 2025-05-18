import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Home, IdCard, PhoneCall, User, User2, Users, Users2 } from 'lucide-react';
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useRef, useEffect } from "react";
import SearchableDropdown from "@/components/SearchableDropdown";
import { router, usePage } from "@inertiajs/react";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pasiens',
        href: route('master.pasiens.index'),
    },
    {
        title: 'Tambah Pasien',
        href: route('master.pasien.create'),
    },
];

export default function PasienIndex(props) {
    // Hapus query parameter pada saat page load
    useEffect(() => {
        if (window.location.search) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const { errors } = usePage().props;

    const [date, setDate] = useState<Date>();
    const [month, setMonth] = useState(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const [tempatLahirOpen, setTempatLahirOpen] = useState(false);
    const [tempatLahirValue, setTempatLahirValue] = useState("");
    const [tempatLahirSearch, setTempatLahirSearch] = useState("");
    const dropdownRef = useRef(null);

    // State untuk dropdown jenis kelamin
    const [jenisKelaminOpen, setJenisKelaminOpen] = useState(false);
    const [jenisKelaminValue, setJenisKelaminValue] = useState("");
    const [jenisKelaminSearch, setJenisKelaminSearch] = useState("");
    const jkDropdownRef = useRef(null);

    const [agamaValue, setAgamaValue] = useState("");
    const [statusPerkawinanValue, setStatusPerkawinanValue] = useState("");
    const [pekerjaanValue, setPekerjaanValue] = useState("");
    const [pendidikanValue, setPendidikanValue] = useState("");
    const [kewarganegaraanValue, setKewarganegaraanValue] = useState("");

    const [gelarDepan, setGelarDepan] = useState("");
    const [nama, setNama] = useState("");
    const [gelarBelakang, setGelarBelakang] = useState("");
    const [namaPanggilan, setNamaPanggilan] = useState("");

    const [isPasienTidakDikenal, setIsPasienTidakDikenal] = useState(false);

    // Card Alamat Pasien
    const [alamatPasien, setAlamatPasien] = useState("");
    const [rukunTetangga, setRukunTetangga] = useState("");
    const [rukunWarga, setRukunWarga] = useState("");
    const [kodePos, setKodePos] = useState("");

    const [provinsi, setProvinsi] = useState(props.provinsi || []);
    const [kabupaten, setKabupaten] = useState([]);
    const [kecamatan, setKecamatan] = useState([]);
    const [kelurahan, setKelurahan] = useState([]);
    const [alamatProvinsi, setAlamatProvinsi] = useState("");
    const [alamatKabupaten, setAlamatKabupaten] = useState("");
    const [alamatKecamatan, setAlamatKecamatan] = useState("");
    const [alamatKelurahan, setAlamatKelurahan] = useState("");

    // Provinsi sudah di-load dari props, kabupaten dinamis:
    useEffect(() => {
        setAlamatKabupaten("");
        setKabupaten([]);
        setAlamatKecamatan("");
        setKecamatan([]);
        setAlamatKelurahan("");
        setKelurahan([]);
        if (alamatProvinsi) {
            router.get(
                route('master.pasien.create', { jenis: 2, parent: alamatProvinsi }),
                {},
                {
                    preserveState: true,
                    only: ['wilayah'],
                    onSuccess: (page) => {
                        setKabupaten(page.props.wilayah || []);
                    },
                }
            );
        }
    }, [alamatProvinsi]);

    useEffect(() => {
        setAlamatKecamatan("");
        setKecamatan([]);
        setAlamatKelurahan("");
        setKelurahan([]);
        if (alamatKabupaten) {
            router.get(
                route('master.pasien.create', { jenis: 3, parent: alamatKabupaten }),
                {},
                {
                    preserveState: true,
                    only: ['wilayah'],
                    onSuccess: (page) => {
                        setKecamatan(page.props.wilayah || []);
                    },
                }
            );
        }
    }, [alamatKabupaten]);

    useEffect(() => {
        setAlamatKelurahan("");
        setKelurahan([]);
        if (alamatKecamatan) {
            router.get(
                route('master.pasien.create', { jenis: 4, parent: alamatKecamatan }),
                {},
                {
                    preserveState: true,
                    only: ['wilayah'],
                    onSuccess: (page) => {
                        setKelurahan(page.props.wilayah || []);
                    },
                }
            );
        }
    }, [alamatKecamatan]);

    // SET DEFAULT PROVINSI DAN KABUPATEN
    useEffect(() => {
        // Set default provinsi ke "JAWA TIMUR" jika belum ada
        if (!alamatProvinsi && provinsi.length > 0) {
            const defaultProv = provinsi.find(item => item.DESKRIPSI?.toUpperCase() === "JAWA TIMUR");
            if (defaultProv) {
                setAlamatProvinsi(defaultProv.ID.toString());
            }
        }
        // eslint-disable-next-line
    }, [provinsi]);

    useEffect(() => {
        // Set default kabupaten ke "BOJONEGORO" jika belum ada
        if (kabupaten.length > 0 && alamatProvinsi && !alamatKabupaten) {
            const defaultKab = kabupaten.find(item => item.DESKRIPSI?.toUpperCase() === "BOJONEGORO");
            if (defaultKab) {
                setAlamatKabupaten(defaultKab.ID.toString());
            }
        }
        // eslint-disable-next-line
    }, [kabupaten, alamatProvinsi]);

    //Card Telepon Pasien
    // Cari ID jenis kontak "Telepon Seluler"
    const defaultJenisKontak = (props.jenisKontak ?? []).find(item => item.DESKRIPSI?.toUpperCase() === "TELEPON SELULER");
    const [jenisKontak, setJenisKontak] = useState(defaultJenisKontak ? defaultJenisKontak.ID.toString() : "");
    const [teleponPasien, setTeleponPasien] = useState("");

    // Card Kartu Identitas Pasien
    // Cari ID jenis identitas "Kartu Tanda Penduduk (KTP)"
    const defaultJenisIdentitas = (props.jenisIdentitas ?? []).find(
        item => item.DESKRIPSI?.toUpperCase() === "KARTU TANDA PENDUDUK (KTP)"
    );
    const [jenisIdentitas, setJenisIdentitas] = useState(
        defaultJenisIdentitas ? defaultJenisIdentitas.ID.toString() : ""
    );
    const [nomorIdentitas, setNomorIdentitas] = useState("");
    const [kartuAlamatPasien, setKartuAlamatPasien] = useState("");
    const [kartuRukunTetangga, setKartuRukunTetangga] = useState("");
    const [kartuRukunWarga, setKartuRukunWarga] = useState("");
    const [kartuKodePos, setKartuKodePos] = useState("");
    const [kartuAlamatProvinsi, setKartuAlamatProvinsi] = useState("");
    const [kartuAlamatKabupaten, setKartuAlamatKabupaten] = useState("");
    const [kartuAlamatKecamatan, setKartuAlamatKecamatan] = useState("");
    const [kartuAlamatKelurahan, setKartuAlamatKelurahan] = useState("");

    // Set default kartuAlamatProvinsi ke "JAWA TIMUR"
    useEffect(() => {
        if (!kartuAlamatProvinsi && provinsi.length > 0) {
            const defaultProv = provinsi.find(item => item.DESKRIPSI?.toUpperCase() === "JAWA TIMUR");
            if (defaultProv) {
                setKartuAlamatProvinsi(defaultProv.ID.toString());
            }
        }
    }, [provinsi]);

    // Set default kartuAlamatKabupaten ke "BOJONEGORO"
    useEffect(() => {
        if (
            kabupaten.length > 0 &&
            kartuAlamatProvinsi &&
            !kartuAlamatKabupaten
        ) {
            const defaultKab = kabupaten.find(item => item.DESKRIPSI?.toUpperCase() === "BOJONEGORO");
            if (defaultKab) {
                setKartuAlamatKabupaten(defaultKab.ID.toString());
            }
        }
    }, [kabupaten, kartuAlamatProvinsi]);

    // State untuk checkbox "Samakan dengan alamat pasien"
    const [ktpSamaDenganAlamat, setKtpSamaDenganAlamat] = useState(false);

    const handleCheckboxKtpAlamat = (checked) => {
        setKtpSamaDenganAlamat(checked);
        if (checked) {
            setKartuAlamatPasien(alamatPasien);
            setKartuRukunTetangga(rukunTetangga);
            setKartuRukunWarga(rukunWarga);
            setKartuKodePos(kodePos);
            setKartuAlamatProvinsi(alamatProvinsi);
            setKartuAlamatKabupaten(alamatKabupaten);
            setKartuAlamatKecamatan(alamatKecamatan);
            setKartuAlamatKelurahan(alamatKelurahan);
        }
    };

    // Card Keluarga Pasien
    const defaultHubunganKeluarga = (props.hubunganKeluarga ?? []).find(
        item => item.DESKRIPSI?.toUpperCase() === "ORANG TUA"
    );
    const [hubunganKeluarga, setHubunganKeluarga] = useState(
        defaultHubunganKeluarga ? defaultHubunganKeluarga.ID.toString() : ""
    );
    const [namaKeluarga, setNamaKeluarga] = useState("");
    const [tanggalLahirKeluarga, setTanggalLahirKeluarga] = useState<Date>();
    const [monthKeluarga, setMonthKeluarga] = useState(new Date());
    const [isCalendarOpenKeluarga, setIsCalendarOpenKeluarga] = useState(false);
    const [alamatKeluarga, setAlamatKeluarga] = useState("");
    const [rukunTetanggaKeluarga, setRukunTetanggaKeluarga] = useState("");
    const [rukunWargaKeluarga, setRukunWargaKeluarga] = useState("");
    const [kodePosKeluarga, setKodePosKeluarga] = useState("");
    const [alamatProvinsiKeluarga, setAlamatProvinsiKeluarga] = useState("");
    const [alamatKabupatenKeluarga, setAlamatKabupatenKeluarga] = useState("");
    const [alamatKecamatanKeluarga, setAlamatKecamatanKeluarga] = useState("");
    const [alamatKelurahanKeluarga, setAlamatKelurahanKeluarga] = useState("");
    const [teleponKeluarga, setTeleponKeluarga] = useState("");

    // Default Jenis Kelamin Keluarga: PEREMPUAN
    const defaultJenisKelaminKeluarga = (props.jenisKelamin ?? []).find(
        item => item.DESKRIPSI?.toUpperCase() === "PEREMPUAN"
    );
    const [jenisKelaminKeluarga, setJenisKelaminKeluarga] = useState(
        defaultJenisKelaminKeluarga ? defaultJenisKelaminKeluarga.ID.toString() : ""
    );

    // Default Pendidikan Keluarga (opsional, bisa kosong atau isi sesuai kebutuhan)
    const [pendidikanKeluarga, setPendidikanKeluarga] = useState("");

    // Default Pekerjaan Keluarga (opsional, bisa kosong atau isi sesuai kebutuhan)
    const [pekerjaanKeluarga, setPekerjaanKeluarga] = useState("");

    // Default Jenis Identitas Keluarga: KARTU TANDA PENDUDUK (KTP)
    const defaultJenisIdentitasKeluarga = (props.jenisIdentitas ?? []).find(
        item => item.DESKRIPSI?.toUpperCase() === "KARTU TANDA PENDUDUK (KTP)"
    );
    const [jenisIdentitasKeluarga, setJenisIdentitasKeluarga] = useState(
        defaultJenisIdentitasKeluarga ? defaultJenisIdentitasKeluarga.ID.toString() : ""
    );
    const [nomorIdentitasKeluarga, setNomorIdentitasKeluarga] = useState("");

    // Cari ID jenis kontak "Telepon Seluler"
    const defaultJenisKontakKeluarga = (props.jenisKontak ?? []).find(
        item => item.DESKRIPSI?.toUpperCase() === "TELEPON SELULER"
    );
    const [jenisKontakKeluarga, setJenisKontakKeluarga] = useState(
        defaultJenisKontakKeluarga ? defaultJenisKontakKeluarga.ID.toString() : ""
    );

    // Set default provinsi keluarga ke "JAWA TIMUR"
    useEffect(() => {
        if (!alamatProvinsiKeluarga && provinsi.length > 0) {
            const defaultProv = provinsi.find(item => item.DESKRIPSI?.toUpperCase() === "JAWA TIMUR");
            if (defaultProv) {
                setAlamatProvinsiKeluarga(defaultProv.ID.toString());
            }
        }
    }, [provinsi]);

    // Set default kabupaten keluarga ke "BOJONEGORO"
    useEffect(() => {
        if (
            kabupaten.length > 0 &&
            alamatProvinsiKeluarga &&
            !alamatKabupatenKeluarga
        ) {
            const defaultKab = kabupaten.find(item => item.DESKRIPSI?.toUpperCase() === "BOJONEGORO");
            if (defaultKab) {
                setAlamatKabupatenKeluarga(defaultKab.ID.toString());
            }
        }
    }, [kabupaten, alamatProvinsiKeluarga]);

    // Checkbox samakan alamat keluarga dengan pasien
    const [keluargaSamaDenganPasien, setKeluargaSamaDenganPasien] = useState(false);
    const handleCheckboxKeluargaAlamat = (checked) => {
        setKeluargaSamaDenganPasien(checked);
        if (checked) {
            setAlamatKeluarga(alamatPasien);
            setRukunTetanggaKeluarga(rukunTetangga);
            setRukunWargaKeluarga(rukunWarga);
            setKodePosKeluarga(kodePos);
            setAlamatProvinsiKeluarga(alamatProvinsi);
            setAlamatKabupatenKeluarga(alamatKabupaten);
            setAlamatKecamatanKeluarga(alamatKecamatan);
            setAlamatKelurahanKeluarga(alamatKelurahan);
        }
    };

    // State untuk warning
    const [warning, setWarning] = useState({});

    // Cari ID negara "INDONESIA"
    const indonesiaNegara = props.negara.find(item => item.DESKRIPSI?.toUpperCase() === "INDONESIA");
    const [negaraValue, setNegaraValue] = useState(indonesiaNegara ? indonesiaNegara.ID.toString() : "");

    // Cari ID status identitas "JAWA"
    const jawaStatusIdentitas = props.statusIdentitas.find(item => item.DESKRIPSI?.toUpperCase() === "JAWA");
    const [statusIdentitasValue, setStatusIdentitasValue] = useState(jawaStatusIdentitas ? jawaStatusIdentitas.ID.toString() : "");

    // Cari ID status aktif "HIDUP / AKTIF"
    const hidupAktif = props.statusAktif.find(item => item.DESKRIPSI?.toUpperCase() === "HIDUP / AKTIF");
    const [statusAktifValue, setStatusAktifValue] = useState(hidupAktif ? hidupAktif.ID.toString() : "");

    // Cari ID golongan darah "TIDAK TAHU"
    const tidakTahuGolDarah = props.golonganDarah.find(item => item.DESKRIPSI?.toUpperCase() === "TIDAK TAHU");
    const [golonganDarahValue, setGolonganDarahValue] = useState(tidakTahuGolDarah ? tidakTahuGolDarah.ID.toString() : "");

    // Filter sederhana
    const hasilFilter = props.tempatLahir.filter(city =>
        !tempatLahirSearch
            ? true
            : city.DESKRIPSI &&
            city.DESKRIPSI.toLowerCase().includes(tempatLahirSearch.toLowerCase())
    );

    const hasilFilterJK = props.jenisKelamin.filter(item =>
        !jenisKelaminSearch
            ? true
            : item.DESKRIPSI &&
            item.DESKRIPSI.toLowerCase().includes(jenisKelaminSearch.toLowerCase())
    );

    // Tutup dropdown jika klik di luar
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setTempatLahirOpen(false);
            }
            if (jkDropdownRef.current && !jkDropdownRef.current.contains(event.target)) {
                setJenisKelaminOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleSubmit(e) {
        e.preventDefault();

        // Validasi semua field wajib
        let newWarnings = {};

        // Identitas Pasien
        if (!nama) newWarnings.nama = "Nama wajib diisi";
        if (!tempatLahirValue) newWarnings.tempatLahirValue = "Tempat lahir wajib diisi";
        if (!date) newWarnings.date = "Tanggal lahir wajib diisi";
        if (!jenisKelaminValue) newWarnings.jenisKelaminValue = "Jenis kelamin wajib diisi";
        if (!agamaValue) newWarnings.agamaValue = "Agama wajib diisi";
        if (!statusPerkawinanValue) newWarnings.statusPerkawinanValue = "Status perkawinan wajib diisi";
        if (!pendidikanValue) newWarnings.pendidikanValue = "Pendidikan wajib diisi";
        if (!pekerjaanValue) newWarnings.pekerjaanValue = "Pekerjaan wajib diisi";
        if (!golonganDarahValue) newWarnings.golonganDarahValue = "Golongan darah wajib diisi";
        if (!negaraValue) newWarnings.negaraValue = "Negara wajib diisi";
        if (!statusIdentitasValue) newWarnings.statusIdentitasValue = "Status identitas wajib diisi";
        if (!statusAktifValue) newWarnings.statusAktifValue = "Status aktif wajib diisi";

        // Alamat Pasien
        if (!alamatPasien) newWarnings.alamatPasien = "Alamat pasien wajib diisi";
        if (!rukunTetangga) newWarnings.rukunTetangga = "RT wajib diisi";
        if (!rukunWarga) newWarnings.rukunWarga = "RW wajib diisi";
        if (!kodePos) newWarnings.kodePos = "Kode pos wajib diisi";
        if (!alamatProvinsi) newWarnings.alamatProvinsi = "Provinsi wajib diisi";
        if (!alamatKabupaten) newWarnings.alamatKabupaten = "Kabupaten wajib diisi";
        if (!alamatKecamatan) newWarnings.alamatKecamatan = "Kecamatan wajib diisi";
        if (!alamatKelurahan) newWarnings.alamatKelurahan = "Kelurahan wajib diisi";

        // Kartu Identitas Pasien
        if (!jenisIdentitas) newWarnings.jenisIdentitas = "Jenis identitas wajib diisi";
        if (!nomorIdentitas) newWarnings.nomorIdentitas = "Nomor identitas wajib diisi";
        if (!kartuAlamatPasien) newWarnings.kartuAlamatPasien = "Alamat KTP wajib diisi";
        if (!kartuRukunTetangga) newWarnings.kartuRukunTetangga = "RT KTP wajib diisi";
        if (!kartuRukunWarga) newWarnings.kartuRukunWarga = "RW KTP wajib diisi";
        if (!kartuKodePos) newWarnings.kartuKodePos = "Kode pos KTP wajib diisi";
        if (!kartuAlamatProvinsi) newWarnings.kartuAlamatProvinsi = "Provinsi KTP wajib diisi";
        if (!kartuAlamatKabupaten) newWarnings.kartuAlamatKabupaten = "Kabupaten KTP wajib diisi";
        if (!kartuAlamatKecamatan) newWarnings.kartuAlamatKecamatan = "Kecamatan KTP wajib diisi";
        if (!kartuAlamatKelurahan) newWarnings.kartuAlamatKelurahan = "Kelurahan KTP wajib diisi";

        // Kontak Pasien
        if (!jenisKontak) newWarnings.jenisKontak = "Jenis kontak wajib diisi";
        if (!teleponPasien) newWarnings.teleponPasien = "Telepon pasien wajib diisi";

        // Keluarga Pasien
        if (!hubunganKeluarga) newWarnings.hubunganKeluarga = "Hubungan keluarga wajib diisi";
        if (!namaKeluarga) newWarnings.namaKeluarga = "Nama keluarga wajib diisi";
        if (!tanggalLahirKeluarga) newWarnings.tanggalLahirKeluarga = "Tanggal lahir keluarga wajib diisi";
        if (!jenisKelaminKeluarga) newWarnings.jenisKelaminKeluarga = "Jenis kelamin keluarga wajib diisi";
        if (!pendidikanKeluarga) newWarnings.pendidikanKeluarga = "Pendidikan keluarga wajib diisi";
        if (!pekerjaanKeluarga) newWarnings.pekerjaanKeluarga = "Pekerjaan keluarga wajib diisi";
        if (!jenisKontakKeluarga) newWarnings.jenisKontakKeluarga = "Jenis kontak keluarga wajib diisi";
        if (!teleponKeluarga) newWarnings.teleponKeluarga = "Telepon keluarga wajib diisi";
        if (!jenisIdentitasKeluarga) newWarnings.jenisIdentitasKeluarga = "Jenis identitas keluarga wajib diisi";
        if (!nomorIdentitasKeluarga) newWarnings.nomorIdentitasKeluarga = "Nomor identitas keluarga wajib diisi";
        if (!alamatKeluarga) newWarnings.alamatKeluarga = "Alamat keluarga wajib diisi";
        if (!rukunTetanggaKeluarga) newWarnings.rukunTetanggaKeluarga = "RT keluarga wajib diisi";
        if (!rukunWargaKeluarga) newWarnings.rukunWargaKeluarga = "RW keluarga wajib diisi";
        if (!kodePosKeluarga) newWarnings.kodePosKeluarga = "Kode pos keluarga wajib diisi";
        if (!alamatProvinsiKeluarga) newWarnings.alamatProvinsiKeluarga = "Provinsi keluarga wajib diisi";
        if (!alamatKabupatenKeluarga) newWarnings.alamatKabupatenKeluarga = "Kabupaten keluarga wajib diisi";
        if (!alamatKecamatanKeluarga) newWarnings.alamatKecamatanKeluarga = "Kecamatan keluarga wajib diisi";
        if (!alamatKelurahanKeluarga) newWarnings.alamatKelurahanKeluarga = "Kelurahan keluarga wajib diisi";

        setWarning(newWarnings);

        if (Object.keys(newWarnings).length > 0) {
            // Jika ada warning, jangan submit
            return;
        }

        // Kirim semua field ke controller
        router.post(route('master.pasien.store'), {
            // Identitas Pasien
            gelar_depan: gelarDepan,
            nama,
            gelar_belakang: gelarBelakang,
            nama_panggilan: namaPanggilan,
            tempat_lahir: tempatLahirValue,
            tanggal_lahir: date,
            jenis_kelamin: jenisKelaminValue,
            agama: agamaValue,
            status_perkawinan: statusPerkawinanValue,
            pendidikan: pendidikanValue,
            pekerjaan: pekerjaanValue,
            golongan_darah: golonganDarahValue,
            negara: negaraValue,
            status_identitas: statusIdentitasValue,
            status_aktif: statusAktifValue,

            // Alamat Pasien
            alamat_pasien: alamatPasien,
            rukun_tetangga: rukunTetangga,
            rukun_warga: rukunWarga,
            kode_pos: kodePos,
            alamat_provinsi: alamatProvinsi,
            alamat_kabupaten: alamatKabupaten,
            alamat_kecamatan: alamatKecamatan,
            alamat_kelurahan: alamatKelurahan,

            // Kartu Identitas Pasien
            jenis_identitas: jenisIdentitas,
            nomor_identitas: nomorIdentitas,
            kartu_alamat_pasien: kartuAlamatPasien,
            kartu_rukun_tetangga: kartuRukunTetangga,
            kartu_rukun_warga: kartuRukunWarga,
            kartu_kode_pos: kartuKodePos,
            kartu_alamat_provinsi: kartuAlamatProvinsi,
            kartu_alamat_kabupaten: kartuAlamatKabupaten,
            kartu_alamat_kecamatan: kartuAlamatKecamatan,
            kartu_alamat_kelurahan: kartuAlamatKelurahan,

            // Kontak Pasien
            jenis_kontak: jenisKontak,
            telepon_pasien: teleponPasien,

            // Keluarga Pasien
            hubungan_keluarga: hubunganKeluarga,
            nama_keluarga: namaKeluarga,
            tanggal_lahir_keluarga: tanggalLahirKeluarga,
            jenis_kelamin_keluarga: jenisKelaminKeluarga,
            pendidikan_keluarga: pendidikanKeluarga,
            pekerjaan_keluarga: pekerjaanKeluarga,
            jenis_kontak_keluarga: jenisKontakKeluarga,
            telepon_keluarga: teleponKeluarga,
            jenis_identitas_keluarga: jenisIdentitasKeluarga,
            nomor_identitas_keluarga: nomorIdentitasKeluarga,
            alamat_keluarga: alamatKeluarga,
            rukun_tetangga_keluarga: rukunTetanggaKeluarga,
            rukun_warga_keluarga: rukunWargaKeluarga,
            kode_pos_keluarga: kodePosKeluarga,
            alamat_provinsi_keluarga: alamatProvinsiKeluarga,
            alamat_kabupaten_keluarga: alamatKabupatenKeluarga,
            alamat_kecamatan_keluarga: alamatKecamatanKeluarga,
            alamat_kelurahan_keluarga: alamatKelurahanKeluarga,
        });
    }

    function handleReset() {
        // Cari default provinsi dan kabupaten
        const defaultProv = provinsi.find(item => item.DESKRIPSI?.toUpperCase() === "JAWA TIMUR");
        const defaultKab = kabupaten.find(item => item.DESKRIPSI?.toUpperCase() === "BOJONEGORO");

        // Identitas Pasien
        setGelarDepan("");
        setNama("");
        setGelarBelakang("");
        setNamaPanggilan("");
        setTempatLahirValue("");
        setDate(undefined);
        setJenisKelaminValue("");
        setAgamaValue("");
        setStatusPerkawinanValue("");
        setPendidikanValue("");
        setPekerjaanValue("");
        setGolonganDarahValue(tidakTahuGolDarah ? tidakTahuGolDarah.ID.toString() : "");
        setNegaraValue(indonesiaNegara ? indonesiaNegara.ID.toString() : "");
        setStatusIdentitasValue(jawaStatusIdentitas ? jawaStatusIdentitas.ID.toString() : "");
        setStatusAktifValue(hidupAktif ? hidupAktif.ID.toString() : "");

        // Alamat Pasien
        setAlamatPasien("");
        setRukunTetangga("");
        setRukunWarga("");
        setKodePos("");
        setAlamatProvinsi(defaultProv ? defaultProv.ID.toString() : "");
        setAlamatKabupaten(defaultKab ? defaultKab.ID.toString() : "");
        setAlamatKecamatan("");
        setAlamatKelurahan("");

        // Kartu Identitas Pasien
        setJenisIdentitas(defaultJenisIdentitas ? defaultJenisIdentitas.ID.toString() : "");
        setNomorIdentitas("");
        setKartuAlamatPasien("");
        setKartuRukunTetangga("");
        setKartuRukunWarga("");
        setKartuKodePos("");
        setKartuAlamatProvinsi(defaultProv ? defaultProv.ID.toString() : "");
        setKartuAlamatKabupaten(defaultKab ? defaultKab.ID.toString() : "");
        setKartuAlamatKecamatan("");
        setKartuAlamatKelurahan("");

        // Kontak Pasien
        setJenisKontak(defaultJenisKontak ? defaultJenisKontak.ID.toString() : "");
        setTeleponPasien("");

        // Keluarga Pasien
        setHubunganKeluarga(defaultHubunganKeluarga ? defaultHubunganKeluarga.ID.toString() : "");
        setNamaKeluarga("");
        setTanggalLahirKeluarga(undefined);
        setJenisKelaminKeluarga(defaultJenisKelaminKeluarga ? defaultJenisKelaminKeluarga.ID.toString() : "");
        setPendidikanKeluarga("");
        setPekerjaanKeluarga("");
        setJenisKontakKeluarga(defaultJenisKontakKeluarga ? defaultJenisKontakKeluarga.ID.toString() : "");
        setTeleponKeluarga("");
        setJenisIdentitasKeluarga(defaultJenisIdentitasKeluarga ? defaultJenisIdentitasKeluarga.ID.toString() : "");
        setNomorIdentitasKeluarga("");
        setAlamatKeluarga("");
        setRukunTetanggaKeluarga("");
        setRukunWargaKeluarga("");
        setKodePosKeluarga("");
        setAlamatProvinsiKeluarga(defaultProv ? defaultProv.ID.toString() : "");
        setAlamatKabupatenKeluarga(defaultKab ? defaultKab.ID.toString() : "");
        setAlamatKecamatanKeluarga("");
        setAlamatKelurahanKeluarga("");

        setWarning({});
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Pasien" />
            <div className="p-4">
                <form onSubmit={handleSubmit}>
                    <Card className="w-full shadow-sm -py-6">
                        <CardHeader className="flex flex-row items-center justify-between p-4 bg-gray-50 border-b">
                            <div className="flex items-center space-x-2">
                                <User className="h-5 w-5 text-gray-500" />
                                <h3 className="text-base font-medium">Identitas Pasien</h3>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="pasienTidakDikenal" className="text-sm">
                                    Pasien Tidak Dikenal
                                </Label>
                                <Checkbox
                                    id="pasienTidakDikenal"
                                    checked={isPasienTidakDikenal}
                                    onCheckedChange={setIsPasienTidakDikenal}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="pb-4">

                            {/* Baris 1 */}
                            <div className="grid grid-cols-12 gap-2 mb-2">
                                <div className="col-span-2">
                                    <Input
                                        placeholder="Gelar Depan"
                                        className="w-full"
                                        value={gelarDepan}
                                        onChange={e => setGelarDepan(e.target.value)}
                                        name="gelar_depan"
                                        disabled={isPasienTidakDikenal}
                                    />
                                </div>
                                <div className="col-span-6">
                                    <Input
                                        placeholder="Masukkan Nama Tanpa Gelar"
                                        className="w-full"
                                        value={nama}
                                        onChange={e => setNama(e.target.value)}
                                        name="nama"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Input
                                        placeholder="Gelar Blkg"
                                        className="w-full"
                                        value={gelarBelakang}
                                        onChange={e => setGelarBelakang(e.target.value)}
                                        name="gelar_belakang"
                                        disabled={isPasienTidakDikenal}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <div className="flex items-center space-x-1">
                                        <span className="text-gray-500">/</span>
                                        <Input
                                            placeholder="Masukkan Nama Panggilan"
                                            className="w-full"
                                            value={namaPanggilan}
                                            onChange={e => setNamaPanggilan(e.target.value)}
                                            name="nama_panggilan"
                                            disabled={isPasienTidakDikenal}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Baris 2 */}
                            <div className="grid grid-cols-9 gap-2 mb-2">
                                <div className="col-span-3">
                                    <SearchableDropdown
                                        data={props.tempatLahir}
                                        value={tempatLahirValue}
                                        setValue={setTempatLahirValue}
                                        placeholder="Tempat Lahir"
                                        disabled={isPasienTidakDikenal}
                                    />
                                    {errors.tempatLahirValue && (
                                        <div className="text-xs text-red-500 mt-1">{errors.tempatLahirValue}</div>
                                    )}
                                </div>
                                <div className="col-span-3">
                                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className="w-full justify-start text-left font-normal border border-gray-200 rounded-md px-3 py-2 shadow-sm"
                                                disabled={isPasienTidakDikenal}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                                                {date ? format(date, "dd/MM/yyyy") : "Pilih tanggal lahir"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 border rounded-md shadow-md max-w-[95vw] sm:max-w-[350px]" align="start">
                                            <div className="p-2 border-b">
                                                <div className="flex w-full">
                                                    <Select
                                                        value={format(month, "MMMM")}
                                                        onValueChange={(value) => {
                                                            const newDate = new Date(month);
                                                            const monthIndex = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(value);
                                                            newDate.setMonth(monthIndex);
                                                            setMonth(newDate);
                                                        }}
                                                    >
                                                        <SelectTrigger className="rounded-r-none border-r-0 text-sm h-9 flex-1">
                                                            <SelectValue>{format(month, "MMMM")}</SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent className="max-h-60">
                                                            <SelectItem value="January">January</SelectItem>
                                                            <SelectItem value="February">February</SelectItem>
                                                            <SelectItem value="March">March</SelectItem>
                                                            <SelectItem value="April">April</SelectItem>
                                                            <SelectItem value="May">May</SelectItem>
                                                            <SelectItem value="June">June</SelectItem>
                                                            <SelectItem value="July">July</SelectItem>
                                                            <SelectItem value="August">August</SelectItem>
                                                            <SelectItem value="September">September</SelectItem>
                                                            <SelectItem value="October">October</SelectItem>
                                                            <SelectItem value="November">November</SelectItem>
                                                            <SelectItem value="December">December</SelectItem>
                                                        </SelectContent>
                                                    </Select>

                                                    <Select
                                                        value={format(month, "yyyy")}
                                                        onValueChange={(value) => {
                                                            const newDate = new Date(month);
                                                            newDate.setFullYear(parseInt(value));
                                                            setMonth(newDate);
                                                        }}
                                                    >
                                                        <SelectTrigger className="rounded-l-none border-l-0 text-sm h-9 flex-1">
                                                            <SelectValue>{format(month, "yyyy")}</SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent className="max-h-60 overflow-y-auto">
                                                            {Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => (
                                                                <SelectItem key={i} value={(1900 + i).toString()}>
                                                                    {1900 + i}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="p-2">
                                                <div className="grid grid-cols-7 text-center">
                                                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                                                        <div key={day} className="text-xs font-medium text-gray-500 py-2">
                                                            {day}
                                                        </div>
                                                    ))}
                                                </div>

                                                <Calendar
                                                    mode="single"
                                                    selected={date}
                                                    onSelect={setDate}
                                                    month={month}
                                                    onMonthChange={setMonth}
                                                    disabled={(date) => date > new Date()}
                                                    className="border-none shadow-none p-0"
                                                    classNames={{
                                                        day_today: "bg-muted text-foreground",
                                                        day_selected: "bg-green-500 text-white hover:bg-green-500 hover:text-white focus:bg-green-500 focus:text-white",
                                                        cell: "h-10 w-10 sm:h-9 sm:w-9 text-center p-0 relative [&:has([aria-selected])]:rounded-md focus-within:relative touch-manipulation",
                                                        day: "h-10 w-10 sm:h-9 sm:w-9 p-0 font-normal aria-selected:opacity-100 rounded-md",
                                                        table: "border-collapse w-full",
                                                        head_row: "flex",
                                                        row: "flex w-full mt-1",
                                                    }}
                                                />

                                                <div className="border-t mt-2 pt-2 flex justify-end">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="mr-2 h-9 text-xs px-4"
                                                        onClick={() => {
                                                            const today = new Date();
                                                            setDate(today);
                                                            setMonth(today);
                                                        }}
                                                    >
                                                        Hari Ini
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="h-9 text-xs px-4 bg-green-500 hover:bg-green-600"
                                                        onClick={() => {
                                                            if (date) {
                                                                // Menggunakan state untuk menutup popover
                                                                setIsCalendarOpen(false);
                                                            }
                                                        }}
                                                        disabled={!date}
                                                    >
                                                        Pilih
                                                    </Button>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="col-span-3">
                                    <SearchableDropdown
                                        data={props.jenisKelamin}
                                        value={jenisKelaminValue}
                                        setValue={setJenisKelaminValue}
                                        placeholder="Jenis Kelamin"
                                        disabled={isPasienTidakDikenal}
                                    />
                                </div>
                            </div>

                            {/* Baris 3 */}
                            <div className="grid grid-cols-12 gap-2 mb-2">
                                <div className="col-span-3">
                                    <SearchableDropdown
                                        data={props.agama}
                                        value={agamaValue}
                                        setValue={setAgamaValue}
                                        placeholder="Agama"
                                        disabled={isPasienTidakDikenal}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <SearchableDropdown
                                        data={props.statusPerkawinan}
                                        value={statusPerkawinanValue}
                                        setValue={setStatusPerkawinanValue}
                                        placeholder="Status Perkawinan"
                                        disabled={isPasienTidakDikenal}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <SearchableDropdown
                                        data={props.pendidikan}
                                        value={pendidikanValue}
                                        setValue={setPendidikanValue}
                                        placeholder="Pendidikan"
                                        disabled={isPasienTidakDikenal}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <SearchableDropdown
                                        data={props.pekerjaan}
                                        value={pekerjaanValue}
                                        setValue={setPekerjaanValue}
                                        placeholder="Pekerjaan"
                                        disabled={isPasienTidakDikenal}
                                    />
                                </div>
                            </div>

                            {/* Baris 4 */}
                            <div className="grid grid-cols-12 gap-2">
                                <div className="col-span-3">
                                    <SearchableDropdown
                                        data={props.golonganDarah}
                                        value={golonganDarahValue}
                                        setValue={setGolonganDarahValue}
                                        placeholder="Golongan Darah"
                                        disabled={isPasienTidakDikenal}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <SearchableDropdown
                                        data={props.negara}
                                        value={negaraValue}
                                        setValue={setNegaraValue}
                                        placeholder="Negara"
                                        disabled={isPasienTidakDikenal}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <SearchableDropdown
                                        data={props.statusIdentitas}
                                        value={statusIdentitasValue}
                                        setValue={setStatusIdentitasValue}
                                        placeholder="Status Identitas"
                                        disabled={isPasienTidakDikenal}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <SearchableDropdown
                                        data={props.statusAktif}
                                        value={statusAktifValue}
                                        setValue={setStatusAktifValue}
                                        placeholder="Status Aktif"
                                        disabled={isPasienTidakDikenal}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex gap-4 mt-4">
                        <Card className="w-1/2 shadow-sm -py-6">
                            <CardHeader className="flex flex-row items-center justify-between p-4 bg-gray-50 border-b">
                                <div className="flex items-center space-x-2">
                                    <Home className="h-5 w-5 text-gray-500" />
                                    <h3 className="text-base font-medium">Alamat Pasien</h3>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <div className="grid grid-cols-12 gap-2 mb-2">
                                    <div className="col-span-12">
                                        <div className="flex items-center space-x-1">
                                            <Input
                                                placeholder="Masukkan Alamat Pasien"
                                                className="w-full"
                                                value={alamatPasien}
                                                onChange={e => setAlamatPasien(e.target.value)}
                                                name="alamat_pasien"
                                                disabled={isPasienTidakDikenal}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-4">
                                        <div className="flex items-center space-x-1">
                                            <Input
                                                placeholder="Masukkan Rukun Tetangga"
                                                className="w-full"
                                                value={rukunTetangga}
                                                onChange={e => setRukunTetangga(e.target.value)}
                                                name="rukun_tetangga"
                                                disabled={isPasienTidakDikenal}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-4">
                                        <div className="flex items-center space-x-1">
                                            <Input
                                                placeholder="Masukkan Rukun Warga"
                                                className="w-full"
                                                value={rukunWarga}
                                                onChange={e => setRukunWarga(e.target.value)}
                                                name="rukun_warga"
                                                disabled={isPasienTidakDikenal}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-4">
                                        <div className="flex items-center space-x-1">
                                            <Input
                                                placeholder="Masukkan Kode Pos"
                                                className="w-full"
                                                value={kodePos}
                                                onChange={e => setKodePos(e.target.value)}
                                                name="kode_pos"
                                                disabled={isPasienTidakDikenal}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-6">
                                        <SearchableDropdown
                                            data={provinsi}
                                            value={alamatProvinsi}
                                            setValue={setAlamatProvinsi}
                                            placeholder="Masukkan Provinsi"
                                            disabled={isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-6">
                                        <SearchableDropdown
                                            data={kabupaten}
                                            value={alamatKabupaten}
                                            setValue={setAlamatKabupaten}
                                            placeholder="Masukkan Kabupaten"
                                            disabled={isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-6">
                                        <SearchableDropdown
                                            data={kecamatan}
                                            value={alamatKecamatan}
                                            setValue={setAlamatKecamatan}
                                            placeholder="Masukkan Kecamatan"
                                            disabled={isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-6">
                                        <SearchableDropdown
                                            data={kelurahan}
                                            value={alamatKelurahan}
                                            setValue={setAlamatKelurahan}
                                            placeholder="Masukkan Kelurahan"
                                            disabled={isPasienTidakDikenal}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="w-1/2 shadow-sm -py-6 h-2/3">
                            <CardHeader className="flex flex-row items-center justify-between p-4 bg-gray-50 border-b">
                                <div className="flex items-center space-x-2">
                                    <PhoneCall className="h-5 w-5 text-gray-500" />
                                    <h3 className="text-base font-medium">Kontak Pasien</h3>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <div className="grid grid-cols-12 gap-2 mb-2">
                                    <div className="col-span-6">
                                        <SearchableDropdown
                                            data={props.jenisKontak ?? []}
                                            value={jenisKontak}
                                            setValue={setJenisKontak}
                                            placeholder="Pilih Jenis Kontak"
                                            disabled={isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-6">
                                        <div className="flex items-center space-x-1">
                                            <Input
                                                placeholder="Masukkan Telepon Pasien"
                                                className="w-full"
                                                value={teleponPasien}
                                                onChange={e => setTeleponPasien(e.target.value)}
                                                name="telepon_pasien"
                                                disabled={isPasienTidakDikenal}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="flex gap-4 mt-4">

                        <Card className="w-1/2 shadow-sm -py-6">
                            <CardHeader className="flex flex-row items-center justify-between p-4 bg-gray-50 border-b">
                                <div className="flex items-center space-x-2">
                                    <IdCard className="h-5 w-5 text-gray-500" />
                                    <h3 className="text-base font-medium">Kartu Identitas Pasien</h3>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="ktpSamaDenganAlamat"
                                        checked={ktpSamaDenganAlamat}
                                        onCheckedChange={handleCheckboxKtpAlamat}
                                    />
                                    <Label htmlFor="ktpSamaDenganAlamat" className="text-sm">
                                        Samakan dengan alamat pasien
                                    </Label>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <div className="grid grid-cols-12 gap-2 mb-2">
                                    <div className="col-span-6">
                                        <SearchableDropdown
                                            data={props.jenisIdentitas ?? []}
                                            value={jenisIdentitas}
                                            setValue={setJenisIdentitas}
                                            placeholder="Pilih Jenis Identitas"
                                            disabled={isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-6">
                                        <div className="flex items-center space-x-1">
                                            <Input
                                                placeholder="Masukkan Nomor Identitas Pasien"
                                                className="w-full"
                                                value={nomorIdentitas}
                                                onChange={e => setNomorIdentitas(e.target.value)}
                                                name="nomor_identitas"
                                                disabled={isPasienTidakDikenal}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-12">
                                        <Input
                                            placeholder="Masukkan Alamat Pasien"
                                            className="w-full"
                                            value={kartuAlamatPasien}
                                            onChange={e => setKartuAlamatPasien(e.target.value)}
                                            name="alamat_pasien_ktp"
                                            disabled={ktpSamaDenganAlamat || isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <Input
                                            placeholder="Masukkan Rukun Tetangga"
                                            className="w-full"
                                            value={kartuRukunTetangga}
                                            onChange={e => setKartuRukunTetangga(e.target.value)}
                                            name="rukun_tetangga_ktp"
                                            disabled={ktpSamaDenganAlamat || isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <Input
                                            placeholder="Masukkan Rukun Warga"
                                            className="w-full"
                                            value={kartuRukunWarga}
                                            onChange={e => setKartuRukunWarga(e.target.value)}
                                            name="rukun_warga_ktp"
                                            disabled={ktpSamaDenganAlamat || isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <Input
                                            placeholder="Masukkan Kode Pos"
                                            className="w-full"
                                            value={kartuKodePos}
                                            onChange={e => setKartuKodePos(e.target.value)}
                                            name="kode_pos_ktp"
                                            disabled={ktpSamaDenganAlamat || isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-6">
                                        <SearchableDropdown
                                            data={provinsi}
                                            value={kartuAlamatProvinsi}
                                            setValue={setKartuAlamatProvinsi}
                                            placeholder="Masukkan Provinsi"
                                            disabled={ktpSamaDenganAlamat || isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-6">
                                        <SearchableDropdown
                                            data={kabupaten}
                                            value={kartuAlamatKabupaten}
                                            setValue={setKartuAlamatKabupaten}
                                            placeholder="Masukkan Kabupaten"
                                            disabled={ktpSamaDenganAlamat || isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-6">
                                        <SearchableDropdown
                                            data={kecamatan}
                                            value={kartuAlamatKecamatan}
                                            setValue={setKartuAlamatKecamatan}
                                            placeholder="Masukkan Kecamatan"
                                            disabled={ktpSamaDenganAlamat || isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-6">
                                        <SearchableDropdown
                                            data={kelurahan}
                                            value={kartuAlamatKelurahan}
                                            setValue={setKartuAlamatKelurahan}
                                            placeholder="Masukkan Kelurahan"
                                            disabled={ktpSamaDenganAlamat || isPasienTidakDikenal}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="w-1/2 shadow-sm -py-6">
                            <CardHeader className="flex flex-row items-center justify-between p-4 bg-gray-50 border-b">
                                <div className="flex items-center space-x-2">
                                    <Users2 className="h-5 w-5 text-gray-500" />
                                    <h3 className="text-base font-medium">Keluarga Pasien</h3>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="keluargaSamaDenganPasien"
                                        checked={keluargaSamaDenganPasien}
                                        onCheckedChange={handleCheckboxKeluargaAlamat}
                                    />
                                    <Label htmlFor="keluargaSamaDenganPasien" className="text-sm">
                                        Samakan dengan alamat pasien
                                    </Label>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <div className="grid grid-cols-12 gap-2 mb-2">
                                    <div className="col-span-4">
                                        <SearchableDropdown
                                            data={props.hubunganKeluarga ?? []}
                                            value={hubunganKeluarga}
                                            setValue={setHubunganKeluarga}
                                            placeholder="Hubungan Keluarga"
                                            disabled={isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <Input
                                            placeholder="Nama Keluarga"
                                            className="w-full"
                                            value={namaKeluarga}
                                            onChange={e => setNamaKeluarga(e.target.value)}
                                            name="nama_keluarga"
                                            disabled={isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        {/* Calendar untuk tanggal lahir keluarga */}
                                        <Popover open={isCalendarOpenKeluarga} onOpenChange={setIsCalendarOpenKeluarga}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className="w-full justify-start text-left font-normal border border-gray-200 rounded-md px-3 py-2 shadow-sm"
                                                    disabled={isPasienTidakDikenal}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                                                    {tanggalLahirKeluarga ? format(tanggalLahirKeluarga, "dd/MM/yyyy") : "Pilih tanggal lahir keluarga"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 border rounded-md shadow-md max-w-[95vw] sm:max-w-[350px]" align="start">
                                                <div className="p-2 border-b">
                                                    <div className="flex w-full">
                                                        <Select
                                                            value={format(monthKeluarga, "MMMM")}
                                                            onValueChange={(value) => {
                                                                const newDate = new Date(monthKeluarga);
                                                                const monthIndex = [
                                                                    "January", "February", "March", "April", "May", "June",
                                                                    "July", "August", "September", "October", "November", "December"
                                                                ].indexOf(value);
                                                                newDate.setMonth(monthIndex);
                                                                setMonthKeluarga(newDate);
                                                            }}
                                                        >
                                                            <SelectTrigger className="rounded-r-none border-r-0 text-sm h-9 flex-1">
                                                                <SelectValue>{format(monthKeluarga, "MMMM")}</SelectValue>
                                                            </SelectTrigger>
                                                            <SelectContent className="max-h-60">
                                                                <SelectItem value="January">January</SelectItem>
                                                                <SelectItem value="February">February</SelectItem>
                                                                <SelectItem value="March">March</SelectItem>
                                                                <SelectItem value="April">April</SelectItem>
                                                                <SelectItem value="May">May</SelectItem>
                                                                <SelectItem value="June">June</SelectItem>
                                                                <SelectItem value="July">July</SelectItem>
                                                                <SelectItem value="August">August</SelectItem>
                                                                <SelectItem value="September">September</SelectItem>
                                                                <SelectItem value="October">October</SelectItem>
                                                                <SelectItem value="November">November</SelectItem>
                                                                <SelectItem value="December">December</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Select
                                                            value={format(monthKeluarga, "yyyy")}
                                                            onValueChange={(value) => {
                                                                const newDate = new Date(monthKeluarga);
                                                                newDate.setFullYear(parseInt(value));
                                                                setMonthKeluarga(newDate);
                                                            }}
                                                        >
                                                            <SelectTrigger className="rounded-l-none border-l-0 text-sm h-9 flex-1">
                                                                <SelectValue>{format(monthKeluarga, "yyyy")}</SelectValue>
                                                            </SelectTrigger>
                                                            <SelectContent className="max-h-60 overflow-y-auto">
                                                                {Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => (
                                                                    <SelectItem key={i} value={(1900 + i).toString()}>
                                                                        {1900 + i}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="p-2">
                                                    <div className="grid grid-cols-7 text-center">
                                                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                                                            <div key={day} className="text-xs font-medium text-gray-500 py-2">
                                                                {day}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <Calendar
                                                        mode="single"
                                                        selected={tanggalLahirKeluarga}
                                                        onSelect={setTanggalLahirKeluarga}
                                                        month={monthKeluarga}
                                                        onMonthChange={setMonthKeluarga}
                                                        disabled={(date) => date > new Date()}
                                                        className="border-none shadow-none p-0"
                                                        classNames={{
                                                            day_today: "bg-muted text-foreground",
                                                            day_selected: "bg-green-500 text-white hover:bg-green-500 hover:text-white focus:bg-green-500 focus:text-white",
                                                            cell: "h-10 w-10 sm:h-9 sm:w-9 text-center p-0 relative [&:has([aria-selected])]:rounded-md focus-within:relative touch-manipulation",
                                                            day: "h-10 w-10 sm:h-9 sm:w-9 p-0 font-normal aria-selected:opacity-100 rounded-md",
                                                            table: "border-collapse w-full",
                                                            head_row: "flex",
                                                            row: "flex w-full mt-1",
                                                        }}
                                                    />
                                                    <div className="border-t mt-2 pt-2 flex justify-end">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="mr-2 h-9 text-xs px-4"
                                                            onClick={() => {
                                                                const today = new Date();
                                                                setTanggalLahirKeluarga(today);
                                                                setMonthKeluarga(today);
                                                            }}
                                                        >
                                                            Hari Ini
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="h-9 text-xs px-4 bg-green-500 hover:bg-green-600"
                                                            onClick={() => {
                                                                if (tanggalLahirKeluarga) {
                                                                    setIsCalendarOpenKeluarga(false);
                                                                }
                                                            }}
                                                            disabled={!tanggalLahirKeluarga}
                                                        >
                                                            Pilih
                                                        </Button>
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="col-span-4">
                                        <SearchableDropdown
                                            data={props.jenisKelamin ?? []}
                                            value={jenisKelaminKeluarga}
                                            setValue={setJenisKelaminKeluarga}
                                            placeholder="Jenis Kelamin"
                                            disabled={isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <SearchableDropdown
                                            data={props.pendidikan ?? []}
                                            value={pendidikanKeluarga}
                                            setValue={setPendidikanKeluarga}
                                            placeholder="Pendidikan"
                                            disabled={isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <SearchableDropdown
                                            data={props.pekerjaan ?? []}
                                            value={pekerjaanKeluarga}
                                            setValue={setPekerjaanKeluarga}
                                            placeholder="Pekerjaan"
                                            disabled={isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-6">
                                        <SearchableDropdown
                                            data={props.jenisKontak ?? []}
                                            value={jenisKontakKeluarga}
                                            setValue={setJenisKontakKeluarga}
                                            placeholder="Jenis Kontak"
                                            disabled={isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-6">
                                        <Input
                                            placeholder="Telepon Keluarga"
                                            className="w-full"
                                            value={teleponKeluarga}
                                            onChange={e => setTeleponKeluarga(e.target.value)}
                                            name="telepon_keluarga"
                                            disabled={isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-6">
                                        <SearchableDropdown
                                            data={props.jenisIdentitas ?? []}
                                            value={jenisIdentitasKeluarga}
                                            setValue={setJenisIdentitasKeluarga}
                                            placeholder="Jenis Identitas"
                                            disabled={isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-6">
                                        <Input
                                            placeholder="Nomor Identitas"
                                            className="w-full"
                                            value={nomorIdentitasKeluarga}
                                            onChange={e => setNomorIdentitasKeluarga(e.target.value)}
                                            name="nomor_identitas_keluarga"
                                            disabled={isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-12">
                                        <Input
                                            placeholder="Alamat Keluarga"
                                            className="w-full"
                                            value={alamatKeluarga}
                                            onChange={e => setAlamatKeluarga(e.target.value)}
                                            name="alamat_keluarga"
                                            disabled={keluargaSamaDenganPasien || isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <Input
                                            placeholder="RT"
                                            className="w-full"
                                            value={rukunTetanggaKeluarga}
                                            onChange={e => setRukunTetanggaKeluarga(e.target.value)}
                                            name="rt_keluarga"
                                            disabled={keluargaSamaDenganPasien || isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <Input
                                            placeholder="RW"
                                            className="w-full"
                                            value={rukunWargaKeluarga}
                                            onChange={e => setRukunWargaKeluarga(e.target.value)}
                                            name="rw_keluarga"
                                            disabled={keluargaSamaDenganPasien || isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <Input
                                            placeholder="Kode Pos"
                                            className="w-full"
                                            value={kodePosKeluarga}
                                            onChange={e => setKodePosKeluarga(e.target.value)}
                                            name="kode_pos_keluarga"
                                            disabled={keluargaSamaDenganPasien || isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-6">
                                        <SearchableDropdown
                                            data={provinsi}
                                            value={alamatProvinsiKeluarga}
                                            setValue={setAlamatProvinsiKeluarga}
                                            placeholder="Provinsi"
                                            disabled={keluargaSamaDenganPasien || isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-6">
                                        <SearchableDropdown
                                            data={kabupaten}
                                            value={alamatKabupatenKeluarga}
                                            setValue={setAlamatKabupatenKeluarga}
                                            placeholder="Kabupaten"
                                            disabled={keluargaSamaDenganPasien || isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-6">
                                        <SearchableDropdown
                                            data={kecamatan}
                                            value={alamatKecamatanKeluarga}
                                            setValue={setAlamatKecamatanKeluarga}
                                            placeholder="Kecamatan"
                                            disabled={keluargaSamaDenganPasien || isPasienTidakDikenal}
                                        />
                                    </div>
                                    <div className="col-span-6">
                                        <SearchableDropdown
                                            data={kelurahan}
                                            value={alamatKelurahanKeluarga}
                                            setValue={setAlamatKelurahanKeluarga}
                                            placeholder="Kelurahan"
                                            disabled={keluargaSamaDenganPasien || isPasienTidakDikenal}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="flex justify-end gap-2 mt-8">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            className="px-6"
                        >
                            Reset
                        </Button>
                        <Button
                            type="submit"
                            className="px-6 bg-green-600 hover:bg-green-700 text-white"
                        >
                            Simpan
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout >
    );
}
