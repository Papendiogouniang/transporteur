<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Avis;
use App\Models\Commande;
use App\Models\Transporteur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TransporteurController extends Controller
{
    // ── GET /api/transporteurs ───────────────
    public function index(Request $request)
    {
        $query = Transporteur::with('user:id,nom,prenom,email,telephone,adresse')
            ->where('disponible', true);

        if ($request->filled('type_transport')) {
            $query->where('type_transport', $request->type_transport);
        }

        if ($request->filled('ville')) {
            $query->whereJsonContains('zones_couvertes', $request->ville);
        }

        if ($request->filled('poids_min')) {
            $query->where('capacite_kg', '>=', (float) $request->poids_min);
        }

        if ($request->filled('prix_max')) {
            $query->where('prix_par_km', '<=', (float) $request->prix_max);
        }

        $transporteurs = $query
            ->orderBy('note_moyenne', 'desc')
            ->orderBy('verified', 'desc')
            ->paginate($request->get('limit', 12));

        return response()->json([
            'transporteurs' => $transporteurs->items(),
            'pagination' => [
                'total' => $transporteurs->total(),
                'page'  => $transporteurs->currentPage(),
                'limit' => $transporteurs->perPage(),
                'pages' => $transporteurs->lastPage(),
            ],
        ]);
    }

    // ── GET /api/transporteurs/{id} ──────────
    public function show($id)
    {
        $transporteur = Transporteur::with([
            'user:id,nom,prenom,email,telephone,adresse',
            'avis.client:id,nom,prenom',
        ])->findOrFail($id);

        return response()->json(['transporteur' => $transporteur]);
    }

    // ── PUT /api/transporteurs/{id} ──────────
    public function update(Request $request, $id)
    {
        $transporteur = Transporteur::findOrFail($id);
        $user = auth()->user();

        if ($transporteur->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'nom_entreprise'  => 'required|string|max:150',
            'type_transport'  => 'required|in:camion,camionnette,moto,voiture,bateau',
            'capacite_kg'     => 'nullable|numeric|min:0',
            'zones_couvertes' => 'nullable|array',
            'prix_par_km'     => 'nullable|numeric|min:0',
            'prix_fixe'       => 'nullable|numeric|min:0',
            'disponible'      => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $transporteur->update($request->only([
            'nom_entreprise', 'description', 'type_transport', 'capacite_kg',
            'zones_couvertes', 'prix_par_km', 'prix_fixe', 'disponible', 'photo',
        ]));

        return response()->json(['message' => 'Profil mis à jour.', 'transporteur' => $transporteur->fresh()]);
    }

    // ── GET /api/transporteurs/{id}/stats ────
    public function stats($id)
    {
        $transporteur = Transporteur::findOrFail($id);
        $user = auth()->user();

        if ($transporteur->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $stats = DB::table('commandes')
            ->where('transporteur_id', $id)
            ->selectRaw('
                COUNT(*) as total,
                SUM(CASE WHEN statut = "livre" THEN 1 ELSE 0 END) as livrees,
                SUM(CASE WHEN statut = "en_cours" THEN 1 ELSE 0 END) as en_cours,
                SUM(CASE WHEN statut = "en_attente" THEN 1 ELSE 0 END) as en_attente,
                SUM(CASE WHEN statut = "annule" THEN 1 ELSE 0 END) as annulees,
                COALESCE(SUM(CASE WHEN statut = "livre" THEN prix_final ELSE 0 END), 0) as revenus
            ')
            ->first();

        return response()->json(['stats' => $stats]);
    }

    // ── POST /api/transporteurs/{id}/avis ────
    public function ajouterAvis(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'commande_id' => 'required|exists:commandes,id',
            'note'        => 'required|integer|min:1|max:5',
            'commentaire' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $user = auth()->user();

        // Vérifier que la commande appartient au client et est livrée
        $commande = Commande::where('id', $request->commande_id)
            ->where('client_id', $user->id)
            ->where('transporteur_id', $id)
            ->where('statut', 'livre')
            ->firstOrFail();

        // Vérifier doublon
        if (Avis::where('commande_id', $commande->id)->exists()) {
            return response()->json(['message' => 'Vous avez déjà noté cette livraison.'], 409);
        }

        Avis::create([
            'commande_id'     => $commande->id,
            'client_id'       => $user->id,
            'transporteur_id' => $id,
            'note'            => $request->note,
            'commentaire'     => $request->commentaire,
        ]);

        $transporteur = Transporteur::findOrFail($id);
        $transporteur->recalculerNote();

        return response()->json([
            'message'      => 'Avis enregistré. Merci !',
            'note_moyenne' => $transporteur->fresh()->note_moyenne,
        ], 201);
    }
}
