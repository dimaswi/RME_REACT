<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class PenilaianNyeri extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'penilaian_nyeri';

    protected $fillable = [
        'pengkajian_awal_id',
        'durasi',
        'onset',
        'pencetus',
        'lokasi',
        'gambaran',
        'nyeri',
        'skala',
        'metode',
    ];
}
