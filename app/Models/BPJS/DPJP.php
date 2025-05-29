<?php

namespace App\Models\BPJS;

use Illuminate\Database\Eloquent\Model;

class DPJP extends Model
{
    protected $connection = 'bpjs';

    protected $table = 'dpjp';

    public $timestamps = false;
}
