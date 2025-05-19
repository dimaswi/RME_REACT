<?php

use App\Http\Controllers\Master\BedController;
use App\Http\Controllers\Master\PasienController;
use App\Http\Controllers\Master\PPKController;
use App\Http\Controllers\Master\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::get('master/users', [UserController::class, 'index'])->name('master.users.index');
    Route::post('master/user', [UserController::class, 'store'])->name('master.user.store');
    Route::delete('master/users/{user}', [UserController::class, 'destroy'])->name('master.user.destroy');
    Route::put('/master/users/{user}', [UserController::class, 'update'])->name('master.user.update');
});

Route::middleware('auth')->group(function () {
    Route::get('master/pasiens', [PasienController::class, 'index'])->name('master.pasiens.index');
    Route::get('master/pasiens/create', [PasienController::class, 'create'])->name('master.pasien.create');
    Route::get('master/pasiens/{pasien}', [PasienController::class, 'detail'])->name('master.pasiens.detail');
    Route::post('master/pasiens', [PasienController::class, 'store'])->name('master.pasien.store');
    Route::get('master/pasiens/{pasien}/edit', [PasienController::class, 'edit'])->name('master.pasien.edit');
    Route::put('master/pasiens/{pasien}', [PasienController::class, 'update'])->name('master.pasien.update');
    Route::get('/master/wilayah/ajax', [PasienController::class, 'wilayahAjax'])->name('master.wilayah.ajax');
    Route::get('/master/dokter/ajax', [PasienController::class, 'getDokterByRuangan'])->name('master.dokter.ajax');
});

Route::middleware('auth')->group(function () {
    Route::get('/master/bed-list', [BedController::class, 'DataKamarTidur'])->name('master.bed.list');
});

Route::middleware('auth')->group(function () {
    Route::get('/master/ppk-list', [PPKController::class, 'DataPPK'])->name('master.ppk.list');
});
