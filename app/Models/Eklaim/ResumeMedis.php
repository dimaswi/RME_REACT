<?php

namespace App\Models\Eklaim;

use App\Models\Master\MrConso;
use Illuminate\Database\Eloquent\Model;

class ResumeMedis extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'resume_medis';

    protected $fillable = [
        'nomor_kunjungan_rawat_inap',
        'nomor_kunjungan_igd',
        'nomor_kunjungan_poli',
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
        'tindakan_prosedur',
        'riwayat_alergi',
        'keadaan_pulang',
        'cara_pulang',
        'dokter'
    ];

    public function pengkajianAwal()
    {
        return $this->hasOne(PengkajianAwal::class, 'resume_medis_id', 'id');
    }

    public function intruksiTindakLanjut()
    {
        return $this->hasOne(IntruksiTindakLanjut::class, 'resume_medis_id', 'id');
    }

    public function permintaanKonsul()
    {
        return $this->hasMany(PermintaanKonsul::class, 'resume_medis_id', 'id');
    }

    public function terapiPulang()
    {
        return $this->hasMany(TerapiPulang::class, 'resume_medis_id', 'id');
    }
}
