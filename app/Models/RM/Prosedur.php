<?php

namespace App\Models\RM;

use App\Models\Master\MrConso;
use Illuminate\Database\Eloquent\Model;

class Prosedur extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'prosedur';

    protected $primaryKey = 'ID';

    public function namaProsedur()
    {
        return $this->hasMany(MrConso::class, 'CODE', 'KODE');
    }
}
