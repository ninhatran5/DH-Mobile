<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <title>Thông báo đơn hàng</title>
</head>

<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333333; margin-top: 0;">Xin chào {{ $order->customer }},</h2>
        <p style="font-size: 16px; color: #555555;">Đơn hàng <strong>#{{ $order->order_code }}</strong> của bạn đã được cập nhật trạng thái:</p>
        <p style="font-size: 16px; color: #007BFF; font-weight: bold;">{{ $newStatus }}</p>
        <p style="font-size: 16px; color: #555555;">Vui lòng kiểm tra chi tiết đơn hàng trên hệ thống hoặc liên hệ với chúng tôi nếu bạn cần hỗ trợ thêm.</p>
        <p style="font-size: 14px; color: #999999; margin-top: 30px;">Trân trọng,<br>Đội ngũ hỗ trợ khách hàng</p>
    </div>
</body>

</html>
