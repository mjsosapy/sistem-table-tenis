import React from 'react';
import { Trophy, Medal, TrendingUp, TrendingDown } from 'lucide-react';

const RankingTable = ({ data = [] }) => {
  const getPositionIcon = (position) => {
    if (position === 1) {
      return <Trophy className="w-4 h-4 text-yellow-500" />;
    } else if (position === 2) {
      return <Medal className="w-4 h-4 text-gray-400" />;
    } else if (position === 3) {
      return <Medal className="w-4 h-4 text-amber-600" />;
    }
    return null;
  };

  const getCountryCode = (player) => {
    // Simular códigos de país basados en el nombre o email
    const email = player.email || '';
    if (email.includes('china') || email.includes('chinese')) return 'CN';
    if (email.includes('japan') || email.includes('japanese')) return 'JP';
    if (email.includes('brazil') || email.includes('brazilian')) return 'BR';
    if (email.includes('france') || email.includes('french')) return 'FR';
    if (email.includes('spain') || email.includes('spanish')) return 'ES';
    if (email.includes('germany') || email.includes('german')) return 'DE';
    if (email.includes('usa') || email.includes('american')) return 'US';
    if (email.includes('uk') || email.includes('british')) return 'GB';
    if (email.includes('italy') || email.includes('italian')) return 'IT';
    if (email.includes('korea') || email.includes('korean')) return 'KR';
    
    // Por defecto, asignar códigos basados en el índice para simular variedad
    const codes = ['CN', 'JP', 'BR', 'FR', 'ES', 'DE', 'US', 'GB', 'IT', 'KR'];
    return codes[player.id % codes.length];
  };

  const getCountryName = (countryCode) => {
    const names = {
      'CN': 'China',
      'JP': 'Japan',
      'BR': 'Brazil',
      'FR': 'France',
      'ES': 'Spain',
      'DE': 'Germany',
      'US': 'United States',
      'GB': 'United Kingdom',
      'IT': 'Italy',
      'KR': 'South Korea'
    };
    return names[countryCode] || 'Unknown';
  };

  const getPositionChange = (player, currentIndex) => {
    // Simular cambios de posición basados en el ID del jugador
    // En un sistema real, esto vendría de la base de datos
    const change = (player.id % 5) - 2; // Simular cambios de -2 a +2 posiciones
    
    if (change === 0) return null;
    
    return {
      direction: change > 0 ? 'up' : 'down',
      positions: Math.abs(change)
    };
  };

  if (data.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500 text-lg">No hay datos de ranking disponibles</div>
        <div className="text-gray-400 text-sm mt-2">Los jugadores aparecerán aquí una vez que participen en torneos</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header de la tabla */}
      <div className="bg-gradient-to-r from-green-700 to-green-800 px-6 py-4">
        <h3 className="text-white font-semibold text-lg">Ranking de Jugadores</h3>
        <p className="text-green-100 text-sm mt-1">Clasificación oficial del sistema</p>
      </div>

      {/* Tabla con Assoc como última columna */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Points
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Assoc
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((player, index) => {
              const countryCode = getCountryCode(player);
              const countryName = getCountryName(countryCode);
              const positionChange = getPositionChange(player, index);
              
              return (
                <tr key={player.id} className="hover:bg-gray-50 transition-colors">
                  {/* Rank con tendencia */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getPositionIcon(index + 1)}
                      <span className="ml-2 text-sm font-semibold text-gray-900">
                        {index + 1}
                      </span>
                      {positionChange && (
                        <div className="ml-2 flex items-center">
                          {positionChange.direction === 'up' ? (
                            <div className="flex items-center text-green-600">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              <span className="text-xs font-medium">+{positionChange.positions}</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-red-600">
                              <TrendingDown className="w-3 h-3 mr-1" />
                              <span className="text-xs font-medium">-{positionChange.positions}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {player.name || 'Jugador Desconocido'}
                    </div>
                  </td>

                  {/* Points */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {player.points || 0}
                    </div>
                  </td>

                  {/* Assoc - Última columna con banderas reales */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {/* Imagen de bandera */}
                      <img 
                        src={`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`}
                        alt={`Bandera de ${countryName}`}
                        className="w-6 h-4 mr-3 rounded-sm shadow-sm"
                        onError={(e) => {
                          // Fallback si la imagen no carga
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      {/* Fallback con emoji si la imagen no carga */}
                      <span 
                        className="text-lg mr-3 hidden"
                        style={{ fontSize: '1.2rem' }}
                      >
                        {countryCode === 'US' ? '🇺🇸' : 
                         countryCode === 'CN' ? '🇨🇳' :
                         countryCode === 'JP' ? '🇯🇵' :
                         countryCode === 'BR' ? '🇧🇷' :
                         countryCode === 'FR' ? '🇫🇷' :
                         countryCode === 'ES' ? '🇪🇸' :
                         countryCode === 'DE' ? '🇩🇪' :
                         countryCode === 'GB' ? '🇬🇧' :
                         countryCode === 'IT' ? '🇮🇹' :
                         countryCode === 'KR' ? '🇰🇷' : '🏳️'}
                      </span>
                      <span className="text-sm text-gray-900 font-medium">{countryCode}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer con estadísticas */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Total de jugadores: {data.length}</span>
          <span>Última actualización: {new Date().toLocaleDateString('es-ES')}</span>
        </div>
      </div>
    </div>
  );
};

export default RankingTable;
