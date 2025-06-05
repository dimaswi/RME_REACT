<?php

namespace App\Models\RM;

use App\Models\Aplikasi\Pengguna;
use App\Models\Master\Pegawai;
use App\Models\Pendaftaran\Kunjungan;
use Illuminate\Database\Eloquent\Model;

class CPPT extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'cppt';

    public function kunjungan()
    {
        return $this->hasOne(Kunjungan::class, 'NOMOR', 'KUNJUNGAN');
    }

    public function petugas()
    {
        return $this->hasOne(Pengguna::class, 'ID', 'OLEH');
    }
}
