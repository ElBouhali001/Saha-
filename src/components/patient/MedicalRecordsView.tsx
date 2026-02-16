import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
    FileText,
    User,
    Calendar,
    Shield,
    Heart,
    Activity,
    Thermometer,
    Weight,
    Loader2,
    AlertTriangle,
    Pill,
    Droplet,
    Phone
} from 'lucide-react';
import { API_BASE_URL } from '@/config/app';

// --- Interfaces matching Java DTOs ---

interface Vitals {
    tension: string;      // e.g. "120/80"
    heartRate: string;    // e.g. "72 bpm"
    temperature: string;  // e.g. "36.5°C"
    weight: string;       // e.g. "75 kg"
}

interface MedicalRecord {
    id: string;
    date: string;         // ISO Date string
    doctorName: string;
    consultationType: string;
    diagnosis: string;
    symptoms: string;
    treatment: string;
    vitals: Vitals;
}

interface EmergencyContact {
    name: string;
    phone: string;
    relationship: string;
}

interface HealthSummary {
    allergies: string[];
    chronicConditions: string[];
    currentMedications: string[];
    bloodType: string;
    emergencyContact: EmergencyContact;
}

const MedicalRecordsView = () => {
    const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([]);
    const [healthSummary, setHealthSummary] = useState<HealthSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchMedicalData = async () => {
            try {
                const token = localStorage.getItem('medipatient_token');
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                // 1. Fetch Medical History
                const historyRes = await fetch(`${API_BASE_URL}/api/patient/medical-history`, { headers });
                if (historyRes.ok) {
                    setMedicalHistory(await historyRes.json());
                }

                // 2. Fetch Health Summary
                const summaryRes = await fetch(`${API_BASE_URL}/api/patient/health-summary`, { headers });
                if (summaryRes.ok) {
                    setHealthSummary(await summaryRes.json());
                }

            } catch (error) {
                console.error("Error fetching medical records:", error);
                toast({
                    title: "Erreur",
                    description: "Impossible de charger le dossier médical.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchMedicalData();
    }, [toast]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Chargement du dossier médical...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-white border-blue-100">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-blue-900">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <span className="text-xl">Mon Dossier Médical</span>
                        <Shield className="w-5 h-5 text-green-500 ml-auto" />
                    </CardTitle>
                </CardHeader>
            </Card>

            <Tabs defaultValue="history" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
                    <TabsTrigger value="history" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Historique</TabsTrigger>
                    <TabsTrigger value="summary" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Résumé Santé</TabsTrigger>
                    <TabsTrigger value="vitals" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Constantes</TabsTrigger>
                </TabsList>

                {/* TAB 1: HISTORY */}
                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-gray-500" />
                                Historique des Consultations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {medicalHistory.length > 0 ? (
                                <div className="space-y-6">
                                    {medicalHistory.map((record) => (
                                        <div key={record.id} className="relative pl-6 border-l-2 border-blue-200 hover:border-blue-500 transition-colors">
                                            {/* Timeline dot */}
                                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-500" />

                                            <div className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
                                                {/* Header of the record */}
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-dashed">
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                                                            {new Date(record.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </Badge>
                                                        <span className="font-semibold text-gray-900">{record.consultationType}</span>
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <User className="w-4 h-4 mr-1" />
                                                        {record.doctorName}
                                                    </div>
                                                </div>

                                                {/* Content Grid */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-3">
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Diagnostic</h4>
                                                            <p className="text-sm font-medium text-gray-900">{record.diagnosis}</p>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Symptômes</h4>
                                                            <p className="text-sm text-gray-700">{record.symptoms}</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Traitement</h4>
                                                            <p className="text-sm text-gray-700">{record.treatment}</p>
                                                        </div>

                                                        {/* Vitals Mini-Grid */}
                                                        <div className="bg-gray-50 rounded p-2 grid grid-cols-2 gap-2 text-xs">
                                                            <div className="flex items-center gap-1" title="Tension">
                                                                <Activity className="w-3 h-3 text-red-500" /> {record.vitals?.tension || 'N/A'}
                                                            </div>
                                                            <div className="flex items-center gap-1" title="Pouls">
                                                                <Heart className="w-3 h-3 text-pink-500" /> {record.vitals?.heartRate || 'N/A'}
                                                            </div>
                                                            <div className="flex items-center gap-1" title="Température">
                                                                <Thermometer className="w-3 h-3 text-blue-500" /> {record.vitals?.temperature || 'N/A'}
                                                            </div>
                                                            <div className="flex items-center gap-1" title="Poids">
                                                                <Weight className="w-3 h-3 text-green-500" /> {record.vitals?.weight || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                    <p>Aucun historique médical disponible.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 2: HEALTH SUMMARY */}
                <TabsContent value="summary" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Allergies */}
                        <Card className="border-red-100 bg-red-50/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-red-700 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" /> Allergies
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {healthSummary?.allergies && healthSummary.allergies.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {healthSummary.allergies.map((allergy, index) => (
                                            <Badge key={index} variant="destructive" className="px-3 py-1">
                                                {allergy}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">Aucune allergie connue</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Conditions */}
                        <Card className="border-orange-100 bg-orange-50/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-orange-700 flex items-center gap-2">
                                    <Activity className="w-5 h-5" /> Conditions Chroniques
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {healthSummary?.chronicConditions && healthSummary.chronicConditions.length > 0 ? (
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        {healthSummary.chronicConditions.map((condition, index) => (
                                            <li key={index}>{condition}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">Aucune condition chronique</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Medications */}
                        <Card className="border-blue-100 bg-blue-50/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
                                    <Pill className="w-5 h-5" /> Traitements Actuels
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {healthSummary?.currentMedications && healthSummary.currentMedications.length > 0 ? (
                                    <div className="space-y-2">
                                        {healthSummary.currentMedications.map((med, index) => (
                                            <div key={index} className="flex items-center gap-2 text-sm bg-white p-2 rounded border border-blue-100">
                                                <div className="w-2 h-2 rounded-full bg-blue-400" />
                                                {med}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">Aucun traitement en cours</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* General Info */}
                        <Card className="border-green-100 bg-green-50/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-green-700 flex items-center gap-2">
                                    <User className="w-5 h-5" /> Informations Générales
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between bg-white p-3 rounded border border-green-100">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-red-500" /> Groupe Sanguin
                  </span>
                                    <Badge variant="outline" className="text-lg font-bold border-red-200 text-red-700">
                                        {healthSummary?.bloodType || 'N/A'}
                                    </Badge>
                                </div>

                                <div className="bg-white p-3 rounded border border-green-100">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-green-600" /> Contact d'urgence
                  </span>
                                    {healthSummary?.emergencyContact ? (
                                        <div className="text-sm ml-6">
                                            <p className="font-semibold">{healthSummary.emergencyContact.name}</p>
                                            <p className="text-gray-600">{healthSummary.emergencyContact.phone}</p>
                                            <p className="text-xs text-gray-500">({healthSummary.emergencyContact.relationship})</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic ml-6">Non renseigné</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* TAB 3: VITALS (Graphs placeholder) */}
                <TabsContent value="vitals" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Évolution des Constantes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {medicalHistory.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Tension Chart Placeholder */}
                                    <div className="p-4 border rounded-lg bg-white">
                                        <h3 className="font-medium mb-4 flex items-center space-x-2 text-red-700">
                                            <Activity className="w-4 h-4" />
                                            <span>Tension Artérielle</span>
                                        </h3>
                                        <div className="space-y-2">
                                            {medicalHistory.slice(0, 5).map((record) => (
                                                <div key={record.id} className="flex justify-between text-sm py-2 border-b last:border-0">
                                                    <span className="text-gray-500">{new Date(record.date).toLocaleDateString()}</span>
                                                    <span className="font-mono font-medium">{record.vitals?.tension || '-'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Weight Chart Placeholder */}
                                    <div className="p-4 border rounded-lg bg-white">
                                        <h3 className="font-medium mb-4 flex items-center space-x-2 text-green-700">
                                            <Weight className="w-4 h-4" />
                                            <span>Poids</span>
                                        </h3>
                                        <div className="space-y-2">
                                            {medicalHistory.slice(0, 5).map((record) => (
                                                <div key={record.id} className="flex justify-between text-sm py-2 border-b last:border-0">
                                                    <span className="text-gray-500">{new Date(record.date).toLocaleDateString()}</span>
                                                    <span className="font-mono font-medium">{record.vitals?.weight || '-'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Activity className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                    <p>Pas assez de données pour afficher l'évolution.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default MedicalRecordsView;