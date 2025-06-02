<?php

namespace App\Http\Controllers\Api;

use App\Models\Product;
use Cloudinary\Cloudinary;
use App\Models\ProductLike;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/products",
     *     summary="Lấy danh sách sản phẩm",
     *     tags={"Product"},
     *     @OA\Response(response=200, description="Thành công")
     * )
     */
    public function index()
    {
        //
        $products = Product::with('category')->get();
        
        $formattedProducts = $products->map(function ($product) {
            $product->price = number_format($product->price, 0, ',', '.');
            $product->price_original = number_format($product->price_original, 0, ',', '.');
            return $product;
        });
        
        return response()->json([
            'message' => 'Lấy danh sách sản phẩm thành công',
            'data' => $formattedProducts,
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }

    /**
     * @OA\Post(
     *     path="/api/products",
     *     summary="Thêm sản phẩm mới",
     *     tags={"Product"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","category_id"},
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="category_id", type="integer"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="image_url", type="string", format="binary")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Tạo thành công")
     * )
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:200',
            'category_id' => 'required|integer',
            'price' => 'nullable|numeric',
            'price_original' => 'nullable|numeric',
            'description' => 'nullable|string|max:255',
            'image_url' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);
        if ($request->hasFile('image_url')) {
            try {
                $cloudinary = app(Cloudinary::class);
                $uploadApi = $cloudinary->uploadApi();
                $result = $uploadApi->upload($request->file('image_url')->getRealPath(), [
                    'folder' => 'products'
                ]);
                $validatedData['image_url'] = $result['secure_url'];
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Lỗi khi upload ảnh: ' . $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ], 500);
            }
        }
        $product = Product::create($validatedData);
        return response()->json([
            'message' => 'Thêm sản phẩm thành công',
            'data' => $product,
            'status' => 201,
        ])->setStatusCode(201, 'Created');
    }

    /**
     * @OA\Get(
     *     path="/api/products/{id}",
     *     summary="Lấy sản phẩm theo id",
     *     tags={"Product"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    public function show(string $id)
    {
        //
        $product = Product::with('category')->find($id);
        if ($product) {
            $product->price = number_format($product->price, 0, ',', '.');
            $product->price_original = number_format($product->price_original, 0, ',', '.');
            
            return response()->json([
                'message' => 'Lấy sản phẩm thành công',
                'data' => $product,
                'status' => 200
            ], 200);
        } else {
            return response()->json([
                'message' => 'Sản phẩm không tồn tại',
                'status' => 404,
            ])->setStatusCode(404, 'Not Found');
        }
    }

    /**
     * @OA\Put(
     *     path="/api/products/{id}",
     *     summary="Cập nhật sản phẩm theo id",
     *     tags={"Product"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","category_id"},
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="category_id", type="integer"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="image_url", type="string", format="binary")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Cập nhật thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    public function update(Request $request, $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json([
                'message' => 'Sản phẩm không tồn tại',
                'status' => 404,
            ], 404);
        }
        $validatedData = $request->validate([
            'name' => 'required|string|max:200',
            'category_id' => 'required|integer',
            'price' => 'nullable|numeric',
            'price_original' => 'nullable|numeric',
            'description' => 'nullable|string|max:255',
            'image_url' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);
        if ($request->hasFile('image_url')) {
            try {
                $cloudinary = app(Cloudinary::class);
                if ($product->image_url) {
                    $oldImageUrl = $product->image_url;
                    $publicId = $this->getPublicIdFromUrl($oldImageUrl);
                    if ($publicId) {
                        $cloudinary->uploadApi()->destroy($publicId, [
                            'resource_type' => 'image'
                        ]);
                    }
                }
                $uploadApi = $cloudinary->uploadApi();
                $result = $uploadApi->upload($request->file('image_url')->getRealPath(), [
                    'folder' => 'products'
                ]);
                $validatedData['image_url'] = $result['secure_url'];
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Lỗi khi upload ảnh: ' . $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ], 500);
            }
        }
        $product->update($validatedData);
        return response()->json([
            'message' => 'Cập nhật sản phẩm thành công',
            'data' => $product,
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }

    /**
     * @OA\Delete(
     *     path="/api/products/{id}",
     *     summary="Xóa mềm sản phẩm theo id",
     *     tags={"Product"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Xóa thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    public function destroy(string $id)
    {
        //
        $product = Product::find($id);
        if ($product) {
            $product->delete();
            return response()->json([
                'message' => 'Đã bỏ vào thùng rác thành công',
                'status' => 200,
            ])->setStatusCode(200, 'OK');
        } else {
            return response()->json([
                'message' => 'Sản phẩm không tồn tại',
                'status' => 404,
            ])->setStatusCode(404, 'Not Found');
        }
    }
    /**
     * @OA\Get(
     *     path="/api/products/trashed",
     *     summary="Lấy danh sách sản phẩm đã xóa mềm",
     *     tags={"Product"},
     *     @OA\Response(response=200, description="Thành công")
     * )
     */
    public function trashed()
    {

        $deletedProduct = Product::onlyTrashed()->orderBy('deleted_at', 'DESC')->get();

        if ($deletedProduct->isEmpty()) {
            return response()->json([
                'message' => 'Không tìm thấy sản phẩm đã xóa mềm',
                'data' => [],
                'status' => 404,
            ], 404);
        }

        return response()->json([
            'message' => 'Lấy danh sách sản phẩm đã xóa (mềm) thành công',
            'data' => $deletedProduct,
            'status' => 200,
        ], 200);
    }
    /**
     * @OA\Post(
     *     path="/api/products/restore/{id}",
     *     summary="Khôi phục sản phẩm đã xóa mềm",
     *     tags={"Product"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Khôi phục thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    public function restore($id)
    {
        $product = Product::withTrashed()->find($id);
        if (!$product) {
            return response()->json([
                'message' => 'sản phẩm không tồn tại',
                'status' => 404,
            ], 404);
        }
        $product->restore();
        return response()->json([
            'message' => 'Khôi phục sản phẩm thành công',
            'data' => $product,
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }
    /**
     * @OA\Delete(
     *     path="/api/products/force-delete/{id}",
     *     summary="Xóa vĩnh viễn sản phẩm đã xóa mềm",
     *     tags={"Product"},
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
        $product = Product::withTrashed()->find($id);
        if (!$product) {
            return response()->json([
                'message' => 'sản phẩm không tồn tại',
                'status' => 404,
            ], 404);
        }
        $product->forceDelete();
        return response()->json([
            'message' => 'Xóa vĩnh viễn sản phẩm thành công',
            'status' => 200,
        ])->setStatusCode(200, 'OK');
    }

    // public function updatestatuslike( $id)
    // {
    //     $user = Auth::user();
    //     $productlike = ProductLike::where('user_id', $user->user_id)
    //         ->where('product_id', $id)
    //         ->first();

    //     if (!$productlike) {
    //         return response()->json([
    //             'status' => false,
    //             'message' => 'Sản phẩm không tồn tại trong danh sách yêu thích'
    //         ]);
    //     }
    //     $product = Product::find($id);
    //     if (!$product) {
    //         return response()->json([
    //             'message' => 'Sản phẩm không tồn tại',
    //             'status' => 404,
    //         ], 404);
    //     }
    //     $product->status = !$product->status;
    //     $product->save();
    //     return response()->json([
    //         'message' => 'Cập nhật trạng thái sản phẩm thành công',
    //         'data' => $product,
    //         'status' => 200,
    //     ])->setStatusCode(200, 'OK');
    // }

    private function getPublicIdFromUrl($url)
    {
        if (empty($url)) {
            return null;
        }
        $pattern = '/\/upload\/(?:v\d+\/)?(.+)$/';
        if (preg_match($pattern, $url, $matches)) {
            $publicId = preg_replace('/\.[^.]+$/', '', $matches[1]);
            return $publicId;
        }
        return null;
    }
}
