import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import StatusPage from './pages/Status';
import ConfiguracoesPage from './pages/Configuracoes';

// Componente principal que define o layout e as rotas da aplicação.
function App() {
  // Estilos para os links de navegação ativos, para feedback visual.
  const activeLinkStyle = {
    fontWeight: 'bold',
    textDecoration: 'underline',
    color: '#2563eb' // a blue color from tailwind
  };

  return (
    <div className="min-h-screen text-gray-800">
      {/* Cabeçalho de navegação */}
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-4 flex gap-6">
          <NavLink 
            to="/" 
            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
            className="text-gray-600 hover:text-blue-600"
          >
            Status da Conexão
          </NavLink>
          <NavLink 
            to="/config" 
            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
            className="text-gray-600 hover:text-blue-600"
          >
            Configurações
          </NavLink>
        </nav>
      </header>

      {/* Área principal onde as páginas serão renderizadas */}
      <main className="container mx-auto p-6">
        <Routes>
          {/* Rota para a página de Status (página inicial) */}
          <Route path="/" element={<StatusPage />} />
          {/* Rota para a página de Configurações */}
          <Route path="/config" element={<ConfiguracoesPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
