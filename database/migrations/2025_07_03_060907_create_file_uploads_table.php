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
        Schema::connection('eklaim')->create('file_upload', function (Blueprint $table) {
            $table->id();
            $table->string('pengajuan_klaim_id');
            $table->string('file_id');
            $table->string('file_name');
            $table->string('file_type');
            $table->string('file_size');
            $table->string('file_class');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('file_upload');
    }
};
