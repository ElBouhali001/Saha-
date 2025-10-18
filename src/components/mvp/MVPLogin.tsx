import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Phone, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MVPLogin = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useSupabaseAuth();
  const { toast } = useToast();

  const handleLogin = async (role: 'doctor' | 'patient') => {
    setLoading(true);
    
    // Use existing account with specified role
    const email = 'cmboup20@gmail.com';
    const pass = 'Essai2025@';
    
    const { error } = await signIn(email, pass);
    
    if (error) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Store the selected role in localStorage for MVP
    localStorage.setItem('mvp_demo_role', role);
    
    toast({
      title: "Connexion réussie",
      description: `Connecté en tant que ${role === 'doctor' ? 'Médecin' : 'Patient'}`,
    });
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">MédiPatient MVP</CardTitle>
          <CardDescription>Connexion rapide - Version mobile</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="patient" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="patient">Patient</TabsTrigger>
              <TabsTrigger value="doctor">Médecin</TabsTrigger>
            </TabsList>
            
            <TabsContent value="patient" className="space-y-4">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Accès rapide pour les patients
                </p>
                <Button 
                  onClick={() => handleLogin('patient')}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    <>
                      <Phone className="mr-2 h-4 w-4" />
                      Connexion Patient
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Connexion rapide - Mode Patient
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="doctor" className="space-y-4">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Espace sécurisé pour les médecins
                </p>
                <Button 
                  onClick={() => handleLogin('doctor')}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      Connexion Médecin
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Connexion rapide - Mode Médecin
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MVPLogin;
