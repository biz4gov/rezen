

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, Check, BrainCircuit } from 'lucide-react';
import * as api from '../services/api';

interface PromptSettingsPageProps {
  onBack: () => void;
  initialPrompts: {
      edital: string;
      resumo: string;
      pedido: string;
      nf: string;
      empresa: string;
  }
}

const PromptSettingsPage: React.FC<PromptSettingsPageProps> = ({ onBack, initialPrompts }) => {
    const [promptEdital, setPromptEdital] = useState('');
    const [promptResumo, setPromptResumo] = useState('');
    const [promptPedido, setPromptPedido] = useState('');
    const [promptNf, setPromptNf] = useState('');
    const [promptEmpresa, setPromptEmpresa] = useState('');
    
    const [isSaving, setIsSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    useEffect(() => {
        setPromptEdital(initialPrompts.edital);
        setPromptResumo(initialPrompts.resumo);
        setPromptPedido(initialPrompts.pedido);
        setPromptNf(initialPrompts.nf);
        setPromptEmpresa(initialPrompts.empresa);
    }, [initialPrompts]);

    const handleSave = async () => {
        setIsSaving(true);
        setIsSuccess(false);
        try {
            await Promise.all([
                api.saveGeminiPromptEdital(promptEdital),
                api.saveGeminiPromptResumo(promptResumo),
                api.saveGeminiPromptPedido(promptPedido),
                api.saveGeminiPromptNf(promptNf),
                api.saveGeminiPromptEmpresa(promptEmpresa)
            ]);
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                onBack(); // Navigate back after success
            }, 1500);
        } catch (error) {
            console.error('Failed to save prompts', error);
            alert('Falha ao salvar. Verifique o console para mais detalhes.');
        } finally {
            setIsSaving(false);
        }
    };
    
    const PromptEditor: React.FC<{ title: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; }> = ({ title, value, onChange }) => (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
            <textarea
                value={value}
                onChange={onChange}
                className="w-full h-80 p-3 font-mono text-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 leading-relaxed"
            />
        </div>
    );

    return (
        <div className="h-full w-full bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full flex flex-col">
                <div className="flex-shrink-0 flex items-center mb-6">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 mr-4">
                        <ArrowLeft size={20} className="text-gray-700" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <BrainCircuit className="mr-3 text-blue-600" size={24}/>
                        Gerenciar Prompts da IA (Gemini)
                    </h1>
                </div>

                <div className="flex-grow overflow-y-auto pr-2">
                    <div className="space-y-6">
                        <PromptEditor 
                            title="Prompt de Análise de Edital (Extração de Dados)" 
                            value={promptEdital}
                            onChange={(e) => setPromptEdital(e.target.value)}
                        />
                         <PromptEditor 
                            title="Prompt de Resumo do Edital (Relatório de Análise)" 
                            value={promptResumo}
                            onChange={(e) => setPromptResumo(e.target.value)}
                        />
                         <PromptEditor 
                            title="Prompt de Análise de Cartão CNPJ" 
                            value={promptEmpresa}
                            onChange={(e) => setPromptEmpresa(e.target.value)}
                        />
                        <PromptEditor 
                            title="Prompt de Análise de Nota de Empenho" 
                            value={promptPedido}
                            onChange={(e) => setPromptPedido(e.target.value)}
                        />
                        <PromptEditor 
                            title="Prompt de Análise de Nota Fiscal" 
                            value={promptNf}
                            onChange={(e) => setPromptNf(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-shrink-0 flex justify-end items-center pt-6 mt-4 border-t">
                    <button onClick={onBack} type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 mr-3">
                        Cancelar
                    </button>
                    <button onClick={handleSave} type="button" className={`inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors ${isSuccess ? 'bg-green-600' : 'bg-blue-800 hover:bg-blue-900'} disabled:bg-blue-400 disabled:cursor-not-allowed`} disabled={isSaving || isSuccess}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isSuccess ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />)}
                        {isSaving ? 'Salvando...' : (isSuccess ? 'Salvo!' : 'Salvar Prompts')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromptSettingsPage;