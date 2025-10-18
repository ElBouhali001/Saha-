import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Mic, Camera, Send } from 'lucide-react';

const symptomTemplates = [
  'Fièvre',
  'Toux',
  'Douleur abdominale',
  'Maux de tête',
  'Fatigue',
  'Nausées',
];

const commonMedications = [
  { name: 'Paracétamol 500mg', dosage: '1cp x3/j pendant 5 jours' },
  { name: 'Amoxicilline 1g', dosage: '1cp x2/j pendant 7 jours' },
  { name: 'Ibuprofène 400mg', dosage: '1cp x3/j pendant 3 jours' },
];

const MVPConsultation = () => {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [selectedMeds, setSelectedMeds] = useState<typeof commonMedications>([]);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const toggleMedication = (med: typeof commonMedications[0]) => {
    setSelectedMeds(prev =>
      prev.find(m => m.name === med.name)
        ? prev.filter(m => m.name !== med.name)
        : [...prev, med]
    );
  };

  const handleGeneratePrescription = () => {
    if (selectedMeds.length === 0) {
      toast({
        title: "Erreur",
        description: "Sélectionnez au moins un médicament",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Ordonnance générée",
      description: "L'ordonnance a été créée avec succès",
    });

    // Reset form
    setSymptoms([]);
    setDiagnosis('');
    setSelectedMeds([]);
    setNotes('');
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Symptômes rapides
        </h3>
        <div className="flex flex-wrap gap-2">
          {symptomTemplates.map((symptom) => (
            <Badge
              key={symptom}
              variant={symptoms.includes(symptom) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleSymptom(symptom)}
            >
              {symptom}
            </Badge>
          ))}
        </div>
        {symptoms.length > 0 && (
          <div className="mt-3 p-2 bg-accent/50 rounded text-sm">
            <span className="font-medium">Sélectionnés: </span>
            {symptoms.join(', ')}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Notes de consultation</h3>
          <Button variant="ghost" size="sm">
            <Mic className="w-4 h-4" />
          </Button>
        </div>
        <Textarea
          placeholder="Dictez ou écrivez vos observations..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[100px]"
        />
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Diagnostic</h3>
        <Textarea
          placeholder="Diagnostic rapide..."
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          className="min-h-[60px]"
        />
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Prescription rapide</h3>
        <div className="space-y-2">
          {commonMedications.map((med) => (
            <Card
              key={med.name}
              className={`p-3 cursor-pointer transition-colors ${
                selectedMeds.find(m => m.name === med.name)
                  ? 'bg-primary/10 border-primary'
                  : 'hover:bg-accent'
              }`}
              onClick={() => toggleMedication(med)}
            >
              <div className="font-medium text-sm">{med.name}</div>
              <div className="text-xs text-muted-foreground">{med.dosage}</div>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Camera className="w-4 h-4" />
          Photos cliniques
        </h3>
        <Button variant="outline" className="w-full">
          <Camera className="w-4 h-4 mr-2" />
          Prendre une photo
        </Button>
      </Card>

      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t">
        <Button
          className="w-full"
          size="lg"
          onClick={handleGeneratePrescription}
        >
          <Send className="w-4 h-4 mr-2" />
          Générer l'ordonnance
        </Button>
      </div>
    </div>
  );
};

export default MVPConsultation;
