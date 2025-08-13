import React from 'react';
import type { ItemEmpenhado, ProductData } from '../types';
import { Package, Trash2, PlusCircle } from 'lucide-react';

interface ItensEmpenhadosProps {
  items: ItemEmpenhado[];
  setItems: (items: ItemEmpenhado[]) => void;
  products: ProductData[];
}

const ItensEmpenhados: React.FC<ItensEmpenhadosProps> = ({ items, setItems, products }) => {

  const handleItemChange = (index: number, field: keyof ItemEmpenhado, value: string) => {
    const newItems = [...items];
    const itemToUpdate = { ...newItems[index] };
    
    if (field === 'item_unitario' || field === 'item_total') {
        (itemToUpdate as any)[field] = parseFloat(value) || 0;
    } else {
        (itemToUpdate as any)[field] = value;
    }

    newItems[index] = itemToUpdate;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        item_empenho: '',
        item_compra: '',
        item_descricao: '',
        item_quantidade: '1',
        item_unitario: 0,
        item_total: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (window.confirm('Tem certeza de que deseja excluir este item do empenho?')) {
        setItems(items.filter((_, i) => i !== index));
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            Itens do Empenho
        </h3>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusCircle size={16} className="mr-2" />
          Adicionar Item
        </button>
      </div>
      
      {items.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">Nenhum item encontrado. Analise uma Nota de Empenho ou adicione manually.</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-8 gap-4">
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Item Compra</label>
                    <input type="text" value={item.item_compra} onChange={(e) => handleItemChange(index, 'item_compra', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                </div>
                <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">Item Empenho</label>
                    <input type="text" value={item.item_empenho} onChange={(e) => handleItemChange(index, 'item_empenho', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                </div>
                <div className="sm:col-span-5">
                    <label className="block text-sm font-medium text-gray-700">Descrição</label>
                    <textarea value={item.item_descricao} onChange={(e) => handleItemChange(index, 'item_descricao', e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                </div>
                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Vincular Produto</label>
                     <select
                        value={item.produto_unique_id || ''}
                        onChange={(e) => handleItemChange(index, 'produto_unique_id', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    >
                        <option value="">Nenhum produto vinculado</option>
                        {products.map(p => (
                            <option key={p.produto_unique} value={p.produto_unique}>{p.produto_nome}</option>
                        ))}
                    </select>
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Quantidade</label>
                    <input type="number" value={item.item_quantidade} onChange={(e) => handleItemChange(index, 'item_quantidade', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                </div>
                <div className="sm:col-span-3">
                     <label className="block text-sm font-medium text-gray-700">Valor Unitário</label>
                    <input type="number" step="0.01" value={item.item_unitario} onChange={(e) => handleItemChange(index, 'item_unitario', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                </div>
                <div className="sm:col-span-3">
                     <label className="block text-sm font-medium text-gray-700">Valor Total</label>
                    <input type="number" step="0.01" value={item.item_total} onChange={(e) => handleItemChange(index, 'item_total', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItensEmpenhados;