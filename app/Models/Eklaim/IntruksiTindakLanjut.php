<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class IntruksiTindakLanjut extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'instruksi_tindak_lanjut';

    protected $fillable = [
        'resume_medis_id',
        'poli_tujuan',
        'tanggal',
        'jam',
        'nomor_bpjs'
    ];
}
