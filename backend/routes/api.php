<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommandeController;
use App\Http\Controllers\Api\RendezvousController;
use App\Http\Controllers\Api\TransporteurController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| GP Transporteurs — Routes API
|--------------------------------------------------------------------------
*/

// ── Health check ──────────────────────────────
Route::get('/health', fn() => response()->json([
    'status'  => 'ok',
    'message' => 'GP Transporteurs API — Laravel',
    'version' => '1.0.0',
    'time'    => now()->toISOString(),
]));

// ── Authentification (public) ─────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// ── Transporteurs (public) ────────────────────
Route::get('/transporteurs',             [TransporteurController::class, 'index']);
Route::get('/transporteurs/{id}',        [TransporteurController::class, 'show']);

// ── Suivi public par numéro ───────────────────
Route::get('/commandes/numero/{numero}', [CommandeController::class, 'showByNumero']);

// ── Routes protégées (JWT requis) ─────────────
Route::middleware('jwt')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::get('/me',           [AuthController::class, 'me']);
        Route::put('/profile',      [AuthController::class, 'updateProfile']);
        Route::put('/password',     [AuthController::class, 'updatePassword']);
        Route::post('/logout',      [AuthController::class, 'logout']);
    });

    // Transporteurs (authentifié)
    Route::middleware('jwt:transporteur,admin')->group(function () {
        Route::put('/transporteurs/{id}',       [TransporteurController::class, 'update']);
        Route::get('/transporteurs/{id}/stats', [TransporteurController::class, 'stats']);
    });

    // Avis transporteur (client uniquement)
    Route::middleware('jwt:client')->group(function () {
        Route::post('/transporteurs/{id}/avis', [TransporteurController::class, 'ajouterAvis']);
    });

    // Commandes
    Route::prefix('commandes')->group(function () {
        Route::get('/',        [CommandeController::class, 'index']);
        Route::post('/',       [CommandeController::class, 'store'])->middleware('jwt:client');
        Route::get('/{id}',    [CommandeController::class, 'show']);
        Route::put('/{id}/statut', [CommandeController::class, 'updateStatut']);
    });

    // Rendez-vous
    Route::prefix('rendezvous')->group(function () {
        Route::get('/',               [RendezvousController::class, 'index']);
        Route::post('/',              [RendezvousController::class, 'store']);
        Route::put('/{id}/statut',    [RendezvousController::class, 'updateStatut']);
    });
});
