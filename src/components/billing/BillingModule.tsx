
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { hasPermission } from '@/utils/permissions';
import InvoiceCreation from './InvoiceCreation';
import PaymentTracking from './PaymentTracking';
import BillingHistory from './BillingHistory';
import RevenueDistribution from './RevenueDistribution';
import { Receipt, CreditCard, History, TrendingUp, AlertCircle, DollarSign, PieChart } from 'lucide-react';

const BillingModule = () => {
  const { t, i18n } = useTranslation();
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
              <CardTitle>{t('billing.access_denied_title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              {t('billing.access_denied_message')}
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
          <h1 className="text-3xl font-bold text-gray-900">{t('billing.title')}</h1>
          <p className="text-gray-600">{t('billing.subtitle')}</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          {new Date().toLocaleDateString(i18n.language, {
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
            <CardTitle className="text-sm font-medium">{t('billing.stats.today_revenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {billingStats.todayRevenue.toLocaleString()} CFA
            </div>
            <p className="text-xs text-gray-600">{t('billing.stats.vs_yesterday')}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('billing.stats.pending_amount')}</CardTitle>
            <Receipt className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">
              {billingStats.pendingAmount.toLocaleString()} CFA
            </div>
            <p className="text-xs text-gray-600">{t('billing.stats.unpaid_invoices_count', { count: billingStats.unpaidInvoices })}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('billing.stats.this_month')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {billingStats.thisMonth.toLocaleString()} CFA
            </div>
            <p className="text-xs text-gray-600">{t('billing.stats.vs_last_month')}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('billing.stats.recovery_rate')}</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">94%</div>
            <p className="text-xs text-gray-600">{t('billing.stats.excellent_rate')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets de gestion */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-1">
          <TabsTrigger value="overview" className="text-xs md:text-sm">
            <span className="hidden md:inline">{t('billing.tabs.overview')}</span>
            <span className="md:hidden">Vue</span>
          </TabsTrigger>
          <TabsTrigger value="create" className="text-xs md:text-sm">
            <span className="hidden md:inline">{t('billing.tabs.create')}</span>
            <span className="md:hidden">Créer</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-xs md:text-sm">{t('billing.tabs.payments')}</TabsTrigger>
          <TabsTrigger value="history" className="text-xs md:text-sm">{t('billing.tabs.history')}</TabsTrigger>
          <TabsTrigger value="revenue" className="text-xs md:text-sm">
            <PieChart className="w-4 h-4 mr-1" />
            <span className="hidden md:inline">{t('billing.tabs.revenue')}</span>
            <span className="md:hidden">CA</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('billing.actions.title')}</CardTitle>
                <CardDescription>{t('billing.actions.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full justify-start space-x-3 h-12"
                  onClick={() => setActiveTab('create')}
                >
                  <Receipt className="w-5 h-5" />
                  <span>{t('billing.actions.new_invoice')}</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start space-x-3 h-12"
                  onClick={() => setActiveTab('payments')}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>{t('billing.actions.record_payment')}</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start space-x-3 h-12"
                  onClick={() => setActiveTab('history')}
                >
                  <History className="w-5 h-5" />
                  <span>{t('billing.actions.view_history')}</span>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('billing.recent_invoices.title')}</CardTitle>
                <CardDescription>{t('billing.recent_invoices.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: 'F2024-001', patient: 'Mme Diabaté Aïcha', amount: 25000, status: 'paid', date: '2024-01-15' },
                  { id: 'F2024-002', patient: 'M. Koné Ibrahim', amount: 35000, status: 'pending', date: '2024-01-15' },
                  { id: 'F2024-003', patient: 'Mme Bamba Mariam', amount: 20000, status: 'paid', date: '2024-01-14' }
                ].map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{invoice.id}</p>
                      <p className="text-sm text-gray-600">{invoice.patient}</p>
                      <p className="text-xs text-gray-400">{invoice.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{invoice.amount.toLocaleString()} CFA</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${invoice.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                        }`}>
                        {invoice.status === 'paid' ? t('billing.status.paid') : t('billing.status.pending')}
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

        <TabsContent value="revenue">
          <RevenueDistribution />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingModule;
