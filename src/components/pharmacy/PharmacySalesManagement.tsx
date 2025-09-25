import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Calendar,
  CreditCard,
  Receipt,
  User,
  Pill,
  Trash2,
  Calculator
} from 'lucide-react';
import { usePharmacySales, usePharmacyInventory, useCreatePharmacySale } from '@/hooks/usePharmacyOfficina';

interface PharmacySalesManagementProps {
  pharmacyId: string;
}

interface SaleItem {
  inventory_id: string;
  inventory: any;
  quantity: number;
  unit_price: number;
}

const PharmacySalesManagement: React.FC<PharmacySalesManagementProps> = ({ pharmacyId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewSaleDialogOpen, setIsNewSaleDialogOpen] = useState(false);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerInfo, setCustomerInfo] = useState('');

  const { data: sales = [], isLoading } = usePharmacySales(pharmacyId);
  const { data: inventory = [] } = usePharmacyInventory(pharmacyId);
  const createSale = useCreatePharmacySale();

  const filteredSales = sales.filter(sale =>
    sale.sale_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customerInfo && customerInfo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const availableProducts = inventory.filter(item => 
    item.current_stock > 0 && 
    !saleItems.some(saleItem => saleItem.inventory_id === item.id)
  );

  const addItemToSale = () => {
    const product = inventory.find(item => item.id === selectedProduct);
    if (!product) return;

    const newItem: SaleItem = {
      inventory_id: product.id,
      inventory: product,
      quantity: 1,
      unit_price: product.selling_price
    };

    setSaleItems([...saleItems, newItem]);
    setSelectedProduct('');
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const updatedItems = [...saleItems];
    updatedItems[index].quantity = Math.max(1, Math.min(quantity, updatedItems[index].inventory.current_stock));
    setSaleItems(updatedItems);
  };

  const updateItemPrice = (index: number, price: number) => {
    const updatedItems = [...saleItems];
    updatedItems[index].unit_price = Math.max(0, price);
    setSaleItems(updatedItems);
  };

  const removeItemFromSale = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return saleItems.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  };

  const handleCreateSale = async () => {
    if (saleItems.length === 0) return;

    const saleData = {
      pharmacy_id: pharmacyId,
      payment_method: paymentMethod,
      total_amount: calculateTotal(),
      items: saleItems.map(item => ({
        inventory_id: item.inventory_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }))
    };

    await createSale.mutateAsync(saleData);
    
    // Reset form
    setSaleItems([]);
    setPaymentMethod('cash');
    setCustomerInfo('');
    setIsNewSaleDialogOpen(false);
  };

  const getPaymentMethodBadge = (method: string) => {
    const methods = {
      cash: { label: 'Espèces', variant: 'default' as const },
      card: { label: 'Carte', variant: 'secondary' as const },
      mobile_money: { label: 'Mobile Money', variant: 'outline' as const },
      insurance: { label: 'Assurance', variant: 'success' as const }
    };
    
    const config = methods[method as keyof typeof methods] || methods.cash;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      {/* En-tête et actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Gestion des Ventes
            </CardTitle>
            <Dialog open={isNewSaleDialogOpen} onOpenChange={setIsNewSaleDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle vente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nouvelle vente</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Sélection de produit */}
                  <div className="flex gap-2">
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Sélectionner un produit" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - {product.dosage} (Stock: {product.current_stock})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={addItemToSale} disabled={!selectedProduct}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Liste des articles */}
                  {saleItems.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Articles sélectionnés</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {saleItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                              <div className="flex-1">
                                <p className="font-medium">{item.inventory.name}</p>
                                <p className="text-sm text-muted-foreground">{item.inventory.dosage}</p>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Label className="text-xs">Qté:</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max={item.inventory.current_stock}
                                  value={item.quantity}
                                  onChange={(e) => updateItemQuantity(index, parseInt(e.target.value))}
                                  className="w-20"
                                />
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Label className="text-xs">Prix:</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.unit_price}
                                  onChange={(e) => updateItemPrice(index, parseFloat(e.target.value))}
                                  className="w-24"
                                />
                              </div>
                              
                              <div className="text-right min-w-20">
                                <p className="font-medium">
                                  {(item.quantity * item.unit_price).toLocaleString()} FCFA
                                </p>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItemFromSale(index)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
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

                  {/* Informations de paiement */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="payment-method">Mode de paiement</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger id="payment-method">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Espèces</SelectItem>
                          <SelectItem value="card">Carte bancaire</SelectItem>
                          <SelectItem value="mobile_money">Mobile Money</SelectItem>
                          <SelectItem value="insurance">Assurance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="customer-info">Informations client (optionnel)</Label>
                      <Input
                        id="customer-info"
                        placeholder="Nom du client ou numéro de téléphone"
                        value={customerInfo}
                        onChange={(e) => setCustomerInfo(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsNewSaleDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleCreateSale}
                      disabled={saleItems.length === 0 || createSale.isPending}
                    >
                      {createSale.isPending ? 'En cours...' : 'Finaliser la vente'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une vente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des ventes */}
      <div className="space-y-4">
        {filteredSales.map((sale) => (
          <Card key={sale.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-lg">{sale.sale_number}</h3>
                    {getPaymentMethodBadge(sale.payment_method)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(sale.sale_date).toLocaleDateString('fr-FR')}</span>
                      <span>{new Date(sale.sale_date).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}</span>
                    </div>
                    
                    {sale.customer_id && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>Client enregistré</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold">{sale.total_amount.toLocaleString()} FCFA</p>
                  <p className="text-sm text-muted-foreground">
                    {sale.sale_items?.length || 0} article(s)
                  </p>
                </div>
              </div>

              {/* Détails des articles vendus */}
              {sale.sale_items && sale.sale_items.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Pill className="w-4 h-4" />
                    Articles vendus
                  </h4>
                  <div className="space-y-2">
                    {sale.sale_items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex-1">
                          <p className="font-medium">{item.inventory?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.inventory?.dosage} - Qté: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{item.total_price.toLocaleString()} FCFA</p>
                          <p className="text-sm text-muted-foreground">
                            {item.unit_price.toLocaleString()} FCFA/unité
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {filteredSales.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune vente trouvée</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PharmacySalesManagement;