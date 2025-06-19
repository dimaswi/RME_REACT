<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class GrouperTwoSpecialCMG extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'grouper_two_special_cmg';

    protected $fillable = [
        'grouper_one_id',
        'code',
        'description',
        'type'
    ];

    public function grouperOne()
    {
        return $this->belongsTo(GrouperOne::class, 'grouper_one_id');
    }
}
