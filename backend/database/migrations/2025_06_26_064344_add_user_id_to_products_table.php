<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Kolom ini akan menyimpan ID dari 'store_owner' yang membuat produk
            $table->foreignId('user_id')
                ->nullable() // Izinkan null untuk produk yang mungkin dibuat oleh admin di masa depan
                ->constrained('users')
                ->onDelete('cascade') // Jika user dihapus, produknya juga terhapus
                ->after('id');
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            //
        });
    }
};
