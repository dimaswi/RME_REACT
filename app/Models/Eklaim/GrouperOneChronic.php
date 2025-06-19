<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class GrouperOneChronic extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'grouper_one_chronic';

    protected $fillable = [
        'grouper_one_id',
        'code',
        'description',
        'tarif',
    ];

    public function grouperOne()
    {
        return $this->belongsTo(PengajuanKlaim::class, 'grouper_one_id');
    }
}
