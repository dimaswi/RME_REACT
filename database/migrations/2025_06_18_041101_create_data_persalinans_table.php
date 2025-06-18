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
        Schema::connection('eklaim')->create('data_persalinan', function (Blueprint $table) {
           $table->id();
            $table->unsignedBigInteger('klaim_data_id');
            $table->string('usia_kehamilan')->nullable();
            $table->string('gravida')->nullable();
            $table->string('partus')->nullable();
            $table->string('abortus')->nullable();
            $table->string('onset_kontraksi')->nullable();
            $table->timestamps();

            $table->foreign('klaim_data_id')->references('id')->on('data_klaim')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('data_persalinan');
    }
};
