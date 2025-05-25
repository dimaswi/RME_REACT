<?php

use App\Http\Controllers\Keuangan\PendapatanKasirController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('keuangan/pendapatan/kasir', [PendapatanKasirController::class, 'index'])->name('keuangan.pendapatan.kasir.index');
});
