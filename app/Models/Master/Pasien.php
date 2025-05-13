<?php

namespace App\Models\Master;

use App\Models\Pendaftaran\Kunjungan;
use App\Models\Pendaftaran\Pendaftaran;
use Illuminate\Database\Eloquent\Model;

class Pasien extends Model
{
    protected $connection = 'master';

    protected $table = 'pasien';

    protected $primaryKey = 'NORM';

    public function keluargaPasien()
    {
        return $this->hasMany(KeluargaPasiens::class, 'NORM', 'NORM');
    }

    public function agama()
    {
        return $this->hasOne(Referensi::class, 'ID', 'AGAMA')->where('JENIS', 1);
    }

    public function pendidikan()
    {
        return $this->hasOne(Referensi::class, 'ID', 'PENDIDIKAN')->where('JENIS', 3);
    }

    public function pekerjaan()
    {
        return $this->hasOne(Referensi::class, 'ID', 'PEKERJAAN')->where('JENIS', 4);
    }

    public function kawin()
    {
        return $this->hasOne(Referensi::class, 'ID', 'STATUS_PERKAWINAN')->where('JENIS', 5);
    }

    public function golda()
    {
        return $this->hasOne(Referensi::class, 'ID', 'GOLONGAN_DARAH')->where('JENIS', 6);
    }

    public function kartuIdentitas()
    {
        return $this->hasMany(KartuIdentitasPasien::class, 'NORM', 'NORM');
    }

    public function riwayatPendaftaran()
    {
        return $this->hasMany(Pendaftaran::class, 'NORM', 'NORM');
    }
}
