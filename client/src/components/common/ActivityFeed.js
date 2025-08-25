import React, { useState, useEffect } from 'react';
import { Activity, Trophy, Users, Award, Clock } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const { onTournamentUpdate, onBracketGenerated, onMatchUpdated } = useSocket();

  useEffect(() => {
    // Escuchar eventos de actividad
    const unsubscribeTournament = onTournamentUpdate((data) => {
      addActivity({
        type: 'tournament',
        message: 'Torneo actualizado',
        timestamp: new Date(),
        icon: Trophy
      });
    });

    const unsubscribeBracket = onBracketGenerated((data) => {
      addActivity({
        type: 'bracket',
        message: 'Bracket generado',
        timestamp: new Date(),
        icon: Award
      });
    });

    const unsubscribeMatch = onMatchUpdated((data) => {
      addActivity({
        type: 'match',
        message: 'Partido actualizado',
        timestamp: new Date(),
        icon: Users
      });
    });

    return () => {
      unsubscribeTournament?.();
      unsubscribeBracket?.();
      unsubscribeMatch?.();
    };
  }, [onTournamentUpdate, onBracketGenerated, onMatchUpdated]);

  const addActivity = (activity) => {
    setActivities(prev => [activity, ...prev.slice(0, 9)]); // Mantener solo las últimas 10 actividades
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'tournament': return 'text-blue-600 bg-blue-50';
      case 'bracket': return 'text-green-600 bg-green-50';
      case 'match': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours}h`;
    return timestamp.toLocaleDateString();
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Activity className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900">Actividad Reciente</h3>
        </div>
        <div className="text-center py-4">
          <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No hay actividad reciente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Activity className="w-5 h-5 text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900">Actividad Reciente</h3>
      </div>
      <div className="space-y-2">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
              <div className={`p-1 rounded-full ${getActivityColor(activity.type)}`}>
                <Icon className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{activity.message}</p>
                <p className="text-xs text-gray-500">{formatTime(activity.timestamp)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityFeed;
