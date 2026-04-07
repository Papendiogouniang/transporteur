<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('commandes', function (Blueprint $table) {
            $table->id();
            $table->string('numero')->unique();
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('transporteur_id')->constrained('transporteurs')->onDelete('cascade');
            $table->string('description');
            $table->float('poids_kg')->nullable();
            $table->float('volume_m3')->nullable();
            $table->string('adresse_depart');
            $table->string('ville_depart')->default('');
            $table->string('adresse_destination');
            $table->string('ville_destination')->default('');
            $table->float('distance_km')->nullable();
            $table->float('prix_propose');
            $table->float('prix_final')->nullable();
            $table->enum('statut', ['en_attente','accepte','en_cours','livre','annule','refuse'])->default('en_attente');
            $table->date('date_souhaitee')->nullable();
            $table->dateTime('date_prise_en_charge')->nullable();
            $table->dateTime('date_livraison')->nullable();
            $table->text('notes_client')->nullable();
            $table->text('notes_transporteur')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('commandes'); }
};
