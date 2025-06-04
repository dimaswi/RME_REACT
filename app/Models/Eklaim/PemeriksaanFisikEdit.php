<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class PemeriksaanFisikEdit extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'pemeriksaan_fisik_edit';

    protected $fillable = [
        'pengkajian_awal',
        'mata',
        'ikterus',
        'pupil',
        'diameter_mata',
        'udem_palpebrae',
        'kelainan_mata',
        'tht',
        'tongsil',
        'faring',
        'lidah',
        'bibir',
        'leher',
        'jvp',
        'limfe',
        'kaku_kuduk',
        'thoraks',
        'cor',
        's1s2',
        'mur_mur',
        'pulmo',
        'suara_nafas',
        'ronchi',
        'wheezing',
        'abdomen',
        'meteorismus',
        'peristaltik',
        'asites',
        'nyeri_tekan',
        'hepar',
        'lien',
        'extremitas',
        'udem',
        'defeksesi',
        'urin',
        'lain_lain'
    ];
}
