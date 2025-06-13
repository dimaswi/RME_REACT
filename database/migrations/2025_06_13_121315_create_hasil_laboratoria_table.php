<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
        public function up()
    {
        Schema::connection('eklaim')->create('hasil_laboratorium', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laboratorium_tindakan_id')->constrained('laboratorium')->onDelete('cascade');
            $table->string('parameter_id'); // ID parameter master
            $table->string('parameter_nama'); // Nama parameter (cache)
            $table->string('hasil')->nullable();
            $table->string('nilai_normal')->nullable();
            $table->string('satuan')->nullable();
            $table->string('keterangan')->nullable();
            $table->string('oleh')->nullable();
            $table->tinyInteger('otomatis')->default(0);
            $table->tinyInteger('status')->default(1);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::connection('eklaim')->dropIfExists('hasil_laboratorium');
    }
};
