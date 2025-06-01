<?php

namespace App\Models\Pembayaran;

use App\Models\Pendaftaran\Kunjungan;
use Illuminate\Database\Eloquent\Model;

class GabungTagihan extends Model
{
    protected $connection = 'pembayaran';

    protected $table = 'gabung_tagihan';

    public function kunjunganPasien()
    {
        return $this->hasMany(Kunjungan::class, 'NOPEN', 'DARI');
    }
}
