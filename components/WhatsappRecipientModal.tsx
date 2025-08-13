import React, { useState, useMemo, useEffect } from 'react';
import type { EmpresaData } from '../types';
import { X, Building, Keyboard, Send, Loader2, Info } from 'lucide-react';
import MaskedInput from './MaskedInput';

interface WhatsappRecipientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (phoneNumber: string) => Promise<void>;
  empresas: EmpresaData[];
  isSending: boolean;
}

const WhatsappRecipientModal: React.FC<WhatsappRecipientModalProps> = ({ isOpen, onClose, onSend, empresas, isSending }) => {
    const [activeTab, setActiveTab] = useState<'company' | 'manual'>('company');
    const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>('');
    const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string>('');
    const [manualPhoneNumber, setManualPhoneNumber] = useState<string>('');

    useEffect(() => {
        if (!isOpen) {
            setActiveTab('company');
            setSelectedEmpresaId('');
            setSelectedPhoneNumber('');
            setManualPhoneNumber('');
        }
    }, [isOpen]);

    const whatsappEnabledEmpresas = useMemo(() => {
        return empresas.filter(empresa => 
            empresa.telefones.some(tel => tel.isWhatsapp)
        );
    }, [empresas]);
    
    const selectedEmpresaPhones = useMemo(() => {
        if (!selectedEmpresaId) return [];
        const empresa = empresas.find(e => e.empresa_unique_id === selectedEmpresaId);
        return empresa?.telefones.filter(tel => tel.isWhatsapp) || [];
    }, [selectedEmpresaId, empresas]);
    
    const handleEmpresaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newEmpresaId = e.target.value;
        setSelectedEmpresaId(newEmpresaId);
        setSelectedPhoneNumber('');
    };
    
    const handleSendClick = () => {
        const numberToSend = activeTab === 'company' ? selectedPhoneNumber : manualPhoneNumber;
        if (numberToSend) {
            onSend(numberToSend);
        } else {
            alert('Por favor, selecione ou digite um número de telefone.');
        }
    };
    
    if (!isOpen) return null;

    const isSendButtonDisabled = isSending || (activeTab === 'company' && !selectedPhoneNumber) || (activeTab === 'manual' && !manualPhoneNumber);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Enviar WhatsApp</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={20} /></button>
                </div>

                <div className="p-4">
                    <div className="flex border-b mb-4">
                        <button 
                            onClick={() => setActiveTab('company')}
                            className={`flex-1 py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'company' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            <Building size={16} /> Selecionar Empresa
                        </button>
                        <button 
                            onClick={() => setActiveTab('manual')}
                            className={`flex-1 py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'manual' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            <Keyboard size={16} /> Digitar Número
                        </button>
                    </div>

                    {activeTab === 'company' ? (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="empresa-select" className="block text-sm font-medium text-gray-700">Empresa</label>
                                <select 
                                    id="empresa-select" 
                                    value={selectedEmpresaId} 
                                    onChange={handleEmpresaChange} 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                >
                                    <option value="">Selecione uma empresa...</option>
                                    {whatsappEnabledEmpresas.map(empresa => (
                                        <option key={empresa.empresa_unique_id} value={empresa.empresa_unique_id}>{empresa.nome_completo}</option>
                                    ))}
                                </select>
                            </div>
                            {selectedEmpresaId && (
                                <div>
                                    <label htmlFor="phone-select" className="block text-sm font-medium text-gray-700">Telefone com WhatsApp</label>
                                    <select 
                                        id="phone-select" 
                                        value={selectedPhoneNumber} 
                                        onChange={(e) => setSelectedPhoneNumber(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                        disabled={selectedEmpresaPhones.length === 0}
                                    >
                                        <option value="">{selectedEmpresaPhones.length > 0 ? 'Selecione um número...' : 'Nenhum WhatsApp encontrado'}</option>
                                        {selectedEmpresaPhones.map(tel => (
                                            <option key={tel.id} value={tel.phone}>{tel.phone}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                             <MaskedInput
                                label="Número de Telefone"
                                name="manualPhoneNumber"
                                value={manualPhoneNumber}
                                onChange={(e) => setManualPhoneNumber(e.target.value)}
                                mask="whatsappPhone"
                                placeholder="+55 (XX) XXXX-XXXX"
                                required
                            />
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded-md flex items-start">
                                <Info size={14} className="flex-shrink-0 mr-2 mt-0.5" />
                                <span>Observação: Se o número for de celular, não inclua o primeiro dígito '9'.</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end gap-3 rounded-b-lg">
                     <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:w-auto sm:text-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSendClick}
                        disabled={isSendButtonDisabled}
                        className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-800 text-base font-medium text-white hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm disabled:bg-blue-300"
                    >
                        {isSending ? <Loader2 className="animate-spin h-5 w-5 mr-2"/> : <Send size={16} className="mr-2"/>}
                        {isSending ? 'Enviando...' : 'Enviar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WhatsappRecipientModal;