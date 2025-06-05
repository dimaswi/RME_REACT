<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class ResumeMedis extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'resume_medis';

    protected $fillable = [
        'id_pengajuan_klaim',
        'nama_pasien',
        'no_rm',
        'tanggal_lahir',
        'jenis_kelamin',
        'ruang_rawat',
        'penjamin',
        'indikasi_rawat_inap',
        'tanggal_masuk',
        'tanggal_keluar',
        'lama_dirawat',
        'riwayat_penyakit_sekarang',
        'riwayat_penyakit_lalu',
        'pemeriksaan_fisik',
        'diagnosa_utama',
        'icd10_utama',
        'diagnosa_sekunder',
        'icd10_sekunder',
        'tindakan_prosedur',
        'icd9_utama',
        'tindakan_prosedur_sekunder',
        'icd9_sekunder',
        'riwayat_alergi',
        'keadaan_pulang',
        'cara_pulang',
        'dokter'
    ];
}
