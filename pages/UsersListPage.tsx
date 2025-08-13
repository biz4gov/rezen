import React from 'react';
import type { UserData, ProfileData } from '../types';
import { PlusCircle, Trash2, Users } from 'lucide-react';

interface UsersListPageProps {
  users: UserData[];
  profiles: ProfileData[];
  onAddUser: () => void;
  onEditUser: (id: string) => void;
  onDeleteUser: (id: string) => void;
}

const UserCard: React.FC<{ user: UserData; profileName: string; onEdit: () => void; onDelete: () => void; }> = ({ user, profileName, onEdit, onDelete }) => {
    
    const stopPropagationAndCall = (func: () => void) => (e: React.MouseEvent) => {
        e.stopPropagation();
        func();
    };
    
    return (
      <div onClick={onEdit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex justify-between items-center group transition-all hover:shadow-md hover:border-blue-500 cursor-pointer">
        <div className="overflow-hidden">
          <h3 className="font-bold text-gray-800 text-md truncate group-hover:text-blue-700" title={user.email}>{user.email}</h3>
          <p className="text-sm text-gray-500 mt-1">Perfil: {profileName}</p>
        </div>
        <div className="flex items-center space-x-2">
            <button onClick={stopPropagationAndCall(onDelete)} className="p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors" title="Excluir usuário">
                <Trash2 size={16} />
            </button>
        </div>
      </div>
    );
};

const UsersListPage: React.FC<UsersListPageProps> = ({ users, profiles, onAddUser, onEditUser, onDeleteUser }) => {
  const getProfileName = (profileId: string) => {
    return profiles.find(p => p.profile_unique_id === profileId)?.name || 'Perfil desconhecido';
  };

  return (
    <div className="h-full w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Usuários</h1>
          <button
            onClick={onAddUser}
            className="inline-flex items-center bg-blue-800 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <PlusCircle size={20} className="mr-2" />
            Adicionar Usuário
          </button>
        </div>
        
        {users.length > 0 ? (
            <div className="flex-grow overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map(user => (
                    <UserCard
                        key={user.user_unique_id}
                        user={user}
                        profileName={getProfileName(user.profile_id)}
                        onEdit={() => onEditUser(user.user_unique_id)}
                        onDelete={() => onDeleteUser(user.user_unique_id)}
                    />
                    ))}
                </div>
            </div>
        ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300 rounded-lg">
                <Users className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-800">Nenhum usuário cadastrado</h3>
                <p className="mt-1 text-sm text-gray-500">Comece adicionando o primeiro usuário.</p>
                <button
                    onClick={onAddUser}
                    className="mt-6 inline-flex items-center bg-blue-800 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                    <PlusCircle size={20} className="mr-2" />
                    Adicionar Usuário
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default UsersListPage;
