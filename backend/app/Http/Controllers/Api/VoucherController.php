<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Voucher;

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
    public function index()
    {
        $voucher = Voucher::all();
        return response()->json([
            'message' => 'lấy danh sách voucher thành công',
            'data' => $voucher
        ])->setStatusCode(200, 'OK',);
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
        $validated = $request->validate([
            'code' => 'required|string|max:150|min:10|unique:vouchers,code',
            'title' => 'required|string|min:5|max:255',
            'discount_amount' => 'required|numeric',
            'min_order_value' => 'required|integer',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_active' => 'boolean',
        ]);
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
            ]);
        }
        $voucher->forceDelete();
        return response()->json([
            'massage' => 'Xóa voucher vĩnh viễn thành công',
            'data' => $voucher
        ])->setStatusCode(200, 'OK',);
    }
}
