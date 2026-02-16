import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  AlertTriangle, 
  BarChart3,
  Pill,
  ClipboardList,
  Target
} from 'lucide-react';
import PharmacyInventoryManagement from './PharmacyInventoryManagement';
import PharmacyStockOptimization from './PharmacyStockOptimization';
import PharmacySalesManagement from './PharmacySalesManagement';
import PharmacyCustomerRelations from './PharmacyCustomerRelations';
import PharmacyOrdersManagement from './PharmacyOrdersManagement';
import { usePharmacyInventory, useStockOptimization, usePharmacySales, usePharmacyCustomers } from '@/hooks/usePharmacyOfficina';
import { useCurrentPharmacist } from '@/hooks/useCurrentPharmacist';

const OfficinaModule = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: pharmacist, isLoading: isLoadingPharmacist } = useCurrentPharmacist();
  const pharmacyId = pharmacist?.pharmacy_id;
  
  const { data: inventory = [] } = usePharmacyInventory(pharmacyId);
  const { data: optimization } = useStockOptimization(pharmacyId);
  const { data: sales = [] } = usePharmacySales(pharmacyId);
  const { data: customers = [] } = usePharmacyCustomers(pharmacyId);

  if (isLoadingPharmacist) {
    return <div className="p-6">Chargement...</div>;
  }

  if (!pharmacist || !pharmacyId) {
    return <div className="p-6">Aucune pharmacie associée à ce compte.</div>;
  }

  const todaySales = sales?.filter(sale => 
    new Date(sale.sale_date).toDateString() === new Date().toDateString()
  ) || [];

  const lowStockItems = inventory.filter(item => item.current_stock <= item.min_stock);
  const outOfStockItems = inventory.filter(item => item.current_stock === 0);
  const expiringItems = inventory.filter(item => {
    if (!item.expiry_date) return false;
    const expiryDate = new Date(item.expiry_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow;
  });

  const totalInventoryValue = inventory.reduce((sum, item) => 
    sum + (item.current_stock * item.unit_cost), 0
  );

  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total_amount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Module Officine</h1>
        <p className="text-muted-foreground">Gestion complète de votre pharmacie</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Stock
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Optimisation
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Ventes
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Commandes
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Clients
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{inventory.length}</p>
                    <p className="text-sm text-muted-foreground">Produits en stock</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{lowStockItems.length}</p>
                    <p className="text-sm text-muted-foreground">Stock faible</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{todaySales.length}</p>
                    <p className="text-sm text-muted-foreground">Ventes aujourd'hui</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{todayRevenue.toLocaleString()} FCFA</p>
                    <p className="text-sm text-muted-foreground">CA du jour</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertes et actions rapides */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Alertes de stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Rupture de stock</p>
                      <p className="text-xs text-muted-foreground">{outOfStockItems.length} produits</p>
                    </div>
                    <Badge variant="destructive">{outOfStockItems.length}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Stock faible</p>
                      <p className="text-xs text-muted-foreground">{lowStockItems.length} produits</p>
                    </div>
                    <Badge variant="secondary">{lowStockItems.length}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Expiration proche</p>
                      <p className="text-xs text-muted-foreground">{expiringItems.length} produits</p>
                    </div>
                    <Badge variant="outline">{expiringItems.length}</Badge>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    onClick={() => setActiveTab('optimization')} 
                    className="w-full"
                    size="sm"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Voir les recommandations
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Résumé financier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Valeur du stock</p>
                    <p className="text-2xl font-bold">{totalInventoryValue.toLocaleString()} FCFA</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">CA mensuel estimé</p>
                    <p className="text-xl font-semibold">
                      {(todayRevenue * 30).toLocaleString()} FCFA
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Clients actifs</p>
                    <p className="text-lg font-medium">{customers.length}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    onClick={() => setActiveTab('sales')} 
                    variant="outline" 
                    className="w-full"
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Nouvelle vente
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top 5 des ventes récentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Ventes récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Pill className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{sale.sale_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sale.sale_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{sale.total_amount.toLocaleString()} FCFA</p>
                      <Badge variant="outline" className="text-xs">
                        {sale.payment_method}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {sales.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune vente enregistrée
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <PharmacyInventoryManagement pharmacyId={pharmacyId} />
        </TabsContent>

        <TabsContent value="optimization">
          <PharmacyStockOptimization pharmacyId={pharmacyId} />
        </TabsContent>

        <TabsContent value="sales">
          <PharmacySalesManagement pharmacyId={pharmacyId} />
        </TabsContent>

        <TabsContent value="orders">
          <PharmacyOrdersManagement pharmacyId={pharmacyId} />
        </TabsContent>

        <TabsContent value="customers">
          <PharmacyCustomerRelations pharmacyId={pharmacyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OfficinaModule;