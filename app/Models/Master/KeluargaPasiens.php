<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class KeluargaPasiens extends Model
{
    protected $connection = 'master';

    protected $table = 'keluarga_pasien';

    protected $primaryKey = 'ID';

    public function pasien()
    {
        return $this->belongsTo(Pasien::class, 'NORM', 'NORM');
    }

    public function hubungan()
    {
        return $this->belongsTo(Referensi::class, 'SHDK', 'ID')->where('JENIS', 7);
    }
}
