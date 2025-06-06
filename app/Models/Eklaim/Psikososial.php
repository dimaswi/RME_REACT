<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class Psikososial extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'status_psikososial';

    protected $fillable = [
        'pengkajian_awal_id',
        'status_psikologis',
        'status_mental',
        'hubungan_keluarga',
        'tempat_tinggal',
        'agama',
        'kebiasaan_beribadah',
        'pekerjaan',
        'penghasilan'
    ];
}
