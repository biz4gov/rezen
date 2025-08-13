
import React, { useState, useEffect } from 'react';

export const masks = {
  cep: (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
  },
  cnpj: (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  },
  phone: (value: string) => {
    if (!value) return '';
    // 1. Clean to only digits
    let v = value.replace(/\D/g, '');

    // 2. Handle data from storage which might include the country code
    if (v.startsWith('55')) {
      v = v.substring(2);
    }

    // 3. Limit to DDD (2) + local number (9)
    v = v.slice(0, 11);

    const ddd = v.slice(0, 2);
    const numberPart = v.slice(2);

    let formattedNumber = '';
    if (numberPart.length > 4) {
      // Puts the hyphen before the last 4 digits, supporting 8 and 9 digit numbers
      const lastFour = numberPart.slice(-4);
      const firstPart = numberPart.slice(0, numberPart.length - 4);
      formattedNumber = `${firstPart}-${lastFour}`;
    } else {
      formattedNumber = numberPart;
    }

    if (v.length > 2) {
      return `+55 (${ddd}) ${formattedNumber}`;
    }
    if (v.length > 0) {
      return `+55 (${v}`;
    }

    return '';
  },
  whatsappPhone: (value: string) => {
    if (!value) return '';
    // 1. Clean to only digits
    let v = value.replace(/\D/g, '');

    // 2. Handle data from storage which might include the country code
    if (v.startsWith('55')) {
      v = v.substring(2);
    }

    // 3. Limit to DDD (2) + local number (8)
    v = v.slice(0, 10);

    const ddd = v.slice(0, 2);
    const numberPart = v.slice(2);

    let formattedNumber = '';
    if (numberPart.length > 4) {
      // Puts the hyphen before the last 4 digits
      const lastFour = numberPart.slice(-4);
      const firstPart = numberPart.slice(0, numberPart.length - 4);
      formattedNumber = `${firstPart}-${lastFour}`;
    } else {
      formattedNumber = numberPart;
    }

    if (v.length > 2) {
      return `+55 (${ddd}) ${formattedNumber}`;
    }
    if (v.length > 0) {
      return `+55 (${v}`;
    }

    return '';
  },
  datetime: (value: string) => {
    let v = value.replace(/\D/g, '');
    v = v.replace(/^(\d{2})(\d)/, '$1/$2');
    v = v.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
    v = v.replace(/^(\d{2})\/(\d{2})\/(\d{4})(\d)/, '$1/$2/$3 $4');
    v = v.replace(/^(\d{2})\/(\d{2})\/(\d{4})\s(\d{2})(\d)/, '$1/$2/$3 $4:$5');
    return v.slice(0, 16);
  },
  date: (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1/$2')
      .replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3')
      .slice(0, 10);
  },
  empenho: (value: string) => {
    return value
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 11);
  },
  cpfCnpj: (value: string) => {
    const onlyDigits = value.replace(/\D/g, '');
    if (onlyDigits.length <= 11) {
      // CPF mask
      return onlyDigits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .slice(0, 14);
    } else {
      // CNPJ mask
      return onlyDigits
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .slice(0, 18);
    }
  },
};

interface MaskedInputProps {
  label?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mask: keyof typeof masks;
  required?: boolean;
  className?: string;
  isDynamic?: boolean;
  placeholder?: string;
}

const MaskedInput: React.FC<MaskedInputProps> = ({
  label,
  name,
  value,
  onChange,
  mask,
  required = false,
  className = '',
  isDynamic = false,
  placeholder,
}) => {
    const [internalValue, setInternalValue] = useState(() => masks[mask](value));

    useEffect(() => {
        setInternalValue(masks[mask](value));
    }, [value, mask]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(masks[mask](e.target.value));
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (internalValue !== value) {
        const syntheticEvent = {
            ...e,
            target: {
              ...e.target,
              name: name,
              value: internalValue,
            },
        };
        onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const inputElement = (
    <input
      id={name}
      name={name}
      type="text"
      value={internalValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      required={required}
      placeholder={placeholder}
      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
    />
  );
  
  if (isDynamic) {
    return inputElement;
  }

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-1">
        {inputElement}
      </div>
    </div>
  );
};

export default MaskedInput;
