<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class DataApgar extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'data_apgar';

    protected $fillable = [
        'klaim_data_id',
        'appearance_1',
        'pulse_1',
        'grimace_1',
        'activity_1',
        'respiration_1',
        'appearance_5',
        'pulse_5',
        'grimace_5',
        'activity_5',
        'respiration_5',
    ];

    public function klaimData()
    {
        return $this->belongsTo(DataKlaim::class, 'klaim_data_id');
    }
}
