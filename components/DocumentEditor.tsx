import React, { useRef, useEffect } from 'react';

interface DocumentEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const DocumentEditor = React.forwardRef<HTMLDivElement, DocumentEditorProps>(({ value, onChange }, ref) => {
  // We need a ref to the editor element. The parent component will provide it.
  const editorRef = ref as React.RefObject<HTMLDivElement>;

  // Sync the editor's content with the value prop from the parent state.
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value, editorRef]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML);
  };

  return (
    <div
      ref={editorRef}
      contentEditable={true}
      onInput={handleInput}
      // Removed p-8 to use style padding for cm units
      className="block w-full h-full focus:outline-none min-h-[29.7cm] max-w-none text-black bg-transparent"
      style={{
        lineHeight: 1.5,
        fontFamily: 'Times New Roman, serif',
        fontSize: '12pt',
        color: '#000000',
        padding: '2.5cm 1.5cm 2cm 3cm', // top right bottom left
        textAlign: 'justify',
      }}
    />
  );
});

export default DocumentEditor;