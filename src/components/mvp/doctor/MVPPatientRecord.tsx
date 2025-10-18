import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Phone, AlertTriangle, FileText, Clock } from 'lucide-react';

const demoPatients = [
  {
    id: '1',
    name: 'Aminata Diallo',
    age: 32,
    phone: '+221 77 123 45 67',
    allergies: ['Pénicilline'],
    lastVisit: '2025-01-15',
    consultations: 5,
  },
  {
    id: '2',
    name: 'Moussa Ndiaye',
    age: 45,
    phone: '+221 76 234 56 78',
    allergies: [],
    lastVisit: '2025-01-10',
    consultations: 3,
  },
  {
    id: '3',
    name: 'Fatou Sall',
    age: 28,
    phone: '+221 78 345 67 89',
    allergies: ['Aspirine', 'Latex'],
    lastVisit: '2025-01-08',
    consultations: 8,
  },
];

const MVPPatientRecord = () => {
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<typeof demoPatients[0] | null>(null);

  const filteredPatients = demoPatients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  if (selectedPatient) {
    return (
      <div className="p-4 space-y-4">
        <Button 
          variant="ghost" 
          className="mb-2"
          onClick={() => setSelectedPatient(null)}
        >
          ← Retour
        </Button>

        <Card className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold">{selectedPatient.name}</h2>
              <p className="text-muted-foreground">{selectedPatient.age} ans</p>
            </div>
            <Button size="sm" variant="outline">
              <Phone className="w-4 h-4 mr-2" />
              Appeler
            </Button>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Téléphone: </span>
              <span className="font-medium">{selectedPatient.phone}</span>
            </div>

            {selectedPatient.allergies.length > 0 && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                <div>
                  <span className="font-semibold text-destructive">Allergies: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedPatient.allergies.map((allergy) => (
                      <Badge key={allergy} variant="destructive">{allergy}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Historique des consultations
          </h3>
          <div className="space-y-2">
            {[
              { date: '15/01/2025', reason: 'Fièvre', prescription: 'Paracétamol' },
              { date: '10/12/2024', reason: 'Contrôle', prescription: 'Aucune' },
              { date: '05/11/2024', reason: 'Toux', prescription: 'Sirop' },
            ].map((visit, idx) => (
              <Card key={idx} className="p-3 bg-accent/50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{visit.reason}</p>
                    <p className="text-xs text-muted-foreground">{visit.date}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {visit.prescription}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Ordonnances
          </h3>
          <Button variant="outline" className="w-full" size="sm">
            Voir toutes les ordonnances
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un patient..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filteredPatients.map((patient) => (
          <Card
            key={patient.id}
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedPatient(patient)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold">{patient.name}</h3>
                <p className="text-sm text-muted-foreground">{patient.age} ans • {patient.phone}</p>
                {patient.allergies.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <AlertTriangle className="w-3 h-3 text-destructive" />
                    <span className="text-xs text-destructive font-medium">
                      {patient.allergies.length} allergie(s)
                    </span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <Badge variant="secondary">{patient.consultations} visites</Badge>
                <p className="text-xs text-muted-foreground mt-1">{patient.lastVisit}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MVPPatientRecord;
