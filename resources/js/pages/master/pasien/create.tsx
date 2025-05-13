import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { User } from 'lucide-react';
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

    const [warning, setWarning] = useState("");

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

        // Validasi: cek semua field wajib
        if (
            !nama ||
            !tempatLahirValue ||
            !date ||
            !jenisKelaminValue ||
            !agamaValue ||
            !statusPerkawinanValue ||
            !pendidikanValue ||
            !pekerjaanValue ||
            !golonganDarahValue ||
            !negaraValue ||
            !statusIdentitasValue ||
            !statusAktifValue
        ) {
            setWarning("Semua field wajib diisi!");
            return;
        }

        setWarning("");

        // Kirim data ke controller via Inertia POST
        router.post(route('master.pasien.store'), {
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
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Pasien" />
            <div className="p-4">
                <Card className="w-full shadow-sm -py-6">
                    <CardHeader className="flex flex-row items-center justify-between p-4 bg-gray-50 border-b">
                        <div className="flex items-center space-x-2">
                            <User className="h-5 w-5 text-gray-500" />
                            <h3 className="text-base font-medium">Identitas Pasien</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm">[No Rekam Medis]</span>
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="pasienTidakDikenal" className="text-sm">
                                    Pasien Tidak Dikenal
                                </Label>
                                <Checkbox id="pasienTidakDikenal" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                        <form onSubmit={handleSubmit}>
                            {/* Baris 1 */}
                            <div className="grid grid-cols-12 gap-2 mb-2">
                                <div className="col-span-2">
                                    <Input
                                        placeholder="Gelar Depan"
                                        className="w-full"
                                        value={gelarDepan}
                                        onChange={e => setGelarDepan(e.target.value)}
                                        name="gelar_depan"
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
                                        name="tempat_lahir"
                                    />
                                    {errors.tempat_lahir && (
                                        <div className="text-xs text-red-500 mt-1">{errors.tempat_lahir}</div>
                                    )}
                                </div>
                                <div className="col-span-3">
                                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className="w-full justify-start text-left font-normal border border-gray-200 rounded-md px-3 py-2 shadow-sm"
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
                                    />
                                </div>
                                <div className="col-span-3">
                                    <SearchableDropdown
                                        data={props.statusPerkawinan}
                                        value={statusPerkawinanValue}
                                        setValue={setStatusPerkawinanValue}
                                        placeholder="Status Perkawinan"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <SearchableDropdown
                                        data={props.pendidikan}
                                        value={pendidikanValue}
                                        setValue={setPendidikanValue}
                                        placeholder="Pendidikan"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <SearchableDropdown
                                        data={props.pekerjaan}
                                        value={pekerjaanValue}
                                        setValue={setPekerjaanValue}
                                        placeholder="Pekerjaan"
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
                                    />
                                </div>
                                <div className="col-span-3">
                                    <SearchableDropdown
                                        data={props.negara}
                                        value={negaraValue}
                                        setValue={setNegaraValue}
                                        placeholder="Negara"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <SearchableDropdown
                                        data={props.statusIdentitas}
                                        value={statusIdentitasValue}
                                        setValue={setStatusIdentitasValue}
                                        placeholder="Status Identitas"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <SearchableDropdown
                                        data={props.statusAktif}
                                        value={statusAktifValue}
                                        setValue={setStatusAktifValue}
                                        placeholder="Status Aktif"
                                    />
                                </div>
                            </div>

                            {warning && (
                                <div className="text-red-500 text-sm mt-2">
                                    {warning}
                                </div>
                            )}

                            <Button type="submit" className="mt-4 w-full bg-green-600 text-white">
                                Simpan
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout >
    );
}
