import React, { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import type { CancelTokenSource } from 'axios';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileVideo, X, Loader2, Ban } from 'lucide-react';

const CLOUD_NAME = 'dgbryseip'; // Cloudinary Cloud Name của bạn
const UPLOAD_PRESET = 'hotrothitructuyen'; // Unsigned upload preset của bạn
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;

interface VideoUploadProps {
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
  setValue?: (name: string, value: string) => void;
  maxSizeMB?: number;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  setValue,
  maxSizeMB = 1000, // Default max size is 1GB
}) => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelTokenRef = useRef<CancelTokenSource | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (!['video/mp4', 'video/webm', 'video/ogg'].includes(file.type)) {
      return 'Please upload a valid video (MP4, WebM, OGG)';
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `Video size must be less than ${maxSizeMB}MB (Selected: ${formatFileSize(file.size)})`;
    }
    return null;
  };

  const resetUpload = () => {
    setVideoUrl(null);
    setSelectedFileName(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (setValue) setValue('answer_config.url', '');
  };

  const cancelUpload = () => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('Upload cancelled by user');
      cancelTokenRef.current = null;
      setUploading(false);
      setProgress(0);
      setError('Upload cancelled');
      setSelectedFileName(null);
      if (setValue) setValue('answer_config.url', '');
    }
  };

  const handleUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onUploadError?.(validationError);
      return;
    }

    try {
      setError(null);
      setProgress(0);
      setUploading(true);
      setSelectedFileName(file.name);

      cancelTokenRef.current = axios.CancelToken.source();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('resource_type', 'video');

      const response = await axios.post(UPLOAD_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        cancelToken: cancelTokenRef.current.token,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(progress);
          }
        },
      });

      if (response.data?.secure_url) {
        const uploadedUrl = response.data.secure_url;
        setVideoUrl(uploadedUrl);
        onUploadSuccess?.(uploadedUrl);
        if (setValue) setValue('answer_config.url', uploadedUrl); // Cập nhật url vào form
        console.log('Uploaded URL:', uploadedUrl);
      } else {
        throw new Error('Upload failed: No URL returned');
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Upload cancelled:', err.message);
      } else {
        console.error('Upload error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Upload failed. Please try again.';
        setError(errorMessage);
        onUploadError?.(errorMessage);
        setSelectedFileName(null);
        if (setValue) setValue('answer_config.url', ''); // Reset khi lỗi
      }
    } finally {
      setUploading(false);
      cancelTokenRef.current = null;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!uploading) setIsDragging(true);
    },
    [uploading],
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!uploading) setIsDragging(true);
    },
    [uploading],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (uploading) return;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleUpload(file);
      }
    },
    [uploading],
  );

  const handleVideoLoad = () => {
    setVideoLoading(false);
  };

  return (
    <div className="w-full max-w-md">
      <div
        className={`relative flex flex-col items-center justify-center min-h-[200px] p-8 border-2 border-dashed rounded-lg transition-all
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {!videoUrl && !uploading && (
          <>
            <input ref={fileInputRef} type="file" className="hidden" accept="video/mp4,video/webm,video/ogg" onChange={handleFileChange} disabled={uploading} />
            <Upload className="w-10 h-10 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-600">{isDragging ? 'Drop video here' : 'Drag and drop video here'}</p>
            <p className="text-xs text-gray-500">or</p>
            <Button type="button" variant="outline" size="sm" className="mt-2" disabled={uploading} onClick={handleButtonClick}>
              Select Video
            </Button>
            <p className="mt-2 text-xs text-gray-500">MP4, WebM or OGG (max. {maxSizeMB}MB)</p>
          </>
        )}

        {selectedFileName && !error && (
          <div className="flex items-center gap-2 mt-2">
            <FileVideo className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600 truncate max-w-[200px]">{selectedFileName}</span>
          </div>
        )}

        {uploading && (
          <div className="w-full space-y-3">
            <Progress value={progress} className="w-full" />
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Uploading: {progress}%</p>
              <Button type="button" variant="ghost" size="sm" onClick={cancelUpload} className="text-red-500 hover:text-red-700">
                <Ban className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 mt-2 text-red-500">
            <X className="w-4 h-4" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {videoUrl && !uploading && (
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-500">Upload successful!</p>
              <Button type="button" variant="ghost" size="sm" onClick={resetUpload} className="text-gray-500 hover:text-gray-700">
                Upload Another
              </Button>
            </div>
            <div className="relative">
              {videoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              )}
              <video src={videoUrl} controls className="w-full rounded-lg border shadow-sm" onLoadStart={() => setVideoLoading(true)} onLoadedData={handleVideoLoad} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};