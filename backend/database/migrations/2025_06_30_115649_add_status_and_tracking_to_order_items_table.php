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
        Schema::table('order_items', function (Blueprint $table) {
            // Menentukan status pengiriman untuk setiap item
            $table->enum('status', ['processing', 'shipped', 'delivered', 'cancelled'])
                  ->default('processing')
                  ->after('price');
            
            // Kolom untuk menyimpan nomor resi pengiriman
            $table->string('tracking_number')->nullable()->after('status');
        });
    }
    
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            //
        });
    }
};
