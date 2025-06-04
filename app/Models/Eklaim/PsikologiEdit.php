<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class PsikologiEdit extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'psikologi_edit';

    protected $fillable = [
        'pengkajian_awal',
        'status_psikologi',
        'status_mental',
        'hubungan_keluarga',
        'tempat_tinggal',
        'agama',
        'kebiasaan_beribadah',
        'pekerjaan',
        'penghasilan'
    ];
}
