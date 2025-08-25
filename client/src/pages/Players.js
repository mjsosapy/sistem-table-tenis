import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, User, Upload, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import CreatePlayerModal from '../components/players/CreatePlayerModal';
import EditPlayerModal from '../components/players/EditPlayerModal';
import PlayersTable from '../components/players/PlayersTable';
import PlayerFilters from '../components/players/PlayerFilters';
import ImportPlayersModal from '../components/players/ImportPlayersModal';

const Players = () => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [filters, setFilters] = useState({
    role: 'all',
    search: '',
    status: 'active'
  });
  const [sortBy, setSortBy] = useState('nombre');
  const [sortOrder, setSortOrder] = useState('asc');
  const queryClient = useQueryClient();

  // Fetch players
  const { data: playersData, isLoading, error } = useQuery(
    ['players', filters, sortBy, sortOrder],
    () => api.get('/players', { params: { ...filters, sortBy, sortOrder } }).then(res => res.data),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const players = playersData?.players || [];

  // Delete player mutation
  const deleteMutation = useMutation(
    (id) => api.delete(`/players/${id}`),
    {
      onSuccess: () => {
        toast.success('Jugador dado de baja exitosamente');
        queryClient.invalidateQueries('players');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al dar de baja al jugador');
      }
    }
  );

  // Reactivate player mutation
  const reactivateMutation = useMutation(
    (id) => api.patch(`/players/${id}/reactivar`),
    {
      onSuccess: () => {
        toast.success('Jugador reactivado exitosamente');
        queryClient.invalidateQueries('players');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al reactivar al jugador');
      }
    }
  );

  // Export players mutation
  const exportMutation = useMutation(
    () => api.get('/players/export/csv', { responseType: 'blob' }),
    {
      onSuccess: (response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `jugadores_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success('Archivo exportado exitosamente');
      },
      onError: (error) => {
        toast.error('Error al exportar jugadores');
      }
    }
  );

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres dar de baja a este jugador? Esta acción puede ser revertida más tarde.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (id) => {
    const player = players.find(p => p.id === id);
    if (player) {
      setSelectedPlayer(player);
      setShowEditModal(true);
    }
  };

  const handleReactivate = (id) => {
    if (window.confirm('¿Estás seguro de que quieres reactivar a este jugador?')) {
      reactivateMutation.mutate(id);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleExport = () => {
    exportMutation.mutate();
  };



  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar jugadores</h3>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jugadores</h1>
          <p className="text-gray-600">Gestiona todos los jugadores del sistema</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 transition-colors"
          >
            <Upload className="w-5 h-5 mr-2" />
            Importar
          </button>
          <button
            onClick={handleExport}
            disabled={exportMutation.isLoading}
            className="inline-flex items-center px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-success-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            <Download className="w-5 h-5 mr-2" />
            {exportMutation.isLoading ? 'Exportando...' : 'Exportar'}
          </button>
                     <button
             onClick={() => setShowCreateModal(true)}
             className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
           >
             <Plus className="w-5 h-5 mr-2" />
             Agregar Jugador
           </button>
        </div>
      </div>

      

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Jugadores</p>
              <p className="text-2xl font-bold text-gray-900">{players.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Jugadores</p>
              <p className="text-2xl font-bold text-gray-900">
                {players.filter(p => p.role === 'jugador').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Árbitros</p>
              <p className="text-2xl font-bold text-gray-900">
                {players.filter(p => p.role === 'arbitro').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <User className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Administradores</p>
              <p className="text-2xl font-bold text-gray-900">
                {players.filter(p => p.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <PlayerFilters filters={filters} onFiltersChange={setFilters} />

             {/* Players Table */}
       <PlayersTable
         players={players}
         onDelete={handleDelete}
         onEdit={handleEdit}
         onView={() => {/* TODO: Navigate to player detail */}}
         onReactivate={handleReactivate}
         isLoading={isLoading}
         onCreateNew={() => setShowCreateModal(true)}
         sortBy={sortBy}
         sortOrder={sortOrder}
         onSort={handleSort}
       />

      {/* Create Player Modal */}
      {showCreateModal && (
        <CreatePlayerModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            queryClient.invalidateQueries('players');
          }}
        />
      )}

      {/* Edit Player Modal */}
      {showEditModal && selectedPlayer && (
        <EditPlayerModal
          player={selectedPlayer}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPlayer(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedPlayer(null);
            queryClient.invalidateQueries('players');
          }}
        />
      )}

      {/* Import Players Modal */}
      {showImportModal && (
        <ImportPlayersModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            queryClient.invalidateQueries('players');
          }}
        />
      )}
    </div>
  );
};

export default Players;

