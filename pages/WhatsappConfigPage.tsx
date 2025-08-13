

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, Check, MessageSquare } from 'lucide-react';
import type { WhatsappConfig } from '../types';
import FormField from '../components/FormField';

interface WhatsappConfigPageProps {
  onBack: () => void;
  onSave: (config: WhatsappConfig) => Promise<void>;
  initialConfig: WhatsappConfig;
}

const WhatsappConfigPage: React.FC<WhatsappConfigPageProps> = ({ onBack, onSave, initialConfig }) => {
    const [config, setConfig] = useState<WhatsappConfig>(initialConfig);
    const [isSaving, setIsSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    useEffect(() => {
        setConfig(initialConfig);
    }, [initialConfig]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setIsSuccess(false);
        try {
            await onSave(config);
            setIsSuccess(true);
            setTimeout(() => {
                onBack();
            }, 1500);
        } catch (error) {
            console.error('Failed to save WhatsApp config', error);
            alert('Falha ao salvar. Verifique o console para mais detalhes.');
            setIsSaving(false);
        }
    };

    return (
        <div className="h-full w-full bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full flex flex-col">
                <div className="flex-shrink-0 flex items-center mb-6">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 mr-4">
                        <ArrowLeft size={20} className="text-gray-700" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <MessageSquare className="mr-3 text-blue-600" size={24}/>
                        Configurar API WhatsApp
                    </h1>
                </div>

                <div className="flex-grow overflow-y-auto pr-2">
                    <div className="max-w-3xl mx-auto">
                         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
                            <FormField 
                                label="Endpoint"
                                name="endpoint"
                                value={config.endpoint}
                                onChange={handleChange}
                            />
                             <FormField 
                                label="Key (X-Api-Key)"
                                name="key"
                                value={config.key}
                                onChange={handleChange}
                            />
                             <FormField 
                                label="Chat ID"
                                name="chatId"
                                value={config.chatId}
                                onChange={handleChange}
                            />
                             <FormField 
                                label="Session"
                                name="session"
                                value={config.session}
                                onChange={handleChange}
                            />
                         </div>
                    </div>
                </div>

                <div className="flex-shrink-0 flex justify-end items-center pt-6 mt-4 border-t">
                     <button onClick={onBack} type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 mr-3">
                        Cancelar
                    </button>
                    <button onClick={handleSave} type="button" className={`inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors ${isSuccess ? 'bg-green-600' : 'bg-blue-800 hover:bg-blue-900'} disabled:bg-blue-400 disabled:cursor-not-allowed`} disabled={isSaving || isSuccess}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isSuccess ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />)}
                        {isSaving ? 'Salvando...' : (isSuccess ? 'Salvo!' : 'Salvar Configuração')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WhatsappConfigPage;