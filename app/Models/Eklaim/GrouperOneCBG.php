<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class GrouperOneCBG extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'grouper_one_cbg';

    protected $fillable = [
        'grouper_one_id',
        'code',
        'description',
        'base_tariff',
        'tariff'
    ];

    public function grouperOne()
    {
        return $this->belongsTo(GrouperOne::class, 'grouper_one_id');
    }
}
