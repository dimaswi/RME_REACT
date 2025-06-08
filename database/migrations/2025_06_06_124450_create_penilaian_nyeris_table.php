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
        Schema::connection('eklaim')->create('penilaian_nyeri', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengkajian_awal_id')->constrained('pengkajian_awal');
            $table->string('durasi')->nullable();
            $table->string('onset')->nullable();
            $table->string('pencetus')->nullable();
            $table->string('lokasi')->nullable();
            $table->string('gambaran')->nullable();
            $table->string('nyeri')->nullable();
            $table->string('skala')->nullable();
            $table->string('metode')->nullable();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('penilaian_nyeri');
    }
};
