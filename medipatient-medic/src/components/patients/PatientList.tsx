import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, User, Phone, Calendar, MapPin, FileText, Clock, Loader2 } from 'lucide-react';
import { useBackendPatients } from '@/hooks/useBackendPatients';
import { BackendPatient } from '@/services/api';
import { IS_DEMO } from '@/config/app';
import { useDemoPatients, DemoPatient } from '@/hooks/useDemoPatients';

// Type unifié pour les patients (backend ou démo)
type PatientType = BackendPatient | DemoPatient;

interface PatientListProps {
  onPatientSelect: (patient: PatientType) => void;
}

const PatientList: React.FC<PatientListProps> = ({ onPatientSelect }) => {
  const { t } = useTranslation();
  // Utiliser le backend en mode production, les données démo sinon
  const backendData = useBackendPatients();
  const demoData = useDemoPatients();

  const { patients: backendPatients, isLoading, error } = backendData;
  const { patients: demoPatients } = demoData;

  // Choisir la source de données selon le mode
  const patients = IS_DEMO ? demoPatients : backendPatients;

  const [searchTerm, setSearchTerm] = useState('');

  // Recherche simple dans les patients
  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) return patients;

    const lowerQuery = searchTerm.toLowerCase();
    return patients.filter(patient =>
      patient.firstName.toLowerCase().includes(lowerQuery) ||
      patient.lastName.toLowerCase().includes(lowerQuery) ||
      patient.email?.toLowerCase().includes(lowerQuery) ||
      patient.phone?.includes(searchTerm)
    );
  }, [patients, searchTerm]);

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
      case 'high': return t('patients.urgency.high');
      case 'medium': return t('patients.urgency.medium');
      case 'low': return t('patients.urgency.low');
      default: return t('patients.urgency.undefined');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('patients.list.title')}</h1>
        <div className="text-sm text-gray-500">
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('patients.list.loading')}
            </span>
          ) : hasSearch ? (
            <>
              {t('patients.list.results_found', { count: filteredPatients.length })}
              {searchTerm && ` ${t('patients.list.for_query', { query: searchTerm })}`}
            </>
          ) : (
            t('patients.list.patients_count', { count: patients.length })
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder={t('patients.list.search_placeholder')}
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

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => onPatientSelect(patient)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span>{patient.firstName} {patient.lastName}</span>
                  </CardTitle>
                  <Badge variant={getUrgencyColor(patient.urgencyLevel)}>
                    {getUrgencyLabel(patient.urgencyLevel)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {patient.phone || 'Non renseigné'}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('fr-FR') : 'Non renseigné'}
                  </div>
                  {patient.address && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {patient.address}
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <FileText className="w-4 h-4 mr-2" />
                    {patient.consultations || 0} consultations
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {patient.lastVisit
                      ? t('patients.list.last_visit', { date: new Date(patient.lastVisit).toLocaleDateString('fr-FR') })
                      : t('patients.list.no_visit')}
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
                    {t('patients.list.view_file')}
                  </Button>
                </div>

                {patient.primaryDoctor && (
                  <div className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {t('patients.detail.primary_doctor')}: {patient.primaryDoctor}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {hasSearch ? t('patients.list.no_results') : t('patients.list.no_patients')}
          </h3>
          <p className="text-gray-600">
            {hasSearch
              ? t('patients.list.try_modify_search', { query: searchTerm })
              : t('patients.list.list_empty')}
          </p>
          {hasSearch && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setSearchTerm('')}
            >
              {t('patients.list.clear_search')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientList;