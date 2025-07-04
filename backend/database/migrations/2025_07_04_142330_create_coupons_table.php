    <?php

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    return new class extends Migration
    {
        public function up(): void
        {
            Schema::create('coupons', function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique(); // Kode unik, misal: "JULIHEMAT"
                $table->enum('type', ['fixed', 'percent']); // Tipe diskon: potongan tetap atau persentase
                $table->decimal('value', 15, 2); // Jumlah potongan
                $table->timestamp('expires_at')->nullable(); // Tanggal kedaluwarsa
                $table->timestamps();
            });
        }

        public function down(): void
        {
            Schema::dropIfExists('coupons');
        }
    };
    