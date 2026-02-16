import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Sparkles, ArrowRight, ArrowLeft, Mail, Lock, User, Phone, Check, X, Stethoscope, UserCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import appIcon from '@/assets/app-icon.jpeg';

// Validation des critères du mot de passe
const passwordCriteria = [
  { id: 'length', label: 'Au moins 8 caractères', test: (pwd: string) => pwd.length >= 8 },
  { id: 'uppercase', label: 'Une lettre majuscule', test: (pwd: string) => /[A-Z]/.test(pwd) },
  { id: 'lowercase', label: 'Une lettre minuscule', test: (pwd: string) => /[a-z]/.test(pwd) },
  { id: 'number', label: 'Un chiffre', test: (pwd: string) => /\d/.test(pwd) },
];

const RegisterForm = () => {
  const [step, setStep] = useState<'info' | 'credentials'>('info');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { signUp, isLoading } = useSupabaseAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre prénom",
        variant: "destructive",
      });
      return;
    }
    
    if (!lastName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre nom",
        variant: "destructive",
      });
      return;
    }
    
    setStep('credentials');
  };

  const isPasswordValid = () => {
    return passwordCriteria.every(criterion => criterion.test(password));
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre adresse e-mail",
        variant: "destructive",
      });
      return;
    }

    if (!isPasswordValid()) {
      toast({
        title: "Erreur",
        description: "Le mot de passe ne respecte pas les critères de sécurité",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    const { error } = await signUp(email, password, firstName, lastName, phone || undefined, role);
    
    if (error) {
      toast({
        title: "Inscription échouée",
        description: error.message || "Erreur lors de l'inscription",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Inscription réussie",
        description: "Bienvenue sur Medipatient !",
      });
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 relative overflow-hidden px-6 py-8 safe-area-inset">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-primary/10 blur-[100px] animate-float" />
        <div className="absolute top-1/4 -right-20 w-60 h-60 rounded-full bg-accent/10 blur-[80px] animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 rounded-full bg-primary/8 blur-[90px] animate-float" style={{ animationDelay: '-4s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDBNIDAgMjAgTCA0MCAyMCBNIDIwIDAgTCAyMCA0MCBNIDAgMzAgTCA0MCAzMCBNIDMwIDAgTCAzMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEyMCw5MCwxODAsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-60 pointer-events-none" />

      <div className="w-full max-w-md flex flex-col items-center space-y-6 relative z-10">
        {/* Logo with glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150" />
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg ring-2 ring-primary/20 relative bg-card">
            <img 
              src={appIcon} 
              alt="Medipatient" 
              className="w-full h-full object-cover"
            />
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-primary animate-glow-pulse" />
        </div>
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gradient font-display tracking-tight">
            Créer un compte
          </h1>
          <p className="text-muted-foreground text-sm font-mono">
            {step === 'info' 
              ? '// Étape 1/2 : Informations personnelles' 
              : '// Étape 2/2 : Identifiants de connexion'}
          </p>
        </div>
        
        {/* Progress indicator */}
        <div className="flex gap-2 w-full max-w-xs">
          <div className={`h-1 flex-1 rounded-full transition-colors ${step === 'info' ? 'bg-primary' : 'bg-primary'}`} />
          <div className={`h-1 flex-1 rounded-full transition-colors ${step === 'credentials' ? 'bg-primary' : 'bg-muted'}`} />
        </div>
        
        {/* Form Card */}
        <div className="w-full glass rounded-2xl p-6 md:p-8 space-y-5 animate-fade-in">
          {step === 'info' ? (
            <form onSubmit={handleInfoSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Prénom *
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 flex items-center justify-center w-4 h-4 pointer-events-none z-10">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jean"
                      disabled={isLoading}
                      style={{ paddingLeft: '3rem' }}
                      className="w-full h-12 pr-4 bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground rounded-xl text-base focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Nom *
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 flex items-center justify-center w-4 h-4 pointer-events-none z-10">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Dupont"
                      disabled={isLoading}
                      style={{ paddingLeft: '3rem' }}
                      className="w-full h-12 pr-4 bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground rounded-xl text-base focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Téléphone (optionnel)
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 flex items-center justify-center w-4 h-4 pointer-events-none z-10">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    disabled={isLoading}
                    style={{ paddingLeft: '3rem' }}
                    className="w-full h-12 pr-4 bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground rounded-xl text-base focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Rôle *
                </label>
                <Select value={role} onValueChange={(value: 'PATIENT' | 'DOCTOR') => setRole(value)}>
                  <SelectTrigger className="w-full h-12 bg-muted/50 border-border/50 text-foreground rounded-xl text-base focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
                    <SelectValue placeholder="Sélectionnez votre rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PATIENT" className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Patient
                    </SelectItem>
                    <SelectItem value="DOCTOR" className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" />
                      Médecin
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 btn-premium text-primary-foreground font-semibold rounded-xl text-base group mt-4"
                disabled={isLoading}
              >
                Continuer
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <button 
                type="button"
                onClick={() => setStep('info')}
                className="flex items-center gap-2 text-muted-foreground text-sm hover:text-primary transition-colors mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour</span>
              </button>
              
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Email *
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 flex items-center justify-center w-4 h-4 pointer-events-none z-10">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    disabled={isLoading}
                    style={{ paddingLeft: '3rem' }}
                    className="w-full h-12 pr-4 bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground rounded-xl text-base focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Mot de passe *
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 flex items-center justify-center w-4 h-4 pointer-events-none z-10">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    style={{ paddingLeft: '3rem' }}
                    className="w-full h-12 pr-4 bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground rounded-xl text-base focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                
                {/* Password criteria */}
                {password && (
                  <div className="mt-2 space-y-1 text-xs">
                    {passwordCriteria.map((criterion) => {
                      const passed = criterion.test(password);
                      return (
                        <div 
                          key={criterion.id} 
                          className={`flex items-center gap-2 ${passed ? 'text-green-500' : 'text-muted-foreground'}`}
                        >
                          {passed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>{criterion.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Confirmer le mot de passe *
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 flex items-center justify-center w-4 h-4 pointer-events-none z-10">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    style={{ paddingLeft: '3rem' }}
                    className={`w-full h-12 pr-4 bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground rounded-xl text-base focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                      confirmPassword && confirmPassword !== password ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                  />
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-red-500 text-xs mt-1">Les mots de passe ne correspondent pas</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 btn-premium text-primary-foreground font-semibold rounded-xl text-base group mt-4"
                disabled={isLoading || !isPasswordValid() || password !== confirmPassword}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Créer mon compte
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
        
        {/* Login Link */}
        <div className="text-center">
          <Link to="/" className="text-muted-foreground text-sm hover:text-primary transition-colors font-mono">
            Déjà un compte ? <span className="text-primary">Se connecter</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
