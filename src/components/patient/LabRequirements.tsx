
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FlaskConical, Clock, AlertCircle, CheckCircle, Calendar } from 'lucide-react';

const LabRequirements = () => {
  const pendingTests = [
    {
      id: '1',
      name: 'Bilan sanguin complet',
      type: 'Hématologie',
      urgency: 'normal',
      prescribedBy: 'Dr. Kouamé Adjoua',
      prescribedDate: '2024-01-24',
      requirements: [
        'Être à jeun depuis 12h',
        'Éviter l\'effort physique intense 24h avant',
        'Bien s\'hydrater la veille',
        'Apporter une pièce d\'identité'
      ],
      estimatedDuration: '15 minutes',
      cost: '25 000 FCFA',
      coverage: '70%'
    },
    {
      id: '2',
      name: 'Test de glycémie',
      type: 'Biochimie',
      urgency: 'urgent',
      prescribedBy: 'Dr. Mamadou Diallo',
      prescribedDate: '2024-01-23',
      requirements: [
        'Jeûne strict de 8h minimum',
        'Pas de médicaments antidiabétiques le matin',
        'Éviter le stress avant l\'examen'
      ],
      estimatedDuration: '10 minutes',
      cost: '8 000 FCFA',
      coverage: '80%'
    }
  ];

  const completedTests = [
    {
      id: '3',
      name: 'Électrocardiogramme',
      type: 'Cardiologie',
      completedDate: '2024-01-22',
      results: 'Disponibles',
      status: 'Normal'
    }
  ];

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'normal':
        return <Badge variant="secondary">Normal</Badge>;
      default:
        return <Badge variant="outline">À programmer</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FlaskConical className="w-5 h-5 text-blue-500" />
            <span>Analyses Prescrites</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingTests.map((test) => (
              <Card key={test.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
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
                    <div className="text-right">
                      <p className="font-semibold">{test.cost}</p>
                      <p className="text-sm text-green-600">
                        Prise en charge: {test.coverage}
                      </p>
                    </div>
                  </div>

                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Prérequis importants:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {test.requirements.map((req, index) => (
                          <li key={index} className="text-sm">{req}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Durée: {test.estimatedDuration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">À programmer</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FlaskConical className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Laboratoire requis</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button className="flex-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Programmer
                    </Button>
                    <Button variant="outline">
                      Voir détails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Analyses Terminées</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {completedTests.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                <div>
                  <h4 className="font-medium">{test.name}</h4>
                  <p className="text-sm text-gray-600">
                    {test.type} • Terminé le {new Date(test.completedDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="success">{test.status}</Badge>
                  <Button size="sm" variant="outline">
                    Voir résultats
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommandations Générales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Avant les analyses</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Respecter les consignes de jeûne</li>
                <li>• Éviter le stress et l'effort physique</li>
                <li>• Bien dormir la nuit précédente</li>
                <li>• Apporter tous les documents nécessaires</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
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
