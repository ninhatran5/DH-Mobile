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
            'message' => 'required|string'
        ]);

        $message = $request->input('message');
        $intent = $this->analyzeIntent($message);

        try {
            $response = $this->handleIntent($intent, $message);
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

        if (Str::contains($message, ['sản phẩm', 'mua', 'hàng'])) {
            return 'product_query';
        } elseif (Str::contains($message, ['giá', 'bao nhiêu', 'tiền'])) {
            return 'price_query';
        } elseif (Str::contains($message, ['danh mục', 'loại', 'category'])) {
            return 'category_query';
        } elseif (Str::contains($message, ['câu hỏi', 'faq', 'hỏi đáp'])) {
            return 'faq_query';
        } else {
            return 'general_query';
        }
    }

    protected function handleIntent($intent, $message)
    {
        switch ($intent) {
            case 'product_query':
                return $this->handleProductQuery($message);
            case 'price_query':
                return $this->handlePriceQuery($message);
            case 'category_query':
                return $this->handleCategoryQuery($message);
            case 'faq_query':
                return $this->handleFAQQuery($message);
            default:
                return $this->handleGeneralQuery($message);
        }
    }

    protected function handleProductQuery($message)
    {
        $products = DB::table('products')
            ->where('name', 'like', "%{$message}%")
            ->orWhere('description', 'like', "%{$message}%")
            ->get();

        if ($products->isEmpty()) {
            return 'Xin lỗi, chúng tôi không tìm thấy sản phẩm phù hợp với yêu cầu của bạn.';
        }

        return 'Chúng tôi có các sản phẩm sau phù hợp: ' .
               $products->pluck('name')->implode(', ');
    }

    protected function handlePriceQuery($message)
    {
        $productName = $this->extractProductName($message);

        $product = DB::table('products')
            ->where('name', 'like', "%{$productName}%")
            ->first();

        if (!$product) {
            return 'Xin lỗi, chúng tôi không tìm thấy thông tin giá cho sản phẩm này.';
        }

        return "Giá của sản phẩm {$product->name} là " . number_format($product->price, 0, ',', '.') . ' VNĐ';
    }

    protected function handleCategoryQuery($message)
    {
        $categories = DB::table('categories')
            ->leftJoin('products', 'categories.id', '=', 'products.category_id')
            ->select('categories.name', DB::raw('count(products.id) as product_count'))
            ->groupBy('categories.id')
            ->get();

        return 'Chúng tôi có các danh mục sản phẩm sau: ' .
               $categories->map(function($category) {
                   return "{$category->name} ({$category->product_count} sản phẩm)";
               })->implode(', ');
    }

    protected function handleFAQQuery($message)
    {
        $faq = DB::table('faqs')
            ->where('question', 'like', "%{$message}%")
            ->orWhere('answer', 'like', "%{$message}%")
            ->first();

        if (!$faq) {
            return 'Xin lỗi, chúng tôi không tìm thấy câu trả lời cho câu hỏi của bạn.';
        }

        return "Câu hỏi: {$faq->question}\nTrả lời: {$faq->answer}";
    }

    protected function handleGeneralQuery($message)
    {
        $tables = ['products', 'categories', 'faqs', 'customers'];
        $results = collect();

        foreach ($tables as $table) {
            $columns = $this->getTableColumns($table);
            $query = DB::table($table);

            foreach ($columns as $column) {
                $query->orWhere($column, 'like', "%{$message}%");
            }

            $data = $query->get();

            if (!$data->isEmpty()) {
                $results->push([
                    'table' => $table,
                    'data' => $data
                ]);
            }
        }

        if ($results->isEmpty()) {
            return 'Xin lỗi, chúng tôi không tìm thấy thông tin liên quan đến yêu cầu của bạn.';
        }

        return 'Chúng tôi tìm thấy một số thông tin liên quan: ' .
               $results->toJson(JSON_PRETTY_PRINT);
    }

    protected function extractProductName($message)
    {
        return trim(str_replace(['giá', 'bao nhiêu', 'là'], '', Str::lower($message)));
    }

    protected function getTableColumns($table)
    {
        return DB::getSchemaBuilder()->getColumnListing($table);
    }
}






