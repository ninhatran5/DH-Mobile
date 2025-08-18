<!DOCTYPE html>
<html>
<head>
    <title>Rút Tiền Thành Công</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .email-header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .email-body {
            padding: 20px;
            color: #333333;
        }
        .email-footer {
            background-color: #f4f4f4;
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #777777;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>Rút Tiền Thành Công</h1>
        </div>
        <div class="email-body">
            <p>Xin chào {{ $withdraw->user->name }},</p>
            <p>Chúng tôi vui mừng thông báo rằng yêu cầu rút tiền của bạn đã được xử lý thành công.</p>
            <p><strong>Mã giao dịch:</strong> {{ $withdraw->transaction_id }}</p>
            <p><strong>Số tiền:</strong> {{ number_format($withdraw->amount, 0, ",", ".") }} {{ $withdraw->currency }}</p>
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.</p>
            <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
        </div>
        <div class="email-footer">
            <p>&copy; {{ date('Y') }} DHMobile. Bảo lưu mọi quyền.</p>
        </div>
    </div>
</body>
</html>