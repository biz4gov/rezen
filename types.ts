

export type PropostaStatus = 'Proposta' | 'Reserva' | 'Julgamento' | 'Homologada' | 'Contrato' | 'Adesão' | 'Orçamento' | 'Ata de Registro de Preços';
export type PedidoStatus = 'Empenho' | 'Faturado' | 'Entregue' | 'Garantia';

export interface ConstantItem {
  value: string;
  label?: string;
  observation: string;
}

export interface LicitacaoItem {
  item_licitacao: string;
  item_descricao: string;
  item_quantidade: string;
  item_unitario: number;
  item_meepp: boolean;
}

export interface LicitacaoData {
  unidade_administrativa_id: string; // Foreign Key to UnidadeAdministrativaData
  licitacao_unique: string;
  licitacao_numero: string;
  licitacao_data_sessao: string;
  licitacao_objeto: string;
  licitacao_modalidade: string;
  licitacao_portal: string;
  licitacao_processo: string;
  licitacao_SRP: boolean;
  licitacao_SRPvalidade: string;
  licitacao_SRPadesao: boolean;
  licitacao_prazoimpugnacao: string;
  licitacao_legislacao: string[];
  licitacao_criterio: string;
  licitacao_modo: string;
  licitacao_validadeproposta: string;
  licitacao_garantiacontrato: string;
  licitacao_garantiaproduto: string;
  licitacao_prazoentrega: string;
  licitacao_localentrega: string;
  licitacao_cidadeentrega: string;
  licitacao_estadoentrega: string;
  licitacao_CEPentrega: string;
  licitacao_orientacoesentrega: string;
  licitacao_arquivo: File | StoredFile | null;
  itens_licitacao: LicitacaoItem[];
  licitacao_resumo_ia?: string;
}

export interface ProductImage {
  name: string;
  base64: string;
}

export interface ProductData {
  produto_unique: string;
  produto_nome: string;
  produto_descricao: string;
  produto_imagens: ProductImage[];
  produto_codigo: string; // EAN, NCM or other
  produto_referencia: number;
  produto_minimo: number;
  produto_folheto_pdf?: {
      name: string;
      base64: string;
  } | null;
}

export interface PropostaItem {
  // Links to the original item from the edict
  item_licitacao: string;

  // Now links to a product unique ID
  produto_fornecedor: string;
  valor_referencia: number;
  valor_minimo: number;

  // Fields for post-bidding analysis
  vencedor: boolean;
  valor_lance_vencedor: number;
  motivo_razao: string;
  item_adesao?: boolean;
  quantidade_adesao?: string;
}

export interface PropostaData {
  proposta_unique_id: string;
  licitacao_unique_id: string; // Foreign key to LicitacaoData
  empresa_unique_id: string; // Foreign key to EmpresaData
  data_criacao: string; // ISO string for sorting/display
  proposta_status: PropostaStatus;
  data_homologacao?: string; // Date when status became 'Homologada', in ISO format
  data_assinatura?: string; // Date when becomes 'Contrato' or 'Ata de Registro de Preços'
  itens_proposta: PropostaItem[];
  is_adesao?: boolean;
  orgao_adesao_id?: string; // Foreign key to UnidadeAdministrativaData
}

export interface ItemEmpenhado {
  produto_unique_id?: string; // Foreign key to ProductData
  item_empenho: string;
  item_compra: string;
  item_descricao: string;
  item_quantidade: string;
  item_unitario: number;
  item_total: number;
}

export interface StoredFile {
  name: string;
  base64: string;
}

export interface ItemFaturado {
  produto_unique_id?: string; // Foreign key to ProductData
  item_codigo: string;
  item_descricao: string;
  item_quantidade: string;
  item_unitario: number;
  item_total: number;
}

export interface NotaFiscalData {
  id: string; // To use as a key for React rendering
  nf_numero?: string;
  nf_chave?: string;
  nf_emissao?: string;
  nf_saida?: string;
  nf_transp_nome?: string;
  nf_transp_cnpj?: string;
  nf_arquivo?: File | StoredFile | null;
  itens_faturados?: ItemFaturado[];
}

export interface PedidoData {
  pedido_unique_id: string;
  licitacao_unique_id: string; // FK to LicitacaoData
  proposta_unique_id: string; // FK to PropostaData
  empresa_unique_id: string; // FK to EmpresaData
  unidade_administrativa_id: string; // FK to UnidadeAdministrativaData
  data_criacao: string;
  pedido_status: PedidoStatus;

  empenho_numero: string;
  empenho_data: string;

  itens_empenhados: ItemEmpenhado[];
  
  empenho_arquivo: File | StoredFile | null;

  // Replaced single NF fields with an array of fiscal notes
  notas_fiscais?: NotaFiscalData[];
  data_limite_entrega?: string;
}

export interface WhatsappConfig {
  endpoint: string;
  key: string;
  chatId: string;
  session: string;
}

export interface EmailEntry {
  id: string;
  email: string;
  isPrimary: boolean;
}

export interface PhoneEntry {
  id: string;
  phone: string;
  isPrimary: boolean;
  isWhatsapp: boolean;
}

export interface StoredImage {
  name: string;
  base64: string;
}

export interface EmpresaData {
  empresa_unique_id: string;
  nome_completo: string;
  cpf_cnpj: string;
  emails: EmailEntry[];
  telefones: PhoneEntry[];
  endereco_cep: string;
  endereco_rua: string;
  endereco_numero: string;
  endereco_complemento: string;
  endereco_bairro: string;
  endereco_cidade: string;
  endereco_estado: string;
  logomarca: File | StoredImage | null;
  marca_dagua: File | StoredImage | null;
  cartao_cnpj_pdf?: File | StoredFile | null;
}

export interface UnidadeAdministrativaData {
  unidade_unique_id: string;
  nome_completo: string;
  cpf_cnpj: string;
  uasg?: string;
  emails: EmailEntry[];
  telefones: PhoneEntry[];
  endereco_cep: string;
  endereco_rua: string;
  endereco_numero: string;
  endereco_complemento: string;
  endereco_bairro: string;
  endereco_cidade: string;
  endereco_estado: string;
  logomarca: File | StoredImage | null;
}

export interface BrandingConfig {
  logomarca: File | StoredImage | null;
  icone: File | StoredImage | null;
  marca: File | StoredImage | null;
}

export interface ConstantConfig {
  key: string;
  title: string;
  defaultValues: ConstantItem[];
}

// --- Auth & RBAC Types ---
export type Permission =
  | 'users:manage'
  | 'profiles:manage'
  | 'settings:view'
  | 'licitacoes:create'
  | 'licitacoes:edit'
  | 'licitacoes:delete'
  | 'propostas:create'
  | 'propostas:edit'
  | 'propostas:delete'
  | 'pedidos:create'
  | 'pedidos:edit'
  | 'pedidos:delete'
  | 'products:create'
  | 'products:edit'
  | 'products:delete'
  | 'empresas:manage'
  | 'unidades:manage'
  | 'painel:view';

export interface ProfileData {
  profile_unique_id: string;
  name: string;
  permissions: Permission[];
}

export interface UserData {
  user_unique_id: string;
  email: string;
  password?: string; // Stored as plain text for this simulation
  profile_id: string;
}

export interface UserWithProfile extends UserData {
    profile: ProfileData;
}