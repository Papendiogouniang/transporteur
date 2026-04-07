<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // CORS global
        $middleware->prepend(\Illuminate\Http\Middleware\HandleCors::class);

        // Alias JWT
        $middleware->alias([
            'jwt' => \App\Http\Middleware\JwtMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // JSON par défaut pour les erreurs API
        $exceptions->render(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, $request) {
            return response()->json(['message' => 'Ressource introuvable.'], 404);
        });
        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, $request) {
            return response()->json(['message' => $e->validator->errors()->first()], 422);
        });
    })
    ->create();
