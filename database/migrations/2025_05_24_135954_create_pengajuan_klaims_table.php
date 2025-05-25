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
        Schema::connection('eklaim')->create('pengajuan_klaim', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->integer('NORM');
            $table->string('nomor_pendaftaran');
            $table->string('nomor_SEP');
            $table->tinyInteger('status')->default(0); // 0: pending, 1: approved, 2: rejected
            $table->string('petugas'); // Nama petugas yang mengajukan klaim
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('pengajuan_klaim');
    }
};
