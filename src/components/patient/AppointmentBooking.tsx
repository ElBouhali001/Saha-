
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useMockDoctors, useMockSpecialties } from '@/hooks/useMockDoctors';
import { useAppointments, useCreateAppointment } from '@/hooks/useAppointments';
import { useToast } from '@/components/ui/use-toast';
import FilterModeSelector from './appointment/FilterModeSelector';
import SpecialtySelector from './appointment/SpecialtySelector';
import DoctorSelector from './appointment/DoctorSelector';
import AppointmentForm from './appointment/AppointmentForm';
import UpcomingAppointments from './appointment/UpcomingAppointments';

const AppointmentBooking = () => {
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState('');
  const [reason, setReason] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [filterMode, setFilterMode] = useState<'specialty' | 'doctor'>('specialty');

  // Utilisation des données mockées
  const { data: doctors = [], isLoading: loadingDoctors } = useMockDoctors();
  const { data: specialties = [] } = useMockSpecialties();
  const { data: appointments = [] } = useAppointments();
  const createAppointment = useCreateAppointment();
  const { toast } = useToast();

  // Helper function to get primary specialty
  const getPrimarySpecialty = (doctor: any) => {
    const primarySpecialty = doctor.doctor_specialties?.find((ds: any) => ds.is_primary);
    return primarySpecialty?.specialty?.name || doctor.doctor_specialties?.[0]?.specialty?.name || 'Spécialité non définie';
  };

  // Filter doctors based on selected specialty
  const filteredDoctors = useMemo(() => {
    if (filterMode === 'specialty' && selectedSpecialty) {
      return doctors.filter(doctor => 
        doctor.doctor_specialties?.some((ds: any) => ds.specialty_id === selectedSpecialty)
      );
    }
    return doctors;
  }, [doctors, selectedSpecialty, filterMode]);

  // Get specialties for selected doctor
  const doctorSpecialties = useMemo(() => {
    if (filterMode === 'doctor' && selectedDoctor) {
      const doctor = doctors.find(d => d.id === selectedDoctor);
      return doctor?.doctor_specialties?.map((ds: any) => ds.specialty) || [];
    }
    return [];
  }, [doctors, selectedDoctor, filterMode]);

  const handleFilterModeChange = (mode: 'specialty' | 'doctor') => {
    setFilterMode(mode);
    setSelectedDoctor('');
    setSelectedSpecialty('');
  };

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
      // Simulation de création de rendez-vous
      console.log('Création du rendez-vous:', {
        doctor_id: selectedDoctor,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        consultation_type: consultationType,
        reason,
        payment_method: paymentMethod,
        status: 'pending',
        payment_status: 'pending',
      });

      toast({
        title: "Succès",
        description: "Rendez-vous réservé avec succès ! Un SMS de confirmation vous sera envoyé.",
      });

      // Reset form
      setSelectedDoctor('');
      setSelectedSpecialty('');
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
          <FilterModeSelector 
            filterMode={filterMode}
            onFilterModeChange={handleFilterModeChange}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Specialty/Doctor Selection */}
            <div className="space-y-4">
              {filterMode === 'specialty' ? (
                <SpecialtySelector
                  specialties={specialties}
                  selectedSpecialty={selectedSpecialty}
                  onSpecialtyChange={setSelectedSpecialty}
                  filteredDoctors={filteredDoctors}
                  selectedDoctor={selectedDoctor}
                  onDoctorSelect={setSelectedDoctor}
                  loadingDoctors={loadingDoctors}
                  getPrimarySpecialty={getPrimarySpecialty}
                />
              ) : (
                <DoctorSelector
                  doctors={doctors}
                  selectedDoctor={selectedDoctor}
                  onDoctorSelect={setSelectedDoctor}
                  loadingDoctors={loadingDoctors}
                  getPrimarySpecialty={getPrimarySpecialty}
                  doctorSpecialties={doctorSpecialties}
                />
              )}
            </div>

            {/* Appointment Details Form */}
            <AppointmentForm
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              selectedTime={selectedTime}
              onTimeChange={setSelectedTime}
              consultationType={consultationType}
              onConsultationTypeChange={setConsultationType}
              reason={reason}
              onReasonChange={setReason}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              phoneNumber={phoneNumber}
              onPhoneNumberChange={setPhoneNumber}
              onBooking={handleBooking}
              selectedDoctor={selectedDoctor}
              isLoading={false}
            />
          </div>
        </CardContent>
      </Card>

      <UpcomingAppointments appointments={appointments} />
    </div>
  );
};

export default AppointmentBooking;
