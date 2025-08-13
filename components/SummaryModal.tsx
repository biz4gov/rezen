import React, { useState, useEffect } from 'react';
import { X, Send, Check, Loader2, Edit } from 'lucide-react';

interface SummaryModalProps {
  isOpen: boolean;
  summaryText: string;
  isGenerating: boolean;
  isSaving: boolean;
  onConfirm: (editedText: string) => void;
  onSend: (editedText: string) => void;
  onCancel: () => void;
}

const SummaryModal: React.FC<SummaryModalProps> = ({ 
    isOpen, 
    summaryText,
    isGenerating,
    isSaving,
    onConfirm, 
    onSend,
    onCancel 
}) => {
  const [editedText, setEditedText] = useState(summaryText);

  useEffect(() => {
    if (isOpen) {
      setEditedText(summaryText);
    }
  }, [isOpen, summaryText]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Edit size={20} className="mr-3 text-blue-600" />
            Resumo da Licitação (One Page Report)
          </h2>
          <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-200">
            <X size={20} />
          </button>
        </header>

        <main className="flex-grow overflow-y-auto p-6 bg-gray-50">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-600">
                <Loader2 size={40} className="animate-spin text-blue-700" />
                <p className="mt-4 text-lg font-semibold">Gerando resumo com IA...</p>
                <p className="text-sm">Por favor, aguarde.</p>
            </div>
          ) : (
             <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full h-full p-4 border rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm leading-relaxed"
             />
          )}
        </main>

        <footer className="flex-shrink-0 flex justify-end items-center p-4 border-t space-x-3 bg-white rounded-b-lg">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 shadow-sm hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onSend(editedText)}
            disabled={isGenerating || isSaving}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:bg-green-300"
          >
            <Send size={16} className="mr-2" />
            Enviar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(editedText)}
            disabled={isGenerating || isSaving}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-900 disabled:bg-blue-400"
          >
            {isSaving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Check size={16} className="mr-2" />}
            {isSaving ? 'Salvando...' : 'Confirmar e Salvar'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SummaryModal;
