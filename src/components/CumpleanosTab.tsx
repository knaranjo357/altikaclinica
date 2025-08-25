import React, { useState, useEffect, useMemo, useRef } from 'react';
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

  // Anchor para scroll-to-top (al montar y al abrir filtros)
  const topAnchorRef = useRef<HTMLDivElement | null>(null);
  const scrollToTop = (smooth = true) => {
    if (topAnchorRef.current) {
      topAnchorRef.current.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' });
    } else {
      window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
    }
  };

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

  // Al montar (útil cuando cambias de tab) sube al inicio
  useEffect(() => {
    scrollToTop(false);
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
    const message = whatsappService.generateCumpleanosMessage(cumple.Paciente, cumple.Genero);
    whatsappService.sendMessage(cumple.Celular, message);
  };

  const getCurrentMonth = () => new Date().getMonth() + 1;
  const isCurrentMonth = (mes: number) => mes === getCurrentMonth();
  const currentMonthBirthdays = filteredCumpleanos.filter(cumple => isCurrentMonth(cumple.Mes));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16" style={{ fontFamily: '"Cera bold", Sans-serif' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-800 text-lg">Cargando cumpleaños...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8" style={{ fontFamily: '"Cera bold", Sans-serif' }}>
      <div ref={topAnchorRef} />

      {/* Sticky header + controles */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-black/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-0 py-3 sm:py-4">
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-black/10">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start lg:items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-2 flex items-center gap-2">
                  <Gift className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
                  Cumpleaños de Pacientes
                </h2>

                <div className="flex flex-wrap gap-2 sm:gap-3 text-sm">
                  <div className="filter-chip">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <span className="font-medium">&nbsp;{filteredCumpleanos.length} cumpleaños</span>
                  </div>
                  <div className="filter-chip">
                    <Gift className="w-4 h-4" />
                    <span>&nbsp;{currentMonthBirthdays.length} este mes</span>
                  </div>
                  <div className="filter-chip">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>&nbsp;{filteredCumpleanos.filter(c => c.Celular_valido === 'VERDADERO').length} válidos</span>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-auto flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => { setShowFilters(prev => !prev); setTimeout(() => scrollToTop(), 0); }}
                  className={`relative flex-1 lg:flex-none justify-center items-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all border ${
                    showFilters ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-black hover:bg-gray-50 border-black/10 shadow-sm'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden xs:inline">Filtros</span>
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={loadCumpleanos}
                  className="flex-1 lg:flex-none inline-flex justify-center items-center gap-2 px-3 sm:px-4 py-2 bg-white hover:bg-gray-50 text-black rounded-xl shadow-sm border border-black/10 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden xs:inline">Actualizar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Panel de filtros sticky bajo el header */}
          {showFilters && (
            <div className="mt-3 sm:mt-4 sticky top-[68px] sm:top-[76px] z-20">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-black/10 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-black/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-semibold text-black flex items-center gap-2">
                      <Filter className="w-5 h-5 text-black" />
                      Filtros Avanzados
                    </h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      aria-label="Cerrar filtros"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-6 max-h-[65vh] overflow-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    {/* Search */}
                    <div className="xl:col-span-2">
                      <label className="label">Búsqueda por Nombre</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Buscar por nombre del paciente..."
                          value={filters.searchTerm}
                          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                          className="input pl-10"
                        />
                      </div>
                    </div>

                    {/* Month Filter */}
                    <div>
                      <label className="label">Mes</label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          value={filters.mes}
                          onChange={(e) => handleFilterChange('mes', e.target.value)}
                          className="select pl-10"
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
                      <label className="label">Día</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          value={filters.dia}
                          onChange={(e) => handleFilterChange('dia', e.target.value)}
                          className="select pl-10"
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
                      <label className="label">Género</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          value={filters.genero}
                          onChange={(e) => handleFilterChange('genero', e.target.value)}
                          className="select pl-10"
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
                      <label className="label">Estado del Celular</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          value={filters.celularValido}
                          onChange={(e) => handleFilterChange('celularValido', e.target.value)}
                          className="select pl-10"
                        >
                          <option value="">Todos los estados</option>
                          <option value="VERDADERO">Números válidos</option>
                          <option value="FALSO">Números inválidos</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Filter Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-black/10">
                    <div className="text-sm text-gray-800">
                      Mostrando {filteredCumpleanos.length} de {cumpleanos.length} cumpleaños
                    </div>
                    <button onClick={clearFilters} className="btn-outline">
                      <X className="w-4 h-4" />
                      <span>Limpiar filtros</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Current Month Birthdays - Premium Section */}
      {currentMonthBirthdays.length > 0 && (
        <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl border border-black/10 overflow-hidden shadow-xl">
          <div className="bg-black px-6 py-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
              🎉 Cumpleaños de Este Mes ({currentMonthBirthdays.length})
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {currentMonthBirthdays.map((cumple) => (
                <div key={cumple.fila_original_excel} className="group bg-white border-2 border-black/10 rounded-2xl p-5 sm:p-6 hover:shadow-2xl hover:border-black/20 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-black text-base sm:text-lg mb-2 group-hover:opacity-80 transition-opacity truncate">
                          🎂 {cumple.Paciente}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-black/5 text-black border border-black/10">
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

                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-3 text-black" />
                        <span>{cumple.Genero}</span>
                      </div>
                      {cumple.Celular && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-3 text-black" />
                          <span className="font-mono">{cumple.Celular}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleSendWhatsApp(cumple)}
                      disabled={cumple.Celular_valido !== 'VERDADERO'}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                        cumple.Celular_valido === 'VERDADERO'
                          ? 'bg-black hover:bg-black/90 text-white shadow-lg hover:shadow-xl'
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
    </div>
  );
};
