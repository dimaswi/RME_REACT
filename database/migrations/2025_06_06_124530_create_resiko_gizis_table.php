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
        Schema::connection('eklaim')->create('resiko_gizi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengkajian_awal_id')->constrained('pengkajian_awal');
            $table->string('penurunan_berat_badan')->nullable();
            $table->string('penurunan_asupan')->nullable();
            $table->string('diagnosis_khusus')->nullable();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('resiko_gizi');
    }
};
