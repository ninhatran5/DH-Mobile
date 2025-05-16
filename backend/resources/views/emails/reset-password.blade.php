<h2>Chào {{ $user->full_name }},</h2>
<p>Bạn vừa yêu cầu đặt lại mật khẩu. Vui lòng nhấn vào nút bên dưới để tiếp tục:</p>
<a href="{{ url('/reset-password?token=' . $token) }}" style="padding: 10px 20px; background: #3490dc; color: white; text-decoration: none;">Đặt lại mật khẩu</a>
<p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
