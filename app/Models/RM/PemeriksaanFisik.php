<?php

namespace App\Models\RM;

use Illuminate\Database\Eloquent\Model;

class PemeriksaanFisik extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'pemeriksaan_fisik';
}
