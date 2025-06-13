<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class Tindakan extends Model
{
    protected $connection = 'master';

    protected $table = 'tindakan';

    public function parameterTindakanLab()
    {
        return $this->hasMany(ParameterTindakanLab::class, 'TINDAKAN', 'ID');
    }
}
