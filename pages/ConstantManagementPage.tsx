

import React, { useState, useEffect } from 'react';
import type { ConstantConfig, ConstantItem } from '../types';
import { ArrowLeft, Plus, Trash2, Save, Loader2, Check } from 'lucide-react';
import * as api from '../services/api';

interface ConstantManagementPageProps {
  config: ConstantConfig;
  onBack: () => void;
}

const ConstantManagementPage: React.FC<ConstantManagementPageProps> = ({ config, onBack }) => {
    const [items, setItems] = useState<ConstantItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const fetchItems = async () => {
            setIsLoading(true);
            const savedItems = await api.getConstant<ConstantItem[]>(config.key, config.defaultValues);
            setItems(savedItems);
            setIsLoading(false);
        };
        fetchItems();
    }, [config.key, config.defaultValues]);

    const handleItemChange = (index: number, field: keyof ConstantItem, value: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleAddItem = () => {
        setItems([...items, { value: '', observation: '' }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        setIsSuccess(false);
        try {
            // Filter out empty values before saving
            const validItems = items.filter(item => item.value.trim() !== '');
            await api.saveConstant(config.key, validItems);
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                onBack(); // Navigate back after success
            }, 1500);
        } catch (error) {
            console.error(`Failed to save constant ${config.key}`, error);
            alert('Falha ao salvar. Verifique o console para mais detalhes.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-blue-800" /></div>;
    }

    return (
        <div className="h-full w-full bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full flex flex-col">
                <div className="flex items-center mb-6">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 mr-4">
                        <ArrowLeft size={20} className="text-gray-700" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">{config.title}</h1>
                </div>

                <div className="flex-grow overflow-y-auto pr-2">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                             <ul className="space-y-4">
                                {items.map((item, index) => (
                                    <li key={index} className="bg-gray-50 p-4 rounded-lg border relative">
                                        <button onClick={() => handleRemoveItem(index)} className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100" aria-label="Remover item">
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="grid grid-cols-1 gap-4">
                                             <div>
                                                <label htmlFor={`value-${index}`} className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Valor</label>
                                                <input
                                                    type="text"
                                                    id={`value-${index}`}
                                                    value={item.value}
                                                    onChange={(e) => handleItemChange(index, 'value', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                    placeholder="Ex: Pregão Eletrônico"
                                                />
                                            </div>
                                             <div>
                                                <label htmlFor={`observation-${index}`} className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Observação / Ajuda</label>
                                                <textarea
                                                    id={`observation-${index}`}
                                                    value={item.observation}
                                                    onChange={(e) => handleItemChange(index, 'observation', e.target.value)}
                                                    rows={2}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                    placeholder="Explicação sobre o que este valor significa..."
                                                />
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            
                            <div className="mt-6 flex justify-center">
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="inline-flex items-center px-4 py-2 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 hover:border-gray-500"
                                >
                                    <Plus size={16} className="mr-2"/> Adicionar Novo Item
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 flex justify-end items-center pt-6 mt-4 border-t">
                    <button onClick={onBack} type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 mr-3">
                        Cancelar
                    </button>
                    <button onClick={handleSave} type="button" className={`inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors ${isSuccess ? 'bg-green-600' : 'bg-blue-800 hover:bg-blue-900'} disabled:bg-blue-400 disabled:cursor-not-allowed`} disabled={isSaving || isSuccess}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isSuccess ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />)}
                        {isSaving ? 'Salvando...' : (isSuccess ? 'Salvo!' : 'Salvar Alterações')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConstantManagementPage;