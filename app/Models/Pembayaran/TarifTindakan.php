<?php

namespace App\Models\Pembayaran;

use App\Models\Master\Referensi;
use App\Models\Master\Tindakan;
use Illuminate\Database\Eloquent\Model;

class TarifTindakan extends Model
{
    protected $connection = 'master';

    protected $table = 'tarif_tindakan';

    public function tindakan()
    {
        return $this->belongsTo(Tindakan::class, 'TINDAKAN', 'ID');
    }

    public function jenisTindakan()
    {
        return $this->belongsTo(Referensi::class, 'ID', 'JENIS')->where('JENIS', 74);
    }
}
