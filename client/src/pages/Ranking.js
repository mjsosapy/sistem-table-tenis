import React from 'react';
import { useQuery } from 'react-query';
import { Trophy, Calendar } from 'lucide-react';
import { api } from '../utils/api';
import RankingTable from '../components/ranking/RankingTable';
import RankingFilters from '../components/ranking/RankingFilters';

const Ranking = () => {
  // Obtener datos del ranking
  const { data: rankingData = { players: [], pagination: {} }, isLoading: rankingLoading, error: rankingError } = useQuery(
    ['ranking'],
    () => api.get('/ranking').then(res => res.data),
    {
      refetchInterval: 30000, // Actualizar cada 30 segundos
      staleTime: 10000
    }
  );

  // Obtener top 10
  const { data: topData = { topPlayers: [] }, isLoading: topLoading, error: topError } = useQuery(
    ['ranking-top'],
    () => api.get('/ranking/top').then(res => res.data),
    {
      refetchInterval: 30000,
      staleTime: 10000
    }
  );

  // Obtener estadísticas
  const { data: stats = {}, isLoading: statsLoading } = useQuery(
    ['ranking-stats'],
    () => api.get('/ranking/stats').then(res => res.data),
    {
      refetchInterval: 30000,
      staleTime: 10000
    }
  );

  // Obtener historial de torneos
  const { data: historyData = { tournaments: [] }, isLoading: historyLoading } = useQuery(
    ['ranking-tournaments'],
    () => api.get('/ranking/tournaments').then(res => res.data),
    {
      refetchInterval: 60000,
      staleTime: 30000
    }
  );

  if (rankingLoading || topLoading || statsLoading || historyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando ranking...</p>
        </div>
      </div>
    );
  }

  if (rankingError || topError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar el ranking</h3>
          <p className="text-gray-600">Por favor, intenta de nuevo más tarde</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header principal */}
      <div className="bg-gradient-to-r from-green-700 to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Trophy className="w-8 h-8 mr-3" />
                Ranking de Jugadores
              </h1>
              <p className="text-green-100 mt-2">
                Clasificación y estadísticas de los jugadores
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.totalPlayers || 0}</div>
              <div className="text-green-100 text-sm">Jugadores Activos</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="mb-6">
          <RankingFilters />
        </div>

        {/* Top 3 destacados */}
        {topData.topPlayers && topData.topPlayers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              Líderes del Sistema
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topData.topPlayers.slice(0, 3).map((player, index) => (
                <div key={player.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  {/* Header con ranking y nombre */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-gray-900 truncate">
                        {player.nombre || player.name || 'Jugador'}
                      </div>
                    </div>
                    <div className="text-right ml-2 flex-shrink-0">
                      <div className="text-xl font-bold text-gray-900">#{player.ranking || index + 1}</div>
                      <div className="text-xs text-gray-500">Ranking</div>
                    </div>
                  </div>
                  
                  {/* Estadísticas principales */}
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-lg font-bold text-gray-900">{player.puntos || player.points || 0}</div>
                      <div className="text-xs text-gray-500">Puntos</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-lg font-bold text-gray-900">{player.torneosJugados || player.tournamentsPlayed || 0}</div>
                      <div className="text-xs text-gray-500">Torneos</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-lg font-bold text-gray-900">{player.porcentajeVictoria || player.winRate || 0}%</div>
                      <div className="text-xs text-gray-500">Victoria</div>
                    </div>
                  </div>
                  
                  {/* Estadísticas de victorias y derrotas */}
                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">
                        Victorias: <span className="font-semibold text-green-600">{player.victorias || player.wins || 0}</span>
                      </span>
                      <span className="text-gray-600">
                        Derrotas: <span className="font-semibold text-red-600">{player.derrotas || player.losses || 0}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabla principal de ranking */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Clasificación Completa</h2>
            <div className="text-sm text-gray-500">
              {rankingData.pagination && `Página ${rankingData.pagination.page || 1} de ${rankingData.pagination.pages || 1}`}
            </div>
          </div>
          <RankingTable data={rankingData.players || []} />
        </div>

        {/* Historial de torneos recientes */}
        {historyData.tournaments && historyData.tournaments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-500" />
              Torneos Recientes
            </h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Torneo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Participantes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Ganador
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historyData.tournaments.slice(0, 5).map((tournament) => (
                      <tr key={tournament.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{tournament.nombre}</div>
                          <div className="text-sm text-gray-500">{tournament.tipo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tournament.estado === 'Finalizado' ? 'bg-green-100 text-green-800' :
                            tournament.estado === 'En curso' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {tournament.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tournament._count?.matches || 0} partidos
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {tournament.tournamentResults && tournament.tournamentResults[0] ? (
                            <div className="text-sm text-gray-900">
                              {tournament.tournamentResults[0].jugador?.nombre}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">Pendiente</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ranking;

