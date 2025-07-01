
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, Shield, Activity, Plus, Settings } from 'lucide-react';
import { Tenant, TenantSecurityConfig } from '@/types/tenant';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { TenantSelector } from '@/components/tenant/TenantSelector';

export const TenantDashboard: React.FC = () => {
  const { tenant } = useTenant();
  const [securityConfig, setSecurityConfig] = useState<TenantSecurityConfig | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activePatients: 0,
    consultationsToday: 0,
    accessRequests: 0
  });

  useEffect(() => {
    if (tenant) {
      fetchSecurityConfig();
      fetchStats();
    }
  }, [tenant]);

  const fetchSecurityConfig = async () => {
    if (!tenant) return;

    try {
      const { data, error } = await supabase
        .from('tenant_security_configs')
        .select('*')
        .eq('tenant_id', tenant.id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de la config sécurité:', error);
        return;
      }

      setSecurityConfig(data);
    } catch (error) {
      console.error('Erreur lors de la récupération de la config sécurité:', error);
    }
  };

  const fetchStats = async () => {
    if (!tenant) return;

    try {
      // Définir le tenant courant
      await supabase.rpc('set_current_tenant', { tenant_id: tenant.id });

      // Récupérer les statistiques
      const [usersResult, patientsResult, appointmentsResult, requestsResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }).eq('tenant_id', tenant.id),
        supabase.from('patients').select('*', { count: 'exact' }).eq('tenant_id', tenant.id),
        supabase.from('appointments').select('*', { count: 'exact' })
          .eq('tenant_id', tenant.id)
          .eq('appointment_date', new Date().toISOString().split('T')[0]),
        supabase.from('patient_access_requests').select('*', { count: 'exact' })
          .eq('requesting_tenant_id', tenant.id)
          .eq('status', 'pending')
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        activePatients: patientsResult.count || 0,
        consultationsToday: appointmentsResult.count || 0,
        accessRequests: requestsResult.count || 0
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    }
  };

  if (!tenant) {
    return (
      <div className="p-6">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Aucune organisation sélectionnée
          </h2>
          <p className="text-gray-600 mb-4">
            Veuillez sélectionner une organisation pour continuer
          </p>
          <TenantSelector />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tableau de bord - {tenant.name}
          </h1>
          <p className="text-gray-600">
            Gestion multi-tenant pour {tenant.subdomain}.medipatient.com
          </p>
        </div>
        <TenantSelector />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              / {tenant.subscription_seats} sièges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patients actifs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePatients}</div>
            <p className="text-xs text-muted-foreground">
              Dossiers gérés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultations aujourd'hui</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.consultationsToday}</div>
            <p className="text-xs text-muted-foreground">
              Rendez-vous planifiés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demandes d'accès</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accessRequests}</div>
            <p className="text-xs text-muted-foreground">
              En attente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="patients">Patients partagés</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations de l'organisation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Plan d'abonnement</span>
                  <Badge variant="outline" className="capitalize">
                    {tenant.subscription_plan}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Statut</span>
                  <Badge variant={tenant.subscription_status === 'active' ? 'default' : 'destructive'}>
                    {tenant.subscription_status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sous-domaine</span>
                  <span className="text-sm text-gray-600">{tenant.subdomain}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Créé le</span>
                  <span className="text-sm text-gray-600">
                    {new Date(tenant.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuration de sécurité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {securityConfig ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Authentification MFA</span>
                      <Badge variant={securityConfig.mfa_required ? 'default' : 'secondary'}>
                        {securityConfig.mfa_required ? 'Activée' : 'Désactivée'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Audit des actions</span>
                      <Badge variant={securityConfig.audit_enabled ? 'default' : 'secondary'}>
                        {securityConfig.audit_enabled ? 'Activé' : 'Désactivé'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tentatives maximales</span>
                      <span className="text-sm text-gray-600">{securityConfig.max_failed_attempts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Timeout de session</span>
                      <span className="text-sm text-gray-600">{securityConfig.session_timeout} min</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-600">Chargement...</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de sécurité</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Configuration avancée de la sécurité - Fonctionnalité à implémenter
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des patients partagés</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Interface de gestion des dossiers patients partagés - Fonctionnalité à implémenter
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de l'organisation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Paramètres généraux de l'organisation - Fonctionnalité à implémenter
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
