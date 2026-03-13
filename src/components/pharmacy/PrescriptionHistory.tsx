import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    FileText, Search, Calendar, User, Pill, Eye, Download, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { IS_DEMO } from '@/config/app';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PrescriptionHistoryProps {
    pharmacyId: string;
}

// ✅ MOCK DATA — served when IS_DEMO = true
const MOCK_PHARMACY_PRESCRIPTIONS = [
    {
        id: 'pharm-presc-001',
        status: 'received',
        availability_status: 'available',
        created_at: '2026-03-13T09:00:00Z',
        ready_date: null,
        substitutions: null,
        prescription: {
            prescription_date: '2026-03-12T10:00:00Z',
            medications: JSON.stringify([
                { name: 'Paracétamol 1g', dosage: '1 comprimé', frequency: '3x/jour', duration: '5 jours', instructions: 'À prendre après les repas' },
                { name: 'Ibuprofène 400mg', dosage: '1 comprimé', frequency: '2x/jour', duration: '3 jours', instructions: null }
            ]),
            patient: { profile: { first_name: 'Amadou', last_name: 'Fall' } },
            doctor: { profile: { first_name: 'Cheikh', last_name: 'Diop' } }
        }
    },
    {
        id: 'pharm-presc-002',
        status: 'delivered',
        availability_status: 'available',
        created_at: '2026-02-20T14:00:00Z',
        ready_date: '2026-02-20T15:30:00Z',
        substitutions: null,
        prescription: {
            prescription_date: '2026-02-20T09:00:00Z',
            medications: JSON.stringify([
                { name: 'Amoxicilline 500mg', dosage: '1 gélule', frequency: '2x/jour', duration: '7 jours', instructions: null }
            ]),
            patient: { profile: { first_name: 'Jean', last_name: 'Koné' } },
            doctor: { profile: { first_name: 'Marie', last_name: 'Dubois' } }
        }
    }
];

const PrescriptionHistory: React.FC<PrescriptionHistoryProps> = ({ pharmacyId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedPrescription, setSelectedPrescription] = useState<any>(null);

    const { data: prescriptions = [], isLoading } = useQuery({
        queryKey: ['pharmacy-prescriptions', pharmacyId],
        queryFn: async () => {
            // ✅ DEMO MODE — return mock data without hitting Supabase
            if (IS_DEMO) return MOCK_PHARMACY_PRESCRIPTIONS;

            // LIVE MODE — query Supabase
            const { data, error } = await supabase
                .from('pharmacy_prescriptions')
                .select(`
                    *,
                    prescription:prescriptions(
                        *,
                        patient:patients(*, profile:profiles(*)),
                        doctor:doctors(*, profile:profiles(*))
                    )
                `)
                .eq('pharmacy_id', pharmacyId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: IS_DEMO ? true : !!pharmacyId,
    });

    const filteredPrescriptions = prescriptions.filter(prescription => {
        const matchesSearch = !searchTerm ||
            prescription.prescription?.patient?.profile?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prescription.prescription?.patient?.profile?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prescription.prescription?.doctor?.profile?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prescription.prescription?.doctor?.profile?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || prescription.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'received':   { label: 'Reçue',           variant: 'secondary' as const,    icon: Clock },
            'preparing':  { label: 'En préparation',   variant: 'default' as const,      icon: Clock },
            'ready':      { label: 'Prête',            variant: 'outline' as const,      icon: CheckCircle },
            'delivered':  { label: 'Livrée',           variant: 'outline' as const,      icon: CheckCircle },
            'cancelled':  { label: 'Annulée',          variant: 'destructive' as const,  icon: AlertCircle }
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.received;
        const Icon = config.icon;
        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="w-3 h-3" />
                {config.label}
            </Badge>
        );
    };

    const getAvailabilityBadge = (availability: string) => {
        const availabilityConfig = {
            'available':    { label: 'Disponible',    variant: 'outline' as const },
            'partial':      { label: 'Partiel',       variant: 'secondary' as const },
            'unavailable':  { label: 'Indisponible',  variant: 'destructive' as const }
        };
        const config = availabilityConfig[availability as keyof typeof availabilityConfig]
            || availabilityConfig.available;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    if (isLoading) return <div>Chargement...</div>;

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Historique des Ordonnances
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher par patient ou médecin..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filtrer par statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les statuts</SelectItem>
                                <SelectItem value="received">Reçues</SelectItem>
                                <SelectItem value="preparing">En préparation</SelectItem>
                                <SelectItem value="ready">Prêtes</SelectItem>
                                <SelectItem value="delivered">Livrées</SelectItem>
                                <SelectItem value="cancelled">Annulées</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Prescriptions list */}
            <div className="space-y-4">
                {filteredPrescriptions.map((prescription) => (
                    <Card key={prescription.id}>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-blue-500" />
                                            <span className="font-medium">
                                                {prescription.prescription?.patient?.profile?.first_name}{' '}
                                                {prescription.prescription?.patient?.profile?.last_name}
                                            </span>
                                        </div>
                                        {getStatusBadge(prescription.status)}
                                        {getAvailabilityBadge(prescription.availability_status)}
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                Reçue le {new Date(prescription.created_at).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User className="w-4 h-4" />
                                            <span>
                                                Dr. {prescription.prescription?.doctor?.profile?.first_name}{' '}
                                                {prescription.prescription?.doctor?.profile?.last_name}
                                            </span>
                                        </div>
                                    </div>

                                    {prescription.ready_date && (
                                        <div className="text-sm text-green-600 mt-1">
                                            Prête depuis le {new Date(prescription.ready_date).toLocaleDateString('fr-FR')}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Eye className="w-4 h-4 mr-2" />
                                                Voir détails
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>Détails de l'ordonnance</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-medium">Patient:</span><br />
                                                        {prescription.prescription?.patient?.profile?.first_name}{' '}
                                                        {prescription.prescription?.patient?.profile?.last_name}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Médecin:</span><br />
                                                        Dr. {prescription.prescription?.doctor?.profile?.first_name}{' '}
                                                        {prescription.prescription?.doctor?.profile?.last_name}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Date prescription:</span><br />
                                                        {new Date(prescription.prescription?.prescription_date as string)
                                                            .toLocaleDateString('fr-FR')}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Statut:</span><br />
                                                        {getStatusBadge(prescription.status)}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                                        <Pill className="w-4 h-4" />
                                                        Médicaments prescrits
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {prescription.prescription?.medications &&
                                                            JSON.parse(prescription.prescription.medications as string)
                                                                .map((med: any, index: number) => (
                                                                    <div key={index} className="p-3 bg-muted rounded-lg">
                                                                        <div className="font-medium">{med.name}</div>
                                                                        <div className="text-sm text-muted-foreground">
                                                                            {med.dosage} — {med.frequency} — {med.duration}
                                                                        </div>
                                                                        {med.instructions && (
                                                                            <div className="text-sm text-blue-600">
                                                                                {med.instructions}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                    </div>
                                                </div>

                                                {prescription.substitutions && (
                                                    <div>
                                                        <h4 className="font-medium mb-2">Substitutions effectuées</h4>
                                                        <div className="p-3 bg-yellow-50 rounded-lg text-sm">
                                                            {JSON.stringify(prescription.substitutions)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    <Button variant="ghost" size="sm">
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Medication preview */}
                            {prescription.prescription?.medications && (
                                <div className="border-t pt-4">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <Pill className="w-4 h-4" />
                                        Médicaments ({JSON.parse(prescription.prescription.medications as string).length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {JSON.parse(prescription.prescription.medications as string)
                                            .slice(0, 3)
                                            .map((med: any, index: number) => (
                                                <Badge key={index} variant="outline">
                                                    {med.name} {med.dosage}
                                                </Badge>
                                            ))}
                                        {JSON.parse(prescription.prescription.medications as string).length > 3 && (
                                            <Badge variant="secondary">
                                                +{JSON.parse(prescription.prescription.medications as string).length - 3} autres
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {filteredPrescriptions.length === 0 && (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Aucune ordonnance trouvée</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default PrescriptionHistory;