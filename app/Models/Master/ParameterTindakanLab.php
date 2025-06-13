<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class ParameterTindakanLab extends Model
{
    protected $connection = 'master';

    protected $table = 'parameter_tindakan_lab';

    public function satuan()
    {
        return $this->hasOne(Referensi::class, 'ID', 'SATUAN')
            ->where('JENIS', 35);
    }
}
