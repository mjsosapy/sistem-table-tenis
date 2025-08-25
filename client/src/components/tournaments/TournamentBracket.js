import React from 'react';
import { Trophy, User, CheckCircle, Clock, X } from 'lucide-react';

const MatchBox = ({ match, onRegisterResult, onViewResult }) => {
  const getMatchStatus = (status) => {
    switch (status) {
      case 'Finalizado':
        return { icon: <CheckCircle className="w-4 h-4 text-green-600" />, text: 'Finalizado', color: 'text-green-600' };
      case 'En curso':
        return { icon: <Clock className="w-4 h-4 text-yellow-600" />, text: 'En curso', color: 'text-yellow-600' };
      case 'Pendiente':
        return { icon: <Clock className="w-4 h-4 text-gray-400" />, text: 'Pendiente', color: 'text-gray-400' };
      default:
        return { icon: <X className="w-4 h-4 text-gray-400" />, text: 'Error', color: 'text-gray-400' };
    }
  };

  const status = getMatchStatus(match.estado);

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg shadow-md p-4 min-w-[220px] relative z-10">
      {/* Header del partido */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {match.ronda === 1 ? 'Primera Ronda' : 
           match.ronda === 2 ? 'Semifinal' : 
           match.ronda === 3 ? 'Final' : `Ronda ${match.ronda}`}
        </span>
        <div className="flex items-center space-x-1">
          {status.icon}
          <span className={`text-xs font-medium ${status.color}`}>{status.text}</span>
        </div>
      </div>

      {/* Jugador 1 */}
      <div className={`
        flex items-center justify-between p-3 rounded-lg mb-2 border
        ${match.ganadorId === match.jugador1Id ? 'bg-green-100 border-green-300' : 'bg-gray-50 border-gray-200'}
      `}>
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold truncate">
            {match.jugador1?.name || match.jugador1?.nombre || 'TBD'}
          </span>
        </div>
        {match.ganadorId === match.jugador1Id && (
          <Trophy className="w-4 h-4 text-yellow-500" />
        )}
      </div>

      {/* Jugador 2 */}
      <div className={`
        flex items-center justify-between p-3 rounded-lg border
        ${match.ganadorId === match.jugador2Id ? 'bg-green-100 border-green-300' : 'bg-gray-50 border-gray-200'}
      `}>
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold truncate">
            {match.jugador2?.name || match.jugador2?.nombre || 'TBD'}
          </span>
        </div>
        {match.ganadorId === match.jugador2Id && (
          <Trophy className="w-4 h-4 text-yellow-500" />
        )}
      </div>

      {/* Resultado si está finalizado */}
      {match.estado === 'Finalizado' && (
        <div className="mt-3 pt-2 border-t border-gray-200">
          <div className="flex items-center justify-center text-sm font-bold text-gray-700">
            <span className="bg-blue-100 px-3 py-1 rounded">{match.setsJ1 || 0}</span>
            <span className="mx-2">vs</span>
            <span className="bg-blue-100 px-3 py-1 rounded">{match.setsJ2 || 0}</span>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="mt-3 pt-2 border-t border-gray-200">
        {match.estado === 'Pendiente' && (
          <button
            onClick={() => onRegisterResult(match)}
            className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Registrar Resultado
          </button>
        )}
        {match.estado === 'Finalizado' && (
          <button
            onClick={() => onViewResult(match)}
            className="w-full px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
          >
            Ver Resultado
          </button>
        )}
      </div>
    </div>
  );
};

const TournamentBracket = ({ matches, onRegisterResult, onViewResult }) => {
  // Organizar partidos por rondas
  const organizeMatchesByRound = (matches) => {
    const rounds = {};
    matches.forEach(match => {
      if (!rounds[match.ronda]) {
        rounds[match.ronda] = [];
      }
      rounds[match.ronda].push(match);
    });
    return rounds;
  };

  const rounds = organizeMatchesByRound(matches);
  const roundNumbers = Object.keys(rounds).sort((a, b) => parseInt(a) - parseInt(b));

  if (matches.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-6xl mb-4">🏓</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay partidos</h3>
        <p className="text-gray-600">El bracket aún no ha sido generado para este torneo.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-xl">
      {/* Título del bracket */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center space-x-3 mb-3">
          <Trophy className="w-10 h-10 text-yellow-500" />
          <h2 className="text-3xl font-bold text-gray-900">Bracket del Torneo</h2>
          <Trophy className="w-10 h-10 text-yellow-500" />
        </div>
        <p className="text-lg text-gray-600 font-medium">Eliminación Directa</p>
      </div>

      {/* Bracket visual tipo árbol */}
      <div className="flex justify-center">
        <div className="flex space-x-16 min-w-max">
          {roundNumbers.map((roundNumber, roundIndex) => (
            <div key={roundNumber} className="flex flex-col">
              {/* Título de la ronda */}
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {roundNumber === '1' ? 'Primera Ronda' : 
                   roundNumber === '2' ? 'Semifinales' :
                   roundNumber === '3' ? 'Final' :
                   `Ronda ${roundNumber}`}
                </h3>
                <div className="bg-white px-4 py-2 rounded-full inline-block shadow-sm">
                  <span className="text-sm font-medium text-gray-600">
                    {rounds[roundNumber].length} partido{rounds[roundNumber].length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Partidos de la ronda */}
              <div className="flex flex-col space-y-16">
                {rounds[roundNumber].map((match, matchIndex) => (
                  <div key={match.id} className="relative">
                    <MatchBox
                      match={match}
                      onRegisterResult={onRegisterResult}
                      onViewResult={onViewResult}
                    />
                    
                    {/* Líneas de conexión hacia la siguiente ronda */}
                    {roundIndex < roundNumbers.length - 1 && (
                      <div className="absolute top-1/2 -right-8 w-8 h-0.5 bg-gray-400 transform -translate-y-1/2"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trofeo central para el ganador final */}
      {roundNumbers.length > 0 && (
        <div className="flex justify-center mt-12">
          <div className="text-center">
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 border-4 border-yellow-300 rounded-full p-6 inline-block shadow-lg">
              <Trophy className="w-16 h-16 text-yellow-600" />
            </div>
            <p className="text-lg font-bold text-gray-800 mt-3">🏆 Ganador Final</p>
          </div>
        </div>
      )}

      {/* Leyenda */}
      <div className="mt-12 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">Leyenda</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium">Finalizado</span>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="font-medium">En curso</span>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="font-medium">Pendiente</span>
          </div>
          <div className="flex items-center space-x-3">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-medium">Ganador</span>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {matches.filter(m => m.estado === 'Finalizado').length}
          </div>
          <div className="text-sm text-gray-600 font-medium">Partidos completados</div>
        </div>
        <div className="text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {matches.filter(m => m.estado === 'En curso').length}
          </div>
          <div className="text-sm text-gray-600 font-medium">Partidos en curso</div>
        </div>
        <div className="text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-3xl font-bold text-gray-600 mb-2">
            {matches.filter(m => m.estado === 'Pendiente').length}
          </div>
          <div className="text-sm text-gray-600 font-medium">Partidos pendientes</div>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;
