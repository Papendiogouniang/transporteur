<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero',
        'client_id',
        'transporteur_id',
        'description',
        'poids_kg',
        'volume_m3',
        'adresse_depart',
        'ville_depart',
        'adresse_destination',
        'ville_destination',
        'distance_km',
        'prix_propose',
        'prix_final',
        'statut',
        'date_souhaitee',
        'date_prise_en_charge',
        'date_livraison',
        'notes_client',
        'notes_transporteur',
    ];

    protected $casts = [
        'poids_kg'             => 'float',
        'volume_m3'            => 'float',
        'distance_km'          => 'float',
        'prix_propose'         => 'float',
        'prix_final'           => 'float',
        'date_souhaitee'       => 'date',
        'date_prise_en_charge' => 'datetime',
        'date_livraison'       => 'datetime',
    ];

    const STATUTS = [
        'en_attente',
        'accepte',
        'en_cours',
        'livre',
        'annule',
        'refuse',
    ];

    const STATUT_DESCRIPTIONS = [
        'accepte'  => 'Commande acceptée par le transporteur.',
        'en_cours' => 'Prise en charge effectuée. Livraison en cours.',
        'livre'    => '✅ Livraison effectuée avec succès !',
        'annule'   => 'Commande annulée.',
        'refuse'   => 'Commande refusée par le transporteur.',
    ];

    // ── Boot ─────────────────────────────────
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($commande) {
            if (empty($commande->numero)) {
                $commande->numero = 'GP' . now()->year . rand(10000, 99999);
            }
        });
    }

    // ── Relations ────────────────────────────
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function transporteur()
    {
        return $this->belongsTo(Transporteur::class);
    }

    public function suivi()
    {
        return $this->hasMany(SuiviLivraison::class)->orderBy('created_at');
    }

    public function rendezvous()
    {
        return $this->hasMany(Rendezvous::class)->orderBy('date_rdv');
    }

    public function avis()
    {
        return $this->hasOne(Avis::class);
    }
}
