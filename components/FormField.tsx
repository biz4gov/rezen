

import React, { useState, useEffect } from 'react';
import type { ConstantItem } from '../types';
import { Info } from 'lucide-react';

interface FormFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  type?: 'text' | 'number' | 'email' | 'tel' | 'date' | 'datetime-local' | 'textarea' | 'select' | 'password';
  required?: boolean;
  disabled?: boolean;
  className?: string;
  options?: ConstantItem[];
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  disabled = false,
  className = '',
  options = [],
}) => {
  const baseClasses = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm disabled:bg-gray-100";
  const [internalValue, setInternalValue] = useState(value);
  const [selectedObservation, setSelectedObservation] = useState<string | null>(null);

  // Sincroniza o estado interno se o valor do pai mudar (ex: preenchimento por IA)
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    if (type === 'select' && options.length > 0) {
      const selectedOption = options.find(opt => opt.value === internalValue);
      setSelectedObservation(selectedOption?.observation || null);
    } else {
      setSelectedObservation(null);
    }
  }, [internalValue, options, type]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInternalValue(e.target.value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Apenas propaga a mudança para o pai quando o campo perde o foco
    if (value !== internalValue) {
        onChange(e as any);
    }
  };
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Para selects, a atualização deve ser imediata
    setInternalValue(e.target.value);
    onChange(e);
  };

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={internalValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            required={required}
            rows={3}
            className={baseClasses}
          />
        );
      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={value} // Selects devem refletir o estado do pai diretamente
            onChange={handleSelectChange}
            required={required}
            className={baseClasses}
          >
            <option value="">Selecione...</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>{option.label || option.value}</option>
            ))}
          </select>
        );
      default:
        return (
          <input
            id={name}
            name={name}
            type={type}
            value={internalValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            required={required}
            disabled={disabled}
            className={baseClasses}
            step={type === 'number' ? '0.01' : undefined}
          />
        );
    }
  };

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {selectedObservation && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-md flex items-start">
            <Info size={14} className="flex-shrink-0 mr-2 mt-0.5" />
            <span>{selectedObservation}</span>
        </div>
      )}
    </div>
  );
};

export default FormField;