import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Syringe, AlertTriangle, Phone } from 'lucide-react';

const MVPPatientRecord = () => {
  return (
    <div className="p-4 space-y-4">
      <Card className="p-4 bg-primary/5">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          Informations importantes
        </h3>
        <div className="space-y-2">
          <div>
            <span className="text-sm text-muted-foreground">Groupe sanguin: </span>
            <Badge variant="secondary">O+</Badge>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Allergies: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              <Badge variant="destructive">Pénicilline</Badge>
              <Badge variant="destructive">Aspirine</Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Mes Ordonnances
        </h3>
        <div className="space-y-2">
          {[
            { date: '15/01/2025', doctor: 'Dr. Diallo', meds: 3 },
            { date: '10/12/2024', doctor: 'Dr. Ndiaye', meds: 2 },
            { date: '05/11/2024', doctor: 'Dr. Diallo', meds: 1 },
          ].map((prescription, idx) => (
            <Card key={idx} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">{prescription.date}</p>
                  <p className="text-xs text-muted-foreground">{prescription.doctor}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {prescription.meds} médicament(s)
                  </Badge>
                </div>
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-3">
          Scanner une ordonnance
        </Button>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Résultats de Laboratoire
        </h3>
        <div className="space-y-2">
          {[
            { date: '12/01/2025', type: 'Analyse sanguine', lab: 'Labo Central' },
            { date: '05/12/2024', type: 'Radiographie', lab: 'Clinique Moderne' },
          ].map((result, idx) => (
            <Card key={idx} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">{result.type}</p>
                  <p className="text-xs text-muted-foreground">{result.date} • {result.lab}</p>
                </div>
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Syringe className="w-4 h-4" />
          Carnet de Vaccination
        </h3>
        <div className="space-y-2">
          {[
            { vaccine: 'COVID-19 (Rappel)', date: '15/12/2024' },
            { vaccine: 'Tétanos', date: '20/06/2023' },
            { vaccine: 'Hépatite B', date: '10/01/2022' },
          ].map((vaccination, idx) => (
            <Card key={idx} className="p-3 bg-accent/50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{vaccination.vaccine}</p>
                  <p className="text-xs text-muted-foreground">{vaccination.date}</p>
                </div>
                <Badge variant="secondary">✓</Badge>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="p-4 bg-destructive/10 border-destructive">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-destructive">
          <Phone className="w-4 h-4" />
          Contacts d'Urgence
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-sm">Fatou Diallo (Mère)</p>
              <p className="text-xs text-muted-foreground">+221 77 123 45 67</p>
            </div>
            <Button size="sm" variant="outline">
              <Phone className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-sm">Dr. Diallo (Médecin traitant)</p>
              <p className="text-xs text-muted-foreground">+221 76 234 56 78</p>
            </div>
            <Button size="sm" variant="outline">
              <Phone className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MVPPatientRecord;
