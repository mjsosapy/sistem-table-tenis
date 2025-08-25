import React from 'react';
import { Calendar, Users, Trophy, Edit, Trash2, Eye, Play, Pause, MoreVertical, Shuffle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const TournamentCard = ({ tournament, onDelete, onStatusChange, onEdit, onView, onManualSeeding }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente': return 'bg-gray-100 text-gray-800';
      case 'En curso': return 'bg-green-100 text-green-800';
      case 'Pausado': return 'bg-yellow-100 text-yellow-800';
      case 'Finalizado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'En curso': return <Play className="w-4 h-4" />;
      case 'Pausado': return <Pause className="w-4 h-4" />;
      case 'Finalizado': return <Trophy className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
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

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const formatDateTime = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {tournament.nombre}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.estado)}`}>
                {getStatusIcon(tournament.estado)}
                <span className="ml-1">{getStatusLabel(tournament.estado)}</span>
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {getTypeLabel(tournament.tipo)}
              </span>
            </div>
          </div>
          <div className="relative">
            <button className="text-gray-400 hover:text-gray-600 p-1">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {tournament.descripcion && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {tournament.descripcion}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>Inicio: {formatDateTime(tournament.fechaInicio)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>Fin: {formatDateTime(tournament.fechaFin)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2 text-gray-400" />
            <span>Máximo {tournament.maxJugadores} jugadores</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Trophy className="w-4 h-4 mr-2 text-gray-400" />
            <span>Al mejor de {tournament.setsPorPartido} sets (11 puntos)</span>
          </div>
        </div>

        {/* Progress indicators */}
        {tournament.estado !== 'Pendiente' && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progreso</span>
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
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => onView(tournament.id)}
              className="inline-flex items-center px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
            >
              <Eye className="w-4 h-4 mr-1" />
              Ver
            </button>
            {tournament.estado === 'Pendiente' && (
              <button
                onClick={() => onEdit(tournament.id)}
                className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </button>
            )}
            {tournament.estado === 'Pendiente' && (
              <button
                onClick={() => onManualSeeding(tournament)}
                className="inline-flex items-center px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
              >
                <Shuffle className="w-4 h-4 mr-1" />
                Sorteo Manual
              </button>
            )}
          </div>
          
          <div className="flex space-x-2">
            {tournament.estado === 'Pendiente' && (
              <button
                onClick={() => onStatusChange(tournament.id, 'En curso')}
                className="inline-flex items-center px-3 py-1.5 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
              >
                <Play className="w-4 h-4 mr-1" />
                Iniciar
              </button>
            )}
            {tournament.estado === 'En curso' && (
              <button
                onClick={() => onStatusChange(tournament.id, 'Pausado')}
                className="inline-flex items-center px-3 py-1.5 text-sm text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-md transition-colors"
              >
                <Pause className="w-4 h-4 mr-1" />
                Pausar
              </button>
            )}
            {tournament.estado === 'Pausado' && (
              <button
                onClick={() => onStatusChange(tournament.id, 'En curso')}
                className="inline-flex items-center px-3 py-1.5 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
              >
                <Play className="w-4 h-4 mr-1" />
                Reanudar
              </button>
            )}
            {tournament.estado === 'Pendiente' && (
              <button
                onClick={() => onDelete(tournament.id)}
                className="inline-flex items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Eliminar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentCard;
