import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ImageUploadProps {
  onFileSelect: (file: File | null) => void;
  maxSizeMB?: number;
  defaultImage?: string;
  className?: string;
  label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onFileSelect, 
  maxSizeMB = 5, 
  defaultImage, 
  className,
  label = "Upload Image"
}) => {
  const [preview, setPreview] = useState<string | null>(defaultImage || null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when defaultImage changes
  useEffect(() => {
    if (defaultImage && !preview) {
      setPreview(defaultImage);
    }
  }, [defaultImage]);

  const handleFile = (file: File) => {
    setError(null);
    
    // Validate MIME type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError("Only JPEG, PNG, and WebP images are allowed.");
      onFileSelect(null);
      return;
    }

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File is too large. Max size is ${maxSizeMB}MB.`);
      onFileSelect(null);
      return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onFileSelect(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(defaultImage || null);
    setError(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-xs font-black uppercase tracking-widest text-ink">{label}</label>
      
      <div 
        className={cn(
          "relative border-4 border-sharpie border-dashed p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white group min-h-[160px]",
          isDragging ? "bg-neon-blue/10 border-neon-blue" : "hover:bg-paper",
          error ? "border-red-500 bg-red-50" : ""
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/jpeg,image/png,image/webp"
          onChange={onChange}
        />

        {preview ? (
          <div className="relative w-full h-full min-h-[140px]">
            <img 
              src={preview} 
              alt="Preview" 
              className="absolute inset-0 w-full h-full object-cover border-2 border-sharpie grayscale group-hover:grayscale-0 transition-all duration-300" 
            />
            <button 
              type="button"
              onClick={handleClear}
              className="absolute -top-3 -right-3 bg-neon-pink text-white p-1 border-2 border-sharpie shadow-sharpie-sm hover:scale-110 transition-transform z-10"
              title="Remove image"
            >
              <X className="w-4 h-4 font-bold" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="bg-neon-yellow p-3 border-2 border-sharpie transform -rotate-3 group-hover:rotate-0 transition-transform shadow-sharpie-sm">
              <Upload className="w-6 h-6 text-ink font-bold" />
            </div>
            <div>
              <p className="font-bold text-sm text-ink uppercase">Drag & Drop or Click</p>
              <p className="text-xs text-ink/60 font-medium">JPEG, PNG, WEBP (Max {maxSizeMB}MB)</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500 text-white p-3 border-2 border-sharpie mt-2 shadow-sharpie-sm font-bold text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="uppercase">{error}</p>
        </div>
      )}
    </div>
  );
};
