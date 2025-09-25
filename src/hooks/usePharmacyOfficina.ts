import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Hook pour les familles de médicaments
export const usePharmacyDrugFamilies = () => {
  return useQuery({
    queryKey: ['pharmacy-drug-families'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pharmacy_drug_families')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });
};

// Hook pour les fournisseurs
export const usePharmacySuppliers = () => {
  return useQuery({
    queryKey: ['pharmacy-suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pharmacy_suppliers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
  });
};

// Hook pour l'inventaire pharmacie
export const usePharmacyInventory = (pharmacyId?: string) => {
  return useQuery({
    queryKey: ['pharmacy-inventory', pharmacyId],
    queryFn: async () => {
      let query = supabase
        .from('pharmacy_inventory')
        .select(`
          *,
          drug_family:pharmacy_drug_families(*),
          supplier:pharmacy_suppliers(*)
        `)
        .order('name');

      if (pharmacyId) {
        query = query.eq('pharmacy_id', pharmacyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!pharmacyId,
  });
};

// Hook pour les produits en rupture de stock
export const usePharmacyStockAlerts = (pharmacyId?: string) => {
  return useQuery({
    queryKey: ['pharmacy-stock-alerts', pharmacyId],
    queryFn: async () => {
      let query = supabase
        .from('pharmacy_inventory')
        .select(`
          *,
          drug_family:pharmacy_drug_families(*),
          supplier:pharmacy_suppliers(*)
        `)
        .or('current_stock.lte.min_stock,expiry_date.lt.now()')
        .order('current_stock', { ascending: true });

      if (pharmacyId) {
        query = query.eq('pharmacy_id', pharmacyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!pharmacyId,
  });
};

// Hook pour les ventes
export const usePharmacySales = (pharmacyId?: string) => {
  return useQuery({
    queryKey: ['pharmacy-sales', pharmacyId],
    queryFn: async () => {
      let query = supabase
        .from('pharmacy_sales')
        .select(`
          *,
          pharmacy:pharmacies(*),
          sale_items:pharmacy_sale_items(
            *,
            inventory:pharmacy_inventory(*)
          )
        `)
        .order('sale_date', { ascending: false });

      if (pharmacyId) {
        query = query.eq('pharmacy_id', pharmacyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!pharmacyId,
  });
};

// Hook pour les commandes
export const usePharmacyOrders = (pharmacyId?: string) => {
  return useQuery({
    queryKey: ['pharmacy-orders', pharmacyId],
    queryFn: async () => {
      let query = supabase
        .from('pharmacy_orders')
        .select(`
          *,
          supplier:pharmacy_suppliers(*),
          order_items:pharmacy_order_items(
            *,
            inventory:pharmacy_inventory(*)
          )
        `)
        .order('order_date', { ascending: false });

      if (pharmacyId) {
        query = query.eq('pharmacy_id', pharmacyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!pharmacyId,
  });
};

// Hook pour les clients
export const usePharmacyCustomers = (pharmacyId?: string) => {
  return useQuery({
    queryKey: ['pharmacy-customers', pharmacyId],
    queryFn: async () => {
      let query = supabase
        .from('pharmacy_customers')
        .select(`
          *,
          patient:patients(
            *,
            profile:profiles(*)
          )
        `)
        .order('total_purchases', { ascending: false });

      if (pharmacyId) {
        query = query.eq('pharmacy_id', pharmacyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!pharmacyId,
  });
};

// Hook pour créer une vente
export const useCreatePharmacySale = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (saleData: any) => {
      // Générer le numéro de vente
      const { data: saleNumber } = await supabase.rpc('generate_pharmacy_sale_number');
      
      // Créer la vente
      const { data: sale, error: saleError } = await supabase
        .from('pharmacy_sales')
        .insert({
          ...saleData,
          sale_number: saleNumber
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Créer les items de vente
      const saleItems = saleData.items.map((item: any) => ({
        sale_id: sale.id,
        pharmacy_inventory_id: item.inventory_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price
      }));

      const { error: itemsError } = await supabase
        .from('pharmacy_sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-sales'] });
      queryClient.invalidateQueries({ queryKey: ['pharmacy-inventory'] });
      toast({
        title: "Succès",
        description: "Vente enregistrée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'enregistrement de la vente",
        variant: "destructive",
      });
    },
  });
};

// Hook pour créer une commande
export const useCreatePharmacyOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (orderData: any) => {
      // Générer le numéro de commande
      const { data: orderNumber } = await supabase.rpc('generate_pharmacy_order_number');
      
      // Créer la commande
      const { data: order, error: orderError } = await supabase
        .from('pharmacy_orders')
        .insert({
          ...orderData,
          order_number: orderNumber
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Créer les items de commande
      const orderItems = orderData.items.map((item: any) => ({
        order_id: order.id,
        pharmacy_inventory_id: item.inventory_id,
        quantity_ordered: item.quantity,
        unit_cost: item.unit_cost,
        total_cost: item.quantity * item.unit_cost
      }));

      const { error: itemsError } = await supabase
        .from('pharmacy_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-orders'] });
      toast({
        title: "Succès",
        description: "Commande créée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de la commande",
        variant: "destructive",
      });
    },
  });
};

// Hook pour l'optimisation du stock
export const useStockOptimization = (pharmacyId?: string) => {
  return useQuery({
    queryKey: ['stock-optimization', pharmacyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pharmacy_inventory')
        .select(`
          *,
          drug_family:pharmacy_drug_families(*),
          supplier:pharmacy_suppliers(*)
        `)
        .eq('pharmacy_id', pharmacyId)
        .order('rotation_rate', { ascending: false });

      if (error) throw error;

      // Analyse Pareto (80/20)
      const totalSales = data.reduce((sum, item) => sum + (item.sales_velocity * 30), 0);
      let cumulativeSales = 0;
      const paretoAnalysis = data.map(item => {
        const itemSales = item.sales_velocity * 30;
        cumulativeSales += itemSales;
        const percentage = (cumulativeSales / totalSales) * 100;
        return {
          ...item,
          sales_percentage: percentage,
          category: percentage <= 80 ? 'A' : percentage <= 95 ? 'B' : 'C'
        };
      });

      // Recommandations de commande
      const recommendations = paretoAnalysis
        .filter(item => item.current_stock <= item.min_stock || 
                      (item.sales_velocity > 0 && 
                       item.current_stock <= (item.sales_velocity * item.supplier?.delivery_delay_days || 7)))
        .map(item => ({
          ...item,
          recommended_quantity: Math.max(
            item.optimal_stock - item.current_stock,
            Math.ceil(item.sales_velocity * ((item.supplier?.delivery_delay_days || 7) + 7))
          )
        }));

      return {
        inventory: data,
        paretoAnalysis,
        recommendations,
        metrics: {
          totalItems: data.length,
          lowStockItems: data.filter(item => item.current_stock <= item.min_stock).length,
          outOfStockItems: data.filter(item => item.current_stock === 0).length,
          fastMovingItems: data.filter(item => item.rotation_rate > 6).length,
          slowMovingItems: data.filter(item => item.rotation_rate < 2).length,
        }
      };
    },
    enabled: !!pharmacyId,
  });
};

// Hook pour mettre à jour le stock
export const useUpdatePharmacyStock = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ inventoryId, quantity, movementType, reason }: {
      inventoryId: string;
      quantity: number;
      movementType: string;
      reason?: string;
    }) => {
      // Mettre à jour le stock
      const { data: inventory, error: updateError } = await supabase
        .from('pharmacy_inventory')
        .update({
          current_stock: movementType === 'entrée' 
            ? supabase.raw('current_stock + ?', [quantity])
            : supabase.raw('current_stock - ?', [quantity]),
          updated_at: new Date().toISOString()
        })
        .eq('id', inventoryId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Créer le mouvement de stock
      const { error: movementError } = await supabase
        .from('pharmacy_stock_movements')
        .insert({
          pharmacy_inventory_id: inventoryId,
          movement_type: movementType,
          quantity: movementType === 'entrée' ? quantity : -quantity,
          reason: reason || `${movementType} manuelle`
        });

      if (movementError) throw movementError;

      return inventory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['pharmacy-stock-alerts'] });
      toast({
        title: "Succès",
        description: "Stock mis à jour avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du stock",
        variant: "destructive",
      });
    },
  });
};