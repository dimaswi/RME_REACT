<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class GrouperOne extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'grouper_one';

    protected $fillable = [
        'pengajuan_klaim_id',
        'kelas',
        'inacbg_version'
    ];

    public function cbg()
    {
        return $this->hasMany(GrouperOneCBG::class, 'grouper_one_id');
    }
}
