<?php

namespace App\Models\BPJS;

use Illuminate\Database\Eloquent\Model;

class Peserta extends Model
{
    protected $connection = 'bpjs';

    protected $table = 'peserta';

    public $timestamps = false;
}
