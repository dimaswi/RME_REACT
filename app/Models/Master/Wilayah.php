<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class Wilayah extends Model
{
    protected $connection = 'master'; // Ganti dengan koneksi database yang sesuai
    protected $table = 'wilayah';
    // protected $primaryKey = 'ID';

    // Tambahkan ini jika nama tabel wilayah berbeda
    // protected $table = 'nama_tabel_wilayah';
}
