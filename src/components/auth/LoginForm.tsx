
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import appIcon from '@/assets/app-icon.jpeg';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'email' | 'password'>('email');
  const { signIn, isLoading } = useSupabaseAuth();
  const { toast } = useToast();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre adresse e-mail",
        variant: "destructive",
      });
      return;
    }
    
    setStep('password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre mot de passe",
        variant: "destructive",
      });
      return;
    }

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Connexion échouée",
        description: error.message || "Identifiants incorrects",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Medipatient",
      });
    }
  };

  const handleGoogleSignIn = () => {
    toast({
      title: "Google Sign-In",
      description: "Fonctionnalité bientôt disponible",
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#7c5ce0] px-6 py-8 safe-area-inset">
      <div className="w-full max-w-sm flex flex-col items-center space-y-8">
        {/* App Icon */}
        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg">
          <img 
            src={appIcon} 
            alt="Medipatient" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Se connecter à Medipatient
          </h1>
          <p className="text-white/70 text-sm md:text-base">
            {step === 'email' 
              ? 'Veuillez saisir votre adresse e-mail' 
              : 'Veuillez saisir votre mot de passe'}
          </p>
        </div>
        
        {/* Form */}
        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="w-full space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Saisissez votre adresse e-mail"
              disabled={isLoading}
              className="w-full h-14 px-4 bg-white/20 border-0 text-white placeholder:text-white/60 rounded-xl text-base focus:ring-2 focus:ring-white/40"
            />
            
            <Button 
              type="submit" 
              className="w-full h-14 bg-white/30 hover:bg-white/40 text-white font-semibold rounded-xl text-base border-0"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Continuer
            </Button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="w-full space-y-4">
            <div className="text-center mb-2">
              <span className="text-white/80 text-sm">{email}</span>
              <button 
                type="button"
                onClick={() => setStep('email')}
                className="text-white underline text-sm ml-2"
              >
                Modifier
              </button>
            </div>
            
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Saisissez votre mot de passe"
              disabled={isLoading}
              className="w-full h-14 px-4 bg-white/20 border-0 text-white placeholder:text-white/60 rounded-xl text-base focus:ring-2 focus:ring-white/40"
              autoFocus
            />
            
            <Button 
              type="submit" 
              className="w-full h-14 bg-white/30 hover:bg-white/40 text-white font-semibold rounded-xl text-base border-0"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Se connecter
            </Button>
          </form>
        )}
        
        {/* Divider */}
        <div className="w-full flex items-center gap-4">
          <div className="flex-1 h-px bg-white/30" />
          <span className="text-white/60 text-sm">ou</span>
          <div className="flex-1 h-px bg-white/30" />
        </div>
        
        {/* Google Sign In */}
        <Button 
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full h-14 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl text-base border-0 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuer avec Google
        </Button>
        
        {/* Sign Up Link */}
        <div className="text-center">
          <Link to="/supabase" className="text-white/80 text-sm hover:text-white underline">
            Pas encore de compte ? S'inscrire
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-auto pt-8">
        <p className="text-white/50 text-xs text-center">
          Made with ❤️ by Medipatient
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
