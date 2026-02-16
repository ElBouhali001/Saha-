import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { IS_DEMO } from '@/config/app';

const ClaimPatient: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useSupabaseAuth();

  const [isClaiming, setIsClaiming] = useState(false);
  const [result, setResult] = useState<null | { patient_id: string; tenant_id: string }>(null);

  const token = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('token') || '';
  }, []);

  useEffect(() => {
    document.title = 'Activation compte patient - MédiPatient';
  }, []);

  const handleClaim = async () => {
    if (!token) {
      toast({ title: 'Token manquant', description: "Lien d'activation invalide." });
      return;
    }
    setIsClaiming(true);

    if (IS_DEMO) {
      // Simulation en mode démo
      setTimeout(() => {
        setResult({ patient_id: 'demo-patient', tenant_id: 'demo-tenant' } as any);
        toast({ title: 'Compte activé (démo)', description: 'Lien simulé validé avec succès.' });
        setIsClaiming(false);
      }, 800);
      return;
    }

    const { data, error } = await (supabase as any).rpc('claim_patient_with_token', { p_token: token });
    setIsClaiming(false);
    if (error) {
      toast({ title: 'Erreur', description: error.message || 'Activation impossible.' });
      return;
    }
    if (data && data[0]) {
      setResult(data[0]);
      toast({ title: 'Compte activé', description: 'Votre compte patient est lié avec succès.' });
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Activer mon compte patient</CardTitle>
          <CardDescription>Validez le QR/lien reçu pour lier votre dossier médical</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Token: <span className="font-mono break-all">{token || '—'}</span>
          </div>

          {!isAuthenticated && !IS_DEMO && (
            <div className="p-3 rounded-md border">
              <p className="text-sm">Vous devez être connecté pour activer votre compte.</p>
              <div className="mt-2">
                <Button onClick={() => navigate('/')}>Se connecter</Button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleClaim} disabled={isClaiming || (!isAuthenticated && !IS_DEMO)}>
              {isClaiming ? 'Activation…' : 'Activer mon compte'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>Retour</Button>
          </div>

          {result && (
            <div className="text-sm text-green-700">
              Activation réussie. Patient: {result.patient_id} • Structure: {result.tenant_id}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default ClaimPatient;
