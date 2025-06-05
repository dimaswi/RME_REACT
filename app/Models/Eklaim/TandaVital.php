<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class TandaVital extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'tanda_vital';

    protected $fillable = [
        'pengkajian_awal_id',
        'tingkat_kesadaran',
        'keadaan_umum',
        'gcs',
        'eye',
        'motorik',
        'verbal',
        'tekanan_darah',
        'frekuensi_nadi',
        'frekuensi_nafas',
        'suhu',
        'berat_badan',
        'saturasi_o2'
    ];
}
