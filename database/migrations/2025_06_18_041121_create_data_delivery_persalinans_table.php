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
        Schema::connection('eklaim')->create('data_delivery_persalinan', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('klaim_persalinan_id');
            $table->string('delivery_sequence')->nullable();
            $table->string('delivery_method')->nullable();
            $table->string('delivery_dttm')->nullable();
            $table->string('letak_janin')->nullable();
            $table->string('kondisi')->nullable();
            $table->string('use_manual')->nullable();
            $table->string('use_forcep')->nullable();
            $table->string('use_vacuum')->nullable();
            $table->string('shk_spesimen_ambil')->nullable();
            $table->string('shk_lokasi')->nullable();
            $table->string('shk_spesimen_dttm')->nullable();
            $table->string('shk_alasan')->nullable();
            $table->timestamps();

            $table->foreign('klaim_persalinan_id')->references('id')->on('data_persalinan')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('data_delivery_persalinan');
    }
};
