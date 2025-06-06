<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class ResikoJatuh extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'resiko_jatuh';

    protected $fillable = [
        'pengkajian_awal_id',
        'resiko',
        'skor',
        'metode',
    ];
}
