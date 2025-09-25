import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Package,
  BarChart3,
  ShoppingCart,
  Calendar,
  Zap
} from 'lucide-react';
import { useStockOptimization, useCreatePharmacyOrder } from '@/hooks/usePharmacyOfficina';

interface PharmacyStockOptimizationProps {
  pharmacyId: string;
}

const PharmacyStockOptimization: React.FC<PharmacyStockOptimizationProps> = ({ pharmacyId }) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { data: optimization, isLoading } = useStockOptimization(pharmacyId);
  const createOrder = useCreatePharmacyOrder();

  if (isLoading) return <div>Chargement de l'analyse...</div>;

  if (!optimization) return <div>Erreur lors du chargement des données</div>;

  const { inventory, paretoAnalysis, recommendations, metrics } = optimization;

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = (items: any[]) => {
    const itemIds = items.map(item => item.id);
    setSelectedItems(prev => 
      itemIds.every(id => prev.includes(id))
        ? prev.filter(id => !itemIds.includes(id))
        : [...new Set([...prev, ...itemIds])]
    );
  };

  const handleAutoOrder = async () => {
    const selectedRecommendations = recommendations.filter(item => 
      selectedItems.includes(item.id)
    );

    if (selectedRecommendations.length === 0) return;

    // Grouper par fournisseur
    const ordersBySupplier = selectedRecommendations.reduce((acc, item) => {
      const supplierId = item.supplier_id || 'default';
      if (!acc[supplierId]) acc[supplierId] = [];
      acc[supplierId].push({
        inventory_id: item.id,
        quantity: item.recommended_quantity,
        unit_cost: item.unit_cost
      });
      return acc;
    }, {} as Record<string, any[]>);

    // Créer une commande pour chaque fournisseur
    for (const [supplierId, items] of Object.entries(ordersBySupplier)) {
      await createOrder.mutateAsync({
        pharmacy_id: pharmacyId,
        supplier_id: supplierId !== 'default' ? supplierId : null,
        is_automatic: true,
        items
      });
    }

    setSelectedItems([]);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'A': return 'text-green-600 bg-green-50';
      case 'B': return 'text-blue-600 bg-blue-50';
      case 'C': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getVelocityIcon = (velocity: number) => {
    if (velocity > 2) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (velocity > 0.5) return <BarChart3 className="w-4 h-4 text-blue-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{metrics.totalItems}</p>
            <p className="text-sm text-muted-foreground">Total produits</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{metrics.lowStockItems}</p>
            <p className="text-sm text-muted-foreground">Stock faible</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{metrics.fastMovingItems}</p>
            <p className="text-sm text-muted-foreground">Rotation rapide</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingDown className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{metrics.slowMovingItems}</p>
            <p className="text-sm text-muted-foreground">Rotation lente</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{recommendations.length}</p>
            <p className="text-sm text-muted-foreground">À commander</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
          <TabsTrigger value="pareto">Analyse Pareto</TabsTrigger>
          <TabsTrigger value="rotation">Analyse de rotation</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Recommandations de commande
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectAll(recommendations)}
                  >
                    {recommendations.every(item => selectedItems.includes(item.id)) 
                      ? 'Tout désélectionner' 
                      : 'Tout sélectionner'}
                  </Button>
                  <Button
                    onClick={handleAutoOrder}
                    disabled={selectedItems.length === 0 || createOrder.isPending}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Commande automatique ({selectedItems.length})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((item) => (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedItems.includes(item.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => handleSelectItem(item.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{item.name}</h3>
                          <Badge variant="outline">{item.dosage}</Badge>
                          <Badge className={getCategoryColor(item.category)}>
                            Catégorie {item.category}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                          <div>
                            <p className="font-medium">Stock actuel</p>
                            <p className="text-lg font-bold text-foreground">{item.current_stock}</p>
                          </div>
                          <div>
                            <p className="font-medium">Stock minimum</p>
                            <p>{item.min_stock}</p>
                          </div>
                          <div>
                            <p className="font-medium">Quantité recommandée</p>
                            <p className="text-lg font-bold text-green-600">
                              {item.recommended_quantity}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Délai fournisseur</p>
                            <p>{item.supplier?.delivery_delay_days || 7} jours</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            {getVelocityIcon(item.sales_velocity)}
                            <span>Vélocité: {item.sales_velocity.toFixed(1)}/jour</span>
                          </div>
                          <div>
                            <span>Rotation: {item.rotation_rate.toFixed(1)}/an</span>
                          </div>
                          <div>
                            <span>Coût estimé: {(item.recommended_quantity * item.unit_cost).toLocaleString()} FCFA</span>
                          </div>
                        </div>

                        {item.supplier && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            Fournisseur: {item.supplier.name}
                          </div>
                        )}
                      </div>

                      <div className="ml-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="w-4 h-4"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {recommendations.length === 0 && (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune recommandation de commande</p>
                    <p className="text-sm text-muted-foreground">Votre stock est optimal</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pareto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analyse Pareto (80/20)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {paretoAnalysis.filter(item => item.category === 'A').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Catégorie A (80%)</div>
                      <div className="text-xs">Produits à forte rotation</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {paretoAnalysis.filter(item => item.category === 'B').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Catégorie B (15%)</div>
                      <div className="text-xs">Produits à rotation moyenne</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {paretoAnalysis.filter(item => item.category === 'C').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Catégorie C (5%)</div>
                      <div className="text-xs">Produits à faible rotation</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-3">
                  {paretoAnalysis.slice(0, 20).map((item, index) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="text-sm font-mono text-muted-foreground w-8">
                        #{index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{item.name}</span>
                          <Badge className={getCategoryColor(item.category)}>
                            {item.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Vélocité: {item.sales_velocity.toFixed(1)}/jour</span>
                          <span>Stock: {item.current_stock}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {item.sales_percentage.toFixed(1)}%
                        </div>
                        <Progress 
                          value={Math.min(item.sales_percentage, 100)} 
                          className="w-24 h-2" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rotation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Analyse de rotation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Résumé par catégorie de rotation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{metrics.fastMovingItems}</div>
                      <div className="text-sm text-muted-foreground">Rotation rapide (>6/an)</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">
                        {inventory.filter(item => item.rotation_rate >= 2 && item.rotation_rate <= 6).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Rotation normale (2-6/an)</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingDown className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{metrics.slowMovingItems}</div>
                      <div className="text-sm text-muted-foreground">Rotation lente (<2/an)</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Liste détaillée */}
                <div className="space-y-3">
                  {inventory
                    .sort((a, b) => b.rotation_rate - a.rotation_rate)
                    .slice(0, 20)
                    .map((item, index) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="text-sm font-mono text-muted-foreground w-8">
                          #{index + 1}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{item.name}</span>
                            <Badge variant="outline">{item.dosage}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Stock: {item.current_stock}</span>
                            <span>Vélocité: {item.sales_velocity.toFixed(1)}/jour</span>
                            {item.last_sale_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Dernière vente: {new Date(item.last_sale_date).toLocaleDateString('fr-FR')}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getVelocityIcon(item.sales_velocity)}
                          <div className="text-right">
                            <div className="font-bold">
                              {item.rotation_rate.toFixed(1)}/an
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.rotation_rate > 6 ? 'Rapide' : 
                               item.rotation_rate > 2 ? 'Normal' : 'Lent'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PharmacyStockOptimization;