<?php

namespace App\Models\Pembayaran;

use Illuminate\Database\Eloquent\Model;

class PembayaranTagihan extends Model
{
    protected $connection = 'pembayaran';

    protected $table = 'pembayaran_tagihan';

    public $timestamps = false;

    protected $primaryKey = 'NOMOR';

    public $incrementing = false;

    protected $fillable = [
        'TAGIHAN',
        'JENIS',
        'JENIS_LAYANAN_ID',
        'PENYEDIA_ID',
        'TANGGAL',
        'REKENING_ID',
        'NO_ID',
        'NAMA',
        'REF',
        'JENIS_KARTU',
        'BANK_ID',
        'DESKRIPSI',
        'BIAYA_ADMIN',
        'TOTAL',
        'BRIDGE',
        'TRANSAKSI_KASIR_NOMOR',
        'TANGGAL_DIBUAT',
        'BATAS_WAKTU',
        'OLEH',
        'DIUBAH_TANGGAL',
        'DIUBAH_OLEH',
        'STATUS',
    ];
}
