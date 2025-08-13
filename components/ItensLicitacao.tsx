
import React from 'react';
import type { LicitacaoItem } from '../types';
import FormField from './FormField';
import { Trash2, Plus, Package } from 'lucide-react';

interface ItensLicitacaoProps {
  items: LicitacaoItem[];
  setItems: (items: LicitacaoItem[]) => void;
}

const ItensLicitacao: React.FC<ItensLicitacaoProps> = ({ items, setItems }) => {

  const handleItemChange = (index: number, field: keyof LicitacaoItem, value: string | boolean) => {
    const newItems = [...items];
    const itemToUpdate = { ...newItems[index] };
    
    if (field === 'item_unitario') {
      itemToUpdate.item_unitario = parseFloat(value as string) || 0;
    } else if (field === 'item_meepp') {
      itemToUpdate.item_meepp = value as boolean;
    } else {
      (itemToUpdate as any)[field] = value;
    }

    newItems[index] = itemToUpdate;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, {
      item_licitacao: `${items.length + 1}`,
      item_descricao: '',
      item_quantidade: '',
      item_unitario: 0,
      item_meepp: false,
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            Itens da Licitação
        </h3>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus size={16} className="mr-2" />
          Adicionar Item
        </button>
      </div>
      
      {items.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Nenhum item cadastrado. Adicione um item ou analise um edital.</p>
        </div>
      )}

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
            <button
                type="button"
                onClick={() => removeItem(index)}
                className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-600"
                aria-label="Remover Item"
            >
              <Trash2 size={18} />
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                <div className="sm:col-span-1">
                    <FormField label="Item" name={`item_licitacao-${index}`} value={item.item_licitacao} onChange={(e) => handleItemChange(index, 'item_licitacao', e.target.value)} required />
                </div>
                <div className="sm:col-span-5">
                    <FormField label="Descrição" name={`item_descricao-${index}`} type="textarea" value={item.item_descricao} onChange={(e) => handleItemChange(index, 'item_descricao', e.target.value)} required/>
                </div>
                <div className="sm:col-span-2">
                    <FormField label="Quantidade" name={`item_quantidade-${index}`} type="number" value={item.item_quantidade} onChange={(e) => handleItemChange(index, 'item_quantidade', e.target.value)} required/>
                </div>
                <div className="sm:col-span-2">
                    <FormField label="Valor Unitário" name={`item_unitario-${index}`} type="number" value={item.item_unitario} onChange={(e) => handleItemChange(index, 'item_unitario', e.target.value)} required/>
                </div>
                <div className="sm:col-span-2 flex items-end pb-1">
                    <div className="flex items-center">
                        <input type="checkbox" id={`item_meepp-${index}`} name={`item_meepp-${index}`} checked={item.item_meepp} onChange={(e) => handleItemChange(index, 'item_meepp', e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-blue-800 focus:ring-blue-500"/>
                        <label htmlFor={`item_meepp-${index}`} className="ml-2 block text-sm font-medium text-gray-700">Exclusivo ME/EPP</label>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItensLicitacao;