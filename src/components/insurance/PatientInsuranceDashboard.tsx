import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  XCircle,
  FileText,
  Calendar,
  Euro
} from 'lucide-react';
import { usePatientCoverage, useAuthorizationRequests, CARE_TYPES } from '@/hooks/useInsuranceCoverage';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PatientInsuranceDashboardProps {
  patientId: string;
}

const PatientInsuranceDashboard: React.FC<PatientInsuranceDashboardProps> = ({ patientId }) => {
  const { data: coverage, isLoading } = usePatientCoverage(patientId);
  const { data: authRequests } = useAuthorizationRequests(coverage?.patientInsuranceId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!coverage) {
    return (
      <Card className="border-yellow-500/50 bg-yellow-500/10">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Aucune assurance active</h3>
          <p className="text-muted-foreground">
            Vous n'avez pas d'assurance ou mutuelle active sur votre compte.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Refusée';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec résumé */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{coverage.insuranceName}</h2>
                <p className="text-muted-foreground">{coverage.planName}</p>
              </div>
            </div>
            <Badge className="text-lg px-4 py-2 bg-primary">
              {coverage.coverageRate}% de couverture
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Euro className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{coverage.totalCovered.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">FCFA consommés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{coverage.overallRemaining.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">FCFA restants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Shield className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{coverage.annualLimit?.toLocaleString() || '∞'}</p>
                <p className="text-xs text-muted-foreground">FCFA plafond annuel</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <FileText className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{authRequests?.filter((r: any) => r.status === 'pending').length || 0}</p>
                <p className="text-xs text-muted-foreground">Demandes en cours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="consumption">
        <TabsList>
          <TabsTrigger value="consumption">
            <TrendingUp className="w-4 h-4 mr-2" />
            Ma consommation
          </TabsTrigger>
          <TabsTrigger value="requests">
            <FileText className="w-4 h-4 mr-2" />
            Mes demandes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="consumption" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Consommation par type de soin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {coverage.consumptionByType.map((consumption) => {
                const isLimitReached = consumption.percentUsed >= 100;
                const isNearLimit = consumption.percentUsed >= 80;
                
                return (
                  <div key={consumption.care_type} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {CARE_TYPES[consumption.care_type as keyof typeof CARE_TYPES]}
                        </span>
                        {isLimitReached && (
                          <Badge variant="destructive">Plafond atteint</Badge>
                        )}
                        {isNearLimit && !isLimitReached && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-500">
                            Proche du plafond
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm font-medium">
                        {consumption.covered.toLocaleString()} / {consumption.limit.toLocaleString()} FCFA
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <Progress 
                        value={Math.min(consumption.percentUsed, 100)} 
                        className={`h-3 ${
                          isLimitReached ? 'bg-destructive/20' : 
                          isNearLimit ? 'bg-yellow-500/20' : 'bg-primary/20'
                        }`}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{consumption.percentUsed.toFixed(1)}% utilisé</span>
                        <span>Reste: {consumption.remaining.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des demandes d'autorisation</CardTitle>
            </CardHeader>
            <CardContent>
              {!authRequests || authRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune demande d'autorisation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {authRequests.map((request: any) => (
                    <div 
                      key={request.id} 
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          <span className="font-medium">
                            {CARE_TYPES[request.care_type as keyof typeof CARE_TYPES]}
                          </span>
                          <Badge variant="outline">
                            {getStatusLabel(request.status)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {request.care_description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(request.requested_at), 'dd MMM yyyy', { locale: fr })}
                          </span>
                          {request.validity_date && (
                            <span>Validité: {format(new Date(request.validity_date), 'dd MMM yyyy', { locale: fr })}</span>
                          )}
                        </div>
                        
                        {request.rejection_reason && (
                          <p className="text-sm text-destructive mt-2">
                            Motif: {request.rejection_reason}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium">
                          {request.requested_amount?.toLocaleString()} FCFA
                        </p>
                        {request.approved_amount && (
                          <p className="text-sm text-green-600">
                            Approuvé: {request.approved_amount.toLocaleString()} FCFA
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientInsuranceDashboard;
