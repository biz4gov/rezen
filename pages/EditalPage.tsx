import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { LicitacaoData, StoredFile, ConstantItem, WhatsappConfig, UnidadeAdministrativaData, EmailEntry, PhoneEntry, EmpresaData } from '../types';
import { UFS } from '../constants';
import FormField from '../components/FormField';
import SelectWithCustom from '../components/SelectWithCustom';
import DynamicFieldArray from '../components/DynamicFieldArray';
import MaskedInput, { masks } from '../components/MaskedInput';
import ItensLicitacao from '../components/ItensLicitacao';
import PdfViewer from '../components/PdfViewer';
import MultiSelectCheckbox from '../components/MultiSelectCheckbox';
import { sendWhatsappNotification } from '../services/notificationService';
import WhatsappRecipientModal from '../components/WhatsappRecipientModal';
import SummaryModal from '../components/SummaryModal';
import { Check, UploadCloud, FileText, Building, Hammer, Calendar, BookOpen, Truck, Shield, Package, Loader2, Sparkles, PlusCircle, Info, MessageSquare, ArrowLeft, CheckCircle } from 'lucide-react';
import DateField from '../components/DateField';

const parseCurrency = (value: string | number | null | undefined): number => {
  if (typeof value === 'number') return value;
  if (!value || typeof value !== 'string') return 0;
  const cleanedValue = value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
  const parsed = parseFloat(cleanedValue);
  return isNaN(parsed) ? 0 : parsed;
};

interface EditalPageProps {
  onSave: (data: LicitacaoData) => Promise<void>;
  onCancel: () => void;
  initialData?: LicitacaoData;
  onNavigateToProposta: (licitacaoId: string) => void;
  modalidades: ConstantItem[];
  legislacoes: ConstantItem[];
  criterios: ConstantItem[];
  modosDisputa: ConstantItem[];
  geminiSystemPrompt: string;
  geminiResumoPrompt: string;
  whatsappConfig: WhatsappConfig;
  unidadesAdministrativas: UnidadeAdministrativaData[];
  empresas: EmpresaData[];
  onSaveUnidade: (data: UnidadeAdministrativaData) => Promise<void>;
  onShowAlert: (message: string) => void;
}

const EditalPage: React.FC<EditalPageProps> = ({ 
    onSave, onCancel, initialData, onNavigateToProposta,
    modalidades, legislacoes, criterios, modosDisputa, geminiSystemPrompt, geminiResumoPrompt, whatsappConfig,
    unidadesAdministrativas, empresas, onSaveUnidade, onShowAlert
}) => {

  const getInitialLicitacaoState = useCallback((): Omit<LicitacaoData, 'unidade_administrativa_id'> => ({
    licitacao_unique: `lic_${Date.now()}`, licitacao_numero: '', licitacao_data_sessao: '',
    licitacao_objeto: '', licitacao_modalidade: modalidades[0]?.value || '', licitacao_portal: '', licitacao_processo: '', licitacao_SRP: false,
    licitacao_SRPvalidade: '', licitacao_SRPadesao: false, licitacao_prazoimpugnacao: '', licitacao_legislacao: [],
    licitacao_criterio: criterios[0]?.value || '', licitacao_modo: modosDisputa[0]?.value || '', licitacao_validadeproposta: '', licitacao_garantiacontrato: '',
    licitacao_garantiaproduto: '', licitacao_prazoentrega: '', licitacao_localentrega: '', licitacao_cidadeentrega: '',
    licitacao_estadoentrega: '', licitacao_CEPentrega: '', licitacao_orientacoesentrega: '', licitacao_arquivo: null,
    itens_licitacao: [],
    licitacao_resumo_ia: '',
  }), [modalidades, criterios, modosDisputa]);

  const getInitialOrgaoState = (): Partial<UnidadeAdministrativaData> => ({
    nome_completo: '', uasg: '', cpf_cnpj: '', endereco_rua: '', endereco_cep: '', endereco_cidade: '', endereco_estado: '',
    emails: [{id: '1', email: '', isPrimary: true}], 
    telefones: [{id: '1', phone: '', isPrimary: true, isWhatsapp: false}],
  });
  
  const [formData, setFormData] = useState<LicitacaoData>(() => ({ ...getInitialLicitacaoState(), unidade_administrativa_id: '' }));
  const [orgaoExibido, setOrgaoExibido] = useState<Partial<UnidadeAdministrativaData>>(getInitialOrgaoState());

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSendingWpp, setIsSendingWpp] = useState(false);
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryToSend, setSummaryToSend] = useState('');
  
  const [unidadeToUpdate, setUnidadeToUpdate] = useState<UnidadeAdministrativaData | null>(null);
  const [willCreateNewUnidade, setWillCreateNewUnidade] = useState(false);
  const [unidadeUpdateSuccess, setUnidadeUpdateSuccess] = useState('');


  useEffect(() => {
    if (initialData) {
        setFormData(initialData);
        const orgao = unidadesAdministrativas.find(u => u.unidade_unique_id === initialData.unidade_administrativa_id);
        if (orgao) {
            setOrgaoExibido(orgao);
        }
    } else {
        setFormData({ ...getInitialLicitacaoState(), unidade_administrativa_id: '' });
        setOrgaoExibido(getInitialOrgaoState());
    }
  }, [initialData, getInitialLicitacaoState, unidadesAdministrativas]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleOrgaoChange = useCallback((field: keyof UnidadeAdministrativaData, value: any) => {
    setOrgaoExibido(prev => ({ ...prev, [field]: value }));
    // Clear linkage flags if user manually edits organ data
    setUnidadeToUpdate(null);
    setWillCreateNewUnidade(false);
    setFormData(prev => ({ ...prev, unidade_administrativa_id: '' }));
  }, []);
  
    const handleSelectUnidade = (unidadeId: string) => {
        if (!unidadeId) {
            setFormData(prev => ({ ...prev, unidade_administrativa_id: '' }));
            setOrgaoExibido(getInitialOrgaoState());
            return;
        }
      const selectedUnidade = unidadesAdministrativas.find(u => u.unidade_unique_id === unidadeId);
      if (selectedUnidade) {
        setOrgaoExibido(selectedUnidade);
        setFormData(prev => ({ ...prev, unidade_administrativa_id: selectedUnidade.unidade_unique_id }));
        setUnidadeToUpdate(null);
        setWillCreateNewUnidade(false);
      }
    };

  const handleFileUpload = (file: File) => {
    if (file.type === 'application/pdf') {
        setFormData(prev => ({ ...prev, licitacao_arquivo: file }));
      } else {
        alert('Por favor, selecione um arquivo PDF.');
      }
  }

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
  
  const handleCustomSelectChange = useCallback((name: keyof LicitacaoData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as any }));
  }, []);

  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return { inlineData: { data: await base64EncodedDataPromise, mimeType: file.type } };
  };

  const handleAnalyze = async () => {
    if (!formData.licitacao_arquivo || !process.env.API_KEY) {
      onShowAlert(!process.env.API_KEY ? 'A chave da API do Gemini não foi configurada.' : 'Por favor, carregue um arquivo PDF primeiro.');
      return;
    }

    if (!(formData.licitacao_arquivo instanceof File)) {
      onShowAlert('Análise de IA só pode ser feita em um novo arquivo PDF. Para re-analisar, por favor, carregue o arquivo novamente.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const filePart = await fileToGenerativePart(formData.licitacao_arquivo);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', contents: [{ parts: [filePart, {text: "Extraia os dados do edital em formato JSON, conforme as instruções."}]}],
        config: { systemInstruction: geminiSystemPrompt, responseMimeType: 'application/json' }
      });
      let text = response.text.trim();
      if (text.startsWith('```json')) text = text.substring(7, text.length - 3).trim();
      else if (text.startsWith('```')) text = text.substring(3, text.length - 3).trim();
      const extractedData = JSON.parse(text);

      const toBoolean = (val: any) => typeof val === 'string' && val.toLowerCase() === 'sim';
      
      const mappedItems = (extractedData.itens_licitacao || []).map((item: any) => ({
        item_licitacao: String(item.item_licitacao || ''), item_descricao: item.item_descricao || '',
        item_quantidade: String(item.item_quantidade || ''), 
        item_unitario: parseCurrency(item.item_unitario),
        item_meepp: toBoolean(item.item_meepp),
      }));

      const legislacaoValue = extractedData.licitacao_legislacao;
      let matchedLegislacoes: string[] = [];
      if (Array.isArray(legislacaoValue)) {
          matchedLegislacoes = legislacaoValue.filter(l => typeof l === 'string' && legislacoes.some(opt => opt.value === l));
      } else if (typeof legislacaoValue === 'string') {
          matchedLegislacoes = legislacoes
              .filter(option => legislacaoValue.toLowerCase().includes(option.value.toLowerCase()))
              .map(option => option.value);
      }
      
      const extractedOrgao = {
          nome_completo: extractedData.orgao_nome,
          uasg: extractedData.orgao_UASG,
          cpf_cnpj: masks.cnpj(extractedData.orgao_CNPJ || ''),
          endereco_rua: extractedData.orgao_endereco,
          endereco_cep: masks.cep(extractedData.orgao_CEP || ''),
          endereco_cidade: extractedData.orgao_municipio,
          endereco_estado: extractedData.orgao_estado,
          emails: (Array.isArray(extractedData.orgao_email) ? extractedData.orgao_email : [extractedData.orgao_email || '']).map((e:string, i:number) => ({id: String(i), email: e, isPrimary: i===0})),
          telefones: (Array.isArray(extractedData.orgao_telefone) ? extractedData.orgao_telefone : [extractedData.orgao_telefone || '']).map((t:string, i:number) => ({id: String(i), phone: masks.phone(t), isPrimary: i===0, isWhatsapp: false})),
      };
      setOrgaoExibido(extractedOrgao);

      setUnidadeToUpdate(null);
      setWillCreateNewUnidade(false);
      setUnidadeUpdateSuccess('');
      if(extractedOrgao.cpf_cnpj) {
          const existingUnit = unidadesAdministrativas.find(u => u.cpf_cnpj === extractedOrgao.cpf_cnpj);
          if (existingUnit) {
              setUnidadeToUpdate(existingUnit);
          } else {
              setWillCreateNewUnidade(true);
          }
      }

      const cleanExtractedLicitacao = Object.fromEntries(Object.entries({
            licitacao_numero: extractedData.licitacao_numero,
            licitacao_objeto: extractedData.licitacao_objeto, licitacao_modalidade: extractedData.licitacao_modalidade,
            licitacao_portal: extractedData.licitacao_portal, licitacao_processo: extractedData.licitacao_processo,
            licitacao_SRPvalidade: String(extractedData.licitacao_SRPvalidade || '').replace(/\D/g, ''),
            licitacao_prazoimpugnacao: extractedData.licitacao_prazoimpugnacao,
            licitacao_criterio: extractedData.licitacao_criterio, licitacao_modo: extractedData.licitacao_modo,
            licitacao_validadeproposta: String(extractedData.licitacao_validadeproposta || '').replace(/\D/g, ''),
            licitacao_garantiacontrato: extractedData.licitacao_garantiacontrato, licitacao_garantiaproduto: extractedData.licitacao_garantiaproduto,
            licitacao_prazoentrega: String(extractedData.licitacao_prazoentrega || '').replace(/\D/g, ''),
            licitacao_localentrega: extractedData.licitacao_localentrega, licitacao_cidadeentrega: extractedData.licitacao_cidadeentrega,
            licitacao_estadoentrega: extractedData.licitacao_estadoentrega, licitacao_CEPentrega: masks.cep(extractedData.licitacao_CEPentrega || ''),
            licitacao_orientacoesentrega: extractedData.licitacao_orientacoesentrega,
      }).filter(([_, v]) => v !== undefined && v !== null));

      setFormData(prev => ({
        ...prev, ...cleanExtractedLicitacao,
        unidade_administrativa_id: '', // Unlink from any previously selected unit
        licitacao_legislacao: matchedLegislacoes,
        licitacao_data_sessao: extractedData.licitacao_data_sessao ? masks.datetime(extractedData.licitacao_data_sessao) : prev.licitacao_data_sessao,
        licitacao_SRP: toBoolean(extractedData.licitacao_SRP),
        licitacao_SRPadesao: toBoolean(extractedData.licitacao_SRPadesao),
        itens_licitacao: mappedItems,
      }));
    } catch (error) {
      console.error("Erro ao analisar o edital:", error); onShowAlert(`Ocorreu um erro ao analisar o edital. Verifique o console para mais detalhes.`);
    } finally { setIsAnalyzing(false); }
  };
  
  const handleUpdateUnidade = async () => {
    if (!unidadeToUpdate || !orgaoExibido.cpf_cnpj) return;
    
    const updatedUnidade: UnidadeAdministrativaData = {
        ...unidadeToUpdate,
        nome_completo: orgaoExibido.nome_completo || unidadeToUpdate.nome_completo,
        uasg: orgaoExibido.uasg || unidadeToUpdate.uasg,
        emails: (orgaoExibido.emails?.filter(e => e.email))?.length ? orgaoExibido.emails : unidadeToUpdate.emails,
        telefones: (orgaoExibido.telefones?.filter(t => t.phone))?.length ? orgaoExibido.telefones : unidadeToUpdate.telefones,
        endereco_cep: orgaoExibido.endereco_cep || unidadeToUpdate.endereco_cep,
        endereco_rua: orgaoExibido.endereco_rua || unidadeToUpdate.endereco_rua,
        endereco_cidade: orgaoExibido.endereco_cidade || unidadeToUpdate.endereco_cidade,
        endereco_estado: orgaoExibido.endereco_estado || unidadeToUpdate.endereco_estado,
    };
    
    try {
      await onSaveUnidade(updatedUnidade);
      setUnidadeUpdateSuccess(`Unidade "${updatedUnidade.nome_completo}" atualizada com sucesso!`);
      setFormData(prev => ({...prev, unidade_administrativa_id: updatedUnidade.unidade_unique_id}));
      setUnidadeToUpdate(null);
    } catch(error) {
      console.error("Failed to update unidade", error);
      onShowAlert("Falha ao atualizar a unidade.");
    }
  };
  
  const handleGenerateSummary = async () => {
    if (!process.env.API_KEY) {
        onShowAlert('A chave da API do Gemini não foi configurada. Não é possível gerar o resumo.');
        return;
    }

    setIsGeneratingSummary(true);
    setIsSummaryModalOpen(true);

    try {
        const dataForPrompt = `
        - **Dados do Órgão:**
          - Nome: ${orgaoExibido.nome_completo}
          - UASG: ${orgaoExibido.uasg}
          - CNPJ: ${orgaoExibido.cpf_cnpj}
          - Contato: ${[...orgaoExibido.emails?.map(e => e.email) || [], ...orgaoExibido.telefones?.map(t => t.phone) || []].join(', ')}
        - **Dados da Licitação:**
          - Objeto: ${formData.licitacao_objeto}
          - Modalidade: ${formData.licitacao_modalidade}
          - Portal: ${formData.licitacao_portal}
          - Número: ${formData.licitacao_numero}
          - Sessão: ${formData.licitacao_data_sessao}
        - **Condições da Disputa:**
          - Critério: ${formData.licitacao_criterio}
          - Modo: ${formData.licitacao_modo}
          - Exclusividade ME/EPP: ${formData.itens_licitacao.some(i => i.item_meepp) ? 'Sim' : 'Não'}
        - **Condições da Proposta:**
          - Validade: ${formData.licitacao_validadeproposta} dias
          - Garantia Contratual: ${formData.licitacao_garantiacontrato}
          - Prazo de Entrega: ${formData.licitacao_prazoentrega} dias
        - **Produtos em Disputa:**
          ${formData.itens_licitacao.map(item => `* Item ${item.item_licitacao}: ${item.item_descricao.substring(0, 100)}... - Qtd: ${item.item_quantidade} - Ref: R$ ${item.item_unitario.toFixed(2)}`).join('\n')}
        `;
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: `CONTEXTO:\n${dataForPrompt}` }] }],
            config: { systemInstruction: geminiResumoPrompt }
        });

        setFormData(prev => ({ ...prev, licitacao_resumo_ia: response.text }));
    } catch (error) {
        console.error("Erro ao gerar resumo da licitação:", error);
        onShowAlert(`Ocorreu um erro ao gerar o resumo. Verifique o console.`);
        setFormData(prev => ({ ...prev, licitacao_resumo_ia: 'Falha ao gerar resumo.' }));
    } finally {
        setIsGeneratingSummary(false);
    }
};

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
        let unidadeId = formData.unidade_administrativa_id;

        if (!unidadeId && orgaoExibido.cpf_cnpj && orgaoExibido.nome_completo) {
            const existingUnit = unidadesAdministrativas.find(u => u.cpf_cnpj === orgaoExibido.cpf_cnpj);
            if (existingUnit) {
                unidadeId = existingUnit.unidade_unique_id;
            } else {
                const newUnidade: UnidadeAdministrativaData = {
                    unidade_unique_id: `unid_${Date.now()}`,
                    nome_completo: orgaoExibido.nome_completo,
                    cpf_cnpj: orgaoExibido.cpf_cnpj,
                    uasg: orgaoExibido.uasg || '',
                    emails: (orgaoExibido.emails || []).filter(e => e.email),
                    telefones: (orgaoExibido.telefones || []).filter(t => t.phone),
                    endereco_cep: orgaoExibido.endereco_cep || '',
                    endereco_rua: orgaoExibido.endereco_rua || '',
                    endereco_numero: orgaoExibido.endereco_numero || '',
                    endereco_complemento: orgaoExibido.endereco_complemento || '',
                    endereco_bairro: orgaoExibido.endereco_bairro || '',
                    endereco_cidade: orgaoExibido.endereco_cidade || '',
                    endereco_estado: orgaoExibido.endereco_estado || '',
                    logomarca: null
                };
                await onSaveUnidade(newUnidade);
                unidadeId = newUnidade.unidade_unique_id;
            }
        }

        if (!unidadeId) {
            onShowAlert("Órgão não vinculado. Selecione um órgão existente ou preencha os dados para criar um novo.");
            setIsSaving(false);
            return;
        }

        const licitacaoToSave: LicitacaoData = { ...formData, unidade_administrativa_id: unidadeId };
        await onSave(licitacaoToSave);

    } catch (error) {
        console.error("Falha ao salvar edital:", error);
        onShowAlert(`Falha ao salvar edital: ${error}`);
    } finally {
        setIsSaving(false);
    }
};


    const handleSaveWithSummary = async (summaryText: string) => {
        setIsSaving(true);
        try {
            const licitacaoToSave: LicitacaoData = { ...formData, licitacao_resumo_ia: summaryText };
            await onSave(licitacaoToSave);
        } catch (error) {
            console.error("Falha ao salvar edital:", error);
            onShowAlert(`Falha ao salvar edital: ${error}`);
        } finally {
            setIsSaving(false);
            setIsSummaryModalOpen(false);
        }
    };

    const handleSummarySend = (summaryText: string) => {
        setSummaryToSend(summaryText);
        setFormData(prev => ({ ...prev, licitacao_resumo_ia: summaryText }));
        setIsSummaryModalOpen(false);
        setIsWhatsappModalOpen(true);
    };

    const handleSendWhatsappFromModal = async (phoneNumber: string) => {
        setIsSendingWpp(true);
        const result = await sendWhatsappNotification(whatsappConfig, summaryToSend, phoneNumber);

        if (result.success) {
            onShowAlert('Notificação enviada com sucesso!');
            await handleSaveWithSummary(summaryToSend); // Salva e fecha após o envio bem-sucedido
        } else {
            onShowAlert(result.error || 'Ocorreu um erro ao enviar a notificação.');
        }
        setIsSendingWpp(false);
        setIsWhatsappModalOpen(false);
        setSummaryToSend('');
    };

  const FormSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">{icon}<span className="ml-3">{title}</span></h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{children}</div>
    </div>
  );

  return (
    <>
      <SummaryModal
        isOpen={isSummaryModalOpen}
        summaryText={formData.licitacao_resumo_ia || ''}
        isGenerating={isGeneratingSummary}
        isSaving={isSaving}
        onConfirm={handleSaveWithSummary}
        onSend={handleSummarySend}
        onCancel={() => setIsSummaryModalOpen(false)}
      />
      <WhatsappRecipientModal
        isOpen={isWhatsappModalOpen}
        onClose={() => setIsWhatsappModalOpen(false)}
        onSend={handleSendWhatsappFromModal}
        empresas={empresas}
        isSending={isSendingWpp}
      />
      <div className="flex h-full overflow-hidden bg-gray-50">
        <aside className="w-2/5 h-full flex flex-col bg-gray-200 border-r border-gray-300">
            {formData.licitacao_arquivo ? (<PdfViewer files={[{ label: 'Edital', source: formData.licitacao_arquivo }]} />) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-500 bg-gray-100">
                    <FileText size={48} className="mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-700">Visualizador de PDF</h3>
                    <p className="text-sm">Carregue um arquivo de edital para visualizá-lo aqui.</p>
                </div>
            )}
        </aside>
        <main className="w-3/5 h-full flex flex-col">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="flex-shrink-0 bg-white p-4 z-10 shadow-sm border-b">
                <div className="container mx-auto flex justify-between items-center">
                  <div className="flex items-center gap-4">
                      <button type="button" onClick={onCancel} className="p-2 rounded-full hover:bg-gray-200"><ArrowLeft size={20} /></button>
                        <h1 className="text-2xl font-bold text-gray-800">{initialData ? "Editar Edital" : "Novo Edital"}</h1>
                  </div>
                  <div className="flex items-center space-x-3">
                    {initialData && (
                        <button 
                            type="button" 
                            onClick={handleGenerateSummary}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-orange-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:bg-orange-300 disabled:cursor-not-allowed"
                            disabled={isSaving || isGeneratingSummary}
                        >
                            {isGeneratingSummary ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            {isGeneratingSummary ? 'Gerando...' : 'Gerar Resumo'}
                        </button>
                    )}
                    <button type="submit" className={`inline-flex items-center justify-center rounded-md border border-transparent px-5 py-2.5 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors bg-blue-800 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed`} disabled={isSaving || isGeneratingSummary}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                        {isSaving ? 'Salvando...' : 'Salvar Edital'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  
                  <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                          <FileText className="text-gray-500 mr-3" />
                          Arquivo do Edital
                      </h2>
                      <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Upload do PDF para Análise com IA</label>
                          <div className="flex items-start gap-4">
                              <div className="flex-grow">
                                  <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${isDragging ? 'border-blue-500' : 'border-gray-300'} border-dashed rounded-md transition-colors`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                                      <div className="space-y-1 text-center">
                                      <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                                      <div className="flex text-sm text-gray-600">
                                          <label htmlFor="licitacao_arquivo" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                          <span>Carregar um arquivo</span><input id="licitacao_arquivo" name="licitacao_arquivo" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf" />
                                          </label><p className="pl-1">ou arraste e solte</p>
                                      </div><p className="text-xs text-gray-500">Apenas PDF</p>
                                      </div>
                                  </div>
                                  {formData.licitacao_arquivo?.name && <p className="mt-2 text-sm text-gray-500">Arquivo selecionado: {formData.licitacao_arquivo.name}</p>}
                              </div>
                              <div className="relative flex items-center group pt-6">
                                  <button type="button" onClick={handleAnalyze} disabled={!formData.licitacao_arquivo || isAnalyzing} className="p-3 inline-flex items-center justify-center rounded-full bg-blue-800 text-white shadow-sm hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors" aria-label={isAnalyzing ? 'Analisando edital' : 'Analisar com IA'}>
                                      {isAnalyzing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />}
                                  </button>
                                  <div className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30">{isAnalyzing ? 'Analisando...' : 'Analisar com IA'}</div>
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  <FormSection title="Dados do Órgão" icon={<Building className="text-blue-500" />}>
                      <div className="md:col-span-3 pb-6 border-b border-gray-200 mb-6">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                              Órgão Existente (Opcional)
                          </label>
                          <p className="text-sm text-gray-600 mb-2">
                              Selecione um órgão já cadastrado para preencher automaticamente os dados abaixo.
                          </p>
                          <select 
                              onChange={(e) => handleSelectUnidade(e.target.value)}
                              value={formData.unidade_administrativa_id}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                          >
                              <option value="">Selecione um órgão ou preencha manualmente...</option>
                              {unidadesAdministrativas.map(u => (
                                  <option key={u.unidade_unique_id} value={u.unidade_unique_id}>
                                  {u.nome_completo} ({u.cpf_cnpj})
                                  </option>
                              ))}
                          </select>
                      </div>
                      {unidadeUpdateSuccess && (
                          <div className="md:col-span-3 mt-2 p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded-md flex items-center">
                              <CheckCircle size={16} className="mr-2" /> {unidadeUpdateSuccess}
                          </div>
                      )}
                      {unidadeToUpdate && (
                          <div className="md:col-span-3 mt-2 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-md flex items-center justify-between">
                              <span>Já existe uma unidade com este CNPJ. Deseja atualizar seus dados com as informações extraídas?</span>
                              <button type="button" onClick={handleUpdateUnidade} className="ml-4 px-3 py-1 text-xs font-semibold rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">Atualizar Unidade</button>
                          </div>
                      )}
                      {willCreateNewUnidade && !unidadeToUpdate && (
                          <div className="md:col-span-3 mt-2 p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm rounded-md flex items-center">
                              <Info size={16} className="mr-2" /> Uma nova Unidade Administrativa será criada com estes dados ao salvar o edital.
                          </div>
                      )}
                      <FormField label="UASG" name="uasg" value={orgaoExibido.uasg || ''} onChange={(e) => handleOrgaoChange('uasg', e.target.value)} required />
                      <FormField label="Nome do Órgão" name="nome_completo" value={orgaoExibido.nome_completo || ''} onChange={(e) => handleOrgaoChange('nome_completo', e.target.value)} required className="md:col-span-2" />
                      <MaskedInput label="CNPJ" name="cpf_cnpj" value={orgaoExibido.cpf_cnpj || ''} onChange={(e) => handleOrgaoChange('cpf_cnpj', e.target.value)} mask="cnpj" required />
                      <FormField label="Endereço" name="endereco_rua" value={orgaoExibido.endereco_rua || ''} onChange={(e) => handleOrgaoChange('endereco_rua', e.target.value)} required className="md:col-span-2" />
                      <MaskedInput label="CEP" name="endereco_cep" value={orgaoExibido.endereco_cep || ''} onChange={(e) => handleOrgaoChange('endereco_cep', e.target.value)} mask="cep" required />
                      <FormField label="Município" name="endereco_cidade" value={orgaoExibido.endereco_cidade || ''} onChange={(e) => handleOrgaoChange('endereco_cidade', e.target.value)} required />
                      <FormField label="UF" name="endereco_estado" type="select" options={UFS.map(uf => ({value: uf, observation: ''}))} value={orgaoExibido.endereco_estado || ''} onChange={(e) => handleOrgaoChange('endereco_estado', e.target.value)} required />
                      <DynamicFieldArray label="E-mail do Órgão" name="emails" values={(orgaoExibido.emails || []).map(e => e.email)} setValues={(v) => handleOrgaoChange('emails', v.map((email, i) => ({id: String(i), email, isPrimary: i === 0})))} inputType="email" className="md:col-span-3"/>
                      <DynamicFieldArray label="Telefone do Órgão" name="telefones" values={(orgaoExibido.telefones || []).map(t => t.phone)} setValues={(v) => handleOrgaoChange('telefones', v.map((phone, i) => ({id: String(i), phone, isPrimary: i === 0, isWhatsapp: false})))} inputType="tel" mask="phone" className="md:col-span-3"/>
                  </FormSection>
                  <FormSection title="Dados da Licitação" icon={<Hammer className="text-yellow-500" />}>
                      <FormField label="Código Único" name="licitacao_unique" value={formData.licitacao_unique} onChange={handleChange} disabled />
                      <FormField label="Número da Licitação" name="licitacao_numero" value={formData.licitacao_numero} onChange={handleChange} required />
                      <DateField label="Data/Hora da Sessão" name="licitacao_data_sessao" value={formData.licitacao_data_sessao} onChange={handleChange} type="datetime-local" required />
                      <FormField label="Objeto" name="licitacao_objeto" type="textarea" value={formData.licitacao_objeto} onChange={handleChange} required className="md:col-span-3" />
                      <SelectWithCustom label="Modalidade" name="licitacao_modalidade" value={formData.licitacao_modalidade} onChange={(v) => handleCustomSelectChange('licitacao_modalidade', v)} options={modalidades} required />
                      <FormField label="Portal" name="licitacao_portal" value={formData.licitacao_portal} onChange={handleChange} required />
                      <FormField label="Nº do Processo" name="licitacao_processo" value={formData.licitacao_processo} onChange={handleChange} required />
                  </FormSection>
                  <FormSection title="Sistema de Registro de Preços (SRP)" icon={<BookOpen className="text-green-500" />}>
                    <div className="md:col-span-3"><div className="flex items-center flex-wrap gap-x-8 gap-y-4">
                      <div className="flex items-center">
                        <input type="checkbox" id="licitacao_SRP" name="licitacao_SRP" checked={formData.licitacao_SRP} onChange={handleChange} className="h-5 w-5 rounded border-gray-300 text-blue-800 focus:ring-blue-500"/>
                        <label htmlFor="licitacao_SRP" className="ml-2 font-medium text-sm text-gray-700">Esta licitação utiliza SRP</label>
                      </div>
                      {formData.licitacao_SRP && (<div className="flex items-center flex-wrap gap-x-8 gap-y-4">
                        <div className="flex items-center gap-2">
                          <label htmlFor="licitacao_SRPvalidade" className="text-sm font-medium text-gray-700 shrink-0">Validade da Ata (meses)</label>
                          <input type="number" id="licitacao_SRPvalidade" name="licitacao_SRPvalidade" value={formData.licitacao_SRPvalidade} onChange={handleChange} required={formData.licitacao_SRP} className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"/>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="licitacao_SRPadesao" name="licitacao_SRPadesao" checked={formData.licitacao_SRPadesao} onChange={handleChange} className="h-5 w-5 rounded border-gray-300 text-blue-800 focus:ring-blue-500"/>
                          <label htmlFor="licitacao_SRPadesao" className="ml-2 font-medium text-sm text-gray-700">Permite Adesões</label>
                        </div>
                      </div>)}
                    </div></div>
                  </FormSection>
                  <FormSection title="Prazos e Critérios" icon={<Calendar className="text-red-500" />} >
                      <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          <div className="col-span-1">
                              <MultiSelectCheckbox
                                  label="Legislação Aplicável"
                                  options={legislacoes}
                                  selectedValues={formData.licitacao_legislacao}
                                  onChange={(v) => setFormData(p => ({...p, licitacao_legislacao: v}))}
                                  required
                              />
                          </div>
                          <div className="col-span-1 space-y-6">
                              <FormField label="Prazo/Data para Impugnação" name="licitacao_prazoimpugnacao" type="text" value={formData.licitacao_prazoimpugnacao} onChange={handleChange} required />
                              <SelectWithCustom label="Critério de Julgamento" name="licitacao_criterio" value={formData.licitacao_criterio} onChange={(v) => handleCustomSelectChange('licitacao_criterio', v)} options={criterios} required />
                              <SelectWithCustom label="Modo de Disputa" name="licitacao_modo" value={formData.licitacao_modo} onChange={(v) => handleCustomSelectChange('licitacao_modo', v)} options={modosDisputa} required />
                              <FormField label="Validade da Proposta (dias)" name="licitacao_validadeproposta" type="number" value={formData.licitacao_validadeproposta} onChange={handleChange} required />
                          </div>
                      </div>
                  </FormSection>
                  <FormSection title="Garantias" icon={<Shield className="text-indigo-500" />}>
                      <FormField label="Garantia do Contrato" name="licitacao_garantiacontrato" type="textarea" value={formData.licitacao_garantiacontrato} onChange={handleChange} className="md:col-span-3 lg:col-span-1" />
                      <FormField label="Garantia do Produto/Serviço" name="licitacao_garantiaproduto" type="textarea" value={formData.licitacao_garantiaproduto} onChange={handleChange} className="md:col-span-3 lg:col-span-2" />
                  </FormSection>
                  <FormSection title="Entrega e Execução" icon={<Truck className="text-cyan-500" />}>
                      <FormField label="Prazo de Entrega/Execução (dias)" name="licitacao_prazoentrega" type="number" value={formData.licitacao_prazoentrega} onChange={handleChange} required />
                      <FormField label="Endereço de Entrega/Execução" name="licitacao_localentrega" value={formData.licitacao_localentrega} onChange={handleChange} required className="md:col-span-2" />
                      <FormField label="Município de Entrega" name="licitacao_cidadeentrega" value={formData.licitacao_cidadeentrega} onChange={handleChange} required />
                      <FormField label="UF de Entrega" name="licitacao_estadoentrega" type="select" options={UFS.map(uf => ({value: uf, observation: ''}))} value={formData.licitacao_estadoentrega} onChange={handleChange} required />
                      <MaskedInput label="CEP de Entrega" name="licitacao_CEPentrega" value={formData.licitacao_CEPentrega} onChange={handleChange} mask="cep" required />
                      <FormField label="Orientações de Entrega/Execução" name="licitacao_orientacoesentrega" type="textarea" value={formData.licitacao_orientacoesentrega} onChange={handleChange} className="md:col-span-3" />
                  </FormSection>
                  <FormSection title="Itens" icon={<Package className="text-orange-500" />}>
                      <div className="md:col-span-3">
                          <ItensLicitacao items={formData.itens_licitacao} setItems={(newItems) => setFormData(p => ({ ...p, itens_licitacao: newItems }))} />
                      </div>
                  </FormSection>
                  <div className="flex justify-end items-center py-4 space-x-3 sticky bottom-0 bg-gray-50/80 backdrop-blur-sm">
                      {initialData && (
                          <button 
                              type="button" 
                              onClick={() => { setSummaryToSend(initialData.licitacao_resumo_ia || ''); setIsWhatsappModalOpen(true); }}
                              disabled={!initialData.licitacao_resumo_ia}
                              className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-300"
                              title={!initialData.licitacao_resumo_ia ? 'Salve a licitação primeiro para gerar um resumo' : 'Enviar Resumo via WhatsApp'}
                          >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              WhatsApp
                          </button>
                      )}
                      {initialData && (
                          <button 
                              type="button" 
                              onClick={() => onNavigateToProposta(initialData.licitacao_unique)}
                              className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                          >
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Proposta
                          </button>
                      )}
                  </div>
                </div>
              </div>
          </form>
        </main>
      </div>
    </>
  );
};

export default EditalPage;
