import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, User, Check } from 'lucide-react';

const doctors = [
  { id: '1', name: 'Dr. Aminata Diallo', specialty: 'Médecin généraliste', fee: '5,000 FCFA' },
  { id: '2', name: 'Dr. Moussa Ndiaye', specialty: 'Pédiatre', fee: '7,000 FCFA' },
  { id: '3', name: 'Dr. Fatou Sall', specialty: 'Cardiologue', fee: '10,000 FCFA' },
];

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
];

const MVPPatientBooking = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<typeof doctors[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const { toast } = useToast();

  const handleBooking = () => {
    if (!selectedDoctor || !selectedTime) {
      toast({
        title: "Information manquante",
        description: "Veuillez sélectionner un médecin et un créneau horaire",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Rendez-vous confirmé",
      description: `RDV avec ${selectedDoctor.name} le ${selectedDate.toLocaleDateString('fr-FR')} à ${selectedTime}. Confirmation envoyée par SMS.`,
    });

    // Reset
    setSelectedDoctor(null);
    setSelectedTime('');
  };

  return (
    <div className="p-4 space-y-4">
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <User className="w-4 h-4" />
          Choisir un médecin
        </h3>
        <div className="space-y-2">
          {doctors.map((doctor) => (
            <Card
              key={doctor.id}
              className={`p-3 cursor-pointer transition-all ${
                selectedDoctor?.id === doctor.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedDoctor(doctor)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm">{doctor.name}</p>
                  <p className={`text-xs ${
                    selectedDoctor?.id === doctor.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}>
                    {doctor.specialty}
                  </p>
                </div>
                <Badge variant={selectedDoctor?.id === doctor.id ? "secondary" : "outline"}>
                  {doctor.fee}
                </Badge>
              </div>
              {selectedDoctor?.id === doctor.id && (
                <div className="mt-2 flex items-center gap-1 text-xs">
                  <Check className="w-3 h-3" />
                  Sélectionné
                </div>
              )}
            </Card>
          ))}
        </div>
      </Card>

      {selectedDoctor && (
        <>
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[0, 1, 2, 3, 4].map((offset) => {
                const date = new Date();
                date.setDate(date.getDate() + offset);
                const isSelected = date.toDateString() === selectedDate.toDateString();
                
                return (
                  <Card
                    key={offset}
                    className={`flex-shrink-0 p-3 min-w-[80px] cursor-pointer text-center transition-all ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <p className="text-xs mb-1">
                      {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                    </p>
                    <p className="text-lg font-bold">{date.getDate()}</p>
                  </Card>
                );
              })}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Créneau horaire
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </Card>

          <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t">
            <Button
              className="w-full"
              size="lg"
              onClick={handleBooking}
              disabled={!selectedTime}
            >
              <Check className="w-4 h-4 mr-2" />
              Confirmer le rendez-vous
            </Button>
          </div>
        </>
      )}

      <Card className="p-4 bg-primary/5">
        <h3 className="font-semibold mb-2">Mes rendez-vous</h3>
        <div className="space-y-2">
          <Card className="p-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">Dr. Diallo</p>
                <p className="text-xs text-muted-foreground">15 Jan 2025 • 10:00</p>
              </div>
              <Badge>Confirmé</Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-2">
              Annuler
            </Button>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default MVPPatientBooking;
