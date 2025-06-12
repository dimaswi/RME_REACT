<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class TTVResumeMedis extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'ttv_resume_medis';

    protected $fillable = [
        'resume_medis_id',
        'tingkat_kesadaran',
        'keadaan_umum',
        'suhu',
        'nadi',
        'pernafasan',
        'sistolik',
        'diastolik',
        'saturasi_o2'
    ];
}
