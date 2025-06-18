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
        Schema::connection('eklaim')->create('data_tarif_klaim', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('klaim_data_id');
            $table->decimal('prosedur_non_bedah', 15, 2)->nullable();
            $table->decimal('prosedur_bedah', 15, 2)->nullable();
            $table->decimal('tenaga_ahli', 15, 2)->nullable();
            $table->decimal('keperawatan', 15, 2)->nullable();
            $table->decimal('penunjang', 15, 2)->nullable();
            $table->decimal('radiologi', 15, 2)->nullable();
            $table->decimal('laboratorium', 15, 2)->nullable();
            $table->decimal('pelayanan_darah', 15, 2)->nullable();
            $table->decimal('rehabilitasi', 15, 2)->nullable();
            $table->decimal('kamar', 15, 2)->nullable();
            $table->decimal('rawat_intensif', 15, 2)->nullable();
            $table->decimal('obat', 15, 2)->nullable();
            $table->decimal('obat_kronis', 15, 2)->nullable();
            $table->decimal('obat_kemoterapi', 15, 2)->nullable();
            $table->decimal('alkes', 15, 2)->nullable();
            $table->decimal('bmhp', 15, 2)->nullable();
            $table->decimal('sewa_alat', 15, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('data_tarif_klaim');
    }
};
