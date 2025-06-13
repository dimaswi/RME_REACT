<?php

namespace App\Models\Eklaim;

use App\Models\Master\ParameterTindakanLab;
use Illuminate\Database\Eloquent\Model;

class HasilLaboratorium extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'hasil_laboratorium';

    protected $fillable = [
        'laboratorium_tindakan_id',
        'parameter_id',
        'parameter_nama',
        'hasil',
        'nilai_normal',
        'satuan',
        'keterangan',
        'oleh',
        'otomatis',
        'status'
    ];

    protected $casts = [
        'parameter_id' => 'integer',
    ];

    public function parameterTindakanLab()
    {
        return $this->belongsTo(ParameterTindakanLab::class, 'parameter_id', 'ID');
    }
}

