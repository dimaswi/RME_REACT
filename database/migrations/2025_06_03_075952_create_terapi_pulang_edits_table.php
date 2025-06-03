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
        Schema::connection('eklaim')->create('terapi_pulang', function (Blueprint $table) {
            $table->id();
            $table->string('pengajuan_klaim');
            $table->string('nama_obat')->nullable();
            $table->string('jumlah')->nullable();
            $table->string('frekuensi')->nullable();
            $table->string('cara_pemberian')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('terapi_pulang');
    }
};
