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
        Schema::connection('eklaim')->create('data_klaim', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nomor_pendaftaran')->unique();
            $table->longText('request');
            $table->string('method');
            $table->string('url');
            $table->string('status_code');
            $table->string('response');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_klaim');
    }
};
