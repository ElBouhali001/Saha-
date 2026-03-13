
import React from 'react';
import { useModuleAccess } from '@/hooks/useModuleAccess';
import { ModuleId } from '@/types/modules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ModuleGuardProps {
  moduleId: ModuleId;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ModuleGuard: React.FC<ModuleGuardProps> = ({ 
  moduleId, 
  children, 
  fallback 
}) => {
  const { canAccessModule } = useModuleAccess();

  if (!canAccessModule(moduleId)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Module Non Disponible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Le module "{moduleId}" n'est pas activé ou vous n'avez pas accès à cette fonctionnalité.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ModuleGuard;
