<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Import semua controller yang dibutuhkan
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\HomepageController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController; 
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\Owner\OrderController as OwnerOrderController;
use App\Http\Controllers\Api\Owner\StatsController; 
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\ShippingController; 
use App\Http\Controllers\Api\CouponController; 
use App\Http\Controllers\Api\ProfileController; 
use App\Http\Controllers\Api\Auth\SocialLoginController; 
use App\Http\Controllers\Api\StockNotificationController;
use App\Http\Controllers\Api\Auth\EmailVerificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware(['signed', 'throttle:6,1']) // Hanya 'signed' dan 'throttle' yang diperlukan
    ->name('verification.verify');

// Rute untuk pengguna yang login tapi belum terverifikasi untuk meminta email baru.
// Middleware 'auth:sanctum' tetap ada di sini karena pengguna harus login untuk meminta ulang.
Route::post('/email/verification-notification', [EmailVerificationController::class, 'resend'])
    ->middleware(['auth:sanctum', 'throttle:6,1'])
    ->name('verification.send');

// Rute Publik
Route::get('/products/search', [ProductController::class, 'search']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product:slug}', [ProductController::class, 'show']);
Route::get('/homepage', [HomepageController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category:slug}', [CategoryController::class, 'show']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/auth/google/redirect', [SocialLoginController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [SocialLoginController::class, 'handleGoogleCallback']);

// Rute yang butuh login, bisa diakses SEMUA ROLE
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/products/batch', [ProductController::class, 'getByIds']); 
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'updateProfile']);
    Route::patch('/profile/password', [ProfileController::class, 'updatePassword']);
});

// Rute KHUSUS untuk PEMILIK TOKO
Route::middleware(['auth:sanctum', 'role:store_owner', 'verified'])->group(function () {
    Route::get('/my-products', [ProductController::class, 'myProducts']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    Route::get('/owner/orders', [OwnerOrderController::class, 'index']);
    Route::patch('/owner/orders/{order}/update-status', [OwnerOrderController::class, 'updateItemsStatus']);
    Route::get('/owner/stats', [StatsController::class, 'index']);
});

// Rute KHUSUS untuk ADMIN
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/admin/users', [UserController::class, 'index']);
    Route::get('/admin/users/{user}', [UserController::class, 'showOwnerWithProducts']);
    Route::delete('/admin/products/{product}', [UserController::class, 'deleteProduct']);
});

// RUTE KHUSUS UNTUK CUSTOMER
Route::middleware(['auth:sanctum', 'role:customer', 'verified'])->group(function () {
    // dd('Berhasil masuk ke grup rute Customer');

    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::patch('/cart/{productId}', [CartController::class, 'update']);
    Route::delete('/cart/{productId}', [CartController::class, 'destroy']);

    Route::get('/orders/history', [OrderController::class, 'history']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::patch('/orders/{order}/cancel', [OrderController::class, 'cancel']);

    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);
    Route::post('/products/{product}/reviews', [ReviewController::class, 'store']);

    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);

    Route::post('/shipping-options', [ShippingController::class, 'getOptions']);
    Route::post('/coupons/apply', [CouponController::class, 'apply']);

    Route::post('/products/{product}/stock-notification', [StockNotificationController::class, 'subscribe']);
});
