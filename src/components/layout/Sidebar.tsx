
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  LogOut,
  User,
  Home
} from 'lucide-react';
import ModularNavigation from './ModularNavigation';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const { user, logout } = useAuth();

  const getRoleColor = () => {
    switch (user?.role) {
      case 'admin': return 'text-purple-600';
      case 'doctor': return 'text-blue-600';
      case 'agent': return 'text-green-600';
      case 'lab_technician': return 'text-cyan-600';
      case 'pharmacist': return 'text-orange-600';
      case 'insurance_agent': return 'text-indigo-600';
      case 'patient': return 'text-pink-600';
      default: return 'text-gray-600';
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin': return 'Administrateur';
      case 'doctor': return 'Médecin';
      case 'agent': return 'Agent/Secrétaire';
      case 'lab_technician': return 'Technicien Labo';
      case 'pharmacist': return 'Pharmacien';
      case 'insurance_agent': return 'Agent Assurance';
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

      {/* Navigation Modulaire */}
      <ModularNavigation currentPage={currentPage} onPageChange={onPageChange} />

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
