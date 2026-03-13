
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface UpcomingAppointmentsProps {
  appointments: any[];
}

const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({
  appointments
}) => {
  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'confirmed' || apt.status === 'pending'
  );

  return (
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
  );
};

export default UpcomingAppointments;
