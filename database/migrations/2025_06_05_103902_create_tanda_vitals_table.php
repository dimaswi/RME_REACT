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
        Schema::connection('eklaim')->create('tanda_vital', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengkajian_awal_id')->constrained('pengkajian_awal');
            $table->string('tingkat_kesadaran')->nullable();
            $table->string('keadaan_umum')->nullable();
            $table->string('gcs')->nullable();
            $table->string('eye')->nullable();
            $table->string('motorik')->nullable();
            $table->string('verbal')->nullable();
            $table->string('tekanan_darah')->nullable();
            $table->string('frekuensi_nadi')->nullable();
            $table->string('frekuensi_nafas')->nullable();
            $table->string('suhu')->nullable();
            $table->string('berat_badan')->nullable();
            $table->string('saturasi_o2')->nullable();
            $table->timestamps();
        });

    }

    public function down()
    {
        Schema::connection('eklaim')->dropIfExists('tanda_vital');
    }
};
