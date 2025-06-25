
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MedicalRecord, Prescription } from '@/types/patient';
import { FileText, Pill, Send, User, QrCode, Plus } from 'lucide-react';

const MedicalConsultation = () => {
  const [ticketCode, setTicketCode] = useState('');
  const [patient, setPatient] = useState<any>(null);
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

  // Mock patient data for demonstration
  const mockPatients = {
    'TK-123456': {
      id: '1',
      firstName: 'Jean',
      lastName: 'Koné',
      dateOfBirth: '1985-05-15',
      phone: '+225-07-08-09-10',
      medicalHistory: []
    }
  };

  const handleScanTicket = () => {
    const foundPatient = mockPatients[ticketCode as keyof typeof mockPatients];
    if (foundPatient) {
      setPatient(foundPatient);
    } else {
      alert('Code ticket invalide');
    }
  };

  const handleAddPrescription = () => {
    const prescription: Prescription = {
      id: Date.now().toString(),
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
  };

  const handleSaveConsultation = () => {
    if (!patient) return;

    const medicalRecord: MedicalRecord = {
      id: Date.now().toString(),
      patientId: patient.id,
      date: new Date().toISOString(),
      doctorId: '2',
      doctorName: 'Dr. Kouamé Adjoua',
      diagnosis: consultation.diagnosis,
      symptoms: consultation.symptoms,
      treatment: consultation.treatment,
      notes: consultation.notes,
      prescriptions: prescriptions
    };

    console.log('Consultation sauvegardée:', medicalRecord);
    
    // Reset form
    setConsultation({ symptoms: '', diagnosis: '', treatment: '', notes: '' });
    setPrescriptions([]);
    setPatient(null);
    setTicketCode('');
    
    alert('Consultation sauvegardée avec succès');
  };

  const generateTransmissionCode = () => {
    const code = 'TX-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    alert(`Code de transmission généré: ${code}\nCe code est valable 24h pour accès sécurisé.`);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Consultation Médicale</h1>

      {!patient ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="w-5 h-5 mr-2" />
              Scanner le Ticket Patient
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ticketCode">Code du ticket</Label>
              <Input
                id="ticketCode"
                placeholder="TK-123456"
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
              />
            </div>
            <Button onClick={handleScanTicket} className="w-full">
              Accéder au Dossier Patient
            </Button>
            <p className="text-sm text-gray-600 text-center">
              Exemple de code: TK-123456
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informations Patient
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
            </CardContent>
          </Card>

          {/* Consultation Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Consultation
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

              {/* Prescriptions */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-base font-medium">Prescriptions</Label>
                  <Dialog open={isAddPrescriptionOpen} onOpenChange={setIsAddPrescriptionOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nouvelle Prescription</DialogTitle>
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
                      <div key={prescription.id} className="border rounded p-3 text-sm">
                        <div className="font-medium">{prescription.medicationName}</div>
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

              {/* Action Buttons */}
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
  );
};

export default MedicalConsultation;
