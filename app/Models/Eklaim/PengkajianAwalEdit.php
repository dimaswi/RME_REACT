<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class PengkajianAwalEdit extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'pengkajian_awal';

    protected $fillable = [
        'resume_medis',
        'nama_pasien',
        'ruangan',
        'tanggal_masuk',
        'alamat',
        'NORM',
        'tanggal_lahir',
        'jenis_kelamin',
        'anamnesa',
        'keadaan_umum',
        'pemeriksaan_fisik',
        'psikologi',
        'riwayat_alergi',
        'nyeri',
        'resiko_jatuh',
        'skor_resiko_jatuh',
        'metode_penilaian_resiko_jatuh',
        'resiko_dekubitus',
        'skor_resiko_dekubitus',
        'penurunan_berat_badan',
        'nafsu_makan',
        'diagnosa_khusus',
        'edukasi_pasien',
        'skrining_rencana_pulang',
        'faktor_risiko_rencana_pulang',
        'tindak_lanjut_rencana_pulang',
        'rencana_keperawatan',
        'masalah_medis',
        'diagnosa_medis',
        'rencana_terapi',
        'dokter',
        'tanda_tangan_perawat'
    ];
}
