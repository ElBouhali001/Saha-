import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  XCircle,
  FileText,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  Building2,
  Receipt,
  Stethoscope,
  Pill,
  Activity,
  PlusCircle
} from 'lucide-react';
import { useMockInsuranceData, MOCK_PATIENTS } from '@/hooks/useMockInsuranceData';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import PatientCoverageRequestModal from './PatientCoverageRequestModal';

const CARE_TYPE_LABELS: Record<string, string> = {
  consultation_generale: 'Consultations générales',
  consultation_specialisee: 'Consultations spécialisées',
  actes_medicaux: 'Actes médicaux',
  pharmacie: 'Pharmacie'
};

const CARE_TYPE_ICONS: Record<string, React.ReactNode> = {
  consultation_generale: <Stethoscope className="w-4 h-4" />,
  consultation_specialisee: <Activity className="w-4 h-4" />,
  actes_medicaux: <FileText className="w-4 h-4" />,
  pharmacie: <Pill className="w-4 h-4" />
};

interface PatientInsuranceDashboardProps {
  patientId?: string;
}

const PatientInsuranceDashboard: React.FC<PatientInsuranceDashboardProps> = ({ 
  patientId = 'patient-1' // Patient par défaut pour la démo
}) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  
  const { 
    getPatient, 
    getPatientCoverageStatus, 
    getPatientAuthRequests,
    getPatientInsurance,
    getPatientCareHistory 
  } = useMockInsuranceData();

  const patient = useMemo(() => getPatient(patientId), [patientId, getPatient]);
  const coverage = useMemo(() => getPatientCoverageStatus(patientId), [patientId, getPatientCoverageStatus]);
  const authRequests = useMemo(() => getPatientAuthRequests(patientId), [patientId, getPatientAuthRequests]);
  const insuranceData = useMemo(() => getPatientInsurance(patientId), [patientId, getPatientInsurance]);
  const careHistory = useMemo(() => getPatientCareHistory(patientId), [patientId, getPatientCareHistory]);

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'outline';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  if (!coverage || !patient) {
    return (
      <Card className="border-yellow-500/50 bg-yellow-500/10">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Aucune assurance active</h3>
          <p className="text-muted-foreground">
            Vous n'avez pas d'assurance ou mutuelle active sur votre compte.
          </p>
          <Button className="mt-4">
            Souscrire à une mutuelle
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec titre et bouton de demande */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ma Mutuelle</h1>
          <p className="text-muted-foreground">Gérez votre couverture santé et vos demandes de prise en charge</p>
        </div>
        <Button onClick={() => setShowRequestModal(true)} size="lg" className="gap-2">
          <PlusCircle className="w-5 h-5" />
          Demande de prise en charge
        </Button>
      </div>

      {/* Modal de demande de prise en charge */}
      <PatientCoverageRequestModal
        open={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        patientName={patient ? `${patient.firstName} ${patient.lastName}` : 'Patient'}
        insuranceName={coverage.insuranceName}
      />

      {/* En-tête avec résumé */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{coverage.insuranceName}</h2>
                <p className="text-muted-foreground">{coverage.planName}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  N° Police: <span className="font-mono">{coverage.policyNumber}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className="text-lg px-4 py-2 bg-primary">
                {coverage.coverageRate}% de couverture
              </Badge>
              <span className="text-sm text-muted-foreground">
                Plafond annuel: {coverage.annualLimit.toLocaleString()} FCFA
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques en grille */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <CreditCard className="w-5 h-5 text-blue-500" />
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
                <p className="text-2xl font-bold">{coverage.annualLimit.toLocaleString()}</p>
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
                <p className="text-2xl font-bold">{authRequests.filter(r => r.status === 'pending').length}</p>
                <p className="text-xs text-muted-foreground">Demandes en cours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="consumption" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="consumption">
            <TrendingUp className="w-4 h-4 mr-2" />
            Consommation
          </TabsTrigger>
          <TabsTrigger value="history">
            <Receipt className="w-4 h-4 mr-2" />
            Décomptes
          </TabsTrigger>
          <TabsTrigger value="requests">
            <FileText className="w-4 h-4 mr-2" />
            Demandes
          </TabsTrigger>
          <TabsTrigger value="info">
            <Building2 className="w-4 h-4 mr-2" />
            Ma formule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="consumption">
          <Card>
            <CardHeader>
              <CardTitle>Consommation par type de soin - Année {new Date().getFullYear()}</CardTitle>
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
                          {CARE_TYPE_LABELS[consumption.care_type]}
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
                          isLimitReached ? '[&>div]:bg-destructive' : 
                          isNearLimit ? '[&>div]:bg-yellow-500' : ''
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

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Décomptes de prise en charge
              </CardTitle>
            </CardHeader>
            <CardContent>
              {careHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun décompte disponible</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {careHistory.map((care) => {
                      const statusColor = care.status === 'paid' ? 'text-green-600 bg-green-50' : 
                                         care.status === 'processing' ? 'text-blue-600 bg-blue-50' : 
                                         'text-yellow-600 bg-yellow-50';
                      const statusLabel = care.status === 'paid' ? 'Remboursé' : 
                                         care.status === 'processing' ? 'En traitement' : 
                                         'En attente';
                      
                      return (
                        <div 
                          key={care.id} 
                          className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className={`p-2 rounded-lg ${
                            care.careType === 'consultation_generale' ? 'bg-blue-100 text-blue-600' :
                            care.careType === 'consultation_specialisee' ? 'bg-purple-100 text-purple-600' :
                            care.careType === 'actes_medicaux' ? 'bg-orange-100 text-orange-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {CARE_TYPE_ICONS[care.careType]}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{care.description}</span>
                              <Badge variant="outline" className={`text-xs ${statusColor}`}>
                                {statusLabel}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{care.provider}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(care.date), 'dd MMMM yyyy', { locale: fr })}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded bg-muted">
                                {CARE_TYPE_LABELS[care.careType]}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <p className="text-sm font-medium">{care.amount.toLocaleString()} FCFA</p>
                            <p className="text-xs text-green-600 font-medium">
                              Pris en charge: {care.coveredAmount.toLocaleString()} FCFA
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Reste à charge: {(care.amount - care.coveredAmount).toLocaleString()} FCFA
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
              
              {careHistory.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Total soins</p>
                      <p className="text-lg font-bold">
                        {careHistory.reduce((sum, c) => sum + c.amount, 0).toLocaleString()} FCFA
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-600">Pris en charge</p>
                      <p className="text-lg font-bold text-green-600">
                        {careHistory.reduce((sum, c) => sum + c.coveredAmount, 0).toLocaleString()} FCFA
                      </p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-xs text-orange-600">Reste à charge</p>
                      <p className="text-lg font-bold text-orange-600">
                        {careHistory.reduce((sum, c) => sum + (c.amount - c.coveredAmount), 0).toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Historique des demandes d'autorisation</CardTitle>
            </CardHeader>
            <CardContent>
              {authRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune demande d'autorisation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {authRequests.map((request) => (
                    <div 
                      key={request.id} 
                      className="flex flex-col md:flex-row md:items-start justify-between p-4 border rounded-lg gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusIcon(request.status)}
                          <span className="font-medium">
                            {CARE_TYPE_LABELS[request.careType]}
                          </span>
                          <Badge variant={getStatusBadgeVariant(request.status) as any}>
                            {getStatusLabel(request.status)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {request.careDescription}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(request.requestedAt), 'dd MMM yyyy', { locale: fr })}
                          </span>
                          {request.validityDate && (
                            <span>Validité: {format(new Date(request.validityDate), 'dd MMM yyyy', { locale: fr })}</span>
                          )}
                        </div>
                        
                        {request.rejectionReason && (
                          <p className="text-sm text-destructive mt-2 p-2 bg-destructive/10 rounded">
                            <strong>Motif:</strong> {request.rejectionReason}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium">
                          Demandé: {request.requestedAmount.toLocaleString()} FCFA
                        </p>
                        {request.approvedAmount && (
                          <p className="text-sm text-green-600">
                            Approuvé: {request.approvedAmount.toLocaleString()} FCFA
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

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Informations de ma mutuelle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {insuranceData && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Assureur
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Nom:</span> {insuranceData.insurance.name}</p>
                        <p><span className="text-muted-foreground">Formule:</span> {insuranceData.plan?.name || 'Standard'}</p>
                        <p><span className="text-muted-foreground">N° Police:</span> <span className="font-mono">{insuranceData.policyNumber}</span></p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Couverture
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Taux:</span> {insuranceData.plan?.coverageRate || insuranceData.insurance.coverageRate}%</p>
                        <p><span className="text-muted-foreground">Plafond annuel:</span> {(insuranceData.plan?.annualLimit || insuranceData.insurance.annualLimit).toLocaleString()} FCFA</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-4">Plafonds par type de soin</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {insuranceData.plan?.limits && Object.entries(insuranceData.plan.limits).map(([type, limit]) => (
                        <div key={type} className="p-3 bg-muted/50 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground mb-1">
                            {CARE_TYPE_LABELS[type]}
                          </p>
                          <p className="font-semibold">{(limit as number).toLocaleString()} FCFA</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-4">Contact service client</h4>
                    <div className="flex flex-wrap gap-4">
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4 mr-2" />
                        Appeler
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4 mr-2" />
                        Envoyer un email
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientInsuranceDashboard;
