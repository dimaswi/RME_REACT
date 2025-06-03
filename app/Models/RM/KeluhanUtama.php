<?php

namespace App\Models\RM;

use Illuminate\Database\Eloquent\Model;

class KeluhanUtama extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'keluhan_utama';
}
