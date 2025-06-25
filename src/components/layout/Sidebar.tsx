import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  LogOut,
  Brain
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    const commonItems = [
      { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...commonItems,
          { id: 'patients', label: 'Patients', icon: Users },
          { id: 'appointments', label: 'Rendez-vous', icon: Calendar },
          { id: 'doctors', label: 'Médecins', icon: User },
          { id: 'billing', label: 'Facturation', icon: DollarSign },
          { id: 'inventory', label: 'Stock', icon: Package },
          { id: 'reports', label: 'Rapports', icon: BarChart },
          { id: 'settings', label: 'Configuration', icon: Settings },
        ];
      
      case 'doctor':
        return [
          ...commonItems,
          { id: 'schedule', label: 'Mon Planning', icon: Calendar },
          { id: 'patients', label: 'Mes Patients', icon: Users },
          { id: 'consultations', label: 'Consultations', icon: FileText },
          { id: 'ai-assistant', label: 'Assistant IA', icon: Brain },
          { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
          { id: 'transfers', label: 'Transmissions', icon: MessageSquare },
        ];
      
      case 'agent':
        return [
          ...commonItems,
          { id: 'appointments', label: 'Rendez-vous', icon: Calendar },
          { id: 'patients', label: 'Patients', icon: Users },
          { id: 'billing', label: 'Facturation', icon: DollarSign },
          { id: 'reception', label: 'Accueil', icon: Clock },
        ];
      
      case 'patient':
        return [
          ...commonItems,
          { id: 'appointments', label: 'Mes RDV', icon: Calendar },
          { id: 'medical-history', label: 'Mon Dossier', icon: FileText },
          { id: 'prescriptions', label: 'Ordonnances', icon: Pill },
          { id: 'teleconsult', label: 'Téléconsultation', icon: MessageSquare },
        ];
      
      default:
        return commonItems;
    }
  };

  const menuItems = getMenuItems();

  const getRoleColor = () => {
    switch (user?.role) {
      case 'admin': return 'text-purple-600';
      case 'doctor': return 'text-blue-600';
      case 'agent': return 'text-green-600';
      case 'patient': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin': return 'Administrateur';
      case 'doctor': return 'Médecin';
      case 'agent': return 'Agent';
      case 'patient': return 'Patient';
      default: return 'Utilisateur';
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">M+</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-blue-900">MediPatient</h1>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className={cn("text-xs font-medium", getRoleColor())}>
              {getRoleLabel()}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
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

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start space-x-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
