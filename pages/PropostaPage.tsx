import React, { useState, useCallback, useEffect } from 'react';
import type { LicitacaoData, PropostaData, PropostaItem, ProductData, ConstantItem, UnidadeAdministrativaData, EmpresaData, WhatsappConfig, LicitacaoItem } from '../types';
import FormField from '../components/FormField';
import ProductFormModal from '../components/ProductFormModal';
import WhatsappRecipientModal from '../components/WhatsappRecipientModal';
import { sendWhatsappNotification } from '../services/notificationService';
import { Building, Truck, Shield, Check, Loader2, Award, Users, FileSignature, Trash2, ArrowLeft, Briefcase, MessageSquare, PlusCircle, Download } from 'lucide-react';
import DateField from '../components/DateField';

interface PropostaPageProps {
  licitacao: LicitacaoData;
  initialData?: PropostaData;
  onSave: (propostaData: PropostaData, licitacaoData?: LicitacaoData) => Promise<void>;
  onCancel: () => void;
  products: ProductData[];
  empresas: EmpresaData[];
  unidadesAdministrativas: UnidadeAdministrativaData[];
  onSaveProduct: (product: ProductData) => Promise<void>;
  onNavigateToCarta: (propostaId: string, mode: 'proposta' | 'reserva' | 'orçamento' | 'adesao') => void;
  propostaStatus: ConstantItem[];
  whatsappConfig: WhatsappConfig;
  onShowAlert: (message: string) => void;
}

const buildInitialPropostaState = (licitacao: LicitacaoData, propostaStatus: ConstantItem[], empresas: EmpresaData[]): PropostaData => {
  const itens_proposta: PropostaItem[] = licitacao.itens_licitacao.map(item => ({
    item_licitacao: item.item_licitacao,
    produto_fornecedor: '', // Will hold the product_unique id
    valor_referencia: 0,
    valor_minimo: 0,
    vencedor: false,
    valor_lance_vencedor: 0,
    motivo_razao: '',
    item_adesao: false,
    quantidade_adesao: item.item_quantidade,
  }));

  return {
    proposta_unique_id: `prop_${Date.now()}`,
    licitacao_unique_id: licitacao.licitacao_unique,
    empresa_unique_id: empresas.length > 0 ? empresas[0].empresa_unique_id : '',
    data_criacao: new Date().toISOString(),
    proposta_status: (propostaStatus[0]?.value || 'Proposta') as any,
    itens_proposta,
    is_adesao: false,
  };
};

const InfoCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; }> = ({ title, icon, children }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-full">
        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">{icon}<span className="ml-2">{title}</span></h3>
        <div className="space-y-1.5 text-sm text-gray-600">{children}</div>
    </div>
);

const PropostaPage: React.FC<PropostaPageProps> = ({ 
    licitacao, initialData, onSave, onCancel, products, empresas, 
    unidadesAdministrativas, onSaveProduct, onNavigateToCarta, propostaStatus,
    whatsappConfig, onShowAlert
}) => {
    const [propostaData, setPropostaData] = useState<PropostaData>(() => initialData || buildInitialPropostaState(licitacao, propostaStatus, empresas));
    const [licitacaoData, setLicitacaoData] = useState<LicitacaoData>(licitacao);
    const [isSaving, setIsSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
    const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
    const [isSendingWpp, setIsSendingWpp] = useState(false);

    const isOrcamento = propostaData.proposta_status === 'Orçamento';

    useEffect(() => {
        if (propostaData.proposta_status === 'Homologada' && !propostaData.data_homologacao) {
            setPropostaData(prev => ({
                ...prev,
                data_homologacao: new Date().toISOString()
            }));
        }
    }, [propostaData.proposta_status, propostaData.data_homologacao]);

    const handleItemChange = useCallback((index: number, field: keyof PropostaItem, value: string | boolean) => {
        setPropostaData(prev => {
            const newItems = [...prev.itens_proposta];
            const itemToUpdate = { ...newItems[index] };
            
            if (field === 'valor_referencia' || field === 'valor_minimo' || field === 'valor_lance_vencedor') {
                (itemToUpdate as any)[field] = parseFloat(value as string) || 0;
            } else if (field === 'vencedor') {
                itemToUpdate.vencedor = value as boolean;
                if (!value) itemToUpdate.valor_lance_vencedor = 0;
            } else if (field === 'item_adesao') {
                itemToUpdate.item_adesao = value as boolean;
                // When checking the box, if quantity is not set, default it to the licitacao quantity.
                if (value && !itemToUpdate.quantidade_adesao) {
                    const licitacaoItem = licitacaoData.itens_licitacao.find(li => li.item_licitacao === itemToUpdate.item_licitacao);
                    if (licitacaoItem) {
                        itemToUpdate.quantidade_adesao = licitacaoItem.item_quantidade;
                    }
                }
            } else if (field === 'quantidade_adesao') {
                itemToUpdate.quantidade_adesao = value as string;
            }
            else {
                (itemToUpdate as any)[field] = value;
            }

            newItems[index] = itemToUpdate;
            return { ...prev, itens_proposta: newItems };
        });
    }, [licitacaoData.itens_licitacao]);
    
    const handleLicitacaoItemChange = (index: number, field: keyof LicitacaoItem, value: string) => {
        setLicitacaoData(prev => {
            const newItems = [...prev.itens_licitacao];
            (newItems[index] as any)[field] = value;
            return { ...prev, itens_licitacao: newItems };
        });
    };

    const handleAddItemOrcamento = () => {
        const newItemNum = (licitacaoData.itens_licitacao.length > 0 ? Math.max(...licitacaoData.itens_licitacao.map(i => parseInt(i.item_licitacao, 10))) : 0) + 1;

        const newLicitacaoItem: LicitacaoItem = {
            item_licitacao: newItemNum.toString(),
            item_descricao: '',
            item_quantidade: '1',
            item_unitario: 0,
            item_meepp: false,
        };
        const newPropostaItem: PropostaItem = buildInitialPropostaState({ itens_licitacao: [newLicitacaoItem] } as LicitacaoData, [], []).itens_proposta[0];
        
        setLicitacaoData(prev => ({ ...prev, itens_licitacao: [...prev.itens_licitacao, newLicitacaoItem] }));
        setPropostaData(prev => ({ ...prev, itens_proposta: [...prev.itens_proposta, newPropostaItem] }));
    };

    const handleRemoveItemOrcamento = (index: number) => {
        const itemToRemove = licitacaoData.itens_licitacao[index];
        if (!itemToRemove || !window.confirm('Tem certeza que deseja remover este item do orçamento?')) return;
        
        setLicitacaoData(prev => ({
            ...prev,
            itens_licitacao: prev.itens_licitacao.filter((_, i) => i !== index),
        }));
        setPropostaData(prev => ({
            ...prev,
            itens_proposta: prev.itens_proposta.filter(pi => pi.item_licitacao !== itemToRemove.item_licitacao),
        }));
    };

    const handleRemoveItemProposta = (index: number) => {
        if (window.confirm('Tem certeza de que deseja remover este item da proposta? Esta ação indica que você não ofertará este item.')) {
            setPropostaData(prev => ({
                ...prev,
                itens_proposta: prev.itens_proposta.filter((_, i) => i !== index),
            }));
        }
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'proposta_status') {
            const isAdesao = value === 'Adesão';
            setPropostaData(prev => ({
                ...prev,
                proposta_status: value as any,
                is_adesao: isAdesao,
                orgao_adesao_id: isAdesao ? prev.orgao_adesao_id : undefined,
            }));
        } else if (name === 'licitacao_objeto') {
            setLicitacaoData(prev => ({ ...prev, [name]: value }));
        }
        else {
            setPropostaData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleProductSelectChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        if (selectedValue === 'new_product') {
            setEditingItemIndex(index);
            setIsProductModalOpen(true);
        } else {
            const selectedProduct = products.find(p => p.produto_unique === selectedValue);
            setPropostaData(prev => {
                const newItems = [...prev.itens_proposta];
                const itemToUpdate = { ...newItems[index] };

                itemToUpdate.produto_fornecedor = selectedValue;

                if (selectedProduct) {
                    itemToUpdate.valor_referencia = selectedProduct.produto_referencia;
                    itemToUpdate.valor_minimo = selectedProduct.produto_minimo;
                } else {
                    itemToUpdate.valor_referencia = 0;
                    itemToUpdate.valor_minimo = 0;
                }
                
                newItems[index] = itemToUpdate;
                return { ...prev, itens_proposta: newItems };
            });
        }
    };

    const handleSaveNewProduct = async (newProduct: ProductData) => {
        await onSaveProduct(newProduct);
        if (editingItemIndex !== null) {
            handleItemChange(editingItemIndex, 'produto_fornecedor', newProduct.produto_unique);
            setPropostaData(prev => {
                const newItems = [...prev.itens_proposta];
                const itemToUpdate = { ...newItems[editingItemIndex] };
                itemToUpdate.valor_referencia = newProduct.produto_referencia;
                itemToUpdate.valor_minimo = newProduct.produto_minimo;
                newItems[editingItemIndex] = itemToUpdate;
                return { ...prev, itens_proposta: newItems };
            });
        }
        setIsProductModalOpen(false);
        setEditingItemIndex(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        setIsSuccess(false);
        try {
            await onSave(propostaData, isOrcamento ? licitacaoData : undefined);
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 2500);
        } catch (error) {
            console.error("Falha ao salvar proposta:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const licitacaoUnidade = unidadesAdministrativas.find(u => u.unidade_unique_id === licitacaoData.unidade_administrativa_id);
    const proponenteEmpresa = empresas.find(e => e.empresa_unique_id === propostaData.empresa_unique_id);
    const orgaoAderente = unidadesAdministrativas.find(u => u.unidade_unique_id === propostaData.orgao_adesao_id);
    
    const handleSendWhatsappFromModal = async (phoneNumber: string) => {
        const orgao = licitacaoUnidade;
        if (!orgao) { onShowAlert('Órgão não encontrado para esta licitação.'); return; }
        const message = `*Lembrete de Proposta*\n\n*Órgão:* ${orgao.nome_completo}\n*Objeto:* ${licitacaoData.licitacao_objeto}\n*Nº Licitação:* ${licitacaoData.licitacao_numero}\n*Status:* ${propostaData.proposta_status}\n*Proponente:* ${proponenteEmpresa?.nome_completo || 'N/A'}`.trim();
        setIsSendingWpp(true);
        const result = await sendWhatsappNotification(whatsappConfig, message, phoneNumber);
        if (result.success) onShowAlert('Notificação enviada com sucesso!');
        else onShowAlert(result.error || 'Ocorreu um erro ao enviar a notificação.');
        setIsSendingWpp(false);
        setIsWhatsappModalOpen(false);
    };

    const handleDownloadPdf = (pdf: { name: string; base64: string }) => {
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${pdf.base64}`;
        link.download = pdf.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
      <>
        <ProductFormModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} onSave={handleSaveNewProduct} />
        <WhatsappRecipientModal isOpen={isWhatsappModalOpen} onClose={() => setIsWhatsappModalOpen(false)} onSend={handleSendWhatsappFromModal} empresas={empresas} isSending={isSendingWpp} />
        <div className="h-full flex flex-col bg-gray-50">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex-shrink-0 bg-white p-4 z-10 shadow-sm border-b">
                    <div className="container mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button type="button" onClick={onCancel} className="p-2 rounded-full hover:bg-gray-200"><ArrowLeft size={20} /></button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">{isOrcamento ? 'Criar Orçamento' : (initialData ? 'Editar Proposta' : 'Criar Proposta')}</h1>
                                <p className="text-sm text-gray-600 truncate max-w-lg">{isOrcamento ? 'Criação de um novo orçamento de produtos.' : `Para a licitação: ${licitacaoData.licitacao_objeto}`}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            {initialData && ['Julgamento', 'Homologada'].includes(propostaData.proposta_status) && (<button type="button" onClick={() => onNavigateToCarta(propostaData.proposta_unique_id, 'proposta')} className="inline-flex items-center justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700"><FileSignature className="mr-2 h-4 w-4" />Gerar Proposta</button>)}
                            {initialData && ['Proposta', 'Julgamento', 'Homologada', 'Adesão'].includes(propostaData.proposta_status) && (<button type="button" onClick={() => onNavigateToCarta(propostaData.proposta_unique_id, 'reserva')} className="inline-flex items-center justify-center rounded-md border border-transparent bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700"><FileSignature className="mr-2 h-4 w-4" />Gerar Reserva</button>)}
                            {initialData && propostaData.proposta_status === 'Orçamento' && (<button type="button" onClick={() => onNavigateToCarta(propostaData.proposta_unique_id, 'orçamento')} className="inline-flex items-center justify-center rounded-md border border-transparent bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700"><FileSignature className="mr-2 h-4 w-4" />Gerar Orçamento</button>)}
                            {initialData && propostaData.proposta_status === 'Adesão' && (<button type="button" onClick={() => onNavigateToCarta(propostaData.proposta_unique_id, 'adesao')} className="inline-flex items-center justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700"><FileSignature className="mr-2 h-4 w-4" />Gerar Adesão</button>)}
                            {initialData && (<button type="button" onClick={() => setIsWhatsappModalOpen(true)} disabled={isSendingWpp} className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:opacity-50">{isSendingWpp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}WhatsApp</button>)}
                            <button type="submit" disabled={isSaving || isSuccess || !propostaData.empresa_unique_id} className={`inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors ${isSuccess ? 'bg-green-600' : 'bg-blue-800 hover:bg-blue-900'} disabled:bg-blue-400 disabled:cursor-not-allowed`}>{isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}{isSaving ? 'Salvando...' : (isSuccess ? 'Salvo!' : 'Salvar')}</button>
                        </div>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        {!isOrcamento && (<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            <InfoCard title="Órgão Gerenciador" icon={<Building size={18} className="text-blue-500"/>}><p><strong>Nome:</strong> {licitacaoUnidade?.nome_completo || 'N/A'}</p><p><strong>UASG:</strong> {licitacaoUnidade?.uasg || 'N/A'}</p><p><strong>CNPJ:</strong> {licitacaoUnidade?.cpf_cnpj || 'N/A'}</p></InfoCard>
                            <InfoCard title="Condições de Entrega e Garantia" icon={<Shield size={18} className="text-orange-500" />}><p><strong>Prazo de Entrega:</strong> {licitacaoData.licitacao_prazoentrega ? `${licitacaoData.licitacao_prazoentrega} dias` : 'N/A'}</p><p><strong>Local de Entrega:</strong> {licitacaoData.licitacao_localentrega || 'N/A'}</p><p><strong>Garantia do Contrato:</strong> {licitacaoData.licitacao_garantiacontrato || 'N/A'}</p><p><strong>Garantia do Produto:</strong> {licitacaoData.licitacao_garantiaproduto || 'N/A'}</p></InfoCard>
                            <InfoCard title="Empresa Proponente" icon={<Briefcase size={18} className="text-gray-700"/>}><p><strong>Nome:</strong> {proponenteEmpresa?.nome_completo || 'Nenhuma selecionada'}</p><p><strong>CNPJ:</strong> {proponenteEmpresa?.cpf_cnpj || 'N/A'}</p></InfoCard>
                            {propostaData.proposta_status === 'Adesão' && (<InfoCard title="Órgão Aderente" icon={<Users size={18} className="text-purple-500"/>}><p><strong>Nome:</strong> {orgaoAderente?.nome_completo || 'Nenhum selecionado'}</p><p><strong>UASG:</strong> {orgaoAderente?.uasg || 'N/A'}</p><p><strong>CNPJ:</strong> {orgaoAderente?.cpf_cnpj || 'N/A'}</p></InfoCard>)}
                        </div>)}
                        
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <FormField label="Empresa Proponente" name="empresa_unique_id" type="select" options={empresas.map(e => ({ value: e.empresa_unique_id, label: e.nome_completo, observation: `CNPJ: ${e.cpf_cnpj}` }))} value={propostaData.empresa_unique_id} onChange={handleFieldChange} required className="lg:col-span-2" />
                                <FormField label="Status da Proposta" name="proposta_status" type="select" options={propostaStatus} value={propostaData.proposta_status} onChange={handleFieldChange} disabled={isOrcamento} />
                                {isOrcamento && <FormField label="Objeto do Orçamento" name="licitacao_objeto" value={licitacaoData.licitacao_objeto} onChange={handleFieldChange} required />}
                                {(propostaData.proposta_status === 'Contrato' || propostaData.proposta_status === 'Ata de Registro de Preços') && (<DateField label="Data da Assinatura" name="data_assinatura" value={propostaData.data_assinatura || ''} onChange={handleFieldChange} type="date" />)}
                            </div>
                            {propostaData.proposta_status === 'Adesão' && (<div className="mt-6 pt-6 border-t border-dashed"><FormField label="Órgão Aderente (Participante)" name="orgao_adesao_id" type="select" options={unidadesAdministrativas.filter(u => u.unidade_unique_id !== licitacaoData.unidade_administrativa_id).map(u => ({ value: u.unidade_unique_id, label: u.nome_completo, observation: `CNPJ: ${u.cpf_cnpj}` }))} value={propostaData.orgao_adesao_id || ''} onChange={(e) => setPropostaData(prev => ({ ...prev, orgao_adesao_id: e.target.value }))} required={propostaData.proposta_status === 'Adesão'} /></div>)}
                        </div>

                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Itens {isOrcamento ? 'do Orçamento' : 'da Proposta'}</h2>
                            {isOrcamento && <button type="button" onClick={handleAddItemOrcamento} className="inline-flex items-center bg-blue-100 text-blue-800 font-semibold px-3 py-1.5 rounded-md hover:bg-blue-200"><PlusCircle size={16} className="mr-2"/>Adicionar Item ao Orçamento</button>}
                        </div>
                        <div className="space-y-4">
                            {propostaData.itens_proposta.map((propostaItem, index) => {
                                const licitacaoItem = licitacaoData.itens_licitacao.find(li => li.item_licitacao === propostaItem.item_licitacao);
                                if (!licitacaoItem) return null;
                                const selectedProduct = products.find(p => p.produto_unique === propostaItem.produto_fornecedor);
                                return (
                                    <div key={propostaItem.item_licitacao} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                        <div className="pb-3 border-b border-dashed">
                                            <div className="flex justify-between items-start">
                                                <p className="font-bold text-base text-blue-700">Item {licitacaoItem.item_licitacao}</p>
                                                <div className="flex items-center space-x-2">
                                                    {licitacaoItem.item_meepp && !isOrcamento && <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full">Exclusivo ME/EPP</span>}
                                                    {isOrcamento ? (
                                                        <button type="button" onClick={() => handleRemoveItemOrcamento(index)} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50" title="Remover item do orçamento"><Trash2 size={16} /></button>
                                                    ) : (
                                                        ['Proposta', 'Julgamento'].includes(propostaData.proposta_status) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveItemProposta(index)}
                                                                className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                                                                title="Remover item da proposta"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                            {isOrcamento ? <FormField label="Descrição do Item" name={`desc-${index}`} type="textarea" value={licitacaoItem.item_descricao} onChange={(e) => handleLicitacaoItemChange(index, 'item_descricao', e.target.value)} /> : <p className="mt-1 text-sm text-gray-600">{licitacaoItem.item_descricao}</p>}
                                            <div className="flex items-center space-x-6 mt-2 text-sm">
                                                {isOrcamento ? <FormField label="Quantidade" name={`qtd-${index}`} type="number" value={licitacaoItem.item_quantidade} onChange={(e) => handleLicitacaoItemChange(index, 'item_quantidade', e.target.value)} /> : <span><strong>Qtd:</strong> {licitacaoItem.item_quantidade}</span>}
                                                {!isOrcamento && <span><strong>Unitário (Edital):</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(licitacaoItem.item_unitario)}</span>}
                                            </div>
                                        </div>
                                        <div className="pt-4 space-y-4">
                                            <div>
                                                <label htmlFor={`produto-${index}`} className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Produto a Fornecer</label>
                                                <select id={`produto-${index}`} value={propostaItem.produto_fornecedor} onChange={(e) => handleProductSelectChange(index, e)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"><option value="">Selecione...</option>{products.map(p => (<option key={p.produto_unique} value={p.produto_unique}>{p.produto_nome}</option>))}<option value="new_product" className="font-bold text-blue-600 bg-gray-50">+ Novo Produto...</option></select>
                                            </div>
                                            {selectedProduct && (<div className="p-3 bg-gray-50 rounded-md border border-gray-200 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-semibold text-gray-900">{selectedProduct.produto_nome}</p>
                                                    {propostaData.proposta_status === 'Julgamento' && propostaItem.vencedor && selectedProduct.produto_folheto_pdf && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDownloadPdf(selectedProduct.produto_folheto_pdf!)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                                            title={`Baixar folheto: ${selectedProduct.produto_folheto_pdf.name}`}
                                                        >
                                                            <Download size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: selectedProduct.produto_descricao || 'Nenhuma descrição fornecida.' }} />
                                            </div>)}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><FormField label="Valor de Referência" name={`ref-${index}`} type="number" value={propostaItem.valor_referencia} onChange={(e) => handleItemChange(index, 'valor_referencia', e.target.value)} /><FormField label="Valor Mínimo" name={`min-${index}`} type="number" value={propostaItem.valor_minimo} onChange={(e) => handleItemChange(index, 'valor_minimo', e.target.value)} /></div>
                                        </div>
                                        {!isOrcamento && propostaData.proposta_status !== 'Proposta' && (<div className="mt-4 pt-4 border-t border-gray-200"><div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start"><div><label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Análise do Resultado</label><div className="flex items-center flex-wrap gap-x-6 gap-y-2"><div className="flex items-center"><input type="checkbox" id={`vencedor-${index}`} checked={propostaItem.vencedor} onChange={(e) => handleItemChange(index, 'vencedor', e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500" /><label htmlFor={`vencedor-${index}`} className="ml-2 flex items-center text-sm font-medium text-green-700"><Award size={16} className="mr-1"/>Item Vencedor</label></div>{propostaData.proposta_status === 'Adesão' && (
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center">
                                                            <input type="checkbox" id={`item_adesao-${index}`} checked={propostaItem.item_adesao || false} onChange={(e) => handleItemChange(index, 'item_adesao', e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                                                            <label htmlFor={`item_adesao-${index}`} className="ml-2 flex items-center text-sm font-medium text-purple-700"><Users size={16} className="mr-1"/>Item Adesão</label>
                                                        </div>
                                                        {propostaItem.item_adesao && (
                                                            <div className="flex items-center gap-2">
                                                                <label htmlFor={`qtd-adesao-${index}`} className="text-sm font-medium text-gray-700">Qtd:</label>
                                                                <input
                                                                    type="number"
                                                                    id={`qtd-adesao-${index}`}
                                                                    name={`qtd-adesao-${index}`}
                                                                    value={propostaItem.quantidade_adesao || ''}
                                                                    onChange={(e) => handleItemChange(index, 'quantidade_adesao', e.target.value)}
                                                                    className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-1"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}</div><div className="mt-4"><FormField label="Valor do Lance Vencedor" name={`lance-${index}`} type="number" value={propostaItem.valor_lance_vencedor} onChange={(e) => handleItemChange(index, 'valor_lance_vencedor', e.target.value)} disabled={!propostaItem.vencedor}/></div></div><FormField label="Motivo / Razão" name={`motivo-${index}`} type="textarea" value={propostaItem.motivo_razao} onChange={(e) => handleItemChange(index, 'motivo_razao', e.target.value)} /></div></div>)}
                                    </div>
                                )
                            })}
                             {isOrcamento && licitacaoData.itens_licitacao.length === 0 && (
                                <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
                                    <p className="text-sm text-gray-500">Nenhum item adicionado a este orçamento.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
      </>
    );
};

export default PropostaPage;
