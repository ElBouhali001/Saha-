
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Package, Edit, Trash2, Eye, Plus, Minus } from 'lucide-react';

const StockList = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const products = [
    {
      id: '1',
      name: 'Paracétamol 500mg',
      category: 'medications',
      currentStock: 150,
      minStock: 50,
      maxStock: 300,
      unitPrice: 250,
      supplier: 'Pharma CI',
      expiryDate: '2025-06-15',
      location: 'A-1-01',
      status: 'normal'
    },
    {
      id: '2',
      name: 'Amoxicilline 250mg',
      category: 'medications',
      currentStock: 25,
      minStock: 30,
      maxStock: 200,
      unitPrice: 450,
      supplier: 'Pharma CI',
      expiryDate: '2024-12-20',
      location: 'A-1-02',
      status: 'low'
    },
    {
      id: '3',
      name: 'Seringues 5ml',
      category: 'medical_equipment',
      currentStock: 0,
      minStock: 100,
      maxStock: 500,
      unitPrice: 125,
      supplier: 'MedEquip',
      expiryDate: '2026-03-10',
      location: 'B-2-01',
      status: 'out_of_stock'
    },
    {
      id: '4',
      name: 'Compresses stériles',
      category: 'medical_equipment',
      currentStock: 200,
      minStock: 100,
      maxStock: 400,
      unitPrice: 75,
      supplier: 'MedEquip',
      expiryDate: '2025-09-30',
      location: 'B-2-02',
      status: 'normal'
    },
    {
      id: '5',
      name: 'Ibuprofène 400mg',
      category: 'medications',
      currentStock: 80,
      minStock: 40,
      maxStock: 250,
      unitPrice: 350,
      supplier: 'Pharma CI',
      expiryDate: '2025-01-15',
      location: 'A-1-03',
      status: 'expiring_soon'
    }
  ];

  const categories = ['all', 'medications', 'medical_equipment', 'consumables'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal':
        return <Badge variant="default">{t('inventory.alerts.status.normal')}</Badge>;
      case 'low':
        return <Badge variant="secondary">{t('inventory.alerts.status.low')}</Badge>;
      case 'out_of_stock':
        return <Badge variant="destructive">{t('inventory.alerts.status.out_of_stock')}</Badge>;
      case 'expiring_soon':
        return <Badge variant="outline" className="border-orange-500 text-orange-600">{t('inventory.alerts.status.expiring_soon')}</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const handleStockAdjustment = (productId: string, adjustment: number) => {
    console.log(`Ajustement de stock pour ${productId}: ${adjustment}`);
    // Ici, vous intégreriez la logique d'ajustement de stock
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-500" />
            <span>{t('inventory.products.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={t('inventory.products.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={categoryFilter === category ? "default" : "outline"}
                  onClick={() => setCategoryFilter(category)}
                  size="sm"
                >
                  {t(`inventory.products.categories.${category}`)}
                </Button>
              ))}
            </div>
          </div>

          {/* Liste des produits */}
          <div className="space-y-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">{t('inventory.products.empty')}</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <Card key={product.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-lg">{product.name}</h3>
                          {getStatusBadge(product.status)}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">{t('inventory.products.details.category')}</span>
                            <p className="text-gray-600">{t(`inventory.products.categories.${product.category}`)}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">{t('inventory.products.details.current_stock')}</span>
                            <p className="text-gray-600">{product.currentStock} unités</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">{t('inventory.products.details.min_max')}</span>
                            <p className="text-gray-600">{product.minStock} / {product.maxStock}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">{t('inventory.products.details.unit_price')}</span>
                            <p className="text-gray-600">{product.unitPrice} FCFA</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">{t('inventory.products.details.supplier')}</span>
                            <p className="text-gray-600">{product.supplier}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">{t('inventory.products.details.expiry')}</span>
                            <p className="text-gray-600">
                              {new Date(product.expiryDate).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">{t('inventory.products.details.location')}</span>
                            <p className="text-gray-600">{product.location}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">{t('inventory.products.details.value')}</span>
                            <p className="text-gray-600">
                              {(product.currentStock * product.unitPrice).toLocaleString()} FCFA
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 flex flex-col space-y-2">
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStockAdjustment(product.id, -1)}
                            disabled={product.currentStock === 0}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStockAdjustment(product.id, 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          {t('inventory.products.actions.view')}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-2" />
                          {t('inventory.products.actions.edit')}
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t('inventory.products.actions.delete')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockList;
