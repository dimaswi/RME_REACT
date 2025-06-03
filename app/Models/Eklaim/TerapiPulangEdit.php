<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class TerapiPulangEdit extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'terapi_pulang_edit';

    protected $fillable = [
        'resume_medis',
        'nama_obat',
        'jumlah',
        'frekuensi',
        'cara_pemakaian',
    ];
}
