<?php

namespace App\Models\Pembayaran;

use App\Models\Master\Referensi;
use Illuminate\Database\Eloquent\Model;

class TarifPembayaran extends Model
{
    protected $connection = 'master';

    protected $table = 'tarif_administrasi';

    public function ruangan()
    {
        return $this->belongsTo(Referensi::class, 'JENIS_KUNJUNGAN', 'ID')->where('JENIS', 15);
    }
}
