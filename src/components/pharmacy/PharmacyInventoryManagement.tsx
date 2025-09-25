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
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  Calendar,
  MapPin,
  Edit,
  BarChart3,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { usePharmacyInventory, usePharmacyDrugFamilies, usePharmacySuppliers, useUpdatePharmacyStock } from '@/hooks/usePharmacyOfficina';

interface PharmacyInventoryManagementProps {
  pharmacyId: string;
}

const PharmacyInventoryManagement: React.FC<PharmacyInventoryManagementProps> = ({ pharmacyId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFamily, setFilterFamily] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data: inventory = [], isLoading } = usePharmacyInventory(pharmacyId);
  const { data: drugFamilies = [] } = usePharmacyDrugFamilies();
  const { data: suppliers = [] } = usePharmacySuppliers();
  const updateStock = useUpdatePharmacyStock();

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.generic_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFamily = filterFamily === 'all' || item.drug_family_id === filterFamily;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'low' && item.current_stock <= item.min_stock) ||
                         (filterStatus === 'out' && item.current_stock === 0) ||
                         (filterStatus === 'normal' && item.current_stock > item.min_stock);
    
    return matchesSearch && matchesFamily && matchesStatus;
  });

  const getStockStatus = (item: any) => {
    if (item.current_stock === 0) return { status: 'out', label: 'Rupture', variant: 'destructive' as const };
    if (item.current_stock <= item.min_stock) return { status: 'low', label: 'Stock faible', variant: 'secondary' as const };
    return { status: 'normal', label: 'Normal', variant: 'outline' as const };
  };

  const getExpiryStatus = (expiryDate: string) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    if (expiry < now) return { label: 'Expiré', variant: 'destructive' as const };
    if (expiry <= thirtyDaysFromNow) return { label: 'Expire bientôt', variant: 'secondary' as const };
    return null;
  };

  const handleStockMovement = (item: any, type: 'entrée' | 'sortie') => {
    setSelectedItem({ ...item, movementType: type });
    setIsMovementDialogOpen(true);
  };

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const quantity = parseInt(formData.get('quantity') as string);
    const reason = formData.get('reason') as string;

    await updateStock.mutateAsync({
      inventoryId: selectedItem.id,
      quantity,
      movementType: selectedItem.movementType,
      reason
    });

    setIsMovementDialogOpen(false);
    setSelectedItem(null);
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      {/* En-tête et filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Gestion du Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un médicament..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterFamily} onValueChange={setFilterFamily}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Famille" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les familles</SelectItem>
                {drugFamilies.map((family) => (
                  <SelectItem key={family.id} value={family.id}>
                    {family.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="normal">Stock normal</SelectItem>
                <SelectItem value="low">Stock faible</SelectItem>
                <SelectItem value="out">Rupture</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau produit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau produit</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Fonctionnalité en cours de développement
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Liste des produits */}
      <div className="grid gap-4">
        {filteredInventory.map((item) => {
          const stockStatus = getStockStatus(item);
          const expiryStatus = getExpiryStatus(item.expiry_date);
          
          return (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          {item.generic_name && (
                            <Badge variant="outline" className="text-xs">
                              {item.generic_name}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                          <div>
                            <p className="font-medium">Dosage</p>
                            <p>{item.dosage}</p>
                          </div>
                          <div>
                            <p className="font-medium">Forme</p>
                            <p>{item.form}</p>
                          </div>
                          <div>
                            <p className="font-medium">Famille</p>
                            <p>{item.drug_family?.name || 'N/A'}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <p>{item.shelf_location || 'Non défini'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <Badge variant={stockStatus.variant}>
                            {stockStatus.label}
                          </Badge>
                          
                          {expiryStatus && (
                            <Badge variant={expiryStatus.variant} className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {expiryStatus.label}
                            </Badge>
                          )}
                          
                          {item.is_parapharmacy && (
                            <Badge variant="outline">Parapharmacie</Badge>
                          )}
                          
                          {!item.is_prescription_required && (
                            <Badge variant="outline">Vente libre</Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Stock actuel</p>
                            <p className="font-bold text-lg">{item.current_stock}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Stock min</p>
                            <p className="font-medium">{item.min_stock}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Prix d'achat</p>
                            <p className="font-medium">{item.unit_cost} FCFA</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Prix de vente</p>
                            <p className="font-medium">{item.selling_price} FCFA</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Rotation</p>
                            <div className="flex items-center gap-1">
                              {item.rotation_rate > 6 ? (
                                <TrendingUp className="w-3 h-3 text-green-500" />
                              ) : item.rotation_rate < 2 ? (
                                <TrendingDown className="w-3 h-3 text-red-500" />
                              ) : (
                                <BarChart3 className="w-3 h-3 text-blue-500" />
                              )}
                              <p className="font-medium">{item.rotation_rate.toFixed(1)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStockMovement(item, 'entrée')}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Entrée
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStockMovement(item, 'sortie')}
                    >
                      <Package className="w-4 h-4 mr-1" />
                      Sortie
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {item.expiry_date && (
                  <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Expire le {new Date(item.expiry_date).toLocaleDateString('fr-FR')}</span>
                      {item.batch_number && (
                        <span className="ml-4">Lot: {item.batch_number}</span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        
        {filteredInventory.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun produit trouvé</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog pour mouvement de stock */}
      <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.movementType === 'entrée' ? 'Entrée de stock' : 'Sortie de stock'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <form onSubmit={handleMovementSubmit} className="space-y-4">
              <div>
                <Label>Produit</Label>
                <p className="text-sm font-medium">{selectedItem.name}</p>
                <p className="text-xs text-muted-foreground">
                  Stock actuel: {selectedItem.current_stock}
                </p>
              </div>
              
              <div>
                <Label htmlFor="quantity">Quantité</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  required
                  placeholder="Entrez la quantité"
                />
              </div>
              
              <div>
                <Label htmlFor="reason">Motif</Label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="Motif du mouvement (optionnel)"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsMovementDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={updateStock.isPending}>
                  {updateStock.isPending ? 'En cours...' : 'Confirmer'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PharmacyInventoryManagement;