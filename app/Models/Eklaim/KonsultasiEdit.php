<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class KonsultasiEdit extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'konsultasi_edit';

    protected $fillable = [
        'resume_medis',
        'pertanyaan',
        'jawaban',
    ];
}
