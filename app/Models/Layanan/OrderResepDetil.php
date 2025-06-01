<?php

namespace App\Models\Layanan;

use App\Models\Inventory\Obat;
use App\Models\Master\FrekuensiAturanResep;
use App\Models\Master\Referensi;
use Illuminate\Database\Eloquent\Model;

class OrderResepDetil extends Model
{
    protected $connection = 'layanan';

    protected $table = 'order_detil_resep';

    public function namaObat()
    {
        return $this->hasOne(Obat::class, 'ID', 'FARMASI');
    }

    public function frekuensiObat()
    {
        return $this->hasOne(FrekuensiAturanResep::class, 'ID', 'FREKUENSI');
    }

    public function caraPakai()
    {
        return $this->hasOne(Referensi::class, 'ID', 'RUTE_PEMBERIAN')->where('JENIS', 217);
    }
}
