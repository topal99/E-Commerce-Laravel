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
        Schema::table('coupons', function (Blueprint $table) {
            // ID pengguna yang berhak menggunakan kupon ini
            $table->foreignId('user_id')->nullable()->constrained('users')->after('value');
            // ID pesanan di mana kupon ini digunakan
            $table->foreignId('order_id')->nullable()->constrained('orders')->after('user_id');
            // Menyimpan tanggal kapan kupon ini digunakan
            $table->timestamp('used_at')->nullable()->after('order_id');
        });
    }
    
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            //
        });
    }
};
