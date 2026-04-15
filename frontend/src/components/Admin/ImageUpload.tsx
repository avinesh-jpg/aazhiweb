/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  onRemove?: (url: string) => void;
  multiple?: boolean;
  existingImages?: string[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ImageUpload = ({ onUpload, onRemove, multiple = false, existingImages = [] }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(existingImages || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    
    const formData = new FormData();
    if (multiple) {
      files.forEach(file => formData.append('images', file));
    } else {
      formData.append('image', files[0]);
    }

    try {
      const token = localStorage.getItem('admin_token');
      const endpoint = multiple ? `${API_URL}/upload/images` : `${API_URL}/upload/image`;
      
      console.log('Uploading to:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      console.log('Upload response:', data);
      
      if (data.success) {
        if (multiple && data.images) {
          const newUrls = data.images.map((img: any) => img.url);
          setImages([...images, ...newUrls]);
          newUrls.forEach(url => onUpload(url));
        } else if (data.url) {
          setImages([...images, data.url]);
          onUpload(data.url);
        }
      } else {
        console.error('Upload failed:', data.message);
        alert('Upload failed: ' + data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (url: string) => {
    setImages(images.filter(img => img !== url));
    if (onRemove) onRemove(url);
  };

  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `${API_URL.replace('/api', '')}${url}`;
    return url;
  };

  return (
    <div className="space-y-3">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
        {uploading ? (
          <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
        ) : (
          <>
            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              Click to upload {multiple ? 'images' : 'an image'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports JPG, PNG, GIF up to 5MB
            </p>
          </>
        )}
      </div>
      
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative group">
              <img 
                src={getImageUrl(img)} 
                alt={`Uploaded ${idx + 1}`} 
                className="w-20 h-20 object-cover rounded-lg border"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/80?text=Error';
                }}
              />
              <button
                type="button"
                onClick={() => handleRemove(img)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;