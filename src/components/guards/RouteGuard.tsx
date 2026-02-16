
import React from 'react';
import { useModuleAccess } from '@/hooks/useModuleAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface RouteGuardProps {
  route: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ 
  route, 
  children, 
  fallback 
}) => {
  const { canAccessRoute } = useModuleAccess();

  if (!canAccessRoute(route)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Accès Non Autorisé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Vous n'avez pas accès à cette fonctionnalité. 
              Le module correspondant n'est pas activé ou vous n'avez pas les permissions nécessaires.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default RouteGuard;
