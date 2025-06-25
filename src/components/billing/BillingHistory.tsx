
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { History, Search, Download, Eye, Printer, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Invoice {
  id: string;
  patientName: string;
  patientId: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  createdDate: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  items: string[];
}

const BillingHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  // Données simulées
  const invoices: Invoice[] = [
    {
      id: 'F2024-001',
      patientName: 'Mme Diabaté Aïcha',
      patientId: 'P2024-001', 
      amount: 25000,
      status: 'paid',
      createdDate: '2024-01-15',
      dueDate: '2024-01-15',
      paidDate: '2024-01-15',
      paymentMethod: 'Mobile Money',
      items: ['Consultation générale', 'Médicaments']
    },
    {
      id: 'F2024-002',
      patientName: 'M. Koné Ibrahim',
      patientId: 'P2024-002',
      amount: 35000,
      status: 'pending',
      createdDate: '2024-01-14',
      dueDate: '2024-01-20',
      items: ['Consultation spécialisée', 'Examens biologiques']
    },
    {
      id: 'F2024-003',
      patientName: 'Mme Bamba Mariam',
      patientId: 'P2024-003',
      amount: 20000,
      status: 'overdue',
      createdDate: '2024-01-10',
      dueDate: '2024-01-10',
      items: ['Consultation', 'Prescription']
    },
    {
      id: 'F2024-004',
      patientName: 'M. Ouattara Ali',
      patientId: 'P2024-004',
      amount: 30000,
      status: 'paid',
      createdDate: '2024-01-12',
      dueDate: '2024-01-18',
      paidDate: '2024-01-17',
      paymentMethod: 'Espèces',
      items: ['Consultation', 'Soins']
    },
    {
      id: 'F2024-005',
      patientName: 'Mme Traoré Fatou',
      patientId: 'P2024-005',
      amount: 15000,
      status: 'cancelled',
      createdDate: '2024-01-08',
      dueDate: '2024-01-15',
      items: ['Consultation annulée']
    }
  ];

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    let matchesDateRange = true;
    if (dateFrom || dateTo) {
      const invoiceDate = new Date(invoice.createdDate);
      if (dateFrom && invoiceDate < dateFrom) matchesDateRange = false;
      if (dateTo && invoiceDate > dateTo) matchesDateRange = false;
    }
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Payée</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">En retard</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Annulée</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  const handleViewInvoice = (invoiceId: string) => {
    toast({
      title: "Consultation facture",
      description: `Ouverture de la facture ${invoiceId}`,
    });
    console.log('Voir facture:', invoiceId);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
      title: "Téléchargement",
      description: `Téléchargement de la facture ${invoiceId} en cours...`,
    });
    console.log('Télécharger facture:', invoiceId);
  };

  const handlePrintInvoice = (invoiceId: string) => {
    toast({
      title: "Impression",
      description: `Impression de la facture ${invoiceId}`,
    });
    console.log('Imprimer facture:', invoiceId);
  };

  const exportToCSV = () => {
    toast({
      title: "Export réussi",
      description: "Les données ont été exportées en CSV",
    });
    console.log('Export CSV des factures');
  };

  const getHistoryStats = () => {
    const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paidAmount = filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
    const pendingAmount = filteredInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);
    const overdueAmount = filteredInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);
    
    return { totalAmount, paidAmount, pendingAmount, overdueAmount };
  };

  const stats = getHistoryStats();

  return (
    <div className="space-y-6">
      {/* Résumé statistique */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-700">{stats.totalAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-600">Total CFA</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">{stats.paidAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-600">Encaissé CFA</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-700">{stats.pendingAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-600">En attente CFA</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-700">{stats.overdueAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-600">En retard CFA</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <History className="w-5 h-5" />
                <span>Historique de Facturation</span>
              </CardTitle>
              <CardDescription>
                Consulter toutes les factures émises
              </CardDescription>
            </div>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtres et recherche */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
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
              <SelectTrigger className="w-full lg:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="paid">Payée</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: fr }) : "Date début"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    locale={fr}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: fr }) : "Date fin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    locale={fr}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Tableau des factures */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Facture</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Date création</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Mode paiement</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{invoice.patientName}</p>
                      <p className="text-xs text-gray-500">{invoice.patientId}</p>
                    </div>
                  </TableCell>
                  <TableCell>{invoice.amount.toLocaleString()} CFA</TableCell>
                  <TableCell>
                    {new Date(invoice.createdDate).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                    {invoice.paidDate && (
                      <div className="text-xs text-green-600">
                        Payé le {new Date(invoice.paidDate).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>{invoice.paymentMethod || '-'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewInvoice(invoice.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownloadInvoice(invoice.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePrintInvoice(invoice.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune facture trouvée</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || dateFrom || dateTo
                  ? 'Aucune facture ne correspond aux critères de recherche.' 
                  : 'Aucune facture enregistrée pour le moment.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingHistory;
