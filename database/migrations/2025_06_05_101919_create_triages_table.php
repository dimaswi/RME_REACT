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
        Schema::connection('eklaim')->create('triage', function (Blueprint $table) {
            $table->id();
            $table->string('nama_pasien')->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->string('no_rm')->nullable();
            $table->string('jenis_kelamin')->nullable();
            $table->string('nomor_kunjungan')->nullable();
            $table->datetime('tanggal_kedatangan')->nullable();
            $table->string('alat_transportasi')->nullable();
            $table->string('cara_datang')->nullable();
            $table->string('pengantar')->nullable();
            $table->string('pasien_rujukan')->nullable();
            $table->boolean('pasien_rujukan_sisrute')->nullable();
            $table->string('dikirim_polisi')->nullable();
            $table->boolean('permintaan_visum')->nullable();
            $table->string('jenis_kasus')->nullable();
            $table->string('lokasi_kasus')->nullable();
            $table->boolean('laka_lantas')->nullable();
            $table->boolean('kecelakaan_kerja')->nullable();
            $table->text('keluhan_utama')->nullable();
            $table->text('anamnesa_terpimpin')->nullable();
            $table->string('tekanan_darah')->nullable();
            $table->string('nadi')->nullable();
            $table->string('pernapasan')->nullable();
            $table->string('suhu')->nullable();
            $table->string('nyeri')->nullable();
            $table->string('metode_ukur_nyeri')->nullable();
            $table->boolean('resustasi')->nullable();
            $table->boolean('emergency')->nullable();
            $table->boolean('urgent')->nullable();
            $table->boolean('less_urgent')->nullable();
            $table->boolean('non_urgent')->nullable();
            $table->boolean('zona_hitam')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::connection('eklaim')->dropIfExists('triage');
    }
};
