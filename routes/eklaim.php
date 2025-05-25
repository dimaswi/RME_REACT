<?php

use App\Http\Controllers\Eklaim\KlaimController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('eklaim/klaim', [KlaimController::class, 'index'])->name('eklaim.klaim.index');
    Route::get('eklaim/klaim/{pasien}', [KlaimController::class, 'show'])->name('eklaim.klaim.show');
    Route::post('eklaim/klaim/pengajuan', [KlaimController::class, 'storePengajuanKlaim'])->name('eklaim.klaim.storePengajuanKlaim');
    Route::get('eklaim/klaim/{dataKlaim}/isi', [KlaimController::class, 'dataKlaim'])->name('eklaim.klaim.dataKlaim');
});
