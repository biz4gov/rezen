

import React, { useMemo } from 'react';
import type { LicitacaoData, PropostaData, PedidoData, PropostaStatus } from '../types';
import { TrendingUp, CheckCircle, BarChart, PieChart, DollarSign, Target, FileText } from 'lucide-react';

interface PainelPageProps {
  licitacoes: LicitacaoData[];
  propostas: PropostaData[];
  pedidos: PedidoData[];
}

const parseBrazilianDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const parts = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})(?:\s(\d{2}):(\d{2}))?/);
    if (!parts) return null;
    const [, day, month, year, hour, minute] = parts;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour) || 0, Number(minute) || 0);
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center">
        <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        {children}
    </div>
);

const SimpleBarChart: React.FC<{ data: { label: string; value: number; color?: string }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    return (
        <div className="flex items-end h-64 space-x-4">
            {data.map(({ label, value, color }) => (
                <div key={label} className="flex-1 flex flex-col items-center">
                    <div
                        className={`w-full rounded-t-md ${color || 'bg-blue-500'}`}
                        style={{ height: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%` }}
                        title={`${label}: ${value}`}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2 truncate">{label}</span>
                </div>
            ))}
        </div>
    );
};

const GroupedBarChart: React.FC<{ data: { month: string; empenhado: number; faturado: number }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.flatMap(d => [d.empenhado, d.faturado]), 0);
    return (
        <div className="h-72">
            <div className="flex items-end h-64 space-x-4">
                {data.map(({ month, empenhado, faturado }) => (
                    <div key={month} className="flex-1 flex flex-col items-center">
                        <div className="flex w-full items-end h-full gap-1 justify-center">
                             <div className="w-1/2 rounded-t-md bg-cyan-500" style={{ height: `${maxValue > 0 ? (empenhado / maxValue) * 100 : 0}%` }} title={`Empenhado: ${formatCurrency(empenhado)}`}></div>
                             <div className="w-1/2 rounded-t-md bg-indigo-500" style={{ height: `${maxValue > 0 ? (faturado / maxValue) * 100 : 0}%` }} title={`Faturado: ${formatCurrency(faturado)}`}></div>
                        </div>
                         <span className="text-xs text-gray-500 mt-2">{month}</span>
                    </div>
                ))}
            </div>
             <div className="flex justify-center items-center space-x-4 mt-4 text-sm">
                <div className="flex items-center"><div className="w-3 h-3 rounded-sm bg-cyan-500 mr-2"></div>Empenhado</div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-sm bg-indigo-500 mr-2"></div>Faturado</div>
            </div>
        </div>
    );
};


const SimplePieChart: React.FC<{ data: { name: string; value: number }[] }> = ({ data }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    if (total === 0) return <p className="text-center text-gray-500">Nenhum dado para exibir.</p>;

    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];
    let cumulativePercentage = 0;
    const gradients = data.map((item, index) => {
        const percentage = (item.value / total) * 100;
        const color = colors[index % colors.length];
        const start = cumulativePercentage;
        cumulativePercentage += percentage;
        const end = cumulativePercentage;
        return `${color} ${start}% ${end}%`;
    });

    return (
         <div className="flex flex-col md:flex-row items-center gap-6">
            <div
                className="w-40 h-40 rounded-full"
                style={{ background: `conic-gradient(${gradients.join(', ')})` }}
            ></div>
            <div className="space-y-2">
                {data.map((item, index) => (
                    <div key={item.name} className="flex items-center text-sm">
                        <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: colors[index % colors.length] }}></div>
                        <span className="font-medium text-gray-700">{item.name}:</span>
                        <span className="ml-2 text-gray-500">{item.value} ({((item.value / total) * 100).toFixed(1)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const PainelPage: React.FC<PainelPageProps> = ({ licitacoes, propostas, pedidos }) => {
    
    const kpiData = useMemo(() => {
        const totalVencido = propostas.reduce((total, prop) => {
            const licitacao = licitacoes.find(l => l.licitacao_unique === prop.licitacao_unique_id);
            if (!licitacao) return total;

            return total + prop.itens_proposta.reduce((subtotal, item) => {
                if (item.vencedor) {
                    const licitacaoItem = licitacao.itens_licitacao.find(li => li.item_licitacao === item.item_licitacao);
                    const quantidade = parseInt(licitacaoItem?.item_quantidade || '0', 10);
                    return subtotal + (item.valor_lance_vencedor * quantidade);
                }
                return subtotal;
            }, 0);
        }, 0);

        const totalFaturado = pedidos.reduce((total, ped) => {
            return total + (ped.notas_fiscais || []).reduce((subtotal, nf) => {
                return subtotal + (nf.itens_faturados || []).reduce((itemTotal, item) => itemTotal + item.item_total, 0);
            }, 0);
        }, 0);
        
        const propostasConsideradas = propostas.filter(p => p.proposta_status !== 'Orçamento');
        const propostasSucesso = propostasConsideradas.filter(p => ['Homologada', 'Contrato', 'Ata de Registro de Preços'].includes(p.proposta_status));
        const taxaSucesso = propostasConsideradas.length > 0 ? (propostasSucesso.length / propostasConsideradas.length) * 100 : 0;

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const licitacoesAtivas = licitacoes.filter(l => {
            const dataSessao = parseBrazilianDate(l.licitacao_data_sessao);
            return dataSessao && dataSessao >= hoje;
        }).length;

        return { totalVencido, totalFaturado, taxaSucesso, licitacoesAtivas };
    }, [licitacoes, propostas, pedidos]);

    const propostasPorStatusData = useMemo(() => {
        const counts: { [key in PropostaStatus]?: number } = {};
        for (const proposta of propostas) {
            counts[proposta.proposta_status] = (counts[proposta.proposta_status] || 0) + 1;
        }
        return Object.entries(counts).map(([label, value]) => ({ label, value }));
    }, [propostas]);
    
    const receitaMensalData = useMemo(() => {
        const data: { [key: string]: { empenhado: number; faturado: number } } = {};
        
        const processDate = (dateStr: string | undefined): string | null => {
            if (!dateStr) return null;
            const d = parseBrazilianDate(dateStr);
            return d ? `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear().toString().slice(-2)}` : null;
        };

        pedidos.forEach(p => {
            const monthKey = processDate(p.empenho_data);
            if(monthKey) {
                if(!data[monthKey]) data[monthKey] = { empenhado: 0, faturado: 0 };
                data[monthKey].empenhado += p.itens_empenhados.reduce((sum, item) => sum + item.item_total, 0);
            }
            (p.notas_fiscais || []).forEach(nf => {
                const nfMonthKey = processDate(nf.nf_emissao);
                if(nfMonthKey) {
                    if(!data[nfMonthKey]) data[nfMonthKey] = { empenhado: 0, faturado: 0 };
                    data[nfMonthKey].faturado += (nf.itens_faturados || []).reduce((sum, item) => sum + item.item_total, 0);
                }
            });
        });
        
        return Object.entries(data).map(([month, values]) => ({ month, ...values }));
    }, [pedidos]);
    
    const licitacoesPorModalidadeData = useMemo(() => {
        const counts: { [key: string]: number } = {};
        for (const licitacao of licitacoes) {
            counts[licitacao.licitacao_modalidade] = (counts[licitacao.licitacao_modalidade] || 0) + 1;
        }
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [licitacoes]);

    return (
        <div className="h-full w-full bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full flex flex-col">
                 <h1 className="text-3xl font-bold text-gray-800 mb-6">Painel de Desempenho</h1>
                 <div className="flex-grow overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <KpiCard title="Total Vencido" value={formatCurrency(kpiData.totalVencido)} icon={<TrendingUp size={24} />} />
                        <KpiCard title="Total Faturado" value={formatCurrency(kpiData.totalFaturado)} icon={<DollarSign size={24} />} />
                        <KpiCard title="Taxa de Sucesso" value={`${kpiData.taxaSucesso.toFixed(1)}%`} icon={<Target size={24} />} />
                        <KpiCard title="Licitações Ativas" value={kpiData.licitacoesAtivas} icon={<FileText size={24} />} />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Propostas por Status">
                            <SimpleBarChart data={propostasPorStatusData} />
                        </ChartCard>
                         <ChartCard title="Receita Mensal (Empenhado vs. Faturado)">
                             <GroupedBarChart data={receitaMensalData} />
                        </ChartCard>
                         <ChartCard title="Licitações por Modalidade">
                            <SimplePieChart data={licitacoesPorModalidadeData} />
                        </ChartCard>
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default PainelPage;