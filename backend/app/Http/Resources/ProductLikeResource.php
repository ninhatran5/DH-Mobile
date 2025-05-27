<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductLikeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'like_id'    => $this->like_id,
            'user_id'    => $this->user_id,
            'product_id' => $this->product_id,
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
            'product'    => [
                'product_id'     => $this->product->product_id,
                'category_id'    => $this->product->category_id,
                'name'           => $this->product->name,
                'description'    => $this->product->description,
                'price'          => number_format($this->product->price, 2),
                'price_original' => number_format($this->product->price_original, 2),
                'status'     => (bool) $this->product->status,
                'image_url'      => $this->product->image_url,
                'created_at'     => $this->product->created_at->toDateTimeString(),
                'updated_at'     => $this->product->updated_at->toDateTimeString(),
                'deleted_at'     => $this->product->deleted_at,
            ],
        ];
    }
}
