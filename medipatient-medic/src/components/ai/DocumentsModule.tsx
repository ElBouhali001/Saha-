import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Sparkles, 
  Settings, 
  History, 
  FileCheck,
  Brain,
  Stethoscope
} from 'lucide-react';
import DocumentGenerator from './DocumentGenerator';
import AdvancedDocumentGenerator from './AdvancedDocumentGenerator';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface DocumentsModuleProps {
  patientData?: {
    id: string;
    name: string;
    dateOfBirth: string;
    gender: string;
    allergies?: string[];
    chronicConditions?: string[];
  };
  consultationData?: {
    id: string;
    patientId: string;
    consultationDate: string;
    symptoms: string;
    diagnosis: string;
    treatmentPlan: string;
    vitals?: {
      temperature?: number;
      bloodPressure?: string;
      heartRate?: number;
      respiratoryRate?: number;
    };
    doctorName: string;
    doctorSpecialty: string;
  };
}

export default function DocumentsModule({ patientData, consultationData }: DocumentsModuleProps) {
  // Données de démonstration si aucune donnée réelle n'est fournie
  const demoPatientData = patientData || {
    id: 'demo-patient-1',
    name: 'Marie Dubois',
    dateOfBirth: '1985-03-15',
    gender: 'F',
    allergies: ['Pénicilline', 'Arachides'],
    chronicConditions: ['Hypertension', 'Diabète type 2']
  };

  const demoConsultationData = consultationData || {
    id: 'demo-consultation-1',
    patientId: 'demo-patient-1',
    consultationDate: new Date().toISOString().split('T')[0],
    symptoms: 'Douleurs thoraciques, essoufflement à l\'effort, fatigue persistante depuis une semaine',
    diagnosis: 'Insuffisance cardiaque légère avec possible surcharge hydrosodée',
    treatmentPlan: 'Prescription d\'IEC, diurétique léger, régime hyposodé strict, surveillance tensionnelle quotidienne',
    vitals: {
      temperature: 36.8,
      bloodPressure: '145/95',
      heartRate: 88,
      respiratoryRate: 18
    },
    doctorName: 'Dr. Jean Martin',
    doctorSpecialty: 'Cardiologie'
  };
  const [recentDocuments] = useState([
    {
      id: '1',
      title: 'Compte-rendu de consultation',
      type: 'Consultation',
      date: new Date(2024, 0, 15),
      patient: 'Marie Dubois',
      status: 'Finalisé'
    },
    {
      id: '2',
      title: 'Lettre de sortie',
      type: 'Hospitalisation',
      date: new Date(2024, 0, 14),
      patient: 'Jean Martin',
      status: 'En cours'
    },
    {
      id: '3',
      title: 'Certificat médical',
      type: 'Certificat',
      date: new Date(2024, 0, 13),
      patient: 'Claire Bernard',
      status: 'Envoyé'
    }
  ]);

  const [templateStats] = useState({
    totalGenerated: 247,
    thisMonth: 23,
    averageTime: '2.5 min',
    satisfaction: 4.7
  });

  return (
    <ProtectedRoute requiredPermission="create_consultation">
      <div className="space-y-6">
        {/* Header avec statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Documents générés</p>
                  <p className="text-2xl font-bold">{templateStats.totalGenerated}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Ce mois</p>
                  <p className="text-2xl font-bold text-primary">{templateStats.thisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Temps moyen</p>
                  <p className="text-2xl font-bold text-blue-500">{templateStats.averageTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Satisfaction</p>
                  <p className="text-2xl font-bold text-green-500">{templateStats.satisfaction}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interface principale */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Assistant IA de Documentation Médicale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="simple" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="simple" className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Simple
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Avancé
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Historique
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Modèles
                </TabsTrigger>
              </TabsList>

              <TabsContent value="simple" className="mt-6">
                <DocumentGenerator 
                  patientId={demoPatientData.id}
                  patientData={demoPatientData}
                  consultationData={demoConsultationData}
                />
              </TabsContent>

              <TabsContent value="advanced" className="mt-6">
                <AdvancedDocumentGenerator 
                  patientData={demoPatientData}
                  consultationData={demoConsultationData}
                />
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Documents récents</h3>
                    <Button variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Exporter tout
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {recentDocuments.map((doc) => (
                      <Card key={doc.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <h4 className="font-medium">{doc.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {doc.patient} • {doc.date.toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary">{doc.type}</Badge>
                              <Badge 
                                variant={doc.status === 'Finalisé' ? 'default' : 'outline'}
                              >
                                {doc.status}
                              </Badge>
                              <Button variant="outline" size="sm">
                                Voir
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="templates" className="mt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Modèles personnalisés</h3>
                    <Button>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Créer un modèle
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: 'Consultation cardiologie', usage: 45, specialty: 'Cardiologie' },
                      { name: 'Suivi diabète', usage: 32, specialty: 'Endocrinologie' },
                      { name: 'Bilan pneumologie', usage: 28, specialty: 'Pneumologie' },
                      { name: 'Certificat sport', usage: 67, specialty: 'Médecine du sport' },
                      { name: 'Arrêt de travail', usage: 123, specialty: 'Général' },
                      { name: 'Référence spécialiste', usage: 89, specialty: 'Général' }
                    ].map((template, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium">{template.name}</h4>
                              <p className="text-sm text-muted-foreground">{template.specialty}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">
                                {template.usage} utilisations
                              </span>
                              <Button variant="outline" size="sm">
                                Utiliser
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}