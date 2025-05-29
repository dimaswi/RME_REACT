<?php

namespace App\Models\RM;

use Illuminate\Database\Eloquent\Model;

class RPP extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'rpp';

    public $timestamps = false;
}
