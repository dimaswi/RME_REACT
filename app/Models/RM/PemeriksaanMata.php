<?php

namespace App\Models\RM;

use Illuminate\Database\Eloquent\Model;

class PemeriksaanMata extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'pemeriksaan_mata';
}
