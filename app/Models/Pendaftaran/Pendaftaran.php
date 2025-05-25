<?php

namespace App\Models\Pendaftaran;

use App\Models\BPJS\Kunjungan;
use App\Models\Layanan\PasienPulang;
use App\Models\Master\Pasien;
use App\Models\Pendaftaran\Kunjungan as PendaftaranKunjungan;
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
        return $this->hasMany(Penjamin::class, 'NOPEN', 'NOMOR');
    }

    public function pasien()
    {
        return $this->belongsTo(Pasien::class, 'NORM', 'NORM');
    }

    public function pasienPulang()
    {
        return $this->hasOne(PasienPulang::class, 'NOPEN', 'NOMOR');
    }
}
