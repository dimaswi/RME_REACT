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
        Schema::connection('eklaim')->create('pemeriksaan_fisik', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengkajian_awal_id')->constrained('pengkajian_awal');
            $table->string('mata')->nullable();
            $table->string('ikterus')->nullable();
            $table->string('pupil')->nullable();
            $table->string('diameter_mata')->nullable();
            $table->string('udema_palpebrae')->nullable();
            $table->string('kelainan_mata')->nullable();
            $table->string('tht')->nullable();
            $table->string('tongsil')->nullable();
            $table->string('faring')->nullable();
            $table->string('lidah')->nullable();
            $table->string('bibir')->nullable();
            $table->string('leher')->nullable();
            $table->string('jvp')->nullable();
            $table->string('limfe')->nullable();
            $table->string('kaku_kuduk')->nullable();
            $table->string('thoraks')->nullable();
            $table->string('cor')->nullable();
            $table->string('s1s2')->nullable();
            $table->string('murmur')->nullable();
            $table->string('pulmo')->nullable();
            $table->string('suara_nafas')->nullable();
            $table->string('ronchi')->nullable();
            $table->string('wheezing')->nullable();
            $table->string('abdomen')->nullable();
            $table->string('meteorismus')->nullable();
            $table->string('peristaltik')->nullable();
            $table->string('asites')->nullable();
            $table->string('nyeri_tekan')->nullable();
            $table->string('hepar')->nullable();
            $table->string('lien')->nullable();
            $table->string('extremitas')->nullable();
            $table->string('udem')->nullable();
            $table->string('defeksesi')->nullable();
            $table->string('urin')->nullable();
            $table->string('pemeriksaan_lain_lain')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::connection('eklaim')->dropIfExists('pemeriksaan_fisik');
    }
};
