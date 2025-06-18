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
        Schema::connection('eklaim')->create('data_apgar', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('klaim_data_id');
            $table->string('appearance_1')->nullable();
            $table->string('pulse_1')->nullable();
            $table->string('grimace_1')->nullable();
            $table->string('activity_1')->nullable();
            $table->string('respiration_1')->nullable();
            $table->string('appearance_5')->nullable();
            $table->string('pulse_5')->nullable();
            $table->string('grimace_5')->nullable();
            $table->string('activity_5')->nullable();
            $table->string('respiration_5')->nullable();
            $table->timestamps();

            $table->foreign('klaim_data_id')->references('id')->on('data_klaim')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('data_apgar');
    }
};
