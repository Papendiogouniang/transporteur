<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transporteur;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    // ── POST /api/auth/register ──────────────
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom'      => 'required|string|max:100',
            'prenom'   => 'required|string|max:100',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role'     => 'nullable|in:client,transporteur',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $role = $request->role === 'transporteur' ? 'transporteur' : 'client';

        $user = User::create([
            'nom'       => $request->nom,
            'prenom'    => $request->prenom,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'telephone' => $request->telephone,
            'role'      => $role,
            'adresse'   => $request->adresse,
        ]);

        $transporteurProfile = null;

        if ($role === 'transporteur' && $request->has('transporteurData')) {
            $td = $request->transporteurData;
            $transporteurProfile = Transporteur::create([
                'user_id'        => $user->id,
                'nom_entreprise' => $td['nomEntreprise'] ?? "{$user->prenom} {$user->nom} Transport",
                'description'    => $td['description'] ?? '',
                'type_transport' => $td['typeTransport'] ?? 'camionnette',
                'capacite_kg'    => $td['capaciteKg'] ?? 500,
                'zones_couvertes'=> $td['zonesCouvertes'] ?? ['Dakar'],
                'prix_par_km'    => $td['prixParKm'] ?? 150,
                'prix_fixe'      => $td['prixFixe'] ?? 2000,
            ]);
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message'             => 'Compte créé avec succès.',
            'token'               => $token,
            'user'                => $user,
            'transporteurProfile' => $transporteurProfile,
        ], 201);
    }

    // ── POST /api/auth/login ─────────────────
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $credentials = $request->only('email', 'password');

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['message' => 'Email ou mot de passe incorrect.'], 401);
        }

        $user = auth()->user();
        $transporteurProfile = null;

        if ($user->role === 'transporteur') {
            $transporteurProfile = Transporteur::where('user_id', $user->id)->first();
        }

        return response()->json([
            'message'             => 'Connexion réussie.',
            'token'               => $token,
            'user'                => $user,
            'transporteurProfile' => $transporteurProfile,
        ]);
    }

    // ── GET /api/auth/me ─────────────────────
    public function me()
    {
        $user = auth()->user();
        $transporteurProfile = null;

        if ($user->role === 'transporteur') {
            $transporteurProfile = Transporteur::where('user_id', $user->id)->first();
        }

        return response()->json(['user' => $user, 'transporteurProfile' => $transporteurProfile]);
    }

    // ── PUT /api/auth/profile ────────────────
    public function updateProfile(Request $request)
    {
        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'nom'       => 'required|string|max:100',
            'prenom'    => 'required|string|max:100',
            'telephone' => 'nullable|string|max:20',
            'adresse'   => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $user->update($request->only('nom', 'prenom', 'telephone', 'adresse'));

        return response()->json(['message' => 'Profil mis à jour.', 'user' => $user->fresh()]);
    }

    // ── PUT /api/auth/password ───────────────
    public function updatePassword(Request $request)
    {
        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'ancien_password'  => 'required|string',
            'nouveau_password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        if (!Hash::check($request->ancien_password, $user->password)) {
            return response()->json(['message' => 'Ancien mot de passe incorrect.'], 401);
        }

        $user->update(['password' => Hash::make($request->nouveau_password)]);

        return response()->json(['message' => 'Mot de passe modifié avec succès.']);
    }

    // ── POST /api/auth/logout ────────────────
    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());
        return response()->json(['message' => 'Déconnexion réussie.']);
    }
}
