<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class KartuIdentitasPasien extends Model
{
    protected $connection = 'master';

    protected $table = 'kartu_identitas_pasien';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'JENIS',
        'NORM',
        'NOMOR',
        'ALAMAT',
        'RT',
        'RW',
        'KODEPOS',
        'WILAYAH',
    ];

    public function jenisKartuIdentitas()
    {
        return $this->belongsTo(Referensi::class, 'JENIS', 'ID')->where('JENIS', 9);
    }
}
