
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, MapPin, CreditCard } from 'lucide-react';

const AppointmentBooking = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const availableDoctors = [
    {
      id: '1',
      name: 'Dr. Kouamé Adjoua',
      specialty: 'Médecine générale',
      location: 'Cabinet 1',
      fee: 15000,
      rating: 4.8,
      nextAvailable: '2024-01-25'
    },
    {
      id: '2',
      name: 'Dr. Traoré Mamadou',
      specialty: 'Cardiologie',
      location: 'Cabinet 2',
      fee: 25000,
      rating: 4.9,
      nextAvailable: '2024-01-26'
    },
    {
      id: '3',
      name: 'Dr. Diallo Fatima',
      specialty: 'Pédiatrie',
      location: 'Cabinet 3',
      fee: 20000,
      rating: 4.7,
      nextAvailable: '2024-01-25'
    }
  ];

  const availableSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const handleBooking = () => {
    if (selectedDoctor && selectedDate && selectedTime) {
      // Simulation de la réservation
      alert(`Rendez-vous réservé avec ${selectedDoctor.name} le ${selectedDate} à ${selectedTime}`);
      // Ici, vous intégreriez la logique de paiement et de confirmation
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
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sélection du médecin */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Choisir un Médecin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedDoctor?.id === doctor.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{doctor.name}</h3>
                          <p className="text-sm text-gray-600">{doctor.specialty}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{doctor.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Tarif:</span>
                          <span className="font-medium">{doctor.fee.toLocaleString()} FCFA</span>
                        </div>
                        <Badge variant="outline">
                          ⭐ {doctor.rating}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sélection de la date et heure */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Choisir Date et Heure</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDoctor ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Sélectionnez d'abord un médecin</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Sélection de la date */}
                <div>
                  <h3 className="font-medium mb-3">Date</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {['2024-01-25', '2024-01-26', '2024-01-27'].map((date) => (
                      <Button
                        key={date}
                        variant={selectedDate === date ? "default" : "outline"}
                        className="text-sm"
                        onClick={() => setSelectedDate(date)}
                      >
                        {new Date(date).toLocaleDateString('fr-FR', { 
                          day: '2-digit', 
                          month: 'short' 
                        })}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Sélection de l'heure */}
                {selectedDate && (
                  <div>
                    <h3 className="font-medium mb-3">Heure disponible</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot}
                          variant={selectedTime === slot ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTime(slot)}
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Résumé et confirmation */}
                {selectedDoctor && selectedDate && selectedTime && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium mb-3">Résumé du rendez-vous</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Médecin:</span>
                        <span className="font-medium">{selectedDoctor.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span className="font-medium">
                          {new Date(selectedDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Heure:</span>
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Tarif:</span>
                        <span className="font-medium">{selectedDoctor.fee.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleBooking}
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Confirmer et Payer
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentBooking;
