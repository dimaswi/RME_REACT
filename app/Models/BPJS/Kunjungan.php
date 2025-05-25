<?php

namespace App\Models\BPJS;

use Illuminate\Database\Eloquent\Model;

class Kunjungan extends Model
{
    protected $connection = 'bpjs';

    protected $table = 'kunjungan';

    public $timestamps = false;

    public $incrementing = false;

    protected $fillable = [
        'noKartu',
        'noSEP',
        'tglSEP',
        'tglRujukan',
        'asalRujukan',
        'noRujukan',
        'ppkRujukan',
        'ppkPelayanan',
        'jenisPelayanan',
        'catatan',
        'diagAwal',
        'poliTujuan',
        'eksekutif',
        'klsRawat',
        'klsRawatNaik',
        'pembiayaan',
        'penanggungJawab',
        'cob',
        'katarak',
        'noSuratSKDP',
        'dpjpSKDP',
        'lakaLantas',
        'penjamin',
        'tglKejadian',
        'suplesi',
        'noSuplesi',
        'lokasiLaka',
        'propinsi',
        'kabupaten',
        'kecamatan',
        'tujuanKunj',
        'flagProcedure',
        'kdPenunjang',
        'assesmentPel',
        'dpjpLayan',
        'noTelp',
        'user',
        'cetak',
        'jmlCetak',
        'ip',
        'noTrans',
        'errMsgMapTrx',
        'manualUptNoTrans',
        'tglPlg',
        'statusPulang',
        'noSuratMeninggal',
        'tglMeninggal',
        'noLPManual',
        'errMsgUptTglPlg',
        'status',
        'user_batal',
        'batalSEP',
        'errMsgBatalSEP'
    ];
}
