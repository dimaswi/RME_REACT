<?php

namespace App\Models\Layanan;

use Illuminate\Database\Eloquent\Model;

class OrderLab extends Model
{
    protected $connection = 'layanan';

    protected $table = 'order_lab';

    public function hasilLab()
    {
        return $this->hasMany(HasilLab::class, 'ID', 'NOMOR');
    }
}
