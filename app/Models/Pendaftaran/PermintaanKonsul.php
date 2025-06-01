<?php

namespace App\Models\Pendaftaran;

use Illuminate\Database\Eloquent\Model;

class PermintaanKonsul extends Model
{
    protected $connection = 'pendaftaran';

    protected $table = 'konsul';

    public function jawabanKonsul()
    {
        return $this->hasOne(JawabanKonsul::class, 'KONSUL_NOMOR', 'NOMOR');
    }
}
