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
        Schema::connection('eklaim')->create('keadaan_umum_edit', function (Blueprint $table) {
            $table->id();
            $table->string('pengkajian_awal');
            $table->string('keadaan_umum')->nullable();
            $table->string('tingkat_kesadaran')->nullable();
            $table->string('GCS')->nullable();
            $table->string('eye')->nullable();
            $table->string('motorik')->nullable();
            $table->string('verbal')->nullable();
            $table->string('tekanan_darah')->nullable();
            $table->string('frekuensi_nadi')->nullable();
            $table->string('frekuensi_nafas')->nullable();
            $table->string('suhu')->nullable();
            $table->string('berat_badan')->nullable();
            $table->string('saturasi_oksigen')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('keadaan_umum_edit');
    }
};
