<?php

namespace App\Models\Eklaim;

use App\Models\Layanan\TindakanMedis;
use App\Models\Master\Pegawai;
use App\Models\Master\Tindakan;
use App\Models\Pendaftaran\Kunjungan;
use Illuminate\Database\Eloquent\Model;

class Radiologi extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'radiologi';

    protected $fillable = [
        'id_pengajuan_klaim',
        'nomor_kunjungan',
        'nama_petugas',
        'nama_dokter',
        'tindakan',
        'klinis',
        'kesan',
        'usul',
        'hasil'
    ];

    protected $casts = [
        'tindakan' => 'integer',
    ];

    public function petugas()
    {
        return $this->hasOne(Pegawai::class, 'ID', 'nama_petugas');
    }

    public function dokter()
    {
        return $this->hasOne(Pegawai::class, 'ID', 'nama_dokter');
    }

    public function tindakan()
    {
        return $this->belongsTo(TindakanMedis::class, 'ID', 'tindakan');
    }

    public function kunjunganPasien()
    {
        return $this->belongsTo(Kunjungan::class, 'NOMOR', 'nomor_kunjungan');
    }

        public function tindakanRadiologi()
    {
        return $this->hasOne(Tindakan::class, 'ID', 'tindakan')->where('JENIS', 7);
    }
}
