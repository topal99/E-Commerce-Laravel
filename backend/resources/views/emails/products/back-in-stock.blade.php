<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stok Kembali Tersedia!</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
        }
        .button {
            display: inline-block;
            background-color: #0d6efd;
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
        .product-name {
            font-size: 1.2em;
            font-weight: bold;
            color: #000;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Halo!</h1>
        <p>Kabar baik! Produk yang Anda tunggu-tunggu sudah kembali tersedia di toko kami.</p>

        <p>Detail Produk:</p>
        <p class="product-name">{{ $product->name }}</p>

        <p>Stok terbatas, jangan sampai kehabisan lagi!</p>
        <br>
        <a href="{{ env('FRONTEND_URL', 'http://localhost:3000') }}/products/{{ $product->slug }}" class="button">
            Lihat Produk Sekarang
        </a>
        <br><br>
        <p>Terima kasih,<br>Tim Phoenix Store</p>
    </div>
</body>
</html>