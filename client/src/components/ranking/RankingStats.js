import React from 'react';
import { Users, Trophy, TrendingUp, Target, Download } from 'lucide-react';

const RankingStats = ({ stats = {} }) => {
  const exportRanking = () => {
    // Función para exportar el ranking (se puede implementar más tarde)
    console.log('Exportar ranking');
  };

  return (
    <div className="mb-8">
      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Jugadores</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalPlayers !== undefined ? stats.totalPlayers : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Torneos Jugados</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalTournaments !== undefined ? stats.totalTournaments : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Puntos Totales</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalPoints !== undefined ? stats.totalPoints : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Promedio Puntos</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averagePoints !== undefined ? stats.averagePoints : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de exportar */}
      <div className="flex justify-end">
        <button
          onClick={exportRanking}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          <Download className="w-5 h-5 mr-2" />
          Exportar Ranking
        </button>
      </div>
    </div>
  );
};

export default RankingStats;

