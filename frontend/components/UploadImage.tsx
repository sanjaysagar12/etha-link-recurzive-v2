'use client';

import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";

interface UploadImageProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImage?: string;
  className?: string;
}

export default function UploadImage({ onImageUploaded, currentImage, className }: UploadImageProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);

    try {
      const token = localStorage.getItem('access_token');
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:3000/api/image', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setPreviewUrl(result.data.imageUrl);
        onImageUploaded(result.data.imageUrl);
        console.log('Upload successful:', result);
      } else {
        alert(`Upload failed: ${result.message || 'Unknown error'}`);
        setPreviewUrl(currentImage || null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
      setPreviewUrl(currentImage || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all
          ${dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
              <span className="text-white text-sm font-medium">
                Click to change image
              </span>
            </div>
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                <p className="text-gray-600">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg
                  className="h-12 w-12 text-gray-400 mb-4"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-gray-600 text-sm mb-2">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-gray-400 text-xs">
                  PNG, JPG, GIF, WebP up to 5MB
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {previewUrl && !isUploading && (
        <Button
          onClick={handleClick}
          variant="outline"
          size="sm"
          className="mt-2 w-full"
        >
          Change Image
        </Button>
      )}
    </div>
  );
}