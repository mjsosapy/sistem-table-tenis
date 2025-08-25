import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Award, 
  Play, 
  Pause, 
  Edit, 
  Trash2,
  ArrowLeft,
  BarChart3,
  Settings,
  History,
  Clock,
  CheckCircle,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { api } from '../utils/api';
import BracketView from '../components/tournaments/BracketView';

const TournamentDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [matchFilter, setMatchFilter] = useState('all'); // 'all', 'finalizado', 'en_curso', 'pendiente'

  const { data: tournamentData, isLoading, error } = useQuery(
    ['tournament', id],
    async () => {
      const response = await api.get(`/tournaments/${id}`);
      return response.data;
    },
    {
      enabled: !!id,
    }
  );

  const tournament = tournamentData?.tournament;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente': return 'bg-gray-100 text-gray-800';
      case 'En curso': return 'bg-green-100 text-green-800';
      case 'Pausado': return 'bg-yellow-100 text-yellow-800';
      case 'Finalizado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Pendiente': return 'Borrador';
      case 'En curso': return 'Activo';
      case 'Pausado': return 'Pausado';
      case 'Finalizado': return 'Completado';
      default: return status || 'Desconocido';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'Eliminación directa': return 'Eliminación Simple';
      case 'Doble eliminación': return 'Doble Eliminación';
      case 'Round Robin': return 'Todos contra Todos';
      case 'Grupos + Eliminación': return 'Grupos + Eliminación';
      default: return type;
    }
  };

  const formatDateTime = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando torneo...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar el torneo</h3>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🏓</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Torneo no encontrado</h3>
          <p className="text-gray-600">El torneo que buscas no existe.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{tournament.nombre}</h1>
            <p className="text-gray-600">{tournament.descripcion || 'Sin descripción'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {tournament.estado === 'Pendiente' && (
            <button
              onClick={() => {
                // Aquí deberías abrir el modal de sorteo manual
                console.log('Abrir sorteo manual para torneo:', tournament.id);
              }}
              className="inline-flex items-center px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors border border-purple-200"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sorteo Manual
            </button>
          )}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tournament.estado)}`}>
            {getStatusLabel(tournament.estado)}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Fecha de Inicio</p>
              <p className="text-sm font-bold text-gray-900">{formatDateTime(tournament.fechaInicio)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Jugadores</p>
              <p className="text-sm font-bold text-gray-900">{tournament.maxJugadores} máximo</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tipo</p>
              <p className="text-sm font-bold text-gray-900">{getTypeLabel(tournament.tipo)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Formato</p>
              <p className="text-sm font-bold text-gray-900">Al mejor de {tournament.setsPorPartido} sets (11 puntos por set)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Resumen
            </button>
            <button
              onClick={() => setActiveTab('bracket')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bracket'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Trophy className="w-4 h-4 inline mr-2" />
              Bracket
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <History className="w-4 h-4 inline mr-2" />
              Historial
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Configuración
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Torneo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nombre</label>
                      <p className="mt-1 text-sm text-gray-900">{tournament.nombre}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Descripción</label>
                      <p className="mt-1 text-sm text-gray-900">{tournament.descripcion || 'Sin descripción'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo de Torneo</label>
                      <p className="mt-1 text-sm text-gray-900">{getTypeLabel(tournament.tipo)}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDateTime(tournament.fechaInicio)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDateTime(tournament.fechaFin)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Jugadores Máximos</label>
                      <p className="mt-1 text-sm text-gray-900">{tournament.maxJugadores}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Formato de Juego</label>
                      <p className="text-sm font-bold text-gray-900">Al mejor de {tournament.setsPorPartido} sets (11 puntos por set)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress indicators */}
              {tournament.estado !== 'Pendiente' && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Progreso del Torneo</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Ronda Actual</span>
                        <span>{tournament.currentRound || 0} / {tournament.totalRounds || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${tournament.totalRounds ? ((tournament.currentRound || 0) / tournament.totalRounds) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bracket' && (
            <BracketView tournamentId={id} />
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Partidos</h3>
                
                {/* Estadísticas del torneo */}
                {tournament.matches && tournament.matches.length > 0 && (
                  <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                      Estadísticas del Torneo
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {tournament.matches.length}
                        </div>
                        <div className="text-sm text-gray-600">Total Partidos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {tournament.matches.filter(m => m.estado === 'Finalizado').length}
                        </div>
                        <div className="text-sm text-gray-600">Partidos Finalizados</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {tournament.matches.filter(m => m.estado === 'En curso').length}
                        </div>
                        <div className="text-sm text-gray-600">En Progreso</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">
                          {tournament.matches.filter(m => m.estado === 'Pendiente').length}
                        </div>
                        <div className="text-sm text-gray-600">Pendientes</div>
                      </div>
                    </div>
                    
                    {/* Progreso del torneo */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progreso del Torneo</span>
                        <span>
                          {Math.round((tournament.matches.filter(m => m.estado === 'Finalizado').length / tournament.matches.length) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(tournament.matches.filter(m => m.estado === 'Finalizado').length / tournament.matches.length) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Filtros */}
                {tournament.matches && tournament.matches.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => setMatchFilter('all')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        matchFilter === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Todos ({tournament.matches.length})
                    </button>
                    <button
                      onClick={() => setMatchFilter('finalizado')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        matchFilter === 'finalizado'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Finalizados ({tournament.matches.filter(m => m.estado === 'Finalizado').length})
                    </button>
                    <button
                      onClick={() => setMatchFilter('en_curso')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        matchFilter === 'en_curso'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      En Progreso ({tournament.matches.filter(m => m.estado === 'En curso').length})
                    </button>
                    <button
                      onClick={() => setMatchFilter('pendiente')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        matchFilter === 'pendiente'
                          ? 'bg-gray-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Pendientes ({tournament.matches.filter(m => m.estado === 'Pendiente').length})
                    </button>
                  </div>
                )}
                
                {tournament.matches && tournament.matches.length > 0 ? (
                  <div className="space-y-4">
                    {tournament.matches
                      .filter(match => {
                        if (matchFilter === 'all') return true;
                        if (matchFilter === 'finalizado') return match.estado === 'Finalizado';
                        if (matchFilter === 'en_curso') return match.estado === 'En curso';
                        if (matchFilter === 'pendiente') return match.estado === 'Pendiente';
                        return true;
                      })
                      .map((match, index) => (
                      <div key={match.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        {/* Header del partido */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-500">Ronda {match.ronda}</span>
                              {match.fase && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  {match.fase}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {match.estado === 'Finalizado' && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                              {match.estado === 'En curso' && (
                                <Clock className="w-4 h-4 text-yellow-600" />
                              )}
                              {match.estado === 'Pendiente' && (
                                <Clock className="w-4 h-4 text-gray-400" />
                              )}
                              <span className={`text-sm font-medium ${
                                match.estado === 'Finalizado' ? 'text-green-600' :
                                match.estado === 'En curso' ? 'text-yellow-600' :
                                'text-gray-400'
                              }`}>
                                {match.estado}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDateTime(match.updatedAt || match.createdAt)}
                          </div>
                        </div>

                        {/* Jugadores */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                          <div className={`p-4 rounded-lg border-2 ${
                            match.ganadorId === match.jugador1Id 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <User className="w-5 h-5 text-blue-600" />
                                <span className="font-medium text-gray-900">
                                  {match.jugador1?.nombre || 'TBD'}
                                </span>
                              </div>
                              {match.ganadorId === match.jugador1Id && (
                                <Trophy className="w-5 h-5 text-yellow-500" />
                              )}
                            </div>
                          </div>

                          <div className={`p-4 rounded-lg border-2 ${
                            match.ganadorId === match.jugador2Id 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <User className="w-5 h-5 text-blue-600" />
                                <span className="font-medium text-gray-900">
                                  {match.jugador2?.nombre || 'TBD'}
                                </span>
                              </div>
                              {match.ganadorId === match.jugador2Id && (
                                <Trophy className="w-5 h-5 text-yellow-500" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Resultado */}
                        {match.estado === 'Finalizado' && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-center">
                              <h4 className="text-lg font-bold text-gray-900 mb-2">Resultado Final</h4>
                              <div className="flex items-center justify-center space-x-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-blue-600">{match.setsJ1 || 0}</div>
                                  <div className="text-sm text-gray-600">{match.jugador1?.nombre}</div>
                                </div>
                                <div className="text-xl font-bold text-gray-400">vs</div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-blue-600">{match.setsJ2 || 0}</div>
                                  <div className="text-sm text-gray-600">{match.jugador2?.nombre}</div>
                                </div>
                              </div>
                              {match.ganador && (
                                <div className="mt-3 flex items-center justify-center space-x-2">
                                  <Trophy className="w-5 h-5 text-yellow-500" />
                                  <span className="text-sm font-medium text-gray-700">
                                    Ganador: {match.ganador.nombre}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Información de Sets */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Detalle de Sets</h5>
                              {match.sets && match.sets.length > 0 ? (
                                <div className="space-y-4">
                                  {/* Estadísticas de sets */}
                                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                      <div>
                                        <div className="text-lg font-bold text-blue-600">{match.setsJ1}</div>
                                        <div className="text-xs text-gray-600">Sets ganados por {match.jugador1?.nombre}</div>
                                      </div>
                                      <div>
                                        <div className="text-lg font-bold text-gray-600">{match.sets.length}</div>
                                        <div className="text-xs text-gray-600">Total de sets</div>
                                      </div>
                                      <div>
                                        <div className="text-lg font-bold text-blue-600">{match.setsJ2}</div>
                                        <div className="text-xs text-gray-600">Sets ganados por {match.jugador2?.nombre}</div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Lista de sets individuales */}
                                  <div className="space-y-2">
                                    {match.sets.map((set, setIndex) => (
                                      <div key={set.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-700">
                                              Set {set.numeroSet}
                                            </span>
                                            {set.ganadorId === match.jugador1Id && (
                                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                Ganó {match.jugador1?.nombre}
                                              </span>
                                            )}
                                            {set.ganadorId === match.jugador2Id && (
                                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                Ganó {match.jugador2?.nombre}
                                              </span>
                                            )}
                                          </div>
                                          <span className={`text-xs px-2 py-1 rounded-full ${
                                            set.estado === 'Finalizado' 
                                              ? 'bg-green-100 text-green-800' 
                                              : 'bg-gray-100 text-gray-600'
                                          }`}>
                                            {set.estado}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-center space-x-6">
                                          <div className="text-center">
                                            <div className="text-xl font-bold text-blue-600">{set.puntosJ1}</div>
                                            <div className="text-xs text-gray-600">{match.jugador1?.nombre}</div>
                                          </div>
                                          <div className="text-lg font-medium text-gray-400">vs</div>
                                          <div className="text-center">
                                            <div className="text-xl font-bold text-blue-600">{set.puntosJ2}</div>
                                            <div className="text-xs text-gray-600">{match.jugador2?.nombre}</div>
                                          </div>
                                        </div>
                                        {set.puntosJ1 === set.puntosJ2 && (
                                          <div className="mt-2 text-center">
                                            <span className="text-xs font-medium text-orange-600">
                                              ⚠️ Empate - Set no válido
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-yellow-800">Sin sets registrados</span>
                                  </div>
                                  <div className="mt-1 text-xs text-yellow-700">
                                    Los sets individuales se mostrarán cuando se registre el resultado del partido.
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Información adicional */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">ID del Partido:</span>
                              <div className="font-medium">{match.id}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Fecha de Creación:</span>
                              <div className="font-medium">{formatDateTime(match.createdAt)}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Última Actualización:</span>
                              <div className="font-medium">{formatDateTime(match.updatedAt)}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Sets Jugados:</span>
                              <div className="font-medium">
                                {match.setsJ1 !== null && match.setsJ2 !== null 
                                  ? `${match.setsJ1 + match.setsJ2}` 
                                  : 'No registrado'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-6xl mb-4">🏓</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay partidos</h3>
                    <p className="text-gray-600">Aún no se han generado partidos para este torneo.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración del Torneo</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Award className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Configuración en desarrollo
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Aquí se mostrarán las opciones de configuración del torneo, 
                          incluyendo la gestión de jugadores, ajustes de formato y más.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentDetail;

