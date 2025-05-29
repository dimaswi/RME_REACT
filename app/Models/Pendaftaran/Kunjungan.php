<?php

namespace App\Models\Pendaftaran;

use App\Models\Master\Ruangan;
use App\Models\RM\RPP;
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
}
