<?php

namespace App\Models\Layanan;

use App\Models\Master\Tindakan;
use Illuminate\Database\Eloquent\Model;

class TindakanMedis extends Model
{
    protected $connection = 'layanan';

    protected $table = 'tindakan_medis';

    public function tindakanLaboratorium()
    {
        return $this->hasOne(Tindakan::class, 'ID', 'TINDAKAN')->where('JENIS', 8);
    }

    public function tindakanRadiologi()
    {
        return $this->hasOne(Tindakan::class, 'ID', 'TINDAKAN')->where('JENIS', 7);
    }

    public function hasilLab()
    {
        return $this->hasMany(HasilLab::class, 'TINDAKAN_MEDIS', 'ID');
    }

    public function hasilRadiologi()
    {
        return $this->hasOne(HasilRad::class, 'TINDAKAN_MEDIS', 'ID');
    }
}
