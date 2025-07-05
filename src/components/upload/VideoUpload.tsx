import React, { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileVideo, X } from 'lucide-react';

const CLOUD_NAME = 'dgbryseip'; // Cloudinary Cloud Name của bạn
const UPLOAD_PRESET = 'hotrothitructuyen'; // Unsigned upload preset của bạn
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;

interface VideoUploadProps {
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({ onUploadSuccess, onUploadError }) => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!['video/mp4', 'video/webm', 'video/ogg'].includes(file.type)) {
      return 'Please upload a valid video (MP4, WebM, OGG)';
    }
    if (file.size > 1000 * 1024 * 1024) {
      return 'Video size must be less than 1GB';
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

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('resource_type', 'video');

      const response = await axios.post(UPLOAD_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
      } else {
        throw new Error('Upload failed: No URL returned');
      }
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(errorMessage);
      onUploadError?.(errorMessage);
      setSelectedFileName(null);
    } finally {
      setUploading(false);
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
            <p className="mt-2 text-xs text-gray-500">MP4, WebM or OGG (max. 1GB)</p>
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
            <p className="text-sm text-center text-gray-600">Uploading: {progress}%</p>
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
            <video src={videoUrl} controls className="w-full rounded-lg border shadow-sm" />
          </div>
        )}
      </div>
    </div>
  );
};
