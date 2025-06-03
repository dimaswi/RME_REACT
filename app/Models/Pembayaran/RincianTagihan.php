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

    public function tarifAdministrasi()
    {
        return $this->belongsTo(TarifPembayaran::class, 'TARIF_ID', 'ID');
    }

    public function tarifRuangRawat()
    {
        return $this->belongsTo(TarifRuangRawat::class, 'TARIF_ID', 'ID');
    }

    public function tarifTindakan()
    {
        return $this->belongsTo(TarifTindakan::class, 'TARIF_ID', 'ID');
    }

    public function hargaBarang()
    {
        return $this->belongsTo(HargaBarang::class, 'TARIF_ID', 'ID');
    }

    public function paket()
    {
        return $this->belongsTo(Paket::class, 'TARIF_ID', 'ID');
    }

    public function tarifOksigen()
    {
        return $this->belongsTo(TarifOksigen::class, 'TARIF_ID', 'ID');
    }
}
