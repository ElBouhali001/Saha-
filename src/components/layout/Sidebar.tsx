import React from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  LogOut,
  User,
  Zap,
  Shield,
  Stethoscope,
  Users,
  FlaskConical,
  Pill,
  UserCheck,
  HeartPulse
} from 'lucide-react';
import ModularNavigation from './ModularNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  userRole?: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, isOpen = false, onClose, userRole }) => {
  const { user, signOut } = useSupabaseAuth();
  const isMobile = useIsMobile();

  const getRoleConfig = () => {
    const role = userRole || user?.user_metadata?.role;
    switch (role) {
      case 'admin': 
        return { color: 'text-primary', bgColor: 'bg-primary/10', icon: Shield, label: 'Admin' };
      case 'doctor': 
        return { color: 'text-accent', bgColor: 'bg-accent/10', icon: Stethoscope, label: 'Médecin' };
      case 'agent': 
        return { color: 'text-success', bgColor: 'bg-success/10', icon: Users, label: 'Agent' };
      case 'lab_technician': 
        return { color: 'text-cyan-400', bgColor: 'bg-cyan-400/10', icon: FlaskConical, label: 'Technicien Labo' };
      case 'pharmacist': 
        return { color: 'text-warning', bgColor: 'bg-warning/10', icon: Pill, label: 'Pharmacien' };
      case 'insurance_agent': 
        return { color: 'text-indigo-400', bgColor: 'bg-indigo-400/10', icon: UserCheck, label: 'Agent Assurance' };
      case 'patient': 
        return { color: 'text-pink-400', bgColor: 'bg-pink-400/10', icon: HeartPulse, label: 'Patient' };
      default: 
        return { color: 'text-muted-foreground', bgColor: 'bg-muted', icon: User, label: 'Utilisateur' };
    }
  };

  const roleConfig = getRoleConfig();
  const RoleIcon = roleConfig.icon;

  return (
    <div className={cn(
      "sidebar-premium h-screen flex flex-col transition-all duration-300 ease-out",
      isMobile ? "fixed top-0 left-0 z-50 w-72" : "w-72",
      isMobile && !isOpen && "-translate-x-full"
    )}>
      {/* Header */}
      {!isMobile && (
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-sidebar" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-gradient">MediPatient</h1>
              <p className="text-xs font-mono text-muted-foreground">v2.0.0</p>
            </div>
          </div>
        </div>
      )}

      {/* User Info */}
      <div className={cn("p-4 border-b border-sidebar-border", isMobile && "mt-4")}>
        <div className="glass-subtle rounded-xl p-3">
          <div className="flex items-center space-x-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", roleConfig.bgColor)}>
              <RoleIcon className={cn("w-5 h-5", roleConfig.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
              </p>
              <div className="flex items-center gap-1.5">
                <span className={cn("w-2 h-2 rounded-full", roleConfig.bgColor.replace('/10', ''))} />
                <p className={cn("text-xs font-mono", roleConfig.color)}>
                  {roleConfig.label}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ModularNavigation currentPage={currentPage} onPageChange={onPageChange} userRole={userRole} />

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start space-x-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-12 font-medium"
          onClick={signOut}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-mono">Déconnexion</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;