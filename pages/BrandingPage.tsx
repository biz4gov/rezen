

import React, { useState, useEffect } from 'react';
import type { BrandingConfig, StoredImage } from '../types';
import { Save, ArrowLeft, Loader2, Check, Palette } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

interface BrandingPageProps {
  onSave: (config: BrandingConfig) => Promise<void>;
  onBack: () => void;
  initialConfig: BrandingConfig;
}

const BrandingPage: React.FC<BrandingPageProps> = ({ onSave, onBack, initialConfig }) => {
    const [config, setConfig] = useState<BrandingConfig>(initialConfig);
    const [isSaving, setIsSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        setConfig(initialConfig);
    }, [initialConfig]);

    const handleImageChange = (field: keyof BrandingConfig, base64: string) => {
        // The ImageUpload component gives us a base64 data URL.
        // We create a StoredImage object to hold it in state.
        // The API layer will receive this object and save it directly.
        const imageFile: StoredImage = { name: `${field}.png`, base64 };
        setConfig(prev => ({ ...prev, [field]: imageFile }));
    };

    const handleImageRemove = (field: keyof BrandingConfig) => {
        setConfig(prev => ({ ...prev, [field]: null }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setIsSuccess(false);
        try {
            await onSave(config);
            setIsSuccess(true);
            // Parent component will handle navigation after the promise resolves in App.tsx
        } catch (error) {
            console.error('Failed to save branding config', error);
            alert('Falha ao salvar. Verifique o console para mais detalhes.');
            setIsSaving(false); // Only set saving to false on error
        }
    };

    return (
        <div className="h-full w-full bg-gray-50">
            <form onSubmit={handleSubmit} className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full flex flex-col">
                <div className="flex-shrink-0 flex items-center mb-6">
                    <button type="button" onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 mr-4">
                        <ArrowLeft size={20} className="text-gray-700" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Palette className="mr-3 text-blue-600" size={24}/>
                        Identidade Visual
                    </h1>
                </div>

                <div className="flex-grow overflow-y-auto pr-2">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <ImageUpload
                                label="Logomarca"
                                imageUrl={config.logomarca && 'base64' in config.logomarca ? config.logomarca.base64 : null}
                                onImageChange={(base64) => handleImageChange('logomarca', base64)}
                                onImageRemove={() => handleImageRemove('logomarca')}
                                aspectRatio="square"
                            />
                            <ImageUpload
                                label="Ícone"
                                imageUrl={config.icone && 'base64' in config.icone ? config.icone.base64 : null}
                                onImageChange={(base64) => handleImageChange('icone', base64)}
                                onImageRemove={() => handleImageRemove('icone')}
                                aspectRatio="square"
                            />
                            <ImageUpload
                                label="Marca"
                                imageUrl={config.marca && 'base64' in config.marca ? config.marca.base64 : null}
                                onImageChange={(base64) => handleImageChange('marca', base64)}
                                onImageRemove={() => handleImageRemove('marca')}
                                aspectRatio="square"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 flex justify-end items-center pt-6 mt-4 border-t">
                    <button onClick={onBack} type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 mr-3">
                        Cancelar
                    </button>
                    <button type="submit" className={`inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors ${isSuccess ? 'bg-green-600' : 'bg-blue-800 hover:bg-blue-900'} disabled:bg-blue-400 disabled:cursor-not-allowed`} disabled={isSaving || isSuccess}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isSuccess ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />)}
                        {isSaving ? 'Salvando...' : (isSuccess ? 'Salvo!' : 'Salvar Alterações')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BrandingPage;