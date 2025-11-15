
import React from 'react';
import { ConnectionStatus } from '../types';

interface StatusIndicatorProps {
  status: ConnectionStatus;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const getStatusInfo = () => {
    switch (status) {
      case ConnectionStatus.CONNECTING:
        return { color: 'bg-yellow-500', text: 'Connecting...' };
      case ConnectionStatus.CONNECTED:
        return { color: 'bg-blue-500', text: 'Connected' };
      case ConnectionStatus.STREAMING:
        return { color: 'bg-green-500', text: 'Streaming Audio' };
      case ConnectionStatus.DISCONNECTED:
        return { color: 'bg-gray-500', text: 'Disconnected' };
      case ConnectionStatus.ERROR:
        return { color: 'bg-red-500', text: 'Error' };
      default:
        return { color: 'bg-gray-500', text: 'Unknown' };
    }
  };

  const { color, text } = getStatusInfo();

  return (
    <div className="flex items-center gap-3">
      <span className={`w-4 h-4 rounded-full ${color} relative flex`}>
        {(status === ConnectionStatus.CONNECTING || status === ConnectionStatus.STREAMING) && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}></span>
        )}
      </span>
      <span className="text-lg font-medium text-white">{text}</span>
    </div>
  );
};

export default StatusIndicator;
