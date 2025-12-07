import React from 'react';
import { useModules } from '@/contexts/ModuleContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  User, 
  FileText, 
  Pill, 
  DollarSign,
  Package,
  BarChart3,
  Settings2,
  LayoutDashboard,
  Users,
  MessageSquare,
  Sparkles,
  Video,
  Monitor,
  CalendarDays,
  FlaskConical,
  Activity,
  QrCode
} from 'lucide-react';

interface ModularNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  userRole?: string | null;
}

const ModularNavigation: React.FC<ModularNavigationProps> = ({ 
  currentPage, 
  onPageChange,
  userRole 
}) => {
  const { user } = useSupabaseAuth();
  const { getEnabledModules, getAvailableRoutes } = useModules();

  const enabledModules = getEnabledModules();
  const availableRoutes = getAvailableRoutes();
  
  const role = userRole || user?.user_metadata?.role;

  const getMenuItems = () => {
    const commonItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, module: 'auth' },
    ];

    const moduleBasedItems = [];

    if (enabledModules.find(m => m.id === 'patient-management')) {
      if (['admin', 'doctor', 'agent'].includes(role)) {
        moduleBasedItems.push({ id: 'patients', label: 'Patients', icon: Users, module: 'patient-management' });
      }
      if (role === 'patient') {
        moduleBasedItems.push({ id: 'patient-interface', label: 'Mon Espace', icon: Monitor, module: 'patient-management' });
      }
    }

    if (enabledModules.find(m => m.id === 'appointment-scheduling')) {
      if (['admin', 'agent'].includes(role)) {
        moduleBasedItems.push({ id: 'appointments', label: 'Rendez-vous', icon: Calendar, module: 'appointment-scheduling' });
      }
      if (role === 'doctor') {
        moduleBasedItems.push({ id: 'schedule', label: 'Planning', icon: Calendar, module: 'appointment-scheduling' });
      }
      if (role === 'agent') {
        moduleBasedItems.push({ id: 'doctor-agenda', label: 'Agenda', icon: CalendarDays, module: 'appointment-scheduling' });
      }
      if (role === 'patient') {
        moduleBasedItems.push({ id: 'appointments', label: 'Mes RDV', icon: Calendar, module: 'appointment-scheduling' });
      }
    }

    if (enabledModules.find(m => m.id === 'medical-consultation')) {
      if (role === 'doctor') {
        moduleBasedItems.push({ id: 'consultations', label: 'Consultations', icon: FileText, module: 'medical-consultation' });
      }
      if (role === 'patient') {
        moduleBasedItems.push({ id: 'medical-history', label: 'Dossier', icon: FileText, module: 'medical-consultation' });
        moduleBasedItems.push({ id: 'prescriptions', label: 'Ordonnances', icon: Pill, module: 'medical-consultation' });
        moduleBasedItems.push({ id: 'prescription-tracker', label: 'Suivi', icon: Activity, module: 'patient-management' });
      }
    }

    if (enabledModules.find(m => m.id === 'billing-invoicing')) {
      if (['admin', 'agent'].includes(role)) {
        moduleBasedItems.push({ id: 'billing', label: 'Facturation', icon: DollarSign, module: 'billing-invoicing' });
      }
    }

    if (enabledModules.find(m => m.id === 'inventory-management')) {
      if (['admin', 'doctor', 'agent'].includes(role)) {
        moduleBasedItems.push({ id: 'inventory', label: 'Stock', icon: Package, module: 'inventory-management' });
      }
    }

    if (enabledModules.find(m => m.id === 'laboratory-integration')) {
      if (role === 'lab_technician') {
        moduleBasedItems.push({ id: 'laboratory', label: 'Analyses', icon: FlaskConical, module: 'laboratory-integration' });
        moduleBasedItems.push({ id: 'lab-schedule', label: 'Planning', icon: Calendar, module: 'laboratory-integration' });
        moduleBasedItems.push({ id: 'lab-results', label: 'Résultats', icon: FileText, module: 'laboratory-integration' });
      }
      if (role === 'doctor') {
        moduleBasedItems.push({ id: 'lab-tests', label: 'Analyses', icon: FlaskConical, module: 'laboratory-integration' });
      }
      if (role === 'patient') {
        moduleBasedItems.push({ id: 'lab-results', label: 'Analyses', icon: FlaskConical, module: 'laboratory-integration' });
      }
    }

    if (enabledModules.find(m => m.id === 'pharmacy-integration')) {
      if (role === 'pharmacist') {
        moduleBasedItems.push({ id: 'pharmacy', label: 'Ordonnances', icon: Pill, module: 'pharmacy-integration' });
        moduleBasedItems.push({ id: 'pharmacy-inventory', label: 'Stock', icon: Package, module: 'pharmacy-integration' });
        moduleBasedItems.push({ id: 'pharmacy-reports', label: 'Rapports', icon: BarChart3, module: 'pharmacy-integration' });
      }
    }

    if (enabledModules.find(m => m.id === 'ai-assistant')) {
      if (role === 'doctor') {
        moduleBasedItems.push({ id: 'ai-assistant', label: 'IA Assistant', icon: Sparkles, module: 'ai-assistant' });
      }
    }

    if (enabledModules.find(m => m.id === 'transmission-referrals')) {
      if (role === 'doctor') {
        moduleBasedItems.push({ id: 'transfers', label: 'Transferts', icon: MessageSquare, module: 'transmission-referrals' });
      }
    }

    if (role === 'doctor') {
      moduleBasedItems.push({ id: 'telemedicine', label: 'Télémédecine', icon: Video, module: 'medical-consultation' });
    }

    if (role === 'admin') {
      moduleBasedItems.push({ id: 'module-manager', label: 'Modules', icon: Settings2, module: 'admin' });
      moduleBasedItems.push({ id: 'business-analytics', label: 'Analytics', icon: BarChart3, module: 'business-analytics' });
    }

    if (['doctor', 'agent'].includes(role) && enabledModules.find(m => m.id === 'business-analytics')) {
      moduleBasedItems.push({ id: 'business-analytics', label: 'Analytics', icon: BarChart3, module: 'business-analytics' });
    }

    if (['admin', 'doctor', 'agent'].includes(role)) {
      moduleBasedItems.push({ id: 'qr-settings', label: 'QR Code', icon: QrCode, module: 'admin' });
    }

    const filteredItems = moduleBasedItems.filter(item => 
      item.id === 'module-manager' ||
      item.id === 'qr-settings' ||
      item.id === 'telemedicine' ||
      item.id === 'prescription-tracker' ||
      availableRoutes.includes(`/${item.id}`) || 
      availableRoutes.includes(`/${item.id.replace('-', '')}`)
    );

    return [...commonItems, ...filteredItems];
  };

  const menuItems = getMenuItems();

  return (
    <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-premium">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        
        return (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-11 px-3 rounded-xl font-medium transition-all duration-200",
              isActive 
                ? "nav-item-active text-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            onClick={() => onPageChange(item.id)}
          >
            <Icon className={cn(
              "w-5 h-5 transition-colors",
              isActive && "text-primary"
            )} />
            <span className="font-mono text-sm">{item.label}</span>
            {isActive && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-glow-pulse" />
            )}
          </Button>
        );
      })}
    </nav>
  );
};

export default ModularNavigation;