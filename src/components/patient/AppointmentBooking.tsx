
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Phone, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { useAvailableDoctors, useSpecialties } from '@/hooks/useDoctors';
import { useAppointments, useCreateAppointment } from '@/hooks/useAppointments';
import { useToast } from '@/components/ui/use-toast';

const AppointmentBooking = () => {
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState('');
  const [reason, setReason] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const { data: doctors = [], isLoading: loadingDoctors } = useAvailableDoctors(selectedDate);
  const { data: specialties = [] } = useSpecialties();
  const { data: appointments = [] } = useAppointments();
  const createAppointment = useCreateAppointment();
  const { toast } = useToast();

  const availableSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  const handleBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !consultationType) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAppointment.mutateAsync({
        doctor_id: selectedDoctor,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        consultation_type: consultationType as any,
        reason,
        payment_method: paymentMethod as any,
        status: 'pending',
        payment_status: 'pending',
      });

      toast({
        title: "Succès",
        description: "Rendez-vous réservé avec succès ! Un SMS de confirmation vous sera envoyé.",
      });

      // Reset form
      setSelectedDoctor('');
      setSelectedDate('');
      setSelectedTime('');
      setConsultationType('');
      setReason('');
      setPaymentMethod('');
      setPhoneNumber('');
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la réservation. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'confirmed' || apt.status === 'pending'
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span>Réserver un Rendez-vous</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sélection du médecin */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Choisir un médecin</h3>
              {loadingDoctors ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedDoctor === doctor.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedDoctor(doctor.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">
                              Dr. {doctor.profile?.first_name} {doctor.profile?.last_name}
                            </h4>
                            <p className="text-sm text-gray-600">{doctor.specialty?.name}</p>
                            <p className="text-sm font-medium text-green-600">
                              {doctor.consultation_fee.toLocaleString()} FCFA
                            </p>
                          </div>
                        </div>
                        <Badge variant="default">
                          Disponible
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formulaire de réservation */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Détails du rendez-vous</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Heure</label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
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
                  <Select value={consultationType} onValueChange={setConsultationType}>
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
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mode de paiement</label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
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
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleBooking}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!selectedDoctor || !selectedDate || !selectedTime || !consultationType || createAppointment.isPending}
                >
                  {createAppointment.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Confirmer le rendez-vous
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mes rendez-vous à venir */}
      <Card>
        <CardHeader>
          <CardTitle>Mes Rendez-vous à Venir</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun rendez-vous programmé</p>
            ) : (
              upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium">
                        Dr. {appointment.doctor?.profile?.first_name} {appointment.doctor?.profile?.last_name}
                      </h4>
                      <p className="text-sm text-gray-600">{appointment.consultation_type}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(appointment.appointment_date).toLocaleDateString('fr-FR')} à {appointment.appointment_time}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">Modifier</Button>
                    <Button size="sm" variant="destructive">Annuler</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentBooking;
