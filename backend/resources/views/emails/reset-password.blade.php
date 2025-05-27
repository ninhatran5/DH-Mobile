<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9f9f9; border-radius: 8px; border: 1px solid #e0e0e0;">
    <!-- Logo -->
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="frontend/src/assets/images/logo2.png" alt="Logo" style="max-width: 150px;">
    </div>

    <!-- Greeting -->
    <h2 style="color: #333; text-align: center;">👋 Chào {{ $user->full_name }},</h2>

    <!-- Message -->
    <p style="font-size: 16px; color: #555; text-align: center;">
        Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản của mình. Vui lòng nhấn vào nút bên dưới để tiếp tục:
    </p>

    <!-- Button -->
    <div style="text-align: center; margin: 30px 0;">
        {{-- <a href="{{ url('/change-password?token=' . $token) }}" --}}
        <a href="http://localhost:5173/change-password?token={{ $token }}&email={{ urlencode($user->email) }}"

           style="display: inline-block; background-color: #3490dc; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            🔐 Đặt lại mật khẩu
        </a>
    </div>

    <!-- Notice -->
    <p style="font-size: 14px; color: #999; text-align: center;">
        Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ quản trị viên.
    </p>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">

    <!-- Footer -->
    <p style="font-size: 12px; color: #bbb; text-align: center;">
        © {{ date('Y') }} YourAppName. Mọi quyền được bảo lưu.
    </p>
</div>

<!-- Responsive styling for small screens -->
<style>
@media only screen and (max-width: 600px) {
    div[style*="max-width: 600px"] {
        padding: 10px !important;
    }
    a[style*="padding: 12px 24px"] {
        padding: 10px 20px !important;
        font-size: 16px !important;
    }
}
</style>
