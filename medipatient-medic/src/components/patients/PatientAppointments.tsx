import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, FileText, Phone } from 'lucide-react';
import { useAppointments, Appointment } from '@/contexts/AppointmentContext';
import { DemoPatient } from '@/hooks/useDemoPatients';

interface PatientAppointmentsProps {
  patient: DemoPatient;
}

const PatientAppointments: React.FC<PatientAppointmentsProps> = ({ patient }) => {
  const { getPatientAppointments, updateAppointment } = useAppointments();
  const patientAppointments = getPatientAppointments(patient.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'scheduled': return 'secondary';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      case 'no-show': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'scheduled': return 'Programmé';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      case 'no-show': return 'Absence';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'consultation': return 'Consultation générale';
      case 'follow-up': return 'Suivi';
      case 'urgent': return 'Urgence';
      case 'preventive': return 'Préventif';
      case 'specialist': return 'Spécialisé';
      default: return type;
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      await updateAppointment(appointmentId, { status: newStatus as any });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  // Séparer les rendez-vous futurs et passés
  const now = new Date();
  const upcomingAppointments = patientAppointments.filter(apt => {
    const aptDate = new Date(`${apt.date}T${apt.time}`);
    return aptDate >= now;
  }).sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

  const pastAppointments = patientAppointments.filter(apt => {
    const aptDate = new Date(`${apt.date}T${apt.time}`);
    return aptDate < now;
  }).sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

  return (
    <div className="space-y-6">
      {/* Rendez-vous à venir */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Rendez-vous à venir ({upcomingAppointments.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">
                          {new Date(appointment.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{appointment.time}</span>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(appointment.status)}>
                      {getStatusLabel(appointment.status)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{appointment.doctorName}</span>
                        {appointment.doctorSpecialty && (
                          <span className="text-gray-500">({appointment.doctorSpecialty})</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span>{getTypeLabel(appointment.type)}</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700 mb-1">Motif:</div>
                      <div className="text-gray-600">{appointment.reason}</div>
                      {appointment.notes && (
                        <div className="mt-2">
                          <div className="font-medium text-gray-700 mb-1">Notes:</div>
                          <div className="text-gray-600 text-xs">{appointment.notes}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {appointment.status === 'scheduled' && (
                    <div className="mt-4 flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                      >
                        Confirmer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                      >
                        Annuler
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun rendez-vous programmé</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historique des rendez-vous */}
      {pastAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Historique ({pastAppointments.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastAppointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="border-l-4 border-gray-200 pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {new Date(appointment.date).toLocaleDateString('fr-FR')} à {appointment.time}
                      </span>
                      <span className="text-gray-500 text-sm">- {appointment.doctorName}</span>
                    </div>
                    <Badge variant={getStatusColor(appointment.status)} className="text-xs">
                      {getStatusLabel(appointment.status)}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {getTypeLabel(appointment.type)} - {appointment.reason}
                  </div>
                </div>
              ))}
              {pastAppointments.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm">
                    Voir plus ({pastAppointments.length - 5} autres)
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientAppointments;