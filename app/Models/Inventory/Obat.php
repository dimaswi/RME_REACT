<?php

namespace App\Models\Inventory;

use App\Models\Pembayaran\HargaBarang;
use Illuminate\Database\Eloquent\Model;

class Obat extends Model
{
    protected $connection = 'inventory';

    protected $table = 'barang';

    public function hargaBarang()
    {
        return $this->hasOne(HargaBarang::class, 'BARANG', 'ID')->where('STATUS', 1);
    }
}
