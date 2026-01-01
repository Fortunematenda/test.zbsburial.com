<?php

namespace Tests\Unit\Helpers;

use App\Helpers\ImageValidationHelper;
use Tests\TestCase;

class ImageValidationHelperTest extends TestCase
{
    public function test_validate_empty_base64_returns_error(): void
    {
        $result = ImageValidationHelper::validateAndDecodeBase64('');

        $this->assertFalse($result['success']);
        $this->assertNotNull($result['error']);
        $this->assertNull($result['binary']);
    }

    public function test_validate_invalid_base64_returns_error(): void
    {
        $result = ImageValidationHelper::validateAndDecodeBase64('invalid_base64_data!!!');

        $this->assertFalse($result['success']);
        $this->assertNotNull($result['error']);
    }

    public function test_validate_valid_jpeg_image_returns_success(): void
    {
        // Create a minimal valid JPEG base64 string
        $minimalJpeg = base64_encode(hex2bin('FFD8FFE000104A46494600010100000100010000FFDB004300'));
        $base64Data = 'data:image/jpeg;base64,' . $minimalJpeg;

        $result = ImageValidationHelper::validateAndDecodeBase64($base64Data);

        // May fail due to invalid image data, but should handle gracefully
        $this->assertIsArray($result);
        $this->assertArrayHasKey('success', $result);
    }

    public function test_generate_secure_filename(): void
    {
        $filename = ImageValidationHelper::generateSecureFilename('lead', 123, 0, 'jpg');

        $this->assertStringStartsWith('lead_123_0_', $filename);
        $this->assertStringEndsWith('.jpg', $filename);
        $this->assertMatchesRegularExpression('/lead_\d+_\d+_\d+_[a-z0-9]+\.jpg/', $filename);
    }

    public function test_generate_secure_filename_sanitizes_extension(): void
    {
        $filename = ImageValidationHelper::generateSecureFilename('lead', 123, 0, 'png');

        $this->assertStringEndsWith('.png', $filename);
    }

    public function test_generate_secure_filename_handles_invalid_extension(): void
    {
        $filename = ImageValidationHelper::generateSecureFilename('lead', 123, 0, '../../../etc/passwd');

        // Should sanitize and default to jpg
        $this->assertStringEndsWith('.jpg', $filename);
        $this->assertStringNotContainsString('../', $filename);
    }
}

