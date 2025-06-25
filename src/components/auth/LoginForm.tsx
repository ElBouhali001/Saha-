
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    const success = await login(email, password);
    
    if (!success) {
      toast({
        title: "Connexion échouée",
        description: "Identifiants incorrects",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur MediPatient",
      });
    }
  };

  const fillDemoCredentials = (role: string) => {
    const credentials = {
      admin: { email: 'admin@medipatient.com', password: 'admin123' },
      doctor: { email: 'dr.kouame@medipatient.com', password: 'doctor123' },
      agent: { email: 'agent@medipatient.com', password: 'agent123' },
      patient: { email: 'patient@medipatient.com', password: 'patient123' },
    };
    
    const cred = credentials[role as keyof typeof credentials];
    if (cred) {
      setEmail(cred.email);
      setPassword(cred.password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">M+</span>
          </div>
          <CardTitle className="text-2xl font-bold text-blue-900">MediPatient</CardTitle>
          <CardDescription>
            Système de gestion médicale moderne
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@exemple.com"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Se connecter
            </Button>
          </form>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 mb-3 text-center">Comptes de démonstration :</p>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fillDemoCredentials('admin')}
                className="text-xs"
              >
                Administrateur
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fillDemoCredentials('doctor')}
                className="text-xs"
              >
                Médecin
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fillDemoCredentials('agent')}
                className="text-xs"
              >
                Agent
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fillDemoCredentials('patient')}
                className="text-xs"
              >
                Patient
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
