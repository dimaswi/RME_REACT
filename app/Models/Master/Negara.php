<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class Negara extends Model
{
    protected $connection = 'master'; // Ganti dengan koneksi database yang sesuai
    protected $table = 'negara';
    protected $primaryKey = 'ID';
}
