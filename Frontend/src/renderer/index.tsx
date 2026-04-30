import React from 'react';
import { Button } from '@/components/ui/button';

export default function LoginScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">Pulse Chat</h1>
          <p className="text-gray-400 mt-2">Faça login para continuar</p>
        </div>
        
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 mt-1 text-white bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Senha</label>
            <input
              type="password"
              className="w-full px-4 py-2 mt-1 text-white bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full mt-6">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}