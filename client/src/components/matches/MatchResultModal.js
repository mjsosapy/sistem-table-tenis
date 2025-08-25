import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { X, Save, Trophy, User, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../utils/api';

const MatchResultModal = ({ match, isOpen, onClose, onSuccess }) => {
  const [sets, setSets] = useState([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isMatchComplete, setIsMatchComplete] = useState(false);
  const [setsToWin, setSetsToWin] = useState(2); // Por defecto al mejor de 3 (2 victorias)
  const queryClient = useQueryClient();

  // Inicializar sets cuando se abre el modal
  useEffect(() => {
    if (isOpen && match) {
      // Obtener setsToWin del torneo (por defecto 2 para al mejor de 3)
      const tournamentSetsToWin = match.torneo?.setsPorPartido || 3;
      const requiredWins = Math.ceil(tournamentSetsToWin / 2);
      setSetsToWin(requiredWins);
      
      // Inicializar sets vacíos
      setSets(Array(tournamentSetsToWin).fill(null).map(() => ({ player1Score: '', player2Score: '' })));
      setCurrentSetIndex(0);
      setIsMatchComplete(false);
    }
  }, [isOpen, match]);

  // Calcular estadísticas del partido
  const calculateMatchStats = () => {
    const completedSets = sets.filter(set => set.player1Score && set.player2Score);
    let player1Wins = 0;
    let player2Wins = 0;

    completedSets.forEach(set => {
      if (parseInt(set.player1Score) > parseInt(set.player2Score)) {
        player1Wins++;
      } else if (parseInt(set.player2Score) > parseInt(set.player1Score)) {
        player2Wins++;
      }
    });

    return { player1Wins, player2Wins, completedSets };
  };

  // Verificar si el partido está completo
  const checkMatchComplete = () => {
    const { player1Wins, player2Wins } = calculateMatchStats();
    return player1Wins >= setsToWin || player2Wins >= setsToWin;
  };

  // Obtener ganador del partido
  const getMatchWinner = () => {
    const { player1Wins, player2Wins } = calculateMatchStats();
    if (player1Wins >= setsToWin) return match.jugador1Id;
    if (player2Wins >= setsToWin) return match.jugador2Id;
    return null;
  };

  // Actualizar set actual
  const updateCurrentSet = (field, value) => {
    const newSets = [...sets];
    newSets[currentSetIndex][field] = value;
    setSets(newSets);
  };

  // Avanzar al siguiente set
  const nextSet = () => {
    if (currentSetIndex < sets.length - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
    }
  };

  // Validar set actual
  const validateCurrentSet = () => {
    const currentSet = sets[currentSetIndex];
    if (!currentSet.player1Score || !currentSet.player2Score) {
      toast.error('Debes completar ambos puntajes del set');
      return false;
    }

    const score1 = parseInt(currentSet.player1Score);
    const score2 = parseInt(currentSet.player2Score);

    if (score1 === score2) {
      toast.error('No puede haber empate en un set');
      return false;
    }

    if (score1 < 0 || score2 < 0) {
      toast.error('Los puntajes no pueden ser negativos');
      return false;
    }

    return true;
  };

  // Mutación para guardar el resultado
  const saveResultMutation = useMutation(
    async (resultData) => {
      const response = await api.put(`/matches/${match.id}/result`, resultData);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Resultado guardado exitosamente');
        queryClient.invalidateQueries(['tournament-matches', match.tournamentId]);
        queryClient.invalidateQueries(['tournaments']);
        onSuccess?.();
        onClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al guardar el resultado');
      }
    }
  );

  // Guardar resultado
  const saveResult = () => {
    const { completedSets } = calculateMatchStats();
    
    if (completedSets.length === 0) {
      toast.error('Debes registrar al menos un set');
      return;
    }

    const winner = getMatchWinner();
    if (!winner) {
      toast.error('No se puede determinar un ganador con los resultados ingresados');
      return;
    }

    const resultData = {
      sets: completedSets.map(set => ({
        player1Score: parseInt(set.player1Score),
        player2Score: parseInt(set.player2Score)
      })),
      winnerId: winner,
      status: 'Finalizado'
    };

    saveResultMutation.mutate(resultData);
  };

  // Manejar cambio en el set actual
  const handleSetChange = (field, value) => {
    updateCurrentSet(field, value);
    
    // Verificar si el set está completo y el partido terminó
    const currentSet = sets[currentSetIndex];
    if (currentSet.player1Score && currentSet.player2Score) {
      const isComplete = checkMatchComplete();
      setIsMatchComplete(isComplete);
      
      // Si el partido no está completo y hay más sets, avanzar automáticamente
      if (!isComplete && currentSetIndex < sets.length - 1) {
        setTimeout(() => {
          nextSet();
        }, 1000); // Pequeña pausa para que el usuario vea el resultado
      }
    }
  };

  if (!isOpen || !match) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Registrar Resultado
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {match.jugador1?.name || match.jugador1?.nombre} vs {match.jugador2?.name || match.jugador2?.nombre}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Información del partido */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">
                    {match.jugador1?.name || match.jugador1?.nombre}
                  </span>
                </div>
                <span className="text-gray-500">vs</span>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">
                    {match.jugador2?.name || match.jugador2?.nombre}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Ronda {match.ronda}
              </div>
            </div>
          </div>

          {/* Registro de sets progresivo */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Resultados por Set</h3>
              <div className="text-sm text-gray-500">
                Al mejor de {sets.length} sets ({setsToWin} victorias necesarias)
              </div>
            </div>
            
            {/* Set actual */}
            <div className="p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
              <div className="text-center mb-4">
                <h4 className="text-lg font-semibold text-blue-900">Set {currentSetIndex + 1}</h4>
                {isMatchComplete && (
                  <div className="mt-2 text-green-600 font-medium">
                    <CheckCircle className="w-5 h-5 inline mr-1" />
                    ¡Partido completado!
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {match.jugador1?.name || match.jugador1?.nombre}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="21"
                    value={sets[currentSetIndex]?.player1Score || ''}
                    onChange={(e) => handleSetChange('player1Score', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-semibold"
                    placeholder="0"
                    disabled={isMatchComplete}
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-gray-500">-</span>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">vs</div>
                    <div className="text-xs text-gray-400">Set {currentSetIndex + 1}</div>
                  </div>
                  <span className="text-2xl font-bold text-gray-500">-</span>
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {match.jugador2?.name || match.jugador2?.nombre}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="21"
                    value={sets[currentSetIndex]?.player2Score || ''}
                    onChange={(e) => handleSetChange('player2Score', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-semibold"
                    placeholder="0"
                    disabled={isMatchComplete}
                  />
                </div>
              </div>
            </div>

            {/* Progreso de sets */}
            <div className="flex justify-center space-x-2">
              {sets.map((set, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    index === currentSetIndex
                      ? 'bg-blue-600 text-white'
                      : set.player1Score && set.player2Score
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {set.player1Score && set.player2Score ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Resumen dinámico del resultado */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="text-sm font-medium text-green-900 mb-3 flex items-center">
              <Trophy className="w-4 h-4 mr-2" />
              Resumen del Resultado
            </h4>
            <div className="space-y-3">
              {(() => {
                const { player1Wins, player2Wins } = calculateMatchStats();
                const winner = getMatchWinner();
                const isComplete = checkMatchComplete();

                return (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 font-medium">
                        {match.jugador1?.name || match.jugador1?.nombre}: {player1Wins} sets
                      </span>
                      <span className="text-gray-700 font-medium">
                        {match.jugador2?.name || match.jugador2?.nombre}: {player2Wins} sets
                      </span>
                    </div>
                    
                    {isComplete && winner && (
                      <div className="flex items-center justify-center space-x-2 text-green-700 font-semibold bg-green-100 p-3 rounded-lg">
                        <Trophy className="w-5 h-5" />
                        <span>
                          Ganador: {winner === match.jugador1Id 
                            ? (match.jugador1?.name || match.jugador1?.nombre)
                            : (match.jugador2?.name || match.jugador2?.nombre)
                          }
                        </span>
                      </div>
                    )}
                    
                    {!isComplete && (player1Wins > 0 || player2Wins > 0) && (
                      <div className="text-center text-orange-600 text-sm">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        Partido en progreso - Continúa registrando sets
                      </div>
                    )}
                    
                    {player1Wins === 0 && player2Wins === 0 && (
                      <div className="text-center text-gray-500 text-sm">
                        Comienza registrando el primer set
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={saveResult}
              disabled={saveResultMutation.isLoading || !isMatchComplete}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saveResultMutation.isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isMatchComplete ? 'Guardar Resultado Final' : 'Completa el partido'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchResultModal;
