<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable, HasFactory;

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
        'image_url',
    ];

    protected $hidden = [
        'password_hash',
    ];

    // override để Laravel biết cột dùng làm mật khẩu
    public function getAuthPassword()
    {
        return $this->password_hash;
    }
}
