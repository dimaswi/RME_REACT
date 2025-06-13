<?php

namespace App\Models\Layanan;

use App\Models\Master\ParameterTindakanLab;
use Illuminate\Database\Eloquent\Model;

class HasilLab extends Model
{
    protected $connection = 'layanan';

    protected $table = 'hasil_lab';

    public function parameterTindakanLab()
    {
        return $this->hasOne(ParameterTindakanLab::class, 'ID', 'PARAMETER_TINDAKAN');
    }
}
