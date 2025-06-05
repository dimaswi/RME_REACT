<?php

namespace App\Models\RM;

use App\Models\Master\Pasien;
use App\Models\Pendaftaran\Pendaftaran;
use Illuminate\Database\Eloquent\Model;

class Triage extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'triage';

    public function pendaftaranPasien()
    {
        return $this->belongsTo(Pendaftaran::class, 'NOMOR', 'NOPEN');
    }

    public function pasien()
    {
        return $this->belongsTo(Pasien::class, 'NORM', 'NORM');
    }
}
