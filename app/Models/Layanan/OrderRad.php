<?php

namespace App\Models\Layanan;

use Illuminate\Database\Eloquent\Model;

class OrderRad extends Model
{
    protected $connection = 'layanan';

    protected $table = 'order_rad';

    public function hasilRad()
    {
        return $this->hasMany(HasilRad::class, 'order_rad_id', 'id');
    }
}
