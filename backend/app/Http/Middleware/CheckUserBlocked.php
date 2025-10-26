<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserBlocked
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Kiểm tra nếu tài khoản bị khóa
        if ($user && $user->is_blocked) {
            return response()->json([
                'message' => 'Tài khoản của bạn đã bị khóa.'
            ], 403);
        }

        return $next($request);
    }
}
