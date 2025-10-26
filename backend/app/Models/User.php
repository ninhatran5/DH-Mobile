<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable, HasFactory, SoftDeletes;

    protected $primaryKey = 'user_id'; // thay vì "id"
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [

        'username',
        'email',
        'password_hash',
        'role',
        'full_name',
        'phone',
        'address',
        'ward',
        'district',
        'city',
        'tier_id', // khóa ngoại tới bảng loyalty_tiers
        'loyalty_points', // tổng điểm tích lũy của người dùng
        'image_url',
        'is_blocked',
    ];

    protected $hidden = [
        'password_hash',
    ];

    // override để Laravel biết cột dùng làm mật khẩu
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    public function productlikes()
    {
        return $this->hasMany(ProductLike::class, 'user_id', 'user_id');
    }

    public function carts()
    {
        return $this->hasMany(Cart::class, 'user_id', 'user_id');
    }

    public function productsViews()
    {
        return $this->hasMany(ProductsViews::class, 'user_id', 'user_id');
    }

    // quan hệ với bảng tích điểm 
    public function loyaltyPoints()
    {
        return $this->hasMany(LoyaltyPoint::class, 'user_id', 'user_id');
    }
    public function tier()
    {
        return $this->belongsTo(LoyaltyTier::class, 'tier_id', 'tier_id');
    }

    public function getTotalPointsAttribute()
    {
        return $this->loyaltyPoints()->sum('points');
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class, 'user_id', 'user_id');
    }
}
