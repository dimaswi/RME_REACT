<?php

namespace App\Models\Eklaim;

use App\Models\Pendaftaran\Pendaftaran;
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
        'klaim_number',
        'status',
        'petugas',
        'request',
        'tanggal_pengajuan',
        'jenis_perawatan',
        'edit',
        'pengkajian_awal',
        'triage',
        'cppt',
        'laboratorium',
        'berkas_klaim',
        'tagihan',
    ];

    public function penjamin()
    {
        return $this->hasOne(Penjamin::class, 'NOMOR', 'nomor_SEP');
    }

    public function resumeMedis()
    {
        return $this->hasOne(ResumeMedis::class, 'id_pengajuan_klaim', 'id');
    }

    public function pendaftaranPoli()
    {
        return $this->hasOne(Pendaftaran::class, 'NOMOR', 'nomor_pendaftaran');
    }
}
