<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class DokterRuangan extends Model
{
    protected $connection = 'master';

    protected $table = 'dokter_ruangan';

    protected $primaryKey = 'ID';

    public $incrementing = true;

    public $timestamps = false;

    protected $fillable = [
        'TANGGAL',
        'DOKTER',
        'RUANGAN',
        'STATUS',
    ];

    public function dataDokter()
    {
        return $this->belongsTo(Dokter::class, 'DOKTER', 'ID');
    }
}
