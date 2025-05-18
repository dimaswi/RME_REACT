<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class KontakPasien extends Model
{
    protected $connection = 'master';

    protected $table = 'kontak_pasien';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'JENIS',
        'NORM',
        'NOMOR',
    ];
}
