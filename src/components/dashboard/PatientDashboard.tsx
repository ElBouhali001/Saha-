import React, { useState, useEffect } from 'react';
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Calendar, FileText, Pill, Video, Download,
    Clock, MapPin, User, Shield, Loader2
} from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { API_BASE_URL, IS_DEMO } from '@/config/app';

interface PatientDashboardProps {
    onNavigate?: (page: string) => void;
}

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

// ✅ MOCK DATA — served when IS_DEMO = true
const MOCK_NEXT_APPOINTMENT: Appointment = {
    id: 'apt-001',
    dateTime: '2026-03-20T10:00:00Z',
    doctorName: 'Dr. Cheikh Diop',
    type: 'Téléconsultation',
    location: 'En ligne — MediPatient'
};

const MOCK_PRESCRIPTIONS: Prescription[] = [
    {
        id: 'presc-001',
        date: '2026-01-15',
        doctorName: 'Dr. Cheikh Diop',
        medicationsCount: 2,
        status: 'ACTIVE'
    },
    {
        id: 'presc-002',
        date: '2025-10-05',
        doctorName: 'Dr. Marie Dubois',
        medicationsCount: 1,
        status: 'COMPLETED'
    }
];

const MOCK_MEDICAL_HISTORY: MedicalHistory[] = [
    {
        id: 'hist-001',
        date: '2026-01-15',
        title: 'Rhinopharyngite aiguë',
        doctorName: 'Dr. Cheikh Diop',
        description: 'Traitement: Paracétamol 1g 3x/jour, repos 3 jours',
        type: 'CONSULTATION'
    },
    {
        id: 'hist-002',
        date: '2025-10-05',
        title: 'Bilan Annuel',
        doctorName: 'Dr. Marie Dubois',
        description: 'Bonne santé générale — aucun traitement requis',
        type: 'CONSULTATION'
    }
];

const PatientDashboard = ({ onNavigate }: PatientDashboardProps = {}) => {
    const { user } = useSupabaseAuth();
    const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
    const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>([]);
    const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([]);
    const [loading, setLoading] = useState(true);

    const firstName = user?.user_metadata?.first_name || 'Patient';

    useEffect(() => {
        const fetchDashboardData = async () => {
            // ✅ DEMO MODE — inject mock data, skip network entirely
            if (IS_DEMO) {
                setNextAppointment(MOCK_NEXT_APPOINTMENT);
                setRecentPrescriptions(MOCK_PRESCRIPTIONS);
                setMedicalHistory(MOCK_MEDICAL_HISTORY);
                setLoading(false);
                return;
            }

            // LIVE MODE — fetch from Spring Boot backend
            try {
                const token = localStorage.getItem('medipatient_token');
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                const aptResponse = await fetch(
                    `${API_BASE_URL}/api/patient/appointments/next`, { headers }
                );
                if (aptResponse.ok) setNextAppointment(await aptResponse.json());

                const prescResponse = await fetch(
                    `${API_BASE_URL}/api/patient/prescriptions/recent`, { headers }
                );
                if (prescResponse.ok) setRecentPrescriptions(await prescResponse.json());

                const historyResponse = await fetch(
                    `${API_BASE_URL}/api/patient/medical-history/recent`, { headers }
                );
                if (historyResponse.ok) setMedicalHistory(await historyResponse.json());

            } catch (error) {
                console.log("API non connectée — états vides conservés.", error);
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
                    <h1 className="text-3xl font-bold text-gray-900">Bonjour {firstName} 👋</h1>
                    <p className="text-gray-600">Votre espace patient personnel</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                    {new Date().toLocaleDateString('fr-FR', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                </div>
            </div>

            {/* Next Appointment */}
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
                                            weekday: 'long', day: 'numeric', month: 'long',
                                            hour: '2-digit', minute: '2-digit'
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
                        <Button className="h-20 flex-col space-y-2" variant="outline"
                            onClick={() => onNavigate?.('telemedicine')}>
                            <Video className="w-6 h-6" />
                            <span>Téléconsultation</span>
                        </Button>
                        <Button className="h-20 flex-col space-y-2" variant="outline"
                            onClick={() => onNavigate?.('pharmacy')}>
                            <Pill className="w-6 h-6" />
                            <span>Mes Ordonnances</span>
                        </Button>
                        <Button className="h-20 flex-col space-y-2" variant="outline"
                            onClick={() => onNavigate?.('documents')}>
                            <FileText className="w-6 h-6" />
                            <span>Mon Dossier</span>
                        </Button>
                        <Button className="h-20 flex-col space-y-2" variant="outline"
                            onClick={() => onNavigate?.('insurance')}>
                            <Shield className="w-6 h-6" />
                            <span>Ma Mutuelle</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Prescriptions & History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Prescriptions */}
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
                            recentPrescriptions.map((prescription) => (
                                <div key={prescription.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">
                                            {new Date(prescription.date).toLocaleDateString('fr-FR')}
                                        </p>
                                        <p className="text-sm text-gray-600">{prescription.doctorName}</p>
                                        <p className="text-xs text-gray-500">{prescription.medicationsCount} médicament(s)</p>
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

                {/* Medical History */}
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
                            medicalHistory.map((history) => (
                                <div key={history.id} className="p-3 border rounded-lg">
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

            {/* Health Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Résumé Santé</CardTitle>
                    <CardDescription>Informations importantes</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                            <h3 className="font-semibold text-red-800 mb-2">Allergies</h3>
                            <p className="text-sm text-red-600">
                                {IS_DEMO ? 'Pénicilline' : 'Aucune connue'}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <h3 className="font-semibold text-yellow-800 mb-2">Traitements</h3>
                            <p className="text-sm text-yellow-600">
                                {IS_DEMO ? 'Paracétamol 1g (actif)' : 'Aucun traitement actif'}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h3 className="font-semibold text-blue-800 mb-2">Groupe sanguin</h3>
                            <p className="text-sm text-blue-600">
                                {IS_DEMO ? 'O+' : 'Non renseigné'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PatientDashboard;