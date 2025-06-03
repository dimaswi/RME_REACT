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
        return $this->hasOne(MrConso::class, 'CODE', 'KODE');
    }
}
