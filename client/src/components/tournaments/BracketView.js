import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Edit, User, Trophy, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../utils/api';
import { useSocket } from '../../contexts/SocketContext';
import MatchResultModal from '../matches/MatchResultModal';
import TournamentBracket from './TournamentBracket';

const MatchCard = ({ match, round, isFinal = false, onRegisterResult }) => {
  const getMatchStatus = (status) => {
    switch (status) {
      case 'Finalizado':
        return { icon: <CheckCircle className="w-4 h-4 text-green-600" />, text: 'Finalizado', color: 'text-green-600' };
      case 'En curso':
        return { icon: <Clock className="w-4 h-4 text-yellow-600" />, text: 'En curso', color: 'text-yellow-600' };
      case 'Pendiente':
        return { icon: <Clock className="w-4 h-4 text-gray-400" />, text: 'Pendiente', color: 'text-gray-400' };
      default:
        return { icon: <Clock className="w-4 h-4 text-gray-400" />, text: 'Error', color: 'text-gray-400' };
    }
  };

  const status = getMatchStatus(match.estado);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      {/* Header del partido */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">Ronda {match.ronda}</span>
        <div className="flex items-center space-x-1">
          {status.icon}
          <span className={`text-xs ${status.color}`}>{status.text}</span>
        </div>
      </div>

      {/* Jugador 1 */}
      <div className={`
        flex items-center justify-between p-2 rounded mb-2
        ${match.ganadorId === match.jugador1Id ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}
      `}>
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">
            {match.jugador1?.name || match.jugador1?.nombre || 'TBD'}
          </span>
        </div>
        {match.ganadorId === match.jugador1Id && (
          <Trophy className="w-4 h-4 text-yellow-500" />
        )}
      </div>

      {/* Jugador 2 */}
      <div className={`
        flex items-center justify-between p-2 rounded
        ${match.ganadorId === match.jugador2Id ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}
      `}>
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">
            {match.jugador2?.name || match.jugador2?.nombre || 'TBD'}
          </span>
        </div>
        {match.ganadorId === match.jugador2Id && (
          <Trophy className="w-4 h-4 text-yellow-500" />
        )}
      </div>

      {/* Resultado si está finalizado */}
      {match.estado === 'Finalizado' && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{match.setsJ1 || 0}</span>
            <span className="font-medium">vs</span>
            <span>{match.setsJ2 || 0}</span>
          </div>
        </div>
      )}

      {/* Botón para registrar resultado */}
      {match.estado === 'Pendiente' && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <button
            onClick={() => onRegisterResult(match)}
            className="w-full px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center justify-center space-x-1"
          >
            <Edit className="w-3 h-3" />
            <span>Registrar Resultado</span>
          </button>
        </div>
      )}

      {/* Botón para ver resultado */}
      {match.estado === 'Finalizado' && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <button
            onClick={() => onRegisterResult(match)}
            className="w-full px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center space-x-1"
          >
            <span>Ver/Editar Resultado</span>
          </button>
        </div>
      )}
    </div>
  );
};

const BracketView = ({ tournamentId }) => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { joinTournament, leaveTournament, onMatchUpdated, onBracketGenerated } = useSocket();

  const { data: matchesData, isLoading, error } = useQuery(
    ['tournament-matches', tournamentId],
    async () => {
      const response = await api.get(`/matches/tournament/${tournamentId}`);
      return response.data;
    },
    {
      enabled: !!tournamentId,
      refetchInterval: 30000, // Refetch every 30 seconds as fallback
    }
  );

  // Obtener información del torneo para determinar el tipo
  const { data: tournamentData } = useQuery(
    ['tournament', tournamentId],
    async () => {
      if (!tournamentId) return null;
      const response = await api.get(`/tournaments/${tournamentId}`);
      return response.data;
    },
    { enabled: !!tournamentId }
  );

  // Socket.io real-time updates
  useEffect(() => {
    if (tournamentId) {
      // Unirse al torneo para recibir actualizaciones
      joinTournament(tournamentId);

      // Escuchar actualizaciones de partidos
      const unsubscribeMatch = onMatchUpdated((data) => {
        if (data.tournamentId === parseInt(tournamentId)) {
          queryClient.invalidateQueries(['tournament-matches', tournamentId]);
          toast.success('Partido actualizado en tiempo real');
        }
      });

      // Escuchar cuando se genera el bracket
      const unsubscribeBracket = onBracketGenerated((data) => {
        if (data.tournamentId === parseInt(tournamentId)) {
          queryClient.invalidateQueries(['tournament-matches', tournamentId]);
          toast.success('Bracket generado exitosamente');
        }
      });

      // Cleanup
      return () => {
        leaveTournament(tournamentId);
        unsubscribeMatch?.();
        unsubscribeBracket?.();
      };
    }
  }, [tournamentId, joinTournament, leaveTournament, onMatchUpdated, onBracketGenerated, queryClient]);

  const matches = matchesData?.matches || [];

  // Función para manejar el registro de resultados
  const handleRegisterResult = (match) => {
    setSelectedMatch(match);
    setIsResultModalOpen(true);
  };

  // Función para ver resultados
  const handleViewResult = (match) => {
    setSelectedMatch(match);
    setIsResultModalOpen(true);
  };

  // Organizar partidos por rondas
  const organizeMatchesByRound = (matches) => {
    const rounds = {};
    matches.forEach(match => {
      if (!rounds[match.ronda]) {
        rounds[match.ronda] = [];
      }
      rounds[match.ronda].push(match);
    });
    return rounds;
  };

  const rounds = organizeMatchesByRound(matches);
  const roundNumbers = Object.keys(rounds).sort((a, b) => parseInt(a) - parseInt(b));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando bracket...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar el bracket</h3>
        <p className="text-gray-600">{error.message}</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-6xl mb-4">🏓</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay partidos</h3>
        <p className="text-gray-600">El bracket aún no ha sido generado para este torneo.</p>
      </div>
    );
  }

  // Determinar si mostrar el bracket visual o el tradicional
  const isEliminationTournament = tournamentData?.tipo === 'Eliminación directa';
  const shouldShowVisualBracket = isEliminationTournament && matches.length > 0;

  return (
    <div className="space-y-6">
      {/* Bracket Visual para Eliminación Directa */}
      {shouldShowVisualBracket ? (
        <TournamentBracket
          matches={matches}
          onRegisterResult={handleRegisterResult}
          onViewResult={handleViewResult}
        />
      ) : (
        /* Bracket Tradicional para otros tipos de torneo */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Bracket del Torneo</h2>
            <div className="text-sm text-gray-500">
              {tournamentData?.tipo || 'Torneo'}
            </div>
          </div>

          <div className="flex space-x-8 min-w-max">
            {roundNumbers.map((roundNumber, index) => (
              <div key={roundNumber} className="flex flex-col space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {roundNumber === '1' ? 'Primera Ronda' : 
                     roundNumber === '2' ? 'Segunda Ronda' :
                     roundNumber === '3' ? 'Tercera Ronda' :
                     roundNumber === '4' ? 'Cuarta Ronda' :
                     `Ronda ${roundNumber}`}
                  </h3>
                  <p className="text-sm text-gray-500">{rounds[roundNumber].length} partidos</p>
                </div>
                <div className="space-y-4">
                  {rounds[roundNumber].map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      round={roundNumber}
                      onRegisterResult={handleRegisterResult}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {matches.filter(m => m.estado === 'Finalizado').length}
          </div>
          <div className="text-sm text-gray-600">Partidos completados</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {matches.filter(m => m.estado === 'En curso').length}
          </div>
          <div className="text-sm text-gray-600">Partidos en curso</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">
            {matches.filter(m => m.estado === 'Pendiente').length}
          </div>
          <div className="text-sm text-gray-600">Partidos pendientes</div>
        </div>
      </div>

      {/* Modal para registrar resultados */}
      <MatchResultModal
        match={selectedMatch}
        isOpen={isResultModalOpen}
        onClose={() => {
          setIsResultModalOpen(false);
          setSelectedMatch(null);
        }}
        onSuccess={() => {
          setIsResultModalOpen(false);
          setSelectedMatch(null);
        }}
      />
    </div>
  );
};

export default BracketView;
