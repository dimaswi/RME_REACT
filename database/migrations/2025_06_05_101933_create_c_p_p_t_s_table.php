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
        Schema::connection('eklaim')->create('cppt', function (Blueprint $table) {
            $table->id();
            $table->string('resume_medis_id')->nullable();
            $table->string('nomor_kunjungan')->nullable();
            $table->datetime('tanggal_jam')->nullable();
            $table->string('profesi')->nullable();
            $table->string('nama_petugas')->nullable();
            $table->text('subyektif')->nullable();
            $table->text('obyektif')->nullable();
            $table->text('assesment')->nullable();
            $table->text('planning')->nullable();
            $table->text('instruksi')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::connection('eklaim')->dropIfExists('cppt');
    }
};
