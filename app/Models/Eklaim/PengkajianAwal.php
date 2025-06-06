<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class PengkajianAwal extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'pengkajian_awal';

    protected $fillable = [
        'resume_medis_id',
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
        'tanggal_tanda_tangan',
        'tanggal_keluar',
    ];

    public function anamnesis()
    {
        return $this->hasOne(Anamnesis::class, 'pengkajian_awal_id', 'id');
    }

    public function pemeriksaanFisik()
    {
        return $this->hasOne(PemeriksaanFisik::class, 'pengkajian_awal_id', 'id');
    }

    public function tandaVital()
    {
        return $this->hasOne(TandaVital::class, 'pengkajian_awal_id', 'id');
    }

    public function resikoJatuh()
    {
        return $this->hasOne(ResikoJatuh::class, 'pengkajian_awal_id', 'id');
    }

    public function resikoDekubitus()
    {
        return $this->hasOne(ResikoDekubitus::class, 'pengkajian_awal_id', 'id');
    }

    public function psikososial()
    {
        return $this->hasOne(Psikososial::class, 'pengkajian_awal_id', 'id');
    }

    public function dischargePlanning()
    {
        return $this->hasOne(DischargePlanning::class, 'pengkajian_awal_id', 'id');
    }

    public function penilaianNyeri()
    {
        return $this->hasOne(PenilaianNyeri::class, 'pengkajian_awal_id', 'id');
    }

    public function resikoGizi()
    {
        return $this->hasOne(ResikoGizi::class, 'pengkajian_awal_id', 'id');
    }
}
