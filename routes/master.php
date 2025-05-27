<?php

use App\Http\Controllers\Inacbg\InacbgController;
use App\Http\Controllers\Master\BedController;
use App\Http\Controllers\Master\PasienController;
use App\Http\Controllers\Master\PPKController;
use App\Http\Controllers\Master\UserController;
use Illuminate\Support\Facades\Http;
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

Route::middleware('auth')->group(function () {
    Route::get('/proxy/diagnosa', function (Illuminate\Http\Request $request) {
        $inacbg_controller = new InacbgController();
        // contoh encryption key, bukan aktual
        $key = "dc59cb4f4191462adf394017db95ebc6bdd9c85146827c3e2df1f0706d7d145d";
        // json query
        $json_request = [
            "metadata" => [
                "method" => "search_diagnosis"
            ],
            "data" => [
                "keyword" => $request->keyword,
            ]
        ];
        // membuat json juga dapat menggunakan json_encode:
        $ws_query["metadata"]["method"] = "search_diagnosis";
        $ws_query["data"]["keyword"] = $request->keyword;
        $json_request = json_encode($ws_query);
        $json_request = json_encode($ws_query);
        $payload = $inacbg_controller->inacbg_encrypt(json_decode($json_request), $key);
        $header = array("Content-Type: application/x-www-form-urlencoded");
        $url = "http://kdm.klinikmuhammadiyahkedungadem.id/E-klaim/ws.php";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        // request dengan curl
        $response = curl_exec($ch);
        // terlebih dahulu hilangkan "----BEGIN ENCRYPTED DATA----\r\n"
        // dan hilangkan "----END ENCRYPTED DATA----\r\n" dari response
        $first = strpos($response, "\n") + 1;
        $last = strrpos($response, "\n") - 1;
        $response = substr(
            $response,
            $first,
            strlen($response) - $first - $last
        );
        // decrypt dengan fungsi inacbg_decrypt
        $response = $inacbg_controller->inacbg_decrypt($response, $key);
        // hasil decrypt adalah format json, ditranslate kedalam array
        $msg = json_decode($response, true);

        return response()->json($msg);
    });

    Route::get('/proxy/procedure', function (Illuminate\Http\Request $request) {
        $inacbg_controller = new InacbgController();
        // contoh encryption key, bukan aktual
        $key = "dc59cb4f4191462adf394017db95ebc6bdd9c85146827c3e2df1f0706d7d145d";
        // json query
        $json_request = [
            "metadata" => [
                "method" => "search_procedures"
            ],
            "data" => [
                "keyword" => $request->keyword,
            ]
        ];
        // membuat json juga dapat menggunakan json_encode:
        $ws_query["metadata"]["method"] = "search_procedures";
        $ws_query["data"]["keyword"] = $request->keyword;
        $json_request = json_encode($ws_query);
        $json_request = json_encode($ws_query);
        $payload = $inacbg_controller->inacbg_encrypt(json_decode($json_request), $key);
        $header = array("Content-Type: application/x-www-form-urlencoded");
        $url = "http://kdm.klinikmuhammadiyahkedungadem.id/E-klaim/ws.php";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        // request dengan curl
        $response = curl_exec($ch);
        // terlebih dahulu hilangkan "----BEGIN ENCRYPTED DATA----\r\n"
        // dan hilangkan "----END ENCRYPTED DATA----\r\n" dari response
        $first = strpos($response, "\n") + 1;
        $last = strrpos($response, "\n") - 1;
        $response = substr(
            $response,
            $first,
            strlen($response) - $first - $last
        );
        // decrypt dengan fungsi inacbg_decrypt
        $response = $inacbg_controller->inacbg_decrypt($response, $key);
        // hasil decrypt adalah format json, ditranslate kedalam array
        $msg = json_decode($response, true);

        return response()->json($msg);
    });
});
