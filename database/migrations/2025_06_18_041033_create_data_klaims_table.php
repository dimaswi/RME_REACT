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
        Schema::connection('eklaim')->create('data_klaim', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pengajuan_klaim_id');
            $table->string('nomor_sep')->nullable();
            $table->string('nomor_kartu')->nullable();
            $table->date('tgl_masuk')->nullable();
            $table->date('tgl_pulang')->nullable();
            $table->string('cara_masuk')->nullable();
            $table->string('jenis_rawat')->nullable();
            $table->string('kelas_rawat')->nullable();
            $table->string('adl_sub_acute')->nullable();
            $table->string('adl_chronic')->nullable();
            $table->string('icu_indikator')->nullable();
            $table->string('icu_los')->nullable();
            $table->string('ventilator_hour')->nullable();
            $table->string('ventilator_use_ind')->nullable();
            $table->string('ventilator_start_dttm')->nullable();
            $table->string('ventilator_stop_dttm')->nullable();
            $table->string('upgrade_class_ind')->nullable();
            $table->string('upgrade_class_class')->nullable();
            $table->string('upgrade_class_los')->nullable();
            $table->string('upgrade_class_payor')->nullable();
            $table->string('add_payment_pct')->nullable();
            $table->string('birth_weight')->nullable();
            $table->string('sistole')->nullable();
            $table->string('diastole')->nullable();
            $table->string('discharge_status')->nullable();
            $table->text('diagnosa')->nullable();
            $table->text('procedure')->nullable();
            $table->text('diagnosa_inagrouper')->nullable();
            $table->text('procedure_inagrouper')->nullable();
            $table->string('pemulasaraan_jenazah')->nullable();
            $table->string('kantong_jenazah')->nullable();
            $table->string('peti_jenazah')->nullable();
            $table->string('plastik_erat')->nullable();
            $table->string('desinfektan_jenazah')->nullable();
            $table->string('mobil_jenazah')->nullable();
            $table->string('desinfektan_mobil_jenazah')->nullable();
            $table->string('covid19_status_cd')->nullable();
            $table->string('nomor_kartu_t')->nullable();
            $table->string('episodes')->nullable();
            $table->string('covid19_cc_ind')->nullable();
            $table->string('covid19_rs_darurat_ind')->nullable();
            $table->string('covid19_co_insidense_ind')->nullable();
            $table->string('terapi_konvalesen')->nullable();
            $table->string('akses_naat')->nullable();
            $table->string('isoman_ind')->nullable();
            $table->string('bayi_lahir_status_cd')->nullable();
            $table->string('dializer_single_use')->nullable();
            $table->string('kantong_darah')->nullable();
            $table->string('alteplase_ind')->nullable();
            $table->string('tarif_poli_eks')->nullable();
            $table->string('nama_dokter')->nullable();
            $table->string('kode_tarif')->nullable();
            $table->string('payor_id')->nullable();
            $table->string('payor_cd')->nullable();
            $table->string('cob_cd')->nullable();
            $table->string('coder_nik')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('eklaim')->dropIfExists('data_klaim');
    }
};
