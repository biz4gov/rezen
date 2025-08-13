
import React from 'react';
import type { ProductData } from '../types';
import { PlusCircle, Edit, Trash2, Package, Image as ImageIcon } from 'lucide-react';

interface ProductsListPageProps {
  products: ProductData[];
  onAddProduct: () => void;
  onEditProduct: (id: string) => void;
  onDeleteProduct: (id: string) => void;
}

const ProductCard: React.FC<{ product: ProductData; onEdit: () => void; onDelete: () => void; }> = ({ product, onEdit, onDelete }) => {
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the card's onEdit from firing
        onDelete();
    };
    
    return (
      <div onClick={onEdit} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group transition-all hover:shadow-md hover:border-blue-500 cursor-pointer">
        <div className="aspect-w-1 aspect-h-1 w-full bg-gray-100">
          {product.produto_imagens.length > 0 ? (
            <img src={product.produto_imagens[0].base64} alt={product.produto_nome} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-gray-300" />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-800 text-md truncate group-hover:text-blue-700" title={product.produto_nome}>{product.produto_nome}</h3>
          <p className="text-sm text-gray-500 mt-1 truncate" title={product.produto_codigo}>Código: {product.produto_codigo || 'N/A'}</p>
          <div className="flex justify-between items-center mt-3 text-sm">
            <div>
              <p className="text-gray-500">Ref: <span className="font-semibold text-gray-700">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.produto_referencia)}</span></p>
              <p className="text-gray-500">Min: <span className="font-semibold text-gray-700">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.produto_minimo)}</span></p>
            </div>
            <div className="flex items-center space-x-2">
               <button onClick={handleDelete} className="p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors" title="Excluir produto">
                  <Trash2 size={18} />
               </button>
            </div>
          </div>
        </div>
      </div>
    );
};

const ProductsListPage: React.FC<ProductsListPageProps> = ({ products, onAddProduct, onEditProduct, onDeleteProduct }) => {
  return (
    <div className="h-full w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Catálogo de Produtos</h1>
          <button
            onClick={onAddProduct}
            className="inline-flex items-center bg-blue-800 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <PlusCircle size={20} className="mr-2" />
            Adicionar Produto
          </button>
        </div>
        
        {products.length > 0 ? (
            <div className="flex-grow overflow-y-auto pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {products.map(product => (
                    <ProductCard
                        key={product.produto_unique}
                        product={product}
                        onEdit={() => onEditProduct(product.produto_unique)}
                        onDelete={() => onDeleteProduct(product.produto_unique)}
                    />
                    ))}
                </div>
            </div>
        ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300 rounded-lg">
                <Package className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-800">Nenhum produto cadastrado</h3>
                <p className="mt-1 text-sm text-gray-500">Comece adicionando seu primeiro produto ao catálogo.</p>
                <button
                    onClick={onAddProduct}
                    className="mt-6 inline-flex items-center bg-blue-800 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                    <PlusCircle size={20} className="mr-2" />
                    Adicionar Produto
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProductsListPage;
