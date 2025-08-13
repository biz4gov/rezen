
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { EmpresaData, StoredImage, StoredFile } from '../types';
import FormField from '../components/FormField';
import ImageUpload from '../components/ImageUpload';
import DynamicContactArray from '../components/DynamicContactArray';
import MaskedInput, { masks } from '../components/MaskedInput';
import { Save, ArrowLeft, Loader2, Check, User, MapPin, Image as ImageIcon, Sparkles, UploadCloud } from 'lucide-react';
import * as api from '../services/api';
import { UFS } from '../constants';

interface EmpresaPageProps {
  onSave: (data: EmpresaData) => Promise<void>;
  onCancel: () => void;
  initialData?: EmpresaData;
  geminiPromptEmpresa: string;
}

const EmpresaPage: React.FC<EmpresaPageProps> = ({ onSave, onCancel, initialData, geminiPromptEmpresa }) => {
    const getInitialState = useCallback((): EmpresaData => {
        if (initialData) return initialData;
        return {
            empresa_unique_id: `emp_${Date.now()}`,
            nome_completo: '',
            cpf_cnpj: '',
            emails: [{ id: `email_${Date.now()}`, email: '', isPrimary: true }],
            telefones: [{ id: `phone_${Date.now()}`, phone: '', isPrimary: true, isWhatsapp: false }],
            endereco_cep: '',
            endereco_rua: '',
            endereco_numero: '',
            endereco_complemento: '',
            endereco_bairro: '',
            endereco_cidade: '',
            endereco_estado: '',
            logomarca: null,
            marca_dagua: null,
            cartao_cnpj_pdf: null,
        };
    }, [initialData]);

    const [empresa, setEmpresa] = useState<EmpresaData>(getInitialState());
    const [isSaving, setIsSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isFetchingCep, setIsFetchingCep] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        setEmpresa(getInitialState());
    }, [getInitialState]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEmpresa(prev => ({ ...prev, [name]: value }));
    }, []);
    
    const handleCepChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        setEmpresa(prev => ({...prev, endereco_cep: e.target.value}));

        if (cep.length === 8) {
            fetchAddressFromCep(cep);
        }
    }, []);

    const fetchAddressFromCep = async (cep: string) => {
        setIsFetchingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (!response.ok) throw new Error('CEP não encontrado');
            const data = await response.json();
            if (data.erro) throw new Error('CEP inválido');

            setEmpresa(prev => ({
                ...prev,
                endereco_rua: data.logradouro,
                endereco_bairro: data.bairro,
                endereco_cidade: data.localidade,
                endereco_estado: data.uf,
            }));
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            setEmpresa(prev => ({
                ...prev,
                endereco_rua: '',
                endereco_bairro: '',
                endereco_cidade: '',
                endereco_estado: '',
            }));
        } finally {
            setIsFetchingCep(false);
        }
    };
    
    const handleImageChange = (field: 'logomarca' | 'marca_dagua', base64: string) => {
        const imageFile: StoredImage = { name: `${field}.png`, base64 };
        setEmpresa(prev => ({ ...prev, [field]: imageFile }));
    };

    const handleImageRemove = (field: 'logomarca' | 'marca_dagua') => {
        setEmpresa(prev => ({ ...prev, [field]: null }));
    };
    
    const handleFileUpload = (file: File) => {
        if (file.type === 'application/pdf') {
            setEmpresa(prev => ({ ...prev, cartao_cnpj_pdf: file }));
        } else {
            alert('Por favor, selecione um arquivo PDF.');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) handleFileUpload(e.target.files[0]);
        e.target.value = '';
    };

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { handleDragEvents(e); if (!isDragging) setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { handleDragEvents(e); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        handleDragEvents(e);
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]);
    };

    const fileToGenerativePart = async (file: File) => {
        const base64EncodedDataPromise = new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(file);
        });
        return { inlineData: { data: await base64EncodedDataPromise, mimeType: file.type } };
    };

    const handleAnalyze = async () => {
        const currentFile = empresa.cartao_cnpj_pdf;
        if (!currentFile || !(currentFile instanceof File)) {
          alert('Por favor, carregue um novo arquivo PDF do Cartão CNPJ para análise.');
          return;
        }
        if (!process.env.API_KEY) {
          alert('A chave da API do Gemini não foi configurada.');
          return;
        }
    
        setIsAnalyzing(true);
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const filePart = await fileToGenerativePart(currentFile);
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [filePart] }],
            config: { systemInstruction: geminiPromptEmpresa, responseMimeType: 'application/json' }
          });
          let text = response.text.trim();
          if (text.startsWith('```json')) text = text.substring(7, text.length - 3).trim();
          else if (text.startsWith('```')) text = text.substring(3, text.length - 3).trim();
          const extractedData = JSON.parse(text);

          setEmpresa(prev => ({
            ...prev,
            nome_completo: extractedData.nome_completo || prev.nome_completo,
            cpf_cnpj: extractedData.cpf_cnpj ? masks.cpfCnpj(extractedData.cpf_cnpj) : prev.cpf_cnpj,
            endereco_cep: extractedData.endereco_cep ? masks.cep(extractedData.endereco_cep) : prev.endereco_cep,
            endereco_rua: extractedData.endereco_rua || prev.endereco_rua,
            endereco_numero: extractedData.endereco_numero || prev.endereco_numero,
            endereco_complemento: extractedData.endereco_complemento || prev.endereco_complemento,
            endereco_bairro: extractedData.endereco_bairro || prev.endereco_bairro,
            endereco_cidade: extractedData.endereco_cidade || prev.endereco_cidade,
            endereco_estado: extractedData.endereco_estado || prev.endereco_estado,
            emails: extractedData.email ? [{ id: `email_${Date.now()}`, email: extractedData.email, isPrimary: true }] : prev.emails,
            telefones: extractedData.telefone ? [{ id: `phone_${Date.now()}`, phone: masks.phone(extractedData.telefone), isPrimary: true, isWhatsapp: false }] : prev.telefones,
          }));
        } catch (error) {
          console.error("Erro ao analisar o Cartão CNPJ:", error);
          alert(`Ocorreu um erro ao analisar o documento. Verifique o console para mais detalhes.`);
        } finally {
          setIsAnalyzing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        setIsSuccess(false);
        try {
            await onSave(empresa);
            setIsSuccess(true);
        } catch (error) {
             console.error("Falha ao salvar empresa:", error);
             setIsSaving(false);
        }
    };
    
    const FormSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">{icon}<span className="ml-3">{title}</span></h2>
        {children}
      </div>
    );

    return (
        <div className="h-full flex flex-col bg-gray-50">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex-shrink-0 bg-white p-4 z-10 shadow-sm border-b">
                    <div className="container mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button type="button" onClick={onCancel} className="p-2 rounded-full hover:bg-gray-200"><ArrowLeft size={20} /></button>
                             <h1 className="text-2xl font-bold text-gray-800">{initialData ? 'Editar Empresa' : 'Cadastrar Nova Empresa'}</h1>
                        </div>
                        <button type="submit" disabled={isSaving || isSuccess || !empresa.nome_completo || !empresa.cpf_cnpj} className={`inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors ${isSuccess ? 'bg-green-600' : 'bg-blue-800 hover:bg-blue-900'} disabled:bg-gray-400 disabled:cursor-not-allowed`}>
                            {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (isSuccess ? <Check className="mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />)}
                            {isSaving ? 'Salvando...' : (isSuccess ? 'Salvo!' : 'Salvar Empresa')}
                        </button>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto">
                    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                         <div className="max-w-4xl mx-auto space-y-8">
                           
                            <FormSection title="Identificação" icon={<User className="text-blue-500" />}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Arquivo do Cartão CNPJ (PDF)</label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-grow">
                                                <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${isDragging ? 'border-blue-500' : 'border-gray-300'} border-dashed rounded-md transition-colors`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                                                    <div className="space-y-1 text-center">
                                                        <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                                                        <div className="flex text-sm text-gray-600">
                                                            <label htmlFor="cartao_cnpj_pdf" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                                <span>Carregar um arquivo</span><input id="cartao_cnpj_pdf" name="cartao_cnpj_pdf" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf" />
                                                            </label>
                                                            <p className="pl-1">ou arraste e solte</p>
                                                        </div>
                                                        <p className="text-xs text-gray-500">Apenas PDF</p>
                                                    </div>
                                                </div>
                                                {empresa.cartao_cnpj_pdf?.name && <p className="mt-2 text-sm text-gray-500">Arquivo selecionado: {empresa.cartao_cnpj_pdf.name}</p>}
                                            </div>
                                            <div className="relative flex items-center group">
                                                <button type="button" onClick={handleAnalyze} disabled={!empresa.cartao_cnpj_pdf || isAnalyzing} className="p-3 inline-flex items-center justify-center rounded-full bg-blue-800 text-white shadow-sm hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors" aria-label={isAnalyzing ? 'Analisando documento' : 'Analisar com IA'}>
                                                    {isAnalyzing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />}
                                                </button>
                                                <div className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30">{isAnalyzing ? 'Analisando...' : 'Analisar com IA'}</div>
                                            </div>
                                        </div>
                                    </div>
                                   <FormField label="Nome Completo / Razão Social" name="nome_completo" value={empresa.nome_completo} onChange={handleChange} required className="md:col-span-2" />
                                   <MaskedInput label="CPF / CNPJ" name="cpf_cnpj" value={empresa.cpf_cnpj} onChange={handleChange} mask="cpfCnpj" required />
                                </div>
                                <div className="pt-6 mt-6 border-t border-gray-200 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                                    <DynamicContactArray label="E-mails" values={empresa.emails} setValues={(v) => setEmpresa(p => ({...p, emails: v as any}))} contactType="email" />
                                    <DynamicContactArray label="Telefones" values={empresa.telefones} setValues={(v) => setEmpresa(p => ({...p, telefones: v as any}))} contactType="phone" />
                                </div>
                            </FormSection>

                            <FormSection title="Endereço" icon={<MapPin className="text-green-500" />}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="relative">
                                        <MaskedInput label="CEP" name="endereco_cep" value={empresa.endereco_cep} onChange={handleCepChange} mask="cep" />
                                        {isFetchingCep && <Loader2 className="absolute right-2 top-9 h-4 w-4 animate-spin text-gray-400"/>}
                                    </div>
                                    <FormField label="Rua / Logradouro" name="endereco_rua" value={empresa.endereco_rua} onChange={handleChange} required className="md:col-span-2" />
                                    <FormField label="Número" name="endereco_numero" value={empresa.endereco_numero} onChange={handleChange} required />
                                    <FormField label="Complemento" name="endereco_complemento" value={empresa.endereco_complemento} onChange={handleChange} className="md:col-span-2"/>
                                    <FormField label="Bairro" name="endereco_bairro" value={empresa.endereco_bairro} onChange={handleChange} required />
                                    <FormField label="Cidade" name="endereco_cidade" value={empresa.endereco_cidade} onChange={handleChange} required />
                                    <FormField label="Estado" name="endereco_estado" type="select" options={UFS.map(uf => ({value: uf, observation: ''}))} value={empresa.endereco_estado} onChange={handleChange} required />
                                </div>
                            </FormSection>
                            
                            <FormSection title="Identidade Visual" icon={<ImageIcon className="text-purple-500" />}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <ImageUpload
                                        label="Logomarca"
                                        imageUrl={empresa.logomarca && 'base64' in empresa.logomarca ? empresa.logomarca.base64 : null}
                                        onImageChange={(base64) => handleImageChange('logomarca', base64)}
                                        onImageRemove={() => handleImageRemove('logomarca')}
                                    />
                                    <ImageUpload
                                        label="Marca D'água"
                                        imageUrl={empresa.marca_dagua && 'base64' in empresa.marca_dagua ? empresa.marca_dagua.base64 : null}
                                        onImageChange={(base64) => handleImageChange('marca_dagua', base64)}
                                        onImageRemove={() => handleImageRemove('marca_dagua')}
                                    />
                                </div>
                            </FormSection>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EmpresaPage;