<?php

namespace App\Models\Eklaim;

use Illuminate\Database\Eloquent\Model;

class FileUpload extends Model
{
    protected $connection = 'eklaim';

    protected $table = 'file_upload';

    protected $fillable = [
        'pengajuan_klaim_id',
        'file_id',
        'file_name',
        'file_type',
        'file_size',
        'file_class',
        'file_blob',
    ];
}
