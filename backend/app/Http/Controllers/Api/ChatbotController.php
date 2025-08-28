<?php

namespace App\Http\Controllers\Api;

use App\Models\ChatbotLog;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Http\Controllers\Controller;
use App\Events\ChatMessageSent;


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

        $message = trim(Str::lower($request->input('message')));
        $userId = $request->input('user_id');
        $cacheKey = 'chatbot:' . md5($message . '|' . ($userId ?? 'guest'));
        $cacheTtl = 600;

        if (Cache::has($cacheKey)) {
            $cached = Cache::get($cacheKey);

            // **BROADCAST CACHED RESPONSE**
            // broadcast(new ChatMessageSent($message, $cached, $userId));

            return response()->json([
                'success' => true,
                'response' => $cached,
                'cached' => true,
                'realtime' => true
            ]);
        }

        $bot = DB::table('chatbots')
            ->where('name', 'Bot Tư Vấn Khách Hàng')
            ->where('is_active', 1)
            ->first();

        if (!$bot) {
            return response()->json([
                'success' => false,
                'message' => 'Chatbot đang tạm thời không hoạt động. Vui lòng thử lại sau.'
            ]);
        }

        $intent = $this->analyzeIntent($request->input('message')); // Sử dụng message gốc, không lowercase
        
        // Debug logging
        Log::info('Chatbot Debug', [
            'original_message' => $request->input('message'),
            'lowercase_message' => $message,
            'detected_intent' => $intent,
            'user_id' => $userId
        ]);

        try {
            $response = $this->handleIntent($intent, $request->input('message'), $userId); // Dùng message gốc

            // Only log if user exists in database
            if ($userId) {
                $userExists = DB::table('users')->where('user_id', $userId)->exists();
                if ($userExists) {
                    DB::table('chatbot_logs')->insert([
                        'user_id' => $userId,
                        'message' => $message,
                        'response' => is_array($response) ? json_encode($response) : $response,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                }
            }

            // **BROADCAST RESPONSE VIA PUSHER**
            // broadcast(new ChatMessageSent($message, $response, $userId));

            Cache::put($cacheKey, $response, $cacheTtl);

            return response()->json([
                'success' => true,
                'response' => $response,
                'realtime' => true
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
        $originalMessage = $message;
        $message = Str::lower(trim($message));

        // 1. REGEX PATTERNS - Kiểm tra các patterns phức tạp trước
        $patterns = [
            'greeting' => '/^(xin chào|hello|hi|chào bạn|chào|hey|halo)/i',
            'farewell' => '/(tạm biệt|bye|cảm ơn|thank you|kết thúc|hẹn gặp lại)/i',
            'price_query' => '/(giá|bao nhiêu|tiền|chi phí|cost|price).*(iphone|samsung|oppo|vivo|điện thoại|máy|smartphone)/i',
            'order_tracking' => '/(kiểm tra|xem|tra cứu|tìm).*(đơn hàng|order).*(DH\d+|\d{6,})/i',
            'product_compare' => '/(so sánh|khác nhau|tốt hơn|nên chọn).*(với|và|hay)/i',
            'voucher_personal' => '/(voucher|mã giảm).*(của tôi|cá nhân|tài khoản|có gì)/i',
            'product_specific' => '/(iphone|samsung|oppo|vivo|xiaomi)\s*(\d+|pro|plus|max|mini)/i'
        ];

        // Kiểm tra patterns trước
        foreach ($patterns as $intent => $pattern) {
            if (preg_match($pattern, $originalMessage)) {
                return $intent === 'product_specific' ? 'product_query' : $intent;
            }
        }

        // 2. ENHANCED KEYWORD MATCHING với trọng số
        $intents = [
            'product_query' => [
                'primary' => ['sản phẩm', 'điện thoại', 'smartphone', 'iphone', 'samsung', 'oppo', 'vivo', 'xiaomi'], // x3
                'secondary' => ['máy', 'mua', 'model', 'tư vấn', 'gợi ý', 'chọn', 'nào tốt'], // x2
                'tertiary' => ['mới', 'cũ', 'giá rẻ', 'cao cấp', 'phù hợp'] // x1
            ],
            'price_query' => [
                'primary' => ['giá', 'bao nhiêu', 'tiền', 'cost'],
                'secondary' => ['chi phí', 'trả góp', 'giá cả', 'price', 'đắt', 'rẻ'],
                'tertiary' => ['phải chăng', 'budget', 'ngân sách']
            ],
            'voucher_query' => [
                'primary' => ['voucher', 'mã giảm', 'khuyến mãi', 'discount'],
                'secondary' => ['giảm giá', 'ưu đãi', 'sale', 'promotion'],
                'tertiary' => ['quà tặng', 'miễn phí', 'bonus']
            ],
            'order_query' => [
                'primary' => ['đơn hàng', 'order', 'đặt hàng', 'mua hàng'],
                'secondary' => ['trạng thái', 'giao hàng', 'vận chuyển', 'thanh toán', 'kiểm tra'],
                'tertiary' => ['ship', 'delivery', 'payment']
            ],
            'support_query' => [
                'primary' => ['bảo hành', 'hỗ trợ', 'support', 'warranty'],
                'secondary' => ['sửa chữa', 'đổi trả', 'lỗi', 'hư hỏng', 'repair'],
                'tertiary' => ['khiếu nại', 'complaint', 'problem']
            ],
            'comparison_query' => [
                'primary' => ['so sánh', 'compare', 'khác nhau', 'tốt hơn'],
                'secondary' => ['khác biệt', 'đánh giá', 'review', 'nên chọn'],
                'tertiary' => ['vs', 'versus', 'hay']
            ],
            'spec_query' => [
                'primary' => ['thông số', 'cấu hình', 'spec', 'specification'],
                'secondary' => ['kỹ thuật', 'tính năng', 'đặc điểm', 'feature'],
                'tertiary' => ['camera', 'pin', 'ram', 'storage']
            ]
        ];

        // 3. TÍNH ĐIỂM VỚI TRỌNG SỐ
        $scores = [];
        foreach ($intents as $intent => $categories) {
            $score = 0;
            
            // Primary keywords (trọng số 3)
            foreach ($categories['primary'] as $keyword) {
                if ($this->fuzzyMatch($message, [$keyword])) {
                    $score += 3;
                }
            }
            
            // Secondary keywords (trọng số 2)
            foreach ($categories['secondary'] as $keyword) {
                if ($this->fuzzyMatch($message, [$keyword])) {
                    $score += 2;
                }
            }
            
            // Tertiary keywords (trọng số 1)
            foreach ($categories['tertiary'] as $keyword) {
                if ($this->fuzzyMatch($message, [$keyword])) {
                    $score += 1;
                }
            }
            
            $scores[$intent] = $score;
        }

        // 4. CONTEXT BONUS
        $this->addContextBonus($scores, $message, $originalMessage);

        // 5. ENTITY EXTRACTION BONUS
        $entities = $this->extractEntities($message);
        if (!empty($entities['brands'])) {
            $scores['product_query'] += 2;
            if (!empty($entities['price_indicators'])) {
                $scores['price_query'] += 2;
            }
        }

        // 6. TÌMAKNG INTENT CÓ ĐIỂM CAO NHẤT
        $maxScore = max($scores);
        if ($maxScore >= 2) { // Ngưỡng tối thiểu
            $topIntents = array_keys($scores, $maxScore);
            
            // Nếu có nhiều intent cùng điểm, ưu tiên theo thứ tự
            $priority = ['greeting', 'farewell', 'order_query', 'price_query', 
                        'product_query', 'voucher_query', 'comparison_query', 'spec_query', 'support_query'];
            
            foreach ($priority as $priorityIntent) {
                if (in_array($priorityIntent, $topIntents)) {
                    return $priorityIntent;
                }
            }
            
            return $topIntents[0];
        }

        // 7. FALLBACK TO AI nếu không chắc chắn
        if ($maxScore === 1) {
            return $this->analyzeIntentWithAI($originalMessage);
        }

        return 'general_query';
    }

    // Thêm các method hỗ trợ
    protected function addContextBonus(&$scores, $message, $originalMessage)
    {
        // Bonus cho các từ kết hợp
        if (Str::contains($message, 'giá') && preg_match('/(iphone|samsung|oppo|vivo)/', $message)) {
            $scores['price_query'] += 3;
        }
        
        if (Str::contains($message, 'so sánh') && preg_match('/(với|và|hay|vs)/', $message)) {
            $scores['comparison_query'] += 3;
        }

        if (preg_match('/(mã|code).*?(DH\d+|\d{6,})/', $originalMessage)) {
            $scores['order_query'] += 4;
        }

        // Bonus cho câu hỏi
        if (Str::contains($message, '?') || Str::startsWith($message, ['tại sao', 'làm sao', 'như thế nào'])) {
            foreach ($scores as $intent => $score) {
                if ($score > 0) {
                    $scores[$intent] += 1;
                }
            }
        }

        // Penalty cho các từ phủ định
        if (preg_match('/(không|chưa|chẳng|đừng)/', $message)) {
            foreach ($scores as $intent => $score) {
                $scores[$intent] = max(0, $score - 1);
            }
        }
    }

    protected function extractEntities($message)
    {
        $entities = [
            'brands' => [],
            'price_indicators' => [],
            'numbers' => []
        ];
        
        // Extract brands
        $brandPatterns = [
            'iphone' => '/(iphone|apple|ios)/i',
            'samsung' => '/(samsung|galaxy)/i',
            'oppo' => '/oppo/i',
            'vivo' => '/vivo/i',
            'xiaomi' => '/(xiaomi|redmi|mi)/i'
        ];
        
        foreach ($brandPatterns as $brand => $pattern) {
            if (preg_match($pattern, $message)) {
                $entities['brands'][] = $brand;
            }
        }
        
        // Extract price indicators
        if (preg_match_all('/(\d+)\s*(?:triệu|tr|million|k|nghìn)/', $message, $matches)) {
            $entities['price_indicators'] = $matches[1];
        }
        
        // Extract numbers
        if (preg_match_all('/\d+/', $message, $matches)) {
            $entities['numbers'] = $matches[0];
        }
        
        return $entities;
    }

    protected function fuzzyMatch($input, $keywords, $threshold = 0.8)
    {
        foreach ($keywords as $keyword) {
            // Exact match
            if (Str::contains($input, $keyword)) {
                return true;
            }
            
            // Fuzzy match for typos
            $words = explode(' ', $input);
            foreach ($words as $word) {
                if (strlen($word) > 2) {
                    $distance = levenshtein(strtolower($word), strtolower($keyword));
                    $similarity = 1 - ($distance / max(strlen($word), strlen($keyword)));
                    
                    if ($similarity >= $threshold) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // AI-based intent detection as fallback
    protected function analyzeIntentWithAI($message)
    {
        $prompt = "Phân tích intent của câu hỏi sau và trả về CHÍNH XÁC một trong các intent:
        - product_query: Hỏi về sản phẩm, điện thoại
        - price_query: Hỏi về giá cả, chi phí
        - order_query: Hỏi về đơn hàng, trạng thái
        - voucher_query: Hỏi về khuyến mãi, voucher
        - support_query: Hỏi về hỗ trợ, bảo hành
        - comparison_query: So sánh sản phẩm
        - spec_query: Hỏi về thông số kỹ thuật
        - greeting: Chào hỏi
        - farewell: Tạm biệt
        - general_query: Câu hỏi chung

        Câu hỏi: '$message'
        
        Chỉ trả về tên intent:";

        try {
            $result = $this->callOpenRouterAIWithCustomPrompt($prompt);
            $validIntents = ['product_query', 'price_query', 'order_query', 'voucher_query', 
                            'support_query', 'comparison_query', 'spec_query', 'greeting', 'farewell', 'general_query'];
            
            $cleanResult = trim(strtolower($result));
            if (in_array($cleanResult, $validIntents)) {
                return $cleanResult;
            }
        } catch (\Exception $e) {
            Log::error('AI Intent Analysis failed: ' . $e->getMessage());
        }

        return 'general_query';
    }

    protected function handleIntent($intent, $message, $userId = null)
    {
        // Handle greeting and farewell first
        if ($intent === 'greeting') {
            return 'Xin chào! 😊 Em là **DHMobile** - trợ lý tư vấn của anh/chị. Em có thể giúp anh/chị:\n\n📱 Tư vấn sản phẩm điện thoại\n💰 Kiểm tra giá cả và khuyến mãi\n📦 Theo dõi đơn hàng\n🎁 Xem voucher ưu đãi\n\nAnh/chị cần hỗ trợ gì ạ?';
        }
        
        if ($intent === 'farewell') {
            return 'Cảm ơn anh/chị đã tin tưởng **DHMobile**! 😊\n\nNếu cần hỗ trợ thêm, anh/chị cứ nhắn tin cho em bất cứ lúc nào nhé! Chúc anh/chị một ngày tốt lành! 🌸✨';
        }
        
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
        $model = config('services.openrouter.model');
        
        // Debug logging
        Log::info('OpenRouter API Config', [
            'api_key_present' => !empty($apiKey),
            'endpoint' => $endpoint,
            'model' => $model,
            'prompt_length' => strlen($prompt)
        ]);
        
        if (!$apiKey) {
            Log::error('OpenRouter API key not found');
            return 'Hệ thống hiện đang được bảo trì. Xin Quý Khách vui lòng quay lại sau khi bảo trì hoàn tất!';
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
        
        // Debug logging
        Log::info('OpenRouter AI Response', [
            'http_code' => $httpCode,
            'curl_error' => $err,
            'response_length' => strlen($result ?? ''),
            'raw_response' => substr($result ?? '', 0, 500) // First 500 chars
        ]);
        
        if ($err) {
            Log::error('cURL Error in OpenRouter AI', ['error' => $err]);
            return 'Xin lỗi, hiện tại mình chưa thể trả lời câu hỏi này. Bạn có thể hỏi lại theo cách khác hoặc liên hệ nhân viên để được hỗ trợ nhanh nhất nhé! 😊';
        }
        
        if ($httpCode >= 400) {
            Log::error('OpenRouter API HTTP Error', [
                'status_code' => $httpCode,
                'response' => $result
            ]);
            return 'Xin lỗi, hiện tại mình chưa thể trả lời câu hỏi này. Bạn có thể hỏi lại theo cách khác hoặc liên hệ nhân viên để được hỗ trợ nhanh nhất nhé! 😊';
        }
        
        if (!$result) {
            Log::error('OpenRouter API Empty Response');
            return 'Xin lỗi, hiện tại mình chưa thể trả lời câu hỏi này. Bạn có thể hỏi lại theo cách khác hoặc liên hệ nhân viên để được hỗ trợ nhanh nhất nhé! 😊';
        }
        
        $json = json_decode($result, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('OpenRouter API JSON Decode Error', [
                'json_error' => json_last_error_msg(),
                'raw_response' => $result
            ]);
            return 'Xin lỗi, hiện tại mình chưa thể trả lời câu hỏi này. Bạn có thể hỏi lại theo cách khác hoặc liên hệ nhân viên để được hỗ trợ nhanh nhất nhé! 😊';
        }
        
        Log::info('OpenRouter API Parsed Response', [
            'has_choices' => isset($json['choices']),
            'choices_count' => isset($json['choices']) ? count($json['choices']) : 0,
            'has_content' => isset($json['choices'][0]['message']['content']),
            'full_response' => $json
        ]);
        
        if (isset($json['choices'][0]['message']['content']) && trim($json['choices'][0]['message']['content']) !== '') {
            return $json['choices'][0]['message']['content'];
        }
        
        Log::warning('OpenRouter API No Valid Content', ['parsed_json' => $json]);
        return 'Xin lỗi, mình chưa có thông tin phù hợp cho câu hỏi này. Bạn có thể hỏi lại chi tiết hơn hoặc liên hệ nhân viên để được hỗ trợ nhé! 😊';
    }

    protected function callOpenRouterAI($message)
    {
        $apiKey = config('services.openrouter.api_key');
        $endpoint = config('services.openrouter.endpoint');
        $model = config('services.openrouter.model');
        if (!$apiKey) {
            return 'Hệ thống hiện đang được bảo trì. Xin Quý Khách vui lòng quay lại sau khi bảo trì hoàn tất!';
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

        $prompt = "Bạn là trợ lý tư vấn khách hàng DHMobile và tên của bạn cũng là DHMobile xưng hô anh/chị và bạn là em , hãy trả lời ngắn gọn, thân thiện, tập trung vào nhu cầu khách. Ưu tiên markdown, icon, không liệt kê máy móc hay những thứ không liên quan đến database, không nhắc đến cửa hàng khác. Kết thúc bằng một câu hỏi gợi mở.\n";
        $prompt .= $context;
        $prompt .= "\n\nCâu hỏi khách hàng: " . $message;

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
            ->get(['message', 'response', 'created_at']);
        return response()->json([
            'success' => true,
            'conversation' => $logs
        ]);
    }
}
