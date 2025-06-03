<?php

namespace App\Models\Pembayaran;

use App\Models\Master\Referensi;
use Illuminate\Database\Eloquent\Model;

class TarifRuangRawat extends Model
{
    protected $connection = 'master';

    protected $table = 'tarif_ruang_rawat';

    public function ruanganKelas()
    {
        return $this->belongsTo(Referensi::class, 'KELAS', 'ID')->where('JENIS', 19);
    }
}
