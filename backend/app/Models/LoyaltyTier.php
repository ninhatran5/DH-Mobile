<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoyaltyTier extends Model
{
    //
    protected $table = 'loyalty_tiers';

    protected $primaryKey = 'tier_id';

    public $timestamps = true;

    protected $fillable = [
        'name',
        'min_points',
        'discount_percent',
        'description',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'tier_id');
    }

}
