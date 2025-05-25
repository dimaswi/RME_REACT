<?php

namespace App\Models\Pembayaran;

use Illuminate\Database\Eloquent\Model;

class RincianTagihan extends Model
{
    protected $connection = 'pembayaran';

    protected $table = 'rincian_tagihan';

    public $timestamps = false;

    protected $fillable = [
        'TAGIHAN',
        'REF_ID',
        'JENIS',
        'TARIF_ID',
        'JUMLAH',
        'TARIF',
        'PRESENTASE_DISKON',
        'DISKON',
        'STATUS',
    ];

    public function tagihan()
    {
        return $this->belongsTo(Tagihan::class, 'TAGIHAN', 'ID');
    }
}
