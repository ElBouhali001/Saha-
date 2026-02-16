import React from 'react';
import { cn } from '@/lib/utils';

interface VoiceIndicatorProps {
  isListening?: boolean;
  isProcessing?: boolean;
  isSpeaking?: boolean;
  className?: string;
}

const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({
  isListening = false,
  isProcessing = false,
  isSpeaking = false,
  className
}) => {
  const getStatus = () => {
    if (isListening) return 'listening';
    if (isProcessing) return 'processing';
    if (isSpeaking) return 'speaking';
    return 'idle';
  };

  const status = getStatus();

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {/* Animation d'onde vocale */}
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-1 bg-current rounded-full transition-all duration-150",
              status === 'listening' && "animate-pulse",
              status === 'processing' && "animate-bounce",
              status === 'speaking' && "animate-pulse",
              // Hauteurs différentes pour l'effet d'onde
              i === 0 && "h-4",
              i === 1 && "h-6",
              i === 2 && "h-8",
              i === 3 && "h-6", 
              i === 4 && "h-4",
              // Couleurs selon le statut
              status === 'listening' && "text-red-500",
              status === 'processing' && "text-blue-500",
              status === 'speaking' && "text-green-500",
              status === 'idle' && "text-gray-400"
            )}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: status === 'speaking' ? '0.6s' : '1s'
            }}
          />
        ))}
      </div>

      {/* Cercle pulsant pour l'état d'écoute */}
      {isListening && (
        <div className="absolute inset-0 rounded-full">
          <div className="absolute inset-0 rounded-full bg-red-500 opacity-25 animate-ping" />
          <div className="absolute inset-0 rounded-full bg-red-500 opacity-50 animate-pulse" />
        </div>
      )}

      {/* Indicateur de traitement */}
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default VoiceIndicator;