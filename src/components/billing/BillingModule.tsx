
import React, { useState } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { hasPermission } from '@/utils/permissions';
import InvoiceCreation from './InvoiceCreation';
import PaymentTracking from './PaymentTracking';
import BillingHistory from './BillingHistory';
import { Receipt, CreditCard, History, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';

const BillingModule = () => {
  const { user } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Vérifier les permissions d'accès
  if (!hasPermission(user, 'view_billing')) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <CardTitle>Accès refusé</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              Vous n'avez pas les permissions nécessaires pour accéder au module de facturation.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Données simulées pour le tableau de bord
  const billingStats = {
    todayRevenue: 125000,
    pendingAmount: 45000,
    thisMonth: 2850000,
    unpaidInvoices: 12
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Module de Facturation</h1>
          <p className="text-gray-600">Gestion des factures et suivi des paiements</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Tableau de bord financier */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recettes Aujourd'hui</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {billingStats.todayRevenue.toLocaleString()} CFA
            </div>
            <p className="text-xs text-gray-600">+12% par rapport à hier</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Receipt className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">
              {billingStats.pendingAmount.toLocaleString()} CFA
            </div>
            <p className="text-xs text-gray-600">{billingStats.unpaidInvoices} factures impayées</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce Mois</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {billingStats.thisMonth.toLocaleString()} CFA
            </div>
            <p className="text-xs text-gray-600">+8% par rapport au mois dernier</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Recouvrement</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">94%</div>
            <p className="text-xs text-gray-600">Excellent taux de paiement</p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets de gestion */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="create">Nouvelle Facture</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
                <CardDescription>Tâches fréquentes de facturation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full justify-start space-x-3 h-12"
                  onClick={() => setActiveTab('create')}
                >
                  <Receipt className="w-5 h-5" />
                  <span>Créer une nouvelle facture</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start space-x-3 h-12"
                  onClick={() => setActiveTab('payments')}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Enregistrer un paiement</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start space-x-3 h-12"
                  onClick={() => setActiveTab('history')}
                >
                  <History className="w-5 h-5" />
                  <span>Consulter l'historique</span>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Factures Récentes</CardTitle>
                <CardDescription>Dernières factures émises</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: 'F2024-001', patient: 'Mme Diabaté Aïcha', amount: 25000, status: 'Payée', date: '2024-01-15' },
                  { id: 'F2024-002', patient: 'M. Koné Ibrahim', amount: 35000, status: 'En attente', date: '2024-01-15' },
                  { id: 'F2024-003', patient: 'Mme Bamba Mariam', amount: 20000, status: 'Payée', date: '2024-01-14' }
                ].map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{invoice.id}</p>
                      <p className="text-sm text-gray-600">{invoice.patient}</p>
                      <p className="text-xs text-gray-400">{invoice.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{invoice.amount.toLocaleString()} CFA</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        invoice.status === 'Payée' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="create">
          <InvoiceCreation />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentTracking />
        </TabsContent>

        <TabsContent value="history">
          <BillingHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingModule;
