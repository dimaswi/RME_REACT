<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class KeluargaPasiens extends Model
{
    protected $connection = 'master';

    protected $table = 'keluarga_pasien';

    public $incrementing = true;

    public $timestamps = false;

    protected $primaryKey = 'ID';

    protected $fillable = [
        'SHDK',
        'NORM',
        'JENIS_KELAMIN',
        'NOMOR',
        'NAMA',
        'ALAMAT',
        'PENDIDIKAN',
        'PEKERJAAN',
        'TANGGAL_LAHIR',
    ];

    public function pasien()
    {
        return $this->belongsTo(Pasien::class, 'NORM', 'NORM');
    }

    public function hubungan()
    {
        return $this->belongsTo(Referensi::class, 'SHDK', 'ID')->where('JENIS', 7);
    }
}
