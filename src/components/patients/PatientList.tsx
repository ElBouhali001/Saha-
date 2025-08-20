import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, User, Phone, Calendar, MapPin, FileText, Clock, Target } from 'lucide-react';
import { useDemoPatients, DemoPatient } from '@/hooks/useDemoPatients';
import { useIntelligentSearch } from '@/hooks/useIntelligentSearch';

interface PatientListProps {
  onPatientSelect: (patient: DemoPatient) => void;
}

const PatientList: React.FC<PatientListProps> = ({ onPatientSelect }) => {
  const { patients } = useDemoPatients();
  const [searchTerm, setSearchTerm] = useState('');
  
  const searchResults = useIntelligentSearch(patients, searchTerm);
  const hasSearch = searchTerm.trim().length > 0;

  const getUrgencyColor = (level?: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getUrgencyLabel = (level?: string) => {
    switch (level) {
      case 'high': return 'Priorité haute';
      case 'medium': return 'Priorité moyenne';
      case 'low': return 'Priorité basse';
      default: return 'Non défini';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Liste des Patients</h1>
        <div className="text-sm text-gray-500">
          {hasSearch ? (
            <>
              {searchResults.length} résultat{searchResults.length !== 1 ? 's' : ''} 
              {searchResults.length > 0 && ' trouvé' + (searchResults.length > 1 ? 's' : '')}
              {searchTerm && ` pour "${searchTerm}"`}
            </>
          ) : (
            `${patients.length} patient${patients.length > 1 ? 's' : ''}`
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Rechercher par nom, téléphone, diagnostic, médecin..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {hasSearch && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6"
            onClick={() => setSearchTerm('')}
          >
            ✕
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {searchResults.map((result) => {
          const { patient, score, matchedFields, matchedText } = result;
          
          return (
            <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => onPatientSelect(patient)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span>{patient.firstName} {patient.lastName}</span>
                    {hasSearch && score > 80 && (
                      <Badge variant="secondary" className="text-xs">
                        <Target className="w-3 h-3 mr-1" />
                        Correspondance exacte
                      </Badge>
                    )}
                  </CardTitle>
                  <Badge variant={getUrgencyColor(patient.urgencyLevel)}>
                    {getUrgencyLabel(patient.urgencyLevel)}
                  </Badge>
                </div>
                
                {/* Affichage des correspondances trouvées */}
                {hasSearch && matchedFields.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {matchedFields.slice(0, 3).map((field, index) => (
                      <Badge key={field} variant="outline" className="text-xs">
                        {field}
                      </Badge>
                    ))}
                    {matchedFields.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{matchedFields.length - 3} autres
                      </Badge>
                    )}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {patient.phone}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {patient.address}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FileText className="w-4 h-4 mr-2" />
                    {patient.consultations} consultations
                  </div>
                </div>
                
                {/* Affichage du texte correspondant */}
                {hasSearch && matchedText.length > 0 && (
                  <div className="p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded text-sm">
                    <div className="font-medium text-yellow-800 mb-1">Correspondance trouvée:</div>
                    <div className="text-yellow-700">
                      {matchedText[0]}
                      {matchedText.length > 1 && (
                        <span className="text-yellow-600 ml-2">
                          (+{matchedText.length - 1} autre{matchedText.length > 2 ? 's' : ''})
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    Dernière visite: {new Date(patient.lastVisit).toLocaleDateString('fr-FR')}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPatientSelect(patient);
                    }}
                  >
                    Voir la fiche
                  </Button>
                </div>
                
                {patient.primaryDoctor && (
                  <div className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    Médecin traitant: {patient.primaryDoctor}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {searchResults.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {hasSearch ? 'Aucun résultat trouvé' : 'Aucun patient trouvé'}
          </h3>
          <p className="text-gray-600">
            {hasSearch 
              ? `Essayez de modifier votre recherche "${searchTerm}"` 
              : "La liste des patients est vide"}
          </p>
          {hasSearch && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSearchTerm('')}
            >
              Effacer la recherche
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientList;