<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class Tagihan extends Model
{
    public $connection = 'eklaim';

    protected $table = 'tagihan';

    protected $fillable = [
        'id_pengajuan_klaim',
        'tagihan',
        'total',
        'prosedur_bedah',
        'prosedur_non_bedah',
        'konsultasi',
        'tenaga_ahli',
        'keperawatan',
        'penunjang',
        'radiologi',
        'laboratorium',
        'bank_darah',
        'rehab_medik',
        'akomodasi',
        'akomodasi_intensif',
        'obat',
        'obat_kronis',
        'obat_kemoterapi',
        'alkes',
        'bmhp',
        'sewa_alat',
        'lama_rawat_intensif',
        'lama_penggunaan_ventilator'
    ];

    public function rincianTagihan()
    {
        return $this->hasMany(RincianTagihan::class, 'tagihan', 'tagihan');
    }
}
