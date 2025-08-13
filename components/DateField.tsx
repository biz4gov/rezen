import React from 'react';

interface DateFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type: 'date' | 'datetime-local';
  required?: boolean;
  className?: string;
}

const brazilianToISO = (brazilianDate: string, type: 'date' | 'datetime-local'): string => {
  if (!brazilianDate) return '';
  const parts = brazilianDate.split(' ');
  const datePart = parts[0];
  const timePart = parts.length > 1 ? parts[1] : null;

  const [day, month, year] = datePart.split('/');
  if (!year || !month || !day || year.length !== 4) return '';

  const isoDate = `${year}-${month}-${day}`;

  if (type === 'datetime-local' && timePart) {
    return `${isoDate}T${timePart}`;
  }
  return isoDate;
};

const isoToBrazilian = (isoDate: string, type: 'date' | 'datetime-local'): string => {
  if (!isoDate) return '';
  const [datePart, timePart] = isoDate.split('T');
  
  const [year, month, day] = datePart.split('-');
  if (!year || !month || !day) return '';
  
  const brazilianDate = `${day}/${month}/${year}`;

  if (type === 'datetime-local' && timePart) {
    // Some browsers might add seconds, so we trim it to HH:mm
    const [hours, minutes] = timePart.split(':');
    return `${brazilianDate} ${hours}:${minutes}`;
  }
  return brazilianDate;
};


const DateField: React.FC<DateFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type,
  required = false,
  className = '',
}) => {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoValue = e.target.value;
    const brazilianValue = isoToBrazilian(isoValue, type);
    
    // Create a synthetic event to pass to the parent's onChange handler
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: name,
        value: brazilianValue,
      },
    };
    onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
  };

  const isoValue = brazilianToISO(value, type);

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={isoValue}
        onChange={handleInputChange}
        required={required}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm disabled:bg-gray-100"
      />
    </div>
  );
};

export default DateField;
