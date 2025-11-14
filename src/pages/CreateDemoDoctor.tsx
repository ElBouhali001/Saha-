import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

const CreateDemoDoctor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; email?: string; password?: string } | null>(null);

  const handleCreateDoctor = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-demo-doctor');

      if (error) throw error;

      setResult({
        success: true,
        message: data.message,
        email: data.email,
        password: data.password
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Erreur lors de la création du compte'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-6 h-6" />
            Créer un Compte Médecin Démo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Cliquez sur le bouton ci-dessous pour créer un compte médecin généraliste de démonstration.
          </p>

          <Button 
            onClick={handleCreateDoctor} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Création en cours...' : 'Créer le Compte Démo'}
          </Button>

          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">{result.message}</p>
                  {result.success && result.email && (
                    <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                      <p className="font-mono text-sm">
                        <strong>Email:</strong> {result.email}
                      </p>
                      <p className="font-mono text-sm">
                        <strong>Mot de passe:</strong> {result.password}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Notez ces identifiants pour vous connecter à la démo.
                      </p>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateDemoDoctor;
