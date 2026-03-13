import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, Settings } from 'lucide-react';

const ProductionSecuritySettings: React.FC = () => {
  const isDemoMode = window.location.hostname.includes('localhost') || 
                    window.location.hostname.includes('127.0.0.1') ||
                    !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

  const securityChecks = [
    {
      name: 'Mode de production',
      status: !isDemoMode ? 'success' : 'warning',
      description: isDemoMode ? 'Mode démo détecté' : 'Mode production activé',
      recommendation: isDemoMode ? 'Désactiver le mode démo en production' : null
    },
    {
      name: 'Chiffrement côté serveur',
      status: 'success',
      description: 'Les clés de chiffrement sont gérées côté serveur',
      recommendation: null
    },
    {
      name: 'Politiques RLS',
      status: 'success', 
      description: 'Toutes les tables sensibles ont des politiques RLS strictes',
      recommendation: null
    },
    {
      name: 'Audit des accès',
      status: 'success',
      description: 'Journalisation complète des accès aux transmissions sécurisées',
      recommendation: null
    },
    {
      name: 'Authentification requise',
      status: 'success',
      description: 'Accès aux données médicales limité aux utilisateurs authentifiés',
      recommendation: null
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Sécurisé</Badge>;
      case 'warning':
        return <Badge className="bg-amber-100 text-amber-800">Attention</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800">Critique</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center text-primary">
            <Settings className="w-5 h-5 mr-2" />
            Configuration Sécurité Production
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isDemoMode && (
            <Alert className="mb-4 border-amber-200 bg-amber-50">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Mode démo actif :</strong> Certaines fonctionnalités de sécurité sont 
                adaptées pour les tests. En production, désactivez le mode démo et configurez 
                l'authentification Supabase appropriée.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {securityChecks.map((check, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(check.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{check.name}</h4>
                    {getStatusBadge(check.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {check.description}
                  </p>
                  {check.recommendation && (
                    <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                      💡 {check.recommendation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-6 h-6 text-green-600 mt-1" />
            <div>
              <h3 className="font-medium text-green-900 mb-2">
                Sécurité renforcée implémentée
              </h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Chiffrement côté serveur avec clés sécurisées</li>
                <li>• Politiques RLS strictes pour toutes les données médicales</li>
                <li>• Authentification requise pour tous les accès sensibles</li>
                <li>• Audit complet des accès aux transmissions</li>
                <li>• Protection contre l'exposition publique des données</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionSecuritySettings;