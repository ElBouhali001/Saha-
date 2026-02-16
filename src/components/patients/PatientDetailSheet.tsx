import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
import PatientAppointments from './PatientAppointments';
import PatientCoveragePanel from '@/components/insurance/PatientCoveragePanel';

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
  const { t } = useTranslation();

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
                {isDoctor ? t('patients.detail.full_medical_record') : t('patients.detail.patient_info')}
              </SheetDescription>
            </div>
            {(isDoctor || isAgent) && (
              <Button
                onClick={() => setIsAppointmentModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {t('patients.detail.book_appointment')}
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
                  <span>{t('patients.detail.general_info')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      {t('patients.detail.age_years', { age: calculateAge(patient.dateOfBirth) })}
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
                    <span className="text-sm font-medium">{t('patients.detail.urgency_level')}:</span>
                    <Badge variant={getUrgencyColor(patient.urgencyLevel)}>
                      {patient.urgencyLevel === 'high' ? t('patients.urgency.high') :
                        patient.urgencyLevel === 'medium' ? t('patients.urgency.medium') : t('patients.urgency.low')}
                    </Badge>
                  </div>
                )}

                {/* Contact d'urgence */}
                {patient.emergencyContact && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2 flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-red-500" />
                      <span>{t('patients.detail.emergency_contact')}</span>
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
                      <span>{t('patients.detail.medical_summary')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                        <div className="text-lg font-semibold text-blue-700">{patient.consultations}</div>
                        <div className="text-xs text-blue-600">{t('patients.detail.consultations')}</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <UserCheck className="w-6 h-6 text-green-600 mx-auto mb-1" />
                        <div className="text-lg font-semibold text-green-700">{patient.primaryDoctor || t('patients.detail.not_assigned')}</div>
                        <div className="text-xs text-green-600">{t('patients.detail.primary_doctor')}</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <Shield className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                        <div className="text-lg font-semibold text-purple-700">{patient.insurance || t('patients.detail.none')}</div>
                        <div className="text-xs text-purple-600">{t('patients.detail.insurance')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Historique médical */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ClipboardList className="w-4 h-4" />
                      <span>{t('patients.detail.medical_history')}</span>
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
                              <span className="text-sm text-gray-600">{t('patients.detail.by_doctor', { doctor: record.doctorName })}</span>
                            </div>
                            {record.followUpDate && (
                              <Badge variant="outline" className="text-xs">
                                {t('patients.detail.follow_up', { date: new Date(record.followUpDate).toLocaleDateString('fr-FR') })}
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h5 className="font-medium text-red-700 mb-1">{t('patients.detail.diagnosis')}</h5>
                              <p className="text-gray-700">{record.diagnosis}</p>
                            </div>
                            <div>
                              <h5 className="font-medium text-orange-700 mb-1">{t('patients.detail.symptoms')}</h5>
                              <p className="text-gray-700">{record.symptoms}</p>
                            </div>
                            <div className="md:col-span-2">
                              <h5 className="font-medium text-green-700 mb-1">{t('patients.detail.treatment')}</h5>
                              <p className="text-gray-700">{record.treatment}</p>
                            </div>
                            {record.notes && (
                              <div className="md:col-span-2">
                                <h5 className="font-medium text-blue-700 mb-1">{t('patients.detail.notes')}</h5>
                                <p className="text-gray-700">{record.notes}</p>
                              </div>
                            )}
                          </div>

                          {/* Prescriptions */}
                          {record.prescriptions.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <h5 className="font-medium mb-2 flex items-center space-x-2">
                                <Pill className="w-4 h-4 text-purple-600" />
                                <span>{t('patients.detail.prescriptions')}</span>
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
                    <span>{t('patients.detail.follow_up_info')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                      <FileText className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                      <div className="text-lg font-semibold text-blue-700">{patient.consultations}</div>
                      <div className="text-xs text-blue-600">{t('patients.detail.total_consultations')}</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <Clock className="w-6 h-6 text-green-600 mx-auto mb-1" />
                      <div className="text-lg font-semibold text-green-700">
                        {new Date(patient.lastVisit).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-xs text-green-600">{t('patients.detail.last_visit_label')}</div>
                    </div>
                  </div>

                  {patient.primaryDoctor && (
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">{t('patients.detail.primary_doctor')}: {patient.primaryDoctor}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Couverture Mutuelle - visible pour agent et médecin */}
            {(isDoctor || isAgent) && (
              <PatientCoveragePanel patientId={patient.id} compact />
            )}

            {/* Rendez-vous du patient */}
            <PatientAppointments patient={patient} />
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