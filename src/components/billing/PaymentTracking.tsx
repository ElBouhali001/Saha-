
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Search, CreditCard, AlertCircle, CheckCircle, Clock, Filter } from 'lucide-react';

interface Payment {
  id: string;
  invoiceId: string;
  patientName: string;
  amount: number;
  paymentMethod: string;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidDate?: string;
}

const PaymentTracking = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  // Données simulées
  const payments: Payment[] = [
    {
      id: '1',
      invoiceId: 'F2024-001',
      patientName: 'Mme Diabaté Aïcha',
      amount: 25000,
      paymentMethod: 'Mobile Money',
      status: 'paid',
      dueDate: '2024-01-15',
      paidDate: '2024-01-15'
    },
    {
      id: '2',
      invoiceId: 'F2024-002',
      patientName: 'M. Koné Ibrahim',
      amount: 35000,
      paymentMethod: 'Espèces',
      status: 'pending',
      dueDate: '2024-01-20'
    },
    {
      id: '3',
      invoiceId: 'F2024-003',
      patientName: 'Mme Bamba Mariam',
      amount: 20000,
      paymentMethod: 'Virement',
      status: 'overdue',
      dueDate: '2024-01-10'
    },
    {
      id: '4',
      invoiceId: 'F2024-004',
      patientName: 'M. Ouattara Ali',
      amount: 30000,
      paymentMethod: 'Mobile Money',
      status: 'paid',
      dueDate: '2024-01-18',
      paidDate: '2024-01-17'
    }
  ];

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.invoiceId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Payé</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />En retard</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  const handleMarkAsPaid = (paymentId: string) => {
    toast({
      title: "Paiement confirmé",
      description: "Le paiement a été marqué comme effectué",
    });
    console.log('Paiement marqué comme payé:', paymentId);
  };

  const handleSendReminder = (paymentId: string) => {
    toast({
      title: "Rappel envoyé",
      description: "Un rappel de paiement a été envoyé au patient",
    });
    console.log('Rappel envoyé pour:', paymentId);
  };

  const getPaymentStats = () => {
    const total = payments.length;
    const paid = payments.filter(p => p.status === 'paid').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const overdue = payments.filter(p => p.status === 'overdue').length;
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

    return { total, paid, pending, overdue, totalAmount, paidAmount };
  };

  const stats = getPaymentStats();

  return (
    <div className="space-y-6">
      {/* Statistiques de paiement */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-700">{stats.paid}</p>
                <p className="text-xs text-gray-600">Paiements reçus</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
                <p className="text-xs text-gray-600">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-700">{stats.overdue}</p>
                <p className="text-xs text-gray-600">En retard</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-lg font-bold text-blue-700">
                  {Math.round((stats.paidAmount / stats.totalAmount) * 100)}%
                </p>
                <p className="text-xs text-gray-600">Taux de recouvrement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Suivi des Paiements</span>
          </CardTitle>
          <CardDescription>
            Gérer et suivre les paiements des factures
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtres et recherche */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par patient ou facture..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="paid">Payé</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tableau des paiements */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Facture</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Mode de paiement</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.invoiceId}</TableCell>
                  <TableCell>{payment.patientName}</TableCell>
                  <TableCell>{payment.amount.toLocaleString()} CFA</TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                  <TableCell>
                    {new Date(payment.dueDate).toLocaleDateString('fr-FR')}
                    {payment.paidDate && (
                      <div className="text-xs text-green-600">
                        Payé le {new Date(payment.paidDate).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {payment.status !== 'paid' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsPaid(payment.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Marquer payé
                        </Button>
                      )}
                      {payment.status === 'overdue' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendReminder(payment.id)}
                        >
                          Rappel
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredPayments.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun paiement trouvé</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Aucun paiement ne correspond aux critères de recherche.' 
                  : 'Aucun paiement enregistré pour le moment.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTracking;
