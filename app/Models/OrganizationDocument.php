<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $document_type
 * @property string $display_name
 * @property string $storage_path
 * @property string $mime_type
 * @property int $size
 * @property string $scan_status
 * @property string $verification_status
 */
#[Hidden(['storage_disk', 'storage_path'])]
class OrganizationDocument extends Model
{
    protected $guarded = [];
}
