
import React, { useState } from 'react';
import { X, Search } from 'lucide-react';

interface SelectParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  title: string;
  items: { id: string; name: string; subtext?: string }[];
  itemType: string;
  actionButton?: { label: string; onClick: () => void; };
}

const SelectParentModal: React.FC<SelectParentModalProps> = ({ isOpen, onClose, onSelect, title, items, itemType, actionButton }) => {
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.subtext && item.subtext.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={20} /></button>
                </div>

                <div className="p-4 border-b">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={`Pesquisar por órgão ou objeto...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                </div>

                <div className="p-4 max-h-[50vh] overflow-y-auto">
                    {filteredItems.length > 0 ? (
                        <ul className="space-y-2">
                            {filteredItems.map(item => (
                                <li key={item.id} onClick={() => onSelect(item.id)} className="p-3 rounded-md border hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition-colors">
                                    <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                                    {item.subtext && <p className="text-sm text-gray-500 truncate">{item.subtext}</p>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 py-8">{searchTerm ? `Nenhum resultado para "${searchTerm}"` : `Nenhum ${itemType} disponível. Crie um primeiro.`}</p>
                    )}
                </div>
                
                {actionButton && (
                    <div className="p-4 border-t bg-gray-50 flex justify-center items-center">
                        <span className="text-sm text-gray-600 mr-4">Ou</span>
                        <button
                            onClick={actionButton.onClick}
                            className="inline-flex items-center bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                        >
                            {actionButton.label}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SelectParentModal;