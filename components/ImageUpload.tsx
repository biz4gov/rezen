import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
    label: string;
    imageUrl: string | null;
    onImageChange: (base64: string) => void;
    onImageRemove: () => void;
    aspectRatio?: 'video' | 'square';
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const ImageUpload: React.FC<ImageUploadProps> = ({ label, imageUrl, onImageChange, onImageRemove, aspectRatio = 'video' }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione um arquivo de imagem (JPEG, PNG).');
            return;
        }
        const base64 = await fileToBase64(file);
        onImageChange(base64);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
        e.target.value = '';
    };

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { handleDragEvents(e); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { handleDragEvents(e); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        handleDragEvents(e);
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const uniqueId = `image-upload-${label.replace(/\s+/g, '-')}`;
    const aspectClass = aspectRatio === 'square' ? 'aspect-square' : 'aspect-video';

    return (
        <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">{label}</label>
            <div className={`mt-1 ${aspectClass} w-full`}>
                {imageUrl ? (
                    <div className="relative group rounded-md overflow-hidden border-2 border-gray-300 h-full">
                        <img src={imageUrl} alt={label} className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                type="button"
                                onClick={onImageRemove}
                                className="text-white p-2 bg-red-600 rounded-full hover:bg-red-700"
                                aria-label={`Remover ${label}`}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`flex flex-col items-center justify-center w-full h-full rounded-md border-2 border-dashed transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                    >
                        <ImageIcon className="h-10 w-10 text-gray-400" />
                        <label htmlFor={uniqueId} className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                            <span>Carregar imagem</span>
                            <input id={uniqueId} type="file" className="sr-only" accept="image/png, image/jpeg" onChange={handleInputChange} />
                        </label>
                        <p className="text-xs text-gray-500">ou arraste e solte</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUpload;