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

    public function specialCmg()
    {
        return $this->hasMany(GrouperTwoSpecialCMG::class, 'grouper_one_id');
    }

    public function subAcute()
    {
        return $this->hasMany(GrouperOneSubAcute::class, 'grouper_one_id');
    }

    public function chronic()
    {
        return $this->hasMany(GrouperOneChronic::class, 'grouper_one_id');
    }
}
