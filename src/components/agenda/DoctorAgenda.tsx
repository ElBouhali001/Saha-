
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, ChevronLeft, ChevronRight, User, Clock } from 'lucide-react';
import { useDoctors } from '@/hooks/useDoctors';
import { useAppointments } from '@/hooks/useAppointments';

type ViewMode = 'day' | 'week' | 'month';

const DoctorAgenda = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');
  
  const { data: doctors = [] } = useDoctors();
  const { data: appointments = [] } = useAppointments();

  // Helper function to get primary specialty
  const getPrimarySpecialty = (doctor: any) => {
    const primarySpecialty = doctor.doctor_specialties?.find((ds: any) => ds.is_primary);
    return primarySpecialty?.specialty?.name || doctor.doctor_specialties?.[0]?.specialty?.name || 'Spécialité non définie';
  };

  // Filter doctors and appointments
  const filteredDoctors = useMemo(() => {
    return selectedDoctorId === 'all' ? doctors : doctors.filter(d => d.id === selectedDoctorId);
  }, [doctors, selectedDoctorId]);

  const filteredAppointments = useMemo(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return appointments.filter(apt => {
      const matchesDate = apt.appointment_date === dateStr;
      const matchesDoctor = selectedDoctorId === 'all' || apt.doctor_id === selectedDoctorId;
      return matchesDate && matchesDoctor;
    });
  }, [appointments, selectedDate, selectedDoctorId]);

  // Navigation functions
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setSelectedDate(newDate);
  };

  const getDateRangeText = () => {
    const today = selectedDate.toLocaleDateString('fr-FR');
    
    switch (viewMode) {
      case 'day':
        return `Jour - ${today}`;
      case 'week':
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        return `Semaine - ${startOfWeek.toLocaleDateString('fr-FR')} au ${endOfWeek.toLocaleDateString('fr-FR')}`;
      case 'month':
        return `Mois - ${selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
      default:
        return today;
    }
  };

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  // Helper function to get patient name
  const getPatientName = (appointment: any) => {
    if (appointment.patient?.profile) {
      const firstName = appointment.patient.profile.first_name || '';
      const lastName = appointment.patient.profile.last_name || '';
      return `${firstName} ${lastName}`.trim() || 'Patient';
    }
    return 'Patient';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Agenda des Médecins</h1>
      </div>

      {/* Filters and Navigation */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          {/* Doctor Filter */}
          <div className="min-w-[200px]">
            <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les médecins" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les médecins</SelectItem>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    Dr. {doctor.profile?.first_name} {doctor.profile?.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View Mode */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode(mode)}
                className={viewMode === mode ? "bg-white shadow-sm" : ""}
              >
                {mode === 'day' ? 'Jour' : mode === 'week' ? 'Semaine' : 'Mois'}
              </Button>
            ))}
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="text-center min-w-[200px]">
            <div className="font-medium">{getDateRangeText()}</div>
          </div>
          
          <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSelectedDate(new Date())}
          >
            Aujourd'hui
          </Button>
        </div>
      </div>

      {/* Agenda Content */}
      <div className="grid gap-6">
        {selectedDoctorId === 'all' ? (
          // Vue globale - tous les médecins
          <div className="space-y-4">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id}>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <User className="w-5 h-5 mr-2" />
                    Dr. {doctor.profile?.first_name} {doctor.profile?.last_name}
                    <span className="ml-2 text-sm font-normal text-gray-600">
                      - {getPrimarySpecialty(doctor)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-8 gap-2">
                    {timeSlots.map((time) => {
                      const appointment = filteredAppointments.find(apt => 
                        apt.doctor_id === doctor.id && apt.appointment_time === time + ':00'
                      );
                      
                      return (
                        <div
                          key={time}
                          className={`p-2 rounded text-center text-xs ${
                            appointment 
                              ? 'bg-red-100 border-red-200 text-red-700'
                              : 'bg-green-50 border-green-200 text-green-700'
                          } border`}
                        >
                          <div className="font-medium">{time}</div>
                          {appointment && (
                            <div className="mt-1 truncate text-xs">
                              {getPatientName(appointment)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Vue détaillée - médecin sélectionné
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Planning - {filteredDoctors[0] && `Dr. ${filteredDoctors[0].profile?.first_name} ${filteredDoctors[0].profile?.last_name}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {timeSlots.map((time) => {
                  const appointment = filteredAppointments.find(apt => apt.appointment_time === time + ':00');
                  
                  return (
                    <div
                      key={time}
                      className={`p-4 rounded-lg border text-center ${
                        appointment 
                          ? 'bg-red-50 border-red-200 text-red-700'
                          : 'bg-green-50 border-green-200 text-green-700'
                      }`}
                    >
                      <div className="font-medium text-sm">{time}</div>
                      {appointment ? (
                        <div className="mt-2 text-xs">
                          <div className="font-medium">{getPatientName(appointment)}</div>
                          <div className="text-gray-600">{appointment.consultation_type}</div>
                        </div>
                      ) : (
                        <div className="mt-2 text-xs">Libre</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Résumé de la journée
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {filteredAppointments.length}
              </div>
              <div className="text-sm text-blue-600">RDV planifiés</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {filteredDoctors.length}
              </div>
              <div className="text-sm text-green-600">
                {selectedDoctorId === 'all' ? 'Médecins' : 'Médecin sélectionné'}
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">
                {timeSlots.length - filteredAppointments.length}
              </div>
              <div className="text-sm text-orange-600">Créneaux libres</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorAgenda;
