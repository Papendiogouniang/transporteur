<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Models\Rendezvous;
use App\Models\SuiviLivraison;
use App\Models\Transporteur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CommandeController extends Controller
{
    // ── GET /api/commandes ───────────────────
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Commande::with([
            'client:id,nom,prenom,email,telephone',
            'transporteur:id,nom_entreprise,type_transport,note_moyenne,user_id',
            'transporteur.user:id,nom,prenom,telephone',
        ]);

        if ($user->role === 'client') {
            $query->where('client_id', $user->id);
        } elseif ($user->role === 'transporteur') {
            $transporteur = Transporteur::where('user_id', $user->id)->firstOrFail();
            $query->where('transporteur_id', $transporteur->id);
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        $commandes = $query->orderByDesc('created_at')->paginate($request->get('limit', 10));

        return response()->json([
            'commandes' => $commandes->items(),
            'total'     => $commandes->total(),
        ]);
    }

    // ── GET /api/commandes/numero/{numero} ───
    public function showByNumero($numero)
    {
        $commande = Commande::with([
            'client:id,nom,prenom',
            'transporteur:id,nom_entreprise,type_transport,user_id',
            'transporteur.user:id,nom,prenom,telephone',
            'suivi',
        ])->where('numero', strtoupper($numero))->firstOrFail();

        return response()->json(['commande' => $commande]);
    }

    // ── GET /api/commandes/{id} ──────────────
    public function show($id)
    {
        $user = auth()->user();

        $commande = Commande::with([
            'client:id,nom,prenom,email,telephone',
            'transporteur:id,nom_entreprise,type_transport,note_moyenne,user_id',
            'transporteur.user:id,nom,prenom,telephone,email',
            'suivi',
            'rendezvous',
        ])->findOrFail($id);

        if ($user->role === 'client' && $commande->client_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        return response()->json(['commande' => $commande]);
    }

    // ── POST /api/commandes ──────────────────
    public function store(Request $request)
    {
        $user = auth()->user();

        if ($user->role !== 'client') {
            return response()->json(['message' => 'Seuls les clients peuvent créer des commandes.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'transporteur_id'     => 'required|exists:transporteurs,id',
            'description'         => 'required|string|max:500',
            'adresse_depart'      => 'required|string|max:255',
            'adresse_destination' => 'required|string|max:255',
            'prix_propose'        => 'required|numeric|min:0',
            'poids_kg'            => 'nullable|numeric|min:0',
            'volume_m3'           => 'nullable|numeric|min:0',
            'ville_depart'        => 'nullable|string|max:100',
            'ville_destination'   => 'nullable|string|max:100',
            'distance_km'         => 'nullable|numeric|min:0',
            'date_souhaitee'      => 'nullable|date',
            'notes_client'        => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $transporteur = Transporteur::where('id', $request->transporteur_id)->where('disponible', true)->firstOrFail();

        $commande = Commande::create([
            'client_id'           => $user->id,
            'transporteur_id'     => $request->transporteur_id,
            'description'         => $request->description,
            'poids_kg'            => $request->poids_kg,
            'volume_m3'           => $request->volume_m3,
            'adresse_depart'      => $request->adresse_depart,
            'ville_depart'        => $request->ville_depart ?? '',
            'adresse_destination' => $request->adresse_destination,
            'ville_destination'   => $request->ville_destination ?? '',
            'distance_km'         => $request->distance_km,
            'prix_propose'        => $request->prix_propose,
            'date_souhaitee'      => $request->date_souhaitee,
            'notes_client'        => $request->notes_client,
        ]);

        // Première entrée de suivi
        SuiviLivraison::create([
            'commande_id' => $commande->id,
            'statut'      => 'en_attente',
            'description' => 'Commande créée. En attente de confirmation du transporteur.',
        ]);

        return response()->json([
            'message'  => 'Commande créée avec succès.',
            'commande' => $commande->load(['client', 'transporteur.user']),
        ], 201);
    }

    // ── PUT /api/commandes/{id}/statut ───────
    public function updateStatut(Request $request, $id)
    {
        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'statut'             => 'required|in:accepte,en_cours,livre,annule,refuse',
            'notes_transporteur' => 'nullable|string|max:500',
            'localisation'       => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $commande = Commande::findOrFail($id);
        $statut   = $request->statut;

        // Permissions
        if ($user->role === 'client') {
            if ($commande->client_id !== $user->id || $statut !== 'annule') {
                return response()->json(['message' => 'Action non autorisée.'], 403);
            }
        } elseif ($user->role === 'transporteur') {
            $transporteur = Transporteur::where('user_id', $user->id)->firstOrFail();
            if ($commande->transporteur_id !== $transporteur->id) {
                return response()->json(['message' => 'Accès refusé.'], 403);
            }
        }

        $update = ['statut' => $statut];

        if ($request->filled('notes_transporteur')) {
            $update['notes_transporteur'] = $request->notes_transporteur;
        }
        if ($statut === 'en_cours') {
            $update['date_prise_en_charge'] = now();
        }
        if ($statut === 'livre') {
            $update['date_livraison'] = now();
            $update['prix_final']     = $commande->prix_propose;
        }

        $commande->update($update);

        SuiviLivraison::create([
            'commande_id' => $commande->id,
            'statut'      => $statut,
            'localisation'=> $request->localisation,
            'description' => Commande::STATUT_DESCRIPTIONS[$statut] ?? 'Mise à jour du statut.',
        ]);

        return response()->json(['message' => 'Statut mis à jour.', 'commande' => $commande->fresh()]);
    }
}
