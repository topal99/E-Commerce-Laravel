    <?php

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    return new class extends Migration
    {
        public function up(): void
        {
            Schema::create('return_requests', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_item_id')->constrained()->onDelete('cascade');
                $table->foreignId('user_id')->constrained()->onDelete('cascade'); // ID Pelanggan
                $table->text('reason');
                $table->string('image_url')->nullable(); // Untuk foto bukti
                $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
                $table->timestamps();
            });
        }

        public function down(): void
        {
            Schema::dropIfExists('return_requests');
        }
    };
    