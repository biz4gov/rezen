import React, { useState, useMemo, memo, useCallback } from 'react';
import type { PedidoData, LicitacaoData, PedidoStatus, UnidadeAdministrativaData, EmpresaData, WhatsappConfig } from '../types';
import { PlusCircle, Trash2, ShoppingCart, FilePlus, Truck, MessageSquare, Loader2 } from 'lucide-react';
import WhatsappRecipientModal from '../components/WhatsappRecipientModal';
import { sendWhatsappNotification } from '../services/notificationService';
import { DEFAULT_PEDIDO_STATUS } from '../constants';


const statusColors: { [key in PedidoStatus]: string } = {
    'Empenho': 'bg-cyan-100 border-cyan-300 text-cyan-800',
    'Faturado': 'bg-indigo-100 border-indigo-300 text-indigo-800',
    'Entregue': 'bg-lime-100 border-lime-300 text-lime-800',
    'Garantia': 'bg-orange-100 border-orange-300 text-orange-800',
};

const StatusBadge: React.FC<{ status: PedidoStatus }> = memo(({ status }) => (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
    </span>
));

const PedidoCard: React.FC<{ 
    pedido: PedidoData; 
    licitacaoObjeto?: string; 
    orgaoNome?: string;
    licitacaoModalidade?: string;
    licitacaoNumero?: string;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onFaturar: (id: string) => void;
    onEntregar: (id: string) => void;
    onOpenWhatsappModal: (pedido: PedidoData) => void;
    isSendingWpp: boolean;
}> = memo(({ pedido, licitacaoObjeto, orgaoNome, licitacaoModalidade, licitacaoNumero, onEdit, onDelete, onFaturar, onEntregar, onOpenWhatsappModal, isSendingWpp }) => {

    const handleEdit = useCallback(() => onEdit(pedido.pedido_unique_id), [onEdit, pedido.pedido_unique_id]);
    const handleDelete = useCallback(() => onDelete(pedido.pedido_unique_id), [onDelete, pedido.pedido_unique_id]);
    const handleFaturar = useCallback(() => onFaturar(pedido.pedido_unique_id), [onFaturar, pedido.pedido_unique_id]);
    const handleEntregar = useCallback(() => onEntregar(pedido.pedido_unique_id), [onEntregar, pedido.pedido_unique_id]);
    const handleOpenWhatsappModal = useCallback(() => onOpenWhatsappModal(pedido), [onOpenWhatsappModal, pedido]);

    const stopPropagationAndCall = (func: () => void) => (e: React.MouseEvent) => {
        e.stopPropagation();
        func();
    };

    return (
      <div onClick={handleEdit} className="bg-white rounded-md shadow-sm border p-3 group transition-all hover:shadow-md hover:border-indigo-500 cursor-pointer">
        <h4 className="font-semibold text-sm text-gray-800 group-hover:text-indigo-700 leading-tight" title={orgaoNome}>{orgaoNome}</h4>
        <p className="text-xs text-gray-500 mt-1 truncate" title={licitacaoObjeto}>{licitacaoObjeto || 'Pedido sem Licitação'}</p>
        <p className="text-xs text-gray-500 mt-1">Licitação: {licitacaoModalidade} {licitacaoNumero}</p>
          
        <div className="flex items-center justify-between mt-3 pt-2 border-t -mx-3 px-2">
            <StatusBadge status={pedido.pedido_status} />
            <div className="flex items-center space-x-1">
               {pedido.pedido_status === 'Empenho' && (
                 <button onClick={stopPropagationAndCall(handleFaturar)} className="p-1.5 rounded-full text-gray-500 hover:bg-indigo-100 hover:text-indigo-700 transition-colors" title="Faturar Pedido">
                    <FilePlus size={15} />
                 </button>
               )}
               {pedido.pedido_status === 'Faturado' && (
                 <button onClick={stopPropagationAndCall(handleEntregar)} className="p-1.5 rounded-full text-gray-500 hover:bg-lime-100 hover:text-lime-700 transition-colors" title="Marcar como Entregue">
                    <Truck size={15} />
                 </button>
               )}
                <button onClick={stopPropagationAndCall(handleOpenWhatsappModal)} disabled={isSendingWpp} className="p-1.5 rounded-full text-gray-500 hover:bg-blue-100 hover:text-blue-700 transition-colors disabled:opacity-50" title="Notificar via WhatsApp">
                    {isSendingWpp ? <Loader2 size={15} className="animate-spin" /> : <MessageSquare size={15} />}
                </button>
               <button onClick={stopPropagationAndCall(handleDelete)} className="p-1.5 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors" title="Excluir">
                  <Trash2 size={15} />
               </button>
            </div>
          </div>
      </div>
    );
});

const PedidosListPage: React.FC<{ 
    pedidos: PedidoData[]; 
    licitacoes: LicitacaoData[];
    unidadesAdministrativas: UnidadeAdministrativaData[];
    empresas: EmpresaData[];
    onAddPedido: () => void; 
    onEditPedido: (id: string) => void; 
    onDeletePedido: (id: string) => void;
    onFaturarPedido: (id: string) => void;
    onEntregarPedido: (id: string) => void;
    whatsappConfig: WhatsappConfig;
    onShowAlert: (message: string) => void;
}> = ({ pedidos, licitacoes, unidadesAdministrativas, empresas, onAddPedido, onEditPedido, onDeletePedido, onFaturarPedido, onEntregarPedido, whatsappConfig, onShowAlert }) => {

    const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
    const [selectedPedidoForWpp, setSelectedPedidoForWpp] = useState<PedidoData | null>(null);
    const [isSendingWpp, setIsSendingWpp] = useState<string | null>(null);

    const sortedPedidos = useMemo(() => [...pedidos].sort((a,b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()), [pedidos]);
    const statuses = DEFAULT_PEDIDO_STATUS;

    const handleOpenWhatsappModal = useCallback((pedido: PedidoData) => {
        setSelectedPedidoForWpp(pedido);
        setIsWhatsappModalOpen(true);
    }, []);

    const handleSendFromModal = async (phoneNumber: string) => {
        if (!selectedPedidoForWpp) return;

        const pedido = selectedPedidoForWpp;
        const licitacao = licitacoes.find(l => l.licitacao_unique === pedido.licitacao_unique_id);
        const unidade = unidadesAdministrativas.find(u => u.unidade_unique_id === pedido.unidade_administrativa_id);
        
        const message = `*Acompanhamento de Pedido*\n\n*Órgão:* ${unidade?.nome_completo || 'N/A'}\n*Objeto:* ${licitacao?.licitacao_objeto || 'N/A'}\n*Nº Licitação:* ${licitacao?.licitacao_numero || 'N/A'}\n*Nº Empenho:* ${pedido.empenho_numero}\n*Status:* ${pedido.pedido_status}`.trim();

        setIsSendingWpp(pedido.pedido_unique_id);
        const result = await sendWhatsappNotification(whatsappConfig, message, phoneNumber);

        if (result.success) {
            onShowAlert('Notificação enviada com sucesso!');
        } else {
            onShowAlert(result.error || 'Ocorreu um erro ao enviar a notificação.');
        }
        setIsSendingWpp(null);
        setIsWhatsappModalOpen(false);
        setSelectedPedidoForWpp(null);
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
              <h1 className="text-3xl font-bold text-gray-800">Pedidos</h1>
              <button
                onClick={onAddPedido}
                className="inline-flex items-center bg-blue-800 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <PlusCircle size={20} className="mr-2" />
                Novo Pedido
              </button>
            </div>
            
            {pedidos.length > 0 ? (
                <div className="flex-1 min-h-0">
                    <div className="flex h-full space-x-4 overflow-x-auto pb-4">
                        {statuses.map(statusInfo => {
                            const statusKey = statusInfo.value as PedidoStatus;
                            const pedidosInStatus = sortedPedidos.filter(p => p.pedido_status === statusKey);

                            return (
                                <div key={statusKey} className="flex-shrink-0 w-80 bg-gray-100 rounded-lg shadow-inner flex flex-col">
                                    <div className={`p-3 font-bold text-sm rounded-t-lg flex justify-between items-center border-t-4 ${statusColors[statusKey] || 'bg-gray-200 border-gray-400'}`}>
                                        <span className="uppercase tracking-wider">{statusKey}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-black/10">{pedidosInStatus.length}</span>
                                    </div>
                                    <div className="p-2 space-y-3 overflow-y-auto flex-1">
                                        {pedidosInStatus.length > 0 ? (
                                            pedidosInStatus.map(pedido => {
                                                const licitacao = licitacoes.find(l => l.licitacao_unique === pedido.licitacao_unique_id);
                                                const unidade = unidadesAdministrativas.find(u => u.unidade_unique_id === pedido.unidade_administrativa_id);
                                                return (
                                                    <PedidoCard
                                                        key={pedido.pedido_unique_id}
                                                        pedido={pedido}
                                                        licitacaoObjeto={licitacao?.licitacao_objeto}
                                                        orgaoNome={unidade?.nome_completo}
                                                        licitacaoModalidade={licitacao?.licitacao_modalidade}
                                                        licitacaoNumero={licitacao?.licitacao_numero}
                                                        onEdit={onEditPedido}
                                                        onDelete={onDeletePedido}
                                                        onFaturar={onFaturarPedido}
                                                        onEntregar={onEntregarPedido}
                                                        onOpenWhatsappModal={handleOpenWhatsappModal}
                                                        isSendingWpp={isSendingWpp === pedido.pedido_unique_id}
                                                    />
                                                );
                                            })
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-center text-gray-400 text-sm p-4">
                                                <p>Nenhum pedido neste status.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300 rounded-lg bg-white">
                    <ShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-800">Nenhum pedido cadastrado</h3>
                    <p className="mt-1 text-sm text-gray-500">Crie um pedido a partir de uma proposta ou clique no botão.</p>
                    <button
                        onClick={onAddPedido}
                        className="mt-6 inline-flex items-center bg-blue-800 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                        <PlusCircle size={20} className="mr-2" />
                        Novo Pedido
                    </button>
                </div>
            )}
          </div>
        </div>
        </>
    );
};

export default PedidosListPage;
