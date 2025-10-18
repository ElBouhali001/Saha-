import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Video, Phone, MessageSquare, Camera, Send } from 'lucide-react';

const MVPPatientTeleconsult = () => {
  const [inCall, setInCall] = useState(false);
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleStartCall = () => {
    setInCall(true);
    toast({
      title: "Appel vidéo initié",
      description: "Connexion au médecin...",
    });
  };

  const handleEndCall = () => {
    setInCall(false);
    toast({
      title: "Appel terminé",
      description: "Ordonnance envoyée par SMS",
    });
  };

  if (inCall) {
    return (
      <div className="min-h-screen bg-black relative">
        {/* Video placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <Video className="w-16 h-16 mx-auto mb-4 animate-pulse" />
            <p className="text-lg font-semibold">Dr. Aminata Diallo</p>
            <p className="text-sm text-gray-400">En consultation...</p>
          </div>
        </div>

        {/* Self view */}
        <div className="absolute top-4 right-4 w-32 h-40 bg-gray-700 rounded-lg border-2 border-white shadow-lg">
          <div className="flex items-center justify-center h-full">
            <User className="w-12 h-12 text-gray-400" />
          </div>
        </div>

        {/* Chat overlay */}
        <div className="absolute bottom-32 left-0 right-0 max-w-md mx-auto px-4">
          <Card className="p-3 bg-black/80 backdrop-blur">
            <div className="space-y-2 max-h-40 overflow-y-auto mb-2">
              <div className="bg-primary/20 p-2 rounded text-sm text-white">
                Bonjour, comment puis-je vous aider ?
              </div>
              <div className="bg-gray-700 p-2 rounded text-sm text-white text-right">
                J'ai des maux de tête depuis 2 jours
              </div>
            </div>
            <div className="flex gap-2">
              <Textarea
                placeholder="Votre message..."
                className="min-h-[40px] bg-gray-800 border-gray-600 text-white"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button size="sm" className="self-end">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 left-0 right-0">
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full w-14 h-14 bg-white/20 backdrop-blur border-white text-white hover:bg-white/30"
            >
              <Camera className="w-6 h-6" />
            </Button>
            <Button
              size="lg"
              className="rounded-full w-14 h-14 bg-red-500 hover:bg-red-600"
              onClick={handleEndCall}
            >
              <Phone className="w-6 h-6" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full w-14 h-14 bg-white/20 backdrop-blur border-white text-white hover:bg-white/30"
            >
              <MessageSquare className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-background">
        <div className="text-center">
          <Video className="w-12 h-12 text-primary mx-auto mb-3" />
          <h3 className="font-bold text-lg mb-2">Téléconsultation</h3>
          <p className="text-sm text-muted-foreground">
            Consultez un médecin par vidéo où que vous soyez
          </p>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Médecins disponibles</h3>
        <div className="space-y-2">
          {[
            { name: 'Dr. Aminata Diallo', status: 'En ligne', specialty: 'Généraliste' },
            { name: 'Dr. Moussa Ndiaye', status: 'En ligne', specialty: 'Pédiatre' },
          ].map((doctor, idx) => (
            <Card key={idx} className="p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{doctor.name}</p>
                    <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-green-600">{doctor.status}</span>
                </div>
              </div>
              <Button
                className="w-full mt-3"
                size="sm"
                onClick={handleStartCall}
              >
                <Video className="w-4 h-4 mr-2" />
                Démarrer l'appel
              </Button>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="p-4 bg-primary/5">
        <h3 className="font-semibold mb-2">Comment ça marche ?</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
              1
            </div>
            <p>Choisissez un médecin disponible</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
              2
            </div>
            <p>Démarrez l'appel vidéo en un clic</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
              3
            </div>
            <p>Discutez et recevez votre ordonnance par SMS</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

const User = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default MVPPatientTeleconsult;
