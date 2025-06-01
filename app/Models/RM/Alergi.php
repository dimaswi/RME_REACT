<?php

namespace App\Models\RM;

use Illuminate\Database\Eloquent\Model;

class Alergi extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'riwayat_alergi';
}
