<?php

namespace App\Models\RM;

use Illuminate\Database\Eloquent\Model;

class RencanaTerapi extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'rencana_terapi';
}
