<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class grouperOneSpecialCmgOption extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'grouper_one_special_cmg_option';

    protected $fillable = [
        'pengajuan_klaim_id',
        'code',
        'description',
        'type'
    ];
}
