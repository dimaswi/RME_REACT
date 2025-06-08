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
        Schema::connection('eklaim')->create('anamnesis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengkajian_awal_id')->constrained('pengkajian_awal');
            $table->boolean('auto_anamnesis')->nullable();
            $table->boolean('allo_anamnesis')->nullable();
            $table->string('dari')->nullable();
            $table->text('keluhan_utama')->nullable();
            $table->text('riwayat_penyakit_sekarang')->nullable();
            $table->text('riwayat_penyakit_lalu')->nullable();
            $table->text('riwayat_pengobatan')->nullable();
            $table->text('riwayat_penyakit_keluarga')->nullable();
            $table->timestamps();
        });
    }


    public function down()
    {
        Schema::connection('eklaim')->dropIfExists('anamnesis');
    }
};
