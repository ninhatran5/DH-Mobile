<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Vorcher;

class VorcherController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/vorchers",
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
        $vorcher = Vorcher::all();
        return response()->json([
            'message' => 'lấy danh sách vorcher thành công',
            'data' => $vorcher
        ])->setStatusCode(200, 'OK',);
    }

    /**
     * @OA\Post(
     *     path="/api/vorchers",
     *     summary="Tạo mới một vorcher",
     *     tags={"Vorcher"},
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
     *     @OA\Response(response=201, description="Tạo vorcher thành công"),
     *     @OA\Response(response=422, description="Lỗi xác thực")
     * )
     */
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:vorcher,code',
            'discount_amount' => 'required|numeric',
            'min_order_value' => 'required|integer',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_active' => 'boolean',
        ]);
        $vorcher = Vorcher::create($validated);
        return response()->json([
            'message' => 'Tạo vorcher thành công',
            'data' => $vorcher
        ])->setStatusCode(201, 'Created');
    }

    /**
     * @OA\Get(
     *     path="/api/vorchers/{id}",
     *     summary="Lấy thông tin một vorcher theo id",
     *     tags={"Vorcher"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Lấy vorcher thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $vorcher = Vorcher::find($id);
        return response()->json([
            'message' => 'Lấy voucher thành công',
            'data' => $vorcher
        ])->setStatusCode(200, 'OK',);
    }

    /**
     * @OA\Put(
     *     path="/api/vorchers/{id}",
     *     summary="Cập nhật thông tin một vorcher",
     *     tags={"Vorcher"},
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
     *     @OA\Response(response=200, description="Cập nhật vorcher thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy"),
     *     @OA\Response(response=422, description="Lỗi xác thực")
     * )
     */
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $vorcher = Vorcher::findOrFail($id);
        $validated = $request->validate([
            'code' => 'string|max:50|unique:vorcher,code,' . $id . ',voucher_id',
            'discount_amount' => 'numeric',
            'min_order_value' => 'integer',
            'start_date' => 'date',
            'end_date' => 'date|after_or_equal:start_date',
            'is_active' => 'boolean',
        ]);
        $vorcher->update($validated);
        return response()->json([
            'message' => 'Cập nhật voucher thành công',
            'data' => $vorcher
        ])->setStatusCode(200, 'OK',);
    }

    /**
     * @OA\Delete(
     *     path="/api/vorchers/{id}",
     *     summary="Xóa mềm một vorcher",
     *     tags={"Vorcher"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Xóa vorcher thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $vorcher = Vorcher::find($id);
        if (!$vorcher) {
            # code...
            return response()->json([
                'message' => 'Voucher không tồn tại',
                'status' => 404,
            ])->setStatusCode(404, 'Not Found');
        }
    }

    /**
     * @OA\Get(
     *     path="/api/vorchers/trashed",
     *     summary="Lấy danh sách các vorcher đã bị xóa mềm",
     *     tags={"Vorcher"},
     *     @OA\Response(response=200, description="Lấy danh sách vorcher đã xóa thành công")
     * )
     */
    public function trashed()
    {
        $vorcher = Vorcher::onlyTrashed()->get();
        return response()->json([
            'message' => 'Lấy danh sách voucher đã xóa thành công',
            'data' => $vorcher
        ])->setStatusCode(200, 'OK',);
    }

    /**
     * @OA\Put(
     *     path="/api/vorchers/restore/{id}",
     *     summary="Khôi phục một vorcher đã bị xóa mềm",
     *     tags={"Vorcher"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Khôi phục vorcher thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    public function restore($id)
    {
        $vorcher = Vorcher::withTrashed()->find($id);
        if (!$vorcher) {
            return response()->json([
                'message' => 'vorcher không tồn tại',
                'status' => 404,
            ])->setStatusCode(404, 'Not Found');
        }
        $vorcher->restore();
        return response()->json([
            'massage' => 'Khôi phục voucher thành công',
            'data' => $vorcher
        ])->setStatusCode(200, 'OK',);
    }
    /**
     * @OA\Delete(
     *     path="/api/vorchers/force-delete/{id}",
     *     summary="Xóa vĩnh viễn vorcher đã xóa mềm",
     *     tags={"Vorcher"},
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
        $vorcher = Vorcher::withTrashed()->find($id);
        if (!$vorcher) {
            return response()->json([
                'message' => 'voucher không tồn tại',
            ]);
        }
        $vorcher->forceDelete();
        return response()->json([
            'massage' => 'Xóa voucher vĩnh viễn thành công',
            'data' => $vorcher
        ])->setStatusCode(200, 'OK',);
    }
}
