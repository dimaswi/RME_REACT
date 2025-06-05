<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class Anamnesis extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'anamnesis';

    protected $fillable = [
        'pengkajian_awal_id',
        'auto_anamnesis',
        'allo_anamnesis',
        'dari',
        'keluhan_utama',
        'riwayat_penyakit_sekarang',
        'riwayat_penyakit_lalu',
        'riwayat_pengobatan',
        'riwayat_penyakit_keluarga'
    ];
}
