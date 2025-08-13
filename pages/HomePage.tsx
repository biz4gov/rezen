

import React, { useState, useMemo, memo, useCallback } from 'react';
import type { LicitacaoData, PropostaData, PedidoData, PedidoStatus, UnidadeAdministrativaData } from '../types';
import { ChevronLeft, ChevronRight, Calendar, ShoppingCart, Landmark, FileText, Briefcase, PlusCircle } from 'lucide-react';

interface HomePageProps {
  licitacoes: LicitacaoData[];
  propostas: PropostaData[];
  pedidos: PedidoData[];
  unidadesAdministrativas: UnidadeAdministrativaData[];
  onNavigateToEditEdital: (licitacaoId: string) => void;
  onNavigateToEditProposta: (propostaId: string) => void;
  onNavigateToEditPedido: (pedidoId: string) => void;
  onNavigateToAddEdital: () => void;
  onNavigateToAddProposta: () => void;
  onNavigateToAddPedido: () => void;
}

// --- Date Helper Functions ---

// Parses 'DD/MM/AAAA HH:MM' or 'DD/MM/AAAA' to a Date object in local time.
const parseBrazilianDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  const parts = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})(?:\s(\d{2}):(\d{2}))?/);
  if (!parts) return null;
  const [, day, month, year, hour, minute] = parts;
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour) || 0, Number(minute) || 0);
};

// Gets the 5 weekdays (Mon-Fri) for the week of a given date.
const getWeekDays = (refDate: Date): Date[] => {
  const startOfWeek = new Date(refDate);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const week = [];
  for (let i = 0; i < 5; i++) {
    const weekDay = new Date(startOfWeek);
    weekDay.setDate(startOfWeek.getDate() + i);
    week.push(weekDay);
  }
  return week;
};

// Calculates the delivery deadline for a given Pedido.
const calculateDeadline = (pedido: PedidoData, allLicitacoes: LicitacaoData[]): number => {
    const licitacao = allLicitacoes.find(l => l.licitacao_unique === pedido.licitacao_unique_id);
    if (!licitacao || !pedido.empenho_data) return Infinity;

    const empenhoDate = parseBrazilianDate(pedido.empenho_data);
    if (!empenhoDate) return Infinity;

    const prazo = parseInt(licitacao.licitacao_prazoentrega, 10);
    if (isNaN(prazo)) return Infinity;

    const deadline = new Date(empenhoDate);
    deadline.setDate(deadline.getDate() + prazo);
    return deadline.getTime();
}

// --- Calendar Event Component ---
const CalendarEvent: React.FC<{ id: string, title: string; subtitle: string; color: string; onClick: (id: string) => void; }> = memo(({ id, title, subtitle, color, onClick }) => {
    const handleClick = useCallback(() => onClick(id), [id, onClick]);
    return (
        <div onClick={handleClick} className={`p-2 rounded-md text-white cursor-pointer mb-1 transition-transform hover:scale-105 ${color}`}>
            <p className="font-bold text-xs truncate">{title}</p>
            <p className="text-xs opacity-80 truncate">{subtitle}</p>
        </div>
    );
});


// --- Pedido Card Component ---
const PedidoCard: React.FC<{
  pedido: PedidoData;
  orgaoNome: string;
  onEdit: (id: string) => void;
  licitacaoObjeto?: string;
  licitacaoModalidade?: string;
  licitacaoNumero?: string;
}> = memo(({ pedido, orgaoNome, onEdit, licitacaoObjeto, licitacaoModalidade, licitacaoNumero }) => {
    const statusColors: { [key in PedidoStatus]: string } = {
        'Empenho': 'bg-cyan-100 text-cyan-800',
        'Faturado': 'bg-indigo-100 text-indigo-800',
        'Entregue': 'bg-lime-100 text-lime-800',
        'Garantia': 'bg-orange-100 text-orange-800',
    };
    
    const handleEdit = useCallback(() => onEdit(pedido.pedido_unique_id), [pedido.pedido_unique_id, onEdit]);
    
    return (
        <div onClick={handleEdit} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 group transition-all hover:shadow-md hover:border-indigo-500 cursor-pointer flex flex-col justify-between">
            <div>
              <h4 className="font-semibold text-sm truncate text-gray-800 group-hover:text-indigo-700" title={orgaoNome}>{orgaoNome}</h4>
              <p className="text-xs text-gray-500 mt-1 truncate" title={licitacaoObjeto}>{licitacaoObjeto || 'Objeto não encontrado'}</p>
              <p className="text-xs text-gray-500 mt-1">Licitação: {licitacaoModalidade} {licitacaoNumero}</p>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t">
                <span className="text-xs text-gray-500">Empenho: {pedido.empenho_numero || 'N/A'}</span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[pedido.pedido_status] || 'bg-gray-100'}`}>
                    {pedido.pedido_status}
                </span>
            </div>
        </div>
    )
});


// --- Main HomePage Component ---
const HomePage: React.FC<HomePageProps> = ({ 
    licitacoes, propostas, pedidos, unidadesAdministrativas,
    onNavigateToEditEdital, onNavigateToEditProposta, onNavigateToEditPedido,
    onNavigateToAddEdital, onNavigateToAddProposta, onNavigateToAddPedido
}) => {
    const [viewDate, setViewDate] = useState(new Date());

    const handlePrevWeek = () => setViewDate(d => new Date(d.setDate(d.getDate() - 7)));
    const handleNextWeek = () => setViewDate(d => new Date(d.setDate(d.getDate() + 7)));
    const handleThisWeek = () => setViewDate(new Date());
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateString = e.target.value;
        if (dateString) {
            // Use T00:00:00 to handle timezone correctly, creating a local date.
            setViewDate(new Date(dateString + 'T00:00:00'));
        }
    };

    const weekDays = getWeekDays(viewDate);
    const weekStart = weekDays[0];
    const weekEnd = weekDays[4];

    const sortedPedidos = useMemo(() => {
        return [...pedidos].sort((a, b) => {
            const parseDate = (dateStr: string | undefined): number => {
                if (!dateStr) return Infinity;
                const d = parseBrazilianDate(dateStr);
                return d ? d.getTime() : Infinity;
            };

            const deadlineA = a.data_limite_entrega ? parseDate(a.data_limite_entrega) : calculateDeadline(a, licitacoes);
            const deadlineB = b.data_limite_entrega ? parseDate(b.data_limite_entrega) : calculateDeadline(b, licitacoes);
            
            return deadlineA - deadlineB;
        });
    }, [pedidos, licitacoes]);
    
    return (
        <div className="flex h-full p-4 gap-4 bg-gray-100">
            {/* Calendar Section (70%) */}
            <div className="w-[70%] flex flex-col bg-white rounded-xl shadow-md p-4">
                <div className="grid grid-cols-3 items-center mb-4 pb-2 border-b">
                    {/* Left Controls */}
                    <div className="flex justify-start items-center space-x-2">
                        <button onClick={handleThisWeek} className="px-3 py-1 text-sm font-semibold border rounded-md hover:bg-gray-100">Esta Semana</button>
                        <div className="relative">
                            <input
                                type="date"
                                onChange={handleDateChange}
                                className="border rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-gray-100"
                                title="Selecionar data"
                            />
                        </div>
                    </div>

                    {/* Center Navigation */}
                    <div className="flex justify-center items-center space-x-2">
                        <button onClick={handlePrevWeek} className="p-2 rounded-full hover:bg-gray-200" title="Semana anterior"><ChevronLeft size={20}/></button>
                        <h2 className="text-lg font-bold text-gray-700 text-center whitespace-nowrap">
                            {weekStart.toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })} - {weekEnd.toLocaleDateString('pt-BR', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </h2>
                        <button onClick={handleNextWeek} className="p-2 rounded-full hover:bg-gray-200" title="Próxima semana"><ChevronRight size={20}/></button>
                    </div>

                    {/* Right side - Action Buttons */}
                    <div className="flex justify-end items-center space-x-2">
                        <button onClick={onNavigateToAddEdital} className="inline-flex items-center bg-blue-100 text-blue-800 font-semibold px-3 py-1.5 rounded-md hover:bg-blue-200 transition-colors text-sm">
                            <FileText size={16} className="mr-2"/> Novo Edital
                        </button>
                         <button onClick={onNavigateToAddProposta} className="inline-flex items-center bg-green-100 text-green-800 font-semibold px-3 py-1.5 rounded-md hover:bg-green-200 transition-colors text-sm">
                            <Briefcase size={16} className="mr-2"/> Nova Proposta
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-5 gap-2 flex-grow min-h-0">
                    {weekDays.map(day => {
                        const dayStart = new Date(day); dayStart.setHours(0,0,0,0);
                        const dayEnd = new Date(day); dayEnd.setHours(23,59,59,999);

                        const licitacoesForDay = licitacoes.filter(l => {
                            const sessionDate = parseBrazilianDate(l.licitacao_data_sessao);
                            return sessionDate && sessionDate >= dayStart && sessionDate <= dayEnd;
                        });

                        const propostasForDay = propostas.filter(p => {
                            const licitacao = licitacoes.find(l => l.licitacao_unique === p.licitacao_unique_id);
                            if (!licitacao || !p.data_homologacao) return false;

                            const startDate = parseBrazilianDate(licitacao.licitacao_data_sessao);
                            const endDate = new Date(p.data_homologacao);

                            if (!startDate) return false;
                            
                            startDate.setHours(0,0,0,0);
                            endDate.setHours(23,59,59,999);

                            return day >= startDate && day <= endDate;
                        });
                        
                        const isToday = new Date().toDateString() === day.toDateString();

                        return (
                            <div key={day.toISOString()} className={`rounded-lg flex flex-col ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                <div className={`text-center py-2 rounded-t-lg ${isToday ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                                    <p className="font-bold text-sm">{day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</p>
                                    <p className="text-xs">{day.toLocaleDateString('pt-BR', { day: '2-digit' })}</p>
                                </div>
                                <div className="p-2 flex-grow overflow-y-auto space-y-1">
                                    {licitacoesForDay.map(l => {
                                        const unidade = unidadesAdministrativas.find(u => u.unidade_unique_id === l.unidade_administrativa_id);
                                        return <CalendarEvent key={l.licitacao_unique} id={l.licitacao_unique} title={l.licitacao_objeto} subtitle={unidade?.nome_completo || 'Órgão não encontrado'} color="bg-blue-500" onClick={onNavigateToEditEdital} />
                                    })}
                                    {propostasForDay.map(p => {
                                        const lic = licitacoes.find(l => l.licitacao_unique === p.licitacao_unique_id);
                                        if (!lic) return null;
                                        
                                        const orgaoGerenciador = unidadesAdministrativas.find(u => u.unidade_unique_id === lic.unidade_administrativa_id);
                                        const orgaoAderente = p.is_adesao ? unidadesAdministrativas.find(u => u.unidade_unique_id === p.orgao_adesao_id) : null;
                                        const orgaoNome = orgaoAderente?.nome_completo || orgaoGerenciador?.nome_completo;

                                        return <CalendarEvent key={p.proposta_unique_id} id={p.proposta_unique_id} title={lic?.licitacao_objeto || "Proposta"} subtitle={orgaoNome || ''} color="bg-green-500" onClick={onNavigateToEditProposta} />
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Pedidos Section (30%) */}
            <div className="w-[30%] flex flex-col bg-white rounded-xl shadow-md p-4">
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                     <div className="flex items-center">
                        <ShoppingCart size={20} className="text-gray-600 mr-3"/>
                        <h2 className="text-lg font-bold text-gray-700">Pedidos</h2>
                     </div>
                     <button onClick={onNavigateToAddPedido} className="inline-flex items-center bg-indigo-100 text-indigo-800 font-semibold px-3 py-1.5 rounded-md hover:bg-indigo-200 transition-colors text-sm">
                        <PlusCircle size={16} className="mr-2"/> Novo Pedido
                    </button>
                </div>
                {sortedPedidos.length > 0 ? (
                    <div className="flex flex-col gap-3 flex-grow overflow-y-auto pr-1">
                        {sortedPedidos.map(p => {
                            const unidade = unidadesAdministrativas.find(u => u.unidade_unique_id === p.unidade_administrativa_id);
                            const licitacao = licitacoes.find(l => l.licitacao_unique === p.licitacao_unique_id);
                            return <PedidoCard 
                                key={p.pedido_unique_id} 
                                pedido={p} 
                                orgaoNome={unidade?.nome_completo || 'Órgão desconhecido'} 
                                onEdit={onNavigateToEditPedido}
                                licitacaoObjeto={licitacao?.licitacao_objeto}
                                licitacaoModalidade={licitacao?.licitacao_modalidade}
                                licitacaoNumero={licitacao?.licitacao_numero}
                            />
                        })}
                    </div>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-center text-gray-500">
                        <p>Nenhum pedido para exibir.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
