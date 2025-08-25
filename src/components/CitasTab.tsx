import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, User, Activity, Phone, MessageCircle, Search, RefreshCw, Filter, X, CheckCircle, XCircle, CalendarDays } from 'lucide-react';
import { Cita } from '../types';
import { apiService } from '../services/api';
import { whatsappService } from '../utils/whatsapp';

interface FilterState {
  fecha: string;
  odontologo: string;
  actividad: string;
  celularValido: string;
  searchTerm: string;
}

export const CitasTab: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    fecha: '',
    odontologo: '',
    actividad: '',
    celularValido: '',
    searchTerm: ''
  });

  const loadCitas = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getCitas();
      setCitas(data);
    } catch (err) {
      setError('Error al cargar las citas. Verifique la conexión.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCitas();
  }, []);

  // Dynamic filter options based on data
  const filterOptions = useMemo(() => {
    const fechas = [...new Set(citas.map(c => c.Fecha))].sort();
    const odontologos = [...new Set(citas.map(c => c.Odontologo))].sort();
    const actividades = [...new Set(citas.map(c => c.Actividad))].sort();
    
    return { fechas, odontologos, actividades };
  }, [citas]);

  // Filtered citas based on all filters
  const filteredCitas = useMemo(() => {
    return citas.filter(cita => {
      const matchesSearch = cita.Paciente.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           cita.Odontologo.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           cita.Actividad.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesFecha = !filters.fecha || cita.Fecha === filters.fecha;
      const matchesOdontologo = !filters.odontologo || cita.Odontologo === filters.odontologo;
      const matchesActividad = !filters.actividad || cita.Actividad === filters.actividad;
      const matchesCelular = !filters.celularValido || cita.Celular_valido === filters.celularValido;

      return matchesSearch && matchesFecha && matchesOdontologo && matchesActividad && matchesCelular;
    });
  }, [citas, filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      fecha: '',
      odontologo: '',
      actividad: '',
      celularValido: '',
      searchTerm: ''
    });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  const handleSendWhatsApp = (cita: Cita) => {
    if (cita.Celular_valido !== 'VERDADERO') {
      alert('El número de celular no es válido para este paciente.');
      return;
    }

    const message = whatsappService.generateCitaMessage(
      cita.Paciente,
      cita.Fecha,
      cita.Hora,
      cita.Actividad
    );

    whatsappService.sendMessage(cita.Celular, message);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Cargando citas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Stats */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-6 border border-teal-100">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <Calendar className="w-7 h-7 mr-3 text-teal-600" />
              Citas Programadas
            </h2>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full shadow-sm">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <span className="font-medium">{filteredCitas.length} citas encontradas</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full shadow-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{filteredCitas.filter(c => c.Celular_valido === 'VERDADERO').length} números válidos</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full shadow-sm">
                <XCircle className="w-4 h-4 text-red-500" />
                <span>{filteredCitas.filter(c => c.Celular_valido !== 'VERDADERO').length} números inválidos</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                showFilters 
                  ? 'bg-teal-600 text-white shadow-lg' 
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
              onClick={loadCitas}
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
                <Filter className="w-5 h-5 mr-2 text-teal-600" />
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
                  Búsqueda General
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar paciente, odontólogo, actividad..."
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={filters.fecha}
                    onChange={(e) => handleFilterChange('fecha', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all appearance-none bg-white"
                  >
                    <option value="">Todas las fechas</option>
                    {filterOptions.fechas.map(fecha => (
                      <option key={fecha} value={fecha}>{fecha}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Odontologo Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Odontólogo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={filters.odontologo}
                    onChange={(e) => handleFilterChange('odontologo', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all appearance-none bg-white"
                  >
                    <option value="">Todos los odontólogos</option>
                    {filterOptions.odontologos.map(odontologo => (
                      <option key={odontologo} value={odontologo}>{odontologo}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Activity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actividad
                </label>
                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={filters.actividad}
                    onChange={(e) => handleFilterChange('actividad', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all appearance-none bg-white"
                  >
                    <option value="">Todas las actividades</option>
                    {filterOptions.actividades.map(actividad => (
                      <option key={actividad} value={actividad}>{actividad}</option>
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
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all appearance-none bg-white"
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
                Mostrando {filteredCitas.length} de {citas.length} citas
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

      {/* Results */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6">
          {filteredCitas.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No se encontraron citas</p>
              <p className="text-gray-500">Intenta ajustar los filtros para ver más resultados</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCitas.map((cita) => (
                <div key={cita.fila_original_excel} className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-teal-200 transition-all duration-300">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-teal-700 transition-colors">
                          {cita.Paciente}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            cita.Celular_valido === 'VERDADERO'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {cita.Celular_valido === 'VERDADERO' ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            {cita.Celular_valido === 'VERDADERO' ? 'Válido' : 'Inválido'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700">
                        <Calendar className="w-4 h-4 mr-3 text-teal-600" />
                        <span className="font-medium">{cita.Fecha}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Clock className="w-4 h-4 mr-3 text-teal-600" />
                        <span className="font-medium">{cita.Hora}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <User className="w-4 h-4 mr-3 text-teal-600" />
                        <span className="text-sm">{cita.Odontologo}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Activity className="w-4 h-4 mr-3 text-teal-600" />
                        <span className="text-sm font-medium bg-teal-50 px-2 py-1 rounded-lg">{cita.Actividad}</span>
                      </div>
                      {cita.Celular && (
                        <div className="flex items-center text-gray-700">
                          <Phone className="w-4 h-4 mr-3 text-teal-600" />
                          <span className="text-sm font-mono">{cita.Celular}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleSendWhatsApp(cita)}
                      disabled={cita.Celular_valido !== 'VERDADERO'}
                      className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        cita.Celular_valido === 'VERDADERO'
                          ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Enviar Recordatorio</span>
                    </button>
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