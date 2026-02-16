import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import {
    FlaskConical,
    Clock,
    AlertCircle,
    CheckCircle,
    Calendar,
    Loader2,
    Info
} from 'lucide-react';
import { API_BASE_URL } from '@/config/app';

// --- Interfaces (Doivent correspondre à vos DTOs Java) ---

interface LabTest {
    id: string;
    name: string;
    type: string;       // ex: "Hématologie"
    urgency: 'URGENT' | 'NORMAL' | 'ROUTINE';
    prescribedBy: string; // Nom du médecin
    prescribedDate: string; // ISO Date string
    requirements: string[]; // Liste de consignes (ex: "Jeûne 12h")
    estimatedDuration: string;
    cost: number;       // Prix en FCFA
    coveragePercentage: number; // ex: 70 pour 70%
    status: 'PENDING' | 'SCHEDULED' | 'COMPLETED';
}

interface LabResult {
    id: string;
    testName: string;
    type: string;
    completedDate: string;
    status: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
    fileUrl?: string; // Pour télécharger le PDF
}

const LabRequirements = () => {
    const [pendingTests, setPendingTests] = useState<LabTest[]>([]);
    const [completedTests, setCompletedTests] = useState<LabResult[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchLabData = async () => {
            try {
                const token = localStorage.getItem('medipatient_token');
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                // 1. Récupérer les analyses en attente
                const pendingRes = await fetch(`${API_BASE_URL}/api/patient/lab-tests/pending`, { headers });
                if (pendingRes.ok) {
                    setPendingTests(await pendingRes.json());
                }

                // 2. Récupérer les analyses terminées
                const completedRes = await fetch(`${API_BASE_URL}/api/patient/lab-tests/completed`, { headers });
                if (completedRes.ok) {
                    setCompletedTests(await completedRes.json());
                }

            } catch (error) {
                console.error("Erreur chargement laboratoire:", error);
                toast({
                    title: "Erreur",
                    description: "Impossible de charger les données du laboratoire.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchLabData();
    }, [toast]);

    const getUrgencyBadge = (urgency: string) => {
        switch (urgency) {
            case 'URGENT':
                return <Badge variant="destructive">Urgent</Badge>;
            case 'NORMAL':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">Normal</Badge>;
            default:
                return <Badge variant="outline">Routine</Badge>;
        }
    };

    const handleSchedule = (testId: string) => {
        toast({
            title: "Fonctionnalité à venir",
            description: `La prise de RDV labo pour l'analyse #${testId} sera bientôt disponible.`,
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Chargement des prescriptions...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* SECTION 1: Analyses Prescrites (En attente) */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <FlaskConical className="w-5 h-5 text-blue-500" />
                        <span>Analyses Prescrites</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {pendingTests.length > 0 ? (
                            pendingTests.map((test) => (
                                <Card key={test.id} className="border-l-4 border-l-blue-500 shadow-sm">
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
                                            <div>
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="font-semibold text-lg">{test.name}</h3>
                                                    {getUrgencyBadge(test.urgency)}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">
                                                    Type: {test.type} • Prescrit par {test.prescribedBy}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Prescrit le {new Date(test.prescribedDate).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                            <div className="text-left md:text-right bg-gray-50 p-3 rounded-lg border">
                                                <p className="font-semibold text-gray-900">{test.cost.toLocaleString()} FCFA</p>
                                                <p className="text-sm text-green-600 font-medium">
                                                    Prise en charge: {test.coveragePercentage}%
                                                </p>
                                            </div>
                                        </div>

                                        {/* Consignes / Prérequis */}
                                        {test.requirements && test.requirements.length > 0 && (
                                            <Alert className="mb-4 bg-amber-50 border-amber-200">
                                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                                <AlertTitle className="text-amber-800 font-medium ml-2">Prérequis importants</AlertTitle>
                                                <AlertDescription className="text-amber-700 ml-2 mt-1">
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {test.requirements.map((req, index) => (
                                                            <li key={index} className="text-sm">{req}</li>
                                                        ))}
                                                    </ul>
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                                            <div className="flex items-center space-x-2">
                                                <Clock className="w-4 h-4" />
                                                <span>Durée estimée: {test.estimatedDuration}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>Statut: {test.status === 'SCHEDULED' ? 'Programmé' : 'À programmer'}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Button onClick={() => handleSchedule(test.id)} className="flex-1 bg-blue-600 hover:bg-blue-700">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Programmer
                                            </Button>
                                            <Button variant="outline" className="flex-1">
                                                <Info className="w-4 h-4 mr-2" />
                                                Détails
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <FlaskConical className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                <p>Aucune analyse en attente.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* SECTION 2: Analyses Terminées */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Analyses Terminées</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {completedTests.length > 0 ? (
                            completedTests.map((test) => (
                                <div key={test.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors gap-3">
                                    <div>
                                        <h4 className="font-medium text-gray-900">{test.testName}</h4>
                                        <p className="text-sm text-gray-600">
                                            {test.type} • Terminé le {new Date(test.completedDate).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className={
                                            test.status === 'NORMAL' ? 'bg-green-100 text-green-800 border-green-200' :
                                                test.status === 'ABNORMAL' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                    'bg-red-100 text-red-800 border-red-200'
                                        }>
                                            {test.status}
                                        </Badge>
                                        <Button size="sm" variant="outline">
                                            Voir résultats
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">Aucun historique d'analyse disponible.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* SECTION 3: Conseils Statiques (Ne change pas) */}
            <Card>
                <CardHeader>
                    <CardTitle>Recommandations Générales</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <h4 className="font-medium text-blue-900 mb-2">Avant les analyses</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Respecter les consignes de jeûne</li>
                                <li>• Éviter le stress et l'effort physique</li>
                                <li>• Bien dormir la nuit précédente</li>
                                <li>• Apporter tous les documents nécessaires</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                            <h4 className="font-medium text-green-900 mb-2">Le jour J</h4>
                            <ul className="text-sm text-green-800 space-y-1">
                                <li>• Arriver 15 minutes avant l'heure</li>
                                <li>• Porter des vêtements confortables</li>
                                <li>• Informer des médicaments pris</li>
                                <li>• Rester détendu pendant l'examen</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LabRequirements;