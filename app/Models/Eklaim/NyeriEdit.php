<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class NyeriEdit extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'nyeri_edit';

    protected $fillable = [
        'pengkajian_awal',
        'nyeri',
        'onset',
        'pencetus',
        'lokasi_nyeri',
        'gambaran_nyeri',
        'durasi',
        'skala',
        'metode'
    ];
}
