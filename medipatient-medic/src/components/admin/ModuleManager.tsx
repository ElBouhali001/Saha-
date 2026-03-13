
import React from 'react';
import { useModules } from '@/contexts/ModuleContext';
import { MODULE_DEFINITIONS, ModuleId } from '@/types/modules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const ModuleManager: React.FC = () => {
  const { modules, updateModuleStatus, isModuleEnabled } = useModules();

  const handleToggleModule = async (moduleId: ModuleId, enabled: boolean) => {
    try {
      await updateModuleStatus(moduleId, enabled);
      toast.success(`Module ${moduleId} ${enabled ? 'activé' : 'désactivé'}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la modification du module');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Modules</h2>
        <p className="text-gray-600">Activez ou désactivez les modules selon vos besoins.</p>
      </div>

      <div className="grid gap-4">
        {Object.entries(MODULE_DEFINITIONS).map(([id, config]) => {
          const moduleId = id as ModuleId;
          const isEnabled = isModuleEnabled(moduleId);
          const isCore = config.isCore;

          return (
            <Card key={moduleId} className={isEnabled ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-lg">{config.name}</CardTitle>
                    {isCore && <Badge variant="secondary">Core</Badge>}
                    {isEnabled && <Badge variant="default" className="bg-green-600">Activé</Badge>}
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => handleToggleModule(moduleId, checked)}
                    disabled={isCore}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">{config.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">v{config.version}</Badge>
                  {config.dependencies.length > 0 && (
                    <Badge variant="outline">
                      Dépend de: {config.dependencies.join(', ')}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ModuleManager;
