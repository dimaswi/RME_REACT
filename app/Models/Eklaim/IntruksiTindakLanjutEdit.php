<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class IntruksiTindakLanjutEdit extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'intruksi_tindak_lanjut_edit';

    protected $fillable = [
        'resume_medis',
        'poli_tujuan',
        'tanggal',
        'jam',
        'nomor_bpjs',
    ];
}
