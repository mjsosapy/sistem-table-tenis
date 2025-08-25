import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket debe ser usado dentro de un SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Crear conexión Socket.io
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      // Eventos de conexión
      newSocket.on('connect', () => {
        console.log('Conectado a Socket.io');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Desconectado de Socket.io');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Error de conexión Socket.io:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      // Cleanup al desmontar
      return () => {
        newSocket.close();
      };
    } else {
      // Si no hay usuario, cerrar conexión
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [user]);

  // Funciones para manejar torneos
  const joinTournament = (tournamentId) => {
    if (socket && isConnected) {
      socket.emit('join-tournament', tournamentId);
    }
  };

  const leaveTournament = (tournamentId) => {
    if (socket && isConnected) {
      socket.emit('leave-tournament', tournamentId);
    }
  };

  // Escuchar eventos de torneos
  const onTournamentUpdate = (callback) => {
    if (socket) {
      socket.on('tournament-updated', callback);
      return () => socket.off('tournament-updated', callback);
    }
  };

  const onBracketGenerated = (callback) => {
    if (socket) {
      socket.on('bracket-generated', callback);
      return () => socket.off('bracket-generated', callback);
    }
  };

  const onManualSeedingCompleted = (callback) => {
    if (socket) {
      socket.on('manual-seeding-completed', callback);
      return () => socket.off('manual-seeding-completed', callback);
    }
  };

  const onMatchUpdated = (callback) => {
    if (socket) {
      socket.on('match-updated', callback);
      return () => socket.off('match-updated', callback);
    }
  };

  const onTournamentFinished = (callback) => {
    if (socket) {
      socket.on('tournament-finished', callback);
      return () => socket.off('tournament-finished', callback);
    }
  };

  const value = {
    socket,
    isConnected,
    joinTournament,
    leaveTournament,
    onTournamentUpdate,
    onBracketGenerated,
    onManualSeedingCompleted,
    onMatchUpdated,
    onTournamentFinished
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
