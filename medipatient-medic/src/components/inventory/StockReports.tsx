
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Calendar, TrendingUp, BarChart3, PieChart } from 'lucide-react';

const StockReports = () => {
  const { t } = useTranslation();
  const [selectedReport, setSelectedReport] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const reportTypes = [
    {
      id: 'stock_value',
      name: t('inventory.reports.types.stock_value'),
      description: t('inventory.reports.types.stock_value_desc'),
      icon: TrendingUp
    },
    {
      id: 'movements',
      name: t('inventory.reports.types.movements'),
      description: t('inventory.reports.types.movements_desc'),
      icon: BarChart3
    },
    {
      id: 'expiry',
      name: t('inventory.reports.types.expiry'),
      description: t('inventory.reports.types.expiry_desc'),
      icon: Calendar
    },
    {
      id: 'consumption',
      name: t('inventory.reports.types.consumption'),
      description: t('inventory.reports.types.consumption_desc'),
      icon: PieChart
    }
  ];

  const mockData = {
    stockValue: {
      total: 2450000,
      byCategory: [
        { category: 'Médicaments', value: 1800000, percentage: 73 },
        { category: 'Matériel médical', value: 450000, percentage: 18 },
        { category: 'Consommables', value: 200000, percentage: 9 }
      ]
    },
    movements: {
      period: 'Janvier 2024',
      entries: 145,
      exits: 98,
      totalValue: 580000
    },
    expiry: {
      expiringSoon: 8,
      expired: 2,
      items: [
        { name: 'Ibuprofène 400mg', expiryDate: '2024-02-15', daysLeft: 22 },
        { name: 'Serum physiologique', expiryDate: '2024-02-20', daysLeft: 27 },
        { name: 'Paracétamol sirop', expiryDate: '2024-01-30', daysLeft: 6 }
      ]
    }
  };

  const generateReport = () => {
    if (!selectedReport) {
      alert(t('inventory.reports.select_type_error'));
      return;
    }

    console.log(`Génération du rapport: ${selectedReport} pour la période: ${selectedPeriod}`);
    // Ici, vous intégreriez la génération de rapport PDF
  };

  const downloadReport = () => {
    console.log('Téléchargement du rapport en cours...');
    // Simulation du téléchargement
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <span>{t('inventory.reports.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">{t('inventory.reports.type_label')}</label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder={t('inventory.reports.select_type')} />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((report) => (
                    <SelectItem key={report.id} value={report.id}>
                      {report.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('inventory.reports.period_label')}</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">{t('inventory.reports.periods.today')}</SelectItem>
                  <SelectItem value="week">{t('inventory.reports.periods.week')}</SelectItem>
                  <SelectItem value="month">{t('inventory.reports.periods.month')}</SelectItem>
                  <SelectItem value="quarter">{t('inventory.reports.periods.quarter')}</SelectItem>
                  <SelectItem value="year">{t('inventory.reports.periods.year')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button onClick={generateReport} className="bg-blue-600 hover:bg-blue-700">
              <FileText className="w-4 h-4 mr-2" />
              {t('inventory.reports.generate')}
            </Button>
            <Button onClick={downloadReport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              {t('inventory.reports.download')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Types de rapports disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className={`cursor-pointer transition-colors hover:bg-gray-50 ${selectedReport === report.id ? 'border-blue-500 bg-blue-50' : ''
              }`} onClick={() => setSelectedReport(report.id)}>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Icon className="w-8 h-8 text-blue-500 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-medium text-lg mb-1">{report.name}</h3>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Aperçu des données */}
      <Card>
        <CardHeader>
          <CardTitle>{t('inventory.reports.overview.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Valorisation du stock */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-3 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span>{t('inventory.reports.overview.value')}</span>
              </h3>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {mockData.stockValue.total.toLocaleString()} FCFA
                </div>
                <div className="space-y-1">
                  {mockData.stockValue.byCategory.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.category}</span>
                      <span className="font-medium">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mouvements */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-3 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span>{t('inventory.reports.overview.movements')}</span>
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('inventory.movements.filters.entries')}:</span>
                  <span className="font-medium text-green-600">+{mockData.movements.entries}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('inventory.movements.filters.exits')}:</span>
                  <span className="font-medium text-red-600">-{mockData.movements.exits}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span>{t('inventory.reports.overview.value')}:</span>
                  <span className="font-medium">{mockData.movements.totalValue.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>

            {/* Expiration */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-3 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>{t('inventory.reports.overview.expiration')}</span>
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('inventory.reports.overview.expiring_soon')}</span>
                  <Badge variant="secondary">{mockData.expiry.expiringSoon}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('inventory.reports.overview.expired')}</span>
                  <Badge variant="destructive">{mockData.expiry.expired}</Badge>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {t('inventory.reports.overview.next', { name: mockData.expiry.items[0]?.name, days: mockData.expiry.items[0]?.daysLeft })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockReports;
