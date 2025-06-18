<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class GrouperOneTarif extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'grouper_one_tarif';

    protected $fillable = [
        'pengajuan_klaim_id',
        'kelas',
        'tarif_inacbg'
    ];

    public function pengajuanKlaim()
    {
        return $this->belongsTo(PengajuanKlaim::class, 'pengajuan_klaim_id');
    }
}
