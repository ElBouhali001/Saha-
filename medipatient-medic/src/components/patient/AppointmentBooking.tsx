import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { API_BASE_URL } from '@/config/app'; // Import de votre config
import FilterModeSelector from './appointment/FilterModeSelector';
import SpecialtySelector from './appointment/SpecialtySelector';
import DoctorSelector from './appointment/DoctorSelector';
import AppointmentForm from './appointment/AppointmentForm';
import UpcomingAppointments from './appointment/UpcomingAppointments';

// --- Interfaces pour le Typage des données Backend ---
interface Specialty {
    id: string;
    name: string;
}

interface Doctor {
    id: string;
    firstName: string;
    lastName: string;
    // Adaptation à la structure probable de votre Backend JPA
    doctor_specialties?: Array<{
        specialty: Specialty;
        is_primary: boolean;
    }>;
}

const AppointmentBooking = () => {
    // --- États du Formulaire ---
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [consultationType, setConsultationType] = useState('');
    const [reason, setReason] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [filterMode, setFilterMode] = useState<'specialty' | 'doctor'>('specialty');

    // --- États des Données API ---
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);

    // --- États de Chargement ---
    const [loadingData, setLoadingData] = useState(true);
    const [loadingBooking, setLoadingBooking] = useState(false);

    const { toast } = useToast();

    // 1. CHARGEMENT DES DONNÉES (Mount)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('medipatient_token');
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                // A. Récupérer les spécialités
                const specRes = await fetch(`${API_BASE_URL}/api/specialties`, { headers });
                if (specRes.ok) setSpecialties(await specRes.json());

                // B. Récupérer les médecins
                const docRes = await fetch(`${API_BASE_URL}/api/doctors`, { headers });
                if (docRes.ok) setDoctors(await docRes.json());

                // C. Récupérer l'historique des RDV du patient
                const aptRes = await fetch(`${API_BASE_URL}/api/patient/appointments`, { headers });
                if (aptRes.ok) setAppointments(await aptRes.json());

            } catch (error) {
                console.error("Erreur chargement données:", error);
                toast({
                    title: "Erreur de connexion",
                    description: "Impossible de charger les données du serveur.",
                    variant: "destructive"
                });
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [toast]);

    // Helper : Récupérer la spécialité principale d'un médecin
    const getPrimarySpecialty = (doctor: Doctor) => {
        if (!doctor.doctor_specialties || doctor.doctor_specialties.length === 0) {
            return 'Généraliste';
        }
        const primary = doctor.doctor_specialties.find((ds) => ds.is_primary);
        // Fallback sur la première spécialité trouvée si pas de primaire définie
        return primary?.specialty?.name || doctor.doctor_specialties[0]?.specialty?.name || 'Non défini';
    };

    // Filtrage des médecins selon la spécialité sélectionnée
    const filteredDoctors = useMemo(() => {
        if (filterMode === 'specialty' && selectedSpecialty) {
            return doctors.filter(doctor =>
                doctor.doctor_specialties?.some((ds) => ds.specialty.id === selectedSpecialty)
            );
        }
        return doctors;
    }, [doctors, selectedSpecialty, filterMode]);

    // Récupération des spécialités d'un médecin spécifique
    const doctorSpecialties = useMemo(() => {
        if (filterMode === 'doctor' && selectedDoctor) {
            const doctor = doctors.find(d => d.id === selectedDoctor);
            return doctor?.doctor_specialties?.map((ds) => ds.specialty) || [];
        }
        return [];
    }, [doctors, selectedDoctor, filterMode]);

    const handleFilterModeChange = (mode: 'specialty' | 'doctor') => {
        setFilterMode(mode);
        setSelectedDoctor('');
        setSelectedSpecialty('');
    };

    // --- 2. ENREGISTREMENT DU RENDEZ-VOUS (POST) ---
    const handleBooking = async () => {
        // Validation simple
        if (!selectedDoctor || !selectedDate || !selectedTime || !consultationType) {
            toast({
                title: "Champs manquants",
                description: "Veuillez remplir le médecin, la date, l'heure et le type de consultation.",
                variant: "destructive",
            });
            return;
        }

        setLoadingBooking(true);

        try {
            const token = localStorage.getItem('medipatient_token');

            // Construction du payload attendu par Java
            // Note: On combine Date et Heure pour faire un LocalDateTime ISO
            const payload = {
                doctorId: selectedDoctor,
                dateTime: `${selectedDate}T${selectedTime}:00`,
                consultationType: consultationType,
                reason: reason,
                paymentMethod: paymentMethod,
                phoneNumber: phoneNumber
            };

            console.log("Envoi réservation:", payload);

            const response = await fetch(`${API_BASE_URL}/api/appointments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur lors de la réservation");
            }

            // Succès
            toast({
                title: "Rendez-vous confirmé !",
                description: "Votre demande a été enregistrée avec succès.",
            });

            // Ajout du nouveau RDV à la liste locale (pour éviter de recharger)
            setAppointments(prev => [...prev, data]);

            // Reset du formulaire
            setSelectedDoctor('');
            setSelectedSpecialty('');
            setSelectedDate('');
            setSelectedTime('');
            setConsultationType('');
            setReason('');
            setPaymentMethod('');
            setPhoneNumber('');

        } catch (error: any) {
            console.error('Erreur réservation:', error);
            toast({
                title: "Échec de la réservation",
                description: error.message || "Impossible de contacter le serveur.",
                variant: "destructive",
            });
        } finally {
            setLoadingBooking(false);
        }
    };

    // Affichage du loader pendant le chargement initial
    if (loadingData) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Chargement des disponibilités...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span>Réserver un Rendez-vous</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <FilterModeSelector
                        filterMode={filterMode}
                        onFilterModeChange={handleFilterModeChange}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        {/* Colonne Gauche : Sélection Médecin/Spécialité */}
                        <div className="space-y-4">
                            {filterMode === 'specialty' ? (
                                <SpecialtySelector
                                    specialties={specialties}
                                    selectedSpecialty={selectedSpecialty}
                                    onSpecialtyChange={setSelectedSpecialty}
                                    filteredDoctors={filteredDoctors}
                                    selectedDoctor={selectedDoctor}
                                    onDoctorSelect={setSelectedDoctor}
                                    loadingDoctors={loadingData}
                                    getPrimarySpecialty={getPrimarySpecialty}
                                />
                            ) : (
                                <DoctorSelector
                                    doctors={doctors}
                                    selectedDoctor={selectedDoctor}
                                    onDoctorSelect={setSelectedDoctor}
                                    loadingDoctors={loadingData}
                                    getPrimarySpecialty={getPrimarySpecialty}
                                    doctorSpecialties={doctorSpecialties}
                                />
                            )}
                        </div>

                        {/* Colonne Droite : Formulaire Détails */}
                        <AppointmentForm
                            selectedDate={selectedDate}
                            onDateChange={setSelectedDate}
                            selectedTime={selectedTime}
                            onTimeChange={setSelectedTime}
                            consultationType={consultationType}
                            onConsultationTypeChange={setConsultationType}
                            reason={reason}
                            onReasonChange={setReason}
                            paymentMethod={paymentMethod}
                            onPaymentMethodChange={setPaymentMethod}
                            phoneNumber={phoneNumber}
                            onPhoneNumberChange={setPhoneNumber}
                            onBooking={handleBooking}
                            selectedDoctor={selectedDoctor}
                            isLoading={loadingBooking} // Utilise le state de chargement du POST
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Liste des RDV existants (chargée depuis le back) */}
            <UpcomingAppointments appointments={appointments} />
        </div>
    );
};

export default AppointmentBooking;