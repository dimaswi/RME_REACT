<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class Dokter extends Model
{
    protected $connection = 'master';

    protected $table = 'dokter';

    protected $primaryKey = 'ID';

    public $incrementing = true;

    public $timestamps = false;

    public function pegawai()
    {
        return $this->belongsTo(Pegawai::class, 'NIP', 'NIP');
    }
}
