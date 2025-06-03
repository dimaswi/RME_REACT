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
        Schema::connection('eklaim')->create('resume_medis', function (Blueprint $table) {
            $table->id();
            $table->string('nama_pasien')->nullable();
            $table->string('NORM')->nullable();
            $table->string('tanggal_lahir')->nullable();
            $table->string('jenis_kelamin')->nullable();
            $table->string('tanggal_masuk')->nullable();
            $table->string('tanggal_keluar')->nullable();
            $table->string('lama_dirawat')->nullable();
            $table->string('ruang_rawat')->nullable();
            $table->string('penjamin')->nullable();
            $table->string('indikasi_rawat_inap')->nullable();
            $table->string('riwayat_penyakit_sekarang')->nullable();
            $table->string('riwayat_penyakit_dulu')->nullable();
            $table->string('pemeriksaan_fisik')->nullable();
            $table->string('konsultasi')->nullable(); // Model Baru
            $table->string('diagnosa_utama')->nullable();
            $table->string('icd10_utama')->nullable();
            $table->string('diagnosa_sekunder')->nullable();
            $table->string('icd10_sekunder')->nullable();
            $table->string('prosedur_utama')->nullable();
            $table->string('icd9_utama')->nullable();
            $table->string('prosedur_sekunder')->nullable();
            $table->string('icd9_sekunder')->nullable();
            $table->string('riwayat_alergi')->nullable();
            $table->string('keadaan_pulang')->nullable();
            $table->string('cara_pulang')->nullable();
            $table->string('terapi_pulang')->nullable();
            $table->string('intruksi_tindak_lanjut')->nullable(); // Model Baru
            $table->string('dokter')->nullable();
            $table->string('tanda_tangan_pasien')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('resume_medis');
    }
};
