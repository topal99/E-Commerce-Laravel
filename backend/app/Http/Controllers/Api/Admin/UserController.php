<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Product;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // Mengambil daftar semua customer dan owner
    public function index()
    {
        $users = User::whereIn('role', ['store_owner', 'customer'])->get();
        return response()->json(['data' => $users]);
    }

    // Mengambil detail satu owner beserta produknya
    public function showOwnerWithProducts(User $user)
    {
        // Pastikan yang diambil adalah store_owner
        if ($user->role !== 'store_owner') {
            return response()->json(['message' => 'User is not a store owner.'], 404);
        }
        return response()->json(['data' => $user->load('products')]);
    }

    // Admin menghapus produk milik owner
    public function deleteProduct(Product $product)
    {
        $product->delete();
        return response()->json(['message' => 'Product deleted successfully by admin.']);
    }
}