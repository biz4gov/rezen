
import React from 'react';
import type { ConstantItem } from '../types';
import { Info } from 'lucide-react';

interface MultiSelectCheckboxProps {
  label: string;
  options: ConstantItem[];
  selectedValues: string[];
  onChange: (newValues: string[]) => void;
  required?: boolean;
  className?: string;
}

const MultiSelectCheckbox: React.FC<MultiSelectCheckboxProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  required = false,
  className = '',
}) => {
  const handleCheckboxChange = (value: string) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(newSelectedValues);
  };

  return (
    <div className={className}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-2 space-y-3 p-4 bg-white border rounded-md shadow-sm">
        {options.map(option => (
          <div key={option.value}>
            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  id={`multiselect-${option.value}`}
                  name={label}
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => handleCheckboxChange(option.value)}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor={`multiselect-${option.value}`} className="font-medium text-gray-800 cursor-pointer">{option.value}</label>
              </div>
            </div>
            {selectedValues.includes(option.value) && option.observation && (
                <div className="mt-2 ml-7 p-2 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-md flex items-start">
                    <Info size={14} className="flex-shrink-0 mr-2 mt-0.5" />
                    <span>{option.observation}</span>
                </div>
            )}
          </div>
        ))}
         {required && selectedValues.length === 0 && (
          <p className="text-xs text-red-600 mt-2">Pelo menos uma opção deve ser selecionada.</p>
        )}
      </div>
    </div>
  );
};

export default MultiSelectCheckbox;