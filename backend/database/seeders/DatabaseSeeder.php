<?php

namespace Database\Seeders;

use App\Models\Commande;
use App\Models\SuiviLivraison;
use App\Models\Transporteur;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin ────────────────────────────────
        User::create([
            'nom' => 'Admin', 'prenom' => 'GP',
            'email' => 'admin@gp-transport.sn',
            'password' => Hash::make('password123'),
            'telephone' => '+221 77 000 00 00',
            'role' => 'admin', 'adresse' => 'Plateau, Dakar',
        ]);

        // ── Clients ──────────────────────────────
        $client1 = User::create([
            'nom' => 'Niang', 'prenom' => 'Pape Ndiogou',
            'email' => 'pape.niang@gmail.com',
            'password' => Hash::make('password123'),
            'telephone' => '+221 77 111 22 33',
            'role' => 'client', 'adresse' => 'HLM Grand Yoff, Dakar',
        ]);

        $client2 = User::create([
            'nom' => 'Sarr', 'prenom' => 'Abdou',
            'email' => 'abdou.sarr@gmail.com',
            'password' => Hash::make('password123'),
            'telephone' => '+221 76 222 33 44',
            'role' => 'client', 'adresse' => 'Plateau, Dakar',
        ]);

        // ── Transporteurs (users) ─────────────────
        $tu1 = User::create([
            'nom' => 'Sall', 'prenom' => 'Ibrahima',
            'email' => 'ibrahima.sall@transport.sn',
            'password' => Hash::make('password123'),
            'telephone' => '+221 77 333 44 55',
            'role' => 'transporteur', 'adresse' => 'Thiaroye, Dakar',
        ]);
        $tu2 = User::create([
            'nom' => 'Gaye', 'prenom' => 'Omar',
            'email' => 'omar.gaye@gpmove.sn',
            'password' => Hash::make('password123'),
            'telephone' => '+221 76 444 55 66',
            'role' => 'transporteur', 'adresse' => 'Thiès',
        ]);
        $tu3 = User::create([
            'nom' => 'Ba', 'prenom' => 'Aminata',
            'email' => 'aminata.ba@express.sn',
            'password' => Hash::make('password123'),
            'telephone' => '+221 70 555 66 77',
            'role' => 'transporteur', 'adresse' => 'Saint-Louis',
        ]);
        $tu4 = User::create([
            'nom' => 'Fall', 'prenom' => 'Cheikh',
            'email' => 'cheikh.fall@moto.sn',
            'password' => Hash::make('password123'),
            'telephone' => '+221 78 666 77 88',
            'role' => 'transporteur', 'adresse' => 'Médina, Dakar',
        ]);

        // ── Profils transporteurs ─────────────────
        $t1 = Transporteur::create([
            'user_id' => $tu1->id,
            'nom_entreprise' => 'Sall Express Transport',
            'description' => 'Spécialiste du transport de marchandises entre Dakar et les régions. Camion frigorifique disponible. Livraison sécurisée et assurée.',
            'type_transport' => 'camion',
            'capacite_kg' => 5000,
            'zones_couvertes' => ['Dakar', 'Thiès', 'Mbour', 'Kaolack', 'Ziguinchor'],
            'prix_par_km' => 250,
            'prix_fixe' => 5000,
            'note_moyenne' => 4.5,
            'nombre_avis' => 28,
            'verified' => true,
        ]);

        $t2 = Transporteur::create([
            'user_id' => $tu2->id,
            'nom_entreprise' => 'GP Move Thiès',
            'description' => 'Transport rapide et fiable depuis Thiès. Large réseau couvrant toutes les villes du Sénégal.',
            'type_transport' => 'camionnette',
            'capacite_kg' => 1500,
            'zones_couvertes' => ['Thiès', 'Dakar', 'Diourbel', 'Fatick', 'Touba'],
            'prix_par_km' => 180,
            'prix_fixe' => 3000,
            'note_moyenne' => 4.2,
            'nombre_avis' => 15,
            'verified' => true,
        ]);

        $t3 = Transporteur::create([
            'user_id' => $tu3->id,
            'nom_entreprise' => 'Nord Express Ba',
            'description' => 'Service premium dans le nord du Sénégal. Ponctualité garantie.',
            'type_transport' => 'camionnette',
            'capacite_kg' => 2000,
            'zones_couvertes' => ['Saint-Louis', 'Louga', 'Matam', 'Podor', 'Richard-Toll'],
            'prix_par_km' => 200,
            'prix_fixe' => 4000,
            'note_moyenne' => 4.8,
            'nombre_avis' => 42,
            'verified' => true,
        ]);

        Transporteur::create([
            'user_id' => $tu4->id,
            'nom_entreprise' => 'Moto Express Dakar',
            'description' => 'Livraison rapide en moto dans tout Dakar. Disponible 7j/7.',
            'type_transport' => 'moto',
            'capacite_kg' => 30,
            'zones_couvertes' => ['Dakar', 'Pikine', 'Guédiawaye', 'Rufisque'],
            'prix_par_km' => 80,
            'prix_fixe' => 500,
            'note_moyenne' => 4.6,
            'nombre_avis' => 89,
            'verified' => true,
        ]);

        // ── Commandes de démo ─────────────────────
        $cmd1 = Commande::create([
            'numero' => 'GP2025001',
            'client_id' => $client1->id,
            'transporteur_id' => $t1->id,
            'description' => 'Électroménager (frigo + machine à laver)',
            'poids_kg' => 120,
            'adresse_depart' => 'Marché Sandaga, Plateau',
            'ville_depart' => 'Dakar',
            'adresse_destination' => '12 Rue des Jacarandas, Cité Keur Gorgui',
            'ville_destination' => 'Dakar',
            'distance_km' => 8,
            'prix_propose' => 35000,
            'prix_final' => 35000,
            'statut' => 'livre',
            'date_prise_en_charge' => '2025-01-10 09:00:00',
            'date_livraison' => '2025-01-10 14:00:00',
        ]);

        foreach ([
            ['en_attente', 'Commande créée, en attente de confirmation.'],
            ['accepte',    'Commande acceptée par Sall Express Transport.'],
            ['en_cours',   'Prise en charge effectuée au Marché Sandaga.'],
            ['livre',      '✅ Livraison effectuée avec succès !'],
        ] as [$statut, $desc]) {
            SuiviLivraison::create(['commande_id' => $cmd1->id, 'statut' => $statut, 'description' => $desc]);
        }

        $cmd2 = Commande::create([
            'numero' => 'GP2025002',
            'client_id' => $client2->id,
            'transporteur_id' => $t2->id,
            'description' => 'Colis de vêtements et tissus',
            'poids_kg' => 45,
            'adresse_depart' => 'Marché Ocass, Thiès',
            'ville_depart' => 'Thiès',
            'adresse_destination' => 'Avenue Cheikh Anta Diop, HLM',
            'ville_destination' => 'Dakar',
            'distance_km' => 70,
            'prix_propose' => 18000,
            'statut' => 'en_cours',
            'date_prise_en_charge' => now(),
        ]);

        foreach ([
            ['en_attente', 'Commande créée.'],
            ['accepte',    'Acceptée par GP Move Thiès.'],
            ['en_cours',   'Colis récupéré à Thiès. En route vers Dakar.', 'Autoroute Dakar-Thiès'],
        ] as $row) {
            SuiviLivraison::create([
                'commande_id'  => $cmd2->id,
                'statut'       => $row[0],
                'description'  => $row[1],
                'localisation' => $row[2] ?? null,
            ]);
        }

        $this->command->info('✅ Données de démonstration insérées !');
        $this->command->info('──────────────────────────────────────────');
        $this->command->info('📧 Comptes :');
        $this->command->info('  Client 1  : pape.niang@gmail.com / password123');
        $this->command->info('  Client 2  : abdou.sarr@gmail.com / password123');
        $this->command->info('  Transp.   : ibrahima.sall@transport.sn / password123');
        $this->command->info('  Admin     : admin@gp-transport.sn / password123');
    }
}
