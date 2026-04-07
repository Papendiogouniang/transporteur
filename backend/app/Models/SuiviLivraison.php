<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SuiviLivraison extends Model
{
    protected $table = 'suivi_livraisons';

    protected $fillable = [
        'commande_id',
        'statut',
        'localisation',
        'description',
    ];

    public function commande()
    {
        return $this->belongsTo(Commande::class);
    }
}
