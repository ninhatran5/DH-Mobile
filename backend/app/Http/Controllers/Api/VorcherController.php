<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Vorcher;

class VorcherController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $vouchers = Vorcher::all();
        return response()->json($vouchers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:vouchers,code',
            'discount_amount' => 'required|numeric',
            'min_order_value' => 'required|integer',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_active' => 'boolean',
        ]);
        $voucher = Vorcher::create($validated);
        return response()->json($voucher, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $voucher = Vorcher::findOrFail($id);
        return response()->json($voucher);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $voucher = Vorcher::findOrFail($id);
        $validated = $request->validate([
            'code' => 'string|max:50|unique:vouchers,code,' . $id . ',voucher_id',
            'discount_amount' => 'numeric',
            'min_order_value' => 'integer',
            'start_date' => 'date',
            'end_date' => 'date|after_or_equal:start_date',
            'is_active' => 'boolean',
        ]);
        $voucher->update($validated);
        return response()->json($voucher);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $voucher = Vorcher::findOrFail($id);
        $voucher->delete();
        return response()->json(['message' => 'Voucher deleted successfully']);
    }
}
