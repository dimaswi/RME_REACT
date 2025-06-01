<?php

namespace App\Models\Inventory;

use Illuminate\Database\Eloquent\Model;

class Obat extends Model
{
    protected $connection = 'inventory';

    protected $table = 'barang';
}
