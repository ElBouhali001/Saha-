import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  User,
  Calendar
} from 'lucide-react';
import { 
  useAuthorizationRequests, 
  useRespondToAuthorizationRequest,
  CARE_TYPES 
} from '@/hooks/useInsuranceCoverage';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const InsuranceAgentPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [responseType, setResponseType] = useState<'approve' | 'reject' | null>(null);
  const [approvedAmount, setApprovedAmount] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [validityDate, setValidityDate] = useState('');

  const { data: pendingRequests } = useAuthorizationRequests(undefined, 'pending');
  const { data: processedRequests } = useAuthorizationRequests();
  const { mutate: respondToRequest, isPending } = useRespondToAuthorizationRequest();

  const handleResponse = () => {
    if (!selectedRequest || !responseType) return;

    respondToRequest({
      requestId: selectedRequest.id,
      status: responseType === 'approve' ? 'approved' : 'rejected',
      approved_amount: responseType === 'approve' ? parseFloat(approvedAmount) : undefined,
      rejection_reason: responseType === 'reject' ? rejectionReason : undefined,
      validity_date: responseType === 'approve' ? validityDate : undefined
    }, {
      onSuccess: () => {
        setSelectedRequest(null);
        setResponseType(null);
        setApprovedAmount('');
        setRejectionReason('');
        setValidityDate('');
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600"><Clock className="w-3 h-3 mr-1" /> En attente</Badge>;
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Refusé</Badge>;
      default:
        return null;
    }
  };

  const renderRequestCard = (request: any) => {
    const patient = request.patient_insurances?.patients;
    const profile = patient?.profiles;
    const insurance = request.patient_insurances?.insurances;

    return (
      <Card key={request.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedRequest(request)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">
                  {profile?.first_name} {profile?.last_name}
                </span>
                {getStatusBadge(request.status)}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  {insurance?.name}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {CARE_TYPES[request.care_type as keyof typeof CARE_TYPES]}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(request.requested_at), 'dd MMM yyyy', { locale: fr })}
                </span>
              </div>
              
              <p className="text-sm line-clamp-2">{request.care_description}</p>
            </div>
            
            <div className="text-right">
              <p className="text-lg font-bold text-primary">
                {request.requested_amount?.toLocaleString()} FCFA
              </p>
              {request.approved_amount && (
                <p className="text-sm text-green-600">
                  Approuvé: {request.approved_amount.toLocaleString()} FCFA
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Portail Assureur
          </h1>
          <p className="text-muted-foreground">Gestion des demandes d'autorisation de soins</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{pendingRequests?.length || 0}</p>
                <p className="text-xs text-muted-foreground">En attente</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            En attente ({pendingRequests?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="processed" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Traitées
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {pendingRequests?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium">Aucune demande en attente</p>
                <p className="text-muted-foreground">Toutes les demandes ont été traitées.</p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests?.map(renderRequestCard)
          )}
        </TabsContent>

        <TabsContent value="processed" className="space-y-4 mt-4">
          {processedRequests?.filter((r: any) => r.status !== 'pending').map(renderRequestCard)}
        </TabsContent>
      </Tabs>

      {/* Modal de réponse */}
      <Dialog open={!!selectedRequest && !responseType} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails de la demande</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <p className="font-medium">
                    {selectedRequest.patient_insurances?.patients?.profiles?.first_name}{' '}
                    {selectedRequest.patient_insurances?.patients?.profiles?.last_name}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">N° Police</p>
                  <p className="font-medium">{selectedRequest.patient_insurances?.policy_number}</p>
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Type de soin</p>
                <p className="font-medium">{CARE_TYPES[selectedRequest.care_type as keyof typeof CARE_TYPES]}</p>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{selectedRequest.care_description}</p>
              </div>

              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Montant demandé</p>
                <p className="text-xl font-bold text-primary">
                  {selectedRequest.requested_amount?.toLocaleString()} FCFA
                </p>
              </div>

              {selectedRequest.status === 'pending' && (
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                    Fermer
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setResponseType('reject')}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Refuser
                  </Button>
                  <Button 
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => {
                      setResponseType('approve');
                      setApprovedAmount(selectedRequest.requested_amount?.toString() || '');
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approuver
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal d'approbation */}
      <Dialog open={responseType === 'approve'} onOpenChange={() => setResponseType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Approuver la demande
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Montant approuvé (FCFA)</Label>
              <Input
                type="number"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                placeholder="Montant"
              />
            </div>

            <div className="space-y-2">
              <Label>Date de validité</Label>
              <Input
                type="date"
                value={validityDate}
                onChange={(e) => setValidityDate(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setResponseType(null)}>
                Annuler
              </Button>
              <Button 
                className="bg-green-500 hover:bg-green-600"
                onClick={handleResponse}
                disabled={isPending}
              >
                {isPending ? 'Traitement...' : 'Confirmer l\'approbation'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de refus */}
      <Dialog open={responseType === 'reject'} onOpenChange={() => setResponseType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              Refuser la demande
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Motif du refus</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Expliquez le motif du refus..."
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setResponseType(null)}>
                Annuler
              </Button>
              <Button 
                variant="destructive"
                onClick={handleResponse}
                disabled={isPending || !rejectionReason}
              >
                {isPending ? 'Traitement...' : 'Confirmer le refus'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InsuranceAgentPortal;
