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
        Schema::connection('eklaim')->create('laboratorium', function (Blueprint $table) {
            $table->id();
            $table->string('pengajuan_klaim_id'); // Nomor order lab
            $table->string('kunjungan_id'); // ID kunjungan pasien
            $table->string('tindakan_id');  // ID master tindakan lab
            $table->string('nama_tindakan'); // Nama tindakan lab (cache)
            $table->dateTime('tanggal');
            $table->string('oleh')->nullable();
            $table->tinyInteger('status')->default(1);
            $table->tinyInteger('otomatis')->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::connection('eklaim')->dropIfExists('laboratorium');
    }
};
