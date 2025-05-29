<?php

namespace App\Models\RM;

use Illuminate\Database\Eloquent\Model;

class Resume extends Model
{
    protected $connection = 'medicalrecord';

    protected $table = 'resume';

    protected $primaryKey = 'ID';


}
