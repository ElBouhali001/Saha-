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
  Users, 
  Plus, 
  Search,
  Star,
  Phone,
  Mail,
  Calendar,
  ShoppingCart,
  Gift,
  User,
  Edit
} from 'lucide-react';
import { usePharmacyCustomers } from '@/hooks/usePharmacyOfficina';

interface PharmacyCustomerRelationsProps {
  pharmacyId: string;
}

const PharmacyCustomerRelations: React.FC<PharmacyCustomerRelationsProps> = ({ pharmacyId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const { data: customers = [], isLoading } = usePharmacyCustomers(pharmacyId);

  const filteredCustomers = customers.filter(customer => {
    const searchMatch = customer.patient?.profile?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       customer.patient?.profile?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       customer.customer_number?.includes(searchTerm);
    
    const typeMatch = filterType === 'all' || 
                     (filterType === 'vip' && customer.is_vip) ||
                     (filterType === 'regular' && !customer.is_vip);
    
    return searchMatch && typeMatch;
  });

  const getCustomerTypeIcon = (customer: any) => {
    if (customer.is_vip) {
      return <Star className="w-4 h-4 text-yellow-500" />;
    }
    return <User className="w-4 h-4 text-blue-500" />;
  };

  const getCustomerTypeBadge = (customer: any) => {
    if (customer.is_vip) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">VIP</Badge>;
    }
    return <Badge variant="outline">Standard</Badge>;
  };

  const getLoyaltyLevel = (points: number) => {
    if (points >= 10000) return { level: 'Platine', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (points >= 5000) return { level: 'Or', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (points >= 1000) return { level: 'Argent', color: 'text-gray-600', bg: 'bg-gray-100' };
    return { level: 'Bronze', color: 'text-orange-600', bg: 'bg-orange-100' };
  };

  const openCustomerDetail = (customer: any) => {
    setSelectedCustomer(customer);
    setIsCustomerDialogOpen(true);
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      {/* En-tête et filtres */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Relation Client
            </CardTitle>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau client
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Type de client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les clients</SelectItem>
                <SelectItem value="vip">Clients VIP</SelectItem>
                <SelectItem value="regular">Clients standard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques clients */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{customers.length}</p>
            <p className="text-sm text-muted-foreground">Total clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{customers.filter(c => c.is_vip).length}</p>
            <p className="text-sm text-muted-foreground">Clients VIP</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <ShoppingCart className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {customers.reduce((sum, c) => sum + c.total_purchases, 0).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">CA total FCFA</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Gift className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {customers.reduce((sum, c) => sum + c.loyalty_points, 0).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Points fidélité</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des clients */}
      <div className="grid gap-4">
        {filteredCustomers.map((customer) => {
          const loyaltyLevel = getLoyaltyLevel(customer.loyalty_points);
          
          return (
            <Card key={customer.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6" onClick={() => openCustomerDetail(customer)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-full bg-muted">
                      {getCustomerTypeIcon(customer)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {customer.patient?.profile?.first_name} {customer.patient?.profile?.last_name}
                        </h3>
                        {getCustomerTypeBadge(customer)}
                        <Badge className={`${loyaltyLevel.bg} ${loyaltyLevel.color}`}>
                          {loyaltyLevel.level}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                        <div>
                          <p className="font-medium">Numéro client</p>
                          <p>{customer.customer_number || 'Non assigné'}</p>
                        </div>
                        <div>
                          <p className="font-medium">Total achats</p>
                          <p className="text-foreground font-semibold">
                            {customer.total_purchases.toLocaleString()} FCFA
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Points fidélité</p>
                          <p className="text-foreground font-semibold">
                            {customer.loyalty_points.toLocaleString()} pts
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        {customer.patient?.profile?.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{customer.patient.profile.phone}</span>
                          </div>
                        )}
                        
                        {customer.patient?.profile?.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span>{customer.patient.profile.email}</span>
                          </div>
                        )}
                        
                        {customer.last_purchase_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Dernier achat: {new Date(customer.last_purchase_date).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        )}
                      </div>

                      {customer.notes && (
                        <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                          <strong>Notes:</strong> {customer.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                    <Button variant="outline" size="sm">
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Historique
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {filteredCustomers.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun client trouvé</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog détail client */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détail du client</DialogTitle>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-full bg-muted">
                  {getCustomerTypeIcon(selectedCustomer)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-semibold">
                      {selectedCustomer.patient?.profile?.first_name} {selectedCustomer.patient?.profile?.last_name}
                    </h2>
                    {getCustomerTypeBadge(selectedCustomer)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Numéro client</p>
                      <p className="font-medium">{selectedCustomer.customer_number || 'Non assigné'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Membre depuis</p>
                      <p className="font-medium">
                        {new Date(selectedCustomer.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Statistiques d'achat</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Total des achats</p>
                      <p className="text-2xl font-bold">
                        {selectedCustomer.total_purchases.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Points de fidélité</p>
                      <p className="text-xl font-semibold text-purple-600">
                        {selectedCustomer.loyalty_points.toLocaleString()} pts
                      </p>
                    </div>
                    {selectedCustomer.last_purchase_date && (
                      <div>
                        <p className="text-sm text-muted-foreground">Dernier achat</p>
                        <p className="font-medium">
                          {new Date(selectedCustomer.last_purchase_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedCustomer.patient?.profile?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedCustomer.patient.profile.phone}</span>
                      </div>
                    )}
                    {selectedCustomer.patient?.profile?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedCustomer.patient.profile.email}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Méthode de contact préférée</p>
                      <p className="font-medium capitalize">{selectedCustomer.preferred_contact_method}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedCustomer.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedCustomer.notes}</p>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
                <Button>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Nouvelle vente
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PharmacyCustomerRelations;