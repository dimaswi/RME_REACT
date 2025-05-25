<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class PengajuanKlaim extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'pengajuan_klaim';

    protected $fillable = [
        'NORM',
        'nomor_pendaftaran',
        'nomor_SEP',
        'status', // 0: pending, 1: approved, 2: rejected
        'petugas' // Nama petugas yang mengajukan klaim
    ];
}
