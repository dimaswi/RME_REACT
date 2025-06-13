<?php

namespace App\Models\Eklaim;

use App\Models\Pendaftaran\Kunjungan;
use Illuminate\Database\Eloquent\Model;

class Laboratorium extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'laboratorium';

    protected $fillable = [
        'pengajuan_klaim_id',
        'kunjungan_id',
        'tindakan_id',
        'nama_tindakan',
        'tanggal',
        'oleh',
        'status',
        'otomatis',
        'dokter',
        'petugas',
    ];
    
    public function hasilLaboratorium()
    {
        return $this->hasMany(HasilLaboratorium::class, 'laboratorium_tindakan_id', 'id');
    }

    public function kunjungan()
    {
        return $this->belongsTo(Kunjungan::class, 'NOMOR', 'tindakan_id');
    }
}
