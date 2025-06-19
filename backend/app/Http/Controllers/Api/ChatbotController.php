<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ChatbotController extends Controller
{
    public function handle(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'user_id' => 'nullable|integer'
        ]);

        $message = $request->input('message');
        $userId = $request->input('user_id');
        $intent = $this->analyzeIntent($message);

        try {
            $response = $this->handleIntent($intent, $message, $userId);

            // Log conversation
            if ($userId) {
                DB::table('chatbot_logs')->insert([
                    'user_id' => $userId,
                    'message' => $message,
                    'response' => is_array($response) ? json_encode($response) : $response,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            return response()->json([
                'success' => true,
                'response' => $response
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Đã xảy ra lỗi khi xử lý yêu cầu'
            ], 500);
        }
    }

    protected function analyzeIntent($message)
    {
        $message = Str::lower($message);

        if (Str::contains($message, ['sản phẩm', 'điện thoại', 'máy'])) {
            return 'product_query';
        } elseif (Str::contains($message, ['giá', 'bao nhiêu', 'tiền'])) {
            return 'price_query';
        } elseif (Str::contains($message, ['danh mục', 'loại', 'category'])) {
            return 'category_query';
        } elseif (Str::contains($message, ['khuyến mãi', 'voucher', 'giảm giá'])) {
            return 'voucher_query';
        } elseif (Str::contains($message, ['đơn hàng', 'trạng thái', 'giao hàng'])) {
            return 'order_query';
        } elseif (Str::contains($message, ['thông số', 'kỹ thuật', 'spec'])) {
            return 'spec_query';
        } else {
            return 'general_query';
        }
    }

    protected function handleIntent($intent, $message, $userId = null)
    {
        switch ($intent) {
            case 'product_query':
                return $this->handleProductQuery($message);
            case 'price_query':
                return $this->handlePriceQuery($message);
            case 'category_query':
                return $this->handleCategoryQuery($message);
            case 'voucher_query':
                return $this->handleVoucherQuery($message);
            case 'order_query':
                return $this->handleOrderQuery($message, $userId);
            case 'spec_query':
                return $this->handleSpecQuery($message);
            default:
                return $this->handleGeneralQuery($message);
        }
    }

    protected function handleProductQuery($message)
    {
        $products = DB::table('products')
            ->whereNull('deleted_at')
            ->where(function($query) use ($message) {
                $query->where('name', 'like', "%{$message}%")
                      ->orWhere('description', 'like', "%{$message}%");
            })
            ->join('categories', 'products.category_id', '=', 'categories.category_id')
            ->select('products.*', 'categories.name as category_name')
            ->limit(5)
            ->get();

        if ($products->isEmpty()) {
            return 'Xin lỗi, chúng tôi không tìm thấy sản phẩm phù hợp với yêu cầu của bạn.';
        }

        $response = "Chúng tôi tìm thấy các sản phẩm sau:\n";
        foreach ($products as $product) {
            $response .= "- {$product->name} (Danh mục: {$product->category_name}, Giá: " . number_format($product->price, 0, ',', '.') . " VNĐ)\n";
        }

        return $response;
    }

    protected function handlePriceQuery($message)
    {
        $productName = $this->extractProductName($message);

        $product = DB::table('products')
            ->whereNull('deleted_at')
            ->where('name', 'like', "%{$productName}%")
            ->first();

        if (!$product) {
            return 'Xin lỗi, chúng tôi không tìm thấy thông tin giá cho sản phẩm này.';
        }

        $discount = $product->price_original > 0
            ? round(($product->price_original - $product->price) / $product->price_original * 100)
            : 0;

        $response = "Thông tin giá sản phẩm:\n";
        $response .= "- Tên sản phẩm: {$product->name}\n";
        $response .= "- Giá hiện tại: " . number_format($product->price, 0, ',', '.') . " VNĐ\n";

        if ($discount > 0) {
            $response .= "- Giá gốc: " . number_format($product->price_original, 0, ',', '.') . " VNĐ\n";
            $response .= "- Tiết kiệm: {$discount}%\n";
        }

        return $response;
    }

    protected function handleCategoryQuery($message)
    {
        $categories = DB::table('categories')
            ->whereNull('deleted_at')
            ->leftJoin('products', 'categories.category_id', '=', 'products.category_id')
            ->select('categories.name', DB::raw('count(products.product_id) as product_count'))
            ->groupBy('categories.category_id')
            ->get();

        return 'Chúng tôi có các danh mục sản phẩm sau: ' .
               $categories->map(function($category) {
                   return "{$category->name} ({$category->product_count} sản phẩm)";
               })->implode(', ');
    }

    protected function handleVoucherQuery($message)
    {
        $vouchers = DB::table('vouchers')
            ->whereNull('deleted_at')
            ->where('expiry_date', '>=', now())
            ->where('quantity', '>', 0)
            ->orderBy('discount', 'desc')
            ->limit(3)
            ->get();

        if ($vouchers->isEmpty()) {
            return 'Hiện không có chương trình khuyến mãi nào. Vui lòng quay lại sau!';
        }

        $response = "Các chương trình khuyến mãi hiện có:\n";
        foreach ($vouchers as $voucher) {
            $expiryDate = date('d/m/Y', strtotime($voucher->expiry_date));
            $response .= "- Mã: {$voucher->code}, Giảm " . number_format($voucher->discount, 0, ',', '.') . " VNĐ";

            if ($voucher->min_order_amount > 0) {
                $response .= " (Áp dụng cho đơn từ " . number_format($voucher->min_order_amount, 0, ',', '.') . " VNĐ)";
            }

            $response .= ", HSD: {$expiryDate}\n";
        }

        return $response;
    }

    protected function handleOrderQuery($message, $userId = null)
    {
        if (!$userId) {
            return 'Vui lòng đăng nhập để kiểm tra trạng thái đơn hàng.';
        }

        $orders = DB::table('orders')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get();

        if ($orders->isEmpty()) {
            return 'Bạn chưa có đơn hàng nào.';
        }

        $response = "Thông tin đơn hàng gần đây:\n";
        foreach ($orders as $order) {
            $createdAt = date('d/m/Y H:i', strtotime($order->created_at));
            $response .= "- Mã đơn: {$order->order_code}, Tổng tiền: " . number_format($order->total_amount, 0, ',', '.') . " VNĐ, Trạng thái: {$order->status}, Ngày đặt: {$createdAt}\n";
        }

        return $response;
    }

    protected function handleSpecQuery($message)
    {
        $productName = $this->extractProductName($message);

        $product = DB::table('products')
            ->whereNull('deleted_at')
            ->where('name', 'like', "%{$productName}%")
            ->first();

        if (!$product) {
            return 'Xin lỗi, không tìm thấy sản phẩm phù hợp.';
        }

        $specs = DB::table('product_specifications')
            ->where('product_id', $product->product_id)
            ->get();

        if ($specs->isEmpty()) {
            return 'Sản phẩm này chưa có thông số kỹ thuật chi tiết.';
        }

        $response = "Thông số kỹ thuật {$product->name}:\n";
        foreach ($specs as $spec) {
            $response .= "- {$spec->spec_name}: {$spec->spec_value}\n";
        }

        return $response;
    }

    protected function handleGeneralQuery($message)
    {
        // Tìm trong FAQs
        $faqs = DB::table('news')
            ->whereNull('deleted_at')
            ->where(function($query) use ($message) {
                $query->where('title', 'like', "%{$message}%")
                      ->orWhere('content', 'like', "%{$message}%");
            })
            ->limit(3)
            ->get();

        if (!$faqs->isEmpty()) {
            $response = "Chúng tôi tìm thấy một số thông tin liên quan:\n";
            foreach ($faqs as $faq) {
                $response .= "- {$faq->title}\n";
            }
            return $response;
        }

        // Tìm trong sản phẩm nếu không thấy trong FAQs
        return $this->handleProductQuery($message);
    }

    protected function extractProductName($message)
    {
        $stopWords = ['giá', 'bao nhiêu', 'là', 'của', 'có', 'về', 'cho', 'hỏi'];
        $message = Str::lower($message);

        foreach ($stopWords as $word) {
            $message = str_replace($word, '', $message);
        }

        return trim(preg_replace('/\s+/', ' ', $message));
    }
}