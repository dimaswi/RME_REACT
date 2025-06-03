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
        Schema::connection('eklaim')->create('nyeri_edit', function (Blueprint $table) {
            $table->id();
            $table->string('pengkajian_awal');
            $table->string('nyeri')->nullable();
            $table->string('onset')->nullable();
            $table->string('pencetus')->nullable();
            $table->string('lokasi_nyeri')->nullable();
            $table->string('gambaran_nyeri')->nullable();
            $table->string('durasi')->nullable();
            $table->string('skala')->nullable();
            $table->string('motode')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('nyeri_edit');
    }
};
