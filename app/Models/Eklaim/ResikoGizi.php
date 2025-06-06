<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class ResikoGizi extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'resiko_gizi';

    protected $fillable = [
        'pengkajian_awal_id',
        'penurunan_berat_badan',
        'penurunan_asupan',
        'diagnosis_khusus',
    ];
}
