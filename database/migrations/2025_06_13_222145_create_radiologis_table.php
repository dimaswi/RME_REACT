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
        Schema::connection('eklaim')->create('radiologi', function (Blueprint $table) {
            $table->id();
            $table->string('id_pengajuan_klaim')->nullable();
            $table->string('nomor_kunjungan')->nullable();
            $table->string('nama_petugas')->nullable();
            $table->string('nama_dokter')->nullable();
            $table->string('tindakan')->nullable();
            $table->string('klinis')->nullable();
            $table->text('kesan')->nullable();
            $table->text('usul')->nullable();
            $table->text('hasil')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('radiologi');
    }
};
