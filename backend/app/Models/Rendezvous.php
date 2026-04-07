<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rendezvous extends Model
{
    use HasFactory;

    protected $table = 'rendezvous';

    protected $fillable = [
        'commande_id',
        'client_id',
        'transporteur_id',
        'date_rdv',
        'lieu',
        'type',
        'statut',
        'notes',
    ];

    protected $casts = [
        'date_rdv' => 'datetime',
    ];

    public function commande()    { return $this->belongsTo(Commande::class); }
    public function client()      { return $this->belongsTo(User::class, 'client_id'); }
    public function transporteur(){ return $this->belongsTo(Transporteur::class); }
}
