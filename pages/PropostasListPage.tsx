import React, { useState, useMemo, memo, useCallback } from 'react';
import type { PropostaData, LicitacaoData, PropostaStatus, UnidadeAdministrativaData, EmpresaData, WhatsappConfig } from '../types';
import { PlusCircle, Trash2, Briefcase, ShoppingCart, Mail, MessageSquare, Loader2, Search } from 'lucide-react';
import WhatsappRecipientModal from '../components/WhatsappRecipientModal';
import { sendWhatsappNotification } from '../services/notificationService';
import { DEFAULT_PROPOSTA_STATUS } from '../constants';

const statusColors: { [key in PropostaStatus]: string } = {
    'Proposta': 'bg-blue-100 border-blue-300 text-blue-800',
    'Reserva': 'bg-cyan-100 border-cyan-300 text-cyan-800',
    'Julgamento': 'bg-yellow-100 border-yellow-300 text-yellow-800',
    'Homologada': 'bg-green-100 border-green-300 text-green-800',
    'Contrato': 'bg-emerald-100 border-emerald-300 text-emerald-800',
    'Adesão': 'bg-purple-100 border-purple-300 text-purple-800',
    'Orçamento': 'bg-teal-100 border-teal-300 text-teal-800',
    'Ata de Registro de Preços': 'bg-pink-100 border-pink-300 text-pink-800',
};

const PropostaCard: React.FC<{ 
    proposta: PropostaData; 
    licitacao?: LicitacaoData; 
    orgaoNome?: string; 
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onAddPedido: (id: string) => void;
    onSendEmail: (id: string) => void;
    onOpenWhatsappModal: (proposta: PropostaData) => void;
    isSendingWpp: boolean;
}> = memo(({ proposta, licitacao, orgaoNome, onEdit, onDelete, onAddPedido, onSendEmail, onOpenWhatsappModal, isSendingWpp }) => {
  if (!licitacao) return null;

  const handleEdit = useCallback(() => onEdit(proposta.proposta_unique_id), [onEdit, proposta.proposta_unique_id]);
  const handleDelete = useCallback(() => onDelete(proposta.proposta_unique_id), [onDelete, proposta.proposta_unique_id]);
  const handleAddPedido = useCallback(() => onAddPedido(proposta.proposta_unique_id), [onAddPedido, proposta.proposta_unique_id]);
  const handleSendEmail = useCallback(() => onSendEmail(proposta.proposta_unique_id), [onSendEmail, proposta.proposta_unique_id]);
  const handleOpenWhatsappModal = useCallback(() => onOpenWhatsappModal(proposta), [onOpenWhatsappModal, proposta]);

  const stopPropagationAndCall = (func: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    func();
  };

  return (
    <div onClick={handleEdit} className="bg-white rounded-md shadow-sm border p-3 group transition-all hover:shadow-md hover:border-green-500 cursor-pointer">
      <h4 className="font-semibold text-sm text-gray-800 group-hover:text-green-700 leading-tight" title={orgaoNome}>
        {orgaoNome}
      </h4>
      <p className="text-xs text-gray-500 mt-1 truncate" title={licitacao.licitacao_objeto}>{licitacao.licitacao_objeto}</p>
      <p className="text-xs text-gray-500 mt-1">Licitação: {licitacao.licitacao_modalidade} {licitacao.licitacao_numero}</p>
      
      <div className="flex items-center space-x-1 mt-3 pt-2 border-t -mx-3 px-2 justify-end">
         <button onClick={stopPropagationAndCall(handleAddPedido)} className="p-1.5 rounded-full text-gray-500 hover:bg-indigo-100 hover:text-indigo-700 transition-colors" title="Criar Pedido">
            <ShoppingCart size={15} />
         </button>
         <button onClick={stopPropagationAndCall(handleOpenWhatsappModal)} disabled={isSendingWpp} className="p-1.5 rounded-full text-gray-500 hover:bg-blue-100 hover:text-blue-700 transition-colors disabled:opacity-50" title="Notificar via WhatsApp">
            {isSendingWpp ? <Loader2 size={15} className="animate-spin" /> : <MessageSquare size={15} />}
         </button>
         <button onClick={stopPropagationAndCall(handleSendEmail)} className="p-1.5 rounded-full text-gray-500 hover:bg-orange-100 hover:text-orange-700 transition-colors" title="Enviar E-mail">
            <Mail size={15} />
         </button>
         <button onClick={stopPropagationAndCall(handleDelete)} className="p-1.5 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors" title="Excluir">
            <Trash2 size={15} />
         </button>
      </div>
    </div>
  );
});

const PropostasListPage: React.FC<{ 
    propostas: PropostaData[]; 
    licitacoes: LicitacaoData[];
    unidadesAdministrativas: UnidadeAdministrativaData[];
    empresas: EmpresaData[];
    onAddProposta: () => void; 
    onEditProposta: (id: string) => void; 
    onDeleteProposta: (id: string) => void; 
    onAddPedido: (propostaId: string) => void;
    onSendEmail: (propostaId: string) => void;
    whatsappConfig: WhatsappConfig;
    onShowAlert: (message: string) => void;
}> = ({ propostas, licitacoes, unidadesAdministrativas, empresas, onAddProposta, onEditProposta, onDeleteProposta, onAddPedido, onSendEmail, whatsappConfig, onShowAlert }) => {
    
    const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
    const [selectedPropostaForWpp, setSelectedPropostaForWpp] = useState<PropostaData | null>(null);
    const [isSendingWpp, setIsSendingWpp] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const sortedPropostas = useMemo(() => 
        [...propostas].sort((a,b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()),
        [propostas]
    );

    const filteredPropostas = useMemo(() => {
        if (!searchQuery) {
            return sortedPropostas;
        }

        const lowercasedQuery = searchQuery.toLowerCase();

        return sortedPropostas.filter(proposta => {
            const licitacao = licitacoes.find(l => l.licitacao_unique === proposta.licitacao_unique_id);
            if (!licitacao) return false;

            const orgaoGerenciador = unidadesAdministrativas.find(u => u.unidade_unique_id === licitacao.unidade_administrativa_id);
            const orgaoAderente = proposta.is_adesao
                ? unidadesAdministrativas.find(u => u.unidade_unique_id === proposta.orgao_adesao_id)
                : null;
            
            const orgaoNome = orgaoAderente?.nome_completo || orgaoGerenciador?.nome_completo || '';

            return (
                orgaoNome.toLowerCase().includes(lowercasedQuery) ||
                licitacao.licitacao_objeto.toLowerCase().includes(lowercasedQuery) ||
                licitacao.licitacao_numero.toLowerCase().includes(lowercasedQuery)
            );
        });
    }, [searchQuery, sortedPropostas, licitacoes, unidadesAdministrativas]);


    const statuses = DEFAULT_PROPOSTA_STATUS;

    const handleOpenWhatsappModal = useCallback((proposta: PropostaData) => {
        setSelectedPropostaForWpp(proposta);
        setIsWhatsappModalOpen(true);
    }, []);

    const handleSendFromModal = async (phoneNumber: string) => {
        if (!selectedPropostaForWpp) return;

        const proposta = selectedPropostaForWpp;
        const licitacao = licitacoes.find(l => l.licitacao_unique === proposta.licitacao_unique_id);
        if (!licitacao) { onShowAlert('Licitação não encontrada'); return; }

        const orgaoGerenciador = unidadesAdministrativas.find(u => u.unidade_unique_id === licitacao.unidade_administrativa_id);
        const orgaoAderente = proposta.is_adesao ? unidadesAdministrativas.find(u => u.unidade_unique_id === proposta.orgao_adesao_id) : null;
        const orgaoNome = orgaoAderente?.nome_completo || orgaoGerenciador?.nome_completo || 'Órgão não encontrado';
        const empresa = empresas.find(e => e.empresa_unique_id === proposta.empresa_unique_id);
        
        const message = `*Lembrete de Proposta*\n\n*Órgão:* ${orgaoNome}\n*Objeto:* ${licitacao.licitacao_objeto}\n*Nº Licitação:* ${licitacao.licitacao_numero}\n*Status:* ${proposta.proposta_status}\n*Proponente:* ${empresa?.nome_completo || 'N/A'}`.trim();

        setIsSendingWpp(proposta.proposta_unique_id);
        const result = await sendWhatsappNotification(whatsappConfig, message, phoneNumber);

        if (result.success) {
            onShowAlert('Notificação enviada com sucesso!');
        } else {
            onShowAlert(result.error || 'Ocorreu um erro ao enviar a notificação.');
        }
        setIsSendingWpp(null);
        setIsWhatsappModalOpen(false);
        setSelectedPropostaForWpp(null);
    };

    return (
        <>
        <WhatsappRecipientModal
            isOpen={isWhatsappModalOpen}
            onClose={() => setIsWhatsappModalOpen(false)}
            onSend={handleSendFromModal}
            empresas={empresas}
            isSending={!!isSendingWpp}
        />
        <div className="h-full w-full bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-800">Propostas</h1>
              <button
                onClick={onAddProposta}
                className="inline-flex items-center bg-blue-800 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <PlusCircle size={20} className="mr-2" />
                Nova Proposta
              </button>
            </div>

            <div className="mb-4">
                <div className="relative">
                    <input
                        type="search"
                        placeholder="Pesquisar por órgão, licitação ou objeto..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-full bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
            </div>
            
            {propostas.length > 0 ? (
                <div className="flex-1 min-h-0">
                    <div className="flex h-full space-x-4 overflow-x-auto pb-4">
                       {statuses.map(statusInfo => {
                            const propostasInStatus = filteredPropostas.filter(p => p.proposta_status === statusInfo.value);
                            const statusKey = statusInfo.value as PropostaStatus;
                            
                            return (
                                <div key={statusInfo.value} className="flex-shrink-0 w-80 bg-gray-100 rounded-lg shadow-inner flex flex-col">
                                    <div className={`p-3 font-bold text-sm rounded-t-lg flex justify-between items-center border-t-4 ${statusColors[statusKey] || 'bg-gray-200 border-gray-400'}`}>
                                        <span className="uppercase tracking-wider">{statusInfo.value}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-black/10">{propostasInStatus.length}</span>
                                    </div>
                                    <div className="p-2 space-y-3 overflow-y-auto flex-1">
                                        {propostasInStatus.length > 0 ? (
                                            propostasInStatus.map(proposta => {
                                                const licitacao = licitacoes.find(l => l.licitacao_unique === proposta.licitacao_unique_id);
                                                if (!licitacao) return null;

                                                const orgaoGerenciador = unidadesAdministrativas.find(u => u.unidade_unique_id === licitacao.unidade_administrativa_id);
                                                const orgaoAderente = proposta.is_adesao 
                                                    ? unidadesAdministrativas.find(u => u.unidade_unique_id === proposta.orgao_adesao_id)
                                                    : null;
                                                
                                                const orgaoNome = orgaoAderente?.nome_completo || orgaoGerenciador?.nome_completo || 'Órgão não encontrado';
                                                
                                                return (
                                                    <PropostaCard
                                                        key={proposta.proposta_unique_id}
                                                        proposta={proposta}
                                                        licitacao={licitacao}
                                                        orgaoNome={orgaoNome}
                                                        onEdit={onEditProposta}
                                                        onDelete={onDeleteProposta}
                                                        onAddPedido={onAddPedido}
                                                        onSendEmail={onSendEmail}
                                                        onOpenWhatsappModal={handleOpenWhatsappModal}
                                                        isSendingWpp={isSendingWpp === proposta.proposta_unique_id}
                                                    />
                                                );
                                            })
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-center text-gray-400 text-sm p-4">
                                                <p>Nenhuma proposta neste status.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300 rounded-lg bg-white">
                    <Briefcase className="mx-auto h-16 w-16 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-800">Nenhuma proposta cadastrada</h3>
                    <p className="mt-1 text-sm text-gray-500">Crie uma proposta a partir de uma licitação ou clique no botão.</p>
                    <button
                        onClick={onAddProposta}
                        className="mt-6 inline-flex items-center bg-blue-800 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                        <PlusCircle size={20} className="mr-2" />
                        Nova Proposta
                    </button>
                </div>
            )}
          </div>
        </div>
        </>
    );
};

export default PropostasListPage;
