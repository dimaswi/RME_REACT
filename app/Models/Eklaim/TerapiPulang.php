<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class TerapiPulang extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'terapi_pulang';

    protected $fillable = [
        'resume_medis_id',
        'nama_obat',
        'jumlah',
        'frekuensi',
        'cara_pemberian'
    ];
}
