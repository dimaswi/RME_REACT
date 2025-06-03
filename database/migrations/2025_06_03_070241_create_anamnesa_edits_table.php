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
        Schema::connection('eklaim')->create('anamnesa_edit', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->string('pengkajian_awal');
            $table->string('anamnesa_diperoleh')->nullable();
            $table->string('anamnesa_diperoleh_dari')->nullable();
            $table->string('keluhan_utama')->nullable();
            $table->string('riwayat_penyakit_sekarang')->nullable();
            $table->string('riwayat_penyakit_dulu')->nullable();
            $table->string('riwayat_pengobatan')->nullable();
            $table->string('riwayat_penyakit_keluarga')->nullable();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('anamnesa_edit');
    }
};
