<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class KartuIdentitasKeluarga extends Model
{
    protected $connection = 'master';

    protected $table = 'kartu_identitas_keluarga';

    public $incrementing = true;

    public $timestamps = false;

    protected $primaryKey = 'ID';

    protected $fillable = [
        'JENIS',
        'KELUARGA_PASIEN_ID',
        'NOMOR',
        'ALAMAT',
        'RT',
        'RW',
        'KODEPOS',
        'WILAYAH',
    ];

}
