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
        Schema::connection('eklaim')->create('psikologi_edit', function (Blueprint $table) {
            $table->id();
            $table->string('pengkajian_awal');
            $table->string('status_psikologi')->nullable();
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

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('psikologi_edit');
    }
};
