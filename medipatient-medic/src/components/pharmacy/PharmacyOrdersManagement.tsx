import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ClipboardList, 
  Plus, 
  Search,
  Calendar,
  Truck,
  Package,
  Check,
  X,
  Clock,
  Building
} from 'lucide-react';
import { usePharmacyOrders, usePharmacySuppliers, usePharmacyInventory, useCreatePharmacyOrder } from '@/hooks/usePharmacyOfficina';

interface PharmacyOrdersManagementProps {
  pharmacyId: string;
}

interface OrderItem {
  inventory_id: string;
  inventory: any;
  quantity: number;
  unit_cost: number;
}

const PharmacyOrdersManagement: React.FC<PharmacyOrdersManagementProps> = ({ pharmacyId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  const { data: orders = [], isLoading } = usePharmacyOrders(pharmacyId);
  const { data: suppliers = [] } = usePharmacySuppliers();
  const { data: inventory = [] } = usePharmacyInventory(pharmacyId);
  const createOrder = useCreatePharmacyOrder();

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const availableProducts = inventory.filter(item => 
    !orderItems.some(orderItem => orderItem.inventory_id === item.id)
  );

  const addItemToOrder = () => {
    const product = inventory.find(item => item.id === selectedProduct);
    if (!product) return;

    const newItem: OrderItem = {
      inventory_id: product.id,
      inventory: product,
      quantity: Math.max(1, product.optimal_stock - product.current_stock),
      unit_cost: product.unit_cost
    };

    setOrderItems([...orderItems, newItem]);
    setSelectedProduct('');
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const updatedItems = [...orderItems];
    updatedItems[index].quantity = Math.max(1, quantity);
    setOrderItems(updatedItems);
  };

  const updateItemCost = (index: number, cost: number) => {
    const updatedItems = [...orderItems];
    updatedItems[index].unit_cost = Math.max(0, cost);
    setOrderItems(updatedItems);
  };

  const removeItemFromOrder = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.quantity * item.unit_cost), 0);
  };

  const handleCreateOrder = async () => {
    if (orderItems.length === 0 || !selectedSupplier) return;

    const supplier = suppliers.find(s => s.id === selectedSupplier);
    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + (supplier?.delivery_delay_days || 7));

    const orderData = {
      pharmacy_id: pharmacyId,
      supplier_id: selectedSupplier,
      expected_delivery_date: expectedDeliveryDate.toISOString().split('T')[0],
      total_amount: calculateTotal(),
      notes: orderNotes,
      items: orderItems.map(item => ({
        inventory_id: item.inventory_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost
      }))
    };

    await createOrder.mutateAsync(orderData);
    
    // Reset form
    setOrderItems([]);
    setSelectedSupplier('');
    setOrderNotes('');
    setIsNewOrderDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const statuses = {
      pending: { label: 'En attente', variant: 'secondary' as const, icon: Clock },
      sent: { label: 'Envoyée', variant: 'default' as const, icon: Truck },
      confirmed: { label: 'Confirmée', variant: 'outline' as const, icon: Check },
      delivered: { label: 'Livrée', variant: 'success' as const, icon: Package },
      cancelled: { label: 'Annulée', variant: 'destructive' as const, icon: X }
    };
    
    const config = statuses[status as keyof typeof statuses] || statuses.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      {/* En-tête et filtres */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Gestion des Commandes
            </CardTitle>
            <Dialog open={isNewOrderDialogOpen} onOpenChange={setIsNewOrderDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle commande
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nouvelle commande fournisseur</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Sélection du fournisseur */}
                  <div>
                    <Label htmlFor="supplier">Fournisseur</Label>
                    <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                      <SelectTrigger id="supplier">
                        <SelectValue placeholder="Sélectionner un fournisseur" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name} - Délai: {supplier.delivery_delay_days} jours
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sélection de produit */}
                  <div className="flex gap-2">
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Ajouter un produit" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - Stock: {product.current_stock} (Min: {product.min_stock})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={addItemToOrder} disabled={!selectedProduct}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Liste des articles */}
                  {orderItems.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Articles à commander</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {orderItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                              <div className="flex-1">
                                <p className="font-medium">{item.inventory.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.inventory.dosage} - Stock: {item.inventory.current_stock}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Label className="text-xs">Qté:</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateItemQuantity(index, parseInt(e.target.value))}
                                  className="w-20"
                                />
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Label className="text-xs">Coût unitaire:</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.unit_cost}
                                  onChange={(e) => updateItemCost(index, parseFloat(e.target.value))}
                                  className="w-24"
                                />
                              </div>
                              
                              <div className="text-right min-w-24">
                                <p className="font-medium">
                                  {(item.quantity * item.unit_cost).toLocaleString()} FCFA
                                </p>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItemFromOrder(index)}
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                          
                          <div className="border-t pt-3">
                            <div className="flex items-center justify-between text-lg font-bold">
                              <span>Total:</span>
                              <span>{calculateTotal().toLocaleString()} FCFA</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes">Notes de la commande (optionnel)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Remarques particulières..."
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsNewOrderDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleCreateOrder}
                      disabled={orderItems.length === 0 || !selectedSupplier || createOrder.isPending}
                    >
                      {createOrder.isPending ? 'En cours...' : 'Créer la commande'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une commande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="sent">Envoyée</SelectItem>
                <SelectItem value="confirmed">Confirmée</SelectItem>
                <SelectItem value="delivered">Livrée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des commandes */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-lg">{order.order_number}</h3>
                    {getStatusBadge(order.status)}
                    {order.is_automatic && (
                      <Badge variant="outline" className="text-xs">
                        Automatique
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      <span>Fournisseur: {order.supplier?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Commandé le: {new Date(order.order_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      <span>
                        Livraison prévue: {
                          order.expected_delivery_date 
                            ? new Date(order.expected_delivery_date).toLocaleDateString('fr-FR')
                            : 'Non définie'
                        }
                      </span>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="text-sm text-muted-foreground italic border-l-2 border-muted pl-3 mb-3">
                      {order.notes}
                    </div>
                  )}
                </div>
                
                <div className="text-right ml-4">
                  <p className="text-2xl font-bold">{order.total_amount.toLocaleString()} FCFA</p>
                  <p className="text-sm text-muted-foreground">
                    {order.order_items?.length || 0} article(s)
                  </p>
                </div>
              </div>

              {/* Détails des articles commandés */}
              {order.order_items && order.order_items.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Articles commandés
                  </h4>
                  <div className="space-y-2">
                    {order.order_items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex-1">
                          <p className="font-medium">{item.inventory?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qté commandée: {item.quantity_ordered}
                            {item.quantity_received > 0 && (
                              <span className="text-green-600 ml-2">
                                (Reçu: {item.quantity_received})
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{item.total_cost.toLocaleString()} FCFA</p>
                          <p className="text-sm text-muted-foreground">
                            {item.unit_cost.toLocaleString()} FCFA/unité
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                {order.status === 'pending' && (
                  <>
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                    <Button variant="destructive" size="sm">
                      Annuler
                    </Button>
                  </>
                )}
                {order.status === 'confirmed' && (
                  <Button size="sm">
                    <Check className="w-4 h-4 mr-2" />
                    Marquer comme livrée
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  Détails
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune commande trouvée</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PharmacyOrdersManagement;