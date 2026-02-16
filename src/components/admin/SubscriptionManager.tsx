import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Briefcase, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const SubscriptionManager = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const { data: plans, refetch } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: currentSubscription } = useQuery({
    queryKey: ['tenant-subscription'],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.tenant_id) return null;

      const { data, error } = await supabase
        .from('tenant_subscriptions')
        .select('*, subscription_plans(*)')
        .eq('tenant_id', profile.tenant_id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const handleUpgrade = async (planType: 'freemium' | 'individual' | 'professional' | 'enterprise') => {
    setLoading(planType);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.tenant_id) {
        toast.error('Tenant introuvable');
        return;
      }

      if (currentSubscription) {
        const { error } = await supabase
          .from('tenant_subscriptions')
          .update({ plan_type: planType, updated_at: new Date().toISOString() })
          .eq('tenant_id', profile.tenant_id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tenant_subscriptions')
          .insert([{ tenant_id: profile.tenant_id, plan_type: planType }]);
        if (error) throw error;
      }

      toast.success('Abonnement mis à jour avec succès');
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(null);
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'freemium': return <Zap className="w-6 h-6" />;
      case 'individual': return <Check className="w-6 h-6" />;
      case 'professional': return <Briefcase className="w-6 h-6" />;
      case 'enterprise': return <Building2 className="w-6 h-6" />;
      default: return <Check className="w-6 h-6" />;
    }
  };

  const isCurrentPlan = (planType: string) => 
    currentSubscription?.plan_type === planType;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestion des Abonnements</h2>
        <p className="text-muted-foreground">
          Choisissez le plan qui correspond à vos besoins
        </p>
      </div>

      {currentSubscription && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Abonnement Actuel</CardTitle>
            <CardDescription>
              Plan {currentSubscription.plan_type} - 
              {currentSubscription.status === 'active' ? ' Actif' : ' Inactif'}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans?.map((plan) => {
          const features = Array.isArray(plan.features) ? plan.features : [];
          return (
            <Card 
              key={plan.id}
              className={isCurrentPlan(plan.plan_type) ? 'border-primary' : ''}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getPlanIcon(plan.plan_type)}
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  {isCurrentPlan(plan.plan_type) && (
                    <Badge variant="default">Actuel</Badge>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">
                    {plan.price_monthly.toFixed(2)}€
                  </div>
                  <p className="text-sm text-muted-foreground">/mois</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ou {plan.price_yearly.toFixed(2)}€/an
                  </p>
                </div>

                <div className="space-y-2">
                  {plan.max_users && (
                    <div className="flex items-center text-sm">
                      <Check className="w-4 h-4 mr-2 text-primary" />
                      {plan.max_users} utilisateurs max
                    </div>
                  )}
                  {plan.max_patients && (
                    <div className="flex items-center text-sm">
                      <Check className="w-4 h-4 mr-2 text-primary" />
                      {plan.max_patients} patients max
                    </div>
                  )}
                  {features.map((feature: any, idx: number) => (
                    <div key={idx} className="flex items-center text-sm">
                      <Check className="w-4 h-4 mr-2 text-primary" />
                      {feature.name}
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleUpgrade(plan.plan_type)}
                  disabled={isCurrentPlan(plan.plan_type) || loading === plan.plan_type}
                  variant={isCurrentPlan(plan.plan_type) ? 'outline' : 'default'}
                >
                  {loading === plan.plan_type ? 'Traitement...' :
                   isCurrentPlan(plan.plan_type) ? 'Plan Actuel' : 'Sélectionner'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionManager;