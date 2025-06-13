<?php

namespace App\Models\Layanan;

use Illuminate\Database\Eloquent\Model;

class HasilRad extends Model
{
    protected $connection = 'layanan';

    protected $table = 'hasil_rad';


    public function orderRad()
    {
        return $this->belongsTo(OrderRad::class, 'order_rad_id', 'id');
    }
}
