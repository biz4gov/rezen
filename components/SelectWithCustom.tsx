
import React, { useState, useEffect } from 'react';
import type { ConstantItem } from '../types';
import { Info } from 'lucide-react';

interface SelectWithCustomProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: ConstantItem[];
  required?: boolean;
  className?: string;
}

const SelectWithCustom: React.FC<SelectWithCustomProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  className = ''
}) => {
  const customOptionValue = 'outra';
  const isCustom = !options.some(opt => opt.value === value) && value !== '';
  
  const [selectedValue, setSelectedValue] = useState(isCustom ? customOptionValue : value);
  const [customValue, setCustomValue] = useState(isCustom ? value : '');
  const [selectedObservation, setSelectedObservation] = useState<string | null>(null);

  useEffect(() => {
    const isCurrentlyCustom = !options.some(opt => opt.value === value) && value !== '';
    setSelectedValue(isCurrentlyCustom ? customOptionValue : value);
    setCustomValue(isCurrentlyCustom ? value : '');
  }, [value, options]);

  useEffect(() => {
    if (selectedValue !== customOptionValue) {
        const selectedOption = options.find(opt => opt.value === selectedValue);
        setSelectedObservation(selectedOption?.observation || null);
    } else {
        setSelectedObservation(null);
    }
  }, [selectedValue, options]);


  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSelectedValue(newValue);
    if (newValue !== customOptionValue) {
      setCustomValue('');
      onChange(newValue);
    } else {
      // Quando muda para 'outra', passa o valor customizado atual (pode ser vazio)
      onChange(customValue);
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Atualiza apenas o estado interno durante a digitação
    setCustomValue(e.target.value);
  };
  
  const handleCustomInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Propaga a mudança para o pai quando o campo perde o foco
      if (selectedValue === customOptionValue) {
          onChange(customValue);
      }
  };

  const baseClasses = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm";
  const showCustomInput = selectedValue === customOptionValue;

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <select
          id={name}
          name={name}
          value={selectedValue}
          onChange={handleSelectChange}
          required={required && !showCustomInput}
          className={`${baseClasses} ${showCustomInput ? 'sm:w-1/3' : 'w-full'}`}
        >
          <option value="">Selecione...</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>{option.value}</option>
          ))}
          <option value={customOptionValue}>Outra...</option>
        </select>
        {showCustomInput && (
          <input
            type="text"
            value={customValue}
            onChange={handleCustomInputChange}
            onBlur={handleCustomInputBlur}
            placeholder="Especifique"
            required={required}
            className={`${baseClasses} flex-grow`}
          />
        )}
      </div>
       {selectedObservation && !showCustomInput && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-md flex items-start">
            <Info size={14} className="flex-shrink-0 mr-2 mt-0.5" />
            <span>{selectedObservation}</span>
        </div>
      )}
    </div>
  );
};

export default SelectWithCustom;
