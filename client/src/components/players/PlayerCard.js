import React from 'react';
import { Mail, Phone, Calendar, Trophy, Edit, Trash2, Eye, MoreVertical, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const PlayerCard = ({ player, onDelete, onEdit, onView, onReactivate }) => {
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'arbitro': return 'bg-blue-100 text-blue-800';
      case 'jugador': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'arbitro': return 'Árbitro';
      case 'jugador': return 'Jugador';
      default: return role;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center flex-1">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-primary-600 font-semibold text-sm">
                {getInitials(player.name)}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {player.name || 'Sin nombre'}
              </h3>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(player.role)}`}>
                  {getRoleLabel(player.role)}
                </span>
                {player.ranking && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Ranking: #{player.ranking}
                  </span>
                )}
                {!player.active && (
                  <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                    Inactivo
                  </span>
                )}
              </div>
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
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2 text-gray-400" />
            <span className="truncate">{player.email}</span>
          </div>
          {player.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              <span>{player.phone}</span>
            </div>
          )}
          {player.birthDate && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>Nacimiento: {formatDate(player.birthDate)}</span>
            </div>
          )}
        </div>

        {/* Statistics */}
        {player.role === 'jugador' && (
          <div className="pt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-600">
                  {player.tournamentsPlayed || 0}
                </div>
                <div className="text-xs text-gray-500">Torneos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success-600">
                  {player.tournamentsWon || 0}
                </div>
                <div className="text-xs text-gray-500">Victorias</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {player.lastActivity && (
          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Última actividad: {formatDate(player.lastActivity)}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => onView(player.id)}
              className="inline-flex items-center px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
            >
              <Eye className="w-4 h-4 mr-1" />
              Ver
            </button>
            <button
              onClick={() => onEdit(player.id)}
              className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </button>
          </div>
          
          {player.active ? (
            <button
              onClick={() => onDelete(player.id)}
              className="inline-flex items-center px-3 py-1.5 text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Dar de baja
            </button>
          ) : (
            <button
              onClick={() => onReactivate(player.id)}
              className="inline-flex items-center px-3 py-1.5 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
            >
              <User className="w-4 h-4 mr-1" />
              Reactivar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
