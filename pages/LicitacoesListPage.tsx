import React, { useState, useMemo, memo, useCallback } from 'react';
import type { LicitacaoData, UnidadeAdministrativaData, WhatsappConfig, EmpresaData } from '../types';
import { PlusCircle, Trash2, FileText, Briefcase, MessageSquare, Loader2, ChevronLeft, ChevronRight, Calendar, Search } from 'lucide-react';
import { sendWhatsappNotification } from '../services/notificationService';
import WhatsappRecipientModal from '../components/WhatsappRecipientModal';

// --- Helper Functions ---
const parseBrazilianDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  const parts = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})(?:\s(\d{2}):(\d{2}))?/);
  if (!parts) return null;
  const [, day, month, year, hour, minute] = parts;
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour) || 0, Number(minute) || 0);
};

const toISODateString = (date: Date): string => date.toISOString().split('T')[0];

const LicitacaoListItem: React.FC<{ 
    licitacao: LicitacaoData; 
    orgaoNome: string; 
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onAddProposta: (id: string) => void;
    onOpenWhatsappModal: (licitacao: LicitacaoData) => void;
    isSendingWpp: boolean;
}> = memo(({ licitacao, orgaoNome, onEdit, onDelete, onAddProposta, onOpenWhatsappModal, isSendingWpp }) => {
    
    const handleEdit = useCallback(() => onEdit(licitacao.licitacao_unique), [onEdit, licitacao.licitacao_unique]);
    const handleDelete = useCallback(() => onDelete(licitacao.licitacao_unique), [onDelete, licitacao.licitacao_unique]);
    const handleAddProposta = useCallback(() => onAddProposta(licitacao.licitacao_unique), [onAddProposta, licitacao.licitacao_unique]);
    const handleOpenWhatsappModal = useCallback(() => onOpenWhatsappModal(licitacao), [onOpenWhatsappModal, licitacao]);
    
    const stopPropagationAndCall = (func: () => void) => (e: React.MouseEvent) => {
        e.stopPropagation();
        func();
    };
    
    return (
      <div onClick={handleEdit} className="bg-white p-3 rounded-md shadow-sm border border-gray-200 group transition-all hover:shadow-md hover:border-blue-500 cursor-pointer">
        <h4 className="font-semibold text-sm text-gray-800 group-hover:text-blue-700 leading-tight" title={orgaoNome}>{orgaoNome}
        </h4>
        <p className="text-xs text-gray-500 mt-1 truncate" title={licitacao.licitacao_objeto}>
          {licitacao.licitacao_objeto}</p>
        <p className="text-xs text-gray-500 mt-1">Licitação: {licitacao.licitacao_modalidade} {licitacao.licitacao_numero}</p>
        <div className="flex items-center space-x-1 mt-2 pt-2 border-t justify-end">
           <button onClick={stopPropagationAndCall(handleAddProposta)} className="p-1.5 rounded-full text-gray-500 hover:bg-green-100 hover:text-green-700 transition-colors" title="Criar Proposta">
              <Briefcase size={15} />
           </button>
           <button onClick={stopPropagationAndCall(handleOpenWhatsappModal)} disabled={isSendingWpp} className="p-1.5 rounded-full text-gray-500 hover:bg-blue-100 hover:text-blue-700 transition-colors disabled:opacity-50" title="Notificar via WhatsApp">
              {isSendingWpp ? <Loader2 size={15} className="animate-spin" /> : <MessageSquare size={15} />}
           </button>
           <button onClick={stopPropagationAndCall(handleDelete)} className="p-1.5 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors" title="Excluir">
              <Trash2 size={15} />
           </button>
        </div>
      </div>
    );
});

const LicitacoesListPage: React.FC<{ 
    licitacoes: LicitacaoData[]; 
    unidadesAdministrativas: UnidadeAdministrativaData[];
    empresas: EmpresaData[];
    onAddLicitacao: () => void; 
    onEditLicitacao: (id: string) => void; 
    onDeleteLicitacao: (id: string) => void; 
    onAddProposta: (id: string) => void;
    whatsappConfig: WhatsappConfig;
    onShowAlert: (message: string) => void;
}> = ({ licitacoes, unidadesAdministrativas, empresas, onAddLicitacao, onEditLicitacao, onDeleteLicitacao, onAddProposta, whatsappConfig, onShowAlert }) => {
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
  const [selectedLicitacaoForWpp, setSelectedLicitacaoForWpp] = useState<LicitacaoData | null>(null);
  const [isSendingWpp, setIsSendingWpp] = useState<string | null>(null);

  const eventDates = useMemo(() => {
    const dates = new Set<string>();
    licitacoes.forEach(l => {
        const date = parseBrazilianDate(l.licitacao_data_sessao);
        if (date) {
            dates.add(toISODateString(date));
        }
    });
    return dates;
  }, [licitacoes]);

  const sortedLicitacoes = useMemo(() => [...licitacoes].sort((a, b) => {
    const dateA = parseBrazilianDate(a.licitacao_data_sessao)?.getTime() || 0;
    const dateB = parseBrazilianDate(b.licitacao_data_sessao)?.getTime() || 0;
    return dateB - dateA;
  }), [licitacoes]);

  const filteredLicitacoes = useMemo(() => {
      if (!searchQuery) {
          return sortedLicitacoes;
      }

      const lowercasedQuery = searchQuery.toLowerCase();

      return sortedLicitacoes.filter(licitacao => {
          const unidade = unidadesAdministrativas.find(u => u.unidade_unique_id === licitacao.unidade_administrativa_id);

          return (
              (unidade && unidade.nome_completo.toLowerCase().includes(lowercasedQuery)) ||
              licitacao.licitacao_objeto.toLowerCase().includes(lowercasedQuery) ||
              licitacao.licitacao_numero.toLowerCase().includes(lowercasedQuery)
          );
      });
  }, [searchQuery, sortedLicitacoes, unidadesAdministrativas]);
  
  const licitacoesOnSelectedDate = useMemo(() => {
    const selectedDateStr = toISODateString(selectedDate);
    // The list is already sorted from sortedLicitacoes, but we re-sort to be explicit.
    return sortedLicitacoes
      .filter(l => {
          const licitacaoDate = parseBrazilianDate(l.licitacao_data_sessao);
          return licitacaoDate && toISODateString(licitacaoDate) === selectedDateStr;
      })
      .sort((a, b) => {
          const dateA = parseBrazilianDate(a.licitacao_data_sessao)?.getTime() || 0;
          const dateB = parseBrazilianDate(b.licitacao_data_sessao)?.getTime() || 0;
          return dateB - dateA;
      });
  }, [selectedDate, sortedLicitacoes]);


  const handleOpenWhatsappModal = useCallback((licitacao: LicitacaoData) => {
    setSelectedLicitacaoForWpp(licitacao);
    setIsWhatsappModalOpen(true);
  }, []);

  const handleSendFromModal = async (phoneNumber: string) => {
    if (!selectedLicitacaoForWpp) return;
    
    const licitacao = selectedLicitacaoForWpp;
    const orgao = unidadesAdministrativas.find(u => u.unidade_unique_id === licitacao.unidade_administrativa_id);

    if (!orgao) { onShowAlert('Órgão não encontrado.'); return; }

    const message = `*Nova Oportunidade de Licitação!*\n\n*Órgão:* ${orgao.nome_completo} (${orgao.uasg || 'N/A'})\n*Objeto:* ${licitacao.licitacao_objeto}\n*Nº Licitação:* ${licitacao.licitacao_numero}\n*Modalidade:* ${licitacao.licitacao_modalidade}\n*Sessão:* ${licitacao.licitacao_data_sessao}\n\nAcesse o portal para mais detalhes.`.trim();

    setIsSendingWpp(licitacao.licitacao_unique);
    const result = await sendWhatsappNotification(whatsappConfig, message, phoneNumber);
    
    if (result.success) { onShowAlert('Notificação enviada com sucesso!'); } 
    else { onShowAlert(result.error || 'Ocorreu um erro ao enviar a notificação.'); }
    
    setIsSendingWpp(null);
    setIsWhatsappModalOpen(false);
    setSelectedLicitacaoForWpp(null);
  };

  const changeMonth = (amount: number) => {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
  };
  
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const calendarDays = [];
    // Blanks for previous month
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(<div key={`blank-${i}`} className="border-r border-b border-gray-200"></div>);
    }
    
    const todayStr = toISODateString(new Date());
    const selectedDateStr = toISODateString(selectedDate);

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = toISODateString(date);

        const isToday = dateStr === todayStr;
        const isSelected = dateStr === selectedDateStr;
        const hasEvent = eventDates.has(dateStr);
        
        let dayClasses = "p-2 text-sm text-right border-r border-b border-gray-200 cursor-pointer transition-colors flex flex-col items-end min-h-[6rem]";
        if (isSelected) {
            dayClasses += " bg-blue-500 text-white font-bold";
        } else if (isToday) {
            dayClasses += " bg-blue-100";
        } else {
            dayClasses += " hover:bg-gray-100";
        }

        calendarDays.push(
            <div key={day} className={dayClasses} onClick={() => setSelectedDate(date)}>
                <span className={`w-6 h-6 flex items-center justify-center rounded-full ${isSelected ? 'bg-white text-blue-500' : ''}`}>{day}</span>
                {hasEvent && <div className={`mt-auto w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`}></div>}
            </div>
        );
    }
    
    // Fill remaining grid
    const totalCells = 42; // 6 weeks * 7 days
    while(calendarDays.length % 7 !== 0 || calendarDays.length < totalCells) {
        calendarDays.push(<div key={`blank-end-${calendarDays.length}`} className="border-r border-b border-gray-200"></div>);
    }

    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
      <div className="bg-white rounded-lg shadow-md border flex flex-col h-full">
        <div className="flex justify-between items-center p-4 border-b">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={20}/></button>
            <h3 className="font-bold text-lg text-gray-800">{currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h3>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight size={20}/></button>
        </div>
        <div className="grid grid-cols-7 flex-grow">
            {weekdays.map(day => <div key={day} className="text-center font-semibold text-xs py-2 border-b border-r border-gray-200 text-gray-600">{day}</div>)}
            {calendarDays}
        </div>
      </div>
    );
  };
  
  return (
    <>
      <WhatsappRecipientModal isOpen={isWhatsappModalOpen} onClose={() => setIsWhatsappModalOpen(false)} onSend={handleSendFromModal} empresas={empresas} isSending={!!isSendingWpp} />
      <div className="h-full w-full bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Licitações e Editais</h1>
            <button onClick={onAddLicitacao} className="inline-flex items-center bg-blue-800 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
              <PlusCircle size={20} className="mr-2" />
              Novo Edital
            </button>
          </div>
          
          {licitacoes.length > 0 ? (
              <div className="flex-grow grid grid-cols-12 gap-6 min-h-0">
                  {/* Left Column: General List */}
                  <div className="col-span-3 flex flex-col min-h-0">
                      <h2 className="text-lg font-semibold text-gray-700 mb-2 flex-shrink-0">Todas as Licitações ({filteredLicitacoes.length})</h2>
                       <div className="relative mb-2 flex-shrink-0">
                            <input
                                type="search"
                                placeholder="Pesquisar..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-1.5 border rounded-full bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition text-sm"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                      <div className="flex-grow overflow-y-auto space-y-3 pr-2 bg-gray-100 p-2 rounded-md">
                        {filteredLicitacoes.map(licitacao => {
                            const unidade = unidadesAdministrativas.find(u => u.unidade_unique_id === licitacao.unidade_administrativa_id);
                            return (
                                <LicitacaoListItem
                                    key={licitacao.licitacao_unique}
                                    licitacao={licitacao}
                                    orgaoNome={unidade?.nome_completo || 'Órgão não encontrado'}
                                    onEdit={onEditLicitacao}
                                    onDelete={onDeleteLicitacao}
                                    onAddProposta={onAddProposta}
                                    onOpenWhatsappModal={handleOpenWhatsappModal}
                                    isSendingWpp={isSendingWpp === licitacao.licitacao_unique}
                                />
                            );
                        })}
                      </div>
                  </div>

                  {/* Center Column: Monthly Calendar */}
                  <div className="col-span-6 flex flex-col min-h-0">
                    {renderCalendar()}
                  </div>

                  {/* Right Column: Daily View */}
                  <div className="col-span-3 flex flex-col min-h-0">
                    <h2 className="text-lg font-semibold text-gray-700 mb-3 flex-shrink-0">
                        Agenda para {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                    </h2>
                    <div className="flex-grow overflow-y-auto space-y-3 pr-2 bg-gray-100 p-2 rounded-md">
                        {licitacoesOnSelectedDate.length > 0 ? (
                            licitacoesOnSelectedDate.map(licitacao => {
                                const unidade = unidadesAdministrativas.find(u => u.unidade_unique_id === licitacao.unidade_administrativa_id);
                                return (
                                    <LicitacaoListItem
                                        key={licitacao.licitacao_unique}
                                        licitacao={licitacao}
                                        orgaoNome={unidade?.nome_completo || 'Órgão não encontrado'}
                                        onEdit={onEditLicitacao}
                                        onDelete={onDeleteLicitacao}
                                        onAddProposta={onAddProposta}
                                        onOpenWhatsappModal={handleOpenWhatsappModal}
                                        isSendingWpp={isSendingWpp === licitacao.licitacao_unique}
                                    />
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                                <Calendar size={32} className="mb-2" />
                                <p className="text-sm">Nenhuma licitação agendada para este dia.</p>
                            </div>
                        )}
                    </div>
                  </div>
              </div>
          ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300 rounded-lg bg-white">
                  <FileText className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-800">Nenhuma licitação cadastrada</h3>
                  <p className="mt-1 text-sm text-gray-500">Comece adicionando o primeiro edital.</p>
                  <button
                      onClick={onAddLicitacao}
                      className="mt-6 inline-flex items-center bg-blue-800 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-900"
                  >
                      <PlusCircle size={20} className="mr-2" />
                      Novo Edital
                  </button>
              </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LicitacoesListPage;
