<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'telephone',
        'role',
        'adresse',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // ── JWT ──────────────────────────────────
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'role' => $this->role,
        ];
    }

    // ── Relations ────────────────────────────
    public function transporteur()
    {
        return $this->hasOne(Transporteur::class);
    }

    public function commandes()
    {
        return $this->hasMany(Commande::class, 'client_id');
    }

    public function rendezvous()
    {
        return $this->hasMany(Rendezvous::class, 'client_id');
    }

    // ── Scopes ────────────────────────────────
    public function scopeClients($query)
    {
        return $query->where('role', 'client');
    }

    public function scopeTransporteurs($query)
    {
        return $query->where('role', 'transporteur');
    }
}
