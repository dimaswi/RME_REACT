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
        Schema::connection('eklaim')->create('grouper_one_sub_acute', function (Blueprint $table) {
            $table->id();
            $table->string('pengajuan_klaim_id');
            $table->string('code')->nullable();
            $table->string('description')->nullable();
            $table->decimal('tarif', 15, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('grouper_one_sub_acute');
    }
};
