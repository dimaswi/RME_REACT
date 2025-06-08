<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::connection('eklaim')->create('instruksi_tindak_lanjut', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('resume_medis_id');
            $table->string('poli_tujuan')->nullable();
            $table->string('tanggal')->nullable();
            $table->string('jam')->nullable();
            $table->string('nomor_bpjs')->nullable();
            $table->timestamps();


            $table->foreign('resume_medis_id')->references('id')->on('resume_medis')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::connection('eklaim')->dropIfExists('instruksi_tindak_lanjut');
    }
};
