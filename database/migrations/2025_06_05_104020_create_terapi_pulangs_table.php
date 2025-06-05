<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::connection('eklaim')->create('terapi_pulang', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('resume_medis_id');
            $table->string('nama_obat')->nullable();
            $table->string('jumlah')->nullable();
            $table->string('frekuensi')->nullable();
            $table->string('cara_pemberian')->nullable();
            $table->timestamps();

            $table->foreign('resume_medis_id')->references('id')->on('resume_medis')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::connection('eklaim')->dropIfExists('terapi_pulang');
    }
};
