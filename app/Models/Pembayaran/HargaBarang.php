<?php

namespace App\Models\Pembayaran;

use App\Models\Inventory\Obat;
use Illuminate\Database\Eloquent\Model;

class HargaBarang extends Model
{
    protected $connection = 'inventory';

    protected $table = 'harga_barang';

    public function obat()
    {
        return $this->belongsTo(Obat::class, 'BARANG', 'ID')->where('STATUS', 1);
    }
}
