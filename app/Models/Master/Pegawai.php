<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class Pegawai extends Model
{
    protected $connection = 'master';

    protected $table = 'pegawai';

    protected $primaryKey = 'ID';

    public $incrementing = true;

    public $timestamps = false;

    public function profesi()
    {
        return $this->hasOne(Referensi::class, 'ID', 'PROFESI')->where('JENIS', 36);
    }
}
