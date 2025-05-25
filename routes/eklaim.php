<?php

use App\Http\Controllers\Eklaim\KlaimController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('eklaim/klaim', [KlaimController::class, 'index'])->name('eklaim.klaim.index');
    Route::get('eklaim/klaim/{pasien}', [KlaimController::class, 'show'])->name('eklaim.klaim.show');
});
