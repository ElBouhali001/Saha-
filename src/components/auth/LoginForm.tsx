import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Sparkles, ArrowRight, Mail, Lock } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden px-6 py-8 safe-area-inset">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-primary/20 blur-[100px] animate-float" />
        <div className="absolute top-1/4 -right-20 w-60 h-60 rounded-full bg-accent/20 blur-[80px] animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 rounded-full bg-primary/15 blur-[90px] animate-float" style={{ animationDelay: '-4s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDBNIDAgMjAgTCA0MCAyMCBNIDIwIDAgTCAyMCA0MCBNIDAgMzAgTCA0MCAzMCBNIDMwIDAgTCAzMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50 pointer-events-none" />

      <div className="w-full max-w-md flex flex-col items-center space-y-8 relative z-10">
        {/* Logo with glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full scale-150" />
          <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-glow ring-2 ring-primary/30 relative">
            <img 
              src={appIcon} 
              alt="Medipatient" 
              className="w-full h-full object-cover"
            />
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-primary animate-glow-pulse" />
        </div>
        
        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-gradient font-display tracking-tight">
            MediPatient
          </h1>
          <p className="text-muted-foreground text-sm md:text-base font-mono">
            {step === 'email' 
              ? '// Authentification sécurisée' 
              : '// Entrez votre mot de passe'}
          </p>
        </div>
        
        {/* Form Card */}
        <div className="w-full glass rounded-2xl p-6 md:p-8 space-y-6 animate-fade-in">
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    disabled={isLoading}
                    className="w-full h-14 pl-12 pr-4 bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground rounded-xl text-base focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-14 btn-premium text-primary-foreground font-semibold rounded-xl text-base group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Continuer
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="flex items-center justify-between mb-4 p-3 bg-muted/30 rounded-lg">
                <span className="text-foreground/80 text-sm font-mono truncate">{email}</span>
                <button 
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Modifier
                </button>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="w-full h-14 pl-12 pr-4 bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground rounded-xl text-base focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    autoFocus
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-14 btn-premium text-primary-foreground font-semibold rounded-xl text-base group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          )}
          
          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-xs font-mono">OU</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          
          {/* Google Sign In */}
          <Button 
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full h-14 bg-muted/30 hover:bg-muted/50 text-foreground font-medium rounded-xl text-base border-border/50 flex items-center justify-center gap-3 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </Button>
        </div>
        
        {/* Sign Up Link */}
        <div className="text-center">
          <Link to="/supabase" className="text-muted-foreground text-sm hover:text-primary transition-colors font-mono">
            Pas encore de compte ? <span className="text-primary">S'inscrire</span>
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-auto pt-8 relative z-10">
        <p className="text-muted-foreground/50 text-xs text-center font-mono">
          {"<"}made with <span className="text-primary">❤️</span> by Neykin.co{" />"}
        </p>
      </div>
    </div>
  );
};

export default LoginForm;