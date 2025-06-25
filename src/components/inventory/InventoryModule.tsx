
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, TrendingUp, ShoppingCart, FileText, Plus } from 'lucide-react';
import StockList from './StockList';
import StockMovements from './StockMovements';
import StockAlerts from './StockAlerts';
import AddProduct from './AddProduct';
import StockReports from './StockReports';

const InventoryModule = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stockSummary = {
    totalProducts: 245,
    lowStockItems: 12,
    outOfStockItems: 3,
    totalValue: 2450000
  };

  const criticalItems = [
    {
      id: '1',
      name: 'Paracétamol 500mg',
      currentStock: 2,
      minStock: 50,
      status: 'critical'
    },
    {
      id: '2',
      name: 'Amoxicilline 250mg',
      currentStock: 0,
      minStock: 30,
      status: 'out_of_stock'
    },
    {
      id: '3',
      name: 'Seringues 5ml',
      currentStock: 15,
      minStock: 100,
      status: 'low'
    }
  ];

  const recentMovements = [
    {
      id: '1',
      product: 'Paracétamol 500mg',
      type: 'sortie',
      quantity: 20,
      reason: 'Prescription patient',
      date: '2024-01-24T10:30:00',
      user: 'Dr. Kouamé'
    },
    {
      id: '2',
      product: 'Amoxicilline 250mg',
      type: 'entrée',
      quantity: 100,
      reason: 'Livraison fournisseur',
      date: '2024-01-24T09:15:00',
      user: 'Agent Stock'
    },
    {
      id: '3',
      product: 'Seringues 5ml',
      type: 'sortie',
      quantity: 50,
      reason: 'Consultation',
      date: '2024-01-24T08:45:00',
      user: 'Dr. Traoré'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion de Stock</h1>
          <p className="text-gray-600">Suivi des médicaments et matériel médical</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Produit
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="movements">Mouvements</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Résumé du stock */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
                <Package className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stockSummary.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  Références en stock
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Faible</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stockSummary.lowStockItems}</div>
                <p className="text-xs text-muted-foreground">
                  Produits à réapprovisionner
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rupture Stock</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stockSummary.outOfStockItems}</div>
                <p className="text-xs text-muted-foreground">
                  Produits en rupture
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valeur Stock</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stockSummary.totalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  FCFA
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Alertes critiques */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>Alertes Critiques</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {criticalItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        Stock actuel: {item.currentStock} / Min: {item.minStock}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={
                        item.status === 'out_of_stock' ? 'destructive' :
                        item.status === 'critical' ? 'destructive' : 'default'
                      }>
                        {item.status === 'out_of_stock' ? 'Rupture' :
                         item.status === 'critical' ? 'Critique' : 'Faible'}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Commander
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mouvements récents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <span>Mouvements Récents</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMovements.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Badge variant={movement.type === 'entrée' ? 'default' : 'secondary'}>
                          {movement.type === 'entrée' ? '↗ Entrée' : '↙ Sortie'}
                        </Badge>
                        <span className="font-medium">{movement.product}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {movement.reason} - {movement.user}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {movement.type === 'entrée' ? '+' : '-'}{movement.quantity}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(movement.date).toLocaleTimeString('fr-FR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <StockList />
        </TabsContent>

        <TabsContent value="movements">
          <StockMovements movements={recentMovements} />
        </TabsContent>

        <TabsContent value="alerts">
          <StockAlerts criticalItems={criticalItems} />
        </TabsContent>

        <TabsContent value="reports">
          <StockReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryModule;
