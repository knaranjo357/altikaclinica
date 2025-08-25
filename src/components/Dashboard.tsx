import React, { useState } from 'react';
import { Calendar, Gift } from 'lucide-react';
import { User } from '../types';
import { Header } from './Header';
import { CitasTab } from './CitasTab';
import { CumpleanosTab } from './CumpleanosTab';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'citas' | 'cumpleanos'>('citas');

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-white to-gray-50"
      style={{ fontFamily: '"Cera bold", Sans-serif' }}
    >
      <Header user={user} onLogout={onLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black mb-2">Panel de Control</h2>
          <p className="text-gray-700">Gestiona las citas y cumpleaños de tus pacientes</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md border border-black/10 mb-6">
          <div className="border-b border-black/10">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('citas')}
                className={`py-4 px-1 inline-flex items-center space-x-2 border-b-2 font-medium text-sm transition-all ${
                  activeTab === 'citas'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-black hover:border-black/30'
                }`}
                aria-selected={activeTab === 'citas'}
              >
                <Calendar className="w-5 h-5" />
                <span>Citas Programadas</span>
              </button>
              <button
                onClick={() => setActiveTab('cumpleanos')}
                className={`py-4 px-1 inline-flex items-center space-x-2 border-b-2 font-medium text-sm transition-all ${
                  activeTab === 'cumpleanos'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-black hover:border-black/30'
                }`}
                aria-selected={activeTab === 'cumpleanos'}
              >
                <Gift className="w-5 h-5" />
                <span>Cumpleaños</span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'citas' ? <CitasTab /> : <CumpleanosTab />}
          </div>
        </div>
      </main>
    </div>
  );
};
