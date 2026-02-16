
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Phone, CheckCircle, Loader2 } from 'lucide-react';

interface AppointmentFormProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedTime: string;
  onTimeChange: (time: string) => void;
  consultationType: string;
  onConsultationTypeChange: (type: string) => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  phoneNumber: string;
  onPhoneNumberChange: (phone: string) => void;
  onBooking: () => void;
  selectedDoctor: string;
  isLoading: boolean;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
  consultationType,
  onConsultationTypeChange,
  reason,
  onReasonChange,
  paymentMethod,
  onPaymentMethodChange,
  phoneNumber,
  onPhoneNumberChange,
  onBooking,
  selectedDoctor,
  isLoading
}) => {
  const availableSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Détails du rendez-vous</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Date</label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Heure</label>
          <Select value={selectedTime} onValueChange={onTimeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un créneau" />
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

        <div>
          <label className="block text-sm font-medium mb-2">Type de consultation</label>
          <Select value={consultationType} onValueChange={onConsultationTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner le type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="consultation">Consultation générale</SelectItem>
              <SelectItem value="suivi">Consultation de suivi</SelectItem>
              <SelectItem value="urgence">Consultation d'urgence</SelectItem>
              <SelectItem value="teleconsultation">Téléconsultation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Motif de consultation</label>
          <Textarea
            placeholder="Décrivez brièvement vos symptômes ou le motif de votre visite..."
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mode de paiement</label>
          <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir le mode de paiement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mobile_money">Mobile Money</SelectItem>
              <SelectItem value="cash">Espèces (sur place)</SelectItem>
              <SelectItem value="card">Carte bancaire</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {paymentMethod === 'mobile_money' && (
          <div>
            <label className="block text-sm font-medium mb-2">Numéro de téléphone</label>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Ex: 07 01 02 03 04"
                value={phoneNumber}
                onChange={(e) => onPhoneNumberChange(e.target.value)}
              />
            </div>
          </div>
        )}

        <Button 
          onClick={onBooking}
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={!selectedDoctor || !selectedDate || !selectedTime || !consultationType || isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          Confirmer le rendez-vous
        </Button>
      </div>
    </div>
  );
};

export default AppointmentForm;
