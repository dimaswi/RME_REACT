<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class CPPT extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'cppt';

    protected $fillable = [
        'resume_medis_id',
        'nomor_kunjungan',
        'tanggal_jam',
        'profesi',
        'nama_petugas',
        'subyektif',
        'obyektif',
        'assesment',
        'planning',
        'instruksi'
    ];
}
