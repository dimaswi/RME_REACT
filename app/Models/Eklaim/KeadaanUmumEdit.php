<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class KeadaanUmumEdit extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'keadaan_umum_edit';

    protected $fillable = [
        'pengkajian_awal',
        'keadaan_umum',
        'tingkat_kesadaran',
        'gcs',
        'eye',
        'motorik',
        'verbal',
        'tekanan_darah',
        'frekuensi_nadi',
        'frekuensi_nafas',
        'suhu',
        'berat_badan',
        'saturasi_oksigen'
    ];
}
