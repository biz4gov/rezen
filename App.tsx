

import React, { useState, useEffect, useCallback } from 'react';
import type { LicitacaoData, PropostaData, ProductData, PedidoData, ConstantItem, WhatsappConfig, EmpresaData, UnidadeAdministrativaData, BrandingConfig, NotaFiscalData, LicitacaoItem, PropostaStatus, PedidoStatus, UserData, ProfileData, Permission, UserWithProfile } from './types';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PainelPage from './pages/PainelPage';
import EditalPage from './pages/EditalPage';
import PropostaPage from './pages/PropostaPage';
import PedidoPage from './pages/PedidoPage';
import CartaPropostaPage from './pages/CartaPropostaPage';
import ProductsListPage from './pages/ProductsListPage';
import ProductPage from './pages/ProductPage';
import SearchResultsPage from './pages/SearchResultsPage';
import SettingsPage from './pages/SettingsPage';
import ConstantManagementPage from './pages/ConstantManagementPage';
import PromptSettingsPage from './pages/PromptSettingsPage';
import WhatsappConfigPage from './pages/WhatsappConfigPage';
import BrandingPage from './pages/BrandingPage';
import EmpresasListPage from './pages/EmpresasListPage';
import EmpresaPage from './pages/EmpresaPage';
import UnidadesAdministrativasListPage from './pages/UnidadesAdministrativasListPage';
import UnidadeAdministrativaPage from './pages/UnidadeAdministrativaPage';
import LicitacoesListPage from './pages/LicitacoesListPage';
import PropostasListPage from './pages/PropostasListPage';
import PedidosListPage from './pages/PedidosListPage';
import UsersListPage from './pages/UsersListPage';
import UserPage from './pages/UserPage';
import SelectParentModal from './components/SelectParentModal';
import AlertModal from './components/AlertModal';
import { FileText, Briefcase, ShoppingCart, Loader2, Package as ProductIcon, Search, Settings, Home, Building2, Landmark, LayoutDashboard, Users, LogOut } from 'lucide-react';
import * as api from './services/api';
import * as C from './constants';
import { REZEN_LOGO } from './assets';

type Page = 'home' | 'login' | 'painel' | 'edital' | 'proposta' | 'pedido' | 'carta' | 'productsList' | 'productEdit' | 'searchResults' | 'settings' | 'constantManagement' | 'promptSettings' | 'whatsappConfig' | 'branding' | 'empresasList' | 'empresaEdit' | 'unidadesAdministrativasList' | 'unidadeAdministrativaEdit' | 'licitacoesList' | 'propostasList' | 'pedidosList' | 'usersList' | 'userEdit';

export interface ConstantConfig {
  key: string;
  title: string;
  defaultValues: ConstantItem[];
}

const Header = React.memo(({ logomarcaUrl, currentUser, onCancelForm, onSearch, searchQuery, setSearchQuery, onNavigateToLicitacoes, onNavigateToPropostas, onNavigateToPedidos, onNavigateToProducts, onNavigateToSettings, onNavigateToEmpresas, onNavigateToUnidades, onNavigateToPainel, onNavigateToUsers, onLogout, hasPermission }: any) => (
    <header className="bg-white shadow-md flex-shrink-0 z-40 w-full fixed top-0 left-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center gap-4 h-16">
        <div className="flex items-center gap-3 flex-shrink-0">
          <img src={logomarcaUrl} alt="Rezen Logo" className="h-10 cursor-pointer object-contain" onClick={onCancelForm} title="Página Inicial"/>
          {currentUser && (
            <>
              <button onClick={onCancelForm} className="text-gray-600 p-2 rounded-md hover:bg-gray-200 transition-colors" title="Página Inicial"><Home size={20}/></button>
              {hasPermission('painel:view') && <button onClick={onNavigateToPainel} className="text-gray-600 p-2 rounded-md hover:bg-gray-200 transition-colors" title="Painel"><LayoutDashboard size={20}/></button>}
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {currentUser && (
            <>
              <div className="flex-1 max-w-xs xl:max-w-md">
                <form onSubmit={onSearch} className="relative">
                    <input type="search" name="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 border rounded-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm"/>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </form>
              </div>
              <nav className="flex items-center space-x-1">
                <button onClick={onNavigateToLicitacoes} className="flex items-center text-gray-600 font-semibold p-2 rounded-md hover:bg-gray-200 transition-colors" title="Licitações"><FileText size={18} /></button>
                <button onClick={onNavigateToPropostas} className="flex items-center text-gray-600 font-semibold p-2 rounded-md hover:bg-gray-200 transition-colors" title="Propostas"><Briefcase size={18} /></button>
                <button onClick={onNavigateToPedidos} className="flex items-center text-gray-600 font-semibold p-2 rounded-md hover:bg-gray-200 transition-colors" title="Pedidos"><ShoppingCart size={18} /></button>
                <button onClick={onNavigateToUnidades} className="flex items-center text-gray-600 font-semibold p-2 rounded-md hover:bg-gray-200 transition-colors" title="Unidades Administrativas"><Landmark size={18} /></button>
                <button onClick={onNavigateToEmpresas} className="flex items-center text-gray-600 font-semibold p-2 rounded-md hover:bg-gray-200 transition-colors" title="Empresas"><Building2 size={18} /></button>
                <button onClick={onNavigateToProducts} className="flex items-center text-gray-600 font-semibold p-2 rounded-md hover:bg-gray-200 transition-colors" title="Produtos"><ProductIcon size={18} /></button>
                {hasPermission('users:manage') && <button onClick={onNavigateToUsers} className="flex items-center text-gray-600 font-semibold p-2 rounded-md hover:bg-gray-200 transition-colors" title="Usuários"><Users size={18} /></button>}
                {hasPermission('settings:view') && <button onClick={onNavigateToSettings} className="flex items-center text-gray-600 font-semibold p-2 rounded-md hover:bg-gray-200 transition-colors" title="Configurações"><Settings size={18} /></button>}
              </nav>
              <div className="flex items-center border-l pl-4 ml-2">
                  <span className="text-sm text-gray-600 truncate max-w-[150px]" title={currentUser.email}>{currentUser.email}</span>
                  <button onClick={onLogout} className="ml-2 p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors" title="Logout"><LogOut size={18}/></button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
));

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [currentUser, setCurrentUser] = useState<UserWithProfile | null>(null);

    const [selectedLicitacaoId, setSelectedLicitacaoId] = useState<string | null>(null);
    const [selectedPropostaId, setSelectedPropostaId] = useState<string | null>(null);
    const [selectedPedidoId, setSelectedPedidoId] = useState<string | null>(null);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | null>(null);
    const [selectedUnidadeId, setSelectedUnidadeId] = useState<string | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const [selectParentModalConfig, setSelectParentModalConfig] = useState<{ isOpen: boolean; type: 'proposta' | 'pedido'; }>({ isOpen: false, type: 'proposta' });
    const [alertModalConfig, setAlertModalConfig] = useState({ isOpen: false, message: '' });
    const [editingConstantConfig, setEditingConstantConfig] = useState<ConstantConfig | null>(null);
    const [cartaPropostaMode, setCartaPropostaMode] = useState<'proposta' | 'reserva' | 'orçamento' | 'adesao'>('proposta');

    // Main data state
    const [licitacoes, setLicitacoes] = useState<LicitacaoData[]>([]);
    const [propostas, setPropostas] = useState<PropostaData[]>([]);
    const [products, setProducts] = useState<ProductData[]>([]);
    const [pedidos, setPedidos] = useState<PedidoData[]>([]);
    const [empresas, setEmpresas] = useState<EmpresaData[]>([]);
    const [unidadesAdministrativas, setUnidadesAdministrativas] = useState<UnidadeAdministrativaData[]>([]);
    const [users, setUsers] = useState<UserData[]>([]);
    const [profiles, setProfiles] = useState<ProfileData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Configurable constants state
    const [modalidades, setModalidades] = useState<ConstantItem[]>([]);
    const [legislacoes, setLegislacoes] = useState<ConstantItem[]>([]);
    const [criterios, setCriterios] = useState<ConstantItem[]>([]);
    const [modosDisputa, setModosDisputa] = useState<ConstantItem[]>([]);
    const [propostaStatus, setPropostaStatus] = useState<ConstantItem[]>([]);
    const [pedidoStatus, setPedidoStatus] = useState<ConstantItem[]>([]);
    const [geminiPromptEdital, setGeminiPromptEdital] = useState('');
    const [geminiPromptResumo, setGeminiPromptResumo] = useState('');
    const [geminiPromptPedido, setGeminiPromptPedido] = useState('');
    const [geminiPromptNf, setGeminiPromptNf] = useState('');
    const [geminiPromptEmpresa, setGeminiPromptEmpresa] = useState('');
    const [whatsappConfig, setWhatsappConfig] = useState<WhatsappConfig>(C.DEFAULT_WHATSAPP_CONFIG);
    const [brandingConfig, setBrandingConfig] = useState<BrandingConfig>(C.DEFAULT_BRANDING_CONFIG);

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const hasPermission = useCallback((permission: Permission): boolean => {
        if (!currentUser) return false;
        return currentUser.profile.permissions.includes(permission);
    }, [currentUser]);

    const constantsConfig: ConstantConfig[] = [
        { key: C.MODALIDADES_KEY, title: 'Modalidades de Licitação', defaultValues: C.DEFAULT_MODALIDADES },
        { key: C.LEGISLACOES_KEY, title: 'Legislações', defaultValues: C.DEFAULT_LEGISLACOES },
        { key: C.CRITERIOS_KEY, title: 'Critérios de Julgamento', defaultValues: C.DEFAULT_CRITERIOS },
        { key: C.MODOS_DISPUTA_KEY, title: 'Modos de Disputa', defaultValues: C.DEFAULT_MODOS_DISPUTA },
        { key: C.PROPOSTA_STATUS_KEY, title: 'Status de Proposta', defaultValues: C.DEFAULT_PROPOSTA_STATUS },
        { key: C.PEDIDO_STATUS_KEY, title: 'Status de Pedido', defaultValues: C.DEFAULT_PEDIDO_STATUS },
    ];
    
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const [
                    modalidadesData, legislacoesData, criteriosData, modosDisputaData,
                    propostaStatusData, pedidoStatusData, promptEditalData, promptResumoData, promptPedidoData, promptNfData,
                    promptEmpresaData, whatsappConfigData, brandingConfigData, licitacoesData, propostasData, productsData, 
                    pedidosData, empresasData, unidadesData, usersData, profilesData
                ] = await Promise.all([
                    api.getModalidades(), api.getLegislacoes(), api.getCriterios(), api.getModosDisputa(),
                    api.getPropostaStatus(), api.getPedidoStatus(), api.getGeminiPromptEdital(),
                    api.getGeminiPromptResumo(), api.getGeminiPromptPedido(), api.getGeminiPromptNf(), api.getGeminiPromptEmpresa(),
                    api.getWhatsappConfig(), api.getBrandingConfig(), api.getLicitacoes(), api.getPropostas(), api.getProducts(),
                    api.getPedidos(), api.getEmpresas(), api.getUnidadesAdministrativas(), api.getUsers(), api.getProfiles()
                ]);

                setModalidades(modalidadesData); setLegislacoes(legislacoesData); setCriterios(criteriosData);
                setModosDisputa(modosDisputaData); setPropostaStatus(propostaStatusData); setPedidoStatus(pedidoStatusData);
                setGeminiPromptEdital(promptEditalData); setGeminiPromptResumo(promptResumoData); setGeminiPromptPedido(promptPedidoData);
                setGeminiPromptNf(promptNfData); setGeminiPromptEmpresa(promptEmpresaData); setWhatsappConfig(whatsappConfigData);
                setBrandingConfig(brandingConfigData); setLicitacoes(licitacoesData); setPropostas(propostasData);
                setProducts(productsData); setPedidos(pedidosData); setEmpresas(empresasData);
                setUnidadesAdministrativas(unidadesData); setUsers(usersData); setProfiles(profilesData);
                
                // Attempt to log in from token
                const user = await api.getUserFromToken();
                if (user) {
                    setCurrentUser(user);
                    setCurrentPage('home');
                } else {
                    setCurrentPage('login');
                }
            } catch (error) {
                console.error("Failed to load initial data", error);
                setCurrentPage('login');
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const showAlertModal = useCallback((message: string) => {
        setAlertModalConfig({ isOpen: true, message });
    }, []);

    const handleLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
        try {
            const user = await api.login(email, password);
            if (user) {
                setCurrentUser(user);
                setCurrentPage('home');
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login failed:", error);
            return false;
        }
    }, []);

    const handleLogout = useCallback(() => {
        api.logout();
        setCurrentUser(null);
        setCurrentPage('login');
    }, []);

    const handleCancelForm = useCallback(() => {
        setCurrentPage('home');
        setSelectedLicitacaoId(null); setSelectedPropostaId(null); setSelectedPedidoId(null);
        setSelectedProductId(null); setSelectedEmpresaId(null); setSelectedUnidadeId(null);
        setSelectedUserId(null); setSearchQuery(''); setEditingConstantConfig(null);
    }, []);

    // --- Save Handlers ---
    const handleSaveEdital = useCallback(async (data: LicitacaoData) => {
        const newLicitacoes = [...licitacoes.filter(l => l.licitacao_unique !== data.licitacao_unique), data];
        setLicitacoes(newLicitacoes);
        await api.saveLicitacoes(newLicitacoes);
        if (selectedLicitacaoId !== data.licitacao_unique) setSelectedLicitacaoId(data.licitacao_unique);
        setCurrentPage('licitacoesList');
    }, [licitacoes, selectedLicitacaoId]);

    const handleSaveProposta = useCallback(async (propostaData: PropostaData, licitacaoData?: LicitacaoData) => {
        const newPropostas = [...propostas.filter(p => p.proposta_unique_id !== propostaData.proposta_unique_id), propostaData];
        setPropostas(newPropostas);
        await api.savePropostas(newPropostas);
        if (licitacaoData) {
            const newLicitacoes = [...licitacoes.filter(l => l.licitacao_unique !== licitacaoData.licitacao_unique), licitacaoData];
            setLicitacoes(newLicitacoes); await api.saveLicitacoes(newLicitacoes);
        }
        if (selectedPropostaId !== propostaData.proposta_unique_id) setSelectedPropostaId(propostaData.proposta_unique_id);
    }, [propostas, licitacoes, selectedPropostaId]);

    const handleSaveProduct = useCallback(async (data: ProductData) => {
        const newProducts = [...products.filter(p => p.produto_unique !== data.produto_unique), data];
        setProducts(newProducts); await api.saveProducts(newProducts);
        setCurrentPage('productsList'); setSelectedProductId(null);
    }, [products]);

    const handleSaveProductFromModal = useCallback(async (data: ProductData) => {
        const newProducts = [...products.filter(p => p.produto_unique !== data.produto_unique), data];
        setProducts(newProducts); await api.saveProducts(newProducts);
    }, [products]);
    
    const handleSavePedido = useCallback(async (data: PedidoData) => {
        const newPedidos = [...pedidos.filter(p => p.pedido_unique_id !== data.pedido_unique_id), data];
        setPedidos(newPedidos); await api.savePedidos(newPedidos);
        if (selectedPedidoId !== data.pedido_unique_id) setSelectedPedidoId(data.pedido_unique_id);
    }, [pedidos, selectedPedidoId]);

    const handleSaveEmpresa = useCallback(async (data: EmpresaData) => {
        const newEmpresas = [...empresas.filter(e => e.empresa_unique_id !== data.empresa_unique_id), data];
        setEmpresas(newEmpresas); await api.saveEmpresas(newEmpresas);
        if (selectedEmpresaId !== data.empresa_unique_id) setSelectedEmpresaId(data.empresa_unique_id);
        setCurrentPage('empresasList');
    }, [empresas, selectedEmpresaId]);
    
    const handleSaveUnidade = useCallback(async (data: UnidadeAdministrativaData) => {
        const newUnidades = [...unidadesAdministrativas.filter(u => u.unidade_unique_id !== data.unidade_unique_id), data];
        setUnidadesAdministrativas(newUnidades); await api.saveUnidadesAdministrativas(newUnidades);
    }, [unidadesAdministrativas]);
    
    const handleSaveWhatsappConfig = useCallback(async (data: WhatsappConfig) => {
        await api.saveWhatsappConfig(data); setWhatsappConfig(data);
    }, []);

    const handleSaveBranding = useCallback(async (data: BrandingConfig) => {
        await api.saveBrandingConfig(data); setBrandingConfig(data); setCurrentPage('settings');
    }, []);

    const handleSaveUser = useCallback(async (data: UserData) => {
        const newUsers = [...users.filter(u => u.user_unique_id !== data.user_unique_id), data];
        setUsers(newUsers); await api.saveUsers(newUsers);
        setCurrentPage('usersList'); setSelectedUserId(null);
    }, [users]);
    
    // --- Delete Handlers ---
    const handleDeleteLicitacao = useCallback(async (id: string) => { if (window.confirm('Tem certeza? Todas as propostas e pedidos associados serão excluídos.')) { const propostasToDelete = propostas.filter(p => p.licitacao_unique_id === id).map(p => p.proposta_unique_id); const newPedidos = pedidos.filter(p => !propostasToDelete.includes(p.proposta_unique_id)); const newPropostas = propostas.filter(p => p.licitacao_unique_id !== id); const newLicitacoes = licitacoes.filter(l => l.licitacao_unique !== id); setPedidos(newPedidos); setPropostas(newPropostas); setLicitacoes(newLicitacoes); await api.savePedidos(newPedidos); await api.savePropostas(newPropostas); await api.saveLicitacoes(newLicitacoes); } }, [propostas, pedidos, licitacoes]);
    const handleDeleteProposta = useCallback(async (id: string) => { if (window.confirm('Tem certeza? Todos os pedidos associados serão excluídos.')) { const newPedidos = pedidos.filter(p => p.proposta_unique_id !== id); const newPropostas = propostas.filter(p => p.proposta_unique_id !== id); setPedidos(newPedidos); setPropostas(newPropostas); await api.savePedidos(newPedidos); await api.savePropostas(newPropostas); } }, [pedidos, propostas]);
    const handleDeletePedido = useCallback(async (id: string) => { if (window.confirm('Tem certeza?')) { const newPedidos = pedidos.filter(p => p.pedido_unique_id !== id); setPedidos(newPedidos); await api.savePedidos(newPedidos); } }, [pedidos]);
    const handleDeleteProduct = useCallback(async (id: string) => { if (window.confirm('Tem certeza?')) { const newProducts = products.filter(p => p.produto_unique !== id); setProducts(newProducts); await api.saveProducts(newProducts); } }, [products]);
    const handleDeleteEmpresa = useCallback(async (id: string) => { if (window.confirm('Tem certeza? Propostas e pedidos associados serão removidos.')) { const propostasToDelete = propostas.filter(p => p.empresa_unique_id === id).map(p => p.proposta_unique_id); const newPedidos = pedidos.filter(p => p.empresa_unique_id !== id); const newPropostas = propostas.filter(p => p.empresa_unique_id !== id); const newEmpresas = empresas.filter(e => e.empresa_unique_id !== id); setPedidos(newPedidos); setPropostas(newPropostas); setEmpresas(newEmpresas); await api.savePedidos(newPedidos); await api.savePropostas(newPropostas); await api.saveEmpresas(newEmpresas); } }, [propostas, pedidos, empresas]);
    const handleDeleteUnidade = useCallback(async (id: string) => {
        if (window.confirm('Tem certeza? Licitações, propostas e pedidos associados a esta unidade serão removidos.')) {
            const licitacoesToDelete = licitacoes.filter(l => l.unidade_administrativa_id === id).map(l => l.licitacao_unique);
            const propostasFromLicitacoesToDelete = propostas.filter(p => licitacoesToDelete.includes(p.licitacao_unique_id)).map(p => p.proposta_unique_id);
            const propostasFromUnidadeAdesao = propostas.filter(p => p.orgao_adesao_id === id).map(p => p.proposta_unique_id);
            const allPropostasToDelete = [...new Set([...propostasFromLicitacoesToDelete, ...propostasFromUnidadeAdesao])];

            const newPedidos = pedidos.filter(p => !allPropostasToDelete.includes(p.proposta_unique_id) && p.unidade_administrativa_id !== id);
            const newPropostas = propostas.filter(p => !allPropostasToDelete.includes(p.proposta_unique_id));
            const newLicitacoes = licitacoes.filter(l => l.unidade_administrativa_id !== id);
            const newUnidades = unidadesAdministrativas.filter(u => u.unidade_unique_id !== id);

            setPedidos(newPedidos);
            setPropostas(newPropostas);
            setLicitacoes(newLicitacoes);
            setUnidadesAdministrativas(newUnidades);

            await api.savePedidos(newPedidos);
            await api.savePropostas(newPropostas);
            await api.saveLicitacoes(newLicitacoes);
            await api.saveUnidadesAdministrativas(newUnidades);
        }
    }, [licitacoes, propostas, pedidos, unidadesAdministrativas]);
    const handleDeleteUser = useCallback(async (id: string) => { if (window.confirm('Tem certeza?')) { const newUsers = users.filter(u => u.user_unique_id !== id); setUsers(newUsers); await api.saveUsers(newUsers); } }, [users]);

    // --- Navigation Handlers ---
    const handleNavigateToEditEdital = useCallback((id: string) => { setSelectedLicitacaoId(id); setCurrentPage('edital'); }, []);
    const handleNavigateToEditProposta = useCallback((id: string) => { setSelectedPropostaId(id); setCurrentPage('proposta'); }, []);
    const handleNavigateToEditPedido = useCallback((id: string) => { setSelectedPedidoId(id); setCurrentPage('pedido'); }, []);
    const handleNavigateToEditProduct = useCallback((id: string) => { setSelectedProductId(id); setCurrentPage('productEdit'); }, []);
    const handleNavigateToEditEmpresa = useCallback((id: string) => { setSelectedEmpresaId(id); setCurrentPage('empresaEdit'); }, []);
    const handleNavigateToEditUnidade = useCallback((id: string) => { setSelectedUnidadeId(id); setCurrentPage('unidadeAdministrativaEdit'); }, []);
    const handleNavigateToEditUser = useCallback((id: string) => { setSelectedUserId(id); setCurrentPage('userEdit'); }, []);

    const handleNavigateToAddEdital = useCallback(() => { setSelectedLicitacaoId(null); setCurrentPage('edital'); }, []);
    const handleNavigateToAddPropostaForLicitacao = useCallback((id: string) => { setSelectedLicitacaoId(id); setSelectedPropostaId(null); setCurrentPage('proposta'); }, []);
    const handleNavigateToAddPedidoForProposta = useCallback((id: string) => { setSelectedPropostaId(id); setSelectedPedidoId(null); setCurrentPage('pedido'); }, []);
    const handleNavigateToAddProduct = useCallback(() => { setSelectedProductId(null); setCurrentPage('productEdit'); }, []);
    const handleNavigateToAddEmpresa = useCallback(() => { setSelectedEmpresaId(null); setCurrentPage('empresaEdit'); }, []);
    const handleNavigateToAddUnidade = useCallback(() => { setSelectedUnidadeId(null); setCurrentPage('unidadeAdministrativaEdit'); }, []);
    const handleNavigateToAddUser = useCallback(() => { setSelectedUserId(null); setCurrentPage('userEdit'); }, []);


    const logomarcaUrl = brandingConfig.logomarca && 'base64' in brandingConfig.logomarca ? brandingConfig.logomarca.base64 : REZEN_LOGO;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full bg-gray-100">
                <Loader2 className="h-12 w-12 animate-spin text-blue-800" />
            </div>
        );
    }
    
    const selectedLicitacao = licitacoes.find(l => l.licitacao_unique === selectedLicitacaoId);
    const selectedProposta = propostas.find(p => p.proposta_unique_id === selectedPropostaId);
    const selectedPedido = pedidos.find(p => p.pedido_unique_id === selectedPedidoId);
    const selectedProduct = products.find(p => p.produto_unique === selectedProductId);
    const selectedEmpresa = empresas.find(e => e.empresa_unique_id === selectedEmpresaId);
    const selectedUnidade = unidadesAdministrativas.find(u => u.unidade_unique_id === selectedUnidadeId);
    const selectedUser = users.find(u => u.user_unique_id === selectedUserId);

    const renderPage = () => {
        if (!currentUser && currentPage !== 'login') {
             return <LoginPage onLogin={handleLogin} />;
        }
        
        switch (currentPage) {
            case 'login':
                return <LoginPage onLogin={handleLogin} />;
            case 'home':
                return <HomePage 
                    licitacoes={licitacoes} propostas={propostas} pedidos={pedidos} unidadesAdministrativas={unidadesAdministrativas}
                    onNavigateToEditEdital={handleNavigateToEditEdital}
                    onNavigateToEditProposta={handleNavigateToEditProposta}
                    onNavigateToEditPedido={handleNavigateToEditPedido}
                    onNavigateToAddEdital={handleNavigateToAddEdital}
                    onNavigateToAddProposta={() => setSelectParentModalConfig({ isOpen: true, type: 'proposta' })}
                    onNavigateToAddPedido={() => setSelectParentModalConfig({ isOpen: true, type: 'pedido' })}
                />;
            case 'painel':
                 if (!hasPermission('painel:view')) return <div className="p-8 text-center">Acesso negado.</div>;
                return <PainelPage licitacoes={licitacoes} propostas={propostas} pedidos={pedidos} />;
            case 'licitacoesList':
                return <LicitacoesListPage 
                    licitacoes={licitacoes} unidadesAdministrativas={unidadesAdministrativas} empresas={empresas}
                    onAddLicitacao={handleNavigateToAddEdital}
                    onEditLicitacao={handleNavigateToEditEdital}
                    onDeleteLicitacao={handleDeleteLicitacao}
                    onAddProposta={handleNavigateToAddPropostaForLicitacao}
                    whatsappConfig={whatsappConfig} onShowAlert={showAlertModal}
                />;
            case 'edital':
                 if (!hasPermission('licitacoes:edit')) return <div className="p-8 text-center">Acesso negado.</div>;
                return <EditalPage
                    onSave={handleSaveEdital} onCancel={handleCancelForm} initialData={selectedLicitacao || undefined}
                    onNavigateToProposta={handleNavigateToAddPropostaForLicitacao}
                    modalidades={modalidades} legislacoes={legislacoes} criterios={criterios} modosDisputa={modosDisputa}
                    geminiSystemPrompt={geminiPromptEdital} geminiResumoPrompt={geminiPromptResumo}
                    whatsappConfig={whatsappConfig} unidadesAdministrativas={unidadesAdministrativas}
                    empresas={empresas} onSaveUnidade={handleSaveUnidade} onShowAlert={showAlertModal}
                />;
            case 'propostasList':
                return <PropostasListPage 
                    propostas={propostas} licitacoes={licitacoes} unidadesAdministrativas={unidadesAdministrativas} empresas={empresas}
                    onAddProposta={() => setSelectParentModalConfig({ isOpen: true, type: 'proposta' })}
                    onEditProposta={handleNavigateToEditProposta}
                    onDeleteProposta={handleDeleteProposta}
                    onAddPedido={handleNavigateToAddPedidoForProposta}
                    onSendEmail={(id) => console.log('send email', id)}
                    whatsappConfig={whatsappConfig} onShowAlert={showAlertModal}
                />;
            case 'proposta': {
                if (!hasPermission('propostas:edit')) return <div className="p-8 text-center">Acesso negado.</div>;
                const licitacaoForProposta = licitacoes.find(l => l.licitacao_unique === (selectedProposta?.licitacao_unique_id || selectedLicitacaoId));
                if (!licitacaoForProposta) return <div className="p-8 text-center">Licitação não encontrada para esta proposta. Volte para a lista.</div>;
                return <PropostaPage
                    licitacao={licitacaoForProposta} initialData={selectedProposta || undefined}
                    onSave={handleSaveProposta} onCancel={handleCancelForm} products={products} empresas={empresas}
                    unidadesAdministrativas={unidadesAdministrativas} onSaveProduct={handleSaveProductFromModal}
                    onNavigateToCarta={(id, mode) => { setSelectedPropostaId(id); setCartaPropostaMode(mode); setCurrentPage('carta'); }}
                    propostaStatus={propostaStatus} whatsappConfig={whatsappConfig} onShowAlert={showAlertModal}
                />;
            }
            case 'pedidosList':
                 return <PedidosListPage 
                    pedidos={pedidos} licitacoes={licitacoes} unidadesAdministrativas={unidadesAdministrativas} empresas={empresas}
                    onAddPedido={() => setSelectParentModalConfig({ isOpen: true, type: 'pedido' })}
                    onEditPedido={handleNavigateToEditPedido}
                    onDeletePedido={handleDeletePedido}
                    onFaturarPedido={(id) => console.log("Faturar", id)}
                    onEntregarPedido={(id) => console.log("Entregar", id)}
                    whatsappConfig={whatsappConfig} onShowAlert={showAlertModal}
                 />;
            case 'pedido': {
                 if (!hasPermission('pedidos:edit')) return <div className="p-8 text-center">Acesso negado.</div>;
                const propostaForPedido = propostas.find(p => p.proposta_unique_id === (selectedPedido?.proposta_unique_id || selectedPropostaId));
                if (!propostaForPedido) return <div className="p-8 text-center">Proposta não encontrada para este pedido. Volte para a lista.</div>;
                const licitacaoForPedido = licitacoes.find(l => l.licitacao_unique === propostaForPedido.licitacao_unique_id);
                if (!licitacaoForPedido) return <div className="p-8 text-center">Licitação não encontrada para este pedido. Volte para a lista.</div>;
                return <PedidoPage
                    licitacao={licitacaoForPedido} proposta={propostaForPedido} initialData={selectedPedido || undefined}
                    onSave={handleSavePedido} onCancel={handleCancelForm} pedidoStatus={pedidoStatus}
                    geminiPedidoPrompt={geminiPromptPedido} geminiNfPrompt={geminiPromptNf}
                    whatsappConfig={whatsappConfig} unidadesAdministrativas={unidadesAdministrativas}
                    empresas={empresas} products={products} onShowAlert={showAlertModal}
                />;
            }
            case 'carta': {
                if (!selectedProposta) return <div>Proposta não encontrada.</div>;
                const licitacaoForCarta = licitacoes.find(l => l.licitacao_unique === selectedProposta.licitacao_unique_id);
                if (!licitacaoForCarta) return <div>Licitação não encontrada.</div>;
                const proponenteEmpresa = empresas.find(e => e.empresa_unique_id === selectedProposta.empresa_unique_id);
                if (!proponenteEmpresa) return <div>Empresa proponente não encontrada.</div>;
                return <CartaPropostaPage
                    licitacao={licitacaoForCarta} proposta={selectedProposta} products={products}
                    unidadesAdministrativas={unidadesAdministrativas}
                    onCancel={() => { setCurrentPage('proposta'); }}
                    proponenteEmpresa={proponenteEmpresa} brandingConfig={brandingConfig} mode={cartaPropostaMode}
                />;
            }
            case 'productsList':
                return <ProductsListPage products={products} onAddProduct={handleNavigateToAddProduct} onEditProduct={handleNavigateToEditProduct} onDeleteProduct={handleDeleteProduct} />;
            case 'productEdit':
                 if (!hasPermission('products:edit')) return <div className="p-8 text-center">Acesso negado.</div>;
                return <ProductPage onSave={handleSaveProduct} onCancel={() => setCurrentPage('productsList')} initialData={selectedProduct || undefined} />;
            case 'empresasList':
                return <EmpresasListPage empresas={empresas} onAddEmpresa={handleNavigateToAddEmpresa} onEditEmpresa={handleNavigateToEditEmpresa} onDeleteEmpresa={handleDeleteEmpresa} />;
            case 'empresaEdit':
                 if (!hasPermission('empresas:manage')) return <div className="p-8 text-center">Acesso negado.</div>;
                return <EmpresaPage onSave={handleSaveEmpresa} onCancel={() => setCurrentPage('empresasList')} initialData={selectedEmpresa || undefined} geminiPromptEmpresa={geminiPromptEmpresa} />;
            case 'unidadesAdministrativasList':
                return <UnidadesAdministrativasListPage unidades={unidadesAdministrativas} onAddUnidade={handleNavigateToAddUnidade} onEditUnidade={handleNavigateToEditUnidade} onDeleteUnidade={handleDeleteUnidade} />;
            case 'unidadeAdministrativaEdit':
                 if (!hasPermission('unidades:manage')) return <div className="p-8 text-center">Acesso negado.</div>;
                return <UnidadeAdministrativaPage onSave={handleSaveUnidade} onCancel={() => setCurrentPage('unidadesAdministrativasList')} initialData={selectedUnidade || undefined} />;
            case 'searchResults':
                return <SearchResultsPage query={searchQuery} licitacoes={licitacoes} propostas={propostas} pedidos={pedidos} products={products} unidadesAdministrativas={unidadesAdministrativas} empresas={empresas} onEditLicitacao={handleNavigateToEditEdital} onEditProposta={handleNavigateToEditProposta} onEditPedido={handleNavigateToEditPedido} onEditProduct={handleNavigateToEditProduct}/>;
            case 'settings':
                 if (!hasPermission('settings:view')) return <div className="p-8 text-center">Acesso negado.</div>;
                return <SettingsPage onBack={handleCancelForm} configs={constantsConfig} onNavigateToConstant={(config) => { setEditingConstantConfig(config); setCurrentPage('constantManagement'); }} onNavigateToPrompts={() => setCurrentPage('promptSettings')} onNavigateToWhatsappConfig={() => setCurrentPage('whatsappConfig')} onNavigateToBranding={() => setCurrentPage('branding')} />;
            case 'constantManagement':
                if (!editingConstantConfig) return <div>Erro: Nenhuma configuração selecionada.</div>;
                return <ConstantManagementPage config={editingConstantConfig} onBack={() => setCurrentPage('settings')} />;
            case 'promptSettings':
                return <PromptSettingsPage onBack={() => setCurrentPage('settings')} initialPrompts={{ edital: geminiPromptEdital, resumo: geminiPromptResumo, pedido: geminiPromptPedido, nf: geminiPromptNf, empresa: geminiPromptEmpresa }} />;
            case 'whatsappConfig':
                return <WhatsappConfigPage onBack={() => setCurrentPage('settings')} onSave={handleSaveWhatsappConfig} initialConfig={whatsappConfig} />;
            case 'branding':
                return <BrandingPage onBack={() => setCurrentPage('settings')} onSave={handleSaveBranding} initialConfig={brandingConfig} />;
            case 'usersList':
                 if (!hasPermission('users:manage')) return <div className="p-8 text-center">Acesso negado.</div>;
                return <UsersListPage users={users} profiles={profiles} onAddUser={handleNavigateToAddUser} onEditUser={handleNavigateToEditUser} onDeleteUser={handleDeleteUser} />;
            case 'userEdit':
                 if (!hasPermission('users:manage')) return <div className="p-8 text-center">Acesso negado.</div>;
                return <UserPage onSave={handleSaveUser} onCancel={() => setCurrentPage('usersList')} initialData={selectedUser || undefined} profiles={profiles} />;
            default:
                return <HomePage 
                    licitacoes={licitacoes} propostas={propostas} pedidos={pedidos} unidadesAdministrativas={unidadesAdministrativas}
                    onNavigateToEditEdital={handleNavigateToEditEdital}
                    onNavigateToEditProposta={handleNavigateToEditProposta}
                    onNavigateToEditPedido={handleNavigateToEditPedido}
                    onNavigateToAddEdital={handleNavigateToAddEdital}
                    onNavigateToAddProposta={() => setSelectParentModalConfig({ isOpen: true, type: 'proposta' })}
                    onNavigateToAddPedido={() => setSelectParentModalConfig({ isOpen: true, type: 'pedido' })}
                 />;
        }
    };
    
    return (
        <div className="flex flex-col h-screen">
            <Header 
                logomarcaUrl={logomarcaUrl}
                currentUser={currentUser}
                onCancelForm={handleCancelForm}
                onSearch={(e: React.FormEvent) => { e.preventDefault(); setCurrentPage('searchResults'); }}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onNavigateToLicitacoes={() => setCurrentPage('licitacoesList')}
                onNavigateToPropostas={() => setCurrentPage('propostasList')}
                onNavigateToPedidos={() => setCurrentPage('pedidosList')}
                onNavigateToProducts={() => setCurrentPage('productsList')}
                onNavigateToSettings={() => setCurrentPage('settings')}
                onNavigateToEmpresas={() => setCurrentPage('empresasList')}
                onNavigateToUnidades={() => setCurrentPage('unidadesAdministrativasList')}
                onNavigateToPainel={() => setCurrentPage('painel')}
                onNavigateToUsers={() => setCurrentPage('usersList')}
                onLogout={handleLogout}
                hasPermission={hasPermission}
            />
            <main className="flex-grow pt-16 overflow-y-auto bg-gray-50">
                {renderPage()}
            </main>
            <AlertModal 
                isOpen={alertModalConfig.isOpen}
                onClose={() => setAlertModalConfig({ isOpen: false, message: '' })}
                message={alertModalConfig.message}
            />
            <SelectParentModal
                isOpen={selectParentModalConfig.isOpen}
                onClose={() => setSelectParentModalConfig({ isOpen: false, type: 'proposta' })}
                onSelect={(id) => {
                    if (selectParentModalConfig.type === 'proposta') {
                        setSelectedLicitacaoId(id);
                        setSelectedPropostaId(null);
                        setCurrentPage('proposta');
                    } else { // pedido
                        setSelectedPropostaId(id);
                        setSelectedPedidoId(null);
                        setCurrentPage('pedido');
                    }
                    setSelectParentModalConfig({ isOpen: false, type: 'proposta' });
                }}
                title={selectParentModalConfig.type === 'proposta' ? "Selecione a Licitação para a Proposta" : "Selecione a Proposta para o Pedido"}
                items={selectParentModalConfig.type === 'proposta' 
                    ? licitacoes.map(l => ({ id: l.licitacao_unique, name: l.licitacao_objeto, subtext: `Nº ${l.licitacao_numero}` }))
                    : propostas.map(p => {
                        const l = licitacoes.find(l => l.licitacao_unique === p.licitacao_unique_id);
                        return { id: p.proposta_unique_id, name: `Proposta para: ${l?.licitacao_objeto || 'Licitação desconhecida'}`, subtext: `Status: ${p.proposta_status}` };
                    })
                }
                itemType={selectParentModalConfig.type}
                actionButton={selectParentModalConfig.type === 'proposta' ? {
                    label: "Criar Orçamento (sem licitação)",
                    onClick: () => {
                        setSelectedLicitacaoId(null);
                        setSelectedPropostaId(null);
                        setCurrentPage('proposta');
                        setSelectParentModalConfig({ isOpen: false, type: 'proposta' });
                    }
                } : undefined}
            />
        </div>
    );
};

export default App;
