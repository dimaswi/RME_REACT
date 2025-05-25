<?php

namespace App\Models\Pembayaran;

use Illuminate\Database\Eloquent\Model;

class Tagihan extends Model
{
    protected $connection = 'pembayaran';

    protected $table = 'tagihan';

    public $timestamps = false;

    protected $primaryKey = 'ID';

    protected $fillable = [
        'REF',
        'TANGGAL',
        'JENIS',
        'TOTAL',
        'PEMBULATAN',
        'PROSEDUR_NON_BEDAH',
        'PROSEDUR_BEDAH',
        'TENAGA_AHLI',
        'KEPERAWATAN',
        'PENUNJANG',
        'RADIOLOGI',
        'LABORATORIUM',
        'BANK_DARAH',
        'REHAB_MEDIK',
        'AKOMODASI',
        'AKOMODASI_INTENSIF',
        'OBAT',
        'OBAT_KRONIS',
        'OBAT_KEMOTERAPI',
        'ALKES',
        'BMHP',
        'SEWA_ALAT',
        'RAWAT_INTENSIF',
        'LAMA_RAWAT_INTENSIF',
        'LAMA_PENGGUNAAN_VENTILATOR',
        'KUNCI',
        'OLEH',
        'STATUS'
    ];

    public function rincianTagihan()
    {
        return $this->hasMany(RincianTagihan::class, 'TAGIHAN', 'ID');
    }
}
