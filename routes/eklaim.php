<?php

use App\Http\Controllers\Eklaim\BridgeDataController;
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

Route::middleware('auth')->group(function () {
    Route::get('loadDataResumeMedis/{pendaftaran}', [BridgeDataController::class, 'loadDataResumeMedis'])->name('loadDataResumeMedis');
    Route::get('loadDataTagihan/{pendaftaran}', [BridgeDataController::class, 'loadDataTagihan'])->name('loadDataTagihan');
    Route::get('downloadSEP/{pendaftaran}', [BridgeDataController::class, 'downloadSEP'])->name('downloadSEP');
    Route::get('downloadResumeMedis/{pendaftaran}', [BridgeDataController::class, 'downloadResumeMedis'])->name('downloadResumeMedis');
    Route::get('downloadTagihan/{pendaftaran}', [BridgeDataController::class, 'downloadTagihan'])->name('downloadTagihan');
    Route::get('downloadBerkasKlaim/{pengajuanKlaim}', [BridgeDataController::class, 'downloadBerkasKlaim'])->name('downloadBerkasKlaim');
    Route::get('downloadLaboratorium/{pendaftaran}', [BridgeDataController::class, 'downloadLaboratorium'])->name('downloadLaboratorium');
    Route::get('downloadRadiologi/{pendaftaran}', [BridgeDataController::class, 'downloadRadiologi'])->name('downloadRadiologi');
    Route::get('previewSEP/{pendaftaran}', [BridgeDataController::class, 'previewSEP'])->name('previewSEP');
    Route::get('previewResumeMedis/{pendaftaran}', [BridgeDataController::class, 'previewResumeMedis'])->name('previewResumeMedis');
    Route::get('previewTagihan/{pendaftaran}', [BridgeDataController::class, 'previewTagihan'])->name('previewTagihan');
    Route::get('previewBerkasKlaim/{pendaftaran}', [BridgeDataController::class, 'previewBerkasKlaim'])->name('previewBerkasKlaim');
    Route::get('previewLaboratorium/{pendaftaran}', [BridgeDataController::class, 'previewLaboratorium'])->name('previewLaboratorium');
    Route::get('previewRadiologi/{pendaftaran}', [BridgeDataController::class, 'previewRadiologi'])->name('previewRadiologi');

});
