import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Calendar
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useMockInsuranceData, CARE_TYPES } from '@/hooks/useMockInsuranceData';
import { useToast } from '@/hooks/use-toast';

interface PatientCoveragePanelProps {
  patientId: string;
  specialty?: string;
  compact?: boolean;
}

const PatientCoveragePanel: React.FC<PatientCoveragePanelProps> = ({ 
  patientId, 
  specialty,
  compact = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const { toast } = useToast();
  
  const { getPatientCoverageStatus, getPatientInsurance, getPatientCareHistory, addAuthRequest } = useMockInsuranceData();
  
  const coverage = getPatientCoverageStatus(patientId);
  const insuranceInfo = getPatientInsurance(patientId);
  const careHistory = getPatientCareHistory(patientId);

  if (!coverage || !insuranceInfo) {
    return (
      <Card className="border-yellow-500/50 bg-yellow-500/10">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="font-medium text-sm">Aucune mutuelle active</p>
              <p className="text-xs text-muted-foreground">Patient sans couverture mutuelle.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSpecialtyCareType = (specialty?: string): string | null => {
    const specialtyToCareType: Record<string, string> = {
      'Cardiologie': 'consultation_specialisee',
      'Dermatologie': 'consultation_specialisee',
      'Pédiatrie': 'consultation_specialisee',
      'Gynécologie': 'consultation_specialisee',
      'Neurologie': 'consultation_specialisee',
      'Orthopédie': 'consultation_specialisee',
      'Ophtalmologie': 'consultation_specialisee',
      'Dentiste': 'actes_medicaux',
      'Médecine Générale': 'consultation_generale',
    };
    return specialty ? specialtyToCareType[specialty] || 'consultation_specialisee' : null;
  };

  const relevantCareType = getSpecialtyCareType(specialty);
  const relevantConsumption = relevantCareType 
    ? coverage.consumptionByType.find(c => c.care_type === relevantCareType)
    : null;

  const handleRequestAuth = (careType: string) => {
    addAuthRequest({
      patientId,
      careType,
      requestedAmount: 50000,
      careDescription: `Demande de prise en charge pour ${CARE_TYPES[careType as keyof typeof CARE_TYPES] || careType}`
    });
    toast({
      title: "Demande envoyée",
      description: "La demande de prise en charge a été transmise à la mutuelle.",
    });
  };

  // Recent care history for this patient
  const recentHistory = careHistory.slice(0, 3);

  return (
    <Card>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-2">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Couverture Mutuelle</CardTitle>
                  <p className="text-xs text-muted-foreground">{coverage.insuranceName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {coverage.planName}
                </Badge>
                <Badge className="bg-green-500 text-xs">
                  {coverage.coverageRate}%
                </Badge>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Résumé compact toujours visible */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-muted/50 rounded-lg text-center">
            <div>
              <p className="text-sm font-bold">{coverage.totalConsumed.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Consommé</p>
            </div>
            <div>
              <p className="text-sm font-bold text-primary">{coverage.overallRemaining.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Restant</p>
            </div>
            <div>
              <p className="text-sm font-bold">{coverage.annualLimit.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Plafond</p>
            </div>
          </div>

          {/* Info spécialité si applicable */}
          {relevantConsumption && specialty && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {specialty} - {CARE_TYPES[relevantCareType as keyof typeof CARE_TYPES]}
                </span>
                {relevantConsumption.percentUsed >= 100 && (
                  <Badge variant="destructive" className="text-xs">Plafond atteint</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Progress 
                  value={Math.min(relevantConsumption.percentUsed, 100)} 
                  className="h-2 flex-1"
                />
                <span className="text-xs font-medium">
                  {relevantConsumption.percentUsed.toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {relevantConsumption.covered.toLocaleString()} / {relevantConsumption.limit.toLocaleString()} FCFA
              </p>
              {relevantConsumption.percentUsed >= 100 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2 text-xs"
                  onClick={() => handleRequestAuth(relevantCareType!)}
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Demander autorisation
                </Button>
              )}
            </div>
          )}

          <CollapsibleContent className="space-y-3 mt-3">
            {/* Détail par type de soin */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Consommation par type
              </h4>
              
              {coverage.consumptionByType.map((consumption) => {
                const isLimitReached = consumption.percentUsed >= 100;
                const isNearLimit = consumption.percentUsed >= 80;
                
                return (
                  <div key={consumption.care_type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">
                          {CARE_TYPES[consumption.care_type as keyof typeof CARE_TYPES]}
                        </span>
                        {isLimitReached && (
                          <Badge variant="destructive" className="text-[10px] px-1 py-0">
                            Atteint
                          </Badge>
                        )}
                        {isNearLimit && !isLimitReached && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 text-yellow-600 border-yellow-500">
                            80%+
                          </Badge>
                        )}
                      </div>
                      <span className="text-muted-foreground">
                        {consumption.covered.toLocaleString()} / {consumption.limit.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={Math.min(consumption.percentUsed, 100)} 
                        className={`h-1.5 flex-1`}
                      />
                      <span className="text-[10px] text-muted-foreground w-8 text-right">
                        {consumption.percentUsed.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Historique récent */}
            {recentHistory.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Derniers soins remboursés
                </h4>
                {recentHistory.map((care) => (
                  <div key={care.id} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded">
                    <div>
                      <p className="font-medium">{care.description}</p>
                      <p className="text-muted-foreground">
                        {new Date(care.date).toLocaleDateString('fr-FR')} • {care.provider}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">+{care.coveredAmount.toLocaleString()} FCFA</p>
                      <p className="text-muted-foreground">sur {care.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Indicateur global */}
            <div className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
              coverage.overallRemaining > 0 ? 'bg-green-500/10' : 'bg-destructive/10'
            }`}>
              {coverage.overallRemaining > 0 ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Patient éligible à la prise en charge</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span>Plafond annuel atteint</span>
                </>
              )}
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
};

export default PatientCoveragePanel;
