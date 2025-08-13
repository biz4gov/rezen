import React, { useState } from 'react';

// Página para configurar as credenciais do banco de dados.
function ConfiguracoesPage() {
  // Estado para armazenar os dados do formulário.
  const [formData, setFormData] = useState({
    host: '',
    user: '',
    password: '',
    database: ''
  });

  // Estados para controlar o feedback da API.
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Manipulador para atualizar o estado do formulário.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manipulador para enviar o formulário ao backend.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      // A URL agora é relativa, para que o Nginx proxy possa interceptá-la.
      const response = await fetch('/api/config-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      // Define a mensagem de feedback com base na resposta.
      setMessage(data.message);
      if (!response.ok) {
        setIsError(true);
      } else {
        setIsError(false);
      }
    } catch (err) {
      console.error('Erro de conexão com o backend:', err);
      setMessage('Não foi possível conectar ao serviço de backend. Verifique se ele está rodando.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Configurar Conexão</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo Host */}
        <div>
          <label htmlFor="host" className="block text-sm font-medium text-gray-700">Host</label>
          <input type="text" name="host" id="host" required value={formData.host} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        {/* Campo Usuário */}
        <div>
          <label htmlFor="user" className="block text-sm font-medium text-gray-700">Usuário</label>
          <input type="text" name="user" id="user" required value={formData.user} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        {/* Campo Senha */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
          <input type="password" name="password" id="password" required value={formData.password} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        {/* Campo Database */}
        <div>
          <label htmlFor="database" className="block text-sm font-medium text-gray-700">Database</label>
          <input type="text" name="database" id="database" required value={formData.database} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        {/* Botão de Envio */}
        <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
          {loading ? 'Salvando...' : 'Salvar Conexão'}
        </button>
      </form>
      {/* Exibição da mensagem de feedback */}
      {message && (
        <p className={`mt-4 text-center text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default ConfiguracoesPage;