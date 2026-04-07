<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transporteur extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nom_entreprise',
        'description',
        'type_transport',
        'capacite_kg',
        'zones_couvertes',
        'prix_par_km',
        'prix_fixe',
        'note_moyenne',
        'nombre_avis',
        'disponible',
        'verified',
        'photo',
        'numero_licence',
    ];

    protected $casts = [
        'zones_couvertes' => 'array',
        'disponible'      => 'boolean',
        'verified'        => 'boolean',
        'capacite_kg'     => 'float',
        'prix_par_km'     => 'float',
        'prix_fixe'       => 'float',
        'note_moyenne'    => 'float',
    ];

    // ── Relations ────────────────────────────
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function commandes()
    {
        return $this->hasMany(Commande::class);
    }

    public function avis()
    {
        return $this->hasMany(Avis::class);
    }

    public function rendezvous()
    {
        return $this->hasMany(Rendezvous::class);
    }

    // ── Méthodes ─────────────────────────────
    public function recalculerNote()
    {
        $avg = $this->avis()->avg('note');
        $count = $this->avis()->count();
        $this->update([
            'note_moyenne' => round($avg ?? 0, 1),
            'nombre_avis'  => $count,
        ]);
    }

    // ── Scopes ────────────────────────────────
    public function scopeDisponible($query)
    {
        return $query->where('disponible', true);
    }

    public function scopeByVille($query, $ville)
    {
        return $query->whereJsonContains('zones_couvertes', $ville);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type_transport', $type);
    }
}
