<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('eklaim')->create('ttv_resume_medis', function (Blueprint $table) {
            $table->id();
            $table->string('resume_medis_id')->nullable();
            $table->string('tingkat_kesadaran')->nullable();
            $table->string('keadaan_umum')->nullable();
            $table->string('suhu')->nullable();
            $table->string('nadi')->nullable();
            $table->string('pernafasan')->nullable();
            $table->string('sistolik')->nullable();
            $table->string('diastolik')->nullable();
            $table->string('saturasi_o2')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('ttv_resume_medis');
    }
};
