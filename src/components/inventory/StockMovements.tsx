
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Search, ArrowUpDown, User, FileText, Plus } from 'lucide-react';

interface StockMovement {
  id: string;
  product: string;
  type: 'entrée' | 'sortie';
  quantity: number;
  reason: string;
  date: string;
  user: string;
}

interface StockMovementsProps {
  movements: StockMovement[];
}

const StockMovements: React.FC<StockMovementsProps> = ({ movements }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || movement.type === typeFilter;

    // Filtre par date (simplifié)
    let matchesDate = true;
    if (dateFilter === 'today') {
      const today = new Date().toDateString();
      matchesDate = new Date(movement.date).toDateString() === today;
    }

    return matchesSearch && matchesType && matchesDate;
  });

  const addStockMovement = () => {
    console.log('Ajouter un mouvement de stock');
    // Ici, vous ouvririez un modal pour ajouter un mouvement
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <ArrowUpDown className="w-5 h-5 text-blue-500" />
              <span>{t('inventory.movements.title')}</span>
            </CardTitle>
            <Button onClick={addStockMovement} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              {t('inventory.movements.new_movement')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={t('inventory.movements.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant={typeFilter === 'all' ? "default" : "outline"}
                onClick={() => setTypeFilter('all')}
                size="sm"
              >
                {t('inventory.movements.filters.all')}
              </Button>
              <Button
                variant={typeFilter === 'entrée' ? "default" : "outline"}
                onClick={() => setTypeFilter('entrée')}
                size="sm"
              >
                {t('inventory.movements.filters.entries')}
              </Button>
              <Button
                variant={typeFilter === 'sortie' ? "default" : "outline"}
                onClick={() => setTypeFilter('sortie')}
                size="sm"
              >
                {t('inventory.movements.filters.exits')}
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={dateFilter === 'today' ? "default" : "outline"}
                onClick={() => setDateFilter('today')}
                size="sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {t('inventory.movements.filters.today')}
              </Button>
              <Button
                variant={dateFilter === 'week' ? "default" : "outline"}
                onClick={() => setDateFilter('week')}
                size="sm"
              >
                {t('inventory.movements.filters.week')}
              </Button>
            </div>
          </div>

          {/* Liste des mouvements */}
          <div className="space-y-4">
            {filteredMovements.length === 0 ? (
              <div className="text-center py-8">
                <ArrowUpDown className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">{t('inventory.movements.empty')}</p>
              </div>
            ) : (
              filteredMovements.map((movement) => (
                <Card key={movement.id} className={`border-l-4 ${movement.type === 'entrée' ? 'border-l-green-500' : 'border-l-red-500'
                  }`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge variant={movement.type === 'entrée' ? 'default' : 'secondary'}>
                            {movement.type === 'entrée' ? `↗ ${t('inventory.movements.entry')}` : `↙ ${t('inventory.movements.exit')}`}
                          </Badge>
                          <h3 className="font-medium text-lg">{movement.product}</h3>
                          <span className="text-lg font-bold">
                            {movement.type === 'entrée' ? '+' : '-'}{movement.quantity}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">{t('inventory.movements.details.reason')}</span>
                            <p className="text-gray-600">{movement.reason}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <div>
                              <span className="font-medium text-gray-700">{t('inventory.movements.details.user')}</span>
                              <p className="text-gray-600">{movement.user}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <div>
                              <span className="font-medium text-gray-700">{t('inventory.movements.details.date')}</span>
                              <p className="text-gray-600">
                                {new Date(movement.date).toLocaleDateString('fr-FR')} à{' '}
                                {new Date(movement.date).toLocaleTimeString('fr-FR')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 flex flex-col space-y-2">
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4 mr-2" />
                          {t('invoices.details')}
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

export default StockMovements;
