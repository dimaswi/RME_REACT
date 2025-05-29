<?php

namespace App\Models\Pendaftaran;

use App\Models\BPJS\Kunjungan;
use App\Models\Layanan\PasienPulang;
use App\Models\Master\Pasien;
use App\Models\Pembayaran\TagihanPendaftaran;
use App\Models\Pendaftaran\Kunjungan as PendaftaranKunjungan;
use App\Models\RM\Anamnesis;
use App\Models\RM\PemeriksaanFisik;
use App\Models\RM\Resume;
use Illuminate\Database\Eloquent\Model;

class Pendaftaran extends Model
{
    protected $connection = 'pendaftaran';

    protected $table = 'pendaftaran';

    protected $primaryKey = 'NOMOR';

    public function riwayatKunjungan()
    {
        return $this->hasMany(PendaftaranKunjungan::class, 'NOPEN', 'NOMOR');
    }

    public function penjamin()
    {
        return $this->hasOne(Penjamin::class, 'NOPEN', 'NOMOR');
    }

    public function pasien()
    {
        return $this->belongsTo(Pasien::class, 'NORM', 'NORM');
    }

    public function pasienPulang()
    {
        return $this->hasOne(PasienPulang::class, 'NOPEN', 'NOMOR')->where('STATUS', 1);
    }

    public function pendaftaranTagihan()
    {
        return $this->hasOne(TagihanPendaftaran::class, 'PENDAFTARAN', 'NOMOR');
    }

    public function resumeMedis()
    {
        return $this->hasOne(Resume::class, 'NOPEN', 'NOMOR');
    }

    public function anamnesis()
    {
        return $this->hasMany(Anamnesis::class, 'PENDAFTARAN', 'NOMOR');
    }

    public function pemeriksaanFisik()
    {
        return $this->hasMany(PemeriksaanFisik::class, 'PENDAFTARAN', 'NOMOR');
    }
}
