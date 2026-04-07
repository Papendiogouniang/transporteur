<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Avis extends Model
{
    protected $fillable = [
        'commande_id',
        'client_id',
        'transporteur_id',
        'note',
        'commentaire',
    ];

    protected $casts = ['note' => 'integer'];

    public function commande()    { return $this->belongsTo(Commande::class); }
    public function client()      { return $this->belongsTo(User::class, 'client_id'); }
    public function transporteur(){ return $this->belongsTo(Transporteur::class); }
}
