<?php

namespace App\Models\Pembayaran;

use App\Models\Aplikasi\Pengguna;
use Illuminate\Database\Eloquent\Model;

class TransaksiKasir extends Model
{
    protected $connection = 'pembayaran';

    protected $table = 'transaksi_kasir';

    public $timestamps = false;

    protected $primaryKey = 'NOMOR';

    protected $fillable = [
        'KASIR',
        'BUKA',
        'TUTUP',
        'TOTAL',
        'STATUS',
    ];

    public function kasir()
    {
        return $this->belongsTo(Pengguna::class, 'KASIR', 'ID');
    }
}
