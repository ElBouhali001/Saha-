import React, { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  Heart,
  Pill,
  ClipboardList,
  UserCheck,
  Shield,
  Clock,
  Activity
} from 'lucide-react';
import { DemoPatient } from '@/hooks/useDemoPatients';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import AppointmentBookingModal from '@/components/appointments/AppointmentBookingModal';

interface PatientDetailSheetProps {
  patient: DemoPatient | null;
  isOpen: boolean;
  onClose: () => void;
}

const PatientDetailSheet: React.FC<PatientDetailSheetProps> = ({ 
  patient, 
  isOpen, 
  onClose 
}) => {
  const { user } = useSupabaseAuth();
  const userRole = user?.user_metadata?.role;
  const isDoctor = userRole === 'doctor';
  const isAgent = userRole === 'agent';
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  if (!patient) return null;

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getUrgencyColor = (level?: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>{patient.firstName} {patient.lastName}</span>
              </SheetTitle>
              <SheetDescription>
                {isDoctor ? 'Dossier médical complet' : 'Informations patient'}
              </SheetDescription>
            </div>
            {(isDoctor || isAgent) && (
              <Button 
                onClick={() => setIsAppointmentModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Prendre RDV
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] mt-6">
          <div className="space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Informations Générales</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      {calculateAge(patient.dateOfBirth)} ans 
                      ({new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{patient.phone}</span>
                  </div>
                  {patient.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{patient.email}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{patient.address}</span>
                  </div>
                </div>

                {patient.urgencyLevel && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Niveau de priorité:</span>
                    <Badge variant={getUrgencyColor(patient.urgencyLevel)}>
                      {patient.urgencyLevel === 'high' ? 'Priorité haute' :
                       patient.urgencyLevel === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
                    </Badge>
                  </div>
                )}

                {/* Contact d'urgence */}
                {patient.emergencyContact && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2 flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-red-500" />
                      <span>Contact d'urgence</span>
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>{patient.emergencyContact.name}</strong> ({patient.emergencyContact.relationship})</p>
                      <p>{patient.emergencyContact.phone}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informations médicales - seulement pour les médecins */}
            {isDoctor && (
              <>
                {/* Résumé médical */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="w-4 h-4" />
                      <span>Résumé Médical</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                        <div className="text-lg font-semibold text-blue-700">{patient.consultations}</div>
                        <div className="text-xs text-blue-600">Consultations</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <UserCheck className="w-6 h-6 text-green-600 mx-auto mb-1" />
                        <div className="text-lg font-semibold text-green-700">{patient.primaryDoctor || 'Non assigné'}</div>
                        <div className="text-xs text-green-600">Médecin traitant</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <Shield className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                        <div className="text-lg font-semibold text-purple-700">{patient.insurance || 'Aucune'}</div>
                        <div className="text-xs text-purple-600">Assurance</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Historique médical */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ClipboardList className="w-4 h-4" />
                      <span>Historique Médical</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {patient.medicalHistory.map((record, index) => (
                        <div key={record.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">
                                {new Date(record.date).toLocaleDateString('fr-FR')}
                              </span>
                              <span className="text-sm text-gray-600">par {record.doctorName}</span>
                            </div>
                            {record.followUpDate && (
                              <Badge variant="outline" className="text-xs">
                                Suivi: {new Date(record.followUpDate).toLocaleDateString('fr-FR')}
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h5 className="font-medium text-red-700 mb-1">Diagnostic</h5>
                              <p className="text-gray-700">{record.diagnosis}</p>
                            </div>
                            <div>
                              <h5 className="font-medium text-orange-700 mb-1">Symptômes</h5>
                              <p className="text-gray-700">{record.symptoms}</p>
                            </div>
                            <div className="md:col-span-2">
                              <h5 className="font-medium text-green-700 mb-1">Traitement</h5>
                              <p className="text-gray-700">{record.treatment}</p>
                            </div>
                            {record.notes && (
                              <div className="md:col-span-2">
                                <h5 className="font-medium text-blue-700 mb-1">Notes</h5>
                                <p className="text-gray-700">{record.notes}</p>
                              </div>
                            )}
                          </div>

                          {/* Prescriptions */}
                          {record.prescriptions.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <h5 className="font-medium mb-2 flex items-center space-x-2">
                                <Pill className="w-4 h-4 text-purple-600" />
                                <span>Prescriptions</span>
                              </h5>
                              <div className="space-y-2">
                                {record.prescriptions.map((prescription) => (
                                  <div key={prescription.id} className="bg-gray-50 p-3 rounded text-sm">
                                    <div className="font-medium">{prescription.medicationName}</div>
                                    <div className="text-gray-600">
                                      {prescription.dosage} - {prescription.frequency} - {prescription.duration}
                                    </div>
                                    <div className="text-gray-500 text-xs">{prescription.instructions}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {index < patient.medicalHistory.length - 1 && <Separator className="mt-4" />}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Informations de suivi - pour agents */}
            {isAgent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>Informations de Suivi</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                      <FileText className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                      <div className="text-lg font-semibold text-blue-700">{patient.consultations}</div>
                      <div className="text-xs text-blue-600">Total consultations</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <Clock className="w-6 h-6 text-green-600 mx-auto mb-1" />
                      <div className="text-lg font-semibold text-green-700">
                        {new Date(patient.lastVisit).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-xs text-green-600">Dernière visite</div>
                    </div>
                  </div>
                  
                  {patient.primaryDoctor && (
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">Médecin traitant: {patient.primaryDoctor}</span>
                      </div>
                    </div>
                  )}

                  {patient.insurance && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-gray-600" />
                        <span className="font-medium">Assurance: {patient.insurance}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        {/* Modal de prise de rendez-vous */}
        {patient && (
          <AppointmentBookingModal
            patient={patient}
            isOpen={isAppointmentModalOpen}
            onClose={() => setIsAppointmentModalOpen(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};

export default PatientDetailSheet;