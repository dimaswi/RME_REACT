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
        Schema::connection('eklaim')->create('grouper_two_special_cmg', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grouper_one_id')
                ->constrained('grouper_one', 'id')
                ->onDelete('cascade');
            $table->string('code')->nullable();
            $table->string('description')->nullable();
            $table->string('type')->nullable(); // 'special' or 'cmg'
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('grouper_two_special_cmg');
    }
};
