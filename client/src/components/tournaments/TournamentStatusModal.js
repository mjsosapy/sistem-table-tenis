import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { X, CheckCircle, AlertCircle, Clock, Trophy, Users, Target } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../utils/api';

const TournamentStatusModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  // Obtener estadísticas de torneos
  const { data: tournamentStats = [], isLoading, refetch } = useQuery(
    ['tournament-stats'],
    () => api.get('/debug/tournaments').then(res => res.data.stats),
    {
      enabled: isOpen,
      refetchInterval: 10000 // Actualizar cada 10 segundos
    }
  );

  // Mutación para cerrar torneo
  const closeTournamentMutation = useMutation(
    (tournamentId) => api.post(`/matches/check-tournament-completion/${tournamentId}`),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['tournament-stats']);
        queryClient.invalidateQueries(['ranking']);
      }
    }
  );

  const handleCloseTournament = (tournamentId) => {
    const promise = closeTournamentMutation.mutateAsync(tournamentId);
    
    toast.promise(promise, {
      loading: 'Cerrando torneo...',
      success: 'Torneo cerrado exitosamente',
      error: 'Error al cerrar el torneo'
    });
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'Finalizado':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'En curso':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'Pendiente':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'Finalizado':
        return 'bg-green-100 text-green-800';
      case 'En curso':
        return 'bg-blue-100 text-blue-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Trophy className="w-6 h-6 mr-2 text-yellow-600" />
            Estado de Torneos
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {tournamentStats.map((tournament) => (
              <div
                key={tournament.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(tournament.estado)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {tournament.nombre}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tournament.estado)}`}>
                        {tournament.estado}
                      </span>
                    </div>
                  </div>
                  
                  {tournament.estado === 'En curso' && tournament.completionPercentage === 100 && (
                    <button
                      onClick={() => handleCloseTournament(tournament.id)}
                      disabled={closeTournamentMutation.isLoading}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {closeTournamentMutation.isLoading ? 'Cerrando...' : 'Cerrar Torneo'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Partidos: {tournament.completedMatches}/{tournament.totalMatches}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Completado: {tournament.completionPercentage}%
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Resultados: {tournament.hasResults ? 'Sí' : 'No'}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${tournament.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {tournament.estado === 'En curso' && tournament.completionPercentage < 100 && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                      <span className="text-sm text-yellow-800">
                        Faltan {tournament.totalMatches - tournament.completedMatches} partidos por completar
                      </span>
                    </div>
                  </div>
                )}

                {tournament.estado === 'En curso' && tournament.completionPercentage === 100 && !tournament.hasResults && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm text-green-800">
                        Torneo listo para cerrar - todos los partidos están completados
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={refetch}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Actualizar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TournamentStatusModal;
