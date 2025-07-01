
import React from 'react';
import { useModuleAccess } from '@/hooks/useModuleAccess';
import { ModuleId } from '@/types/modules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Lock } from 'lucide-react';

interface ModuleGuardProps {
  moduleId: ModuleId;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

const ModuleGuard: React.FC<ModuleGuardProps> = ({ 
  moduleId, 
  children, 
  fallback,
  showUpgrade = true 
}) => {
  const { canAccessModule } = useModuleAccess();

  if (!canAccessModule(moduleId)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <Lock className="w-5 h-5 mr-2" />
              Module Non Disponible
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Cette fonctionnalité nécessite le module <strong>{moduleId}</strong> qui n'est pas activé.
            </p>
            {showUpgrade && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 text-sm">
                  Contactez votre administrateur pour activer ce module ou mettez à niveau votre abonnement.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ModuleGuard;
