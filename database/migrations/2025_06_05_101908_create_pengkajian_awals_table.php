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
        Schema::connection('eklaim')->create('pengkajian_awal', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_kunjungan')->nullable();
            $table->string('ruangan')->nullable();
            $table->datetime('tanggal_masuk')->nullable();
            $table->string('nama_pasien')->nullable();
            $table->string('alamat')->nullable();
            $table->string('nomor_rm')->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->string('jenis_kelamin')->nullable();
            $table->text('riwayat_alergi')->nullable();
            $table->text('edukasi_pasien')->nullable();
            $table->text('rencana_keperawatan')->nullable();
            $table->text('diagnosa_keperawatan')->nullable();
            $table->text('masalah_medis')->nullable();
            $table->text('rencana_terapi')->nullable();
            $table->string('nama_dokter')->nullable();
            $table->date('tanggal_tanda_tangan')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::connection('eklaim')->dropIfExists('pengkajian_awal');
    }
};
