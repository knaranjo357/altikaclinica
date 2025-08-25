import React, { useState, useEffect, useMemo } from 'react';
import { Gift, User, Phone, MessageCircle, Search, RefreshCw, Filter, X, CheckCircle, XCircle, Calendar, CalendarDays } from 'lucide-react';
import { Cumpleanos } from '../types';
import { apiService } from '../services/api';
import { whatsappService } from '../utils/whatsapp';

interface FilterState {
  mes: string;
  dia: string;
  genero: string;
  celularValido: string;
  searchTerm: string;
}

const MESES = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
];

export const CumpleanosTab: React.FC = () => {
  const [cumpleanos, setCumpleanos] = useState<Cumpleanos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    mes: '',
    dia: '',
    genero: '',
    celularValido: '',
    searchTerm: ''
  });

  const loadCumpleanos = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getCumpleanos();
      setCumpleanos(data);
    } catch (err) {
      setError('Error al cargar los cumpleaños. Verifique la conexión.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCumpleanos();
  }, []);

  // Dynamic filter options based on data
  const filterOptions = useMemo(() => {
    const dias = [...new Set(cumpleanos.map(c => c.Dia))].sort((a, b) => a - b);
    const generos = [...new Set(cumpleanos.map(c => c.Genero))].sort();
    
    return { dias, generos };
  }, [cumpleanos]);

  // Filtered cumpleanos based on all filters
  const filteredCumpleanos = useMemo(() => {
    return cumpleanos.filter(cumple => {
      const matchesSearch = cumple.Paciente.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesMes = !filters.mes || cumple.Mes.toString() === filters.mes;
      const matchesDia = !filters.dia || cumple.Dia.toString() === filters.dia;
      const matchesGenero = !filters.genero || cumple.Genero === filters.genero;
      const matchesCelular = !filters.celularValido || cumple.Celular_valido === filters.celularValido;

      return matchesSearch && matchesMes && matchesDia && matchesGenero && matchesCelular;
    });
  }, [cumpleanos, filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      mes: '',
      dia: '',
      genero: '',
      celularValido: '',
      searchTerm: ''
    });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  const handleSendWhatsApp = (cumple: Cumpleanos) => {
    if (cumple.Celular_valido !== 'VERDADERO') {
      alert('El número de celular no es válido para este paciente.');
      return;
    }

    const message = whatsappService.generateCumpleanosMessage(
      cumple.Paciente,
      cumple.Genero
    );

    whatsappService.sendMessage(cumple.Celular, message);
  };

  const getCurrentMonth = () => {
    return new Date().getMonth() + 1;
  };

  const isCurrentMonth = (mes: number) => {
    return mes === getCurrentMonth();
  };

  const currentMonthBirthdays = filteredCumpleanos.filter(cumple => isCurrentMonth(cumple.Mes));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Cargando cumpleaños...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Stats */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <Gift className="w-7 h-7 mr-3 text-purple-600" />
              Cumpleaños de Pacientes
            </h2>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full shadow-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="font-medium">{filteredCumpleanos.length} cumpleaños encontrados</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full shadow-sm">
                <Gift className="w-4 h-4 text-purple-500" />
                <span>{currentMonthBirthdays.length} este mes</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full shadow-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{filteredCumpleanos.filter(c => c.Celular_valido === 'VERDADERO').length} números válidos</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                showFilters 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            
            <button
              onClick={loadCumpleanos}
              className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl shadow-md transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-purple-600" />
                Filtros Avanzados
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Búsqueda por Nombre
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre del paciente..."
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Month Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mes
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={filters.mes}
                    onChange={(e) => handleFilterChange('mes', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none bg-white"
                  >
                    <option value="">Todos los meses</option>
                    {MESES.map(mes => (
                      <option key={mes.value} value={mes.value}>{mes.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Day Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Día
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={filters.dia}
                    onChange={(e) => handleFilterChange('dia', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none bg-white"
                  >
                    <option value="">Todos los días</option>
                    {filterOptions.dias.map(dia => (
                      <option key={dia} value={dia.toString()}>{dia}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Gender Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Género
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={filters.genero}
                    onChange={(e) => handleFilterChange('genero', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none bg-white"
                  >
                    <option value="">Todos los géneros</option>
                    {filterOptions.generos.map(genero => (
                      <option key={genero} value={genero}>{genero}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone Validity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado del Celular
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={filters.celularValido}
                    onChange={(e) => handleFilterChange('celularValido', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none bg-white"
                  >
                    <option value="">Todos los estados</option>
                    <option value="VERDADERO">Números válidos</option>
                    <option value="FALSO">Números inválidos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Mostrando {filteredCumpleanos.length} de {cumpleanos.length} cumpleaños
              </div>
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
                <span>Limpiar filtros</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Current Month Birthdays - Premium Section */}
      {currentMonthBirthdays.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 rounded-2xl border border-purple-200 overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Gift className="w-6 h-6 mr-3" />
              🎉 Cumpleaños de Este Mes ({currentMonthBirthdays.length})
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {currentMonthBirthdays.map((cumple) => (
                <div key={cumple.fila_original_excel} className="group bg-white border-2 border-purple-200 rounded-2xl p-6 hover:shadow-2xl hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-purple-700 transition-colors">
                          🎂 {cumple.Paciente}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                            <Calendar className="w-3 h-3 mr-1" />
                            {cumple.Cumple}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            cumple.Celular_valido === 'VERDADERO'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {cumple.Celular_valido === 'VERDADERO' ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            {cumple.Celular_valido === 'VERDADERO' ? 'Válido' : 'Inválido'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-3 text-purple-600" />
                        <span>{cumple.Genero}</span>
                      </div>
                      {cumple.Celular && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-3 text-purple-600" />
                          <span className="font-mono">{cumple.Celular}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleSendWhatsApp(cumple)}
                      disabled={cumple.Celular_valido !== 'VERDADERO'}
                      className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        cumple.Celular_valido === 'VERDADERO'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>🎉 Enviar Felicitación</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Birthdays */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Calendar className="w-6 h-6 mr-3 text-teal-600" />
            Todos los Cumpleaños ({filteredCumpleanos.length})
          </h2>

          {filteredCumpleanos.length === 0 ? (
            <div className="text-center py-16">
              <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No se encontraron cumpleaños</p>
              <p className="text-gray-500">Intenta ajustar los filtros para ver más resultados</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCumpleanos.map((cumple) => (
                <div key={cumple.fila_original_excel} className={`border rounded-xl p-4 hover:shadow-lg transition-all duration-200 ${
                  isCurrentMonth(cumple.Mes) 
                    ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-gray-900 text-sm flex items-center">
                        {isCurrentMonth(cumple.Mes) && '🎂 '}
                        {cumple.Paciente}
                      </h4>
                      {cumple.Celular_valido === 'VERDADERO' && (
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {cumple.Cumple}
                      </div>
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {cumple.Genero}
                      </div>
                      {isCurrentMonth(cumple.Mes) && (
                        <div className="text-purple-600 font-semibold">
                          ✨ ¡Este mes!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};