import React from 'react';
import { Mail, Phone, Calendar, Edit, Trash2, Eye, User, ChevronUp, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const PlayersTable = ({ players, onDelete, onEdit, onView, onReactivate, isLoading, onCreateNew, sortBy, sortOrder, onSort }) => {
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

  const SortableHeader = ({ field, children }) => {
    const isActive = sortBy === field;
    return (
      <th 
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
        onClick={() => onSort && onSort(field)}
      >
        <div className="flex items-center space-x-1">
          <span>{children}</span>
          {isActive && (
            sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </th>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando jugadores...</p>
        </div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay jugadores</h3>
          <p className="text-gray-600 mb-4">
            No se encontraron jugadores para mostrar
          </p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <User className="w-5 h-5 mr-2" />
            Agregar Primer Jugador
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader field="nombre">Jugador</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <SortableHeader field="role">Rol</SortableHeader>
              <SortableHeader field="ranking">Ranking</SortableHeader>
              <SortableHeader field="activo">Estado</SortableHeader>
              <SortableHeader field="createdAt">Fecha Registro</SortableHeader>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.map((player) => (
              <tr key={player.id} className="hover:bg-gray-50 transition-colors">
                {/* Información del jugador */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-primary-600 font-semibold text-sm">
                        {player.name ? player.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2) : '??'}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {player.name || 'Sin nombre'}
                      </div>
                      {player.birthDate && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(player.birthDate)}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Contacto */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Mail className="w-3 h-3 mr-1 text-gray-400" />
                      {player.email}
                    </div>
                    {player.phone && (
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone className="w-3 h-3 mr-1 text-gray-400" />
                        {player.phone}
                      </div>
                    )}
                  </div>
                </td>

                {/* Rol */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(player.role)}`}>
                    {getRoleLabel(player.role)}
                  </span>
                </td>

                {/* Ranking */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {player.ranking ? `#${player.ranking}` : 'Sin ranking'}
                </td>

                {/* Estado */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {player.active ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Inactivo
                    </span>
                  )}
                </td>

                {/* Fecha de registro */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(player.createdAt)}
                </td>

                {/* Acciones */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onView(player.id)}
                      className="text-primary-600 hover:text-primary-900 p-1 rounded"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(player.id)}
                      className="text-gray-600 hover:text-gray-900 p-1 rounded"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {player.active ? (
                      <button
                        onClick={() => onDelete(player.id)}
                        className="text-orange-600 hover:text-orange-900 p-1 rounded"
                        title="Dar de baja"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onReactivate(player.id)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Reactivar"
                      >
                        <User className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayersTable;
