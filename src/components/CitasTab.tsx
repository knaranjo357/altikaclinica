import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Calendar, Clock, User, Activity, Phone, MessageCircle, Search, RefreshCw, Filter, X, CheckCircle, XCircle, CalendarDays, Grid, List, ArrowUpDown } from 'lucide-react';
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

type ViewMode = 'cards' | 'table' | 'agenda';
type SortField = 'Fecha' | 'Paciente' | 'Hora' | 'Odontologo';
type SortOrder = 'asc' | 'desc';

const LOGO_URL = 'https://altikastudiodental.com/wp-content/uploads/2025/06/Recurso-18@300x.png';

export const CitasTab: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [sortField, setSortField] = useState<SortField>('Fecha');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    fecha: '',
    odontologo: '',
    actividad: '',
    celularValido: '',
    searchTerm: ''
  });

  // anchors para scroll-to-top
  const topAnchorRef = useRef<HTMLDivElement | null>(null);

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

  // scroll al inicio al montar
  useEffect(() => {
    topAnchorRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
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

  // Sorted citas
  const sortedCitas = useMemo(() => {
    return [...filteredCitas].sort((a, b) => {
      let aValue: string | number = a[sortField];
      let bValue: string | number = b[sortField];
      
      // Special handling for date and time
      if (sortField === 'Fecha') {
        aValue = new Date(a.Fecha + ' ' + a.Hora).getTime();
        bValue = new Date(b.Fecha + ' ' + b.Hora).getTime();
      } else if (sortField === 'Hora') {
        aValue = a.Hora;
        bValue = b.Hora;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredCitas, sortField, sortOrder]);

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
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

  // helpers para UX: scroll al tope cuando cambian vista o se vuelven a mostrar filtros
  const scrollToTop = (smooth = true) => {
    if (topAnchorRef.current) {
      topAnchorRef.current.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' });
    } else {
      window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  const onChangeViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    scrollToTop(); // mostrar desde el inicio
  };

  const onToggleFilters = () => {
    setShowFilters(prev => !prev);
    // al abrir filtros, sube para que queden visibles
    setTimeout(() => scrollToTop(), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16" style={{ fontFamily: '"Cera bold", Sans-serif' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-700 text-lg">Cargando citas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8" style={{ fontFamily: '"Cera bold", Sans-serif' }}>
      {/* Anchor para scroll-to-top */}
      <div ref={topAnchorRef} />

      {/* Sticky: Header con stats + controles */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-black/10">
        {/* Header con Stats */}
        <div className="max-w-7xl mx-auto px-3 sm:px-0 py-3 sm:py-4">
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-black/10">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start lg:items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-2 flex items-center flex-wrap gap-2">
                  <span className="inline-flex items-center justify-center rounded-md overflow-hidden">
                    <img
                      src={LOGO_URL}
                      alt="Altika Studio Dental"
                      className="h-7 sm:h-8 w-auto bg-black p-1 rounded"
                    />
                  </span>
                  <Calendar className="w-6 h-6 sm:w-7 sm:h-7" />
                  <span className="truncate">Citas Programadas</span>
                </h2>

                <div className="flex flex-wrap gap-2 sm:gap-3 text-sm">
                  <div className="filter-chip">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <span className="font-medium">&nbsp;{filteredCitas.length} citas</span>
                  </div>
                  <div className="filter-chip">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>&nbsp;{filteredCitas.filter(c => c.Celular_valido === 'VERDADERO').length} válidos</span>
                  </div>
                  <div className="filter-chip">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>&nbsp;{filteredCitas.filter(c => c.Celular_valido !== 'VERDADERO').length} inválidos</span>
                  </div>
                </div>
              </div>

              {/* Controles: responsive y sticky */}
              <div className="w-full lg:w-auto flex items-center gap-2 sm:gap-3">
                <button
                  onClick={onToggleFilters}
                  className={`relative flex-1 lg:flex-none justify-center items-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all border ${
                    showFilters
                      ? 'bg-black text-white border-black shadow-lg'
                      : 'bg-white text-black hover:bg-gray-50 border-black/10 shadow-sm'
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
                  onClick={loadCitas}
                  className="flex-1 lg:flex-none justify-center inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white hover:bg-gray-50 text-black rounded-xl shadow-sm border border-black/10 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden xs:inline">Actualizar</span>
                </button>

                {/* Selector de vista (cards/table/agenda) scrollable en mobile */}
                <div className="flex items-center bg-white rounded-xl shadow-sm overflow-x-auto border border-black/10">
                  <button
                    onClick={() => onChangeViewMode('cards')}
                    className={`px-3 py-2 shrink-0 ${
                      viewMode === 'cards' ? 'bg-black text-white' : 'text-black hover:bg-gray-50'
                    }`}
                    aria-pressed={viewMode === 'cards'}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onChangeViewMode('table')}
                    className={`px-3 py-2 shrink-0 ${
                      viewMode === 'table' ? 'bg-black text-white' : 'text-black hover:bg-gray-50'
                    }`}
                    aria-pressed={viewMode === 'table'}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onChangeViewMode('agenda')}
                    className={`px-3 py-2 shrink-0 ${
                      viewMode === 'agenda' ? 'bg-black text-white' : 'text-black hover:bg-gray-50'
                    }`}
                    aria-pressed={viewMode === 'agenda'}
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Panel de filtros: sticky también cuando está abierto (altura acotada para mobile) */}
          {showFilters && (
            <div className="mt-3 sm:mt-4 sticky top-[68px] sm:top-[76px] z-20">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-black/10 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-black/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-semibold text-black flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      Filtros Avanzados
                    </h3>
                    <button
                      onClick={onToggleFilters}
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
                      <label className="label">Búsqueda General</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Buscar paciente, odontólogo, actividad..."
                          value={filters.searchTerm}
                          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                          className="input pl-10"
                        />
                      </div>
                    </div>

                    {/* Date Filter */}
                    <div>
                      <label className="label">Fecha</label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          value={filters.fecha}
                          onChange={(e) => handleFilterChange('fecha', e.target.value)}
                          className="select pl-10"
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
                      <label className="label">Odontólogo</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          value={filters.odontologo}
                          onChange={(e) => handleFilterChange('odontologo', e.target.value)}
                          className="select pl-10"
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
                      <label className="label">Actividad</label>
                      <div className="relative">
                        <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          value={filters.actividad}
                          onChange={(e) => handleFilterChange('actividad', e.target.value)}
                          className="select pl-10"
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
                    <div className="text-sm text-gray-700">
                      Mostrando {filteredCitas.length} de {citas.length} citas
                    </div>
                    <button
                      onClick={clearFilters}
                      className="btn-outline"
                    >
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

      {/* Results */}
      <div className="bg-white rounded-2xl shadow-lg border border-black/10">
        <div className="p-4 sm:p-6">
          {sortedCitas.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-700 text-lg mb-2">No se encontraron citas</p>
              <p className="text-gray-600">Intenta ajustar los filtros para ver más resultados</p>
            </div>
          ) : (
            <>
              {/* Cards View */}
              {viewMode === 'cards' && (
                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {sortedCitas.map((cita) => (
                    <div key={cita.fila_original_excel} className="group bg-gradient-to-br from-white to-gray-50 border border-black/10 rounded-2xl p-5 sm:p-6 hover:shadow-xl hover:border-black/20 transition-all duration-300">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-black text-base sm:text-lg mb-1 group-hover:opacity-80 transition-opacity truncate">
                              {cita.Paciente}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                                cita.Celular_valido === 'VERDADERO'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : 'bg-red-100 text-red-800 border-red-200'
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

                        <div className="space-y-3 text-sm">
                          <div className="flex items-center text-gray-800">
                            <Calendar className="w-4 h-4 mr-3 text-black" />
                            <span className="font-medium">{cita.Fecha}</span>
                          </div>
                          <div className="flex items-center text-gray-800">
                            <Clock className="w-4 h-4 mr-3 text-black" />
                            <span className="font-medium">{cita.Hora}</span>
                          </div>
                          <div className="flex items-center text-gray-800">
                            <User className="w-4 h-4 mr-3 text-black" />
                            <span className="text-sm">{cita.Odontologo}</span>
                          </div>
                          <div className="flex items-center text-gray-800">
                            <Activity className="w-4 h-4 mr-3 text-black" />
                            <span className="text-sm font-medium bg-black/5 px-2 py-1 rounded-lg">{cita.Actividad}</span>
                          </div>
                          {cita.Celular && (
                            <div className="flex items-center text-gray-800">
                              <Phone className="w-4 h-4 mr-3 text-black" />
                              <span className="text-sm font-mono">{cita.Celular}</span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleSendWhatsApp(cita)}
                          disabled={cita.Celular_valido !== 'VERDADERO'}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                            cita.Celular_valido === 'VERDADERO'
                              ? 'bg-black hover:bg-black/90 text-white shadow-lg hover:shadow-xl'
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

              {/* Table View */}
              {viewMode === 'table' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-black/10">
                        <th className="text-left py-3 sm:py-4 px-2">
                          <button
                            onClick={() => handleSort('Paciente')}
                            className="flex items-center gap-1 font-semibold text-black hover:bg-black hover:text-white px-2 py-1 rounded transition-colors"
                          >
                            <span>Paciente</span>
                            <ArrowUpDown className="w-4 h-4" />
                          </button>
                        </th>
                        <th className="text-left py-3 sm:py-4 px-2">
                          <button
                            onClick={() => handleSort('Fecha')}
                            className="flex items-center gap-1 font-semibold text-black hover:bg-black hover:text-white px-2 py-1 rounded transition-colors"
                          >
                            <span>Fecha</span>
                            <ArrowUpDown className="w-4 h-4" />
                          </button>
                        </th>
                        <th className="text-left py-3 sm:py-4 px-2">
                          <button
                            onClick={() => handleSort('Hora')}
                            className="flex items-center gap-1 font-semibold text-black hover:bg-black hover:text-white px-2 py-1 rounded transition-colors"
                          >
                            <span>Hora</span>
                            <ArrowUpDown className="w-4 h-4" />
                          </button>
                        </th>
                        <th className="text-left py-3 sm:py-4 px-2">
                          <button
                            onClick={() => handleSort('Odontologo')}
                            className="flex items-center gap-1 font-semibold text-black hover:bg-black hover:text-white px-2 py-1 rounded transition-colors"
                          >
                            <span>Odontólogo</span>
                            <ArrowUpDown className="w-4 h-4" />
                          </button>
                        </th>
                        <th className="text-left py-3 sm:py-4 px-2">Actividad</th>
                        <th className="text-left py-3 sm:py-4 px-2">Estado</th>
                        <th className="text-left py-3 sm:py-4 px-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedCitas.map((cita) => (
                        <tr key={cita.fila_original_excel} className="border-b border-black/5 hover:bg-gray-50 transition-colors">
                          <td className="py-3 sm:py-4 px-2 font-medium text-black">{cita.Paciente}</td>
                          <td className="py-3 sm:py-4 px-2 text-gray-800">{cita.Fecha}</td>
                          <td className="py-3 sm:py-4 px-2 text-gray-800">{cita.Hora}</td>
                          <td className="py-3 sm:py-4 px-2 text-gray-800">{cita.Odontologo}</td>
                          <td className="py-3 sm:py-4 px-2">
                            <span className="bg-black/5 text-black px-2 py-1 rounded-lg text-sm">
                              {cita.Actividad}
                            </span>
                          </td>
                          <td className="py-3 sm:py-4 px-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                              cita.Celular_valido === 'VERDADERO'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {cita.Celular_valido === 'VERDADERO' ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <XCircle className="w-3 h-3 mr-1" />
                              )}
                              {cita.Celular_valido === 'VERDADERO' ? 'Válido' : 'Inválido'}
                            </span>
                          </td>
                          <td className="py-3 sm:py-4 px-2">
                            <button
                              onClick={() => handleSendWhatsApp(cita)}
                              disabled={cita.Celular_valido !== 'VERDADERO'}
                              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                                cita.Celular_valido === 'VERDADERO'
                                  ? 'bg-black hover:bg-black/90 text-white'
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>Enviar</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Agenda View */}
              {viewMode === 'agenda' && (
                <div className="space-y-6">
                  {Object.entries(
                    sortedCitas.reduce((acc, cita) => {
                      if (!acc[cita.Fecha]) acc[cita.Fecha] = [];
                      acc[cita.Fecha].push(cita);
                      return acc;
                    }, {} as Record<string, Cita[]>)
                  ).map(([fecha, citasDelDia]) => (
                    <div key={fecha} className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-5 sm:p-6 border border-black/10">
                      <h3 className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4 flex items-center gap-3">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                        {fecha} ({citasDelDia.length} citas)
                      </h3>
                      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {citasDelDia
                          .sort((a, b) => a.Hora.localeCompare(b.Hora))
                          .map((cita) => (
                            <div
                              key={cita.fila_original_excel}
                              onClick={() => setSelectedCita(cita)}
                              className="bg-white rounded-xl p-4 border border-black/10 hover:border-black/30 hover:shadow-lg transition-all duration-200 cursor-pointer"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-black text-lg">{cita.Hora}</span>
                                <span className={`w-3 h-3 rounded-full ${
                                  cita.Celular_valido === 'VERDADERO' ? 'bg-green-500' : 'bg-red-500'
                                }`}></span>
                              </div>
                              <h4 className="font-semibold text-black mb-1 truncate">{cita.Paciente}</h4>
                              <p className="text-sm text-gray-700 mb-1 truncate">{cita.Odontologo}</p>
                              <p className="text-sm bg-black/5 text-black px-2 py-1 rounded-lg inline-block">
                                {cita.Actividad}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Cita Detail Modal */}
      {selectedCita && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-black/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-black">Detalles de la Cita</h3>
              <button
                onClick={() => setSelectedCita(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-black text-lg">{selectedCita.Paciente}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                    selectedCita.Celular_valido === 'VERDADERO'
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : 'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    {selectedCita.Celular_valido === 'VERDADERO' ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {selectedCita.Celular_valido === 'VERDADERO' ? 'Número Válido' : 'Número Inválido'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-gray-800">
                  <Calendar className="w-4 h-4 mr-2 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Fecha</p>
                    <p className="font-medium">{selectedCita.Fecha}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-800">
                  <Clock className="w-4 h-4 mr-2 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Hora</p>
                    <p className="font-medium">{selectedCita.Hora}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center text-gray-800">
                <User className="w-4 h-4 mr-2 text-black" />
                <div>
                  <p className="text-xs text-gray-500">Odontólogo</p>
                  <p className="font-medium">{selectedCita.Odontologo}</p>
                </div>
              </div>
              
              <div className="flex items-center text-gray-800">
                <Activity className="w-4 h-4 mr-2 text-black" />
                <div>
                  <p className="text-xs text-gray-500">Actividad</p>
                  <p className="font-medium bg-black/5 px-2 py-1 rounded-lg inline-block">{selectedCita.Actividad}</p>
                </div>
              </div>
              
              {selectedCita.Celular && (
                <div className="flex items-center text-gray-800">
                  <Phone className="w-4 h-4 mr-2 text-black" />
                  <div>
                    <p className="text-xs text-gray-500">Celular</p>
                    <p className="font-mono">{selectedCita.Celular}</p>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => {
                  handleSendWhatsApp(selectedCita);
                  setSelectedCita(null);
                }}
                disabled={selectedCita.Celular_valido !== 'VERDADERO'}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                  selectedCita.Celular_valido === 'VERDADERO'
                    ? 'bg-black hover:bg-black/90 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Enviar Recordatorio por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
