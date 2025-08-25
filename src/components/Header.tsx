import React from 'react';
import { LogOut, User } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  user: UserType;
  onLogout: () => void;
}

const LOGO_URL =
  'https://altikastudiodental.com/wp-content/uploads/2025/06/Recurso-18@300x.png';

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header
      className="bg-white shadow-sm border-b border-black/10"
      style={{ fontFamily: '"Cera bold", Sans-serif' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* IZQUIERDA: Logo + títulos */}
          <div className="flex items-center space-x-4">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-full bg-black overflow-hidden"
              aria-label="Altika Studio Dental"
            >
              <img
                src={LOGO_URL}
                alt="Altika Studio Dental"
                className="h-6 w-auto"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-black leading-tight">
                Altika Studio Dental
              </h1>
              <p className="text-sm text-gray-700">Sistema de Gestión</p>
            </div>
          </div>

          {/* DERECHA: Usuario + salir */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-black">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-black text-black hover:bg-black hover:text-white transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
