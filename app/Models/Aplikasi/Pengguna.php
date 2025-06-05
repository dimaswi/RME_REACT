<?php

namespace App\Models\Aplikasi;

use App\Models\Master\Pegawai;
use Illuminate\Database\Eloquent\Model;

class Pengguna extends Model
{
    protected $connection = 'aplikasi';

    protected $table = 'pengguna';

    public $timestamps = false;

    protected $primaryKey = 'ID';

    protected $fillable = [
        'ID',
        'LOGIN',
        'PASSWORD',
        'NAMA',
        'NIP',
        'NIK',
        'JENIS',
        'MASA_AKTIF',
        'LOCK_APP',
        'TERAKHIR_UBAH_PASSWORD',
        'STATUS'
    ];

    public function pegawai()
    {
        return $this->hasOne(Pegawai::class, 'NIP', 'NIP');
    }
}
