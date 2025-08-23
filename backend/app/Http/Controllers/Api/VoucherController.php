<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Voucher;
use App\Models\User_vouchers;
use Illuminate\Support\Facades\DB;

class VoucherController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/voucher$voucher",
     *     summary="Lấy danh sách tất cả vorcher",
     *     tags={"Vorcher"},
     *     @OA\Response(response=200, description="Lấy danh sách vorcher thành công")
     * )
     */
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Lấy user nếu có token, không có thì null
        $userId = auth('sanctum')->user()?->user_id;

        $query = Voucher::query();

        if ($userId) {
            $query->leftJoin('user_vouchers', function ($join) use ($userId) {
                $join->on('vouchers.voucher_id', '=', 'user_vouchers.voucher_id')
                    ->where('user_vouchers.user_id', '=', $userId);
            })
                ->addSelect(
                    'vouchers.*',
                    DB::raw('CASE WHEN user_vouchers.user_voucher_id IS NOT NULL THEN 1 ELSE 0 END AS is_saved')
                );
        } else {
            $query->addSelect(
                'vouchers.*',
                DB::raw('0 AS is_saved')
            );
        }

        // Lọc trạng thái
        if ($request->has('is_active')) {
            $query->where('vouchers.is_active', $request->input('is_active'));
        }

        // Soft delete filter
        if ($request->input('trashed') === 'only') {
            $query->onlyTrashed();
        } elseif ($request->input('trashed') === 'with') {
            $query->withTrashed();
        }

        $voucher = $query->orderBy('vouchers.created_at', 'desc')->paginate(10);

        // Format discount_amount
        $voucher->getCollection()->transform(function ($item) {
            $item->discount_amount = number_format($item->discount_amount, 0, '.', '');
            return $item;
        });

        return response()->json([
            'message' => 'Lấy danh sách voucher thành công',
            'data' => $voucher->items(),
            'meta' => [
                'current_page' => $voucher->currentPage(),
                'last_page' => $voucher->lastPage(),
                'per_page' => $voucher->perPage(),
                'total' => $voucher->total(),
            ],
            'status' => 200
        ], 200);
    }
    /**
     * @OA\Post(
     *     path="/api/voucher",
     *     summary="Tạo mới một voucher",
     *     tags={"voucher"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"code","discount_amount","min_order_value","start_date","end_date"},
     *             @OA\Property(property="code", type="string", maxLength=50),
     *             @OA\Property(property="discount_amount", type="number"),
     *             @OA\Property(property="min_order_value", type="integer"),
     *             @OA\Property(property="start_date", type="string", format="date"),
     *             @OA\Property(property="end_date", type="string", format="date"),
     *             @OA\Property(property="is_active", type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Tạo voucher thành công"),
     *     @OA\Response(response=422, description="Lỗi xác thực")
     * )
     */
    /**
     * Store a newly created resource in storage.
     */
public function store(Request $request)
{
    $messages = [
        'min_order_value.gt' => 'Giá trị đơn tối thiểu phải lớn hơn số tiền giảm.',
    ];

    $validated = $request->validate([
        'code' => 'required|string|max:150|min:10|unique:vouchers,code',
        'title' => 'required|string|min:5|max:255',
        'discount_amount' => 'required|numeric|min:0',
        'quantity' => 'required|integer|min:0|max:255',
        'min_order_value' => 'required|integer|gt:discount_amount', // ✅ rule Laravel
        'start_date' => 'required|date',
        'end_date' => 'required|date|after_or_equal:start_date',
        'is_active' => 'boolean',
    ], $messages);

    // ✅ Double check để đảm bảo chắc chắn
    if ($validated['min_order_value'] <= $validated['discount_amount']) {
        return response()->json([
            'message' => 'Giá trị đơn tối thiểu phải lớn hơn số tiền giảm (kiểm tra bổ sung).'
        ], 422);
    }

    $voucher = Voucher::create($validated);

    return response()->json([
        'message' => 'Tạo voucher thành công',
        'data' => $voucher
    ])->setStatusCode(201, 'Created');
}

    /**
     * @OA\Get(
     *     path="/api/voucher/{id}",
     *     summary="Lấy thông tin một voucher theo id",
     *     tags={"voucher"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Lấy voucher thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $voucher = Voucher::find($id);

        // Định dạng discount_amount
        if ($voucher) {
            $voucher->discount_amount = number_format($voucher->discount_amount, 0, '.', '');
        }

        return response()->json([
            'message' => 'Lấy voucher thành công',
            'data' => $voucher
        ])->setStatusCode(200, 'OK',);
    }

    /**
     * @OA\Put(
     *     path="/api/voucher/{id}",
     *     summary="Cập nhật thông tin một voucher",
     *     tags={"voucher"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="code", type="string", maxLength=50),
     *             @OA\Property(property="discount_amount", type="number"),
     *             @OA\Property(property="min_order_value", type="integer"),
     *             @OA\Property(property="start_date", type="string", format="date"),
     *             @OA\Property(property="end_date", type="string", format="date"),
     *             @OA\Property(property="is_active", type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Cập nhật voucher thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy"),
     *     @OA\Response(response=422, description="Lỗi xác thực")
     * )
     */
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $voucher = Voucher::findOrFail($id);
        $validated = $request->validate([
            'code' => 'string|max:150|min:10|unique:vouchers,code,' . $id . ',voucher_id',
            'title' => 'string|min:5|max:255',
            'discount_amount' => 'numeric',
            'min_order_value' => 'integer',
            'quantity' => 'required|integer|min:0|max:255',
            'start_date' => 'date',
            'end_date' => 'date|after_or_equal:start_date',
            'is_active' => 'boolean',
        ]);
        $voucher->update($validated);
        return response()->json([
            'message' => 'Cập nhật voucher thành công',
            'data' => $voucher
        ])->setStatusCode(200, 'OK',);
    }

    /**
     * @OA\Delete(
     *     path="/api/voucher/{id}",
     *     summary="Xóa mềm một voucher",
     *     tags={"voucher"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Xóa voucher thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $voucher = Voucher::find($id);
        if (!$voucher) {
            # code...
            return response()->json([
                'message' => 'Voucher không tồn tại',
                'status' => 404,
            ])->setStatusCode(404, 'Not Found');
        }
        $voucher->delete();
        return response()->json([
            'message' => 'Đã bỏ vào thùng rác thành công',
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }

    /**
     * @OA\Get(
     *     path="/api/voucher$voucher/trashed",
     *     summary="Lấy danh sách các voucher$voucher đã bị xóa mềm",
     *     tags={"voucher$voucher"},
     *     @OA\Response(response=200, description="Lấy danh sách voucher$voucher đã xóa thành công")
     * )
     */
    public function trashed()
    {
        $voucher = Voucher::onlyTrashed()->get();
        return response()->json([
            'message' => 'Lấy danh sách voucher đã xóa thành công',
            'data' => $voucher
        ])->setStatusCode(200, 'OK',);
    }

    /**
     * @OA\Put(
     *     path="/api/voucher$voucher/restore/{id}",
     *     summary="Khôi phục một voucher$voucher đã bị xóa mềm",
     *     tags={"voucher$voucher"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Khôi phục voucher$voucher thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    public function restore($id)
    {
        $voucher = Voucher::withTrashed()->find($id);
        if (!$voucher) {
            return response()->json([
                'message' => 'voucher$voucher không tồn tại',
                'status' => 404,
            ])->setStatusCode(404, 'Not Found');
        }
        $voucher->restore();
        return response()->json([
            'massage' => 'Khôi phục voucher thành công',
            'data' => $voucher
        ])->setStatusCode(200, 'OK',);
    }
    /**
     * @OA\Delete(
     *     path="/api/voucher$voucher/force-delete/{id}",
     *     summary="Xóa vĩnh viễn voucher$voucher đã xóa mềm",
     *     tags={"voucher$voucher"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Xóa vĩnh viễn thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    public function forceDelete($id)
    {
        $voucher = Voucher::withTrashed()->find($id);
        if (!$voucher) {
            return response()->json([
                'message' => 'voucher không tồn tại',
            ], 404);
        }

        // Chỉ cho phép xóa vĩnh viễn nếu đã bị xóa mềm (đã vào thùng rác)
        if (is_null($voucher->deleted_at)) {
            return response()->json([
                'message' => 'Bạn phải bỏ voucher vào thùng rác trước khi xóa vĩnh viễn',
            ], 400);
        }

        $voucher->forceDelete();
        return response()->json([
            'message' => 'Xóa voucher vĩnh viễn thành công',
            'data' => $voucher
        ])->setStatusCode(200, 'OK');
    }

    // lưu voucher 
    public function saveVoucherForUser(Request $request, $voucher_id)
    {
        $user = $request->user();

        // 1. Kiểm tra voucher có tồn tại, còn hiệu lực và còn số lượng
        $voucher = Voucher::where('voucher_id', $voucher_id)
            ->where('is_active', 1)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->where('quantity', '>', 0)
            ->first();

        if (!$voucher) {
            return response()->json([
                'message' => 'Voucher không hợp lệ, đã hết hạn hoặc hết số lượng'
            ], 404);
        }

        // 2. Kiểm tra user đã lưu voucher này chưa
        $exists = User_vouchers::where('user_id', $user->user_id)
            ->where('voucher_id', $voucher_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Bạn đã lưu voucher này rồi'
            ], 409);
        }

        // 3. Lưu voucher và giảm số lượng
        $userVoucher = DB::transaction(function () use ($user, $voucher_id, $voucher) {
            $saved = User_vouchers::create([
                'user_id' => $user->user_id,
                'voucher_id' => $voucher_id,
                'is_used' => 0,
            ]);

            $voucher->decrement('quantity');

            $saved->load('voucher');

            return $saved;
        });

        return response()->json([
            'message' => 'Lưu voucher thành công',
            'data' => $userVoucher
        ], 201);
    }


    // lấy danh sách voucher đã lưu
    public function getSavedVouchersForUser(Request $request)
    {
        $user = $request->user();

        $savedVouchers = User_vouchers::where('user_id', $user->user_id)
            ->whereNull('used_at')
            ->with('voucher')
            ->get()
            ->map(function ($item) {
                $voucher = $item->voucher;
                $item->quantity = 1;

                // Tuỳ chọn: thêm thông tin chi tiết về loại giảm giá
                $item->discount_type = $voucher->discount_type;
                $item->discount_amount = $voucher->discount_amount;
                $item->max_discount = $voucher->max_discount;

                return $item;
            });

        return response()->json([
            'message' => 'Lấy danh sách voucher đã lưu thành công',
            'data' => $savedVouchers
        ], 200);
    }
}
