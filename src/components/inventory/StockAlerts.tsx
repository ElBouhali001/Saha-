
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ShoppingCart, Bell, Package } from 'lucide-react';

interface CriticalItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  status: 'critical' | 'low' | 'out_of_stock';
}

interface StockAlertsProps {
  criticalItems: CriticalItem[];
}

const StockAlerts: React.FC<StockAlertsProps> = ({ criticalItems }) => {
  const { t } = useTranslation();

  const handleOrder = (productId: string) => {
    console.log(`Commander le produit ${productId}`);
    // Ici, vous intégreriez la logique de commande
  };

  const getAlertLevel = (item: CriticalItem) => {
    if (item.status === 'out_of_stock') {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: AlertTriangle,
        badge: 'destructive' as const,
        label: t('inventory.alerts.status.out_of_stock')
      };
    } else if (item.status === 'critical') {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: AlertTriangle,
        badge: 'destructive' as const,
        label: t('inventory.alerts.status.critical')
      };
    } else {
      return {
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: Bell,
        badge: 'secondary' as const,
        label: t('inventory.alerts.status.low')
      };
    }
  };

  const sortedItems = [...criticalItems].sort((a, b) => {
    const order = { 'out_of_stock': 0, 'critical': 1, 'low': 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>{t('inventory.alerts.title')}</span>
            <Badge variant="destructive" className="ml-2">
              {criticalItems.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {criticalItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">{t('inventory.alerts.empty')}</p>
              <p className="text-sm text-gray-400">{t('inventory.alerts.all_normal')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedItems.map((item) => {
                const alert = getAlertLevel(item);
                const Icon = alert.icon;

                return (
                  <Card key={item.id} className={`${alert.bgColor} ${alert.borderColor} border-2`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <Icon className={`w-5 h-5 ${alert.color}`} />
                            <h3 className="font-medium text-lg">{item.name}</h3>
                            <Badge variant={alert.badge}>
                              {alert.label}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <span className="font-medium text-gray-700">{t('inventory.alerts.current_stock', { count: item.currentStock })}</span>
                              <p className={`text-lg font-bold ${alert.color}`}>
                                {item.currentStock} unités
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">{t('inventory.alerts.min_stock', { count: item.minStock })}</span>
                              <p className="text-lg font-medium text-gray-600">
                                {item.minStock} unités
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">{t('inventory.alerts.missing_quantity', { count: Math.max(0, item.minStock - item.currentStock) })}</span>
                              <p className="text-lg font-bold text-red-600">
                                {Math.max(0, item.minStock - item.currentStock)} unités
                              </p>
                            </div>
                          </div>

                          {item.status === 'out_of_stock' && (
                            <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                              <p className="text-sm text-red-800 font-medium">
                                {t('inventory.alerts.warning_out_of_stock')}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="ml-4 flex flex-col space-y-2">
                          <Button
                            onClick={() => handleOrder(item.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                            size="sm"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {t('inventory.actions.order')}
                          </Button>
                          <Button variant="outline" size="sm">
                            Modifier Seuil
                          </Button>
                          <Button variant="outline" size="sm">
                            Historique
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>{t('inventory.actions.quick_actions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <ShoppingCart className="w-6 h-6" />
              <span>{t('inventory.actions.order_all')}</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <Bell className="w-6 h-6" />
              <span>{t('inventory.actions.configure_alerts')}</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <Package className="w-6 h-6" />
              <span>{t('inventory.actions.stock_report')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockAlerts;
