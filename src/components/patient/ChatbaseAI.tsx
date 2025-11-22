import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';

interface ChatbaseAIProps {
  chatbotId: string;
  className?: string;
}

const ChatbaseAI: React.FC<ChatbaseAIProps> = ({ chatbotId, className = '' }) => {
  useEffect(() => {
    // Charger le script Chatbase
    const script = document.createElement('script');
    script.src = 'https://www.chatbase.co/embed.min.js';
    script.setAttribute('chatbotId', chatbotId);
    script.setAttribute('domain', 'www.chatbase.co');
    script.defer = true;

    document.body.appendChild(script);

    // Configuration du widget
    window.embeddedChatbotConfig = {
      chatbotId: chatbotId,
      domain: 'www.chatbase.co'
    };

    return () => {
      // Nettoyage à la sortie du composant
      const existingScript = document.querySelector(`script[chatbotId="${chatbotId}"]`);
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
      // Supprimer le widget iframe
      const chatbaseIframe = document.querySelector('iframe[src*="chatbase.co"]');
      if (chatbaseIframe) {
        chatbaseIframe.remove();
      }
    };
  }, [chatbotId]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Bot className="w-5 h-5 text-primary" />
          <span>Assistant Médical IA</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">
          Posez vos questions à notre assistant IA pendant la consultation. Il peut vous aider avec des informations générales sur votre santé.
        </div>
        <div id="chatbase-widget-container" className="min-h-[400px]">
          {/* Le widget Chatbase sera injecté ici */}
        </div>
      </CardContent>
    </Card>
  );
};

// Déclaration TypeScript pour la configuration du widget
declare global {
  interface Window {
    embeddedChatbotConfig?: {
      chatbotId: string;
      domain: string;
    };
  }
}

export default ChatbaseAI;
