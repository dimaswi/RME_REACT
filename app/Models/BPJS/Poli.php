<?php

namespace App\Models\BPJS;

use Illuminate\Database\Eloquent\Model;

class Poli extends Model
{
    protected $connection = 'bpjs';

    protected $table = 'poli';

    public $timestamps = false;
}
