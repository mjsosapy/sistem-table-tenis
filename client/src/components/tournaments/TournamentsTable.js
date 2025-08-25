import React from 'react';
import { Calendar, Users, Trophy, Edit, Trash2, Eye, Play, Pause, Settings, ChevronUp, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const TournamentsTable = ({ tournaments, onDelete, onEdit, onView, onStatusChange, onManualSeeding, onStartTournament, isLoading, onCreateNew, sortBy, sortOrder, onSort }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'active': return 'Activo';
      case 'paused': return 'Pausado';
      case 'completed': return 'Completado';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'completed': return <Trophy className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'single_elimination': return 'Eliminación Simple';
      case 'double_elimination': return 'Eliminación Doble';
      case 'round_robin': return 'Liga';
      case 'swiss': return 'Suizo';
      default: return type;
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
          <p className="mt-4 text-gray-600">Cargando torneos...</p>
        </div>
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">🏓</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay torneos</h3>
          <p className="text-gray-600 mb-4">
            No se encontraron torneos para mostrar
          </p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Trophy className="w-5 h-5 mr-2" />
            Crear Primer Torneo
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
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                 Torneo
               </th>
               <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                 Acciones
               </th>
             </tr>
           </thead>
           <tbody className="bg-white divide-y divide-gray-200">
             {tournaments.map((tournament) => (
               <tr key={tournament.id} className="hover:bg-gray-50 transition-colors">
                 {/* Información del torneo */}
                 <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex items-center">
                     <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                       <Trophy className="w-5 h-5 text-primary-600" />
                     </div>
                     <div>
                       <div className="text-sm font-medium text-gray-900">
                         {tournament.nombre || 'Sin nombre'}
                       </div>
                       <div className="text-sm text-gray-500">
                         {tournament.descripcion || 'Sin descripción'}
                       </div>
                     </div>
                   </div>
                 </td>

                 {/* Acciones */}
                 <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                   <div className="flex items-center justify-center space-x-2">
                     <button
                       onClick={() => onView(tournament.id)}
                       className="text-primary-600 hover:text-primary-900 p-1 rounded"
                       title="Ver detalles"
                     >
                       <Eye className="w-4 h-4" />
                     </button>
                     <button
                       onClick={() => onEdit(tournament.id)}
                       className="text-gray-600 hover:text-gray-900 p-1 rounded"
                       title="Editar"
                     >
                       <Edit className="w-4 h-4" />
                     </button>
                     <button
                       onClick={() => onManualSeeding(tournament)}
                       className="text-blue-600 hover:text-blue-900 p-1 rounded"
                       title="Configurar emparejamientos"
                     >
                       <Settings className="w-4 h-4" />
                     </button>
                     {tournament.estado === 'Pendiente' && (
                       <button
                         onClick={() => onStartTournament(tournament.id)}
                         className="text-green-600 hover:text-green-900 p-1 rounded"
                         title="Iniciar Torneo"
                       >
                         <Play className="w-4 h-4" />
                       </button>
                     )}
                     <button
                       onClick={() => onDelete(tournament.id)}
                       className="text-red-600 hover:text-red-900 p-1 rounded"
                       title="Eliminar"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
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

export default TournamentsTable;
