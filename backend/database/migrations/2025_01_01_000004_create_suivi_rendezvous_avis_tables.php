<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // ── Suivi livraisons ─────────────────
        Schema::create('suivi_livraisons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('commande_id')->constrained('commandes')->onDelete('cascade');
            $table->string('statut');
            $table->string('localisation')->nullable();
            $table->text('description');
            $table->timestamps();
        });

        // ── Rendez-vous ──────────────────────
        Schema::create('rendezvous', function (Blueprint $table) {
            $table->id();
            $table->foreignId('commande_id')->constrained('commandes')->onDelete('cascade');
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('transporteur_id')->constrained('transporteurs')->onDelete('cascade');
            $table->dateTime('date_rdv');
            $table->string('lieu');
            $table->enum('type', ['prise_en_charge','livraison','inspection'])->default('prise_en_charge');
            $table->enum('statut', ['planifie','confirme','effectue','annule'])->default('planifie');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // ── Avis ─────────────────────────────
        Schema::create('avis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('commande_id')->unique()->constrained('commandes')->onDelete('cascade');
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('transporteur_id')->constrained('transporteurs')->onDelete('cascade');
            $table->tinyInteger('note');
            $table->text('commentaire')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avis');
        Schema::dropIfExists('rendezvous');
        Schema::dropIfExists('suivi_livraisons');
    }
};
