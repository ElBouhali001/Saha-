
import React, { useState } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Clock, Key, FileText, Users } from 'lucide-react';
import { toast } from 'sonner';

const TenantSettings = () => {
  const { currentTenant, tenantConfig } = useTenant();
  const [isLoading, setIsLoading] = useState(false);

  if (!currentTenant || !tenantConfig) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">Chargement...</h3>
          <p className="text-gray-600">Configuration du tenant en cours de chargement</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Ici on ajouterait la logique de sauvegarde
      toast.success('Configuration sauvegardée');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configuration Tenant</h2>
        <p className="text-gray-600">
          Gérez la sécurité et les paramètres de votre organisation
        </p>
      </div>

      {/* Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Informations Générales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nom de l'organisation</Label>
              <p className="text-lg font-semibold">{currentTenant.name}</p>
            </div>
            <div>
              <Label>Sous-domaine</Label>
              <p className="font-mono text-sm">{currentTenant.subdomain}.medipatient.com</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Plan d'abonnement</Label>
              <Badge variant="default" className="mt-1">
                {currentTenant.subscription_plan}
              </Badge>
            </div>
            <div>
              <Label>Statut</Label>
              <Badge 
                variant={currentTenant.subscription_status === 'active' ? 'default' : 'destructive'}
                className="mt-1"
              >
                {currentTenant.subscription_status}
              </Badge>
            </div>
            <div>
              <Label>Utilisateurs max</Label>
              <p className="text-lg font-semibold">{currentTenant.subscription_seats}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sécurité et authentification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Sécurité et Authentification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Authentification multi-facteurs</Label>
                  <p className="text-sm text-gray-600">Exiger MFA pour tous les utilisateurs</p>
                </div>
                <Switch checked={tenantConfig.mfa_required} />
              </div>
              
              <div>
                <Label>Types MFA autorisés</Label>
                <div className="flex gap-2 mt-2">
                  {tenantConfig.mfa_types.map(type => (
                    <Badge key={type} variant="outline">{type}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Timeout de session (minutes)</Label>
                <Input 
                  type="number" 
                  value={tenantConfig.session_timeout} 
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Tentatives de connexion max</Label>
                <Input 
                  type="number" 
                  value={tenantConfig.max_failed_attempts} 
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-base">Politique de mot de passe</Label>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <Label>Longueur minimale</Label>
                <Input 
                  type="number" 
                  value={tenantConfig.password_min_length} 
                  className="mt-1"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch checked={tenantConfig.password_require_uppercase} />
                  <Label>Majuscules requises</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={tenantConfig.password_require_numbers} />
                  <Label>Chiffres requis</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={tenantConfig.password_require_special_chars} />
                  <Label>Caractères spéciaux requis</Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chiffrement et audit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Chiffrement et Audit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Audit activé</Label>
              <p className="text-sm text-gray-600">Enregistrer les actions des utilisateurs</p>
            </div>
            <Switch checked={tenantConfig.audit_enabled} />
          </div>

          <div>
            <Label>Rétention des logs (jours)</Label>
            <Input 
              type="number" 
              value={tenantConfig.audit_retention_days} 
              className="mt-1 max-w-xs"
            />
          </div>

          <div>
            <Label>Champs chiffrés</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {tenantConfig.encrypted_fields.map(field => (
                <Badge key={field} variant="secondary">{field}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline">
          Réinitialiser
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>
    </div>
  );
};

export default TenantSettings;
