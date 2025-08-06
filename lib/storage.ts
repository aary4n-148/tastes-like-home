/**
 * Supabase Storage Utilities for Chef Application System
 * 
 * Handles file uploads, downloads, and management for chef applications.
 * Supports profile photos and food photos with proper validation and security.
 */

import { createSupabaseClient } from './supabase-client'
import { createSupabaseAdminClient } from './supabase-admin'

/**
 * Configuration for file uploads
 */
export const STORAGE_CONFIG = {
  BUCKET_NAME: 'chef-applications',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILES_PER_APPLICATION: 10,
} as const

/**
 * File upload result interface
 */
export interface FileUploadResult {
  success: boolean
  fileUrl?: string
  fileName?: string
  error?: string
}

/**
 * File validation result interface
 */
export interface FileValidation {
  isValid: boolean
  error?: string
}

/**
 * Validates a file before upload
 * 
 * @param file - File to validate
 * @returns Validation result with error message if invalid
 */
export function validateFile(file: File): FileValidation {
  // Check file size
  if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size must be less than ${STORAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`
    }
  }

  // Check file type
  if (!STORAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `File type must be one of: ${STORAGE_CONFIG.ALLOWED_TYPES.join(', ')}`
    }
  }

  return { isValid: true }
}

/**
 * Generates a unique file name for storage
 * 
 * @param originalName - Original file name
 * @param applicationId - Application ID for organization
 * @param fileType - Type of file (profile, food)
 * @returns Unique file name with path
 */
export function generateFileName(
  originalName: string, 
  applicationId: string, 
  fileType: 'profile' | 'food'
): string {
  const timestamp = Date.now()
  const extension = originalName.split('.').pop()
  const sanitizedName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .toLowerCase()
  
  return `${applicationId}/${fileType}/${timestamp}_${sanitizedName}`
}

/**
 * Uploads a file to Supabase storage
 * 
 * @param file - File to upload
 * @param applicationId - Application ID for organization
 * @param fileType - Type of file (profile, food)
 * @returns Promise with upload result
 */
export async function uploadFile(
  file: File,
  applicationId: string,
  fileType: 'profile' | 'food'
): Promise<FileUploadResult> {
  try {
    // Validate file first
    const validation = validateFile(file)
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      }
    }

    const supabase = createSupabaseClient()
    const fileName = generateFileName(file.name, applicationId, fileType)

    // Upload file to storage
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage upload error:', error)
      return {
        success: false,
        error: 'Failed to upload file. Please try again.'
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .getPublicUrl(fileName)

    return {
      success: true,
      fileUrl: urlData.publicUrl,
      fileName: fileName
    }

  } catch (error) {
    console.error('File upload error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during file upload.'
    }
  }
}

/**
 * Deletes a file from Supabase storage (admin only)
 * 
 * @param fileName - Name of file to delete
 * @returns Promise with success status
 */
export async function deleteFile(fileName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseAdminClient()

    const { error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .remove([fileName])

    if (error) {
      console.error('Storage delete error:', error)
      return {
        success: false,
        error: 'Failed to delete file.'
      }
    }

    return { success: true }

  } catch (error) {
    console.error('File delete error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during file deletion.'
    }
  }
}

/**
 * Gets all files for an application (admin only)
 * 
 * @param applicationId - Application ID
 * @returns Promise with list of files
 */
export async function getApplicationFiles(applicationId: string) {
  try {
    const supabase = createSupabaseAdminClient()

    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .list(applicationId, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) {
      console.error('Storage list error:', error)
      return { success: false, files: [], error: 'Failed to fetch files.' }
    }

    return { success: true, files: data || [], error: null }

  } catch (error) {
    console.error('File list error:', error)
    return { success: false, files: [], error: 'An unexpected error occurred.' }
  }
}