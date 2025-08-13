

import type { LicitacaoData, PropostaData, ProductData, PedidoData, StoredFile, ConstantItem, WhatsappConfig, EmpresaData, StoredImage, UnidadeAdministrativaData, BrandingConfig, ProfileData, UserData, UserWithProfile } from '../types';
import * as C from '../constants';
import { masks } from '../components/MaskedInput';

// Helper to simulate async behavior of a real API call
const simulateAsync = <T>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), 50));
};

// --- Generic Constant/Prompt Helpers ---
export const getConstant = async <T>(key: string, defaultValue: T): Promise<T> => {
    try {
        const saved = localStorage.getItem(key);
        // Ensure that if saved is null, we return the defaultValue
        return simulateAsync(saved ? JSON.parse(saved) : defaultValue);
    } catch (error) {
        console.error(`Failed to parse constant from localStorage with key "${key}"`, error);
        return simulateAsync(defaultValue);
    }
};

export const saveConstant = async <T>(key: string, value: T): Promise<void> => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        await simulateAsync(undefined as any);
    } catch (error) {
        console.error(`Failed to save constant to localStorage with key "${key}"`, error);
    }
};

// --- Configurable Constants API ---
export const getModalidades = () => getConstant<ConstantItem[]>(C.MODALIDADES_KEY, C.DEFAULT_MODALIDADES);
export const saveModalidades = (values: ConstantItem[]) => saveConstant(C.MODALIDADES_KEY, values);
export const getLegislacoes = () => getConstant<ConstantItem[]>(C.LEGISLACOES_KEY, C.DEFAULT_LEGISLACOES);
export const saveLegislacoes = (values: ConstantItem[]) => saveConstant(C.LEGISLACOES_KEY, values);
export const getCriterios = () => getConstant<ConstantItem[]>(C.CRITERIOS_KEY, C.DEFAULT_CRITERIOS);
export const saveCriterios = (values: ConstantItem[]) => saveConstant(C.CRITERIOS_KEY, values);
export const getModosDisputa = () => getConstant<ConstantItem[]>(C.MODOS_DISPUTA_KEY, C.DEFAULT_MODOS_DISPUTA);
export const saveModosDisputa = (values: ConstantItem[]) => saveConstant(C.MODOS_DISPUTA_KEY, values);
export const getPropostaStatus = () => getConstant<ConstantItem[]>(C.PROPOSTA_STATUS_KEY, C.DEFAULT_PROPOSTA_STATUS);
export const savePropostaStatus = (values: ConstantItem[]) => saveConstant(C.PROPOSTA_STATUS_KEY, values);
export const getPedidoStatus = () => getConstant<ConstantItem[]>(C.PEDIDO_STATUS_KEY, C.DEFAULT_PEDIDO_STATUS);
export const savePedidoStatus = (values: ConstantItem[]) => saveConstant(C.PEDIDO_STATUS_KEY, values);

// --- Configurable Prompts API ---
export const getGeminiPromptEdital = () => getConstant(C.GEMINI_PROMPT_EDITAL_KEY, C.DEFAULT_GEMINI_SYSTEM_PROMPT);
export const saveGeminiPromptEdital = (value: string) => saveConstant(C.GEMINI_PROMPT_EDITAL_KEY, value);
export const getGeminiPromptResumo = () => getConstant(C.GEMINI_PROMPT_RESUMO_KEY, C.DEFAULT_GEMINI_RESUMO_PROMPT);
export const saveGeminiPromptResumo = (value: string) => saveConstant(C.GEMINI_PROMPT_RESUMO_KEY, value);
export const getGeminiPromptPedido = () => getConstant(C.GEMINI_PROMPT_PEDIDO_KEY, C.DEFAULT_GEMINI_PEDIDO_SYSTEM_PROMPT);
export const saveGeminiPromptPedido = (value: string) => saveConstant(C.GEMINI_PROMPT_PEDIDO_KEY, value);
export const getGeminiPromptNf = () => getConstant(C.GEMINI_PROMPT_NF_KEY, C.DEFAULT_GEMINI_NF_SYSTEM_PROMPT);
export const saveGeminiPromptNf = (value: string) => saveConstant(C.GEMINI_PROMPT_NF_KEY, value);
export const getGeminiPromptEmpresa = () => getConstant(C.GEMINI_PROMPT_EMPRESA_KEY, C.DEFAULT_GEMINI_EMPRESA_PROMPT);
export const saveGeminiPromptEmpresa = (value: string) => saveConstant(C.GEMINI_PROMPT_EMPRESA_KEY, value);


// --- WhatsApp Config API ---
export const getWhatsappConfig = () => getConstant<WhatsappConfig>(C.WHATSAPP_CONFIG_KEY, C.DEFAULT_WHATSAPP_CONFIG);
export const saveWhatsappConfig = (config: WhatsappConfig) => saveConstant(C.WHATSAPP_CONFIG_KEY, config);


// Helper to convert a File to a serializable StoredFile object
export const fileToStoredFile = async (file: File): Promise<StoredFile> => {
    const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        // Get just the base64 part by splitting out the data URI prefix
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
    return { name: file.name, base64 };
};

export const fileToStoredImage = async (file: File): Promise<StoredImage> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            if (!event.target?.result) {
                return reject(new Error("FileReader did not return a result."));
            }
            const img = new Image();
            img.src = event.target.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context'));
                }
                ctx.drawImage(img, 0, 0, width, height);
                // Use a reasonable quality for JPEG to save space
                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                resolve({ name: file.name, base64: dataUrl });
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

// --- Licitacoes API ---

export const getLicitacoes = async (): Promise<LicitacaoData[]> => {
    try {
        const saved = localStorage.getItem(C.LICITACOES_KEY);
        const licitacoes = saved ? JSON.parse(saved) : [];
        return simulateAsync(licitacoes);
    } catch (error) {
        console.error("Failed to parse licitacoes from localStorage", error);
        return simulateAsync([]);
    }
};

export const saveLicitacoes = async (licitacoes: LicitacaoData[]): Promise<void> => {
    try {
        // Convert any File objects to a serializable format, handling large files.
        const serializableLicitacoes = await Promise.all(licitacoes.map(async (l) => {
            const { licitacao_arquivo, ...rest } = l;
            
            const serializableLicitacao: Partial<LicitacaoData> & { [key: string]: any } = { ...rest };

            if (licitacao_arquivo instanceof File) {
                 // For PDFs, do not store base64 to prevent quota errors. Store name only.
                serializableLicitacao.licitacao_arquivo = { name: licitacao_arquivo.name, base64: '' };
            } else {
                serializableLicitacao.licitacao_arquivo = licitacao_arquivo;
            }

            return serializableLicitacao as LicitacaoData;
        }));
        
        localStorage.setItem(C.LICITACOES_KEY, JSON.stringify(serializableLicitacoes));
        await simulateAsync(undefined as any);
    } catch (error) {
        console.error("Failed to save licitacoes to localStorage", error);
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
             alert('Erro: O armazenamento do navegador está cheio. Não foi possível salvar as licitações.');
        }
    }
};

// --- Propostas API ---

export const getPropostas = async (): Promise<PropostaData[]> => {
    try {
        const saved = localStorage.getItem(C.PROPOSTAS_KEY);
        const propostas = saved ? JSON.parse(saved) : [];
        return simulateAsync(propostas);
    } catch (error) {
        console.error("Failed to parse propostas from localStorage", error);
        return simulateAsync([]);
    }
};

export const savePropostas = async (propostas: PropostaData[]): Promise<void> => {
    try {
        localStorage.setItem(C.PROPOSTAS_KEY, JSON.stringify(propostas));
        await simulateAsync(undefined as any);
    } catch (error) {
        console.error("Failed to save propostas to localStorage", error);
    }
};

// --- Products API ---

export const getProducts = (): Promise<ProductData[]> => {
    return getConstant<ProductData[]>(C.PRODUCTS_KEY, C.DEFAULT_PRODUCTS);
};

export const saveProducts = async (products: ProductData[]): Promise<void> => {
    try {
        localStorage.setItem(C.PRODUCTS_KEY, JSON.stringify(products));
        await simulateAsync(undefined as any);
    } catch (error) {
        console.error("Failed to save products to localStorage", error);
    }
};

// --- Pedidos API ---

export const getPedidos = async (): Promise<PedidoData[]> => {
    try {
        const saved = localStorage.getItem(C.PEDIDOS_KEY);
        // Data loaded from localStorage will have StoredFile objects, not File objects.
        const pedidos = saved ? JSON.parse(saved) : [];
        return simulateAsync(pedidos);
    } catch (error) {
        console.error("Failed to parse pedidos from localStorage", error);
        return simulateAsync([]);
    }
};

export const savePedidos = async (pedidos: PedidoData[]): Promise<void> => {
    try {
        const serializablePedidos = await Promise.all(pedidos.map(async (p) => {
            const { empenho_arquivo, notas_fiscais, ...rest } = p;
            
            const serializablePedido: Partial<PedidoData> & { [key: string]: any } = { ...rest };

            if (empenho_arquivo instanceof File) {
                serializablePedido.empenho_arquivo = { name: empenho_arquivo.name, base64: '' };
            } else {
                serializablePedido.empenho_arquivo = empenho_arquivo;
            }

            if (notas_fiscais) {
                serializablePedido.notas_fiscais = await Promise.all(
                    notas_fiscais.map(async (nf) => {
                        if (nf.nf_arquivo instanceof File) {
                            return { ...nf, nf_arquivo: { name: nf.nf_arquivo.name, base64: '' } };
                        }
                        return nf;
                    })
                );
            } else {
                 serializablePedido.notas_fiscais = [];
            }

            return serializablePedido as PedidoData;
        }));
        
        localStorage.setItem(C.PEDIDOS_KEY, JSON.stringify(serializablePedidos));
        await simulateAsync(undefined as any);
    } catch (error) {
        console.error("Failed to save pedidos to localStorage", error);
         if (error instanceof DOMException && error.name === 'QuotaExceededError') {
             alert('Erro: O armazenamento do navegador está cheio. Não foi possível salvar os pedidos.');
        }
    }
};

// --- Empresas API ---
export const getEmpresas = async (): Promise<EmpresaData[]> => {
    try {
        const saved = localStorage.getItem(C.EMPRESAS_KEY);
        const empresas: EmpresaData[] = saved ? JSON.parse(saved) : [];
        const formattedEmpresas = empresas.map(e => ({
            ...e,
            telefones: e.telefones.map(t => ({ ...t, phone: masks.phone(t.phone) }))
        }));
        return simulateAsync(formattedEmpresas);
    } catch (error) {
        console.error("Failed to parse empresas from localStorage", error);
        return simulateAsync([]);
    }
};

export const saveEmpresas = async (empresas: EmpresaData[]): Promise<void> => {
    try {
        const serializableEmpresas = await Promise.all(
            empresas.map(async (e) => {
                const { logomarca, marca_dagua, cartao_cnpj_pdf, telefones, ...rest } = e;
                const serializableEmpresa: Partial<EmpresaData> & { [key: string]: any } = { ...rest };

                serializableEmpresa.telefones = telefones.map(t => ({ ...t, phone: t.phone.replace(/\D/g, '') }));

                if (logomarca instanceof File) {
                    serializableEmpresa.logomarca = await fileToStoredImage(logomarca);
                } else {
                    serializableEmpresa.logomarca = logomarca;
                }

                if (marca_dagua instanceof File) {
                    serializableEmpresa.marca_dagua = await fileToStoredImage(marca_dagua);
                } else {
                    serializableEmpresa.marca_dagua = marca_dagua;
                }
                
                if (cartao_cnpj_pdf instanceof File) {
                    serializableEmpresa.cartao_cnpj_pdf = { name: cartao_cnpj_pdf.name, base64: '' };
                } else {
                    serializableEmpresa.cartao_cnpj_pdf = cartao_cnpj_pdf;
                }

                return serializableEmpresa as EmpresaData;
            })
        );

        localStorage.setItem(C.EMPRESAS_KEY, JSON.stringify(serializableEmpresas));
        await simulateAsync(undefined as any);
    } catch (error) {
        console.error("Failed to save empresas to localStorage", error);
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
             alert('Erro: O armazenamento do navegador está cheio. Não foi possível salvar os dados da empresa.');
        }
    }
};

// --- Unidades Administrativas API ---
export const getUnidadesAdministrativas = async (): Promise<UnidadeAdministrativaData[]> => {
    try {
        const saved = localStorage.getItem(C.UNIDADES_ADMINISTRATIVAS_KEY);
        const unidades: UnidadeAdministrativaData[] = saved ? JSON.parse(saved) : [];
        const formattedUnidades = unidades.map(u => ({
            ...u,
            telefones: u.telefones.map(t => ({...t, phone: masks.phone(t.phone)}))
        }));
        return simulateAsync(formattedUnidades);
    } catch (error) {
        console.error("Failed to parse unidades administrativas from localStorage", error);
        return simulateAsync([]);
    }
};

export const saveUnidadesAdministrativas = async (unidades: UnidadeAdministrativaData[]): Promise<void> => {
    try {
        const serializableUnidades = await Promise.all(
            unidades.map(async (u) => {
                const { logomarca, telefones, ...rest } = u;
                const serializableUnidade: Partial<UnidadeAdministrativaData> & { [key: string]: any } = { ...rest };
                
                serializableUnidade.telefones = telefones.map(t => ({...t, phone: t.phone.replace(/\D/g, '')}));

                if (logomarca instanceof File) {
                    serializableUnidade.logomarca = await fileToStoredImage(logomarca);
                } else {
                    serializableUnidade.logomarca = logomarca;
                }
                
                return serializableUnidade as UnidadeAdministrativaData;
            })
        );

        localStorage.setItem(C.UNIDADES_ADMINISTRATIVAS_KEY, JSON.stringify(serializableUnidades));
        await simulateAsync(undefined as any);
    } catch (error) {
        console.error("Failed to save unidades administrativas to localStorage", error);
    }
};

// --- Branding Config API ---
export const getBrandingConfig = () => getConstant<BrandingConfig>(C.BRANDING_CONFIG_KEY, C.DEFAULT_BRANDING_CONFIG);

export const saveBrandingConfig = async (config: BrandingConfig): Promise<void> => {
    try {
        const { logomarca, icone, marca } = config;
        const serializableConfig: BrandingConfig = { logomarca: null, icone: null, marca: null };

        if (logomarca instanceof File) {
            serializableConfig.logomarca = await fileToStoredImage(logomarca);
        } else {
            serializableConfig.logomarca = logomarca;
        }

        if (icone instanceof File) {
            serializableConfig.icone = await fileToStoredImage(icone);
        } else {
            serializableConfig.icone = icone;
        }

        if (marca instanceof File) {
            serializableConfig.marca = await fileToStoredImage(marca);
        } else {
            serializableConfig.marca = marca;
        }
        
        await saveConstant(C.BRANDING_CONFIG_KEY, serializableConfig);
    } catch (error) {
        console.error("Failed to save branding config to localStorage", error);
    }
};

// --- Auth & RBAC API ---
export const getProfiles = (): Promise<ProfileData[]> => {
    return getConstant<ProfileData[]>(C.PROFILES_KEY, C.DEFAULT_PROFILES);
};

export const getUsers = (): Promise<UserData[]> => {
    return getConstant<UserData[]>(C.USERS_KEY, [C.DEFAULT_ADMIN_USER]);
};

export const saveUsers = (users: UserData[]): Promise<void> => {
    return saveConstant(C.USERS_KEY, users);
};

export const login = async (email: string, password: string): Promise<UserWithProfile | null> => {
    const users = await getUsers();
    const profiles = await getProfiles();
    
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (user) {
        const profile = profiles.find(p => p.profile_unique_id === user.profile_id);
        if (profile) {
            // In a real app, this would be a JWT. For simulation, store the user's ID.
            localStorage.setItem(C.AUTH_TOKEN_KEY, user.user_unique_id);
            const userWithProfile: UserWithProfile = { ...user, profile };
            return simulateAsync(userWithProfile);
        }
    }
    
    return simulateAsync(null);
};

export const logout = (): void => {
    localStorage.removeItem(C.AUTH_TOKEN_KEY);
};

export const getUserFromToken = async (): Promise<UserWithProfile | null> => {
    const token = localStorage.getItem(C.AUTH_TOKEN_KEY);
    if (!token) {
        return simulateAsync(null);
    }
    
    const users = await getUsers();
    const profiles = await getProfiles();
    
    const user = users.find(u => u.user_unique_id === token);
    if (user) {
        const profile = profiles.find(p => p.profile_unique_id === user.profile_id);
        if (profile) {
            const userWithProfile: UserWithProfile = { ...user, profile };
            return simulateAsync(userWithProfile);
        }
    }

    // If user/profile not found for token, it's invalid.
    logout();
    return simulateAsync(null);
};
