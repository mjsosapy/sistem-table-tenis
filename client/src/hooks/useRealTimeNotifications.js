import { useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';

export const useRealTimeNotifications = () => {
  const queryClient = useQueryClient();
  const { 
    onTournamentUpdate, 
    onBracketGenerated, 
    onManualSeedingCompleted, 
    onMatchUpdated, 
    onTournamentFinished 
  } = useSocket();

  useEffect(() => {
    // Solo activar notificaciones si las funciones están disponibles (usuario autenticado)
    if (!onTournamentUpdate || !onBracketGenerated || !onManualSeedingCompleted || !onMatchUpdated || !onTournamentFinished) {
      return;
    }

    // Escuchar actualizaciones de torneos
    const unsubscribeTournament = onTournamentUpdate((data) => {
      queryClient.invalidateQueries(['tournaments']);
      toast.success('Torneo actualizado en tiempo real');
    });

    // Escuchar cuando se genera un bracket
    const unsubscribeBracket = onBracketGenerated((data) => {
      queryClient.invalidateQueries(['tournaments']);
      queryClient.invalidateQueries(['tournament', data.tournamentId]);
      toast.success('Bracket generado exitosamente');
    });

    // Escuchar cuando se completa un sorteo manual
    const unsubscribeSeeding = onManualSeedingCompleted((data) => {
      queryClient.invalidateQueries(['tournaments']);
      queryClient.invalidateQueries(['tournament', data.tournamentId]);
      toast.success('Sorteo manual completado');
    });

    // Escuchar actualizaciones de partidos
    const unsubscribeMatch = onMatchUpdated((data) => {
      queryClient.invalidateQueries(['tournament-matches', data.tournamentId]);
      queryClient.invalidateQueries(['tournaments']);
      toast.success('Partido actualizado en tiempo real');
    });

    // Escuchar cuando termina un torneo
    const unsubscribeFinished = onTournamentFinished((data) => {
      queryClient.invalidateQueries(['tournaments']);
      queryClient.invalidateQueries(['ranking']);
      toast.success('¡Torneo finalizado!');
    });

    // Cleanup
    return () => {
      unsubscribeTournament?.();
      unsubscribeBracket?.();
      unsubscribeSeeding?.();
      unsubscribeMatch?.();
      unsubscribeFinished?.();
    };
  }, [onTournamentUpdate, onBracketGenerated, onManualSeedingCompleted, onMatchUpdated, onTournamentFinished, queryClient]);
};
