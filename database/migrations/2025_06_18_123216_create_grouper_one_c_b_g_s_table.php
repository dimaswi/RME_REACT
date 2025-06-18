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
        Schema::connection('eklaim')->create('grouper_one_cbg', function (Blueprint $table) {
            $table->id();
            $table->string('cbg_one_id');
            $table->string('code')->nullable();
            $table->string('description')->nullable();
            $table->string('base_tariff')->nullable();
            $table->string('tariff')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('grouper_one_cbg');
    }
};
