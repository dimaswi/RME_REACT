<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class Ruangan extends Model
{
    protected $connection = 'master';

    protected $table = 'ruangan';

    protected $primaryKey = 'ID';
}
