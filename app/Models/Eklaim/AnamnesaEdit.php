<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class AnamnesaEdit extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'anamnesa_edit';

    protected $fillable = [
        'pengkajian_awal',
        'anamnesa_diperoleh',
        'anamnesa_diperoleh_dari',
        'keluhan_utama',
        'riwayat_penyakit_sekarang',
        'riwayat_penyakit_dulu',
        'riwayat_pengobatan',
        'riwayat_penyakit_keluarga'
    ];

}
