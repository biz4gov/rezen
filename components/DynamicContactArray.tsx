import React from 'react';
import { Plus, Trash2, CheckCircle, Smartphone } from 'lucide-react';
import MaskedInput from './MaskedInput';
import type { EmailEntry, PhoneEntry } from '../types';

type ContactEntry = EmailEntry | PhoneEntry;

interface DynamicContactArrayProps {
  label: string;
  values: ContactEntry[];
  setValues: (values: ContactEntry[]) => void;
  contactType: 'email' | 'phone';
}

const DynamicContactArray: React.FC<DynamicContactArrayProps> = ({
  label,
  values,
  setValues,
  contactType,
}) => {
  const handleValueChange = (index: number, value: string) => {
    const newValues = [...values];
    if (contactType === 'email') {
      (newValues[index] as EmailEntry).email = value;
    } else {
      (newValues[index] as PhoneEntry).phone = value;
    }
    setValues(newValues);
  };

  const handlePrimaryChange = (index: number) => {
    const newValues = values.map((value, i) => ({
      ...value,
      isPrimary: i === index,
    }));
    setValues(newValues);
  };
  
  const handleWhatsappChange = (index: number) => {
    const newValues = [...values];
    const phoneEntry = newValues[index] as PhoneEntry;
    phoneEntry.isWhatsapp = !phoneEntry.isWhatsapp;
    setValues(newValues);
  };

  const addField = () => {
    const newId = `contact_${Date.now()}`;
    const hasPrimary = values.some(v => v.isPrimary);
    
    let newEntry: ContactEntry;
    if (contactType === 'email') {
      newEntry = { id: newId, email: '', isPrimary: !hasPrimary } as EmailEntry;
    } else {
      newEntry = { id: newId, phone: '', isPrimary: !hasPrimary, isWhatsapp: false } as PhoneEntry;
    }
    
    setValues([...values, newEntry]);
  };

  const removeField = (index: number) => {
    const itemToRemove = values[index];
    const newValues = values.filter((_, i) => i !== index);

    // If the removed item was primary and there are other items, make the new first one primary.
    if (itemToRemove.isPrimary && newValues.length > 0) {
      newValues[0].isPrimary = true;
    }
    
    setValues(newValues);
  };
  
  const getInput = (value: ContactEntry, index: number) => {
    if (contactType === 'email') {
      const emailValue = (value as EmailEntry).email;
      return (
        <input
            type="email"
            placeholder="exemplo@dominio.com"
            value={emailValue}
            onChange={(e) => handleValueChange(index, e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            required
        />
      );
    } else {
      const phoneValue = (value as PhoneEntry).phone;
      return (
         <MaskedInput
            name={`phone-${index}`}
            value={phoneValue}
            onChange={(e) => handleValueChange(index, e.target.value)}
            mask="phone"
            isDynamic={true}
            placeholder="+55 (XX) XXXXX-XXXX"
        />
      );
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">{label}</label>
      <div className="space-y-3 mt-1">
        {values.map((value, index) => (
          <div key={value.id} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md border">
            <div className="flex-grow">
               {getInput(value, index)}
            </div>
            
            <div className="flex items-center space-x-3">
                 <label htmlFor={`primary-${contactType}-${value.id}`} className="flex items-center cursor-pointer text-xs text-gray-600" title="Definir como principal">
                    <input
                        type="radio"
                        id={`primary-${contactType}-${value.id}`}
                        name={`${contactType}-primary`}
                        checked={value.isPrimary}
                        onChange={() => handlePrimaryChange(index)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                     />
                    <span className="ml-1.5 hidden sm:inline">Principal</span>
                    <CheckCircle size={16} className="ml-1.5 sm:hidden" />
                 </label>
            
                {contactType === 'phone' && (
                    <label htmlFor={`whatsapp-${value.id}`} className="flex items-center cursor-pointer text-xs text-gray-600" title="Possui WhatsApp?">
                        <input
                            type="checkbox"
                            id={`whatsapp-${value.id}`}
                            checked={(value as PhoneEntry).isWhatsapp}
                            onChange={() => handleWhatsappChange(index)}
                            className="h-4 w-4 rounded text-green-500 focus:ring-green-400 border-gray-300"
                        />
                        <span className="ml-1.5 hidden sm:inline">WhatsApp</span>
                        <Smartphone size={16} className="ml-1.5 sm:hidden" />
                    </label>
                )}

                <button
                  type="button"
                  onClick={() => removeField(index)}
                  className="p-1.5 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100"
                  disabled={values.length <= 1}
                  title="Remover"
                >
                  <Trash2 size={16} />
                </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addField}
        className="mt-2 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
      >
        <Plus size={16} className="mr-1" />
        Adicionar
      </button>
    </div>
  );
};

export default DynamicContactArray;