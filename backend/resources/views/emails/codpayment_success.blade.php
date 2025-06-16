<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Hóa Đơn Thanh Toán</title>
</head>
<body style="margin:0; padding:20px; background-color:#f5f5f5; font-family:'Courier New', monospace;">
    <div style="max-width:400px; margin:0 auto; background-color:white; padding:15px; box-shadow:0 2px 5px rgba(0,0,0,0.1); border-radius:5px; position:relative;">
        <div style="position:absolute; top:70px; right:20px; transform:rotate(-15deg); color:#fc1c1c; border:2px solid #fc1c1c; padding:5px 10px; font-size:14px; font-weight:bold; border-radius:5px; opacity:0.8;">CHƯA THANH TOÁN</div>

        <div style="text-align:center; border-bottom:1px dashed #ccc; padding-bottom:15px; margin-bottom:15px;">
            <img src="https://res.cloudinary.com/dvxpjf2zb/image/upload/v1749461956/logo2_h0chgt.png" alt="DH Mobile Logo" style="max-width:120px; margin:0 auto 10px; display:block;">
            <div style="font-weight:bold; font-size:16px; margin-bottom:5px;">DH MOBILE STORE</div>
            <div style="font-size:12px; margin-bottom:3px;">Ngã Tư Hoà Bình, Tiên Cường, Tiên Lãng, Hải Phòng</div>
            <div style="font-size:12px; margin-bottom:3px;">Hotline: 1900 1234</div>
        </div>

        <div style="font-weight:bold; font-size:14px; margin:15px 0 5px; text-align:center;">HÓA ĐƠN THANH TOÁN</div>
        <div style="font-size:13px; text-align:center; margin-bottom:5px;">Mã đơn hàng: #{{ $order->order_code }}</div>
        <div style="font-size:12px; text-align:center; margin-bottom:10px;">Ngày: {{ date('d/m/Y H:i:s') }}</div>

        <div style="border-bottom:1px dashed #ccc; margin:10px 0;"></div>

        <div style="font-size:12px; margin-bottom:15px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <span>Khách hàng:</span>
                <span>{{ $user->full_name }}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <span>Email:</span>
                <span>{{ $user->email }}</span>
            </div>
        </div>

        <div style="border-bottom:1px dashed #ccc; margin:10px 0;"></div>

        <div style="margin:15px 0;">
            <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:12px;">
                <span>Phương thức thanh toán:</span>
                <span>COD</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:12px;">
                <span>Trạng thái:</span>
                <span>{{ $order->payment_status }}</span>
            </div>
        </div>

        <div style="border-top:1px dashed #ccc; margin-top:10px; padding-top:10px;">
            <div style="display:flex; justify-content:space-between; font-size:14px; font-weight:bold;">
                <span>TỔNG TIỀN PHẢI THANH TOÁN:</span>
                <span>{{ number_format($order->total_amount) }} VND</span>
            </div>
        </div>

        <div style="text-align:center; margin:20px 0 15px; font-size:13px; font-weight:bold;">
            Cảm ơn quý khách đã mua hàng!
        </div>

        <div style="text-align:center; margin:15px 0;">
            <img src="https://barcode.tec-it.com/barcode.ashx?data={{ $order->order_id }}&code=Code128&multiplebarcodes=false&translate-esc=false&unit=Fit&dpi=96&imagetype=Gif&rotation=0&color=%23000000&bgcolor=%23ffffff&codepage=Default&qunit=Mm&quiet=0" alt="Barcode" style="max-width:200px;">
        </div>

        <div style="border-bottom:1px dashed #ccc; margin:10px 0;"></div>

        <div style="text-align:center; font-size:11px; color:#666; margin-top:15px;">
            <p>Mọi thắc mắc xin liên hệ: support@dhmobile.com</p>
            <p>Hotline: 1900 1234</p>
            <p>© {{ date('Y') }} DH Mobile</p>
        </div>
    </div>
</body>
</html>
