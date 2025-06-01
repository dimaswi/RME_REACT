<?php

namespace App\Models\Pendaftaran;

use App\Models\BPJS\Kunjungan;
use App\Models\Master\Referensi;
use App\Models\Pendaftaran\Kunjungan as PendaftaranKunjungan;
use Illuminate\Database\Eloquent\Model;

class Penjamin extends Model
{
    protected $connection = 'pendaftaran';

    protected $table = 'penjamin';

    public $timestamps = false;

    public $incrementing = false;

    protected $fillable = [
        'JENIS',
        'NOPEN',
        'NOMOR',
        'KELAS',
        'JENIS_PESERTA',
        'COB',
        'KATARAK',
        'NO_SURAT',
        'DPJP',
        'CATATAN',
        'NAIK_KELAS',
        'PEMBIAYAAN',
        'PENANGGUNGJAWAB',
        'TUJUAN_KUNJUNGAN',
        'PROCEDURE',
        'PENUNJANG',
        'ASSESMENT_PELAYANAN',
        'DPJP_LAYANAN',
    ];

    public function kunjunganBPJS()
    {
        return $this->hasOne(Kunjungan::class, 'noSEP', 'NOMOR');
    }

    public function jenisPenjamin()
    {
        return $this->belongsTo(Referensi::class, 'JENIS', 'ID')->where('JENIS', 10);
    }

    public function kunjunganPasien()
    {
        return $this->hasMany(PendaftaranKunjungan::class, 'NOPEN', 'NOPEN');
    }
}
