<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class RuangKamarTidur extends Model
{
    protected $connection = 'master';

    protected $table = 'ruang_kamar_tidur';

    protected $primaryKey = 'ID';

    public $timestamps = false;

    protected $fillable = [
        'RUANG_KAMAR',
        'TEMPAT_TIDUR',
        'STATUS'
    ];

    public function ruangKamar()
    {
        return $this->belongsTo(RuangKamar::class, 'RUANG_KAMAR', 'ID');
    }
}
