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
        Schema::connection('eklaim')->create('resume_medis', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_pengajuan_klaim')->nullable();
            $table->string('nama_pasien')->nullable();
            $table->string('no_rm')->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->string('jenis_kelamin')->nullable();
            $table->string('ruang_rawat')->nullable();
            $table->string('penjamin')->nullable();
            $table->string('indikasi_rawat_inap')->nullable();
            $table->dateTime('tanggal_masuk')->nullable();
            $table->dateTime('tanggal_keluar')->nullable();
            $table->string('lama_dirawat')->nullable();
            $table->text('riwayat_penyakit_sekarang')->nullable();
            $table->text('riwayat_penyakit_lalu')->nullable();
            $table->text('pemeriksaan_fisik')->nullable();
            $table->string('diagnosa_utama')->nullable();
            $table->string('icd10_utama')->nullable();
            $table->string('diagnosa_sekunder')->nullable();
            $table->string('icd10_sekunder')->nullable();
            $table->string('tindakan_prosedur')->nullable();
            $table->string('icd9_utama')->nullable();
            $table->string('tindakan_prosedur_sekunder')->nullable();
            $table->string('icd9_sekunder')->nullable();
            $table->text('riwayat_alergi')->nullable();
            $table->string('keadaan_pulang')->nullable();
            $table->string('cara_pulang')->nullable();
            $table->string('dokter')->nullable();

            // JSON untuk array/objek
            $table->json('permintaan_konsul')->nullable();
            $table->json('terapi_pulang')->nullable();
            $table->json('instruksi_tindak_lanjut')->nullable();

            // Relasi ke dokumen lain (jika ingin)
            $table->unsignedBigInteger('pengkajian_awal_id')->nullable();
            $table->unsignedBigInteger('triage_id')->nullable();

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::connection('eklaim')->dropIfExists('resume_medis');
    }
};
