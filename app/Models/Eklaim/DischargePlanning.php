<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class DischargePlanning extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'discharge_planning';

    protected $fillable = [
        'pengkajian_awal_id',
        'faktor_resiko',
        'skrinning',
        'tindak_lanjut',
    ];
}
