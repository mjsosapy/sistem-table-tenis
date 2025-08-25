import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';

const ConnectionStatus = () => {
  const { isConnected } = useSocket();

  if (isConnected) {
    return (
      <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">
        <Wifi className="w-3 h-3" />
        <span>En línea</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs">
      <WifiOff className="w-3 h-3" />
      <span>Desconectado</span>
    </div>
  );
};

export default ConnectionStatus;
