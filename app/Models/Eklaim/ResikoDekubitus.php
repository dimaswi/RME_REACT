<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class ResikoDekubitus extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'resiko_dekubitus';

    protected $fillable = [
        'pengkajian_awal_id',
        'resiko',
        'skor',
    ];
}
