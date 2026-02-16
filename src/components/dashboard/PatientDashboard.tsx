import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Calendar,
    FileText,
    Pill,
    Video,
    Download,
    Clock,
    MapPin,
    User,
    Activity,
    Shield,
    Loader2
} from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'; // Pour récupérer l'utilisateur connecté
import { API_BASE_URL } from '@/config/app'; // Votre URL Backend (localhost:7080)

interface PatientDashboardProps {
    onNavigate?: (page: string) => void;
}

// Interfaces pour typer les données reçues du Backend
interface Appointment {
    id: string;
    dateTime: string;
    doctorName: string;
    type: string;
    location: string;
}

interface Prescription {
    id: string;
    date: string;
    doctorName: string;
    medicationsCount: number;
    status: 'ACTIVE' | 'COMPLETED';
}

interface MedicalHistory {
    id: string;
    date: string;
    title: string;
    doctorName: string;
    description: string;
    type: 'CONSULTATION' | 'LAB' | 'IMAGING';
}

const PatientDashboard = ({ onNavigate }: PatientDashboardProps = {}) => {
    const { user } = useSupabaseAuth();

    // États pour stocker les données réelles
    const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
    const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>([]);
    const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([]);
    const [loading, setLoading] = useState(true);

    // Récupération du Prénom depuis le contexte Auth
    const firstName = user?.user_metadata?.first_name || 'Patient';

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('medipatient_token');
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                // 1. Récupérer le prochain rendez-vous
                // Note: Si ces endpoints n'existent pas encore dans votre Java, cela échouera proprement (catch)
                const aptResponse = await fetch(`${API_BASE_URL}/api/patient/appointments/next`, { headers });
                if (aptResponse.ok) {
                    const data = await aptResponse.json();
                    setNextAppointment(data);
                }

                // 2. Récupérer les ordonnances récentes
                const prescResponse = await fetch(`${API_BASE_URL}/api/patient/prescriptions/recent`, { headers });
                if (prescResponse.ok) {
                    const data = await prescResponse.json();
                    setRecentPrescriptions(data);
                }

                // 3. Récupérer l'historique
                const historyResponse = await fetch(`${API_BASE_URL}/api/patient/medical-history/recent`, { headers });
                if (historyResponse.ok) {
                    const data = await historyResponse.json();
                    setMedicalHistory(data);
                }

            } catch (error) {
                console.log("Données non disponibles ou API non connectée", error);
                // On ne fait rien, les états resteront vides (ce qui est correct pour un nouveau compte)
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Chargement de votre dossier...</span>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Bonjour {firstName}</h1>
                    <p className="text-gray-600">Votre espace patient personnel</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                    {new Date().toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
            </div>

            {/* Next Appointment Card (Dynamique) */}
            <Card className={`border-l-4 ${nextAppointment ? 'border-l-blue-500 bg-blue-50' : 'border-l-gray-300 bg-gray-50'}`}>
                <CardHeader>
                    <CardTitle className={`flex items-center space-x-2 ${nextAppointment ? 'text-blue-900' : 'text-gray-500'}`}>
                        <Calendar className="w-5 h-5" />
                        <span>Prochain Rendez-vous</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {nextAppointment ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    <span className="text-lg font-semibold text-blue-900">
                      {new Date(nextAppointment.dateTime).toLocaleDateString('fr-FR', {
                          weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit'
                      })}
                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <User className="w-4 h-4 text-blue-600" />
                                    <span className="text-blue-800">{nextAppointment.doctorName}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <MapPin className="w-4 h-4 text-blue-600" />
                                    <span className="text-blue-800">{nextAppointment.location}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-end">
                                <Button className="bg-blue-600 hover:bg-blue-700">Modifier RDV</Button>
                            </div>
                        </div>
                    ) : (
                        // État Vide (Empty State) pour les nouveaux patients
                        <div className="flex flex-col items-center justify-center py-4 space-y-3">
                            <p className="text-gray-500">Aucun rendez-vous planifié.</p>
                            <Button variant="outline" onClick={() => onNavigate?.('appointments')}>
                                Prendre un rendez-vous
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Actions Rapides</CardTitle>
                    <CardDescription>Accès direct à vos services</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <Button
                            className="h-20 flex-col space-y-2 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => onNavigate?.('appointments')}
                        >
                            <Calendar className="w-6 h-6" />
                            <span>Prendre RDV</span>
                        </Button>
                        <Button className="h-20 flex-col space-y-2" variant="outline" onClick={() => onNavigate?.('telemedicine')}>
                            <Video className="w-6 h-6" />
                            <span>Téléconsultation</span>
                        </Button>
                        <Button className="h-20 flex-col space-y-2" variant="outline" onClick={() => onNavigate?.('pharmacy')}>
                            <Pill className="w-6 h-6" />
                            <span>Mes Ordonnances</span>
                        </Button>
                        <Button className="h-20 flex-col space-y-2" variant="outline" onClick={() => onNavigate?.('documents')}>
                            <FileText className="w-6 h-6" />
                            <span>Mon Dossier</span>
                        </Button>
                        <Button
                            className="h-20 flex-col space-y-2"
                            variant="outline"
                            onClick={() => onNavigate?.('insurance')}
                        >
                            <Shield className="w-6 h-6" />
                            <span>Ma Mutuelle</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Medical History and Prescriptions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ordonnances Récentes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Pill className="w-5 h-5 text-green-500" />
                            <span>Ordonnances Récentes</span>
                        </CardTitle>
                        <CardDescription>Vos dernières prescriptions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recentPrescriptions.length > 0 ? (
                            recentPrescriptions.map((prescription, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">
                                            {new Date(prescription.date).toLocaleDateString('fr-FR')}
                                        </p>
                                        <p className="text-sm text-gray-600">{prescription.doctorName}</p>
                                        <p className="text-xs text-gray-500">{prescription.medicationsCount} médicaments</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          prescription.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}>
                        {prescription.status === 'ACTIVE' ? 'Actif' : 'Terminé'}
                      </span>
                                        <Button size="sm" variant="outline">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-gray-500 text-sm">
                                Aucune ordonnance récente.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Historique Médical */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                            <span>Historique Médical</span>
                        </CardTitle>
                        <CardDescription>Résumé de vos consultations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {medicalHistory.length > 0 ? (
                            medicalHistory.map((history, index) => (
                                <div key={index} className="p-3 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-medium text-gray-900">
                                            {new Date(history.date).toLocaleDateString('fr-FR')}
                                        </p>
                                        <span className="text-xs text-gray-500">{history.doctorName}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{history.title}</p>
                                    <p className="text-xs text-blue-600 mt-1">{history.description}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-gray-500 text-sm">
                                Aucun historique disponible.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Résumé Santé (Statique pour l'instant car complexe à mapper) */}
            <Card>
                <CardHeader>
                    <CardTitle>Résumé Santé</CardTitle>
                    <CardDescription>Informations importantes (Données à compléter)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                            <h3 className="font-semibold text-red-800 mb-2">Allergies</h3>
                            <p className="text-sm text-red-600">Aucune connue</p>
                        </div>

                        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <h3 className="font-semibold text-yellow-800 mb-2">Traitements</h3>
                            <p className="text-sm text-yellow-600">Aucun traitement actif</p>
                        </div>

                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h3 className="font-semibold text-blue-800 mb-2">Groupe sanguin</h3>
                            <p className="text-sm text-blue-600">Non renseigné</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PatientDashboard;