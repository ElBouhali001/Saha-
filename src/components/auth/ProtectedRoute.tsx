
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, Permission } from '@/utils/permissions';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission, 
  fallback 
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return fallback || (
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
              Vous devez être connecté pour accéder à cette page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Accès Refusé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Vous n'avez pas les permissions nécessaires pour accéder à cette fonctionnalité.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Permission requise: {requiredPermission}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
