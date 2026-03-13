import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { API_BASE_URL, IS_DEMO } from '@/config/app';
import FilterModeSelector from './appointment/FilterModeSelector';
import SpecialtySelector from './appointment/SpecialtySelector';
import DoctorSelector from './appointment/DoctorSelector';
import AppointmentForm from './appointment/AppointmentForm';
import UpcomingAppointments from './appointment/UpcomingAppointments';

// --- Interfaces ---
interface Specialty {
    id: string;
    name: string;
}

// ✅ Updated to include consultationFee and currency
interface Doctor {
    id: string;
    firstName: string;
    lastName: string;
    consultationFee?: number;
    currency?: string;
    doctor_specialties?: Array<{
        specialty: Specialty;
        is_primary: boolean;
    }>;
}

// ✅ MOCK DATA — served when IS_DEMO = true
const MOCK_SPECIALTIES: Specialty[] = [
    { id: 'spec-1', name: 'Médecine Générale' },
    { id: 'spec-2', name: 'Cardiologie' },
    { id: 'spec-3', name: 'Pédiatrie' },
    { id: 'spec-4', name: 'Dermatologie' },
    { id: 'spec-5', name: 'Gynécologie' },
];

// ✅ Updated with consultationFee and currency fields
const MOCK_DOCTORS: Doctor[] = [
    {
        id: '18',
        firstName: 'Cheikh',
        lastName: 'Diop',
        consultationFee: 10000,
        currency: 'FCFA',
        doctor_specialties: [{ specialty: { id: 'spec-1', name: 'Médecine Générale' }, is_primary: true }]
    },
    {
        id: '8',
        firstName: 'Marie',
        lastName: 'Dubois',
        consultationFee: 25000,
        currency: 'FCFA',
        doctor_specialties: [{ specialty: { id: 'spec-2', name: 'Cardiologie' }, is_primary: true }]
    },
    {
        id: '10',
        firstName: 'Sophie',
        lastName: 'Lemaire',
        consultationFee: 15000,
        currency: 'FCFA',
        doctor_specialties: [{ specialty: { id: 'spec-3', name: 'Pédiatrie' }, is_primary: true }]
    },
    {
        id: '9',
        firstName: 'Pierre',
        lastName: 'Moreau',
        consultationFee: 20000,
        currency: 'FCFA',
        doctor_specialties: [{ specialty: { id: 'spec-4', name: 'Dermatologie' }, is_primary: true }]
    },
];

const MOCK_APPOINTMENTS = [
    {
        id: 'apt-001',
        doctorName: 'Dr. Cheikh Diop',
        dateTime: '2026-03-20T10:00:00Z',
        type: 'Téléconsultation',
        status: 'Confirmé',
        location: 'En ligne — MediPatient'
    }
];

const AppointmentBooking = () => {
    // --- Form States ---
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [consultationType, setConsultationType] = useState('');
    const [reason, setReason] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [filterMode, setFilterMode] = useState<'specialty' | 'doctor'>('specialty');

    // --- Data States ---
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);

    // --- Loading States ---
    const [loadingData, setLoadingData] = useState(true);
    const [loadingBooking, setLoadingBooking] = useState(false);

    const { toast } = useToast();

    // --- 1. LOAD DATA ON MOUNT ---
    useEffect(() => {
        const fetchData = async () => {
            // ✅ DEMO MODE — inject mock data, skip all network calls
            if (IS_DEMO) {
                setSpecialties(MOCK_SPECIALTIES);
                setDoctors(MOCK_DOCTORS);
                setAppointments(MOCK_APPOINTMENTS);
                setLoadingData(false);
                return;
            }

            // LIVE MODE — fetch from Spring Boot backend
            try {
                const token = localStorage.getItem('medipatient_token');
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                const specRes = await fetch(`${API_BASE_URL}/api/specialties`, { headers });
                if (specRes.ok) setSpecialties(await specRes.json());

                const docRes = await fetch(`${API_BASE_URL}/api/doctors`, { headers });
                if (docRes.ok) setDoctors(await docRes.json());

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

    // --- HELPERS ---
    const getPrimarySpecialty = (doctor: Doctor) => {
        if (!doctor.doctor_specialties || doctor.doctor_specialties.length === 0) {
            return 'Généraliste';
        }
        const primary = doctor.doctor_specialties.find((ds) => ds.is_primary);
        return primary?.specialty?.name
            || doctor.doctor_specialties[0]?.specialty?.name
            || 'Non défini';
    };

    const filteredDoctors = useMemo(() => {
        if (filterMode === 'specialty' && selectedSpecialty) {
            return doctors.filter(doctor =>
                doctor.doctor_specialties?.some((ds) => ds.specialty.id === selectedSpecialty)
            );
        }
        return doctors;
    }, [doctors, selectedSpecialty, filterMode]);

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

    // --- 2. SUBMIT BOOKING ---
    const handleBooking = async () => {
        if (!selectedDoctor || !selectedDate || !selectedTime || !consultationType) {
            toast({
                title: "Champs manquants",
                description: "Veuillez remplir le médecin, la date, l'heure et le type de consultation.",
                variant: "destructive",
            });
            return;
        }

        setLoadingBooking(true);

        // ✅ DEMO MODE — simulate successful booking without network call
        if (IS_DEMO) {
            await new Promise(r => setTimeout(r, 800));

            const doctor = doctors.find(d => d.id === selectedDoctor);
            const newAppointment = {
                id: `apt-demo-${Date.now()}`,
                doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Dr. Inconnu',
                dateTime: `${selectedDate}T${selectedTime}:00`,
                type: consultationType,
                status: 'Confirmé',
                location: consultationType === 'teleconsultation' ? 'En ligne — MediPatient' : 'Cabinet'
            };

            setAppointments(prev => [...prev, newAppointment]);

            toast({
                title: "Rendez-vous confirmé !",
                description: "Votre demande a été enregistrée avec succès.",
            });

            setSelectedDoctor('');
            setSelectedSpecialty('');
            setSelectedDate('');
            setSelectedTime('');
            setConsultationType('');
            setReason('');
            setPaymentMethod('');
            setPhoneNumber('');

            setLoadingBooking(false);
            return;
        }

        // LIVE MODE — POST to Spring Boot backend
        try {
            const token = localStorage.getItem('medipatient_token');
            const payload = {
                doctorId: selectedDoctor,
                dateTime: `${selectedDate}T${selectedTime}:00`,
                consultationType,
                reason,
                paymentMethod,
                phoneNumber
            };

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

            toast({
                title: "Rendez-vous confirmé !",
                description: "Votre demande a été enregistrée avec succès.",
            });

            setAppointments(prev => [...prev, data]);

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
                            isLoading={loadingBooking}
                        />
                    </div>
                </CardContent>
            </Card>

            <UpcomingAppointments appointments={appointments} />
        </div>
    );
};

export default AppointmentBooking;