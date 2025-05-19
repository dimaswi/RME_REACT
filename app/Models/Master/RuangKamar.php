<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class RuangKamar extends Model
{
    protected $connection = 'master';

    protected $table = 'ruang_kamar';

    protected $primaryKey = 'ID';

    public $timestamps = false;

    protected $fillable = [
        'RUANGAN',
        'KAMAR',
        'KELAS',
        'STATUS'
    ];

    public function ruangKamarTidur()
    {
        return $this->hasMany(RuangKamarTidur::class, 'RUANG_KAMAR', 'ID')->where('STATUS', '!=', 0);
    }

    public function ruangan()
    {
        return $this->belongsTo(Ruangan::class, 'RUANGAN', 'ID');
    }
}
