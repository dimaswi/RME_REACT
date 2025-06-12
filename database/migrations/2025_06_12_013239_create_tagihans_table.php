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
        Schema::connection('eklaim')->create('tagihan', function (Blueprint $table) {
            $table->id();
            $table->string('id_pengajuan_klaim');
            $table->string('tagihan');
            $table->string('total');
            $table->string('prosedur_bedah');
            $table->string('prosedur_non_bedah');
            $table->string('konsultasi');
            $table->string('tenaga_ahli');
            $table->string('keperawatan');
            $table->string('penunjang');
            $table->string('radiologi');
            $table->string('laboratorium');
            $table->string('bank_darah');
            $table->string('rehab_medik');
            $table->string('akomodasi');
            $table->string('akomodasi_intensif');
            $table->string('obat');
            $table->string('obat_kronis');
            $table->string('obat_kemoterapi');
            $table->string('alkes');
            $table->string('bmhp');
            $table->string('sewa_alat');
            $table->string('lama_rawat_intensif');
            $table->string('lama_penggunaan_ventilator');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('tagihan');
    }
};
