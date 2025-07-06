    <?php

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    return new class extends Migration
    {
        public function up(): void
        {
            Schema::create('stock_notifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->foreignId('product_id')->constrained()->onDelete('cascade');
                $table->boolean('notified')->default(false); // Penanda apakah notifikasi sudah dikirim
                $table->timestamps();
                // Pastikan satu user hanya bisa mendaftar sekali untuk satu produk
                $table->unique(['user_id', 'product_id']);
            });
        }

        public function down(): void
        {
            Schema::dropIfExists('stock_notifications');
        }
    };
    