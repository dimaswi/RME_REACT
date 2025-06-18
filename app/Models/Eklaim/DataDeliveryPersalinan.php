<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class DataDeliveryPersalinan extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'data_delivery_persalinan';

    protected $fillable = [
        'klaim_persalinan_id',
        'delivery_sequence',
        'delivery_method',
        'delivery_dttm',
        'letak_janin',
        'kondisi',
        'use_manual',
        'use_forcep',
        'use_vacuum',
        'shk_spesimen_ambil',
        'shk_lokasi',
        'shk_spesimen_dttm',
        'shk_alasan',
    ];

    public function persalinan()
    {
        return $this->belongsTo(DataPersalinan::class, 'klaim_persalinan_id');
    }
}
