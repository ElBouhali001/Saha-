import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Plus, User, Phone, Filter, CalendarDays, CalendarRange, View } from 'lucide-react';
import { useAvailableDoctors, useSpecialties } from '@/hooks/useDoctors';
import FilterModeSelector from '@/components/patient/appointment/FilterModeSelector';
import PatientSelector from './PatientSelector';
import PlanningView from './PlanningView';
import { DemoPatient } from '@/hooks/useDemoPatients';
import { useAppointments, Appointment } from '@/contexts/AppointmentContext';
import { toast } from 'sonner';

const AppointmentScheduling = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<'specialty' | 'doctor'>('specialty');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<DemoPatient | null>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [newAppointment, setNewAppointment] = useState({
    doctorId: '',
    date: '',
    time: '',
    type: 'consultation'
  });

  const { appointments, addAppointment } = useAppointments();

  const { data: doctors = [], isLoading: loadingDoctors } = useAvailableDoctors(selectedDate);
  const { data: specialties = [] } = useSpecialties();

  // Helper function to get primary specialty
  const getPrimarySpecialty = (doctor: any) => {
    const primarySpecialty = doctor.doctor_specialties?.find((ds: any) => ds.is_primary);
    return primarySpecialty?.specialty?.name || doctor.doctor_specialties?.[0]?.specialty?.name || 'Spécialité non définie';
  };

  // Filter doctors based on selected specialty
  const filteredDoctors = useMemo(() => {
    if (filterMode === 'specialty' && selectedSpecialty) {
      return doctors.filter(doctor => 
        doctor.doctor_specialties?.some((ds: any) => ds.specialty?.id === selectedSpecialty)
      );
    }
    return doctors;
  }, [doctors, selectedSpecialty, filterMode]);

  // Get specialties for selected doctor
  const doctorSpecialties = useMemo(() => {
    if (filterMode === 'doctor' && newAppointment.doctorId) {
      const doctor = doctors.find(d => d.id === newAppointment.doctorId);
      return doctor?.doctor_specialties?.map((ds: any) => ds.specialty) || [];
    }
    return [];
  }, [doctors, newAppointment.doctorId, filterMode]);

  const handleFilterModeChange = (mode: 'specialty' | 'doctor') => {
    setFilterMode(mode);
    setNewAppointment({...newAppointment, doctorId: ''});
    setSelectedSpecialty('');
  };

  // Helper functions for different view modes
  const getWeekDates = (date: string) => {
    const currentDate = new Date(date);
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() - currentDate.getDay() + 1);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      weekDates.push(day.toISOString().split('T')[0]);
    }
    return weekDates;
  };

  const getMonthDates = (date: string) => {
    const currentDate = new Date(date);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstMonday = new Date(firstDay);
    firstMonday.setDate(firstDay.getDate() - firstDay.getDay() + 1);
    
    const dates = [];
    const current = new Date(firstMonday);
    
    while (current <= lastDay || dates.length < 35) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const formatDateHeader = (date: string) => {
    const dateObj = new Date(date);
    const today = new Date().toISOString().split('T')[0];
    const isToday = date === today;
    
    return {
      day: dateObj.toLocaleDateString('fr-FR', { weekday: 'short' }),
      date: dateObj.getDate(),
      isToday
    };
  };

  const handleTimeSlotClick = (time: string, date?: string) => {
    const targetDate = date || selectedDate;
    const status = getSlotStatus(time, targetDate);
    if (status === 'available') {
      setNewAppointment({
        ...newAppointment,
        date: targetDate,
        time: time
      });
      setIsAddDialogOpen(true);
    }
  };

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  const getSlotStatus = (time: string, date?: string) => {
    const targetDate = date || selectedDate;
    const appointment = appointments.find(apt => 
      apt.date === targetDate && apt.time === time
    );
    
    if (appointment) {
      return appointment.status === 'cancelled' ? 'available' : 'occupied';
    }
    return 'available';
  };

  const handleScheduleAppointment = async () => {
    if (!selectedPatient) {
      toast.error('Veuillez sélectionner un patient');
      return;
    }

    const appointmentData = {
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      doctorId: newAppointment.doctorId,
      doctorName: doctors.find(d => d.id === newAppointment.doctorId)?.profile?.first_name + ' ' + 
                  doctors.find(d => d.id === newAppointment.doctorId)?.profile?.last_name || '',
      date: newAppointment.date,
      time: newAppointment.time,
      duration: 30,
      status: 'scheduled' as const,
      type: newAppointment.type as 'consultation' | 'follow-up' | 'urgent' | 'preventive' | 'specialist',
      reason: 'Consultation programmée depuis le planning'
    };

    try {
      await addAppointment(appointmentData);
      
      // Reset form
      setSelectedPatient(null);
      setNewAppointment({
        doctorId: '',
        date: '',
        time: '',
        type: 'consultation'
      });
      setSelectedSpecialty('');
      setIsAddDialogOpen(false);
      
      toast.success(`Rendez-vous programmé pour ${selectedPatient.firstName} ${selectedPatient.lastName} le ${newAppointment.date} à ${newAppointment.time}`);
    } catch (error) {
      toast.error('Erreur lors de la programmation du rendez-vous');
    }
  };

  const handlePatientCreate = (patientData: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    address: string;
  }) => {
    // Create a temporary patient object for display
    const tempPatient: DemoPatient = {
      id: `temp-${Date.now()}`,
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      phone: patientData.phone,
      email: patientData.email,
      address: patientData.address,
      dateOfBirth: '',
      emergencyContact: { name: '', phone: '', relationship: '' },
      consultations: 0,
      lastVisit: '',
      medicalHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setSelectedPatient(tempPatient);
    toast.success('Patient créé et sélectionné');
  };

  const todayAppointments = appointments.filter(apt => apt.date === selectedDate);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Planning des Rendez-Vous</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'day' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Jour
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'week' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Semaine
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'month' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarRange className="w-4 h-4" />
              Mois
            </button>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau RDV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Planifier un Rendez-Vous</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <PatientSelector
                  selectedPatient={selectedPatient}
                  onPatientSelect={setSelectedPatient}
                  onPatientCreate={handlePatientCreate}
                />

                <FilterModeSelector 
                  filterMode={filterMode}
                  onFilterModeChange={handleFilterModeChange}
                />

                {filterMode === 'specialty' ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="specialty">Spécialité</Label>
                      <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une spécialité" />
                        </SelectTrigger>
                        <SelectContent>
                          {specialties.map((specialty) => (
                            <SelectItem key={specialty.id} value={specialty.id}>
                              {specialty.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedSpecialty && (
                      <div>
                        <Label htmlFor="doctor">Médecin</Label>
                        <Select value={newAppointment.doctorId} onValueChange={(value) => 
                          setNewAppointment({...newAppointment, doctorId: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un médecin" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredDoctors.map((doctor) => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                Dr. {doctor.profile?.first_name} {doctor.profile?.last_name} - {getPrimarySpecialty(doctor)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="doctor">Médecin</Label>
                      <Select value={newAppointment.doctorId} onValueChange={(value) => 
                        setNewAppointment({...newAppointment, doctorId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un médecin" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              Dr. {doctor.profile?.first_name} {doctor.profile?.last_name} - {getPrimarySpecialty(doctor)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {newAppointment.doctorId && doctorSpecialties.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-sm mb-2">Spécialités du médecin :</h4>
                        <div className="flex flex-wrap gap-2">
                          {doctorSpecialties.map((specialty: any) => (
                            <span key={specialty.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {specialty.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Heure</Label>
                    <Select value={newAppointment.time} onValueChange={(value) => 
                      setNewAppointment({...newAppointment, time: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner l'heure" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={handleScheduleAppointment} 
                  className="w-full"
                  disabled={!selectedPatient || !newAppointment.doctorId || !newAppointment.date || !newAppointment.time}
                >
                  Confirmer le RDV
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PlanningView
          viewMode={viewMode}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          appointments={appointments}
          timeSlots={timeSlots}
          getSlotStatus={getSlotStatus}
          handleTimeSlotClick={handleTimeSlotClick}
          getWeekDates={getWeekDates}
          getMonthDates={getMonthDates}
          formatDateHeader={formatDateHeader}
        />

        {/* Today's Appointments - Only show in day view */}
        {viewMode === 'day' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                RDV du jour
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun RDV aujourd'hui</p>
              ) : (
                todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{appointment.time}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                        appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {appointment.status === 'scheduled' ? 'Planifié' :
                         appointment.status === 'completed' ? 'Terminé' : 'Annulé'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <User className="w-4 h-4 mr-1" />
                      {appointment.patientName}
                    </div>
                    <div className="text-sm text-gray-600">
                      Dr. {appointment.doctorName}
                    </div>
                    {appointment.type && (
                      <div className="text-xs text-blue-600 mt-2">
                        Type: {appointment.type}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AppointmentScheduling;