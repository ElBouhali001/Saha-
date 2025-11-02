import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PricingSelectorProps {
  doctorId?: string;
  patientHasInsurance: boolean;
  selectedSpecialtyId?: string;
  onSpecialtyChange: (specialtyId: string) => void;
  onPriceCalculated: (price: number) => void;
}

const PricingSelector: React.FC<PricingSelectorProps> = ({
  doctorId,
  patientHasInsurance,
  selectedSpecialtyId,
  onSpecialtyChange,
  onPriceCalculated,
}) => {
  const { data: specialties } = useQuery({
    queryKey: ['medical-specialties-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_specialties')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: doctorRole } = useQuery({
    queryKey: ['doctor-structure-role', doctorId],
    queryFn: async () => {
      if (!doctorId) return null;
      const { data, error } = await supabase
        .from('doctor_structure_roles')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('is_active', true)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!doctorId,
  });

  const { data: customPricing } = useQuery({
    queryKey: ['doctor-custom-pricing', doctorId, selectedSpecialtyId],
    queryFn: async () => {
      if (!doctorId || !selectedSpecialtyId) return null;
      const pricingType = patientHasInsurance ? 'insurance' : 'reduced';
      const { data, error } = await supabase
        .from('doctor_pricing')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('specialty_id', selectedSpecialtyId)
        .eq('pricing_type', pricingType)
        .eq('is_active', true)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!doctorId && !!selectedSpecialtyId,
  });

  useEffect(() => {
    if (!selectedSpecialtyId) return;

    const selectedSpecialty = specialties?.find(s => s.id === selectedSpecialtyId);
    if (!selectedSpecialty) return;

    let basePrice = 0;

    // Use custom pricing if available
    if (customPricing) {
      basePrice = Number(customPricing.custom_fee);
    } else {
      // Use specialty default pricing
      basePrice = patientHasInsurance 
        ? Number(selectedSpecialty.insurance_fee)
        : Number(selectedSpecialty.reduced_fee);
    }

    // Apply doctor revenue share if configured
    if (doctorRole) {
      const doctorShare = (basePrice * Number(doctorRole.revenue_percentage)) / 100;
      onPriceCalculated(doctorShare);
    } else {
      onPriceCalculated(basePrice);
    }
  }, [selectedSpecialtyId, patientHasInsurance, customPricing, doctorRole, specialties, onPriceCalculated]);

  const getDisplayPrice = () => {
    if (!selectedSpecialtyId) return null;
    
    const selectedSpecialty = specialties?.find(s => s.id === selectedSpecialtyId);
    if (!selectedSpecialty) return null;

    const basePrice = customPricing
      ? Number(customPricing.custom_fee)
      : patientHasInsurance 
        ? Number(selectedSpecialty.insurance_fee)
        : Number(selectedSpecialty.reduced_fee);

    if (doctorRole) {
      const doctorShare = (basePrice * Number(doctorRole.revenue_percentage)) / 100;
      const structureShare = (basePrice * Number(doctorRole.structure_percentage)) / 100;
      
      return {
        base: basePrice,
        doctorShare,
        structureShare,
        percentage: Number(doctorRole.revenue_percentage),
      };
    }

    return { base: basePrice, doctorShare: basePrice, structureShare: 0, percentage: 100 };
  };

  const priceInfo = getDisplayPrice();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration Tarifaire</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Spécialité Médicale</Label>
          <Select value={selectedSpecialtyId} onValueChange={onSpecialtyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une spécialité" />
            </SelectTrigger>
            <SelectContent>
              {specialties?.map((specialty) => (
                <SelectItem key={specialty.id} value={specialty.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{specialty.name}</span>
                    <span className="ml-4 text-sm text-muted-foreground">
                      {patientHasInsurance 
                        ? `${specialty.insurance_fee}€` 
                        : `${specialty.reduced_fee}€`}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {priceInfo && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Type de Tarif:</span>
              <Badge variant={patientHasInsurance ? 'default' : 'secondary'}>
                {patientHasInsurance ? 'Homologué (Assuré)' : 'Réduit (Non assuré)'}
              </Badge>
            </div>
            
            {customPricing && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Tarif personnalisé appliqué pour ce médecin
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between text-sm">
              <span>Tarif Base:</span>
              <span className="font-semibold">{priceInfo.base.toFixed(2)}€</span>
            </div>

            {doctorRole && priceInfo.structureShare > 0 && (
              <>
                <div className="border-t pt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Part Médecin ({priceInfo.percentage}%):</span>
                    <span className="font-semibold text-primary">
                      {priceInfo.doctorShare.toFixed(2)}€
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Part Structure ({100 - priceInfo.percentage}%):</span>
                    <span className="font-semibold text-muted-foreground">
                      {priceInfo.structureShare.toFixed(2)}€
                    </span>
                  </div>
                </div>
              </>
            )}

            <div className="border-t pt-2">
              <div className="flex items-center justify-between">
                <span className="font-bold">Total Facturé:</span>
                <span className="text-lg font-bold text-primary">
                  {priceInfo.doctorShare.toFixed(2)}€
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PricingSelector;