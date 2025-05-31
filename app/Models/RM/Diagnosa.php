<?php

namespace App\Models\RM;

use App\Models\Master\MrConso;
use Illuminate\Database\Eloquent\Model;

class Diagnosa extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'diagnosa';

    public function namaDiagnosa()
    {
        return $this->hasMany(MrConso::class, 'CODE', 'KODE');
    }
}
