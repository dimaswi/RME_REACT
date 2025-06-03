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
        Schema::connection('eklaim')->create('tagihan_edit', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_tagihan');
            $table->string('jenis_tagihan');
            $table->string('nama_tagihan');
            $table->string('jumlah_tagihan');
            $table->string('harga_tagihan');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('tagihan_edit');
    }
};
