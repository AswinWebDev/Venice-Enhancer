import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image } from 'lucide-react';
import { useApp } from '../context/AppContext';

const UploadArea: React.FC = () => {
  const { addImages, images } = useApp();
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/')
    );
    
    if (imageFiles.length > 0) {
      addImages(imageFiles);
    }
  }, [addImages]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false),
  });

  if (images.length > 0) {
    return null;
  }

  return (
    <div 
      {...getRootProps()} 
      className={`
        relative w-full border-2 border-dashed rounded-lg p-8 text-center transition-all
        ${isDragging 
          ? 'border-venice-red bg-venice-red/5' 
          : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}
        h-80
        flex flex-col items-center justify-center
        cursor-pointer
      `}
    >
      <input {...getInputProps()} />
      
      <div className={`
        ${isDragging ? 'scale-110' : 'scale-100'} 
        transition-transform duration-200
      `}>
        {isDragging ? (
          <div className="text-venice-red">
            <Image size={48} className="mx-auto mb-4 opacity-80" />
            <p className="text-lg font-medium">Drop to upload</p>
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400">
            <Upload size={48} className="mx-auto mb-4 opacity-60" />
            <p className="text-lg font-medium">Drag and drop your images here</p>
            <p className="mt-2">or click to browse</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadArea;