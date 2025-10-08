
import React from 'react';
import { useModules } from '@/contexts/ModuleContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  User, 
  FileText, 
  Clock, 
  Pill, 
  DollarSign,
  Package,
  BarChart,
  Settings,
  Home,
  Users,
  MessageSquare,
  Brain,
  Video,
  Monitor,
  CalendarDays,
  FlaskConical,
  UserCheck,
  CreditCard,
  QrCode
} from 'lucide-react';

interface ModularNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const ModularNavigation: React.FC<ModularNavigationProps> = ({ 
  currentPage, 
  onPageChange 
}) => {
  const { user } = useSupabaseAuth();
  const { getEnabledModules, getAvailableRoutes } = useModules();

  const enabledModules = getEnabledModules();
  const availableRoutes = getAvailableRoutes();

  const getMenuItems = () => {
    const commonItems = [
      { id: 'dashboard', label: 'Tableau de bord', icon: Home, module: 'auth' },
    ];

    const moduleBasedItems = [];

    // Ajouter les éléments selon les modules activés et le rôle de l'utilisateur
    if (enabledModules.find(m => m.id === 'patient-management')) {
      if (['admin', 'doctor', 'agent'].includes(user?.user_metadata?.role)) {
        moduleBasedItems.push({ id: 'patients', label: 'Patients', icon: Users, module: 'patient-management' });
      }
      if (user?.user_metadata?.role === 'patient') {
        moduleBasedItems.push({ id: 'patient-interface', label: 'Mon Espace', icon: Monitor, module: 'patient-management' });
      }
    }

    if (enabledModules.find(m => m.id === 'appointment-scheduling')) {
      if (['admin', 'agent'].includes(user?.user_metadata?.role)) {
        moduleBasedItems.push({ id: 'appointments', label: 'Rendez-vous', icon: Calendar, module: 'appointment-scheduling' });
      }
      if (user?.user_metadata?.role === 'doctor') {
        moduleBasedItems.push({ id: 'schedule', label: 'Mon Planning', icon: Calendar, module: 'appointment-scheduling' });
      }
      if (user?.user_metadata?.role === 'agent') {
        moduleBasedItems.push({ id: 'doctor-agenda', label: 'Agenda Médecins', icon: CalendarDays, module: 'appointment-scheduling' });
      }
      if (user?.user_metadata?.role === 'patient') {
        moduleBasedItems.push({ id: 'appointments', label: 'Mes RDV', icon: Calendar, module: 'appointment-scheduling' });
      }
    }

    if (enabledModules.find(m => m.id === 'medical-consultation')) {
      if (user?.user_metadata?.role === 'doctor') {
        moduleBasedItems.push({ id: 'consultations', label: 'Consultations', icon: FileText, module: 'medical-consultation' });
      }
      if (user?.user_metadata?.role === 'patient') {
        moduleBasedItems.push({ id: 'medical-history', label: 'Mon Dossier', icon: FileText, module: 'medical-consultation' });
        moduleBasedItems.push({ id: 'prescriptions', label: 'Ordonnances', icon: Pill, module: 'medical-consultation' });
      }
    }

    if (enabledModules.find(m => m.id === 'billing-invoicing')) {
      if (['admin', 'agent'].includes(user?.user_metadata?.role)) {
        moduleBasedItems.push({ id: 'billing', label: 'Facturation', icon: DollarSign, module: 'billing-invoicing' });
      }
    }

    if (enabledModules.find(m => m.id === 'inventory-management')) {
      if (['admin', 'doctor', 'agent'].includes(user?.user_metadata?.role)) {
        moduleBasedItems.push({ id: 'inventory', label: 'Stock', icon: Package, module: 'inventory-management' });
      }
    }

    if (enabledModules.find(m => m.id === 'laboratory-integration')) {
      if (user?.user_metadata?.role === 'lab_technician') {
        moduleBasedItems.push({ id: 'laboratory', label: 'Analyses', icon: FlaskConical, module: 'laboratory-integration' });
        moduleBasedItems.push({ id: 'lab-schedule', label: 'Planning', icon: Calendar, module: 'laboratory-integration' });
        moduleBasedItems.push({ id: 'lab-results', label: 'Résultats', icon: FileText, module: 'laboratory-integration' });
      }
      if (user?.user_metadata?.role === 'doctor') {
        moduleBasedItems.push({ id: 'lab-tests', label: 'Analyses', icon: FlaskConical, module: 'laboratory-integration' });
      }
      if (user?.user_metadata?.role === 'patient') {
        moduleBasedItems.push({ id: 'lab-results', label: 'Mes Analyses', icon: FlaskConical, module: 'laboratory-integration' });
      }
    }

    if (enabledModules.find(m => m.id === 'pharmacy-integration')) {
      if (user?.user_metadata?.role === 'pharmacist') {
        moduleBasedItems.push({ id: 'pharmacy', label: 'Ordonnances', icon: Pill, module: 'pharmacy-integration' });
        moduleBasedItems.push({ id: 'pharmacy-inventory', label: 'Stock Pharmacie', icon: Package, module: 'pharmacy-integration' });
        moduleBasedItems.push({ id: 'pharmacy-reports', label: 'Rapports', icon: BarChart, module: 'pharmacy-integration' });
      }
    }

    if (enabledModules.find(m => m.id === 'ai-assistant')) {
      if (user?.user_metadata?.role === 'doctor') {
        moduleBasedItems.push({ id: 'ai-assistant', label: 'Assistant IA', icon: Brain, module: 'ai-assistant' });
      }
    }

    if (enabledModules.find(m => m.id === 'transmission-referrals')) {
      if (user?.user_metadata?.role === 'doctor') {
        moduleBasedItems.push({ id: 'transfers', label: 'Transmissions', icon: MessageSquare, module: 'transmission-referrals' });
      }
    }

    // Télémédecine (accessible pour les médecins)
    if (user?.user_metadata?.role === 'doctor') {
      moduleBasedItems.push({ id: 'telemedicine', label: 'Télémédecine IA', icon: Video, module: 'medical-consultation' });
    }

    // Paramètres QR
    if (['admin', 'doctor', 'agent'].includes(user?.user_metadata?.role)) {
      moduleBasedItems.push({ id: 'qr-settings', label: 'Paramètres QR', icon: QrCode, module: 'admin' });
    }

    // Filtrer les éléments selon les routes disponibles
    const filteredItems = moduleBasedItems.filter(item => 
      item.id === 'qr-settings' || // Exception pour les paramètres QR qui ne sont pas dans les routes modulaires
      availableRoutes.includes(`/${item.id}`) || 
      availableRoutes.includes(`/${item.id.replace('-', '')}`)
    );

    return [...commonItems, ...filteredItems];
  };

  const menuItems = getMenuItems();

  return (
    <nav className="flex-1 p-4 space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        
        return (
          <Button
            key={item.id}
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start space-x-3",
              isActive && "bg-blue-50 text-blue-700 border-blue-200"
            )}
            onClick={() => onPageChange(item.id)}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Button>
        );
      })}
    </nav>
  );
};

export default ModularNavigation;
