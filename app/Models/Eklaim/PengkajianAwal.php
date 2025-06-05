<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class PengkajianAwal extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'pengkajian_awal';

    protected $fillable = [
        'nomor_kunjungan',
        'ruangan',
        'tanggal_masuk',
        'nama_pasien',
        'alamat',
        'nomor_rm',
        'tanggal_lahir',
        'jenis_kelamin',
        'riwayat_alergi',
        'edukasi_pasien',
        'rencana_keperawatan',
        'diagnosa_keperawatan',
        'masalah_medis',
        'rencana_terapi',
        'nama_dokter',
        'tanggal_tanda_tangan'
    ];
}
