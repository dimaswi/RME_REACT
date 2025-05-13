<?php

namespace App\Models\Pendaftaran;

use Illuminate\Database\Eloquent\Model;

class Pendaftaran extends Model
{
    protected $connection = 'pendaftaran';

    protected $table = 'pendaftaran';

    protected $primaryKey = 'NOMOR';

    public function riwayatKunjungan()
    {
        return $this->hasMany(Kunjungan::class, 'NOPEN', 'NOMOR');
    }
}
