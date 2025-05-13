<?php

namespace App\Models\Pendaftaran;

use App\Models\Master\Ruangan;
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
}
