<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;

class PercentVoucherController extends Controller
{
    public function index()
    {
        $vouchers = Voucher::where('discount_type', 'percent')
            ->where('is_active', 1)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'message' => 'Lấy danh sách voucher phần trăm thành công',
            'data' => $vouchers,
            'meta' => [
                'current_page' => $vouchers->currentPage(),
                'last_page' => $vouchers->lastPage(),
                'per_page' => $vouchers->perPage(),
                'total' => $vouchers->total(),
            ]
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:vouchers,code',
            'title' => 'required|string|max:100',
            'discount_amount' => 'required|numeric|min:1|max:100', // phần trăm
            'max_discount' => 'required|numeric|min:1000',
            'min_order_value' => 'required|integer|min:0',
            'quantity' => 'required|integer|min:1',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_active' => 'boolean'
        ]);

        $voucher = Voucher::create([
            ...$validated,
            'discount_type' => 'percent',
        ]);

        return response()->json([
            'message' => 'Tạo voucher phần trăm thành công',
            'data' => $voucher
        ], 201);
    }

    public function show($id)
    {
        $voucher = Voucher::where('discount_type', 'percent')->find($id);

        if (!$voucher) {
            return response()->json([
                'message' => 'Voucher phần trăm không tồn tại'
            ], 200);
        }

        return response()->json([
            'message' => 'Lấy chi tiết voucher phần trăm thành công',
            'data' => $voucher
        ]);
    }

    public function update(Request $request, $id)
    {
        $voucher = Voucher::where('discount_type', 'percent')->find($id);

        if (!$voucher) {
            return response()->json([
                'message' => 'Voucher phần trăm không tồn tại'
            ], 200);
        }

        $validated = $request->validate([
            'code' => 'string|max:50|unique:vouchers,code,' . $id . ',voucher_id',
            'title' => 'string|max:100',
            'discount_amount' => 'numeric|min:1|max:100',
            'max_discount' => 'numeric|min:1000',
            'min_order_value' => 'integer|min:0',
            'quantity' => 'integer|min:1',
            'start_date' => 'date',
            'end_date' => 'date|after_or_equal:start_date',
            'is_active' => 'boolean'
        ]);

        $voucher->update($validated);

        return response()->json([
            'message' => 'Cập nhật voucher phần trăm thành công',
            'data' => $voucher
        ]);
    }

    public function destroy($id)
    {
        $voucher = Voucher::where('discount_type', 'percent')->find($id);

        if (!$voucher) {
            return response()->json([
                'message' => 'Voucher phần trăm không tồn tại'
            ], 200);
        }

        $voucher->delete();

        return response()->json([
            'message' => 'Đã xóa mềm voucher phần trăm thành công',
        ]);
    }

    public function trashed()
    {
        $vouchers = Voucher::onlyTrashed()
            ->where('discount_type', 'percent')
            ->get();

        return response()->json([
            'message' => 'Danh sách voucher phần trăm đã xóa mềm',
            'data' => $vouchers
        ]);
    }

    public function restore($id)
    {
        $voucher = Voucher::withTrashed()
            ->where('discount_type', 'percent')
            ->find($id);

        if (!$voucher) {
            return response()->json([
                'message' => 'Voucher phần trăm không tồn tại'
            ], 200);
        }

        if (!$voucher->trashed()) {
            return response()->json([
                'message' => 'Voucher phần trăm chưa bị xóa'
            ], 200);
        }

        $voucher->restore();

        return response()->json([
            'message' => 'Khôi phục voucher phần trăm thành công',
            'data' => $voucher
        ]);
    }

    public function forceDelete($id)
    {
        $voucher = Voucher::withTrashed()
            ->where('discount_type', 'percent')
            ->find($id);

        if (!$voucher) {
            return response()->json([
                'message' => 'Voucher phần trăm không tồn tại'
            ],200);
        }

        if (is_null($voucher->deleted_at)) {
            return response()->json([
                'message' => 'Bạn cần xóa mềm trước khi xóa vĩnh viễn'
            ], 200);
        }

        $voucher->forceDelete();

        return response()->json([
            'message' => 'Đã xóa vĩnh viễn voucher phần trăm thành công'
        ]);
    }
}
