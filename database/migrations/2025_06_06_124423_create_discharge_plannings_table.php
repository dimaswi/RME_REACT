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
        Schema::connection('eklaim')->create('discharge_planning', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengkajian_awal_id')->constrained('pengkajian_awal');
            $table->string('faktor_resiko')->nullable();
            $table->string('skrinning')->nullable();
            $table->string('tindak_lanjut')->nullable();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('discharge_planning');
    }
};
