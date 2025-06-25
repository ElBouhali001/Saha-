
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Appointment, Doctor } from '@/types/patient';
import { Calendar, Clock, Plus, User, Phone } from 'lucide-react';

const AppointmentScheduling = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patientName: '',
    doctorId: '',
    date: '',
    time: '',
    type: 'consultation'
  });

  // Mock doctors data
  const doctors: Doctor[] = [
    {
      id: '1',
      firstName: 'Dr. Kouamé',
      lastName: 'Adjoua',
      speciality: 'Médecine Générale',
      phone: '+225-01-02-03-04',
      email: 'dr.kouame@medipatient.com',
      schedule: [],
      consultationFee: 15000
    }
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  const getSlotStatus = (time: string) => {
    const appointment = appointments.find(apt => 
      apt.date === selectedDate && apt.time === time
    );
    
    if (appointment) {
      return appointment.status === 'cancelled' ? 'available' : 'occupied';
    }
    return 'available';
  };

  const generateTicketCode = () => {
    return 'TK-' + Date.now().toString().slice(-6);
  };

  const handleScheduleAppointment = () => {
    const appointment: Appointment = {
      id: Date.now().toString(),
      patientId: Date.now().toString(),
      patientName: newAppointment.patientName,
      doctorId: newAppointment.doctorId,
      doctorName: doctors.find(d => d.id === newAppointment.doctorId)?.firstName + ' ' + 
                  doctors.find(d => d.id === newAppointment.doctorId)?.lastName || '',
      date: newAppointment.date,
      time: newAppointment.time,
      duration: 30,
      status: 'scheduled',
      type: newAppointment.type as 'consultation' | 'follow-up' | 'emergency',
      ticketCode: generateTicketCode(),
      createdAt: new Date().toISOString()
    };

    setAppointments([...appointments, appointment]);
    setNewAppointment({
      patientName: '',
      doctorId: '',
      date: '',
      time: '',
      type: 'consultation'
    });
    setIsAddDialogOpen(false);
  };

  const todayAppointments = appointments.filter(apt => apt.date === selectedDate);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Planning des Rendez-Vous</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau RDV
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Planifier un Rendez-Vous</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="patientName">Patient</Label>
                <Input
                  id="patientName"
                  placeholder="Nom du patient"
                  value={newAppointment.patientName}
                  onChange={(e) => setNewAppointment({...newAppointment, patientName: e.target.value})}
                />
              </div>
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
                        {doctor.firstName} {doctor.lastName} - {doctor.speciality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
              <Button onClick={handleScheduleAppointment} className="w-full">
                Confirmer le RDV
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Planning Grid */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Planning du {new Date(selectedDate).toLocaleDateString('fr-FR')}
              </span>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => {
                const status = getSlotStatus(time);
                const appointment = appointments.find(apt => 
                  apt.date === selectedDate && apt.time === time
                );
                
                return (
                  <div
                    key={time}
                    className={`p-3 rounded-lg border text-center text-sm ${
                      status === 'available' 
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}
                  >
                    <div className="font-medium">{time}</div>
                    {appointment && (
                      <div className="text-xs mt-1 truncate">
                        {appointment.patientName}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
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
                  {appointment.ticketCode && (
                    <div className="text-xs text-blue-600 mt-2">
                      Ticket: {appointment.ticketCode}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentScheduling;
