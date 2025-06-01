<?php

namespace App\Models\Layanan;

use Illuminate\Database\Eloquent\Model;

class OrderResep extends Model
{
    protected $connection = 'layanan';

    protected $table = 'order_resep';

    public function orderResepDetil()
    {
        return $this->hasMany(OrderResepDetil::class, 'ORDER_ID', 'NOMOR');
    }
}
