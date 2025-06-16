<?php

namespace App\Models\Pendaftaran;

use App\Models\Layanan\OrderResep;
use App\Models\Layanan\PasienPulang;
use App\Models\Master\Dokter;
use App\Models\Master\Pegawai;
use App\Models\Master\Ruangan;
use App\Models\Pembayaran\GabungTagihan;
use App\Models\Pembayaran\TagihanPendaftaran;
use App\Models\RM\Alergi;
use App\Models\RM\Anamnesis;
use App\Models\RM\AnamnesisDiperoleh;
use App\Models\RM\Diagnosa;
use App\Models\RM\JadwalKontrol;
use App\Models\RM\KeluhanUtama;
use App\Models\RM\PemeriksaanFisik;
use App\Models\RM\Prosedur;
use App\Models\RM\RiwayatPenyakitKeluarga;
use App\Models\RM\RPP;
use App\Models\RM\Triage;
use App\Models\RM\TTV;
use Illuminate\Database\Eloquent\Model;

class Kunjungan extends Model
{
    protected $connection = 'pendaftaran';

    protected $table = 'kunjungan';

    protected $primaryKey = 'NOMOR';

    protected $casts = [
        'NOMOR' => 'string',
    ];

    public function ruangan()
    {
        return $this->hasOne(Ruangan::class, 'ID', 'RUANGAN');
    }

    public function rpp()
    {
        return $this->hasOne(RPP::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function jadwalKontrol()
    {
        return $this->hasOne(JadwalKontrol::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function tandaVital()
    {
        return $this->hasOne(TTV::class, 'KUNJUNGAN', 'NOMOR')->orderBy('TANGGAL', 'DESC');
    }

    public function pendaftaranPasien()
    {
        return $this->hasOne(Pendaftaran::class, 'NOMOR', 'NOPEN');
    }

    public function penjaminPasien()
    {
        return $this->hasOne(Penjamin::class, 'NOPEN', 'NOPEN');
    }

    public function anamnesisPasien()
    {
        return $this->hasOne(Anamnesis::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function keluhanUtama()
    {
        return $this->hasOne(KeluhanUtama::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function anamnesisPasienDiperoleh()
    {
        return $this->hasOne(AnamnesisDiperoleh::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function pemeriksaanFisik()
    {
        return $this->hasOne(PemeriksaanFisik::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function permintaanKonsul()
    {
        return $this->hasMany(PermintaanKonsul::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function diagnosaPasien()
    {
        return $this->hasMany(Diagnosa::class, 'NOPEN', 'NOPEN');
    }

    public function prosedurPasien()
    {
        return $this->hasMany(Prosedur::class, 'NOPEN', 'NOPEN');
    }

    public function riwayatAlergi()
    {
        return $this->hasMany(Alergi::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function pasienPulang()
    {
        return $this->hasOne(PasienPulang::class, 'KUNJUNGAN', 'NOMOR')->where('STATUS', '!=', 0);
    }

    public function orderResep()
    {
        return $this->hasMany(OrderResep::class, 'KUNJUNGAN', 'NOMOR');
    }

        public function orderResepPulang()
    {
        return $this->hasMany(OrderResep::class, 'KUNJUNGAN', 'NOMOR')->where('RESEP_PASIEN_PULANG', 1);
    }

    public function dokterDPJP()
    {
        return $this->hasOne(Dokter::class, 'ID', 'DPJP');
    }

    public function tagihanPendaftaran()
    {
        return $this->hasOne(TagihanPendaftaran::class, 'PENDAFTARAN', 'NOPEN');
    }

    public function riwayatPenyakitKeluarga()
    {
        return $this->hasOne(RiwayatPenyakitKeluarga::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function rencanaTerapi()
    {
        return $this->hasOne(\App\Models\RM\RencanaTerapi::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function triage()
    {
        return $this->hasOne(Triage::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function pemeriksaanMata()
    {
        return $this->hasOne(\App\Models\RM\PemeriksaanMata::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function riwayatAlergiPasien()
    {
        return $this->hasMany(Alergi::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function CPPT()
    {
        return $this->hasMany(\App\Models\RM\CPPT::class, 'KUNJUNGAN', 'NOMOR');
    }
}
