<?php

namespace App\Models\Pembayaran;

use Illuminate\Database\Eloquent\Model;

class PenjaminTagihan extends Model
{
    protected $connection = 'pembayaran';

    protected $table = 'penjamin_tagihan';

    public $timestamps = false;

    protected $fillable = [
        'TAGIHAN',
        'PENJAMIN',
        'KE',
        'TOTAL',
        'TOTAL_NAIK_KELAS',
        'NAIK_KELAS',
        'NAIK_KELAS_VIP',
        'NAIK_DIATAS_VIP',
        'KELAS',
        'LAMA_NAIK',
        'TOTAL_TAGIHAN_HAK',
        'TARIF_INACBG_KELAS1',
        'SUBSIDI_TAGIHAN',
        'SELISIH_MINIMAL',
        'KELAS_KLAIM',
        'PERSENTASE_TARIF_INACBG_KELAS1',
        'TOTAL_TAGIHAN_VIP',
        'TOTAL_TAGIHAN_VIP_AKOMODASI_DAN_VISITE',
        'MANUAL',
        'OLEH',
        'TANGGAL'
    ];
}
