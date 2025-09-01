'use client'

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, Upload, Image, AlertCircle, Video } from 'lucide-react'
import { validateFile, uploadFile, type FileUploadResult } from '@/lib/storage'

/**
 * File Upload Component for Chef Applications
 * 
 * Features:
 * - Drag and drop support
 * - File validation and preview
 * - Multiple file support
 * - Progress indication
 * - Error handling with user feedback
 */

interface FileUploadProps {
  /** Type of files being uploaded */
  fileType: 'profile' | 'food' | 'video'
  /** Maximum number of files allowed */
  maxFiles?: number
  /** Application ID for organizing uploads */
  applicationId?: string
  /** Callback when files are successfully uploaded */
  onFilesUploaded?: (files: FileUploadResult[]) => void
  /** Callback when upload errors occur */
  onUploadError?: (error: string) => void
  /** Label for the upload area */
  label?: string
  /** Help text for users */
  helpText?: string
}

interface UploadingFile {
  file: File
  preview: string
  status: 'uploading' | 'success' | 'error'
  result?: FileUploadResult
}

export default function FileUpload({
  fileType,
  maxFiles = fileType === 'profile' ? 1 : fileType === 'video' ? 1 : 5,
  applicationId,
  onFilesUploaded,
  onUploadError,
  label,
  helpText
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    
    // Check if adding these files would exceed the limit
    const currentFileCount = uploadingFiles.filter(f => f.status === 'success').length
    if (currentFileCount + fileArray.length > maxFiles) {
      onUploadError?.(`Maximum ${maxFiles} files allowed for ${fileType} photos`)
      return
    }

    // Validate and prepare files
    const validFiles: UploadingFile[] = []
    
    for (const file of fileArray) {
      const validation = validateFile(file, fileType)
      if (!validation.isValid) {
        onUploadError?.(validation.error || 'File validation failed')
        continue
      }

      // Create preview URL
      const preview = URL.createObjectURL(file)
      validFiles.push({
        file,
        preview,
        status: 'uploading'
      })
    }

    if (validFiles.length === 0) return

    // Add files to uploading state
    setUploadingFiles(prev => [...prev, ...validFiles])

    // Upload files
    const uploadResults: FileUploadResult[] = []
    
    for (let i = 0; i < validFiles.length; i++) {
      const uploadingFile = validFiles[i]
      
      try {
        // Generate a temporary ID if no applicationId provided
        const tempId = applicationId || `temp_${Date.now()}`
        
        const result = await uploadFile(uploadingFile.file, tempId, fileType)
        
        // Update file status
        setUploadingFiles(prev => prev.map(f => 
          f.file === uploadingFile.file 
            ? { ...f, status: result.success ? 'success' : 'error', result }
            : f
        ))

        if (result.success) {
          uploadResults.push(result)
        } else {
          onUploadError?.(result.error || 'Upload failed')
        }

      } catch (error) {
        console.error('Upload error:', error)
        setUploadingFiles(prev => prev.map(f => 
          f.file === uploadingFile.file 
            ? { ...f, status: 'error' }
            : f
        ))
        onUploadError?.('Upload failed unexpectedly')
      }
    }

    // Notify parent of successful uploads
    if (uploadResults.length > 0) {
      onFilesUploaded?.(uploadResults)
    }

  }, [uploadingFiles, maxFiles, fileType, applicationId, onFilesUploaded, onUploadError])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFileSelect])

  const removeFile = useCallback((fileToRemove: UploadingFile) => {
    setUploadingFiles(prev => {
      const updated = prev.filter(f => f.file !== fileToRemove.file)
      // Clean up preview URL
      URL.revokeObjectURL(fileToRemove.preview)
      return updated
    })
  }, [])

  const successfulUploads = uploadingFiles.filter(f => f.status === 'success')
  const canUploadMore = successfulUploads.length < maxFiles

  return (
    <div className="space-y-4">
      {/* Upload Label */}
      {label && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">{label}</h3>
          {helpText && (
            <p className="text-xs text-gray-500">{helpText}</p>
          )}
        </div>
      )}

      {/* Upload Area */}
      {canUploadMore && (
        <Card 
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            isDragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="p-6 text-center">
            {fileType === 'video' ? (
              <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            ) : (
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            )}
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Click to upload
              </span>
              {' or drag and drop'}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {fileType === 'video' 
                ? 'MP4, WebM up to 50MB' 
                : 'PNG, JPG, WEBP up to 10MB each'
              }
            </p>
            <p className="text-xs text-gray-500">
              {maxFiles - successfulUploads.length} {fileType === 'video' ? 'video' : 'files'} remaining
            </p>
          </div>
        </Card>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={maxFiles > 1}
        accept={fileType === 'video' ? 'video/mp4,video/webm' : 'image/*'}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* File Previews */}
      {uploadingFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {uploadingFiles.map((uploadingFile, index) => (
            <Card key={index} className="relative overflow-hidden">
              <div className="aspect-square relative">
                {fileType === 'video' ? (
                  <video
                    src={uploadingFile.preview}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={uploadingFile.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Status Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  {uploadingFile.status === 'uploading' && (
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <div className="text-xs">Uploading...</div>
                    </div>
                  )}
                  
                  {uploadingFile.status === 'success' && (
                    <div className="text-white text-center">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        ✓
                      </div>
                      <div className="text-xs">Uploaded</div>
                    </div>
                  )}
                  
                  {uploadingFile.status === 'error' && (
                    <div className="text-white text-center">
                      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <div className="text-xs">Failed</div>
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(uploadingFile)
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {/* File Info */}
              <div className="p-2">
                <div className="text-xs text-gray-600 truncate">
                  {uploadingFile.file.name}
                </div>
                <div className="text-xs text-gray-400">
                  {(uploadingFile.file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Summary */}
      {successfulUploads.length > 0 && (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
          <div className="flex items-center">
            <Image className="h-4 w-4 mr-2" />
            {successfulUploads.length} file{successfulUploads.length > 1 ? 's' : ''} uploaded successfully
          </div>
        </div>
      )}
    </div>
  )
}