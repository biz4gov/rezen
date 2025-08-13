import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

// Define a interface para o estado da conexão.
interface DbStatus {
  status: 'online' | 'offline' | 'error' | 'loading';
  message: string;
}

// Página para exibir o status da conexão com o banco de dados.
function StatusPage() {
  // Estado para armazenar o status atual da conexão.
  const [dbStatus, setDbStatus] = useState<DbStatus>({
    status: 'loading',
    message: 'Verificando status...'
  });

  // Hook para buscar o status periodicamente.
  useEffect(() => {
    // Função para buscar o status no backend.
    const fetchStatus = async () => {
      try {
        // A URL agora é relativa, para que o Nginx proxy possa interceptá-la.
        const response = await fetch('/api/db-status');
        const data = await response.json();
        
        // Atualiza o estado com a resposta da API.
        setDbStatus({
          status: data.status,
          message: data.message,
        });
      } catch (err) {
        console.error('Erro ao buscar status do DB:', err);
        setDbStatus({
          status: 'error',
          message: 'Falha ao conectar com o serviço de backend.',
        });
      }
    };

    // Executa a primeira verificação imediatamente.
    fetchStatus();

    // Configura um intervalo para verificar o status a cada 5 segundos.
    const intervalId = setInterval(fetchStatus, 5000);

    // Função de limpeza: remove o intervalo quando o componente é desmontado.
    return () => clearInterval(intervalId);
  }, []); // O array de dependências vazio faz com que este efeito rode apenas uma vez (na montagem).

  // Função auxiliar para determinar a cor do indicador de status.
  const getStatusColor = () => {
    switch (dbStatus.status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-gray-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500'; // para 'loading'
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center mt-10">
      <h1 className="text-2xl font-bold mb-6">Status da Conexão</h1>
      <div className="flex items-center justify-center gap-4">
        {/* Indicador visual do status */}
        <div className={`w-6 h-6 rounded-full ${getStatusColor()} animate-pulse`}></div>
        {/* Mensagem de status */}
        <p className="text-lg text-gray-700">{dbStatus.message}</p>
      </div>
      {/* Dica para o usuário caso a conexão não esteja configurada */}
      {dbStatus.status === 'offline' && (
          <p className="mt-4 text-sm text-gray-500">
              Parece que o banco de dados não está configurado. Vá para a página de <NavLink to="/config" className="text-blue-600 hover:underline">Configurações</NavLink> para conectar.
          </p>
      )}
    </div>
  );
}

export default StatusPage;