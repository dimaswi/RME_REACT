<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class PermintaanKonsul extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'permintaan_konsul';

    protected $fillable = [
        'resume_medis_id',
        'pertanyaan',
        'jawaban',
    ];
}
