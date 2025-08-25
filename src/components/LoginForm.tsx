import React, { useState } from 'react';
import { LogIn, Mail, Lock } from 'lucide-react';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
}

const LOGO_URL =
  'https://altikastudiodental.com/wp-content/uploads/2025/06/Recurso-18@300x.png';

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    onLogin(email, password)
      .then((success) => {
        if (!success) {
          setError('Credenciales incorrectas o error de conexión. Verifique su email y contraseña.');
        }
        setIsLoading(false);
      })
      .catch(() => {
        setError('Error de conexión. Intente nuevamente.');
        setIsLoading(false);
      });
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex items-center justify-center p-4"
      style={{ fontFamily: '"Cera bold", Sans-serif' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-black/10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-black overflow-hidden">
            <img src={LOGO_URL} alt="Altika Studio Dental" className="h-8 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-black">Altika Studio Dental</h1>
          <p className="text-gray-700 mt-2">Acceso al sistema de gestión</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-black/20 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black placeholder-gray-400"
                placeholder="admin@altika.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-black/20 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black hover:bg-black/90 disabled:bg-black/40 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Iniciar Sesión</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
