<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class DataTarifKlaim extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'data_tarif_klaim';

    protected $fillable = [
        'klaim_data_id',
        'prosedur_non_bedah',
        'prosedur_bedah',
        'tenaga_ahli',
        'keperawatan',
        'konsultasi',
        'penunjang',
        'radiologi',
        'laboratorium',
        'pelayanan_darah',
        'rehabilitasi',
        'kamar',
        'rawat_intensif',
        'obat',
        'obat_kronis',
        'obat_kemoterapi',
        'alkes',
        'bmhp',
        'sewa_alat',
    ];

    public function klaimData()
    {
        return $this->belongsTo(DataKlaim::class, 'klaim_data_id');
    }
}
