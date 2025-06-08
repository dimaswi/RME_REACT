<?php

namespace App\Models\Pembayaran;

use App\Models\Pendaftaran\Pendaftaran;
use Illuminate\Database\Eloquent\Model;

class TagihanPendaftaran extends Model
{
    protected $connection = 'pembayaran';

    protected $table = 'tagihan_pendaftaran';

    public $timestamps = false;

    protected $primaryKey = 'ID';

    protected $fillable = [
        'TAGIHAN',
        'PENDAFTARAN',
        'REF',
        'UTAMA',
        'STATUS'
    ];

    public function pendaftaran()
    {
        return $this->belongsTo(Pendaftaran::class, 'PENDAFTARAN', 'NOMOR');
    }

    public function tagihan()
    {
        return $this->belongsTo(Tagihan::class, 'TAGIHAN', 'ID');
    }

    public function gabungTagihan()
    {
        return $this->hasOne(GabungTagihan::class, 'KE', 'TAGIHAN');
    }

    public function pembayaranTagihan()
    {
        return $this->hasOne(PembayaranTagihan::class, 'TAGIHAN', 'TAGIHAN');
    }
}
