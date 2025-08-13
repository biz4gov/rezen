



import React, { useState, useCallback, useEffect } from 'react';
import type { UnidadeAdministrativaData, StoredImage } from '../types';
import FormField from '../components/FormField';
import ImageUpload from '../components/ImageUpload';
import DynamicContactArray from '../components/DynamicContactArray';
import MaskedInput from '../components/MaskedInput';
import { Save, ArrowLeft, Loader2, Check, MapPin, Image as ImageIcon, Landmark } from 'lucide-react';
import { UFS } from '../constants';

interface UnidadeAdministrativaPageProps {
  onSave: (data: UnidadeAdministrativaData) => Promise<void>;
  onCancel: () => void;
  initialData?: UnidadeAdministrativaData;
}

const UnidadeAdministrativaPage: React.FC<UnidadeAdministrativaPageProps> = ({ onSave, onCancel, initialData }) => {
    const getInitialState = useCallback((): UnidadeAdministrativaData => {
        if (initialData) return initialData;
        return {
            unidade_unique_id: `unid_${Date.now()}`,
            nome_completo: '',
            cpf_cnpj: '',
            uasg: '',
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
        };
    }, [initialData]);

    const [unidade, setUnidade] = useState<UnidadeAdministrativaData>(getInitialState());
    const [isSaving, setIsSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isFetchingCep, setIsFetchingCep] = useState(false);

    useEffect(() => {
        setUnidade(getInitialState());
    }, [getInitialState]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUnidade(prev => ({ ...prev, [name]: value }));
    }, []);
    
    const handleCepChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        setUnidade(prev => ({...prev, endereco_cep: e.target.value}));

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

            setUnidade(prev => ({
                ...prev,
                endereco_rua: data.logradouro,
                endereco_bairro: data.bairro,
                endereco_cidade: data.localidade,
                endereco_estado: data.uf,
            }));
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            setUnidade(prev => ({
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
    
    const handleImageChange = (field: 'logomarca', base64: string) => {
        const imageFile: StoredImage = { name: `${field}.png`, base64 };
        setUnidade(prev => ({ ...prev, [field]: imageFile }));
    };

    const handleImageRemove = (field: 'logomarca') => {
        setUnidade(prev => ({ ...prev, [field]: null }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        setIsSuccess(false);
        try {
            await onSave(unidade);
            setIsSuccess(true);
            onCancel(); // Navigate back after save
        } catch (error) {
             console.error("Falha ao salvar unidade:", error);
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
                             <h1 className="text-2xl font-bold text-gray-800">{initialData ? 'Editar Unidade' : 'Cadastrar Nova Unidade'}</h1>
                        </div>
                        <button type="submit" disabled={isSaving || isSuccess || !unidade.nome_completo || !unidade.cpf_cnpj} className={`inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors ${isSuccess ? 'bg-green-600' : 'bg-blue-800 hover:bg-blue-900'} disabled:bg-gray-400 disabled:cursor-not-allowed`}>
                            {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (isSuccess ? <Check className="mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />)}
                            {isSaving ? 'Salvando...' : (isSuccess ? 'Salva!' : 'Salvar Unidade')}
                        </button>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto">
                    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                         <div className="max-w-4xl mx-auto space-y-8">
                           
                            <FormSection title="Identificação" icon={<Landmark className="text-blue-500" />}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                   <FormField label="Nome Completo / Razão Social" name="nome_completo" value={unidade.nome_completo} onChange={handleChange} required className="md:col-span-3" />
                                   <MaskedInput label="CPF / CNPJ" name="cpf_cnpj" value={unidade.cpf_cnpj} onChange={handleChange} mask="cpfCnpj" required />
                                   <FormField label="UASG" name="uasg" value={unidade.uasg || ''} onChange={handleChange} />
                                </div>
                                <div className="pt-6 mt-6 border-t border-gray-200 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                                    <DynamicContactArray label="E-mails" values={unidade.emails} setValues={(v) => setUnidade(p => ({...p, emails: v as any}))} contactType="email" />
                                    <DynamicContactArray label="Telefones" values={unidade.telefones} setValues={(v) => setUnidade(p => ({...p, telefones: v as any}))} contactType="phone" />
                                </div>
                            </FormSection>

                            <FormSection title="Endereço" icon={<MapPin className="text-green-500" />}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="relative">
                                        <MaskedInput label="CEP" name="endereco_cep" value={unidade.endereco_cep} onChange={handleCepChange} mask="cep" />
                                        {isFetchingCep && <Loader2 className="absolute right-2 top-9 h-4 w-4 animate-spin text-gray-400"/>}
                                    </div>
                                    <FormField label="Rua / Logradouro" name="endereco_rua" value={unidade.endereco_rua} onChange={handleChange} required className="md:col-span-2" />
                                    <FormField label="Número" name="endereco_numero" value={unidade.endereco_numero} onChange={handleChange} required />
                                    <FormField label="Complemento" name="endereco_complemento" value={unidade.endereco_complemento} onChange={handleChange} className="md:col-span-2"/>
                                    <FormField label="Bairro" name="endereco_bairro" value={unidade.endereco_bairro} onChange={handleChange} required />
                                    <FormField label="Cidade" name="endereco_cidade" value={unidade.endereco_cidade} onChange={handleChange} required />
                                    <FormField label="Estado" name="endereco_estado" type="select" options={UFS.map(uf => ({value: uf, observation: ''}))} value={unidade.endereco_estado} onChange={handleChange} required />
                                </div>
                            </FormSection>
                            
                            <FormSection title="Identidade Visual" icon={<ImageIcon className="text-purple-500" />}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <ImageUpload
                                        label="Logomarca"
                                        imageUrl={unidade.logomarca && 'base64' in unidade.logomarca ? unidade.logomarca.base64 : null}
                                        onImageChange={(base64) => handleImageChange('logomarca', base64)}
                                        onImageRemove={() => handleImageRemove('logomarca')}
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

export default UnidadeAdministrativaPage;