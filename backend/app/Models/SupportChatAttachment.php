<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportChatAttachment extends Model
{
    protected $primaryKey = 'attachment_id';
    public $timestamps = false;

    protected $fillable = ['chat_id', 'file_url', 'file_type'];

    public function chat()
    {
        return $this->belongsTo(SupportChat::class, 'chat_id', 'chat_id');
    }
}
