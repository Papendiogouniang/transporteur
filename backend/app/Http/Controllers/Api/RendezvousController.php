<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Models\Rendezvous;
use App\Models\Transporteur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RendezvousController extends Controller
{
    // ── GET /api/rendezvous ──────────────────
    public function index()
    {
        $user = auth()->user();

        $query = Rendezvous::with([
            'client:id,nom,prenom,telephone',
            'transporteur:id,nom_entreprise,user_id',
            'transporteur.user:id,nom,prenom,telephone',
            'commande:id,numero,statut,ville_depart,ville_destination',
        ])->orderBy('date_rdv');

        if ($user->role === 'client') {
            $query->where('client_id', $user->id);
        } elseif ($user->role === 'transporteur') {
            $transporteur = Transporteur::where('user_id', $user->id)->firstOrFail();
            $query->where('transporteur_id', $transporteur->id);
        }

        return response()->json(['rendezvous' => $query->get()]);
    }

    // ── POST /api/rendezvous ─────────────────
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'commande_id' => 'required|exists:commandes,id',
            'date_rdv'    => 'required|date|after:now',
            'lieu'        => 'required|string|max:255',
            'type'        => 'nullable|in:prise_en_charge,livraison,inspection',
            'notes'       => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $commande = Commande::findOrFail($request->commande_id);

        $rdv = Rendezvous::create([
            'commande_id'     => $commande->id,
            'client_id'       => $commande->client_id,
            'transporteur_id' => $commande->transporteur_id,
            'date_rdv'        => $request->date_rdv,
            'lieu'            => $request->lieu,
            'type'            => $request->type ?? 'prise_en_charge',
            'notes'           => $request->notes,
        ]);

        return response()->json(['message' => 'Rendez-vous créé.', 'rendezvous' => $rdv], 201);
    }

    // ── PUT /api/rendezvous/{id}/statut ──────
    public function updateStatut(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'statut' => 'required|in:confirme,effectue,annule',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $rdv = Rendezvous::findOrFail($id);
        $rdv->update(['statut' => $request->statut]);

        return response()->json(['message' => 'Statut mis à jour.', 'rendezvous' => $rdv->fresh()]);
    }
}
