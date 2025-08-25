import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { X, Calendar, Users, Trophy, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../utils/api';

const CreateTournamentModal = ({ onClose, onSuccess, tournament = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();

  const tournamentType = watch('type');

  const isEditing = Boolean(tournament);

  // Cargar datos del torneo cuando se está editando
  useEffect(() => {
    if (tournament) {
      // Mapeo inverso del backend al frontend
      const typeMapping = {
        'Eliminación directa': 'elimination',
        'Doble eliminación': 'double_elimination',
        'Round Robin': 'round_robin',
        'Grupos + Eliminación': 'groups_elimination'
      };
      
      reset({
        name: tournament.nombre || '',
        description: tournament.descripcion || '',
        type: typeMapping[tournament.tipo] || 'elimination',
        startDate: tournament.fechaInicio ? new Date(tournament.fechaInicio).toISOString().split('T')[0] : '',
        endDate: tournament.fechaFin ? new Date(tournament.fechaFin).toISOString().split('T')[0] : '',
        maxPlayers: tournament.maxJugadores || 16,
        setsToWin: tournament.setsPorPartido || 3
      });
    }
  }, [tournament, reset]);

  const createTournamentMutation = useMutation(
    (data) => {
      if (isEditing) {
        return api.put(`/tournaments/${tournament.id}`, data);
      } else {
        return api.post('/tournaments', data);
      }
    },
    {
      onSuccess: () => {
        toast.success(isEditing ? 'Torneo actualizado exitosamente' : 'Torneo creado exitosamente');
        reset();
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el torneo`);
        setIsSubmitting(false);
      }
    }
  );

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    // Convert dates to ISO strings
    const tournamentData = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      maxPlayers: parseInt(data.maxPlayers),
      setsToWin: parseInt(data.setsToWin),
      pointsToWin: 11 // Valor fijo para tenis de mesa
    };

    createTournamentMutation.mutate(tournamentData);
  };

  const tournamentTypes = [
    { value: 'elimination', label: 'Eliminación Simple', description: 'Los jugadores que pierden quedan eliminados' },
    { value: 'double_elimination', label: 'Doble Eliminación', description: 'Los jugadores deben perder dos veces para quedar eliminados' },
    { value: 'round_robin', label: 'Todos contra Todos', description: 'Cada jugador juega contra todos los demás' },
    { value: 'groups_elimination', label: 'Grupos + Eliminación', description: 'Primero grupos, luego eliminación' }
  ];

  const setsOptions = [
    { value: 3, label: 'Al mejor de 3' },
    { value: 5, label: 'Al mejor de 5' },
    { value: 7, label: 'Al mejor de 7' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Trophy className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-3">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Editar Torneo' : 'Crear Nuevo Torneo'}
              </h2>
              <p className="text-sm text-gray-600">
                {isEditing ? 'Modifica los detalles del torneo' : 'Configura los detalles del torneo'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Información Básica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Torneo *
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'El nombre es requerido' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ej: Torneo de Verano 2024"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Torneo *
                </label>
                <select
                  {...register('type', { required: 'El tipo es requerido' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Selecciona un tipo</option>
                  {tournamentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>
            </div>

            {tournamentType && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  {tournamentTypes.find(t => t.value === tournamentType)?.description}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe el torneo, reglas especiales, premios, etc."
              />
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Fechas del Torneo
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Inicio *
                </label>
                <input
                  type="datetime-local"
                  {...register('startDate', { required: 'La fecha de inicio es requerida' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Fin *
                </label>
                <input
                  type="datetime-local"
                  {...register('endDate', { required: 'La fecha de fin es requerida' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Players and Game Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Jugadores y Configuración
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Máximo de Jugadores *
                </label>
                <input
                  type="number"
                  min="2"
                  max="128"
                  {...register('maxPlayers', { 
                    required: 'El máximo de jugadores es requerido',
                    min: { value: 2, message: 'Mínimo 2 jugadores' },
                    max: { value: 128, message: 'Máximo 128 jugadores' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="16"
                />
                {errors.maxPlayers && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxPlayers.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sets para Ganar *
                </label>
                <select
                  {...register('setsToWin', { required: 'Los sets son requeridos' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Selecciona</option>
                  {setsOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.setsToWin && (
                  <p className="mt-1 text-sm text-red-600">{errors.setsToWin.message}</p>
                )}
              </div>
            </div>

            {/* Información sobre reglas del tenis de mesa */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Reglas del Tenis de Mesa
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>• Cada set se juega hasta 11 puntos</p>
                    <p>• En caso de empate (10-10), se necesita 2 puntos de diferencia</p>
                    <p>• El formato estándar es "al mejor de 3 sets"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Cancelar
            </button>
                            <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar Torneo' : 'Crear Torneo')}
                </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTournamentModal;
