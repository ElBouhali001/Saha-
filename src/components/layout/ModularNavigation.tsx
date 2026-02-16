import React from 'react';
import { useTranslation } from 'react-i18next';

import { useModules } from '@/contexts/ModuleContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  CalendarClock,
  HeartPulse,
  ClipboardList,
  Tablets,
  Wallet,
  Boxes,
  TrendingUp,
  Cog,
  LayoutGrid,
  UserRound,
  Send,
  BrainCircuit,
  VideoIcon,
  Laptop2,
  CalendarRange,
  Microscope,
  Syringe,
  ScanLine,
  UserCircle2,
  Stethoscope,
  FileHeart,
  Receipt,
  PillBottle,
  TestTubes,
  Gauge,
  CircuitBoard,
  ArrowRightLeft,
  ScreenShare,
  FileBarChart,
  ScrollText,
  Scan,
  Shield
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
  const { t } = useTranslation();
  const { user } = useSupabaseAuth();
  const { getEnabledModules, getAvailableRoutes } = useModules();

  const enabledModules = getEnabledModules();
  const availableRoutes = getAvailableRoutes();

  const role = userRole || user?.user_metadata?.role;

  const getMenuItems = () => {
    const commonItems = [
      { id: 'dashboard', label: t('modules.dashboard'), icon: LayoutGrid, module: 'auth' },
    ];

    const moduleBasedItems = [];

    if (enabledModules.find(m => m.id === 'patient-management')) {
      if (['admin', 'doctor', 'agent'].includes(role)) {
        moduleBasedItems.push({ id: 'patients', label: t('modules.patients'), icon: UserCircle2, module: 'patient-management' });
      }
      if (role === 'patient') {
        moduleBasedItems.push({ id: 'patient-interface', label: t('modules.my_space'), icon: Laptop2, module: 'patient-management' });
      }
    }

    if (enabledModules.find(m => m.id === 'appointment-scheduling')) {
      if (['admin', 'agent'].includes(role)) {
        moduleBasedItems.push({ id: 'appointments', label: t('modules.appointments'), icon: CalendarClock, module: 'appointment-scheduling' });
      }
      if (role === 'doctor') {
        moduleBasedItems.push({ id: 'schedule', label: t('modules.planning'), icon: CalendarRange, module: 'appointment-scheduling' });
      }
      if (role === 'agent') {
        moduleBasedItems.push({ id: 'doctor-agenda', label: t('modules.agenda'), icon: CalendarRange, module: 'appointment-scheduling' });
      }
      if (role === 'patient') {
        moduleBasedItems.push({ id: 'appointments', label: t('modules.my_appointments'), icon: CalendarClock, module: 'appointment-scheduling' });
      }
    }

    if (enabledModules.find(m => m.id === 'medical-consultation')) {
      if (role === 'doctor') {
        moduleBasedItems.push({ id: 'consultations', label: t('modules.consultations'), icon: Stethoscope, module: 'medical-consultation' });
      }
      if (role === 'patient') {
        moduleBasedItems.push({ id: 'medical-history', label: t('modules.medical_folder'), icon: FileHeart, module: 'medical-consultation' });
        moduleBasedItems.push({ id: 'prescriptions', label: t('modules.prescriptions'), icon: ScrollText, module: 'medical-consultation' });
        moduleBasedItems.push({ id: 'prescription-tracker', label: t('modules.follow_up'), icon: Gauge, module: 'patient-management' });
        moduleBasedItems.push({ id: 'insurance', label: t('modules.insurance'), icon: Shield, module: 'patient-management' });
      }
    }

    if (enabledModules.find(m => m.id === 'billing-invoicing')) {
      if (['admin', 'agent'].includes(role)) {
        moduleBasedItems.push({ id: 'billing', label: t('modules.billing'), icon: Receipt, module: 'billing-invoicing' });
      }
    }

    if (enabledModules.find(m => m.id === 'inventory-management')) {
      if (['admin', 'doctor', 'agent'].includes(role)) {
        moduleBasedItems.push({ id: 'inventory', label: t('modules.stock'), icon: Boxes, module: 'inventory-management' });
      }
    }

    if (enabledModules.find(m => m.id === 'laboratory-integration')) {
      if (role === 'lab_technician') {
        moduleBasedItems.push({ id: 'laboratory', label: t('modules.analysis'), icon: Microscope, module: 'laboratory-integration' });
        moduleBasedItems.push({ id: 'lab-schedule', label: t('modules.planning'), icon: CalendarRange, module: 'laboratory-integration' });
        moduleBasedItems.push({ id: 'lab-results', label: t('modules.results'), icon: TestTubes, module: 'laboratory-integration' });
      }
      if (role === 'doctor') {
        moduleBasedItems.push({ id: 'lab-tests', label: t('modules.analysis'), icon: Microscope, module: 'laboratory-integration' });
      }
      if (role === 'patient') {
        moduleBasedItems.push({ id: 'lab-results', label: t('modules.analysis'), icon: TestTubes, module: 'laboratory-integration' });
      }
    }

    if (enabledModules.find(m => m.id === 'pharmacy-integration')) {
      if (role === 'pharmacist') {
        moduleBasedItems.push({ id: 'pharmacy', label: t('modules.prescriptions'), icon: PillBottle, module: 'pharmacy-integration' });
        moduleBasedItems.push({ id: 'pharmacy-inventory', label: t('modules.stock'), icon: Boxes, module: 'pharmacy-integration' });
        moduleBasedItems.push({ id: 'pharmacy-reports', label: t('modules.reports'), icon: FileBarChart, module: 'pharmacy-integration' });
      }
    }

    if (enabledModules.find(m => m.id === 'ai-assistant')) {
      if (role === 'doctor') {
        moduleBasedItems.push({ id: 'ai-assistant', label: t('modules.ai_assistant'), icon: BrainCircuit, module: 'ai-assistant' });
      }
    }

    if (enabledModules.find(m => m.id === 'transmission-referrals')) {
      if (role === 'doctor') {
        moduleBasedItems.push({ id: 'transfers', label: t('modules.transfers'), icon: ArrowRightLeft, module: 'transmission-referrals' });
      }
    }

    if (role === 'doctor') {
      moduleBasedItems.push({ id: 'telemedicine', label: t('modules.telemedicine'), icon: ScreenShare, module: 'medical-consultation' });
    }

    if (role === 'admin') {
      moduleBasedItems.push({ id: 'module-manager', label: t('modules.modules'), icon: CircuitBoard, module: 'admin' });
      moduleBasedItems.push({ id: 'business-analytics', label: t('modules.analytics'), icon: TrendingUp, module: 'business-analytics' });
    }

    if (['doctor', 'agent'].includes(role) && enabledModules.find(m => m.id === 'business-analytics')) {
      moduleBasedItems.push({ id: 'business-analytics', label: t('modules.analytics'), icon: TrendingUp, module: 'business-analytics' });
    }

    if (['admin', 'doctor', 'agent'].includes(role)) {
      moduleBasedItems.push({ id: 'qr-settings', label: t('modules.qr_code'), icon: ScanLine, module: 'admin' });
    }

    const filteredItems = moduleBasedItems.filter(item =>
      item.id === 'module-manager' ||
      item.id === 'qr-settings' ||
      item.id === 'telemedicine' ||
      item.id === 'prescription-tracker' ||
      item.id === 'insurance' ||
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