<?php

use App\Http\Controllers\Eklaim\KlaimController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('eklaim/klaim', [KlaimController::class, 'index'])->name('eklaim.klaim.index');
    Route::get('eklaim/klaim/list-pengajuanm', [KlaimController::class, 'listPengajuanKlaim'])->name('eklaim.klaim.indexPengajuanKlaim');
    Route::get('eklaim/klaim/{pasien}', [KlaimController::class, 'show'])->name('eklaim.klaim.show');
    Route::post('eklaim/klaim/pengajuan', [KlaimController::class, 'storePengajuanKlaim'])->name('eklaim.klaim.storePengajuanKlaim');
    Route::get('eklaim/klaim/{dataKlaim}/isi', [KlaimController::class, 'dataKlaim'])->name('eklaim.klaim.dataKlaim');
    Route::post('eklaim/klaim/{pengajuanKlaim}/ajukan_ulang', [KlaimController::class, 'ajukanUlangKlaim'])->name('eklaim.klaim.pengajuanUlang');
    Route::post('eklaim/klaim/{pengajuanKlaim}/hapus', [KlaimController::class, 'hapusDataKlaim'])->name('eklaim.klaim.hapusDataKlaim');
    Route::post('eklaim/klaim/{pengajuanKlaim}/edit', [KlaimController::class, 'editUlangKlaim'])->name('eklaim.klaim.editUlangKlaim');
    Route::get('eklaim/klaim/{pengajuanKlaim}/detailKlaim', [KlaimController::class, 'getDataKlaim'])->name('eklaim.klaim.getDataKlaim');
    Route::get('eklaim/klaim/{pengajuanKlaim}/statusKlaim', [KlaimController::class, 'getStatusKlaim'])->name('eklaim.klaim.getStatusKlaim');
});
