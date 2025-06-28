<?php

namespace App\Models\Master;

use App\Models\Pembayaran\TarifTindakan;
use Illuminate\Database\Eloquent\Model;

class Tindakan extends Model
{
    protected $connection = 'master';

    protected $table = 'tindakan';

    public function parameterTindakanLab()
    {
        return $this->hasMany(ParameterTindakanLab::class, 'TINDAKAN', 'ID');
    }

    public function hargaTindakan()
    {
        return $this->hasMany(TarifTindakan::class, 'TINDAKAN', 'ID')->with('status', 1);
    }
}
