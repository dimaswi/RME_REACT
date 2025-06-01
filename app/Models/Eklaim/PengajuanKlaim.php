<?php

namespace App\Models\Eklaim;

use App\Models\Pendaftaran\Penjamin;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PengajuanKlaim extends Model
{
    use HasUuids;

    protected $connection = 'eklaim';

    protected $table = 'pengajuan_klaim';

    protected $fillable = [
        'NORM',
        'nomor_pendaftaran',
        'nomor_SEP',
        'status',
        'petugas',
        'request',
        'tanggal_pengajuan',
    ];

    public function penjamin()
    {
        return $this->hasOne(Penjamin::class, 'NOMOR', 'nomor_SEP');
    }
}
