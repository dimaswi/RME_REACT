<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class Referensi extends Model
{
    protected $connection = 'master';

    protected $table = 'referensi';

    protected $primaryKey = 'TABLE_ID';
}
