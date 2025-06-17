@php
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
@endphp
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hóa Đơn Thanh Toán</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Courier New', monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;width:100%;background-color:#ffffff;padding:25px;border:1px solid #ddd;">
          <tr>
            <td align="center" style="border-bottom:1px dashed #ccc;padding-bottom:20px;">
              <img src="https://res.cloudinary.com/dvxpjf2zb/image/upload/v1749461956/logo2_h0chgt.png" alt="DH Mobile Logo" style="max-width:130px;margin-bottom:15px;width:100%;height:auto;">
              <div style="font-weight:bold;font-size:18px;margin-bottom:6px;">DH MOBILE STORE</div>
              <div style="font-size:13px;margin-bottom:4px;">Ngã Tư Hoà Bình, Tiên Cường, Tiên Lãng, Hải Phòng</div>
              <div style="font-size:13px;">Hotline: 1900 1234</div>
            </td>
          </tr>

          <tr><td style="padding-top:18px;padding-bottom:8px;text-align:center;font-size:16px;font-weight:bold;">HÓA ĐƠN THANH TOÁN</td></tr>
          <tr><td style="text-align:center;font-size:14px;margin-bottom:6px;">Mã đơn hàng: #{{ $order->order_code ?? 'N/A' }}</td></tr>
          <tr><td style="text-align:center;font-size:14px;padding-bottom:18px;">Ngày: {{ Carbon::now()->setTimezone('Asia/Ho_Chi_Minh')->format('d/m/Y H:i:s') }}</td></tr>

          <tr><td style="border-bottom:1px dashed #ccc;margin-bottom:18px;"></td></tr>

          <tr>
            <td style="padding-top:18px;padding-bottom:8px;font-size:14px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:7px 0;width:30%;">Khách hàng:</td>
                <td align="right" style="padding:7px 0;width:70%;">{{ $user->full_name ?? 'N/A' }}</td>
              </tr>
              <tr>
                <td style="padding:7px 0;width:30%;">Email:</td>
                <td align="right" style="padding:7px 0;width:70%;">{{ $user->email ?? 'N/A' }}</td>
              </tr>
              <tr>
                <td style="padding:7px 0;width:30%;">Địa chỉ nhận hàng:</td>
                <td align="right" style="padding:7px 0;width:70%;">{{ $user->address ?? '' }}{{ !empty($user->ward) ? ', '.$user->ward : '' }}{{ !empty($user->district) ? ', '.$user->district : '' }}{{ !empty($user->city) ? ', '.$user->city : '' }}</td>
              </tr>
              <tr>
                <td style="padding:7px 0;width:30%;">Số điện thoại:</td>
                <td align="right" style="padding:7px 0 12px;width:70%;">{{ $user->phone ?? 'N/A' }}</td>
              </tr>
            </table>
          </td>
          </tr>

          <tr>
            <td style="border-bottom:1px dashed #ccc;padding-top:10px;margin-bottom:18px;"></td></tr>

          <tr><td style="padding-top:18px;padding-bottom:8px;font-size:14px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              @php
              $paymentMethod = DB::table('payment_methods')
                ->where('method_id', $order->method_id)
                ->first();
              @endphp
              <tr>
                <td style="padding:7px 0;width:30%;">Phương thức thanh toán:</td>
                <td align="right" style="padding:7px 0;width:70%;"> {{ $paymentMethod->name ?? 'N/A' }}</td>
              </tr>
              <tr>
                <td style="padding:7px 0;width:30%;">Trạng thái thanh toán:</td>
                <td align="right" style="padding:7px 0;width:70%;"> {{ $order->payment_status ?? 'N/A' }}</td>
              </tr>
              <tr>
                <td style="padding:7px 0 12px;width:30%;">Trạng thái đơn hàng:</td>
                <td align="right" style="padding:7px 0 12px;width:70%;"> {{ $order->status ?? 'N/A' }}</td>
              </tr>
            </table>
          </td></tr>

          <!-- Thông tin sản phẩm -->
          <tr><td style="padding-top:12px;font-size:14px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px dashed #ccc;padding-top:15px;">
              <tr>
                <td colspan="4" style="padding:8px 0;font-weight:bold;text-align:center;font-size:15px;margin-bottom:12px;">Chi tiết sản phẩm</td>
              </tr>
              <tr>
                <td style="padding:10px 0 7px;font-weight:bold;width:45%;">Sản phẩm</td>
                <td style="text-align:center;padding:10px 0 7px;font-weight:bold;width:10%;">SL</td>
                <td style="text-align:right;padding:10px 0 7px;font-weight:bold;width:20%;">Đơn giá</td>
                <td style="text-align:right;padding:10px 0 7px;font-weight:bold;width:25%;">Thành tiền</td>
              </tr>
              @php
                $orderItems = DB::table('order_items')
                  ->join('products', 'order_items.product_id', '=', 'products.product_id')
                  ->where('order_items.order_id', $order->order_id)
                  ->select('order_items.*', 'products.name as product_name')
                  ->get();
              @endphp
              @foreach($orderItems as $item)
              <tr>
                <td style="padding:8px 0;width:35%;">
                  {{ $item->product_name }}
                  @php
                    $variantAttributes = DB::table('variant_attribute_values')
                      ->join('attribute_values', 'variant_attribute_values.value_id', '=', 'attribute_values.value_id')
                      ->join('attributes', 'attribute_values.attribute_id', '=', 'attributes.attribute_id')
                      ->where('variant_attribute_values.variant_id', $item->variant_id)
                      ->select('attributes.name as attribute_name', 'attribute_values.value')
                      ->get();
                  @endphp
                  @if(count($variantAttributes) > 0)
                    <span style="font-size:12px;color:#666;display:block;margin-top:4px;">
                      @foreach($variantAttributes as $attr)
                        {{ $attr->attribute_name }}: {{ $attr->value }}@if(!$loop->last), @endif
                      @endforeach
                    </span>
                  @endif
                </td>
                <td style="text-align:center;padding:8px 0;width:5%;font-size:10px">x{{ $item->quantity }}</td>
                <td style="text-align:right;padding:8px 0;width:25%;font-size:10px">{{ number_format($item->price) }} VND</td>
                <td style="text-align:right;padding:8px 0;width:25%;font-size:10px">{{ number_format($item->price * $item->quantity) }} VND</td>
              </tr>
              @endforeach
            </table>
          </td></tr>

          <tr><td style="border-top:1px dashed #ccc;padding-top:15px;margin-top:12px;"></td></tr>

          <tr><td style="font-size:15px;font-weight:bold;padding-top:12px;margin-bottom:15px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:8px 0;width:70%;">TỔNG TIỀN:</td>
                <td align="right" style="padding:8px 0;width:30%;">{{ number_format($order->total_amount ?? 0) }} VND</td>
              </tr>
            </table>
          </td></tr>

          <tr><td style="text-align:center;padding:25px 0 15px;font-size:15px;font-weight:bold;">Cảm ơn quý khách đã mua hàng!</td></tr>

          <tr><td style="border-bottom:1px dashed #ccc;margin-bottom:15px;"></td></tr>

          <tr><td style="text-align:center;font-size:13px;color:#666;padding-top:20px;">
            <p style="margin:8px 0;">Mọi thắc mắc xin liên hệ: support@dhmobile.com</p>
            <p style="margin:8px 0;">Hotline: 1900 1234</p>
            <p style="margin:8px 0;">&copy; {{ date('Y') }} DH Mobile</p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
