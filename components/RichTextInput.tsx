
import React, { useRef, useState, useEffect } from 'react';
import { Bold, Italic, Underline } from 'lucide-react';

interface RichTextInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  className?: string;
  required?: boolean;
}

const RichTextInput: React.FC<RichTextInputProps> = ({ label, name, value, onChange, className = '', required = false }) => {
  const [internalValue, setInternalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (internalValue !== value) {
      setInternalValue(value);
    }
  }, [value]);

  const applyFormat = (tag: 'b' | 'i' | 'u') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = internalValue.substring(start, end);

    if (selectedText) {
      const before = internalValue.substring(0, start);
      const after = internalValue.substring(end);
      const newText = `${before}<${tag}>${selectedText}</${tag}>${after}`;
      
      setInternalValue(newText);
      onChange(name, newText); // Ações de formatação devem ser imediatas

      // Restaurar seleção
      setTimeout(() => {
        textarea.selectionStart = start + `<${tag}>`.length;
        textarea.selectionEnd = end + `<${tag}>`.length;
        textarea.focus();
      }, 0);
    }
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInternalValue(e.target.value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (internalValue !== value) {
        onChange(name, internalValue);
    }
  };

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-1 border border-gray-300 rounded-md shadow-sm overflow-hidden">
        <div className="p-2 bg-gray-50 border-b border-gray-300 flex items-center space-x-1">
          <button type="button" onClick={() => applyFormat('b')} className="p-2 rounded hover:bg-gray-200 focus:outline-none focus:bg-gray-200" title="Negrito"><Bold size={16} /></button>
          <button type="button" onClick={() => applyFormat('i')} className="p-2 rounded hover:bg-gray-200 focus:outline-none focus:bg-gray-200" title="Itálico"><Italic size={16} /></button>
          <button type="button" onClick={() => applyFormat('u')} className="p-2 rounded hover:bg-gray-200 focus:outline-none focus:bg-gray-200" title="Sublinhado"><Underline size={16} /></button>
        </div>
        <textarea
          id={name}
          ref={textareaRef}
          name={name}
          value={internalValue}
          onChange={handleTextAreaChange}
          onBlur={handleBlur}
          rows={5}
          className="block w-full border-0 focus:ring-0 sm:text-sm p-2 resize-y"
          required={required}
        />
      </div>
    </div>
  );
};

export default RichTextInput;
