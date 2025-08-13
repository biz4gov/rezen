
import React, { useState, useCallback, useEffect } from 'react';
import type { ProductData, ProductImage } from '../types';
import FormField from './FormField';
import RichTextInput from './RichTextInput';
import { Upload, X, Image as ImageIcon, Loader2, FileText } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: ProductData) => Promise<void>;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSave }) => {
    const initialProductState: Omit<ProductData, 'produto_unique'> = {
        produto_nome: '',
        produto_codigo: '',
        produto_referencia: 0,
        produto_minimo: 0,
        produto_descricao: '',
        produto_imagens: [],
        produto_folheto_pdf: null,
    };

    const [product, setProduct] = useState(initialProductState);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setProduct(initialProductState);
        }
    }, [isOpen]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'produto_referencia' || name === 'produto_minimo') {
            setProduct(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setProduct(prev => ({ ...prev, [name]: value }));
        }
    }, []);

    const handleRichTextChange = useCallback((name: string, value: string) => {
        setProduct(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newImages: ProductImage[] = [...product.produto_imagens];
        for (let i = 0; i < files.length; i++) {
            if (newImages.length >= 5) break;
            const file = files[i];
            const base64 = await fileToBase64(file);
            newImages.push({ name: file.name, base64 });
        }
        setProduct(prev => ({ ...prev, produto_imagens: newImages }));
        e.target.value = ''; // Reset file input
    };

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Por favor, selecione um arquivo PDF.');
            return;
        }

        const base64 = await fileToBase64(file);
        setProduct(prev => ({
            ...prev,
            produto_folheto_pdf: { name: file.name, base64 }
        }));
        e.target.value = ''; // Reset file input
    };

    const removePdf = () => {
        setProduct(prev => ({
            ...prev,
            produto_folheto_pdf: null
        }));
    };

    const removeImage = (index: number) => {
        setProduct(prev => ({
            ...prev,
            produto_imagens: prev.produto_imagens.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const newProduct: ProductData = {
            ...product,
            produto_unique: `prod_${Date.now()}`
        };
        await onSave(newProduct);
        setIsSaving(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Cadastrar Novo Produto</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-6">
                    <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <FormField label="Nome do Produto" name="produto_nome" value={product.produto_nome} onChange={handleChange} required className="md:col-span-2" />
                           <FormField label="Código de Referência (EAN, NCM)" name="produto_codigo" value={product.produto_codigo} onChange={handleChange} />
                           <FormField label="Valor de Referência" name="produto_referencia" type="number" value={product.produto_referencia} onChange={handleChange} />
                           <FormField label="Valor Mínimo" name="produto_minimo" type="number" value={product.produto_minimo} onChange={handleChange} />
                        </div>
                        
                        <RichTextInput label="Descrição Técnica" name="produto_descricao" value={product.produto_descricao} onChange={handleRichTextChange} />

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Imagens do Produto (até 5)</label>
                             {product.produto_imagens.length > 0 && (
                                <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-4">
                                    {product.produto_imagens.map((image, index) => (
                                        <div key={index} className="relative group aspect-square">
                                            <img src={image.base64} alt={image.name} className="h-full w-full object-cover rounded-md shadow-md" />
                                            <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remover imagem">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {product.produto_imagens.length < 5 && (
                                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="produto_imagens" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-800 hover:text-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                <span>Carregar imagens</span>
                                                <input id="produto_imagens" name="produto_imagens" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" multiple />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">{5 - product.produto_imagens.length} restantes</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Folheto / Catálogo em PDF</label>
                            {product.produto_folheto_pdf ? (
                                <div className="mt-2 flex items-center justify-between bg-gray-100 p-2 rounded-md border">
                                    <div className="flex items-center overflow-hidden">
                                        <FileText size={20} className="text-red-500 mr-2 flex-shrink-0" />
                                        <span className="text-sm text-gray-700 truncate" title={product.produto_folheto_pdf.name}>{product.produto_folheto_pdf.name}</span>
                                    </div>
                                    <button type="button" onClick={removePdf} className="p-1 text-gray-500 hover:text-red-600" aria-label="Remover PDF">
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="produto_folheto_pdf" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-800 hover:text-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                <span>Carregar um arquivo</span>
                                                <input id="produto_folheto_pdf" name="produto_folheto_pdf" type="file" className="sr-only" onChange={handlePdfUpload} accept="application/pdf" />
                                            </label>
                                            <p className="pl-1">ou arraste e solte</p>
                                        </div>
                                        <p className="text-xs text-gray-500">Apenas PDF</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
                <div className="flex-shrink-0 flex justify-end items-center p-4 border-t space-x-4">
                    <button type="button" onClick={onClose} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button type="submit" form="product-form" disabled={isSaving || !product.produto_nome} className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-900 disabled:bg-blue-400 disabled:cursor-not-allowed">
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSaving ? 'Salvando...' : 'Salvar Produto'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductFormModal;
