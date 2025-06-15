<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hóa Đơn Thanh Toán</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            font-family: 'Courier New', monospace;
        }
        .receipt-container {
            max-width: 400px;
            margin: 0 auto;
            background-color: white;
            padding: 15px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            border-radius: 5px;
            position: relative;
        }
        /* Tạo hiệu ứng giấy in nhiệt */
        .receipt-container::before {
            content: "";
            position: absolute;
            top: -5px;
            left: 0;
            right: 0;
            height: 5px;
            background: repeating-linear-gradient(
                45deg,
                #fff,
                #fff 5px,
                #f5f5f5 5px,
                #f5f5f5 10px
            );
        }
        .receipt-container::after {
            content: "";
            position: absolute;
            bottom: -5px;
            left: 0;
            right: 0;
            height: 5px;
            background: repeating-linear-gradient(
                45deg,
                #fff,
                #fff 5px,
                #f5f5f5 5px,
                #f5f5f5 10px
            );
        }
        .receipt-header {
            text-align: center;
            border-bottom: 1px dashed #ccc;
            padding-bottom: 15px;
            margin-bottom: 15px;
        }
        .logo {
            max-width: 120px;
            margin: 0 auto 10px;
            display: block;
        }
        .store-name {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 5px;
        }
        .store-info {
            font-size: 12px;
            margin-bottom: 3px;
        }
        .receipt-title {
            font-weight: bold;
            font-size: 14px;
            margin: 15px 0 5px;
            text-align: center;
        }
        .receipt-id {
            font-size: 13px;
            text-align: center;
            margin-bottom: 5px;
        }
        .receipt-date {
            font-size: 12px;
            text-align: center;
            margin-bottom: 10px;
        }
        .customer-info {
            font-size: 12px;
            margin-bottom: 15px;
        }
        .divider {
            border-bottom: 1px dashed #ccc;
            margin: 10px 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 12px;
        }
        .payment-info {
            margin: 15px 0;
        }
        .total-section {
            border-top: 1px dashed #ccc;
            margin-top: 10px;
            padding-top: 10px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            font-weight: bold;
        }
        .thank-you {
            text-align: center;
            margin: 20px 0 15px;
            font-size: 13px;
            font-weight: bold;
        }
        .barcode {
            text-align: center;
            margin: 15px 0;
        }
        .barcode img {
            max-width: 200px;
        }
        .footer {
            text-align: center;
            font-size: 11px;
            color: #666;
            margin-top: 15px;
        }
        .status-stamp {
            position: absolute;
            top: 70px;
            right: 20px;
            transform: rotate(-15deg);
            color: #28a745;
            border: 2px solid #28a745;
            padding: 5px 10px;
            font-size: 14px;
            font-weight: bold;
            border-radius: 5px;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="status-stamp">ĐÃ THANH TOÁN</div>

        <div class="receipt-header">
            <img src="https://res.cloudinary.com/dvxpjf2zb/image/upload/v1749461956/logo2_h0chgt.png" alt="DH Mobile Logo" class="logo">
            <div class="store-name">DH MOBILE STORE</div>
            <div class="store-info">Ngã Tư Hoà Bình, Tiên Cường, Tiên Lãng, Hải Phòng</div>
            <div class="store-info">Hotline: 1900 1234</div>
        </div>

        <div class="receipt-title">HÓA ĐƠN THANH TOÁN</div>
        <div class="receipt-id">Mã đơn hàng: #{{ $order->order_code }}</div>
        <div class="receipt-date">Ngày: {{ date('d/m/Y H:i:s') }}</div>

        <div class="divider"></div>

        <div class="customer-info">
            <div class="info-row">
                <span>Khách hàng:</span>
                <span>{{ $user->full_name }}</span>
            </div>
            <div class="info-row">
                <span>Email:</span>
                <span>{{ $user->email }}</span>
            </div>
        </div>

        <div class="divider"></div>

        <div class="payment-info">
            <div class="info-row">
                <span>Phương thức thanh toán:</span>
                <span>VNPAY</span>
            </div>
            <div class="info-row">
                <span>Trạng thái:</span>
                <span>{{ $order->payment_status }}</span>
            </div>
        </div>

        <div class="total-section">
            <div class="total-row">
                <span>TỔNG TIỀN:</span>
                <span>{{ number_format($order->total_amount) }} VND</span>
            </div>
        </div>

        <div class="thank-you">
            Cảm ơn quý khách đã mua hàng!
        </div>

        <div class="barcode">
            <img src="https://barcode.tec-it.com/barcode.ashx?data={{ $order->order_id }}&code=Code128&multiplebarcodes=false&translate-esc=false&unit=Fit&dpi=96&imagetype=Gif&rotation=0&color=%23000000&bgcolor=%23ffffff&codepage=Default&qunit=Mm&quiet=0" alt="Barcode">
        </div>

        <div class="divider"></div>

        <div class="footer">
            <p>Mọi thắc mắc xin liên hệ: support@dhmobile.com</p>
            <p>Hotline: 1900 1234</p>
            <p>© {{ date('Y') }} DH Mobile</p>
        </div>
    </div>
</body>
</html>
