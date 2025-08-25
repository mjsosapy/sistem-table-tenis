import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import {
  Trophy,
  Users,
  BarChart3,
  Calendar,
  TrendingUp,
  Award,
  Play,
  Plus
} from 'lucide-react';
import ActivityFeed from '../components/common/ActivityFeed';

const Dashboard = () => {
  const { data: stats } = useQuery('dashboard-stats', async () => {
    const response = await api.get('/ranking/stats');
    return response.data.stats;
  }, {
    refetchInterval: 30000, // Refrescar cada 30 segundos
    staleTime: 10000 // Considerar datos obsoletos después de 10 segundos
  });

  const { data: topPlayers } = useQuery('top-players', async () => {
    const response = await api.get('/ranking/top');
    return response.data.topPlayers;
  });

  const { data: recentTournaments } = useQuery('recent-tournaments', async () => {
    const response = await api.get('/tournaments?limit=5');
    return response.data.tournaments;
  });

  const { data: leaders } = useQuery('leaders', async () => {
    const response = await api.get('/ranking/leaders');
    return response.data.leaders;
  }, {
    refetchInterval: 30000, // Refrescar cada 30 segundos
    staleTime: 10000 // Considerar datos obsoletos después de 10 segundos
  });

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-md ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
              {description && (
                <dd className="text-sm text-gray-500">{description}</dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, href, color }) => (
    <Link
      to={href}
      className="card hover:shadow-lg transition-shadow duration-200"
    >
      <div className="card-body">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-md ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Bienvenido al Sistema de Gestión de Torneos de Tenis de Mesa
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Jugadores"
          value={stats?.players?.total || 0}
          icon={Users}
          color="bg-primary-500"
        />
        <StatCard
          title="Torneos Activos"
          value={stats?.tournaments?.total || 0}
          icon={Trophy}
          color="bg-success-500"
          description={`${stats?.tournaments?.completed || 0} completados`}
        />
        <StatCard
          title="Partidos Jugados"
          value={stats?.matches?.total || 0}
          icon={Play}
          color="bg-warning-500"
          description={`${stats?.matches?.completed || 0} finalizados`}
        />
        <StatCard
          title="Líder en Puntos"
          value={leaders?.points?.puntos || 0}
          icon={TrendingUp}
          color="bg-danger-500"
          description={leaders?.points?.nombre || 'N/A'}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            title="Crear Torneo"
            description="Organiza un nuevo torneo"
            icon={Plus}
            href="/tournaments"
            color="bg-primary-500"
          />
          <QuickActionCard
            title="Ver Ranking"
            description="Consulta el ranking actual"
            icon={BarChart3}
            href="/ranking"
            color="bg-success-500"
          />
          <QuickActionCard
            title="Gestionar Jugadores"
            description="Administra jugadores"
            icon={Users}
            href="/players"
            color="bg-warning-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Players */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Top 5 Jugadores</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {topPlayers?.slice(0, 5).map((player, index) => (
                <div key={player.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-100">
                      <span className="text-sm font-medium text-primary-600">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{player.nombre}</p>
                      <p className="text-sm text-gray-500">Ranking: #{player.ranking}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{player.puntos} pts</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link
                to="/ranking"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Ver ranking completo →
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Tournaments */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Torneos Recientes</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {recentTournaments?.map((tournament) => (
                <div key={tournament.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-success-100">
                      <Trophy className="h-4 w-4 text-success-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{tournament.nombre}</p>
                      <p className="text-sm text-gray-500">{tournament.tipo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${
                      tournament.estado === 'Finalizado' ? 'badge-success' :
                      tournament.estado === 'En curso' ? 'badge-warning' :
                      'badge-info'
                    }`}>
                      {tournament.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link
                to="/tournaments"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Ver todos los torneos →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed and Leaders Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>

        {/* Leaders Section */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Líderes del Sistema</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary-100 mb-3">
                    <Award className="h-6 w-6 text-primary-600" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Más Puntos</h4>
                  <p className="text-lg font-semibold text-primary-600 truncate">
                    {leaders?.points?.nombre || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">{leaders?.points?.puntos || 0} puntos</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-success-100 mb-3">
                    <TrendingUp className="h-6 w-6 text-success-600" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Mejor Ranking</h4>
                  <p className="text-lg font-semibold text-success-600 truncate">
                    {leaders?.ranking?.nombre || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">Ranking #{leaders?.ranking?.ranking || 'N/A'}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg sm:col-span-2 lg:col-span-1">
                  <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-warning-100 mb-3">
                    <Play className="h-6 w-6 text-warning-600" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Más Activo</h4>
                  <p className="text-lg font-semibold text-warning-600 truncate">
                    {leaders?.mostActive?.nombre || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">{leaders?.mostActive?.totalMatches || 0} partidos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

