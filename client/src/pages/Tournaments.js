import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Users, Trophy, Play, Pause } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../utils/api';
import CreateTournamentModal from '../components/tournaments/CreateTournamentModal';
import ManualSeedingModal from '../components/tournaments/ManualSeedingModal';
import TournamentsTable from '../components/tournaments/TournamentsTable';
import TournamentFilters from '../components/tournaments/TournamentFilters';
import TournamentStatusModal from '../components/tournaments/TournamentStatusModal';

const Tournaments = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showManualSeedingModal, setShowManualSeedingModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    search: ''
  });
  const [sortBy, setSortBy] = useState('nombre');
  const [sortOrder, setSortOrder] = useState('asc');
  const queryClient = useQueryClient();

  // Fetch tournaments
  const { data: tournamentsData, isLoading, error } = useQuery(
    ['tournaments', filters, sortBy, sortOrder],
    () => api.get('/tournaments', { params: { ...filters, sortBy, sortOrder } }).then(res => res.data),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const tournaments = tournamentsData?.tournaments || [];

  // Delete tournament mutation
  const deleteMutation = useMutation(
    ({ id, force }) => {
      const url = force ? `/tournaments/${id}?force=true` : `/tournaments/${id}`;
      return api.delete(url);
    },
    {
      onSuccess: (data) => {
        const message = data.pointsRemoved > 0 
          ? `Torneo eliminado exitosamente. Se restaron ${data.totalPointsRemoved} puntos de ${data.pointsRemoved} jugadores.`
          : 'Torneo eliminado exitosamente';
        toast.success(message);
        queryClient.invalidateQueries('tournaments');
        queryClient.invalidateQueries('ranking'); // Actualizar ranking también
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error al eliminar el torneo';
        toast.error(errorMessage);
      }
    }
  );

  // Update tournament status mutation
  const updateStatusMutation = useMutation(
    ({ id, status }) => api.put(`/tournaments/${id}`, { status }),
    {
      onSuccess: () => {
        toast.success('Estado del torneo actualizado');
        queryClient.invalidateQueries('tournaments');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al actualizar el estado');
      }
    }
  );

  const handleDelete = (id) => {
    const tournament = tournaments.find(t => t.id === id);
    const hasMatches = tournament?._count?.matches > 0;
    
    if (hasMatches) {
      const confirmForce = window.confirm(
        'Este torneo tiene partidos asociados. ¿Quieres eliminar el torneo, todos sus partidos Y los puntos de ranking de los jugadores? Esta acción no se puede deshacer.'
      );
      
      if (confirmForce) {
        deleteMutation.mutate({ id, force: true });
      }
      return;
    }
    
    if (window.confirm('¿Estás seguro de que quieres eliminar este torneo? También se eliminarán los puntos de ranking de los jugadores. Esta acción no se puede deshacer.')) {
      deleteMutation.mutate({ id, force: false });
    }
  };

  const handleStatusChange = (id, newStatus) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleManualSeeding = (tournament) => {
    setSelectedTournament(tournament);
    setShowManualSeedingModal(true);
  };

  const handleStartTournament = (id) => {
    if (window.confirm('¿Estás seguro de que quieres iniciar este torneo? Esta acción no se puede deshacer.')) {
      updateStatusMutation.mutate({ id, status: 'En curso' });
    }
  };

  const handleEdit = (id) => {
    const tournament = tournaments.find(t => t.id === id);
    if (tournament) {
      setSelectedTournament(tournament);
      setShowCreateModal(true);
    }
  };

  const handleViewTournament = (id) => {
    navigate(`/tournaments/${id}`);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };



  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar torneos</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">Torneos</h1>
          <p className="text-gray-600">Gestiona todos los torneos del sistema</p>
        </div>
                    <div className="flex space-x-3">
              <button
                onClick={() => setShowStatusModal(true)}
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
              >
                <Trophy className="w-5 h-5 mr-2" />
                Estado Torneos
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Crear Torneo
              </button>
            </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Torneos</p>
              <p className="text-2xl font-bold text-gray-900">{tournaments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Play className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {tournaments.filter(t => t.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Pause className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pausados</p>
              <p className="text-2xl font-bold text-gray-900">
                {tournaments.filter(t => t.status === 'paused').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completados</p>
              <p className="text-2xl font-bold text-gray-900">
                {tournaments.filter(t => t.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <TournamentFilters filters={filters} onFiltersChange={setFilters} />

      {/* Tournaments Table */}
      <TournamentsTable
        tournaments={tournaments}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onView={handleViewTournament}
        onStatusChange={handleStatusChange}
        onManualSeeding={handleManualSeeding}
        onStartTournament={handleStartTournament}
        isLoading={isLoading}
        onCreateNew={() => setShowCreateModal(true)}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      {/* Create/Edit Tournament Modal */}
      {showCreateModal && (
        <CreateTournamentModal
          tournament={selectedTournament}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedTournament(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setSelectedTournament(null);
            queryClient.invalidateQueries('tournaments');
          }}
        />
      )}

      {/* Manual Seeding Modal */}
      {showManualSeedingModal && selectedTournament && (
        <ManualSeedingModal
          tournament={selectedTournament}
          isOpen={showManualSeedingModal}
          onClose={() => {
            setShowManualSeedingModal(false);
            setSelectedTournament(null);
          }}
          onSuccess={() => {
            setShowManualSeedingModal(false);
            setSelectedTournament(null);
            queryClient.invalidateQueries('tournaments');
          }}
        />
      )}
      
      <TournamentStatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
      />
    </div>
  );
};

export default Tournaments;

