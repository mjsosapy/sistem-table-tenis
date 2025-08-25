import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Trophy, 
  BarChart3, 
  Edit3, 
  Save, 
  X,
  Lock,
  Eye,
  EyeOff,
  Award,
  TrendingUp,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Obtener estadísticas del jugador
  const { data: playerStats } = useQuery(
    ['player-stats', user?.id],
    async () => {
      if (!user?.id) return null;
      const response = await api.get(`/ranking/player/${user.id}/stats`);
      return response.data;
    },
    { enabled: !!user?.id }
  );

  // Obtener historial del jugador (no utilizado actualmente)
  const { data: playerHistory } = useQuery(
    ['player-history', user?.id],
    async () => {
      if (!user?.id) return null;
      const response = await api.get(`/ranking/player/${user.id}/history`);
      return response.data;
    },
    { enabled: !!user?.id }
  );

  // Función para formatear fechas de forma segura
  const formatDateSafely = (dateString, formatString, options = {}) => {
    if (!dateString) return 'No especificada';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return format(date, formatString, options);
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Formulario de edición de perfil
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile
  } = useForm({
    defaultValues: {
      nombre: user?.nombre || '',
      email: user?.email || '',
      telefono: user?.telefono || '',
      fechaNacimiento: user?.fechaNacimiento ? formatDateSafely(user.fechaNacimiento, 'yyyy-MM-dd') : ''
    }
  });

  // Formulario de cambio de contraseña
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch
  } = useForm();

  const newPassword = watch('newPassword');

  // Mutación para actualizar perfil
  const updateProfileMutation = useMutation(
    async (data) => {
      const response = await api.put('/auth/profile', data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        updateProfile(data.user);
        setIsEditing(false);
        toast.success('Perfil actualizado exitosamente');
        queryClient.invalidateQueries(['player-stats', user?.id]);
        queryClient.invalidateQueries(['player-history', user?.id]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Error al actualizar perfil');
      }
    }
  );

  // Mutación para cambiar contraseña
  const changePasswordMutation = useMutation(
    async (data) => {
      const response = await api.put('/auth/change-password', data);
      return response.data;
    },
    {
      onSuccess: () => {
        setShowPasswordForm(false);
        resetPassword();
        toast.success('Contraseña cambiada exitosamente');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Error al cambiar contraseña');
      }
    }
  );

  const onSubmitProfile = (data) => {
    updateProfileMutation.mutate(data);
  };

  const onSubmitPassword = (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    resetProfile({
      nombre: user?.nombre || '',
      email: user?.email || '',
      telefono: user?.telefono || '',
      fechaNacimiento: user?.fechaNacimiento ? formatDateSafely(user.fechaNacimiento, 'yyyy-MM-dd') : ''
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    resetProfile();
  };

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

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Perfil</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona tu perfil de usuario
          </p>
        </div>
        <div className="card">
          <div className="card-body text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay datos de usuario</h3>
            <p className="mt-1 text-sm text-gray-500">
              Por favor, inicia sesión para ver tu perfil.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona tu información personal y configuración
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="btn btn-primary flex items-center"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Editar Perfil
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Personal */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Información Personal</h3>
            </div>
            <div className="card-body">
              {isEditing ? (
                <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        className={`input ${profileErrors.nombre ? 'border-red-500' : ''}`}
                        {...registerProfile('nombre', {
                          required: 'El nombre es requerido',
                          minLength: {
                            value: 2,
                            message: 'El nombre debe tener al menos 2 caracteres'
                          }
                        })}
                      />
                      {profileErrors.nombre && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.nombre.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        className={`input ${profileErrors.email ? 'border-red-500' : ''}`}
                        {...registerProfile('email', {
                          required: 'El email es requerido',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Email inválido'
                          }
                        })}
                      />
                      {profileErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        className={`input ${profileErrors.telefono ? 'border-red-500' : ''}`}
                        {...registerProfile('telefono', {
                          minLength: {
                            value: 10,
                            message: 'El teléfono debe tener al menos 10 dígitos'
                          }
                        })}
                      />
                      {profileErrors.telefono && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.telefono.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Nacimiento
                      </label>
                      <input
                        type="date"
                        className={`input ${profileErrors.fechaNacimiento ? 'border-red-500' : ''}`}
                        {...registerProfile('fechaNacimiento')}
                      />
                      {profileErrors.fechaNacimiento && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.fechaNacimiento.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn btn-outline"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={updateProfileMutation.isLoading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateProfileMutation.isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Nombre</p>
                        <p className="text-sm text-gray-900">{user.nombre}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-sm text-gray-900">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Teléfono</p>
                        <p className="text-sm text-gray-900">{user.telefono || 'No especificado'}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Fecha de Nacimiento</p>
                        <p className="text-sm text-gray-900">
                          {formatDateSafely(user.fechaNacimiento, 'dd MMMM yyyy', { locale: es })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Rol</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cambiar Contraseña */}
          <div className="card mt-6">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Seguridad</h3>
            </div>
            <div className="card-body">
              {showPasswordForm ? (
                <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña Actual
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          className={`input pr-10 ${passwordErrors.currentPassword ? 'border-red-500' : ''}`}
                          {...registerPassword('currentPassword', {
                            required: 'La contraseña actual es requerida'
                          })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva Contraseña
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          className={`input pr-10 ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
                          {...registerPassword('newPassword', {
                            required: 'La nueva contraseña es requerida',
                            minLength: {
                              value: 6,
                              message: 'La contraseña debe tener al menos 6 caracteres'
                            }
                          })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Nueva Contraseña
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className={`input pr-10 ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
                          {...registerPassword('confirmPassword', {
                            required: 'Debe confirmar la nueva contraseña',
                            validate: value => value === newPassword || 'Las contraseñas no coinciden'
                          })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        resetPassword();
                      }}
                      className="btn btn-outline"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={changePasswordMutation.isLoading}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      {changePasswordMutation.isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Lock className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Contraseña</p>
                      <p className="text-sm text-gray-900">••••••••</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="btn btn-outline"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Cambiar Contraseña
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Estadísticas y Sidebar */}
        <div className="space-y-6">
          {/* Estadísticas del Jugador */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Mis Estadísticas</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart3 className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-500">Ranking</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">#{user.ranking || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Trophy className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-500">Puntos</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{user.puntos || 0}</span>
                </div>

                {playerStats && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Activity className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-500">Partidos Totales</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">{playerStats.matches?.total || 0}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Activity className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-500">Partidos Finalizados</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">{playerStats.matches?.finished || 0}</span>
                    </div>

                    {playerStats.matches?.ongoing > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Activity className="h-5 w-5 text-yellow-400 mr-3" />
                          <span className="text-sm text-gray-500">Partidos En Curso</span>
                        </div>
                        <span className="text-lg font-semibold text-yellow-600">{playerStats.matches.ongoing}</span>
                      </div>
                    )}

                    {playerStats.matches?.pending > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Activity className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-500">Partidos Pendientes</span>
                        </div>
                        <span className="text-lg font-semibold text-gray-600">{playerStats.matches.pending}</span>
                      </div>
                    )}

                    {playerStats.matches?.finished > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <TrendingUp className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-500">Porcentaje Victoria</span>
                        </div>
                        <span className="text-lg font-semibold text-gray-900">{playerStats.matches?.winRate || 0}%</span>
                      </div>
                    )}

                    {/* Información sobre puntos */}
                    {playerStats.points && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Origen de los puntos:</strong>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">De partidos:</span>
                            <span className="font-medium">{playerStats.points.fromMatches || 0}</span>
                          </div>
                          {playerStats.points.fromManual > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Asignados manualmente:</span>
                              <span className="font-medium text-blue-600">{playerStats.points.fromManual}</span>
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-2">
                            {playerStats.points.explanation}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Información de la Cuenta */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Información de la Cuenta</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">ID de Usuario</p>
                  <p className="text-sm text-gray-900">{user.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Miembro desde</p>
                  <p className="text-sm text-gray-900">
                    {formatDateSafely(user.createdAt, 'dd MMM yyyy', { locale: es })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;



