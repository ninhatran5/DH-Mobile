<?php

namespace App\Http\Controllers\Api;

use App\Models\ChatbotLog;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;


class ChatbotController extends Controller
{

    public function index()
    {
        $chatbots = DB::table('chatbots')
            ->select('chatbot_id', 'name', 'description', 'is_active')
            ->get();

        return response()->json([
            'success' => true,
            'chatbots' => $chatbots
        ]);
    }

    public function toggle($id)
    {
        $chatbot = DB::table('chatbots')->where('chatbot_id', $id)->first();

        if (!$chatbot) {
            return response()->json([
                'success' => false,
                'message' => 'Chatbot không tồn tại.'
            ], 404);
        }

        DB::table('chatbots')->where('chatbot_id', $id)->update(['is_active' => !$chatbot->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái chatbot thành công.',
            'data' => [
                'chatbot_id' => $chatbot->chatbot_id,
                'is_active' => $chatbot->is_active
            ]
        ]);
    }


    public function handle(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'user_id' => 'nullable|integer'
        ]);

        $message = $request->input('message');
        $userId = $request->input('user_id');


        $bot = DB::table('chatbots')
            ->where('name', 'Hướng dẫn mua hàng')
            ->where('is_active', true)
            ->first();

        if (!$bot) {
            return response()->json([
                'success' => false,
                'message' => 'Chatbot đang tạm thời không hoạt động. Vui lòng thử lại sau.'
            ]);
        }

        // Phân tích ý định của người dùng từ message
        // Sử dụng hàm analyzeIntent để xác định intent dựa trên từ khóa
        $intent = $this->analyzeIntent($message);


        try {
            $response = $this->handleIntent($intent, $message, $userId);

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
            Log::error('ChatbotController Exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'error' => 'Đã xảy ra lỗi khi xử lý yêu cầu',
                'detail' => $e->getMessage(),
            ], 500);
        }
    }

    protected function analyzeIntent($message)
    {
        $message = Str::lower($message);

        // Mảng từ khóa và intent tương ứng
        $intents = [
            'product_query' => ['sản phẩm', 'điện thoại', 'máy', 'mua', 'model', 'tư vấn'],
            'price_query' => ['giá', 'bao nhiêu', 'tiền', 'chi phí', 'trả góp', 'giá cả'],
            'category_query' => ['danh mục', 'loại', 'category', 'phân loại', 'dòng máy'],
            'voucher_query' => ['khuyến mãi', 'voucher', 'giảm giá', 'mã giảm', 'ưu đãi', 'quà tặng'],
            'order_query' => ['đơn hàng', 'trạng thái', 'giao hàng', 'vận chuyển', 'thanh toán', 'đặt hàng'],
            'spec_query' => ['thông số', 'kỹ thuật', 'spec', 'cấu hình', 'tính năng', 'đặc điểm'],
            'support_query' => ['bảo hành', 'sửa chữa', 'hỗ trợ', 'đổi trả', 'lỗi', 'hư hỏng'],
            'comparison_query' => ['so sánh', 'khác nhau', 'khác biệt', 'tốt hơn', 'đánh giá']
        ];

        // Chấm điểm cho mỗi intent dựa trên số từ khóa match
        $scores = [];
        foreach ($intents as $intent => $keywords) {
            $score = 0;
            foreach ($keywords as $keyword) {
                if (Str::contains($message, $keyword)) {
                    $score += 1;
                }
            }
            $scores[$intent] = $score;
        }

        // Lấy intent có điểm cao nhất
        $maxScore = max($scores);
        if ($maxScore > 0) {
            return array_search($maxScore, $scores);
        }

        return 'general_query';
    }

    protected function handleIntent($intent, $message, $userId = null)
    {
        // Nếu là hỏi về đơn hàng hoặc giỏ hàng mà chưa đăng nhập, yêu cầu đăng nhập/đăng ký
        if ((in_array($intent, ['order_query', 'cart_query', 'voucher_query']) ||
                preg_match('/(giỏ hàng|đơn hàng|voucher|mã giảm|mã khuyến mãi|lịch sử mua|mua hàng|đặt hàng|của tôi|cá nhân|tài khoản)/iu', $message))
            && empty($userId)
        ) {
            return 'Bạn cần đăng nhập hoặc đăng ký tài khoản để sử dụng chức năng này và xem thông tin cá nhân, đơn hàng, giỏ hàng, voucher. Vui lòng đăng nhập để tiếp tục nhé!';
        }
        // Nếu là hỏi về voucher cá nhân (tạm thời chỉ lấy từ bảng vouchers, bỏ user_vouchers)
        if ($intent === 'voucher_query') {
            $now = now();
            $vouchers = DB::table('vouchers')
                ->where('is_active', 1)
                ->where('start_date', '<=', $now)
                ->where('end_date', '>=', $now)
                ->whereNull('deleted_at')
                ->orderByDesc('end_date')
                ->select('code', 'title', 'discount_amount', 'end_date', 'min_order_value')
                ->get();
            if ($vouchers->isEmpty()) {
                return 'Hiện tại chưa có voucher nào khả dụng. Hãy theo dõi các chương trình khuyến mãi mới nhất để nhận voucher nhé!';
            }
            $context = "### Voucher khả dụng hiện tại:\n";
            foreach ($vouchers as $v) {
                $context .= "- Mã: {$v->code}, giảm: " . number_format($v->discount_amount, 0, ',', '.') . " VNĐ, HSD: {$v->end_date}, {$v->title}";
                if ($v->min_order_value > 0) {
                    $context .= " (Áp dụng cho đơn từ " . number_format($v->min_order_value, 0, ',', '.') . " VNĐ)";
                }
                $context .= "\n";
            }
            $prompt = "Bạn là trợ lý AI, hãy trả lời thân thiện, tự nhiên, giải thích cho khách về các voucher bên dưới, gợi ý cách sử dụng nếu cần.\n" . $context . "\n\nCâu hỏi khách hàng: " . $message;
            if (mb_strlen($prompt) > 3000) {
                return 'Thông tin voucher quá nhiều, vui lòng kiểm tra chi tiết trong mục \"Mã giảm giá\" trên tài khoản cá nhân nhé!';
            }
            return $this->callOpenRouterAIWithCustomPrompt($prompt);
        }
        // Nếu là hỏi về voucher nhưng chưa đăng nhập, yêu cầu đăng nhập
        if ($intent === 'voucher_query' && empty($userId)) {
            return 'Bạn cần đăng nhập hoặc đăng ký tài khoản để xem các voucher cá nhân của mình. Vui lòng đăng nhập để tiếp tục nhé!';
        }
        // Nếu là hỏi về voucher chung (chưa cá nhân hóa, fallback)
        if ($intent === 'voucher_query') {
            $now = now();
            $vouchers = DB::table('vouchers')
                ->where('is_active', 1)
                ->where('start_date', '<=', $now)
                ->where('end_date', '>=', $now)
                ->whereNull('deleted_at')
                ->orderByDesc('end_date')
                ->select('code', 'title', 'discount_amount', 'end_date', 'min_order_value')
                ->get();
            if ($vouchers->isEmpty()) {
                return 'Hiện tại chưa có voucher nào khả dụng. Hãy theo dõi các chương trình khuyến mãi mới nhất để nhận voucher nhé!';
            }
            $context = "### Voucher khả dụng hiện tại:\n";
            foreach ($vouchers as $v) {
                $context .= "- Mã: {$v->code}, giảm: " . number_format($v->discount_amount, 0, ',', '.') . " VNĐ, HSD: {$v->end_date}, {$v->title}";
                if ($v->min_order_value > 0) {
                    $context .= " (Áp dụng cho đơn từ " . number_format($v->min_order_value, 0, ',', '.') . " VNĐ)";
                }
                $context .= "\n";
            }
            $prompt = "Bạn là trợ lý AI, hãy trả lời thân thiện, tự nhiên, giải thích cho khách về các voucher bên dưới, gợi ý cách sử dụng nếu cần.\n" . $context . "\n\nCâu hỏi khách hàng: " . $message;
            if (mb_strlen($prompt) > 3000) {
                return 'Thông tin voucher quá nhiều, vui lòng kiểm tra chi tiết trong mục "Mã giảm giá" trên tài khoản cá nhân nhé!';
            }
            return $this->callOpenRouterAIWithCustomPrompt($prompt);
        }
        // Nếu user đã đăng nhập, truyền thêm context giỏ hàng
        $cartContext = '';
        if (!empty($userId)) {
            $cart = DB::table('carts')->where('user_id', $userId)->select('cart_id')->first();
            if ($cart) {
                $cartItems = DB::table('cart_items')
                    ->join('product_variants', 'cart_items.variant_id', '=', 'product_variants.variant_id')
                    ->join('products', 'product_variants.product_id', '=', 'products.product_id')
                    ->where('cart_items.cart_id', $cart->cart_id)
                    ->select('products.name as product_name', 'cart_items.quantity', 'product_variants.price', 'product_variants.sku', 'product_variants.variant_id')
                    ->get();
                if (!$cartItems->isEmpty()) {
                    $cartContext = "\n### Giỏ hàng hiện tại của bạn:\n";
                    foreach ($cartItems as $item) {
                        // Lấy thuộc tính biến thể (nếu có)
                        $attributes = DB::table('variant_attribute_values')
                            ->join('attribute_values', 'variant_attribute_values.value_id', '=', 'attribute_values.value_id')
                            ->join('attributes', 'attribute_values.attribute_id', '=', 'attributes.attribute_id')
                            ->where('variant_attribute_values.variant_id', $item->variant_id)
                            ->select('attributes.name as attr_name', 'attribute_values.value as attr_value')
                            ->get();
                        $attrStr = '';
                        if (!$attributes->isEmpty()) {
                            $attrArr = [];
                            foreach ($attributes as $attr) {
                                $attrArr[] = "$attr->attr_name: $attr->attr_value";
                            }
                            $attrStr = ' [' . implode(', ', $attrArr) . ']';
                        }
                        $cartContext .= "- {$item->product_name}{$attrStr} (SKU: {$item->sku}) x {$item->quantity} (" . number_format($item->price, 0, ',', '.') . " VNĐ)\n";
                    }
                }
            }
        }
        // Nếu là hỏi về đơn hàng và đã đăng nhập, xử lý thông minh hơn
        if ($intent === 'order_query' && !empty($userId)) {
            // Tìm mã đơn hàng trong message (giả sử mã có dạng DHxxxx hoặc chỉ số)
            $orderCode = null;
            if (preg_match('/(DH\d{4,}|\d{6,})/i', $message, $matches)) {
                $orderCode = $matches[1];
            }
            if ($orderCode) {
                $order = DB::table('orders')
                    ->where('user_id', $userId)
                    ->where('order_code', $orderCode)
                    ->select('order_code', 'status', 'total_amount', 'created_at')
                    ->first();
                if ($order) {
                    $context = "### Thông tin đơn hàng bạn hỏi:\n";
                    $context .= "- Mã: {$order->order_code}, trạng thái: {$order->status}, tổng: " . number_format($order->total_amount, 0, ',', '.') . " VNĐ, ngày đặt: {$order->created_at}\n";
                } else {
                    $context = "Không tìm thấy đơn hàng với mã bạn cung cấp. Dưới đây là các đơn hàng gần đây của bạn:";
                    $orders = DB::table('orders')
                        ->where('user_id', $userId)
                        ->orderByDesc('created_at')
                        ->limit(3)
                        ->select('order_code', 'status', 'total_amount', 'created_at')
                        ->get();
                    foreach ($orders as $o) {
                        $context .= "\n- Mã: {$o->order_code}, trạng thái: {$o->status}, tổng: " . number_format($o->total_amount, 0, ',', '.') . " VNĐ, ngày đặt: {$o->created_at}";
                    }
                }
            } else {
                // Không có mã đơn hàng, lấy tối đa 3 đơn gần nhất
                $orders = DB::table('orders')
                    ->where('user_id', $userId)
                    ->orderByDesc('created_at')
                    ->limit(3)
                    ->select('order_code', 'status', 'total_amount', 'created_at')
                    ->get();
                if ($orders->isEmpty()) {
                    $context = "Bạn chưa có đơn hàng nào trên hệ thống. Hãy đặt hàng để nhận ưu đãi hấp dẫn nhé!";
                } else {
                    $context = "### Các đơn hàng gần đây của bạn:\n";
                    foreach ($orders as $o) {
                        $context .= "- Mã: {$o->order_code}, trạng thái: {$o->status}, tổng: " . number_format($o->total_amount, 0, ',', '.') . " VNĐ, ngày đặt: {$o->created_at}\n";
                    }
                    $context .= "\nNếu bạn muốn xem chi tiết đơn nào, hãy cung cấp mã đơn hàng nhé!";
                }
            }
            $prompt = "Bạn là trợ lý tư vấn đơn hàng chuyên nghiệp, hãy trả lời chi tiết, thân thiện, cá nhân hóa cho khách đã đăng nhập, KHÔNG hỏi lại về đăng nhập, KHÔNG nhắc kiểm tra tài khoản. Dựa trên context dưới đây, nếu khách hỏi về trạng thái, tổng tiền, ngày đặt, hãy trả lời rõ ràng, có thể gợi ý các bước tiếp theo (ví dụ: liên hệ hỗ trợ, xem chi tiết đơn hàng).\n" . $context . "\n\nCâu hỏi khách hàng: " . $message;
            return $this->callOpenRouterAIWithCustomPrompt($prompt);
        }
        // Các intent khác: dùng context tổng hợp như trước, có thêm context giỏ hàng nếu có
        return $this->callOpenRouterAI($message . $cartContext);
    }

    // Hàm mới để gọi AI với prompt tuỳ chỉnh
    protected function callOpenRouterAIWithCustomPrompt($prompt)
    {
        $apiKey = config('services.openrouter.api_key');
        $endpoint = config('services.openrouter.endpoint');
        $model = config('services.openrouter.model', 'deepseek/deepseek-r1-0528:free');
        if (!$apiKey) {
            return 'Hệ thống chưa cấu hình AI key.';
        }
        $systemPrompt = 'Bạn là một trợ lý AI thân thiện, nói chuyện tự nhiên như con người, luôn trả lời ngắn gọn, dễ hiểu, tránh liệt kê máy móc, ưu tiên hội thoại gần gũi, có thể dùng emoji, markdown. Nếu không chắc chắn, hãy trả lời khéo léo và gợi mở thay vì trả lời cứng nhắc.';
        $data = [
            'model' => $model,
            'messages' => [
                [
                    'role' => 'system',
                    'content' => $systemPrompt
                ],
                [
                    'role' => 'user',
                    'content' => $prompt
                ]
            ]
        ];
        $headers = [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey
        ];
        $ch = curl_init($endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        $result = curl_exec($ch);
        $err = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($err || $httpCode >= 500 || !$result) {
            return 'Xin lỗi, hiện tại mình chưa thể trả lời câu hỏi này. Bạn có thể hỏi lại theo cách khác hoặc liên hệ nhân viên để được hỗ trợ nhanh nhất nhé! 😊';
        }
        $json = json_decode($result, true);
        if (isset($json['choices'][0]['message']['content']) && trim($json['choices'][0]['message']['content']) !== '') {
            return $json['choices'][0]['message']['content'];
        }
        return 'Xin lỗi, mình chưa có thông tin phù hợp cho câu hỏi này. Bạn có thể hỏi lại chi tiết hơn hoặc liên hệ nhân viên để được hỗ trợ nhé! 😊';
    }

    protected function callOpenRouterAI($message)
    {
        $apiKey = config('services.openrouter.api_key');
        $endpoint = config('services.openrouter.endpoint');
        $model = config('services.openrouter.model', 'deepseek/deepseek-r1-0528:free');
        if (!$apiKey) {
            return 'Hệ thống chưa cấu hình AI key.';
        }
        $systemPrompt = 'Bạn là một trợ lý AI thân thiện, nói chuyện tự nhiên như con người, luôn trả lời ngắn gọn, dễ hiểu, tránh liệt kê máy móc, ưu tiên hội thoại gần gũi, có thể dùng emoji, markdown. Nếu không chắc chắn, hãy trả lời khéo léo và gợi mở thay vì trả lời cứng nhắc.';
        // Lấy context liên quan đến câu hỏi
        $keywords = array_filter(explode(' ', Str::lower($message)), fn($k) => strlen($k) > 2);
        // Sản phẩm liên quan
        $products = DB::table('products')
            ->whereNull('deleted_at')
            ->where(function ($query) use ($keywords) {
                foreach ($keywords as $kw) {
                    $query->orWhere('name', 'like', "%{$kw}%")
                        ->orWhere('description', 'like', "%{$kw}%");
                }
            })
            ->select('name', 'price', 'description')
            ->limit(5)
            ->get();
        // Nếu không có sản phẩm liên quan, lấy sản phẩm mới nhất
        if ($products->isEmpty()) {
            $products = DB::table('products')->whereNull('deleted_at')->orderByDesc('created_at')->select('name', 'price', 'description')->limit(3)->get();
        }
        // Danh mục liên quan
        $categories = DB::table('categories')
            ->whereNull('deleted_at')
            ->where(function ($query) use ($keywords) {
                foreach ($keywords as $kw) {
                    $query->orWhere('name', 'like', "%{$kw}%")
                        ->orWhere('description', 'like', "%{$kw}%");
                }
            })
            ->select('name', 'description')
            ->limit(3)
            ->get();
        if ($categories->isEmpty()) {
            $categories = DB::table('categories')->whereNull('deleted_at')->orderByDesc('created_at')->select('name', 'description')->limit(2)->get();
        }
        // Voucher liên quan
        $vouchers = DB::table('vouchers')
            ->whereNull('deleted_at')
            ->where(function ($query) use ($keywords) {
                foreach ($keywords as $kw) {
                    $query->orWhere('code', 'like', "%{$kw}%")
                        ->orWhere('title', 'like', "%{$kw}%");
                }
            })
            ->select('code', 'discount_amount', 'end_date', 'title')
            ->limit(2)
            ->get();
        if ($vouchers->isEmpty()) {
            $vouchers = DB::table('vouchers')->whereNull('deleted_at')->orderByDesc('created_at')->select('code', 'discount_amount', 'end_date', 'title')->limit(1)->get();
        }
        // Lấy danh sách hãng (category) có sản phẩm
        $brands = DB::table('categories')
            ->whereNull('deleted_at')
            ->whereIn('category_id', function ($query) {
                $query->select('category_id')->from('products')->whereNull('deleted_at');
            })
            ->pluck('name')->unique()->values();

        // Sản phẩm bán chạy (giả lập: nhiều view_count nhất)
        $bestSellers = DB::table('products')
            ->whereNull('deleted_at')
            ->orderByDesc('view_count')
            ->select('name', 'price', 'description')
            ->limit(3)
            ->get();

        // Ưu đãi hot (voucher mới nhất, giảm nhiều nhất)
        $hotVouchers = DB::table('vouchers')
            ->whereNull('deleted_at')
            ->orderByDesc('discount_amount')
            ->select('code', 'discount_amount', 'end_date', 'title')
            ->limit(2)
            ->get();

        // Context ngắn gọn, nhóm theo hãng
        $context = "### Danh sách hãng điện thoại hiện có:\n";
        foreach ($brands as $brand) {
            $context .= "+ {$brand}\n";
        }
        $context .= "\n### Sản phẩm bán chạy:\n";
        foreach ($bestSellers as $p) {
            $context .= "- {$p->name} (" . number_format($p->price, 0, ',', '.') . " VNĐ): {$p->description}\n";
        }
        $context .= "\n### Ưu đãi hot:\n";
        foreach ($hotVouchers as $v) {
            $context .= "- Mã: {$v->code}, giảm: " . number_format($v->discount_amount, 0, ',', '.') . " VNĐ, HSD: {$v->end_date}, {$v->title}\n";
        }

        // Nếu có user_id, lấy đơn hàng gần đây của user
        $userOrders = collect();
        if (!empty($userId)) {
            $userOrders = DB::table('orders')
                ->where('user_id', $userId)
                ->orderByDesc('created_at')
                ->select('order_code', 'status', 'total_amount', 'created_at')
                ->limit(3)
                ->get();
        }

        $context .= "\n### Đơn hàng gần đây của bạn:\n";
        if ($userOrders->isEmpty()) {
            $context .= "- Bạn chưa có đơn hàng nào hoặc chưa đăng nhập.\n";
        } else {
            foreach ($userOrders as $o) {
                $context .= "- Mã: {$o->order_code}, trạng thái: {$o->status}, tổng: " . number_format($o->total_amount, 0, ',', '.') . " VNĐ, ngày đặt: {$o->created_at}\n";
            }
        }

        $prompt = "Bạn là trợ lý tư vấn khách hàng chuyên nghiệp, thân thiện, luôn xưng hô bạn là em còn khách hàng là anh/chị sử dụng markdown và icon để trình bày đẹp. Luôn trả lời đúng trọng tâm, ưu tiên tư vấn sản phẩm/dịch vụ phù hợp nhất với nhu cầu khách. Nếu khách hỏi về hãng, sản phẩm, giá, khuyến mãi, hãy trả lời dựa trên context dưới đây. Kết thúc bằng một câu hỏi gợi mở (CTA) như: 'Bạn muốn xem chi tiết sản phẩm nào không? 😊'\n" . $context . "\n\nCâu hỏi khách hàng: " . $message . "\n\nLưu ý: Tên cửa hàng là DHMobile, KHÔNG phải tên của các cửa hàng khác. Tuyệt đối không được nhắc đến các cửa hàng khác trong bất kỳ trường hợp nào.";

        $data = [
            'model' => $model,
            'messages' => [
                [
                    'role' => 'system',
                    'content' => $systemPrompt
                ],
                [
                    'role' => 'user',
                    'content' => $prompt
                ]
            ]
        ];
        $headers = [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey
        ];
        $ch = curl_init($endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        $result = curl_exec($ch);
        $err = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($err || $httpCode >= 500 || !$result) {
            return 'Xin lỗi, hiện tại mình chưa thể trả lời câu hỏi này. Bạn có thể hỏi lại theo cách khác hoặc liên hệ nhân viên để được hỗ trợ nhanh nhất nhé! 😊';
        }
        $json = json_decode($result, true);
        if (isset($json['choices'][0]['message']['content']) && trim($json['choices'][0]['message']['content']) !== '') {
            return $json['choices'][0]['message']['content'];
        }
        return 'Xin lỗi, mình chưa có thông tin phù hợp cho câu hỏi này. Bạn có thể hỏi lại chi tiết hơn hoặc liên hệ nhân viên để được hỗ trợ nhé! 😊';
    }

    // Lấy lịch sử hội thoại của user (nếu có user_id)
    public function getConversation(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn cần đăng nhập để xem lịch sử hội thoại cá nhân.'
            ], 401);
        }

        $logs = ChatbotLog::where('user_id', $user->user_id)
            ->orderByDesc('created_at')
            ->limit(30)
            ->get(['message', 'response', 'created_at']);
        return response()->json([
            'success' => true,
            'conversation' => $logs
        ]);
    }
}
