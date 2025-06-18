<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class GrouperOneInagrouper extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'grouper_one_inagrouper';

    protected $fillable = [
        'pengajuan_klaim_id',
        'mdc_number',
        'mdc_description',
        'drg_code',
        'drg_description'
    ];

    public function pengajuanKlaim()
    {
        return $this->belongsTo(PengajuanKlaim::class, 'pengajuan_klaim_id');
    }
}
