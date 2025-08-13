import React, { useState, useCallback, useEffect } from 'react';
import type { UserData, ProfileData } from '../types';
import FormField from '../components/FormField';
import { Save, ArrowLeft, Loader2, Check } from 'lucide-react';

interface UserPageProps {
  onSave: (data: UserData) => Promise<void>;
  onCancel: () => void;
  initialData?: UserData;
  profiles: ProfileData[];
}

const UserPage: React.FC<UserPageProps> = ({ onSave, onCancel, initialData, profiles }) => {
    const getInitialState = useCallback((): Omit<UserData, 'user_unique_id'> => {
        return {
            email: '',
            password: '',
            profile_id: profiles[0]?.profile_unique_id || ''
        };
    }, [profiles]);

    const [user, setUser] = useState<Omit<UserData, 'user_unique_id'>>(getInitialState());
    const [isSaving, setIsSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (initialData) {
            setUser({
                email: initialData.email,
                password: '', // Don't show existing password
                profile_id: initialData.profile_id
            });
        } else {
            setUser(getInitialState());
        }
    }, [initialData, getInitialState]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    }, []);
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        setIsSuccess(false);

        const dataToSave: UserData = {
            user_unique_id: initialData?.user_unique_id || `user_${Date.now()}`,
            email: user.email,
            profile_id: user.profile_id,
        };

        // Only include password if it has been changed
        if (user.password) {
            dataToSave.password = user.password;
        } else if (initialData?.password && !user.password) {
             dataToSave.password = initialData.password;
        }

        try {
            await onSave(dataToSave);
            setIsSuccess(true);
        } catch (error) {
             console.error("Falha ao salvar usuário:", error);
             setIsSaving(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex-shrink-0 bg-white p-4 z-10 shadow-sm border-b">
                    <div className="container mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button type="button" onClick={onCancel} className="p-2 rounded-full hover:bg-gray-200"><ArrowLeft size={20} /></button>
                             <h1 className="text-2xl font-bold text-gray-800">{initialData ? 'Editar Usuário' : 'Novo Usuário'}</h1>
                        </div>
                        <button type="submit" disabled={isSaving || isSuccess || !user.email} className={`inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors ${isSuccess ? 'bg-green-600' : 'bg-blue-800 hover:bg-blue-900'} disabled:bg-gray-400 disabled:cursor-not-allowed`}>
                            {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (isSuccess ? <Check className="mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />)}
                            {isSaving ? 'Salvando...' : (isSuccess ? 'Salvo!' : 'Salvar')}
                        </button>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto">
                    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                         <div className="max-w-2xl mx-auto space-y-8">
                           <div className="bg-white p-6 rounded-lg shadow-sm border">
                               <div className="grid grid-cols-1 gap-6">
                                    <FormField label="E-mail" name="email" type="email" value={user.email} onChange={handleChange} required />
                                    <FormField 
                                        label="Senha" 
                                        name="password" 
                                        type="password" 
                                        value={user.password || ''} 
                                        onChange={handleChange} 
                                        required={!initialData} 
                                     />
                                     {initialData && <p className="text-xs text-gray-500 -mt-4">Deixe em branco para não alterar a senha.</p>}
                                     <FormField 
                                        label="Perfil de Acesso"
                                        name="profile_id"
                                        type="select"
                                        options={profiles.map(p => ({ value: p.profile_unique_id, label: p.name, observation: p.permissions.join(', ') }))}
                                        value={user.profile_id}
                                        onChange={handleChange}
                                        required
                                     />
                               </div>
                           </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default UserPage;
