import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Phone } from 'lucide-react';

const appointments = [
  {
    id: '1',
    time: '08:00',
    patient: 'Aminata Diallo',
    phone: '+221 77 123 45 67',
    status: 'confirmed',
    reason: 'Contrôle',
  },
  {
    id: '2',
    time: '09:00',
    patient: 'Moussa Ndiaye',
    phone: '+221 76 234 56 78',
    status: 'waiting',
    reason: 'Consultation',
  },
  {
    id: '3',
    time: '10:00',
    patient: 'Fatou Sall',
    phone: '+221 78 345 67 89',
    status: 'confirmed',
    reason: 'Urgence',
  },
  {
    id: '4',
    time: '11:00',
    patient: null,
    status: 'available',
  },
  {
    id: '5',
    time: '14:00',
    patient: 'Ibrahima Fall',
    phone: '+221 77 456 78 90',
    status: 'confirmed',
    reason: 'Suivi',
  },
];

const MVPAgenda = () => {
  const [selectedDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week'>('day');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-500';
      case 'waiting':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmé';
      case 'waiting':
        return 'En attente';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      case 'available':
        return 'Disponible';
      default:
        return status;
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {selectedDate.toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </h3>
          <div className="flex gap-2">
            <Button
              variant={view === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('day')}
            >
              Jour
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('week')}
            >
              Semaine
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <Card className="p-3 bg-primary/10">
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-muted-foreground">RDV total</p>
          </Card>
          <Card className="p-3 bg-green-500/10">
            <p className="text-2xl font-bold">8</p>
            <p className="text-xs text-muted-foreground">Confirmés</p>
          </Card>
          <Card className="p-3 bg-yellow-500/10">
            <p className="text-2xl font-bold">4</p>
            <p className="text-xs text-muted-foreground">Libres</p>
          </Card>
        </div>
      </Card>

      <div className="space-y-3">
        {appointments.map((apt) => (
          <Card
            key={apt.id}
            className={`p-4 ${
              apt.status === 'available'
                ? 'border-dashed border-2'
                : 'hover:shadow-md transition-shadow'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <Clock className="w-5 h-5 text-primary mb-1" />
                <span className="text-sm font-semibold">{apt.time}</span>
              </div>

              {apt.patient ? (
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{apt.patient}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {apt.phone}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`${getStatusColor(apt.status)} text-white`}
                    >
                      {getStatusLabel(apt.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{apt.reason}</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1">
                      Commencer
                    </Button>
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 text-center py-2">
                  <p className="text-sm text-muted-foreground mb-2">Créneau disponible</p>
                  <Button size="sm" variant="outline" className="w-full">
                    Bloquer ce créneau
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MVPAgenda;
