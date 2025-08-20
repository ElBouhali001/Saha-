import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Clock, User, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { DemoPatient } from '@/hooks/useDemoPatients';

interface AppointmentBookingModalProps {
  patient: DemoPatient;
  isOpen: boolean;
  onClose: () => void;
}

const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  patient,
  isOpen,
  onClose
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  // Horaires disponibles (simulation)
  const availableSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  // Médecins disponibles (simulation)
  const availableDoctors = [
    { id: 'doc1', name: 'Dr. Kouamé', specialty: 'Médecine générale' },
    { id: 'doc2', name: 'Dr. Traoré', specialty: 'Cardiologie' },
    { id: 'doc3', name: 'Dr. Camara', specialty: 'Pédiatrie' },
    { id: 'doc4', name: 'Dr. Diabaté', specialty: 'Gynécologie' }
  ];

  const appointmentTypes = [
    { value: 'consultation', label: 'Consultation générale' },
    { value: 'follow-up', label: 'Consultation de suivi' },
    { value: 'urgent', label: 'Consultation urgente' },
    { value: 'preventive', label: 'Consultation préventive' },
    { value: 'specialist', label: 'Consultation spécialisée' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !selectedDoctor || !appointmentType || !reason) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    // Simulation de la création du RDV
    const appointmentData = {
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      doctorId: selectedDoctor,
      doctorName: availableDoctors.find(d => d.id === selectedDoctor)?.name,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      type: appointmentType,
      reason,
      notes,
      status: 'scheduled'
    };

    console.log('Nouveau RDV:', appointmentData);

    toast({
      title: "Rendez-vous créé",
      description: `RDV programmé le ${format(selectedDate, 'dd MMMM yyyy', { locale: fr })} à ${selectedTime} avec ${appointmentData.doctorName}`,
    });

    // Reset form
    setSelectedDate(undefined);
    setSelectedTime('');
    setSelectedDoctor('');
    setAppointmentType('');
    setReason('');
    setNotes('');
    
    onClose();
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Dimanche = 0, Samedi = 6
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5" />
            <span>Prendre Rendez-vous</span>
          </DialogTitle>
          <DialogDescription>
            Programmer un rendez-vous pour {patient.firstName} {patient.lastName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations patient */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium flex items-center space-x-2 mb-2">
              <User className="w-4 h-4" />
              <span>Patient</span>
            </h4>
            <p className="text-sm text-gray-700">
              {patient.firstName} {patient.lastName} - {patient.phone}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sélection du médecin */}
            <div className="space-y-2">
              <Label htmlFor="doctor">Médecin *</Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un médecin" />
                </SelectTrigger>
                <SelectContent>
                  {availableDoctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      <div className="flex flex-col">
                        <span>{doctor.name}</span>
                        <span className="text-xs text-gray-500">{doctor.specialty}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type de consultation */}
            <div className="space-y-2">
              <Label htmlFor="type">Type de consultation *</Label>
              <Select value={appointmentType} onValueChange={setAppointmentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Type de consultation" />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sélection de la date */}
            <div className="space-y-2">
              <Label>Date du rendez-vous *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, 'dd MMMM yyyy', { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => isPastDate(date) || isWeekend(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              {selectedDate && isWeekend(selectedDate) && (
                <p className="text-xs text-amber-600 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Les week-ends ne sont pas disponibles</span>
                </p>
              )}
            </div>

            {/* Sélection de l'heure */}
            <div className="space-y-2">
              <Label htmlFor="time">Heure *</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Heure du RDV" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{slot}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Motif de consultation */}
          <div className="space-y-2">
            <Label htmlFor="reason">Motif de consultation *</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Décrivez brièvement le motif du rendez-vous"
            />
          </div>

          {/* Notes additionnelles */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes additionnelles</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informations complémentaires (optionnel)"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Programmer le RDV
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentBookingModal;