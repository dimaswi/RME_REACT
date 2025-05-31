<?php

namespace App\Models\Layanan;

use App\Models\Master\Referensi;
use App\Models\Pendaftaran\Kunjungan;
use Illuminate\Database\Eloquent\Model;

class PasienPulang extends Model
{
    protected $connection = 'layanan';

    protected $table = 'pasien_pulang';

    protected $primaryKey = 'ID';

    public $timestamps = false;

    protected $fillable = [
        'KUNJUNGAN',
        'NOPEN',
        'TANGGAL',
        'CARA',
        'KEADAAN',
        'DIAGNOSA',
        'DOKTER',
        'OLEH',
        'STATUS'
    ];

    public function kunjunganPasien()
    {
        return $this->belongsTo(Kunjungan::class, 'KUNJUNGAN', 'NOMOR');
    }

    public function keadaanPulang()
    {
        return $this->belongsTo(Referensi::class, 'KEADAAN', 'ID')->where('JENIS', 46);
    }

    public function caraPulang()
    {
        return $this->belongsTo(Referensi::class, 'CARA', 'ID')->where('JENIS', 45);
    }
}
