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
        Schema::connection('eklaim')->create('grouper_one_tarif', function (Blueprint $table) {
            $table->id();
            $table->string('pengajuan_klaim_id');
            $table->string('kelas')->nullable();
            $table->string('tarif_inacbg')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('grouper_one_tarif');
    }
};
