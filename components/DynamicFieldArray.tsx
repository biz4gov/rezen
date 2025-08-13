
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import MaskedInput from './MaskedInput';

interface DynamicFieldArrayProps {
  label: string;
  name: string;
  values: string[];
  setValues: (values: string[]) => void;
  inputType?: 'text' | 'email' | 'tel';
  mask?: 'cep' | 'cnpj' | 'phone';
  className?: string;
}

const DynamicFieldArray: React.FC<DynamicFieldArrayProps> = ({
  label,
  name,
  values,
  setValues,
  inputType = 'text',
  mask,
  className = ''
}) => {
  const handleValueChange = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
  };

  const addField = () => {
    setValues([...values, '']);
  };

  const removeField = (index: number) => {
    if (values.length > 1) {
      const newValues = values.filter((_, i) => i !== index);
      setValues(newValues);
    }
  };

  return (
    <div className={className}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">{label}</label>
      <div className="space-y-2 mt-1">
        {values.map((value, index) => (
          <div key={index} className="flex items-center space-x-2">
            {mask ? (
                <MaskedInput
                    name={`${name}-${index}`}
                    value={value}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                    mask={mask}
                    isDynamic={true}
                />
            ) : (
                <input
                    type={inputType}
                    name={`${name}-${index}`}
                    value={value}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
            )}
            
            <button
              type="button"
              onClick={() => removeField(index)}
              className="p-2 text-gray-500 hover:text-red-600 disabled:text-gray-300"
              disabled={values.length <= 1}
            >
              <Trash2 size={18} />
            </button>
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

export default DynamicFieldArray;