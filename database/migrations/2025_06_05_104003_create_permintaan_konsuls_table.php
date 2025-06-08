<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::connection('eklaim')->create('permintaan_konsul', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('resume_medis_id');
            $table->string('pertanyaan')->nullable();
            $table->string('jawaban')->nullable();
            $table->timestamps();

            $table->foreign('resume_medis_id')->references('id')->on('resume_medis')->onDelete('cascade');
        });

    }

    public function down()
    {
        Schema::connection('eklaim')->dropIfExists('permintaan_konsul');
    }
};
