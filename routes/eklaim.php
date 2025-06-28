<?php

use App\Http\Controllers\Eklaim\BridgeDataController;
use App\Http\Controllers\Eklaim\KlaimController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('eklaim/klaim', [KlaimController::class, 'index'])->name('eklaim.klaim.index');
    Route::get('eklaim/pengajuan', [KlaimController::class, 'listPengajuanKlaim'])->name('eklaim.klaim.indexPengajuanKlaim');
    Route::get('eklaim/klaim/{pasien}', [KlaimController::class, 'show'])->name('eklaim.klaim.show');
    Route::post('eklaim/klaim/pengajuan', [KlaimController::class, 'storePengajuanKlaim'])->name('eklaim.klaim.storePengajuanKlaim');
    Route::post('eklaim/klaim/{pengajuanKlaim}/grouper/one', [KlaimController::class, 'groupStageOneKlaim'])->name('eklaim.klaim.groupStageOneKlaim');
    Route::post('eklaim/klaim/{pengajuanKlaim}/grouper/two', [KlaimController::class, 'groupStageTwoKlaim'])->name('eklaim.klaim.groupStageTwoKlaim');
    Route::post('eklaim/klaim/{pengajuanKlaim}/grouper/final', [KlaimController::class, 'groupStageFinalKlaim'])->name('eklaim.klaim.groupStageFinalKlaim');
    Route::post('eklaim/klaim/{pengajuanKlaim}/grouper/test', [KlaimController::class, 'getAmbilDataTarifDiagnosa'])->name('eklaim.klaim.getAmbilDataTarifDiagnosa');
    Route::post('eklaim/klaim/{pengajuanKlaim}/kirim/sep', [KlaimController::class, 'kirimDataKlaimPerSep'])->name('eklaim.klaim.kirimDataKlaimPerSep');
    Route::post('eklaim/klaim/kirim/perHari', [KlaimController::class, 'kirimDataKolektifHari'])->name('eklaim.klaim.kirimDataKolektifHari');
    Route::get('eklaim/klaim/{dataKlaim}/isi', [KlaimController::class, 'dataKlaim'])->name('eklaim.klaim.dataKlaim');
    Route::post('eklaim/klaim/{pengajuanKlaim}/ajukan_ulang', [KlaimController::class, 'ajukanUlangKlaim'])->name('eklaim.klaim.pengajuanUlang');
    Route::post('eklaim/klaim/{pengajuanKlaim}/hapus', [KlaimController::class, 'hapusDataKlaim'])->name('eklaim.klaim.hapusDataKlaim');
    Route::post('eklaim/klaim/{pengajuanKlaim}/edit', [KlaimController::class, 'editUlangKlaim'])->name('eklaim.klaim.editUlangKlaim');
    Route::get('eklaim/klaim/{pengajuanKlaim}/detailKlaim', [KlaimController::class, 'getDataKlaim'])->name('eklaim.klaim.getDataKlaim');
    Route::get('eklaim/klaim/{pengajuanKlaim}/statusKlaim', [KlaimController::class, 'getStatusKlaim'])->name('eklaim.klaim.getStatusKlaim');
    Route::post('eklaim/klaim/update-klaim/{pengajuanKlaim}', [KlaimController::class, 'updateDataKlaim'])->name('eklaim.updateDataKlaim');
    Route::get('/api/pasien/search', [KlaimController::class, 'searchRekamMedis']);
    Route::get('/api/kunjungan/sep/search/{nomorKartu}', [KlaimController::class, 'searchDataSEP']);
    Route::get('eklaim/klaim/grouper/one/{pengajuanKlaim}', [KlaimController::class, 'loadDataGroupOne'])->name('eklaim.klaim.loadDataGroupOne');
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
    Route::get('previewPengkajianAwal/{pendaftaran}', [BridgeDataController::class, 'previewPengkajianAwal'])->name('previewPengkajianAwal');
    Route::get('previewTriage/{pendaftaran}', [BridgeDataController::class, 'previewTriage'])->name('previewTriage');
    Route::get('previewCPPT/{pendaftaran}', [BridgeDataController::class, 'previewCPPT'])->name('previewCPPT');
    Route::get('previewTagihan/{nomor_pendaftaran}', [BridgeDataController::class, 'previewTagihan'])->name('previewTagihan');
    Route::get('previewBerkasKlaim/{pendaftaran}', [BridgeDataController::class, 'previewBerkasKlaim'])->name('previewBerkasKlaim');
    Route::get('previewLaboratorium/{pengajuanKlaim}', [BridgeDataController::class, 'previewLaboratorium'])->name('previewLaboratorium');
    Route::get('previewRadiologi/{pengajuanKlaim}', [BridgeDataController::class, 'previewRadiologi'])->name('previewRadiologi');
    Route::get('previewResumeMedisEdit/{pendaftaran}', [BridgeDataController::class, 'previewResumeMedisEdit'])->name('previewResumeMedisEdit');
    Route::get('previewPengkajianAwalEdit/{pendaftaran}', [BridgeDataController::class, 'previewPengkajianAwalEdit'])->name('previewPengkajianAwalEdit');
    Route::get('previewTriageEdit/{pendaftaran}', [BridgeDataController::class, 'previewTriageEdit'])->name('previewTriageEdit');
    Route::get('previewCPPTEdit/{pendaftaran}', [BridgeDataController::class, 'previewCPPTEdit'])->name('previewCPPTEdit');
    Route::get('eklaim/get/pengajuan-klaim/{pengajuanKlaim}', [KlaimController::class, 'loadDataKlaim'])->name('eklaim.loadDataKlaim');
});

Route::middleware('auth')->group(function () {
    Route::get('eklaim/klaim/edit-data/{pengajuanKlaim}/resume-medis', [\App\Http\Controllers\Eklaim\EditDataController::class, 'EditResumeMedis'])->name('eklaim.editData.resumeMedis');
    Route::post('eklaim/klaim/edit-data/resume-medis', [\App\Http\Controllers\Eklaim\EditDataController::class, 'StoreEditResumeMedis'])->name('eklaim.editData.storeResumeMedis');
    Route::get('eklaim/klaim/edit-data/{pengajuanKlaim}/tagihan', [\App\Http\Controllers\Eklaim\EditDataController::class, 'EditTagihan'])->name('eklaim.editData.tagihan');
    Route::post('eklaim/klaim/edit-data/store/tagihan', [\App\Http\Controllers\Eklaim\EditDataController::class, 'StoreEditTagihan'])->name('eklaim.editData.storeTagihan');
    Route::get('eklaim/klaim/edit-data/{pengajuanKlaim}/laboratorium', [\App\Http\Controllers\Eklaim\EditDataController::class, 'EditLaboratorium'])->name('eklaim.editData.laboratorium');
    Route::post('eklaim/klaim/edit-data/laboratorium', [\App\Http\Controllers\Eklaim\EditDataController::class, 'StoreEditLaboratorium'])->name('eklaim.editData.storeLaboratorium');
    Route::get('eklaim/klaim/edit-data/{pengajuanKlaim}/radiologi', [\App\Http\Controllers\Eklaim\EditDataController::class, 'EditRadiologi'])->name('eklaim.editData.radiologi');
    Route::post('eklaim/klaim/edit-data/radiologi', [\App\Http\Controllers\Eklaim\EditDataController::class, 'StoreEditRadiologi'])->name('eklaim.editData.storeRadiologi');
    Route::get('load/{nomorKunjungan}', [\App\Http\Controllers\Eklaim\EditDataController::class, 'loadDataPengkajianAwalRIRD'])->name('eklaim.loadDataPengkajianAwalRIRD');
    Route::get('/eklaim/switch-edit/{pengajuanKlaim}', [\App\Http\Controllers\Eklaim\EditDataController::class, 'switchEditResumeMedis'])->name('eklaim.klaim.switchEdit');
    Route::get('eklaim/get/pengkajian-awal/{nomorKunjungan}', [\App\Http\Controllers\Eklaim\EditDataController::class, 'getDataPengkajianAwal'])->name('eklaim.getDataPengkajianAwal');
    Route::get('eklaim/get/triage/{nomorKunjungan}', [\App\Http\Controllers\Eklaim\EditDataController::class, 'getDataTriage'])->name('eklaim.getDataTriage');
    Route::get('eklaim/get/cppt/{nomorKunjungan}', [\App\Http\Controllers\Eklaim\EditDataController::class, 'getDataCPPT'])->name('eklaim.getDataCPPT');
    Route::get('eklaim/get/pengkajian-awal-edit/{nomorKunjungan}', [\App\Http\Controllers\Eklaim\EditDataController::class, 'getDataPengkajianAwalEdit'])->name('eklaim.getDataPengkajianAwalEdit');
    Route::get('eklaim/get/triage-edit/{nomorKunjungan}', [\App\Http\Controllers\Eklaim\EditDataController::class, 'getDataTriageEdit'])->name('eklaim.getDataTriageEdit');
    Route::get('eklaim/get/cppt-edit/{nomorKunjungan}', [\App\Http\Controllers\Eklaim\EditDataController::class, 'getDataCPPTEdit'])->name('eklaim.getDataCPPTEdit');
    Route::get('getNamaObat', [\App\Http\Controllers\Eklaim\EditDataController::class, 'getNamaObat'])->name('getNamaObat');
    Route::get('eklaim/syncTagihan/{pengajuanKlaim}', [\App\Http\Controllers\Eklaim\EditDataController::class, 'syncTagihan'])->name('eklaim.syncTagihan');
    Route::get('eklaim/deleteRincianTagihan/{rincianTagihan}', [\App\Http\Controllers\Eklaim\EditDataController::class, 'deleteRincianTagihan'])->name('eklaim.deleteRincianTagihan');
    Route::get('getDataLaboratorium/{nomorKunjungan}/{jenisData}', [\App\Http\Controllers\Eklaim\EditDataController::class, 'getDataLaboratorium'])->name('getDataLaboratorium');
    Route::get('getDataRadiologi/{nomorKunjungan}/{jenisData}', [\App\Http\Controllers\Eklaim\EditDataController::class, 'getDataRadiologi'])->name('getDataRadiologi');
});

//filter table
Route::middleware('auth')->group(function () {
    Route::post('eklaim/klaim/filter', [KlaimController::class, 'indexFilter'])->name('eklaim.klaim.indexFilter');
    Route::post('eklaim/klaim/list-pengajuan/filter', [KlaimController::class, 'listPengajuanIndexFilter'])->name('eklaim.klaim.listPengajuanIndexFilter');
});
