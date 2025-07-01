
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { UserCheck, Clock, CheckCircle, XCircle, Plus, User } from 'lucide-react';
import { useMockDoctors } from '@/hooks/useMockDoctors';

interface PrimaryDoctorRequest {
  id: string;
  doctor_id: string;
  doctor_name: string;
  specialty: string;
  status: 'pending' | 'accepted' | 'rejected';
  request_date: string;
  response_date?: string;
  response_message?: string;
}

interface PrimaryDoctor {
  id: string;
  doctor_id: string;
  doctor_name: string;
  specialty: string;
  start_date: string;
  is_active: boolean;
}

const PrimaryDoctorRequest = () => {
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [primaryDoctor, setPrimaryDoctor] = useState<PrimaryDoctor | null>(null);
  const [requests, setRequests] = useState<PrimaryDoctorRequest[]>([]);

  const { data: doctors = [] } = useMockDoctors();
  const { toast } = useToast();

  // Données de démonstration
  useEffect(() => {
    // Simuler un médecin traitant existant
    setPrimaryDoctor({
      id: '1',
      doctor_id: '1',
      doctor_name: 'Dr. Kouamé Adjoua',
      specialty: 'Médecine Générale',
      start_date: '2024-01-15',
      is_active: true
    });

    // Simuler des demandes
    setRequests([
      {
        id: '1',
        doctor_id: '2',
        doctor_name: 'Dr. Mamadou Diallo',
        specialty: 'Cardiologie',
        status: 'pending',
        request_date: '2024-01-20',
      },
      {
        id: '2',
        doctor_id: '3',
        doctor_name: 'Dr. Aïcha Keita',
        specialty: 'Pédiatrie',
        status: 'rejected',
        request_date: '2024-01-10',
        response_date: '2024-01-12',
        response_message: 'Malheureusement, mon planning ne me permet pas d\'accepter de nouveaux patients en suivi permanent.'
      }
    ]);
  }, []);

  const handleSendRequest = async () => {
    if (!selectedDoctor) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un médecin",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const selectedDoctorData = doctors.find(d => d.id === selectedDoctor);
      const newRequest: PrimaryDoctorRequest = {
        id: Date.now().toString(),
        doctor_id: selectedDoctor,
        doctor_name: `Dr. ${selectedDoctorData?.profile.first_name} ${selectedDoctorData?.profile.last_name}`,
        specialty: selectedDoctorData?.doctor_specialties[0]?.specialty?.name || '',
        status: 'pending',
        request_date: new Date().toISOString().split('T')[0],
      };

      setRequests([...requests, newRequest]);

      toast({
        title: "Demande envoyée",
        description: "Votre demande de médecin traitant a été envoyée avec succès",
      });

      setIsRequestDialogOpen(false);
      setSelectedDoctor('');
      setRequestMessage('');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de la demande",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Acceptée</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Refusée</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Médecin traitant actuel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-blue-500" />
            <span>Mon Médecin Traitant</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {primaryDoctor ? (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">{primaryDoctor.doctor_name}</h3>
                  <p className="text-sm text-gray-600">{primaryDoctor.specialty}</p>
                  <p className="text-xs text-green-600">
                    Médecin traitant depuis le {new Date(primaryDoctor.start_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Contacter
                </Button>
                <Button variant="outline" size="sm">
                  Changer
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <UserCheck className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">Vous n'avez pas encore de médecin traitant</p>
              <p className="text-sm text-gray-400 mb-6">
                Un médecin traitant vous permet un suivi médical personnalisé et coordonné
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demandes de médecin traitant */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <span>Demandes de Médecin Traitant</span>
            </CardTitle>
            <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Nouvelle demande</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Demande de Médecin Traitant</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="doctor">Sélectionner un médecin</Label>
                    <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un médecin" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            Dr. {doctor.profile.first_name} {doctor.profile.last_name} - {doctor.doctor_specialties[0]?.specialty?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Message (optionnel)</Label>
                    <Textarea
                      id="message"
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="Expliquez pourquoi vous souhaitez ce médecin comme médecin traitant..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleSendRequest} disabled={isLoading}>
                      {isLoading ? 'Envoi...' : 'Envoyer la demande'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Aucune demande en cours</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-lg">{request.doctor_name}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{request.specialty}</p>
                        <p className="text-xs text-gray-500">
                          Demande envoyée le {new Date(request.request_date).toLocaleDateString('fr-FR')}
                        </p>
                        {request.response_date && (
                          <p className="text-xs text-gray-500">
                            Réponse reçue le {new Date(request.response_date).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                        {request.response_message && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{request.response_message}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations sur le médecin traitant */}
      <Card>
        <CardHeader>
          <CardTitle>À propos du Médecin Traitant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Avantages</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Suivi médical personnalisé et coordonné</li>
                <li>• Meilleure prise en charge des assurances</li>
                <li>• Continuité des soins et historique médical</li>
                <li>• Orientation vers des spécialistes si nécessaire</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Comment ça marche</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Envoyez une demande au médecin de votre choix</li>
                <li>• Le médecin accepte ou refuse la demande</li>
                <li>• Une fois accepté, il devient votre médecin traitant</li>
                <li>• Vous pouvez changer de médecin traitant à tout moment</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrimaryDoctorRequest;
