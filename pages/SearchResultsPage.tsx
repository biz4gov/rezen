
import React from 'react';
import type { LicitacaoData, PropostaData, PedidoData, ProductData, UnidadeAdministrativaData, EmpresaData } from '../types';
import { FileText, Briefcase, ShoppingCart, Package, Search } from 'lucide-react';

interface SearchResultsPageProps {
  query: string;
  licitacoes: LicitacaoData[];
  propostas: PropostaData[];
  pedidos: PedidoData[];
  products: ProductData[];
  unidadesAdministrativas: UnidadeAdministrativaData[];
  empresas: EmpresaData[];
  onEditLicitacao: (id: string) => void;
  onEditProposta: (id: string) => void;
  onEditPedido: (id: string) => void;
  onEditProduct: (id: string) => void;
}

const ResultCard = ({ title, subtext, onClick }: { title: string, subtext: string, onClick: () => void }) => (
    <div onClick={onClick} className="p-4 rounded-md border bg-white hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors">
        <p className="font-semibold text-gray-800 truncate" title={title}>{title}</p>
        <p className="text-sm text-gray-500 truncate mt-1" title={subtext}>{subtext}</p>
    </div>
);

const ResultsSection = ({ title, icon, count, children }: { title: string, icon: React.ReactNode, count: number, children: React.ReactNode }) => {
    if (count === 0) return null;
    return (
        <div>
            <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
                {icon}
                <span className="ml-3">{title}</span>
                <span className="ml-3 text-sm bg-gray-200 text-gray-600 font-semibold rounded-full px-2.5 py-0.5">{count}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {children}
            </div>
        </div>
    );
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  query,
  licitacoes,
  propostas,
  pedidos,
  products,
  unidadesAdministrativas,
  empresas,
  onEditLicitacao,
  onEditProposta,
  onEditPedido,
  onEditProduct
}) => {
  const lowercasedQuery = query.toLowerCase();

  const filteredLicitacoes = licitacoes.filter(l => {
    const unidade = unidadesAdministrativas.find(u => u.unidade_unique_id === l.unidade_administrativa_id);
    return l.licitacao_objeto.toLowerCase().includes(lowercasedQuery) ||
      l.licitacao_numero.toLowerCase().includes(lowercasedQuery) ||
      (unidade && unidade.nome_completo.toLowerCase().includes(lowercasedQuery)) ||
      (unidade && unidade.uasg && unidade.uasg.toLowerCase().includes(lowercasedQuery));
  });

  const filteredPropostas = propostas.filter(p => {
    const licitacao = licitacoes.find(l => l.licitacao_unique === p.licitacao_unique_id);
    if (!licitacao) return false;
    
    const orgaoGerenciador = unidadesAdministrativas.find(u => u.unidade_unique_id === licitacao.unidade_administrativa_id);
    const orgaoAderente = p.is_adesao ? unidadesAdministrativas.find(u => u.unidade_unique_id === p.orgao_adesao_id) : null;
    const empresa = empresas.find(e => e.empresa_unique_id === p.empresa_unique_id);

    return licitacao.licitacao_objeto.toLowerCase().includes(lowercasedQuery) ||
           licitacao.licitacao_numero.toLowerCase().includes(lowercasedQuery) ||
           (orgaoGerenciador && orgaoGerenciador.nome_completo.toLowerCase().includes(lowercasedQuery)) ||
           (orgaoAderente && orgaoAderente.nome_completo.toLowerCase().includes(lowercasedQuery)) ||
           (empresa && empresa.nome_completo.toLowerCase().includes(lowercasedQuery));
  });

  const filteredPedidos = pedidos.filter(p => {
    const licitacao = licitacoes.find(l => l.licitacao_unique === p.licitacao_unique_id);
    const unidade = unidadesAdministrativas.find(u => u.unidade_unique_id === p.unidade_administrativa_id);
    const empresa = empresas.find(e => e.empresa_unique_id === p.empresa_unique_id);

    return p.empenho_numero.toLowerCase().includes(lowercasedQuery) ||
           (licitacao && licitacao.licitacao_objeto.toLowerCase().includes(lowercasedQuery)) ||
           (licitacao && licitacao.licitacao_numero.toLowerCase().includes(lowercasedQuery)) ||
           (unidade && unidade.nome_completo.toLowerCase().includes(lowercasedQuery)) ||
           (empresa && empresa.nome_completo.toLowerCase().includes(lowercasedQuery));
  });

  const filteredProducts = products.filter(p =>
    p.produto_nome.toLowerCase().includes(lowercasedQuery) ||
    p.produto_codigo.toLowerCase().includes(lowercasedQuery)
  );

  const totalResults = filteredLicitacoes.length + filteredPropostas.length + filteredPedidos.length + filteredProducts.length;

  return (
    <div className="h-full w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full flex flex-col">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
                Resultados da busca por: <span className="text-blue-800">"{query}"</span>
            </h1>
            <p className="text-md text-gray-500 mt-1">{totalResults} {totalResults === 1 ? 'resultado encontrado' : 'resultados encontrados'}</p>
        </div>

        {totalResults > 0 ? (
            <div className="flex-grow overflow-y-auto space-y-8 pr-2">
                <ResultsSection title="Licitações" icon={<FileText size={24} />} count={filteredLicitacoes.length}>
                    {filteredLicitacoes.map(l => {
                      const unidade = unidadesAdministrativas.find(u => u.unidade_unique_id === l.unidade_administrativa_id);
                      return <ResultCard key={l.licitacao_unique} title={l.licitacao_objeto} subtext={`${unidade?.nome_completo || ''} - ${l.licitacao_numero}`} onClick={() => onEditLicitacao(l.licitacao_unique)} />
                    })}
                </ResultsSection>

                <ResultsSection title="Propostas" icon={<Briefcase size={24} />} count={filteredPropostas.length}>
                    {filteredPropostas.map(p => {
                        const l = licitacoes.find(l => l.licitacao_unique === p.licitacao_unique_id);
                        const e = empresas.find(e => e.empresa_unique_id === p.empresa_unique_id);
                        return <ResultCard key={p.proposta_unique_id} title={`Proposta: ${l?.licitacao_objeto || ''}`} subtext={`Empresa: ${e?.nome_completo || 'N/A'} | Criada em: ${new Date(p.data_criacao).toLocaleDateString()}`} onClick={() => onEditProposta(p.proposta_unique_id)} />
                    })}
                </ResultsSection>

                <ResultsSection title="Pedidos" icon={<ShoppingCart size={24} />} count={filteredPedidos.length}>
                    {filteredPedidos.map(p => {
                        const u = unidadesAdministrativas.find(un => un.unidade_unique_id === p.unidade_administrativa_id);
                        return <ResultCard key={p.pedido_unique_id} title={`Pedido: ${p.empenho_numero}`} subtext={u?.nome_completo || 'Órgão desconhecido'} onClick={() => onEditPedido(p.pedido_unique_id)} />
                    })}
                </ResultsSection>

                <ResultsSection title="Produtos" icon={<Package size={24} />} count={filteredProducts.length}>
                    {filteredProducts.map(p => <ResultCard key={p.produto_unique} title={p.produto_nome} subtext={`Código: ${p.produto_codigo || 'N/A'}`} onClick={() => onEditProduct(p.produto_unique)} />)}
                </ResultsSection>
            </div>
        ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300 rounded-lg">
                <Search className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-800">Nenhum resultado encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">Tente buscar por outros termos.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;