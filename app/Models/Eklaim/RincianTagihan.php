<?php

namespace App\Models\Eklaim;

use App\Models\Pembayaran\HargaBarang;
use App\Models\Pembayaran\Paket;
use App\Models\Pembayaran\TarifOksigen;
use App\Models\Pembayaran\TarifPembayaran;
use App\Models\Pembayaran\TarifRuangRawat;
use App\Models\Pembayaran\TarifTindakan;
use Illuminate\Database\Eloquent\Model;

class RincianTagihan extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'rincian_tagihan';

    protected $fillable = [
        'id_pengajuan_klaim',
        'tagihan',
        'id_tarif',
        'jenis',
        'ref',
        'jumlah',
        'tarif',
        'edit',
    ];

    public function tagihan()
    {
        return $this->belongsTo(Tagihan::class, 'tagihan', 'ID');
    }

    public function tarifAdministrasi()
    {
        return $this->belongsTo(TarifPembayaran::class, 'id_tarif', 'ID');
    }

    public function tarifRuangRawat()
    {
        return $this->belongsTo(TarifRuangRawat::class, 'id_tarif', 'ID');
    }

    public function tarifTindakan()
    {
        return $this->belongsTo(TarifTindakan::class, 'id_tarif', 'ID');
    }

    public function hargaBarang()
    {
        return $this->belongsTo(HargaBarang::class, 'id_tarif', 'ID');
    }

    public function paket()
    {
        return $this->belongsTo(Paket::class, 'id_tarif', 'ID');
    }

    public function tarifOksigen()
    {
        return $this->belongsTo(TarifOksigen::class, 'id_tarif', 'ID');
    }
}
