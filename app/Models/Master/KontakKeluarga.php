<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class KontakKeluarga extends Model
{
    protected $connection = 'master';

    protected $table = 'kontak_keluarga_pasien';

    public $incrementing = false;

    public $timestamps = false;

    protected $primaryKey = 'ID';

    protected $fillable = [
        'SHDK',
        'JENIS',
        'NORM',
        'NOMOR',
    ];
}
