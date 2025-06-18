<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class DataPersalinan extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'data_persalinan';

    protected $fillable = [
        'klaim_data_id',
        'usia_kehamilan',
        'gravida',
        'partus',
        'abortus',
        'onset_kontraksi',
    ];

    public function klaimData()
    {
        return $this->belongsTo(DataKlaim::class, 'klaim_data_id');
    }

    public function deliveries()
    {
        return $this->hasMany(DataDeliveryPersalinan::class, 'klaim_persalinan_id');
    }
}
