<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class GrouperOneChronic extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'grouper_one_chronic';

    protected $fillable = [
        'pengajuan_klaim_id',
        'code',
        'description',
        'tarif',
    ];

    public function pengajuanKlaim()
    {
        return $this->belongsTo(PengajuanKlaim::class, 'pengajuan_klaim_id');
    }
}
