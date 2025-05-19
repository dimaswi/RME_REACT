<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class PPK extends Model
{
    protected $connection = 'master';

    protected $table = 'ppk';

    protected $primaryKey = 'ID';

    public $incrementing = true;

    public $timestamps = false;

    protected $fillable = [
        'KODE',
        'BPJS',
        'JENIS',
        'KEPEMILIKAN',
        'JPK',
        'NAMA',
        'KELAS',
        'ALAMAT',
        'RT',
        'RW',
        'KODEPOS',
        'TELEPON',
        'FAX',
        'WILAYAH',
        'DESWILAYAH',
        'MULAI',
        'BERAKHIR',
        'TANGGAL',
        'OLEH',
        'STATUS'
    ];
}
