import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { PedidoData, LicitacaoData, PropostaData, ItemEmpenhado, StoredFile, ItemFaturado, NotaFiscalData, ConstantItem, WhatsappConfig, UnidadeAdministrativaData, ProductData, EmpresaData } from '../types';
import FormField from '../components/FormField';
import MaskedInput, { masks } from '../components/MaskedInput';
import PdfViewer from '../components/PdfViewer';
import ItensEmpenhados from '../components/ItensEmpenhados';
import ItensFaturados from '../components/ItensFaturados';
import { sendWhatsappNotification } from '../services/notificationService';
import WhatsappRecipientModal from '../components/WhatsappRecipientModal';
import { Check, UploadCloud, FileText, Building, Hammer, Package, Loader2, Sparkles, User, ChevronsRight, FileBadge, PlusCircle, Trash2, ClipboardList, MessageSquare, ArrowLeft, Calendar, Briefcase } from 'lucide-react';
import DateField from '../components/DateField';

const parseCurrency = (value: string | number | null | undefined): number => {
  if (typeof value === 'number') return value;
  if (!value || typeof value !== 'string') return 0;
  const cleanedValue = value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
  const parsed = parseFloat(cleanedValue);
  return isNaN(parsed) ? 0 : parsed;
};

interface PedidoPageProps {
  onSave: (data: PedidoData) => Promise<void>;
  onCancel: () => void;
  licitacao: LicitacaoData;
  proposta: PropostaData;
  initialData?: PedidoData;
  pedidoStatus: ConstantItem[];
  geminiPedidoPrompt: string;
  geminiNfPrompt: string;
  whatsappConfig: WhatsappConfig;
  unidadesAdministrativas: UnidadeAdministrativaData[];
  empresas: EmpresaData[];
  products: ProductData[];
  onShowAlert: (message: string) => void;
}

const buildInitialState = (
    licitacao: LicitacaoData, 
    proposta: PropostaData, 
    pedidoStatus: ConstantItem[]
): PedidoData => {
    
    const unidade_administrativa_id = (proposta.is_adesao && proposta.orgao_adesao_id)
        ? proposta.orgao_adesao_id
        : licitacao.unidade_administrativa_id;

    return {
        pedido_unique_id: `ped_${Date.now()}`,
        licitacao_unique_id: licitacao.licitacao_unique,
        proposta_unique_id: proposta.proposta_unique_id,
        empresa_unique_id: proposta.empresa_unique_id,
        unidade_administrativa_id: unidade_administrativa_id,
        data_criacao: new Date().toISOString(),
        pedido_status: (pedidoStatus[0]?.value || 'Empenho') as any,
        empenho_numero: '',
        empenho_data: '',
        itens_empenhados: [],
        empenho_arquivo: null,
        notas_fiscais: [],
        data_limite_entrega: '',
    };
};

const InfoCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; }> = ({ title, icon, children }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-full">
        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">{icon}<span className="ml-2">{title}</span></h3>
        <div className="space-y-1.5 text-sm text-gray-600">{children}</div>
    </div>
);


const PedidoPage: React.FC<PedidoPageProps> = ({ 
    onSave, onCancel, licitacao, proposta, initialData,
    pedidoStatus, geminiPedidoPrompt, geminiNfPrompt, whatsappConfig,
    unidadesAdministrativas, empresas, products, onShowAlert
}) => {
  const [formData, setFormData] = useState<PedidoData>(() => buildInitialState(licitacao, proposta, pedidoStatus));
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzingNf, setIsAnalyzingNf] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEmpenhoDragging, setIsEmpenhoDragging] = useState(false);
  const [isNfDragging, setIsNfDragging] = useState<number | null>(null);
  const [isSendingWpp, setIsSendingWpp] = useState(false);
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);

  useEffect(() => {
    const initialState = buildInitialState(licitacao, proposta, pedidoStatus);
    const dataToSet = initialData ? { ...initialState, ...initialData } : initialState;
    if (!dataToSet.notas_fiscais) {
        dataToSet.notas_fiscais = [];
    }
    setFormData(dataToSet);
  }, [initialData, licitacao, proposta, pedidoStatus]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const handleNotaFiscalChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const newNotasFiscais = [...(prev.notas_fiscais || [])];
        newNotasFiscais[index] = { ...newNotasFiscais[index], [name]: value };
        return { ...prev, notas_fiscais: newNotasFiscais };
    });
  }, []);
  
  const handleItensFaturadosChange = (index: number, newItems: ItemFaturado[]) => {
    setFormData(prev => {
        const newNotasFiscais = [...(prev.notas_fiscais || [])];
        newNotasFiscais[index] = { ...newNotasFiscais[index], itens_faturados: newItems };
        return { ...prev, notas_fiscais: newNotasFiscais };
    });
  };

  const handleEmpenhoUpload = (file: File) => {
    if (file.type === 'application/pdf') {
        setFormData(prev => ({ ...prev, empenho_arquivo: file }));
      } else {
        alert('Por favor, selecione um arquivo PDF.');
      }
  }
  
  const handleNfUpload = (index: number, file: File) => {
    if (file.type === 'application/pdf') {
        setFormData(prev => {
            const newNotasFiscais = [...(prev.notas_fiscais || [])];
            newNotasFiscais[index] = { ...newNotasFiscais[index], nf_arquivo: file };
            return { ...prev, notas_fiscais: newNotasFiscais };
        });
    } else {
        alert('Por favor, selecione um arquivo PDF.');
    }
  };
  
  const handleNfFileChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          handleNfUpload(index, e.target.files[0]);
      }
      e.target.value = '';
  };

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  
  const createDragHandlers = (setIsDragging: (is: boolean), handler: (file: File) => void) => ({
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => { handleDragEvents(e); setIsDragging(true); },
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => { handleDragEvents(e); setIsDragging(false); },
    onDrop: (e: React.DragEvent<HTMLDivElement>) => {
        handleDragEvents(e);
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handler(e.dataTransfer.files[0]);
    },
  });

  const empenhoDragHandlers = createDragHandlers(setIsEmpenhoDragging, handleEmpenhoUpload);

  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return { inlineData: { data: await base64EncodedDataPromise, mimeType: file.type } };
  };

  const handleAnalyze = async () => {
    const currentFile = formData.empenho_arquivo;
    if (!currentFile || !(currentFile instanceof File)) {
      onShowAlert('Por favor, carregue um novo arquivo PDF do empenho para análise.');
      return;
    }
    if (!process.env.API_KEY) {
      onShowAlert('A chave da API do Gemini não foi configurada.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const filePart = await fileToGenerativePart(currentFile);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', contents: [{ parts: [filePart] }],
        config: { systemInstruction: geminiPedidoPrompt, responseMimeType: 'application/json' }
      });
      let text = response.text.trim();
      if (text.startsWith('```json')) text = text.substring(7, text.length - 3).trim();
      else if (text.startsWith('```')) text = text.substring(3, text.length - 3).trim();
      const extractedData = JSON.parse(text);
      
      const mappedItems = (extractedData.itens_empenhados || []).map((item: any): ItemEmpenhado => ({
        item_empenho: String(item.item_empenho || ''),
        item_compra: String(item.item_compra || ''),
        item_descricao: String(item.item_descricao || ''),
        item_quantidade: String(item.item_quantidade || ''),
        item_unitario: parseCurrency(item.item_unitario),
        item_total: parseCurrency(item.item_total),
      }));

      // Find organ by CNPJ to suggest linking it if it exists.
      const orgaoCNPJ = extractedData.orgao_CNPJ ? masks.cnpj(extractedData.orgao_CNPJ) : '';
      const existingUnidade = unidadesAdministrativas.find(u => u.cpf_cnpj === orgaoCNPJ);
      if(existingUnidade) {
        setFormData(prev => ({...prev, unidade_administrativa_id: existingUnidade.unidade_unique_id}));
      }

      // Find company by CNPJ to suggest linking it.
      const favorecidoCNPJ = extractedData.codigo_favorecido ? masks.cnpj(extractedData.codigo_favorecido) : '';
      const existingEmpresa = empresas.find(e => e.cpf_cnpj === favorecidoCNPJ);
      if(existingEmpresa) {
        setFormData(prev => ({...prev, empresa_unique_id: existingEmpresa.empresa_unique_id}));
      } else {
          if (favorecidoCNPJ) onShowAlert(`A empresa favorecida com CNPJ ${favorecidoCNPJ} não foi encontrada. Considere cadastrá-la.`);
      }

      setFormData(prev => ({
        ...prev,
        empenho_numero: extractedData.empenho_numero || prev.empenho_numero,
        empenho_data: extractedData.empenho_data ? masks.date(extractedData.empenho_data) : prev.empenho_data,
        itens_empenhados: mappedItems.length > 0 ? mappedItems : prev.itens_empenhados,
      }));
    } catch (error) {
      console.error("Erro ao analisar o empenho:", error);
      onShowAlert(`Ocorreu um erro ao analisar o empenho. Verifique o console para mais detalhes.`);
    } finally { setIsAnalyzing(false); }
  };
  
  const handleAnalyzeNf = async (index: number) => {
    const nf = formData.notas_fiscais?.[index];
    if (!nf || !nf.nf_arquivo || !(nf.nf_arquivo instanceof File)) {
      onShowAlert('Por favor, carregue um novo arquivo PDF da Nota Fiscal para análise.');
      return;
    }
     if (!process.env.API_KEY) {
      onShowAlert('A chave da API do Gemini não foi configurada.');
      return;
    }
    
    setIsAnalyzingNf(index);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const filePart = await fileToGenerativePart(nf.nf_arquivo);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', contents: [{ parts: [filePart] }],
        config: { systemInstruction: geminiNfPrompt, responseMimeType: 'application/json' }
      });
      let text = response.text.trim();
      if (text.startsWith('```json')) text = text.substring(7, text.length - 3).trim();
      else if (text.startsWith('```')) text = text.substring(3, text.length - 3).trim();
      const extractedData = JSON.parse(text);
      
      const mappedItems = (extractedData.itens_faturados || []).map((item: any): ItemFaturado => ({
        item_codigo: String(item.item_codigo || ''),
        item_descricao: String(item.item_descricao || ''),
        item_quantidade: String(item.item_quantidade || ''),
        item_unitario: parseCurrency(item.item_unitario),
        item_total: parseCurrency(item.item_total),
      }));

      setFormData(prev => {
        const newNotasFiscais = [...(prev.notas_fiscais || [])];
        const updatedNf = { ...newNotasFiscais[index] };
        updatedNf.nf_numero = extractedData.nf_numero || updatedNf.nf_numero;
        updatedNf.nf_chave = extractedData.nf_chave || updatedNf.nf_chave;
        updatedNf.nf_emissao = extractedData.nf_emissao ? masks.date(extractedData.nf_emissao) : updatedNf.nf_emissao;
        updatedNf.nf_saida = extractedData.nf_saida ? masks.date(extractedData.nf_saida) : updatedNf.nf_saida;
        updatedNf.nf_transp_nome = extractedData.nf_transp_nome || updatedNf.nf_transp_nome;
        updatedNf.nf_transp_cnpj = extractedData.nf_transp_cnpj ? masks.cnpj(extractedData.nf_transp_cnpj) : updatedNf.nf_transp_cnpj;
        updatedNf.itens_faturados = mappedItems.length > 0 ? mappedItems : updatedNf.itens_faturados;
        newNotasFiscais[index] = updatedNf;
        return { ...prev, notas_fiscais: newNotasFiscais };
      });

    } catch (error) {
       console.error("Erro ao analisar a nota fiscal:", error);
      onShowAlert(`Ocorreu um erro ao analisar a nota fiscal. Verifique o console para mais detalhes.`);
    } finally { setIsAnalyzingNf(null); }
  };
  
  const addNotaFiscal = () => {
      setFormData(prev => ({
          ...prev,
          notas_fiscais: [
              ...(prev.notas_fiscais || []),
              { id: `nf_${Date.now()}`, itens_faturados: [] }
          ]
      }));
  };

  const removeNotaFiscal = (index: number) => {
      setFormData(prev => ({
          ...prev,
          notas_fiscais: (prev.notas_fiscais || []).filter((_, i) => i !== index)
      }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSuccess(false);
    try {
      await onSave(formData);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2500);
    } catch (error) {
        console.error("Falha ao salvar pedido:", error);
    } finally {
        setIsSaving(false);
    }
  };

  const handleSendWhatsappFromModal = async (phoneNumber: string) => {
    const orgao = unidadesAdministrativas.find(u => u.unidade_unique_id === formData.unidade_administrativa_id);

    if (!orgao) {
        onShowAlert('Órgão não encontrado para este pedido.');
        return;
    }

    const message = `*Acompanhamento de Pedido*\n\n*Órgão:* ${orgao.nome_completo} (${orgao.uasg || 'N/A'})\n*Objeto:* ${licitacao.licitacao_objeto}\n*Nº Licitação:* ${licitacao.licitacao_numero}\n*Nº Empenho:* ${formData.empenho_numero}\n*Data Empenho:* ${formData.empenho_data}\n*Status:* ${formData.pedido_status}`.trim();

    setIsSendingWpp(true);
    const result = await sendWhatsappNotification(whatsappConfig, message, phoneNumber);
    
    if (result.success) {
        onShowAlert('Notificação enviada com sucesso!');
    } else {
        onShowAlert(result.error || 'Ocorreu um erro ao enviar a notificação.');
    }
    setIsSendingWpp(false);
    setIsWhatsappModalOpen(false);
  };


  const FormSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className }) => (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">{icon}<span className="ml-3">{title}</span></h2>
      {children}
    </div>
  );
  
  const selectedUnidade = useMemo(() => unidadesAdministrativas.find(u => u.unidade_unique_id === formData.unidade_administrativa_id), [formData.unidade_administrativa_id, unidadesAdministrativas]);
  const selectedEmpresa = useMemo(() => empresas.find(e => e.empresa_unique_id === formData.empresa_unique_id), [formData.empresa_unique_id, empresas]);

  return (
    <>
      <WhatsappRecipientModal
          isOpen={isWhatsappModalOpen}
          onClose={() => setIsWhatsappModalOpen(false)}
          onSend={handleSendWhatsappFromModal}
          empresas={empresas}
          isSending={isSendingWpp}
      />
      <div className="flex h-full overflow-hidden bg-gray-50">
        <aside className="w-2/5 h-full flex flex-col bg-gray-200 border-r border-gray-300">
            <PdfViewer files={[
                { label: 'Empenho', source: formData.empenho_arquivo },
                ...(formData.notas_fiscais || []).map((nf, i) => ({ label: `NF ${i + 1}`, source: nf.nf_arquivo }))
            ]} />
        </aside>
        <main className="w-3/5 h-full flex flex-col">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="flex-shrink-0 bg-white p-4 z-10 shadow-sm border-b">
                <div className="container mx-auto flex justify-between items-center">
                  <div className="flex items-center gap-4">
                      <button type="button" onClick={onCancel} className="p-2 rounded-full hover:bg-gray-200"><ArrowLeft size={20} /></button>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-800">{initialData ? "Editar Pedido" : "Novo Pedido"}</h1>
                        <p className="text-sm text-gray-600 truncate max-w-lg">Licitação: {licitacao.licitacao_objeto}</p>
                      </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button type="submit" className={`inline-flex items-center justify-center rounded-md border border-transparent px-5 py-2.5 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${isSuccess ? 'bg-green-600' : 'bg-blue-800 focus:ring-blue-500'} disabled:bg-blue-400 disabled:cursor-not-allowed`} disabled={isSaving || isSuccess}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                        {isSaving ? 'Salvando...' : (isSuccess ? 'Salvo!' : 'Salvar Pedido')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <InfoCard title="Órgão / Unidade Administrativa" icon={<Building size={18} className="text-blue-500"/>}>
                         <p><strong>Nome:</strong> {selectedUnidade?.nome_completo || 'N/A'}</p>
                         <p><strong>UASG:</strong> {selectedUnidade?.uasg || 'N/A'}</p>
                         <p><strong>CNPJ:</strong> {selectedUnidade?.cpf_cnpj || 'N/A'}</p>
                      </InfoCard>
                      <InfoCard title="Empresa Favorecida" icon={<Briefcase size={18} className="text-green-500"/>}>
                         <p><strong>Nome:</strong> {selectedEmpresa?.nome_completo || 'N/A'}</p>
                         <p><strong>CNPJ:</strong> {selectedEmpresa?.cpf_cnpj || 'N/A'}</p>
                      </InfoCard>
                  </div>

                  <FormSection title="Dados Gerais do Pedido" icon={<ClipboardList className="text-indigo-500" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <FormField label="Status" name="pedido_status" type="select" options={pedidoStatus} value={formData.pedido_status} onChange={handleChange} />
                      <DateField label="Data Limite de Entrega" name="data_limite_entrega" value={formData.data_limite_entrega || ''} onChange={handleChange} type="date" />
                    </div>
                  </FormSection>

                  <FormSection title="Nota de Empenho" icon={<FileBadge className="text-orange-500" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MaskedInput label="Número do Empenho" name="empenho_numero" value={formData.empenho_numero} onChange={handleChange} mask="empenho" placeholder="2024NE00123" required />
                        <DateField label="Data do Empenho" name="empenho_data" value={formData.empenho_data} onChange={handleChange} type="date" required />
                    </div>
                    <div className="col-span-1 md:col-span-2 mt-6">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Upload do PDF para Análise com IA</label>
                        <div className="flex items-start gap-4">
                            <div className="flex-grow">
                                <div {...empenhoDragHandlers} className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${isEmpenhoDragging ? 'border-blue-500' : 'border-gray-300'} border-dashed rounded-md transition-colors`}>
                                    <div className="space-y-1 text-center">
                                    <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="empenho_arquivo" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                        <span>Carregar um arquivo</span><input id="empenho_arquivo" name="empenho_arquivo" type="file" className="sr-only" onChange={(e) => e.target.files && e.target.files[0] && handleEmpenhoUpload(e.target.files[0])} accept="application/pdf" />
                                        </label><p className="pl-1">ou arraste e solte</p>
                                    </div><p className="text-xs text-gray-500">Apenas PDF</p>
                                    </div>
                                </div>
                                {formData.empenho_arquivo?.name && <p className="mt-2 text-sm text-gray-500">Arquivo selecionado: {formData.empenho_arquivo.name}</p>}
                            </div>
                            <div className="relative flex items-center group pt-6">
                                <button type="button" onClick={handleAnalyze} disabled={!formData.empenho_arquivo || isAnalyzing} className="p-3 inline-flex items-center justify-center rounded-full bg-blue-800 text-white shadow-sm hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors" aria-label={isAnalyzing ? 'Analisando empenho' : 'Analisar com IA'}>
                                    {isAnalyzing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-2 mt-6">
                      <ItensEmpenhados items={formData.itens_empenhados} setItems={(items) => setFormData(p => ({...p, itens_empenhados: items}))} products={products} />
                    </div>
                  </FormSection>
                  
                  <FormSection title="Notas Fiscais" icon={<Package className="text-teal-500" />}>
                    <div className="space-y-6">
                        {(formData.notas_fiscais || []).map((nf, index) => (
                            <div key={nf.id} className="bg-gray-50 p-4 rounded-lg border relative">
                                <div className="flex justify-between items-center mb-4">
                                  <h4 className="text-lg font-semibold text-gray-700">Nota Fiscal #{index + 1}</h4>
                                  <button type="button" onClick={() => removeNotaFiscal(index)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="Número NF" name="nf_numero" value={nf.nf_numero || ''} onChange={(e) => handleNotaFiscalChange(index, e)} />
                                    <FormField label="Chave de Acesso" name="nf_chave" value={nf.nf_chave || ''} onChange={(e) => handleNotaFiscalChange(index, e)} className="md:col-span-2" />
                                    <DateField label="Data de Emissão" name="nf_emissao" value={nf.nf_emissao || ''} onChange={(e) => handleNotaFiscalChange(index, e)} type="date" />
                                    <DateField label="Data de Saída" name="nf_saida" value={nf.nf_saida || ''} onChange={(e) => handleNotaFiscalChange(index, e)} type="date" />
                                    <FormField label="Transportadora" name="nf_transp_nome" value={nf.nf_transp_nome || ''} onChange={(e) => handleNotaFiscalChange(index, e)} />
                                    <MaskedInput label="CNPJ Transportadora" name="nf_transp_cnpj" value={nf.nf_transp_cnpj || ''} onChange={(e) => handleNotaFiscalChange(index, e)} mask="cnpj" />
                                </div>
                                 <div className="col-span-1 md:col-span-2 mt-6">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Upload da NF em PDF</label>
                                    <div className="flex items-start gap-4">
                                        <div className="flex-grow">
                                            <div {...createDragHandlers((is) => setIsNfDragging(is ? index : null), (file) => handleNfUpload(index, file))} className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${isNfDragging === index ? 'border-blue-500' : 'border-gray-300'} border-dashed rounded-md transition-colors`}>
                                                <div className="space-y-1 text-center">
                                                  <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                                                  <label htmlFor={`nf_arquivo-${index}`} className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"><span>Carregar arquivo</span><input id={`nf_arquivo-${index}`} name="nf_arquivo" type="file" className="sr-only" onChange={handleNfFileChange(index)} accept="application/pdf" /></label>
                                                  <p className="pl-1">ou arraste e solte</p>
                                                </div>
                                            </div>
                                             {nf.nf_arquivo?.name && <p className="mt-2 text-sm text-gray-500">{nf.nf_arquivo.name}</p>}
                                        </div>
                                        <div className="relative flex items-center group pt-6">
                                            <button type="button" onClick={() => handleAnalyzeNf(index)} disabled={!nf.nf_arquivo || isAnalyzingNf === index} className="p-3 inline-flex items-center justify-center rounded-full bg-teal-600 text-white shadow-sm hover:bg-teal-700 disabled:bg-teal-300">
                                                {isAnalyzingNf === index ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />}
                                            </button>
                                        </div>
                                    </div>
                                 </div>
                                 <div className="md:col-span-2 mt-6">
                                   <ItensFaturados items={nf.itens_faturados || []} setItems={(items) => handleItensFaturadosChange(index, items)} products={products} />
                                 </div>
                            </div>
                        ))}
                        <div className="text-center mt-4">
                            <button type="button" onClick={addNotaFiscal} className="inline-flex items-center px-4 py-2 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100"><PlusCircle size={16} className="mr-2" />Adicionar Nota Fiscal</button>
                        </div>
                    </div>
                  </FormSection>

                  <div className="flex justify-end items-center py-4 space-x-3 sticky bottom-0 bg-gray-50/80 backdrop-blur-sm">
                      {initialData && (
                          <button 
                              type="button" 
                              onClick={() => setIsWhatsappModalOpen(true)}
                              disabled={isSendingWpp}
                              className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-300"
                          >
                              {isSendingWpp ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <MessageSquare className="mr-2 h-4 w-4" />}
                              {isSendingWpp ? 'Enviando...' : 'WhatsApp'}
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

export default PedidoPage;
