<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class PemeriksaanFisik extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'pemeriksaan_fisik';

    protected $fillable = [
        'pengkajian_awal_id',
        'mata',
        'ikterus',
        'pupil',
        'diameter_mata',
        'udema_palpebrae',
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
        'murmur',
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
        'pemeriksaan_lain_lain'
    ];
}
