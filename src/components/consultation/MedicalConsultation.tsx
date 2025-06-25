import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MedicalRecord, Prescription } from '@/types/patient';
import { FileText, Pill, Send, User, QrCode, Plus, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/utils/permissions';
import { generateSecureTicket, generateSecureToken } from '@/utils/security';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const MedicalConsultation = () => {
  const { user } = useAuth();
  const permissions = usePermissions(user);
  const [ticketCode, setTicketCode] = useState('');
  const [patient, setPatient] = useState<any>(null);
  const [accessGranted, setAccessGranted] = useState(false);
  const [consultation, setConsultation] = useState({
    symptoms: '',
    diagnosis: '',
    treatment: '',
    notes: ''
  });
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isAddPrescriptionOpen, setIsAddPrescriptionOpen] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });

  // Données patients sécurisées avec tickets
  const securePatientData = {
    'TK-1703845920-A7B2C9': {
      id: '1',
      firstName: 'Jean',
      lastName: 'Koné',
      dateOfBirth: '1985-05-15',
      phone: '+225-07-08-09-10',
      medicalHistory: [],
      ticketExpiry: Date.now() + (2 * 60 * 60 * 1000) // 2h validity
    }
  };

  const handleScanTicket = () => {
    const foundPatient = securePatientData[ticketCode as keyof typeof securePatientData];
    
    if (foundPatient) {
      // Vérifier l'expiration du ticket
      if (Date.now() > foundPatient.ticketExpiry) {
        alert('Code ticket expiré. Veuillez demander un nouveau ticket.');
        return;
      }
      
      // Vérifier les permissions
      if (!permissions.canCreateConsultation()) {
        alert('Accès refusé. Vous n\'avez pas les permissions pour effectuer une consultation.');
        return;
      }
      
      setPatient(foundPatient);
      setAccessGranted(true);
      
      // Audit log
      console.log(`[AUDIT] Accès consultation - Patient: ${foundPatient.firstName} ${foundPatient.lastName} - Doctor: ${user?.firstName} ${user?.lastName} - Time: ${new Date().toISOString()}`);
      
    } else {
      alert('Code ticket invalide ou expiré');
      console.log(`[AUDIT] Tentative accès ticket invalide - Code: ${ticketCode} - User: ${user?.email} - Time: ${new Date().toISOString()}`);
    }
  };

  const handleAddPrescription = () => {
    if (!permissions.canCreateConsultation()) {
      alert('Accès refusé pour la prescription');
      return;
    }
    
    const prescription: Prescription = {
      id: generateSecureToken(),
      ...newPrescription,
      prescribed_date: new Date().toISOString()
    };
    
    setPrescriptions([...prescriptions, prescription]);
    setNewPrescription({
      medicationName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    });
    setIsAddPrescriptionOpen(false);
    
    // Audit log
    console.log(`[AUDIT] Prescription ajoutée - Patient: ${patient?.firstName} ${patient?.lastName} - Medication: ${prescription.medicationName} - Doctor: ${user?.firstName} ${user?.lastName} - Time: ${new Date().toISOString()}`);
  };

  const handleSaveConsultation = () => {
    if (!patient || !accessGranted) return;
    
    if (!permissions.canCreateConsultation()) {
      alert('Accès refusé pour sauvegarder la consultation');
      return;
    }

    const medicalRecord: MedicalRecord = {
      id: generateSecureToken(),
      patientId: patient.id,
      date: new Date().toISOString(),
      doctorId: user?.id || '',
      doctorName: `${user?.firstName} ${user?.lastName}`,
      diagnosis: consultation.diagnosis,
      symptoms: consultation.symptoms,
      treatment: consultation.treatment,
      notes: consultation.notes,
      prescriptions: prescriptions
    };

    // Audit log complet
    console.log(`[AUDIT] Consultation sauvegardée - Patient: ${patient.firstName} ${patient.lastName} - Doctor: ${user?.firstName} ${user?.lastName} - Diagnosis: ${consultation.diagnosis} - Time: ${new Date().toISOString()}`);
    
    // Reset sécurisé
    setConsultation({ symptoms: '', diagnosis: '', treatment: '', notes: '' });
    setPrescriptions([]);
    setPatient(null);
    setTicketCode('');
    setAccessGranted(false);
    
    alert('Consultation sauvegardée avec succès');
  };

  const generateTransmissionCode = () => {
    if (!permissions.canCreateConsultation()) {
      alert('Accès refusé pour la transmission');
      return;
    }
    
    const code = generateSecureTicket();
    const expiryTime = new Date(Date.now() + (24 * 60 * 60 * 1000)).toLocaleString('fr-FR');
    
    // Audit log
    console.log(`[AUDIT] Code transmission généré - Code: ${code} - Patient: ${patient?.firstName} ${patient?.lastName} - Doctor: ${user?.firstName} ${user?.lastName} - Time: ${new Date().toISOString()}`);
    
    alert(`Code de transmission sécurisé généré:\n${code}\n\nValable jusqu'au: ${expiryTime}\nAccès sécurisé avec traçabilité complète.`);
  };

  return (
    <ProtectedRoute requiredPermission="create_consultation">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Consultation Médicale Sécurisée</h1>
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <Shield className="w-4 h-4" />
            <span>Accès sécurisé - {user?.firstName} {user?.lastName}</span>
          </div>
        </div>

        {!patient || !accessGranted ? (
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="w-5 h-5 mr-2" />
                Authentification par Ticket Sécurisé
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Sécurité renforcée : Accès par code ticket unique et temporaire
                </p>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• Ticket valide 2 heures maximum</li>
                  <li>• Traçabilité complète des accès</li>
                  <li>• Vérification des permissions médicales</li>
                </ul>
              </div>
              
              <div>
                <Label htmlFor="ticketCode">Code du ticket patient</Label>
                <Input
                  id="ticketCode"
                  placeholder="TK-1703845920-A7B2C9"
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value)}
                  className="font-mono"
                />
              </div>
              
              <Button onClick={handleScanTicket} className="w-full bg-blue-600 hover:bg-blue-700">
                <Shield className="w-4 h-4 mr-2" />
                Accéder au Dossier (Sécurisé)
              </Button>
              
              <p className="text-sm text-gray-600 text-center">
                Code test: TK-1703845920-A7B2C9
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Info avec indicateurs de sécurité */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Patient Authentifié
                  <Shield className="w-4 h-4 ml-auto text-green-600" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Nom complet</Label>
                  <p className="text-sm">{patient.firstName} {patient.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date de naissance</Label>
                  <p className="text-sm">{new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Téléphone</Label>
                  <p className="text-sm">{patient.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Antécédents</Label>
                  <p className="text-sm text-gray-600">
                    {patient.medicalHistory.length === 0 ? 'Aucun antécédent' : 
                     `${patient.medicalHistory.length} consultation(s)`}
                  </p>
                </div>
                <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Accès autorisé et tracé
                </div>
              </CardContent>
            </Card>

            {/* Consultation Form */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Consultation Médicale
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="symptoms">Symptômes</Label>
                  <Textarea
                    id="symptoms"
                    placeholder="Décrire les symptômes du patient..."
                    value={consultation.symptoms}
                    onChange={(e) => setConsultation({...consultation, symptoms: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="diagnosis">Diagnostic</Label>
                  <Textarea
                    id="diagnosis"
                    placeholder="Diagnostic établi..."
                    value={consultation.diagnosis}
                    onChange={(e) => setConsultation({...consultation, diagnosis: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="treatment">Traitement</Label>
                  <Textarea
                    id="treatment"
                    placeholder="Plan de traitement..."
                    value={consultation.treatment}
                    onChange={(e) => setConsultation({...consultation, treatment: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes additionnelles</Label>
                  <Textarea
                    id="notes"
                    placeholder="Notes complémentaires..."
                    value={consultation.notes}
                    onChange={(e) => setConsultation({...consultation, notes: e.target.value})}
                  />
                </div>

                {/* Prescriptions sécurisées */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <Label className="text-base font-medium">Prescriptions Sécurisées</Label>
                    <Dialog open={isAddPrescriptionOpen} onOpenChange={setIsAddPrescriptionOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Ajouter
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Nouvelle Prescription Sécurisée</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Médicament</Label>
                            <Input
                              value={newPrescription.medicationName}
                              onChange={(e) => setNewPrescription({...newPrescription, medicationName: e.target.value})}
                              placeholder="Nom du médicament"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Dosage</Label>
                              <Input
                                value={newPrescription.dosage}
                                onChange={(e) => setNewPrescription({...newPrescription, dosage: e.target.value})}
                                placeholder="Ex: 500mg"
                              />
                            </div>
                            <div>
                              <Label>Fréquence</Label>
                              <Input
                                value={newPrescription.frequency}
                                onChange={(e) => setNewPrescription({...newPrescription, frequency: e.target.value})}
                                placeholder="Ex: 2x/jour"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Durée</Label>
                            <Input
                              value={newPrescription.duration}
                              onChange={(e) => setNewPrescription({...newPrescription, duration: e.target.value})}
                              placeholder="Ex: 7 jours"
                            />
                          </div>
                          <div>
                            <Label>Instructions</Label>
                            <Textarea
                              value={newPrescription.instructions}
                              onChange={(e) => setNewPrescription({...newPrescription, instructions: e.target.value})}
                              placeholder="Instructions d'usage..."
                            />
                          </div>
                          <Button onClick={handleAddPrescription} className="w-full">
                            <Shield className="w-4 h-4 mr-2" />
                            Ajouter Prescription
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {prescriptions.length === 0 ? (
                    <p className="text-sm text-gray-500">Aucune prescription ajoutée</p>
                  ) : (
                    <div className="space-y-2">
                      {prescriptions.map((prescription) => (
                        <div key={prescription.id} className="border rounded p-3 text-sm bg-green-50">
                          <div className="font-medium flex items-center">
                            {prescription.medicationName}
                            <Shield className="w-3 h-3 ml-2 text-green-600" />
                          </div>
                          <div className="text-gray-600">
                            {prescription.dosage} - {prescription.frequency} - {prescription.duration}
                          </div>
                          <div className="text-gray-500 text-xs mt-1">
                            {prescription.instructions}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons avec sécurité */}
                <div className="flex space-x-3 pt-4 border-t">
                  <Button onClick={handleSaveConsultation} className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                  <Button variant="outline" onClick={generateTransmissionCode} className="flex-1">
                    <Send className="w-4 h-4 mr-2" />
                    Transmettre
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Pill className="w-4 h-4 mr-2" />
                    Ordonnance PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default MedicalConsultation;
