<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class LogKlaim extends Model
{
    use HasUuids;

    protected $connection = 'eklaim';
    protected $table = 'log_klaim';

    protected $fillable = [
        'nomor_SEP',
        'method',
        'request',
        'response',
    ];
}
