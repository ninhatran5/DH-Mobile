<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title></title>
</head>

<body>
    <h2>Xin chào {{ $order->customer }},</h2>
    <p>Đơn hàng <strong>#{{ $order->order_code }}</strong> của bạn đã được cập nhật trạng thái:</p>
    <p><strong>{{ $newStatus }}</strong></p>
    <p>Vui lòng kiểm tra chi tiết đơn hàng trên hệ thống hoặc liên hệ với chúng tôi nếu bạn cần hỗ trợ thêm.</p>
    <p>Trân trọng,<br>Đội ngũ hỗ trợ khách hàng</p>

</body>

</html>
