import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  X, 
  Users, 
  Shuffle, 
  Save, 
  RotateCcw,
  AlertCircle,
  CheckCircle,
  User,
  Trophy
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../utils/api';
import { useSocket } from '../../contexts/SocketContext';

// Componente para un jugador arrastrable
const DraggablePlayer = ({ player, index, movePlayer, isInBracket }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'PLAYER',
    item: { index, player },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`
        p-3 rounded-lg border-2 cursor-move transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
        ${isInBracket 
          ? 'bg-blue-50 border-blue-200 hover:border-blue-300' 
          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
        }
      `}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {player.nombre}
          </p>
          <p className="text-xs text-gray-500">
            Ranking: #{player.ranking || 'N/A'}
          </p>
        </div>
        {player.role === 'admin' && (
          <Trophy className="w-4 h-4 text-yellow-500" />
        )}
      </div>
    </div>
  );
};

// Componente para una posición en el bracket
const BracketPosition = ({ position, player, onDrop, onRemove }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'PLAYER',
    drop: (item) => onDrop(position, item.player),
    canDrop: () => !player, // Solo permitir drop si la posición está vacía
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`
        p-4 rounded-lg border-2 transition-all duration-200 min-h-[80px] flex items-center justify-center
        ${isOver && canDrop ? 'border-green-400 bg-green-50' : ''}
        ${player ? 'border-blue-300 bg-blue-50' : 'border-dashed border-gray-300 bg-gray-50'}
        ${!player && isOver && canDrop ? 'border-green-400 bg-green-50' : ''}
      `}
    >
      {player ? (
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <User className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">{player.nombre}</span>
            <button
              onClick={() => onRemove(position)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-gray-500">Posición {position}</p>
        </div>
      ) : (
        <div className="text-center text-gray-400">
          <Users className="w-6 h-6 mx-auto mb-1" />
          <p className="text-xs">Arrastra un jugador aquí</p>
          <p className="text-xs">Posición {position}</p>
        </div>
      )}
    </div>
  );
};

// Componente principal del modal
const ManualSeedingModal = ({ tournament, isOpen, onClose, onSuccess }) => {
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [bracketPositions, setBracketPositions] = useState({});
  const queryClient = useQueryClient();
  const { onManualSeedingCompleted } = useSocket();

  // Obtener información del torneo primero
  const { data: tournamentResponse } = useQuery(
    ['tournament', tournament?.id],
    async () => {
      const response = await api.get(`/tournaments/${tournament.id}`);
      return response.data;
    },
    {
      enabled: Boolean(isOpen) && Boolean(tournament?.id),
    }
  );

  const tournamentData = tournamentResponse?.tournament;

  // Obtener jugadores disponibles
  const { data: playersResponse, isLoading: loadingPlayers } = useQuery(
    ['players'],
    async () => {
      const response = await api.get('/players');
      return response.data;
    },
    {
      enabled: Boolean(isOpen),
      onSuccess: (data) => {
        // Filtrar solo jugadores (no árbitros) y limitar al máximo del torneo
        const allPlayers = data.players || [];
        const maxPlayers = 16; // Valor por defecto
        
        console.log('Todos los jugadores:', allPlayers);
        console.log('Roles encontrados:', [...new Set(allPlayers.map(p => p.role))]);
        
        // Filtrar solo jugadores (excluir árbitros y admins)
        const filteredPlayers = allPlayers
          .filter(player => player.role === 'Jugador')
          .sort((a, b) => (a.ranking || 0) - (b.ranking || 0)) // Ordenar por ranking
          .slice(0, maxPlayers); // Limitar al máximo del torneo
        
        console.log('Jugadores filtrados:', filteredPlayers);
        setAvailablePlayers(filteredPlayers);
      }
    }
  );

  // Actualizar jugadores disponibles cuando cambie la información del torneo
  useEffect(() => {
    if (playersResponse?.players) {
      const allPlayers = playersResponse.players;
      const maxPlayers = tournamentData?.maxJugadores || 16;
      
      console.log('useEffect - Todos los jugadores:', allPlayers);
      console.log('useEffect - Roles encontrados:', [...new Set(allPlayers.map(p => p.role))]);
      
      // Filtrar solo jugadores (excluir árbitros y admins)
      const filteredPlayers = allPlayers
        .filter(player => player.role === 'Jugador')
        .sort((a, b) => (a.ranking || 0) - (b.ranking || 0)) // Ordenar por ranking
        .slice(0, maxPlayers); // Limitar al máximo del torneo
      
      console.log('useEffect - Jugadores filtrados:', filteredPlayers);
      setAvailablePlayers(filteredPlayers);
    }
  }, [playersResponse, tournamentData]);

  // Socket.io para actualizaciones en tiempo real
  useEffect(() => {
    if (isOpen && tournament?.id) {
      const unsubscribe = onManualSeedingCompleted((data) => {
        if (data.tournamentId === tournament.id) {
          queryClient.invalidateQueries(['tournaments']);
          queryClient.invalidateQueries(['tournament', tournament.id]);
          toast.success('Sorteo manual completado en tiempo real');
        }
      });

      return unsubscribe;
    }
  }, [isOpen, tournament?.id, onManualSeedingCompleted, queryClient]);

  // Mutación para guardar el sorteo manual
  const saveSeedingMutation = useMutation(
    async (seedingData) => {
      console.log('Ejecutando mutación...');
      console.log('URL:', `/tournaments/${tournament.id}/manual-seeding`);
      console.log('Data:', seedingData);
      
      const response = await api.post(`/tournaments/${tournament.id}/manual-seeding`, seedingData);
      console.log('Response:', response);
      return response.data;
    },
    {
      onSuccess: (data) => {
        console.log('Mutación exitosa:', data);
        toast.success('Sorteo manual guardado exitosamente');
        queryClient.invalidateQueries(['tournaments']);
        onSuccess?.();
        onClose();
      },
      onError: (error) => {
        console.error('Error en mutación:', error);
        toast.error(error.response?.data?.message || 'Error al guardar el sorteo');
      }
    }
  );

  // Función para mover jugador al bracket
  const moveToBracket = (position, player) => {
    setBracketPositions(prev => ({
      ...prev,
      [position]: player
    }));
    setAvailablePlayers(prev => prev.filter(p => p.id !== player.id));
  };

  // Función para remover jugador del bracket
  const removeFromBracket = (position) => {
    const player = bracketPositions[position];
    setBracketPositions(prev => {
      const newPositions = { ...prev };
      delete newPositions[position];
      return newPositions;
    });
    setAvailablePlayers(prev => [...prev, player]);
  };

  // Función para auto-completar el bracket
  const autoCompleteBracket = () => {
    const maxPositions = tournamentData?.maxJugadores || 16;
    const positions = {};
    
    availablePlayers.slice(0, maxPositions).forEach((player, index) => {
      positions[index + 1] = player;
    });
    
    setBracketPositions(positions);
    setAvailablePlayers(prev => prev.slice(maxPositions));
  };

  // Función para limpiar todo
  const clearBracket = () => {
    const allPlayers = [...availablePlayers, ...Object.values(bracketPositions)];
    setAvailablePlayers(allPlayers);
    setBracketPositions({});
  };

  // Función para guardar el sorteo
  const saveSeeding = () => {
    console.log('Guardando sorteo...');
    console.log('Tournament ID:', tournament?.id);
    console.log('Bracket positions:', bracketPositions);
    
    const maxPositions = tournamentData?.maxJugadores || 16;
    const filledPositions = Object.keys(bracketPositions).length;
    
    console.log('Max positions:', maxPositions);
    console.log('Filled positions:', filledPositions);
    
    if (filledPositions < maxPositions) {
      toast.error(`Debes completar al menos ${maxPositions} posiciones`);
      return;
    }

    // Convertir el formato de datos para el backend
    const seededPlayers = Object.entries(bracketPositions).map(([position, player]) => ({
      position: parseInt(position),
      playerId: player.id
    }));

    const seedingData = {
      seededPlayers
    };

    console.log('Seeding data:', seedingData);
    saveSeedingMutation.mutate(seedingData);
  };

  // Generar posiciones del bracket
  const generateBracketPositions = () => {
    const maxPositions = tournamentData?.maxJugadores || 16;
    const positions = [];
    
    for (let i = 1; i <= maxPositions; i++) {
      positions.push(i);
    }
    
    return positions;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
                         <h2 className="text-xl font-semibold text-gray-900">
               Sorteo Manual - {tournament?.nombre}
             </h2>
            <p className="text-sm text-gray-500 mt-1">
              Organiza manualmente los jugadores en el bracket de eliminación
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <DndProvider backend={HTML5Backend}>
          <div className="flex h-[calc(90vh-140px)]">
            {/* Panel izquierdo - Jugadores disponibles */}
            <div className="w-1/3 border-r p-4 overflow-y-auto">
                          <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Jugadores Disponibles
              </h3>
              <span className="text-sm text-gray-500">
                {availablePlayers.length} de {tournamentData?.maxJugadores || 16} jugadores
              </span>
            </div>

              {loadingPlayers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {availablePlayers.map((player, index) => (
                    <DraggablePlayer
                      key={player.id}
                      player={player}
                      index={index}
                      isInBracket={false}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Panel derecho - Bracket */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Bracket de Eliminación
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={autoCompleteBracket}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center space-x-1"
                  >
                    <Shuffle className="w-4 h-4" />
                    <span>Auto-completar</span>
                  </button>
                  <button
                    onClick={clearBracket}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center space-x-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Limpiar</span>
                  </button>
                </div>
              </div>

              {/* Grid del bracket */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {generateBracketPositions().map((position) => (
                  <BracketPosition
                    key={position}
                    position={position}
                    player={bracketPositions[position]}
                    onDrop={moveToBracket}
                    onRemove={removeFromBracket}
                  />
                ))}
              </div>

              {/* Información del progreso */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-700">
                        Posiciones ocupadas: {Object.keys(bracketPositions).length}
                      </span>
                    </div>
                                         <div className="flex items-center space-x-2">
                       <AlertCircle className="w-5 h-5 text-orange-500" />
                       <span className="text-sm text-gray-700">
                         Total requerido: {tournamentData?.maxJugadores || 16}
                       </span>
                     </div>
                   </div>
                   <button
                     onClick={() => {
                       console.log('Botón clickeado');
                       console.log('Bracket positions length:', Object.keys(bracketPositions).length);
                       console.log('Max jugadores:', tournamentData?.maxJugadores || 16);
                       console.log('Is loading:', saveSeedingMutation.isLoading);
                       saveSeeding();
                     }}
                     disabled={saveSeedingMutation.isLoading || Object.keys(bracketPositions).length < (tournamentData?.maxJugadores || 16)}
                     className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                   >
                    {saveSeedingMutation.isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Guardar Sorteo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DndProvider>
      </div>
    </div>
  );
};

export default ManualSeedingModal;
