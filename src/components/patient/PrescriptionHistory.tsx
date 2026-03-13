import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
    Pill, Download, Search, Calendar, User, Shield, Loader2, ArrowLeft
} from 'lucide-react';
import { API_BASE_URL, IS_DEMO } from '@/config/app';

interface PrescriptionHistoryProps {
    onNavigate?: (page: string) => void;
}

interface Prescription {
    id: string;
    date: string;
    doctorName: string;
    medications: string[];
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

// ✅ MOCK DATA — served when IS_DEMO = true
const MOCK_PRESCRIPTIONS: Prescription[] = [
    {
        id: 'presc-001',
        date: '2026-01-15T10:00:00Z',
        doctorName: 'Dr. Cheikh Diop',
        medications: [
            'Paracétamol 1g — 3x/jour pendant 5 jours',
            'Ibuprofène 400mg — 2x/jour pendant 3 jours'
        ],
        status: 'ACTIVE'
    },
    {
        id: 'presc-002',
        date: '2025-10-05T09:30:00Z',
        doctorName: 'Dr. Marie Dubois',
        medications: [
            'Amoxicilline 500mg — 2x/jour pendant 7 jours'
        ],
        status: 'COMPLETED'
    }
];

const PrescriptionHistory = ({ onNavigate }: PrescriptionHistoryProps) => {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        const fetchPrescriptions = async () => {
            // ✅ DEMO MODE — inject mock data, skip network entirely
            if (IS_DEMO) {
                setPrescriptions(MOCK_PRESCRIPTIONS);
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

                const response = await fetch(
                    `${API_BASE_URL}/api/patient/prescriptions`, { headers }
                );

                if (response.ok) {
                    const data = await response.json();
                    setPrescriptions(Array.isArray(data) ? data : []);
                } else {
                    setPrescriptions([]);
                }
            } catch (error) {
                console.error("Erreur API:", error);
                toast({
                    title: "Information",
                    description: "Impossible de charger l'historique pour le moment.",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchPrescriptions();
    }, [toast]);

    const filteredPrescriptions = prescriptions.filter(prescription =>
        (prescription.doctorName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (prescription.medications || []).some(med =>
            med.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const downloadPrescription = async (prescriptionId: string) => {
        toast({
            title: "Téléchargement lancé",
            description: "Votre ordonnance est en cours de préparation."
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Chargement des ordonnances...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Back button */}
            <div className="flex items-center">
                <Button
                    variant="ghost"
                    onClick={() => onNavigate?.('dashboard')}
                    className="text-muted-foreground hover:text-foreground mr-4"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Retour au tableau de bord
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Pill className="w-5 h-5 text-green-500" />
                        <span>Historique des Ordonnances</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Search bar */}
                    <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Rechercher par médecin ou médicament..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {filteredPrescriptions.length === 0 ? (
                        <div className="text-center py-12">
                            <Pill className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">Aucune ordonnance trouvée</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredPrescriptions.map((prescription) => (
                                <Card key={prescription.id}
                                    className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <Shield className="w-5 h-5 text-green-600" />
                                                    <div>
                                                        <h3 className="font-medium text-green-900">
                                                            Ordonnance Sécurisée
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600 mt-1">
                                                            <div className="flex items-center space-x-1">
                                                                <User className="w-4 h-4" />
                                                                <span>{prescription.doctorName}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <Calendar className="w-4 h-4" />
                                                                <span>
                                                                    {new Date(prescription.date).toLocaleDateString('fr-FR')}
                                                                </span>
                                                            </div>
                                                            <Badge
                                                                variant={prescription.status === 'ACTIVE' ? 'default' : 'secondary'}
                                                                className={prescription.status === 'ACTIVE' ? 'bg-green-600 hover:bg-green-700' : ''}
                                                            >
                                                                {prescription.status === 'ACTIVE' ? 'Active' : 'Terminée'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-green-50 p-4 rounded-lg mt-2">
                                                    <h4 className="font-medium text-green-800 mb-2 text-sm uppercase tracking-wide">
                                                        Médicaments prescrits
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {prescription.medications.map((medication, index) => (
                                                            <li key={index}
                                                                className="text-sm text-green-700 flex items-center">
                                                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                                                                {medication}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="flex flex-row md:flex-col gap-2">
                                                <Button
                                                    onClick={() => downloadPrescription(prescription.id)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-green-600 border-green-200 hover:bg-green-50 flex-1 md:flex-none"
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
                                                    PDF
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PrescriptionHistory;