import React from 'react';

function AppSimple() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center text-purple-600 mb-4">
          🚀 iLyra Platform
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Plataforma de Agentes de IA Inovadores
        </p>
        <div className="space-y-4">
          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
            Entrar
          </button>
          <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
            Registrar
          </button>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            ✅ Frontend React funcionando!
          </p>
          <p className="text-sm text-gray-500">
            ✅ Vite 6.0 configurado
          </p>
          <p className="text-sm text-gray-500">
            ✅ Tailwind CSS ativo
          </p>
        </div>
      </div>
    </div>
  );
}

export default AppSimple;
