<?php

namespace App\Models\RM;

use App\Models\Master\Referensi;
use Illuminate\Database\Eloquent\Model;

class TTV extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'tanda_vital';

    public function tingkatKesadaran()
    {
        return $this->hasOne(Referensi::class, 'ID', 'TINGKAT_KESADARAN')
            ->where('JENIS', 264);
    }
}
