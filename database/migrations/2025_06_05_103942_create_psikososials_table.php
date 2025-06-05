<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::connection('eklaim')->create('status_psikososial', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengkajian_awal_id')->constrained('pengkajian_awal');
            $table->string('status_psikologis')->nullable();
            $table->string('status_mental')->nullable();
            $table->string('hubungan_keluarga')->nullable();
            $table->string('tempat_tinggal')->nullable();
            $table->string('agama')->nullable();
            $table->string('kebiasaan_beribadah')->nullable();
            $table->string('pekerjaan')->nullable();
            $table->string('penghasilan')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::connection('eklaim')->dropIfExists('status_psikososial');
    }
};
