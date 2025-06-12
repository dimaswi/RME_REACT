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
        Schema::connection('eklaim')->create('rincian_tagihan', function (Blueprint $table) {
            $table->id();
            $table->string('id_pengajuan_klaim');
            $table->string('tagihan');
            $table->string('id_tarif');
            $table->string('jumlah');
            $table->string('tarif');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('rincian_tagihan');
    }
};
