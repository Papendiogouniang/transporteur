<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transporteurs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('nom_entreprise');
            $table->text('description')->nullable();
            $table->enum('type_transport', ['camion', 'camionnette', 'moto', 'voiture', 'bateau']);
            $table->float('capacite_kg')->default(0);
            $table->json('zones_couvertes')->nullable();
            $table->float('prix_par_km')->default(0);
            $table->float('prix_fixe')->default(0);
            $table->float('note_moyenne')->default(0);
            $table->integer('nombre_avis')->default(0);
            $table->boolean('disponible')->default(true);
            $table->boolean('verified')->default(false);
            $table->string('photo')->nullable();
            $table->string('numero_licence')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('transporteurs'); }
};
