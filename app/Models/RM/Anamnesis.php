<?php

namespace App\Models\RM;

use Illuminate\Database\Eloquent\Model;

class Anamnesis extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'anamnesis';

    public $timestamps = false;
}
