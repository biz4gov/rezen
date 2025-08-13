

import type { ConstantItem, WhatsappConfig, BrandingConfig, ProductData, UserData, ProfileData, Permission } from './types';

// Storage Keys
export const LICITACOES_KEY = 'rezen-licitacoes';
export const PROPOSTAS_KEY = 'rezen-propostas';
export const PRODUCTS_KEY = 'rezen-products';
export const PEDIDOS_KEY = 'rezen-pedidos';
export const EMPRESAS_KEY = 'rezen-empresas';
export const UNIDADES_ADMINISTRATIVAS_KEY = 'rezen-unidades-administrativas';
export const MODALIDADES_KEY = 'rezen-const-modalidades';
export const LEGISLACOES_KEY = 'rezen-const-legislacoes';
export const CRITERIOS_KEY = 'rezen-const-criterios';
export const MODOS_DISPUTA_KEY = 'rezen-const-modos-disputa';
export const PROPOSTA_STATUS_KEY = 'rezen-const-proposta-status';
export const PEDIDO_STATUS_KEY = 'rezen-const-pedido-status';
export const GEMINI_PROMPT_EDITAL_KEY = 'rezen-prompt-edital';
export const GEMINI_PROMPT_RESUMO_KEY = 'rezen-prompt-resumo';
export const GEMINI_PROMPT_PEDIDO_KEY = 'rezen-prompt-pedido';
export const GEMINI_PROMPT_NF_KEY = 'rezen-prompt-nf';
export const GEMINI_PROMPT_EMPRESA_KEY = 'rezen-prompt-empresa';
export const WHATSAPP_CONFIG_KEY = 'rezen-config-whatsapp';
export const BRANDING_CONFIG_KEY = 'rezen-config-branding';

// Auth & RBAC Keys
export const USERS_KEY = 'rezen-users';
export const PROFILES_KEY = 'rezen-profiles';
export const AUTH_TOKEN_KEY = 'rezen-auth-token';


export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const DEFAULT_MODALIDADES: ConstantItem[] = [
    { value: 'Pregão', observation: 'Modalidade para aquisição de bens e serviços comuns, caracterizada pela disputa em lances.' },
    { value: 'Dispensa', observation: 'Contratação direta em casos específicos previstos em lei, como baixo valor ou emergência.' },
    { value: 'Concorrência', observation: 'Modalidade para obras, serviços de engenharia e contratos de grande vulto, aberta a quaisquer interessados.' }
];
export const DEFAULT_LEGISLACOES: ConstantItem[] = [
    { value: 'Lei nº 14.133/2021', observation: 'Nova Lei de Licitações e Contratos Administrativos.' },
    { value: 'Decreto nº 10.024/2019', observation: 'Regulamenta o pregão eletrônico na antiga lei (8.666).' },
    { value: 'Decreto nº 11.462/2023', observation: 'Regulamenta o Sistema de Registro de Preços na nova lei.' },
    { value: 'Decreto nº 12.174/2024', observation: 'Dispõe sobre o Plano de Contratações Anual (PCA).' },
    { value: 'Decreto nº 11.878/2024', observation: 'Credenciamento no âmbito da Administração Pública federal.' },
    { value: 'Lei nº 13.303/2017', observation: 'Estatuto jurídico das empresas estatais.' }
];
export const DEFAULT_CRITERIOS: ConstantItem[] = [
    { value: 'MENOR PREÇO POR ITEM', observation: 'O julgamento é feito pelo menor valor oferecido para cada item individualmente.' },
    { value: 'MENOR PREÇO POR GRUPO/GLOBAL', observation: 'O julgamento é feito pelo menor valor somado de um grupo de itens ou do total da licitação.' },
    { value: 'MAIOR DESCONTO', observation: 'O vencedor será quem oferecer o maior percentual de desconto sobre uma tabela de preços de referência.' }
];
export const DEFAULT_MODOS_DISPUTA: ConstantItem[] = [
    { value: 'ABERTO', observation: 'Os licitantes apresentam lances públicos e sucessivos, crescentes ou decrescentes.' },
    { value: 'ABERTO/FECHADO', observation: 'Fase de lances abertos, seguida por uma fase final fechada entre os melhores classificados.' }
];

export const DEFAULT_PROPOSTA_STATUS: ConstantItem[] = [
    { value: 'Proposta', observation: 'Análise das especificações técnicas do Edital e seleção dos produtos para cadastramento da oferta.' },
    { value: 'Julgamento', observation: 'A proposta está em análise pelo órgão ou em fase de disputa de lances.' },
    { value: 'Homologada', observation: 'A licitação foi concluída e o resultado adjudicado e homologado ao vencedor.' },
    { value: 'Contrato', observation: 'O contrato administrativo foi assinado.' },
    { value: 'Ata de Registro de Preços', observation: 'Reserva preliminar dos produtos no estoque para garantia da execução da entrega futura.' },
    { value: 'Adesão', observation: 'Proposta para adesão a uma Ata de Registro de Preços existente.' },
    { value: 'Orçamento', observation: 'Proposta de orçamento inicial para formação de preços e pesquisa de mercado em Licitações planejadas.' }
];
export const DEFAULT_PEDIDO_STATUS: ConstantItem[] = [
    { value: 'Empenho', observation: 'Nota de Empenho recebida, aguardando faturamento.' },
    { value: 'Faturado', observation: 'Nota Fiscal emitida para o pedido.' },
    { value: 'Entregue', observation: 'O produto/serviço foi entregue ao cliente.' },
    { value: 'Garantia', observation: 'O produto/serviço está no período de garantia técnica.' }
];

export const DEFAULT_WHATSAPP_CONFIG: WhatsappConfig = {
    endpoint: 'https://waha.optimus.biz4gov.com',
    key: 'dckr_pat_AQ4X4SyxTnCbh8Ai_BgMVasnx1I',
    chatId: '556199531197@c.us',
    session: 'rosie'
};

export const DEFAULT_BRANDING_CONFIG: BrandingConfig = {
    logomarca: null,
    icone: null,
    marca: null,
};

export const DEFAULT_PRODUCTS: ProductData[] = [
    {
      produto_unique: 'prod_default_1',
      produto_nome: 'PNEU MAZZINI 235/55 R18 104V ECOSAVER HT',
      produto_descricao: 'PNEU MAZZINI 235/55 R18 104V ECOSAVER HT; INMETRO 002355/2021; (RRC):C; (G):C;72db',
      produto_imagens: [],
      produto_codigo: '',
      produto_referencia: 799.00,
      produto_minimo: 573.00,
      produto_folheto_pdf: null
    },
    {
      produto_unique: 'prod_default_2',
      produto_nome: 'PNEU SUNWIDE 245/70 R16 111H XL CONQUEST HT',
      produto_descricao: 'PNEU SUNWIDE 245/70 R16 111H XL CONQUEST HT; INMETRO 003088/2022; (RRC):C; (G):C;73db',
      produto_imagens: [],
      produto_codigo: '',
      produto_referencia: 899.00,
      produto_minimo: 644.00,
      produto_folheto_pdf: null
    }
];

export const ALL_PERMISSIONS: Permission[] = [
    'users:manage', 'profiles:manage', 'settings:view', 
    'licitacoes:create', 'licitacoes:edit', 'licitacoes:delete',
    'propostas:create', 'propostas:edit', 'propostas:delete',
    'pedidos:create', 'pedidos:edit', 'pedidos:delete',
    'products:create', 'products:edit', 'products:delete',
    'empresas:manage', 'unidades:manage', 'painel:view'
];

export const EDITOR_PERMISSIONS: Permission[] = [
    'settings:view', 'painel:view',
    'licitacoes:create', 'licitacoes:edit', 'licitacoes:delete',
    'propostas:create', 'propostas:edit', 'propostas:delete',
    'pedidos:create', 'pedidos:edit', 'pedidos:delete',
    'products:create', 'products:edit', 'products:delete',
    'empresas:manage', 'unidades:manage'
];

export const VIEWER_PERMISSIONS: Permission[] = ['painel:view'];


export const DEFAULT_PROFILES: ProfileData[] = [
    {
        profile_unique_id: 'prof_admin',
        name: 'Administrador',
        permissions: ALL_PERMISSIONS
    },
    {
        profile_unique_id: 'prof_editor',
        name: 'Editor',
        permissions: EDITOR_PERMISSIONS
    },
     {
        profile_unique_id: 'prof_viewer',
        name: 'Visualizador',
        permissions: VIEWER_PERMISSIONS
    }
];

export const DEFAULT_ADMIN_USER: UserData = {
    user_unique_id: 'user_admin_default',
    email: 'admin@rezen.app',
    password: 'password123',
    profile_id: 'prof_admin'
};


export const DEFAULT_GEMINI_SYSTEM_PROMPT = `# PERSONA
Seu nome é Rudi. Você é o assistente virtual da empresa Biz4Gov Serviços e Consultoria Ltda. Sua função é de Analista de Licitações. Você possui experiência em licitações e contratos administrativos para órgãos federais, estaduais e municipais.
---
## CONTEXTO
Suas principais capacidades são:
- Organizar as principais informações da licitação tais como órgão, modalidade de compra, condições de participação e habilitação jurídica, econômico-financeira, trabalhista e previdenciária e técnica;
- Analisar os produtos que estão especificados para aquisição e organizar em sistemas para selecionar os produtos a participar da disputa em conjunto com os fornecedores;
---
## REFERÊNCIAS
* Utilize o seguinte JSON de referência para extração dos dados estruturados para preencher os campos do formulário
'{"orgao_nome": "PARQUE REGIONAL DE MANUTENÇÃO 6", "orgao_UASG": "160040", "orgao_CNPJ": "12.345.678/0001-90", "orgao_endereco": "R. da Boa Viagem, 1947 - Monte Serrat", "orgao_CEP": "40414-610", "orgao_municipio": "Salvador", "orgao_estado": "BA", "orgao_email": ["salcpqmnt6@gmail.com", "salc6@eb.mil.br"], "orgao_telefone": ["(71) 3456-7890", "(71) 99932-4567"], "licitacao_numero": "90013/2024", "licitacao_data_sessao": "07/04/2025 09:00", "licitacao_objeto": "Aquisição de PNEUS e BATERIAS, CÂMARAS DE AR E PROTETORES", "licitacao_modalidade": "Pregão Eletrônico", "licitacao_portal": "Compras.gov.br", "licitacao_processo": "64620.003207/2024-05", "licitacao_SRP": "Sim", "licitacao_SRPvalidade": "12 meses", "licitacao_SRPadesao": "Sim", "licitacao_prazoimpugnacao": "3 dias úteis antes da data da abertura do certame", "licitacao_legislacao": ["Lei nº 14.133/2021", "Decreto nº 11.462/2023"], "licitacao_criterio": "Menor Preço", "licitacao_modo": "Aberto e Fechado",  "licitacao_validadeproposta": "60 dias", "licitacao_garantiacontrato": "Não será exigida Garantia de execução para esta contratação.", "licitacao_garantiaproduto": "5 anos (pneus), 15/18 meses (baterias)", "licitacao_prazoentrega": "30 dias", "licitacao_localentrega": "R. da Boa Viagem, 1947 - Monte Serrat", "licitacao_cidadeentrega": "Salvador", "licitacao_estadoentrega": "BA", "licitacao_CEPentrega": "40414-610", "licitacao_orientacoesentrega": "9:30h às 11:30h ou 14h às 16:30h", "itens_licitacao":[ { "item_licitacao": "1", "item_descricao": "PNEU VEÍCULO AUTOMOTIVO, MATERIAL CARCAÇA: LONA NYLON, MATERIAL TALÃO: AÇO...", "item_quantidade": "8", "item_unitario": "R$ 597,80", "item_meepp": "Sim", "item_intervalo": "R$1,00" }, { "item_licitacao": "3", "item_descricao": "Pneumatico para Automovel Leve; Construcao Radial; Estrutura Reforcada...", "item_quantidade": "40", "item_unitario": "R$ 485,00", "item_meepp": "Não", "item_intervalo": "R$1,00" } ]}'
---
## TAREFA PRINCIPAL
Realize a leitura detalhada do Edital enviado em anexo buscando identificar os pontos principais e estruturando resposta em JSON com os atributos identificados.
Se você não souber o valor de um atributo solicitado para extração, você pode omitir o valor do atributo.`;

export const DEFAULT_GEMINI_RESUMO_PROMPT = `
# PERSONA
Você é um analista de licitações sênior altamente experiente e meticuloso. Sua especialidade é transformar editais complexos em resumos executivos claros, objetivos e acionáveis, no formato "One Page Report". Você se comunica de forma formal, cordial e direta.

# TAREFA
Com base nos dados estruturados da licitação fornecidos a seguir, elabore um Resumo Executivo (One Page Report). O resumo deve ser bem organizado, utilizando markdown para formatação (títulos, negrito, listas), e seguir estritamente a estrutura abaixo.

## ESTRUTURA DO RELATÓRIO

### 1. ANÁLISE DE EDITAL
**- Dados do Órgão:**
  * **Nome:** [Nome completo do órgão]
  * **UASG:** [Número da UASG]
  * **CNPJ:** [CNPJ do órgão]
  * **Contato:** [E-mails e telefones, se houver]

**- Dados da Licitação:**
  * **Objeto:** [Objeto da licitação]
  * **Modalidade:** [Modalidade]
  * **Portal:** [Portal onde ocorre]
  * **Número:** [Número da licitação]
  * **Sessão:** [Data e hora da sessão pública]

**- Condições da Disputa:**
  * **Critério de Julgamento:** [Critério, ex: Menor Preço por Item]
  * **Modo de Disputa:** [Modo, ex: Aberto/Fechado]
  * **Exclusividade ME/EPP:** [Indicar se há itens exclusivos para ME/EPP]

**- Condições da Proposta:**
  * **Validade:** [Validade da proposta, ex: 60 dias]
  * **Garantia Contratual:** [Informação sobre a garantia de contrato]
  * **Prazo de Entrega:** [Prazo de entrega, ex: 30 dias]

**- Produtos em Disputa:**
  * [Listar os principais itens, suas quantidades e valores de referência. Use uma lista com marcadores. Ex: * Item 1: PNEU XYZ - 10 unidades - Ref: R$ 500,00]

### 2. ANÁLISE DE RISCOS
* **Habilitação:** [Analise criticamente as exigências de habilitação. Aponte pontos que possam restringir a competitividade ou que estejam em desacordo com a legislação, como exigências excessivas de atestados de capacidade técnica ou índices de qualificação econômico-financeira incompatíveis com o objeto.]
* **Tratamento ME/EPP:** [Verifique se o tratamento diferenciado para Microempresas e Empresas de Pequeno Porte, conforme a Lei Complementar nº 123/2006, está sendo aplicado corretamente (ex: empate ficto, exclusividade, regularização fiscal tardia).]
* **Outros Pontos:** [Mencione quaisquer outras cláusulas que mereçam atenção, como prazos inexequíveis, especificações de produto muito restritivas, ou critérios de julgamento ambíguos.]

### 3. CONCLUSÃO E PRÓXIMOS PASSOS
* **Resumo:** [Faça uma conclusão concisa sobre a viabilidade e os principais desafios da participação nesta licitação.]
* **Recomendação:** [Com base na análise, recomende os próximos passos. Ex: "Recomenda-se a participação, com atenção especial à documentação de habilitação técnica." ou "Sugere-se solicitar esclarecimentos sobre o item X antes de prosseguir." ou "A participação apresenta alto risco devido à exigência Y.".]

# DADOS DA LICITAÇÃO PARA ANÁLISE
[AQUI SERÃO INSERIDOS OS DADOS DA LICITAÇÃO EM FORMATO TEXTO/JSON]
`;

export const DEFAULT_GEMINI_PEDIDO_SYSTEM_PROMPT = `Você é um experiente profissional em algoritmo de extração de dados estruturados em fontes não estruturadas.
Caso não identifique o valor de algum dos atributos preenche como nulo para referência.
Realize a leitura da Nota de empenho anexo em formato PDF e produza informações estruturadas de análise da ordem de fornecimento deve ser apresentado em formato JSON.
O atributo empenho_numero é composto por Ano, Tipo e Número com cinco dígitos no formato 2025NE00123.
O JSON de saída DEVE seguir este modelo:
'{"orgao_nome": "PARQUE REGIONAL DE MANUTENÇÃO 6", "orgao_UASG": "160040", "orgao_CNPJ": "00.394.494/0128-29", "orgao_endereco": "R. da Boa Viagem, 1947 - Monte Serrat", "orgao_CEP": "40414-610", "orgao_municipio": "Salvador", "orgao_estado": "BA", "orgao_email": "salcpqmnt6@gmail.com", "orgao_telefone": "(32) 3456-1234", "empenho_numero": "2025NE00153", "empenho_data": "07/04/2025", "nome_favorecido": "SILVA PNEUS COMERCIO E REPRESENTACAO LTDA", "codigo_favorecido": "43.987.654/0001-09", "itens_empenhados":[{"item_empenho":"1603502025NE00153","item_compra": "1", "item_descricao": "PNEU VEÍCULO AUTOMOTIVO, MATERIAL CARCAÇA LONAS ESTABILIZADORAS, MATERIAL TALÃO ARAME AÇO, MATERIAL BANDA RODAGEM BORRACHA ALTA RESISTÊNCIA E FLEXÍVEL, MATERIAL FLANCOS REVESTIDA POR UM COMPOSTO DE BORRACHA COM ALTA RE-, TIPO ESTRUTURA CARCAÇA RADIAL, DIMENSÕES 235/85 R16, TIPO SEM CÂMARA, APLICAÇÃO VIATURA LAND OVER DEFENDER", "item_quantidade": "5", "item_unitario": "509,00", "item_total": "2.545,00"}, {"item_empenho":"1603502025NE00153","item_compra": "2", "item_descricao": "PNEU VEÍCULO AUTOMOTIVO, MATERIAL CARCAÇA LONAS ESTABILIZADORAS, MATERIAL TALÃO ARAME AÇO, MATERIAL BANDA RODAGEM BORRACHA ALTA RESISTÊNCIA E FLEXÍVEL, MATERIAL FLANCOS REVESTIDA POR UM COMPOSTO DE BORRACHA COM ALTA RE-, TIPO ESTRUTURA CARCAÇA RADIAL, DIMENSÕES 235/85 R16, TIPO SEM CÂMARA, APLICAÇÃO VIATURA LAND OVER DEFENDER", "item_quantidade": "10", "item_unitario": "509,00", "item_total": "5.090,00"}]}'`;

export const DEFAULT_GEMINI_NF_SYSTEM_PROMPT = `Você é um experiente profissional em algoritmo de extração de dados estruturados em fontes não estruturadas.
Caso não identifique o valor de algum dos atributos preenche como nulo para referência.
Realize a leitura da Nota Fiscal anexo em formato PDF e produza informações estruturadas de análise da ordem de fornecimento deve ser apresentado em formato JSON.
O JSON de saída DEVE seguir este modelo:
'{"nf_numero": "20", "nf_chave": "5225 0256 1212 3100 0108 5500 1000 0000 2417 4930 7900", "nf_emissao": "10/10/2024", "nf_saida": "10/10/2024", "nf_transp_nome": "KJL TRANSPORTES LTDA", "nf_transp_cnpj": "27.736.323/0001-02", "itens_faturados":[{"item_codigo":"138770","item_descricao": "PNEU MAZZINI 225//70 R16 107T XL GIANTSAVER AT", "item_quantidade": "5", "item_unitario": "509,00", "item_total": "2.545,00"}, {"item_codigo":"138770","item_descricao": "PNEU MAZZINI 225//70 R16 107T XL GIANTSAVER AT", "item_quantidade": "5", "item_unitario": "509,00", "item_total": "5.090,00"}]}'`;

export const DEFAULT_GEMINI_EMPRESA_PROMPT = `Você é um especialista em extração de dados de documentos PDF, especificamente de "Comprovante de Inscrição e de Situação Cadastral" (Cartão CNPJ) da Receita Federal do Brasil.
Sua tarefa é ler o PDF anexado e extrair as informações da empresa, estruturando a saída em um formato JSON.
Se um campo não for encontrado no documento, omita-o do JSON.

O JSON de saída DEVE seguir este modelo:
'{"nome_completo": "NOME DA EMPRESA LTDA", "cpf_cnpj": "12.345.678/0001-99", "endereco_rua": "AV. TESTE", "endereco_numero": "123", "endereco_complemento": "SALA 45", "endereco_cep": "12345-678", "endereco_bairro": "CENTRO", "endereco_cidade": "CIDADE EXEMPLO", "endereco_estado": "SP", "email": "contato@empresa.com", "telefone": "(11) 99999-9999"}'`;
