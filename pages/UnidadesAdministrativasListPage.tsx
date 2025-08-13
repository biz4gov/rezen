import React from 'react';
import type { UnidadeAdministrativaData } from '../types';
import { PlusCircle, Trash2, Landmark, Image as ImageIcon } from 'lucide-react';

interface UnidadesAdministrativasListPageProps {
  unidades: UnidadeAdministrativaData[];
  onAddUnidade: () => void;
  onEditUnidade: (id: string) => void;
  onDeleteUnidade: (id: string) => void;
}

const UnidadeCard: React.FC<{ unidade: UnidadeAdministrativaData; onEdit: () => void; onDelete: () => void; }> = ({ unidade, onEdit, onDelete }) => {
    
    const stopPropagationAndCall = (func: () => void) => (e: React.MouseEvent) => {
        e.stopPropagation();
        func();
    };

    return (
      <div onClick={onEdit} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group transition-all hover:shadow-md hover:border-blue-500 cursor-pointer">
        <div className="p-4 flex items-start space-x-4">
          <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 flex items-center justify-center">
            {unidade.logomarca && 'base64' in unidade.logomarca ? (
              <img src={unidade.logomarca.base64} alt={unidade.nome_completo} className="w-full h-full object-contain" />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div className="flex-grow overflow-hidden">
            <h3 className="font-bold text-gray-800 text-md truncate group-hover:text-blue-700" title={unidade.nome_completo}>{unidade.nome_completo}</h3>
            <p className="text-sm text-gray-500 mt-1 truncate" title={unidade.cpf_cnpj}>CPF/CNPJ: {unidade.cpf_cnpj || 'N/A'}</p>
            <p className="text-sm text-gray-500 mt-1 truncate" title={unidade.uasg}>UASG: {unidade.uasg || 'N/A'}</p>
            <div className="flex items-center space-x-2 mt-3">
               <button onClick={stopPropagationAndCall(onDelete)} className="p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors" title="Excluir unidade">
                  <Trash2 size={16} />
               </button>
            </div>
          </div>
        </div>
      </div>
    );
};

const UnidadesAdministrativasListPage: React.FC<UnidadesAdministrativasListPageProps> = ({ unidades, onAddUnidade, onEditUnidade, onDeleteUnidade }) => {
  return (
    <div className="h-full w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Unidades Administrativas</h1>
          <button
            onClick={onAddUnidade}
            className="inline-flex items-center bg-blue-800 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <PlusCircle size={20} className="mr-2" />
            Adicionar Unidade
          </button>
        </div>
        
        {unidades.length > 0 ? (
            <div className="flex-grow overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unidades.map(unidade => (
                    <UnidadeCard
                        key={unidade.unidade_unique_id}
                        unidade={unidade}
                        onEdit={() => onEditUnidade(unidade.unidade_unique_id)}
                        onDelete={() => onDeleteUnidade(unidade.unidade_unique_id)}
                    />
                    ))}
                </div>
            </div>
        ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300 rounded-lg">
                <Landmark className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-800">Nenhuma unidade cadastrada</h3>
                <p className="mt-1 text-sm text-gray-500">Comece adicionando a primeira unidade administrativa.</p>
                <button
                    onClick={onAddUnidade}
                    className="mt-6 inline-flex items-center bg-blue-800 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                    <PlusCircle size={20} className="mr-2" />
                    Adicionar Unidade
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default UnidadesAdministrativasListPage;
