import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image } from 'lucide-react';
import { useApp } from '../context/AppContext';

const UploadArea: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const breakpoint = 640; // Tailwind's sm breakpoint
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const { addImages, images } = useApp();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/')
    );
    
    if (imageFiles.length > 0) {
      addImages(imageFiles);
    }
  }, [addImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    noDrag: isMobile,
  });

  if (images.length > 0) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="flex justify-center my-8" style={{marginBottom: '20rem'}}>
        <button
          {...getRootProps({ className: 'py-3 px-6 bg-venice-red text-white rounded-lg font-semibold shadow-md hover:bg-venice-red-dark transition-colors flex items-center' })}
          type="button"
        >
          <Upload size={20} className="mr-2" />
          Upload Image
        </button>
        <input {...getInputProps()} />
      </div>
    );
  }

  // Desktop view (drag-and-drop box)
  return (
    <div 
      {...getRootProps()} 
      className={`
        relative w-full border-2 border-dashed rounded-lg p-8 text-center transition-all
        ${isDragActive 
          ? 'border-venice-red bg-venice-red/5' 
          : 'border-gray-300 hover:bg-gray-50'}
        h-80
        flex flex-col items-center justify-center
        cursor-pointer
      `}
      style={{maxHeight:'15rem'}}
    >
      <input {...getInputProps()} />
      
      <div className={`
        ${isDragActive ? 'scale-110' : 'scale-100'} 
        transition-transform duration-200
      `}>
        {isDragActive ? (
          <div className="text-venice-red">
            <Image size={48} className="mx-auto mb-4 opacity-80" />
            <p className="text-lg font-medium">Drop to upload</p>
          </div>
        ) : (
          <div className="text-gray-500">
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