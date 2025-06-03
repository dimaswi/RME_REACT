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
        Schema::connection('eklaim')->create('pengkajian_awal', function (Blueprint $table) {
            $table->id();
            $table->string('nama_pasien')->nullable();
            $table->string('ruangan')->nullable();
            $table->string('tanggal_masuk')->nullable();
            $table->string('alamat')->nullable();
            $table->string('NORM')->nullable();
            $table->string('tanggal_lahir')->nullable();
            $table->string('jenis_kelamin')->nullable();
            $table->string('anamnesa')->nullable(); //Model Baru
            $table->string('keadaan_umum')->nullable(); //Model Baru
            $table->string('pemeriksaan_fisik')->nullable(); //Model Baru
            $table->string('psikologi')->nullable(); //Model Baru
            $table->string('riwayat_alergi')->nullable();
            $table->string('nyeri')->nullable(); //Model Baru
            $table->string('resiko_jatuh')->nullable();
            $table->string('skor_resiko_jatuh')->nullable();
            $table->string('metode_penilaian_resiko_jatuh')->nullable();
            $table->string('resiko_dekubitus')->nullable();
            $table->string('skor_resiko_dekubitus')->nullable();
            $table->string('penurunan_berat_badan')->nullable();
            $table->string('nafsu_makan')->nullable();
            $table->string('diagnosa_khusus')->nullable();
            $table->string('edukasi_pasien')->nullable();
            $table->string('skrining_rencana_pulang')->nullable();
            $table->string('faktor_risiko_rencana_pulang')->nullable();
            $table->string('tindak_lanjut_rencana_pulang')->nullable();
            $table->string('rencana_keperawatan')->nullable();
            $table->string('masalah_medis')->nullable();
            $table->string('diagnosa_medis')->nullable();
            $table->string('rencana_terapi')->nullable();
            $table->string('dokter')->nullable();
            $table->string('tanda_tangan_perawat')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('pengkajian_awal');
    }
};
