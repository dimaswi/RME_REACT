<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class ResumeMedisEdit extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'resume_medis';

    protected $fillable = [
        'pengajuan_klaim',
        'nama_pasien',
        'NORM',
        'tanggal_lahir',
        'jenis_kelamin',
        'tanggal_masuk',
        'tanggal_keluar',
        'lama_dirawat',
        'ruang_rawat',
        'penjamin',
        'indikasi_rawat_inap',
        'riwayat_penyakit_sekarang',
        'riwayat_penyakit_dulu',
        'pemeriksaan_fisik',
        'konsultasi', // Model Baru
        'diagnosa_utama',
        'icd10_utama',
        'diagnosa_sekunder',
        'icd10_sekunder',
        'prosedur_utama',
        'icd9_utama',
        'prosedur_sekunder',
        'icd9_sekunder',
        'riwayat_alergi',
        'keadaan_pulang',
        'cara_pulang',
        'terapi_pulang',
        'intruksi_tindak_lanjut', // Model Baru
        'dokter',
        'tanda_tangan_pasien'
    ];

    public function pengkajianAwalEdit()
    {
        return $this->hasOne(PengkajianAwalEdit::class, 'resume_medis', 'id');
    }

    public function intruksiTindakLanjutEdit()
    {
        return $this->hasOne(IntruksiTindakLanjutEdit::class, 'resume_medis', 'id');
    }

    public function terapiPulangEdit()
    {
        return $this->hasMany(TerapiPulangEdit::class, 'resume_medis', 'id');
    }

    public function konsultasiEdit()
    {
        return $this->hasMany(KonsultasiEdit::class, 'resume_medis', 'id');
    }
}
