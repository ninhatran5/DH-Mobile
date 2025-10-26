<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title></title>
</head>

<body
    style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; color: #333333; padding: 30px; margin: 0;">
    <div
        style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05); border: 1px solid #e0e0e0;">
        <h2 style="color: #e74c3c; margin-top: 0;">Xin chào {{ $order->customer }},</h2>

        <p style="font-size: 16px; line-height: 1.6; margin: 10px 0;">
            Đơn hàng <span style="font-weight: bold; color: #2980b9;">#{{ $order->order_code }}</span> của bạn đã bị
            <strong>quản trị viên hủy</strong>.
        </p>

        <div
            style="background-color: #fce4e4; border-left: 5px solid #e74c3c; padding: 15px; margin: 20px 0; font-style: italic; border-radius: 5px; font-size: 16px; line-height: 1.6;">
            <strong>Lý do:</strong> {{ $reason }}
        </div>

        <p style="font-size: 16px; line-height: 1.6; margin: 10px 0;">
            Chúng tôi xin lỗi vì sự bất tiện này.
        </p>

        <p style="margin-top: 30px; font-size: 14px; color: #888888;">
            Trân trọng,<br>
            Đội ngũ hỗ trợ
        </p>
    </div>
</body>

</html>
