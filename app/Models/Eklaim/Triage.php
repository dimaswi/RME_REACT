<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class Triage extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'triage';

    protected $fillable = [
        'resume_medis_id',
        'nama_pasien',
        'tanggal_lahir',
        'no_rm',
        'jenis_kelamin',
        'nomor_kunjungan',
        'tanggal_kedatangan',
        'alat_transportasi',
        'cara_datang',
        'pengantar',
        'pasien_rujukan',
        'pasien_rujukan_sisrute',
        'dikirim_polisi',
        'permintaan_visum',
        'jenis_kasus',
        'lokasi_kasus',
        'laka_lantas',
        'kecelakaan_kerja',
        'keluhan_utama',
        'anamnesa_terpimpin',
        'tekanan_darah',
        'nadi',
        'pernapasan',
        'suhu',
        'nyeri',
        'metode_ukur_nyeri',
        'resustasi',
        'emergency',
        'urgent',
        'less_urgent',
        'non_urgent',
        'zona_hitam'
    ];
}
