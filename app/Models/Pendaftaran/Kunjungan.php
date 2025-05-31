<?php

namespace App\Models\Pendaftaran;

use App\Models\Master\Ruangan;
use App\Models\RM\JadwalKontrol;
use App\Models\RM\RPP;
use App\Models\RM\TTV;
use Illuminate\Database\Eloquent\Model;

class Kunjungan extends Model
{
    protected $connection = 'pendaftaran';

    protected $table = 'kunjungan';

    protected $primaryKey = 'NOMOR';

    public function ruangan()
    {
        return $this->hasOne(Ruangan::class, 'ID', 'RUANGAN');
    }

    public function rpp()
    {
        return $this->hasOne(RPP::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function jadwalKontrol()
    {
        return $this->belongsTo(JadwalKontrol::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function tandaVital()
    {
        return $this->hasOne(TTV::class, 'KUNJUNGAN', 'NOMOR');
    }
}
