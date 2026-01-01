<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Log;

/**
 * Helper class for secure image validation and processing
 */
class ImageValidationHelper
{
    /**
     * Maximum allowed image size in bytes (5MB)
     */
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

    /**
     * Allowed MIME types for images
     */
    const ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
    ];

    /**
     * Allowed file extensions
     */
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    /**
     * Validate and decode base64 image
     * 
     * @param string $base64Data Base64 encoded image data (may include data URI prefix)
     * @return array Returns ['success' => bool, 'binary' => string|null, 'mime' => string|null, 'extension' => string|null, 'error' => string|null]
     */
    public static function validateAndDecodeBase64(string $base64Data): array
    {
        try {
            // Check if empty
            if (empty($base64Data)) {
                return [
                    'success' => false,
                    'binary' => null,
                    'mime' => null,
                    'extension' => null,
                    'error' => 'Image data is empty'
                ];
            }

            // Extract MIME type from data URI if present
            $mimeType = null;
            $base64Content = $base64Data;
            
            if (preg_match('/^data:image\/(\w+);base64,(.+)$/i', $base64Data, $matches)) {
                $mimeType = 'image/' . strtolower($matches[1]);
                $base64Content = $matches[2];
            }

            // Decode base64
            $binary = base64_decode($base64Content, true);
            
            if ($binary === false) {
                return [
                    'success' => false,
                    'binary' => null,
                    'mime' => null,
                    'extension' => null,
                    'error' => 'Invalid base64 data'
                ];
            }

            // Check file size
            $fileSize = strlen($binary);
            if ($fileSize > self::MAX_IMAGE_SIZE) {
                return [
                    'success' => false,
                    'binary' => null,
                    'mime' => null,
                    'extension' => null,
                    'error' => 'Image size exceeds maximum allowed size of ' . (self::MAX_IMAGE_SIZE / 1024 / 1024) . 'MB'
                ];
            }

            // Minimum size check (empty or too small might be invalid)
            if ($fileSize < 100) {
                return [
                    'success' => false,
                    'binary' => null,
                    'mime' => null,
                    'extension' => null,
                    'error' => 'Image data is too small to be valid'
                ];
            }

            // Validate MIME type using finfo if available
            $detectedMime = null;
            $extension = null;
            
            if (function_exists('finfo_open')) {
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $detectedMime = finfo_buffer($finfo, $binary);
                finfo_close($finfo);
            } elseif (function_exists('mime_content_type')) {
                // Fallback for older PHP versions
                $tempFile = tmpfile();
                fwrite($tempFile, $binary);
                $tempPath = stream_get_meta_data($tempFile)['uri'];
                $detectedMime = mime_content_type($tempPath);
                fclose($tempFile);
            }

            // If we detected a MIME type, validate it
            if ($detectedMime) {
                // Normalize detected MIME type
                $detectedMime = strtolower($detectedMime);
                
                // Check against allowed MIME types
                if (!in_array($detectedMime, self::ALLOWED_MIME_TYPES)) {
                    Log::warning('Invalid image MIME type detected', [
                        'detected_mime' => $detectedMime,
                        'allowed_mimes' => self::ALLOWED_MIME_TYPES
                    ]);
                    
                    return [
                        'success' => false,
                        'binary' => null,
                        'mime' => null,
                        'extension' => null,
                        'error' => 'Invalid image type. Allowed types: ' . implode(', ', self::ALLOWED_MIME_TYPES)
                    ];
                }

                // If MIME type was provided in data URI, verify it matches detected
                if ($mimeType && strtolower($mimeType) !== $detectedMime) {
                    Log::warning('MIME type mismatch', [
                        'provided_mime' => $mimeType,
                        'detected_mime' => $detectedMime
                    ]);
                    // Use detected MIME type (more reliable)
                    $mimeType = $detectedMime;
                } else {
                    $mimeType = $detectedMime;
                }

                // Get extension from MIME type
                $extension = self::getExtensionFromMime($mimeType);
            } else {
                // Fallback: use provided MIME type or default to jpg
                if (!$mimeType) {
                    $mimeType = 'image/jpeg'; // Default fallback
                }
                $extension = self::getExtensionFromMime($mimeType);
            }

            // Additional validation: Check if it's actually an image by trying to get image info
            $imageInfo = @getimagesizefromstring($binary);
            if ($imageInfo === false) {
                return [
                    'success' => false,
                    'binary' => null,
                    'mime' => null,
                    'extension' => null,
                    'error' => 'Data is not a valid image'
                ];
            }

            // Verify the detected MIME matches image info MIME
            $imageMime = $imageInfo['mime'] ?? null;
            if ($imageMime && $mimeType && strtolower($imageMime) !== strtolower($mimeType)) {
                Log::warning('MIME type validation mismatch', [
                    'detected_mime' => $mimeType,
                    'image_info_mime' => $imageMime
                ]);
                // Use image info MIME (most reliable)
                $mimeType = $imageMime;
                $extension = self::getExtensionFromMime($mimeType);
            }

            return [
                'success' => true,
                'binary' => $binary,
                'mime' => $mimeType,
                'extension' => $extension,
                'size' => $fileSize,
                'width' => $imageInfo[0] ?? null,
                'height' => $imageInfo[1] ?? null,
                'error' => null
            ];

        } catch (\Throwable $e) {
            Log::error('Image validation error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'binary' => null,
                'mime' => null,
                'extension' => null,
                'error' => 'Image validation failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get file extension from MIME type
     * 
     * @param string $mimeType
     * @return string
     */
    private static function getExtensionFromMime(string $mimeType): string
    {
        $mimeToExt = [
            'image/jpeg' => 'jpg',
            'image/jpg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
        ];

        return $mimeToExt[strtolower($mimeType)] ?? 'jpg';
    }

    /**
     * Generate secure filename
     * 
     * @param string $prefix Prefix for filename
     * @param int $id ID to include in filename
     * @param int $index Index for multiple files
     * @param string $extension File extension
     * @return string
     */
    public static function generateSecureFilename(string $prefix, int $id, int $index, string $extension): string
    {
        // Sanitize extension
        $extension = preg_replace('/[^a-z0-9]/i', '', $extension);
        if (empty($extension)) {
            $extension = 'jpg';
        }

        // Generate unique filename with timestamp and random component
        $timestamp = time();
        $random = substr(md5(uniqid(rand(), true)), 0, 8);
        
        return sprintf('%s_%d_%d_%s_%s.%s', 
            $prefix, 
            $id, 
            $index, 
            $timestamp, 
            $random,
            strtolower($extension)
        );
    }
}

