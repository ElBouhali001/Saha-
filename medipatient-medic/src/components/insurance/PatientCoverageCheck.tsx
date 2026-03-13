import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, AlertTriangle, CheckCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { usePatientCoverage, CARE_TYPES } from '@/hooks/useInsuranceCoverage';

interface PatientCoverageCheckProps {
  patientId: string;
  onRequestAuthorization?: (careType: string) => void;
}

const PatientCoverageCheck: React.FC<PatientCoverageCheckProps> = ({ 
  patientId, 
  onRequestAuthorization 
}) => {
  const { data: coverage, isLoading, refetch } = usePatientCoverage(patientId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Vérification de la couverture...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!coverage) {
    return (
      <Card className="border-yellow-500/50 bg-yellow-500/10">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            <div>
              <p className="font-medium">Aucune assurance active</p>
              <p className="text-sm text-muted-foreground">Ce patient n'a pas d'assurance ou mutuelle active.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (percentUsed: number) => {
    if (percentUsed >= 100) return 'bg-destructive';
    if (percentUsed >= 80) return 'bg-yellow-500';
    return 'bg-primary';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Couverture Assurance</CardTitle>
              <p className="text-sm text-muted-foreground">{coverage.insuranceName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-primary/10">
              {coverage.planName}
            </Badge>
            <Badge className="bg-green-500">
              {coverage.coverageRate}% de couverture
            </Badge>
            <Button variant="ghost" size="icon" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Résumé global */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold">{coverage.totalCovered.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">FCFA consommés</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{coverage.overallRemaining.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">FCFA restants</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{coverage.annualLimit?.toLocaleString() || '∞'}</p>
            <p className="text-xs text-muted-foreground">FCFA plafond annuel</p>
          </div>
        </div>

        {/* Détail par type de soin */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Consommation par type de soin
          </h4>
          
          {coverage.consumptionByType.map((consumption) => {
            const isLimitReached = consumption.percentUsed >= 100;
            const isNearLimit = consumption.percentUsed >= 80;
            
            return (
              <div key={consumption.care_type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {CARE_TYPES[consumption.care_type as keyof typeof CARE_TYPES]}
                    </span>
                    {isLimitReached && (
                      <Badge variant="destructive" className="text-xs">
                        Plafond atteint
                      </Badge>
                    )}
                    {isNearLimit && !isLimitReached && (
                      <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-500">
                        Proche du plafond
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {consumption.covered.toLocaleString()} / {consumption.limit.toLocaleString()} FCFA
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Progress 
                    value={Math.min(consumption.percentUsed, 100)} 
                    className={`h-2 flex-1 ${getStatusColor(consumption.percentUsed)}`}
                  />
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {consumption.percentUsed.toFixed(0)}%
                  </span>
                </div>
                
                {isLimitReached && onRequestAuthorization && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-1"
                    onClick={() => onRequestAuthorization(consumption.care_type)}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Demander une autorisation exceptionnelle
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Indicateur global */}
        <div className={`flex items-center gap-3 p-3 rounded-lg ${
          coverage.overallRemaining > 0 ? 'bg-green-500/10' : 'bg-destructive/10'
        }`}>
          {coverage.overallRemaining > 0 ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Patient éligible à la prise en charge</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span className="text-sm">Plafond annuel atteint - Autorisation requise</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientCoverageCheck;
