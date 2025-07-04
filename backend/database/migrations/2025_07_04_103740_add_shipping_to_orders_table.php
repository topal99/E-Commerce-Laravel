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
        Schema::table('orders', function (Blueprint $table) {
            // Kolom untuk menyimpan alamat pengiriman yang dipilih
            $table->foreignId('shipping_address_id')->nullable()->constrained('addresses')->onDelete('set null')->after('user_id');
            
            // Kolom untuk menyimpan biaya pengiriman yang dipilih
            $table->decimal('shipping_cost', 15, 2)->default(0)->after('total_price');
        });
    }
    
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            //
        });
    }
};
