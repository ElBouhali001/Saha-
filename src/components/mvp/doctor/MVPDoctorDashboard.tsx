import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Calendar, FileText, DollarSign, Users, LogOut, Menu, Mic } from 'lucide-react';
import MVPPatientRecord from './MVPPatientRecord';
import MVPConsultation from './MVPConsultation';
import MVPBilling from './MVPBilling';
import MVPAgenda from './MVPAgenda';

type View = 'dashboard' | 'patients' | 'consultation' | 'billing' | 'agenda';

const MVPDoctorDashboard = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showMenu, setShowMenu] = useState(false);
  const { signOut, user } = useSupabaseAuth();

  const menuItems = [
    { id: 'patients', label: 'Dossiers', icon: Users },
    { id: 'consultation', label: 'Consultation', icon: FileText },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'billing', label: 'Facturation', icon: DollarSign },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'patients':
        return <MVPPatientRecord />;
      case 'consultation':
        return <MVPConsultation />;
      case 'billing':
        return <MVPBilling />;
      case 'agenda':
        return <MVPAgenda />;
      default:
        return (
          <div className="p-4 space-y-4">
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-background">
              <h2 className="text-xl font-bold mb-2">Bienvenue Dr. {user?.user_metadata?.last_name}</h2>
              <p className="text-muted-foreground">Tableau de bord rapide</p>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              {menuItems.map((item) => (
                <Card
                  key={item.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setCurrentView(item.id as View)}
                >
                  <item.icon className="w-8 h-8 text-primary mb-2" />
                  <p className="font-semibold text-sm">{item.label}</p>
                </Card>
              ))}
            </div>

            <Card className="p-4 bg-primary/5">
              <h3 className="font-semibold mb-2">Statistiques du jour</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Consultations</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recettes</span>
                  <span className="font-semibold">45,000 FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RDV restants</span>
                  <span className="font-semibold">8</span>
                </div>
              </div>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar - Mobile Optimized */}
      <div className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground"
            onClick={() => currentView === 'dashboard' ? setShowMenu(!showMenu) : setCurrentView('dashboard')}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <h1 className="text-lg font-bold">
            {currentView === 'dashboard' ? 'MédiPatient' : menuItems.find(m => m.id === currentView)?.label}
          </h1>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground"
              title="Assistant vocal"
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground"
              onClick={() => signOut()}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Quick Menu */}
        {showMenu && currentView === 'dashboard' && (
          <div className="bg-primary-foreground text-foreground shadow-lg">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className="w-full flex items-center gap-3 p-4 hover:bg-accent transition-colors border-b last:border-b-0"
                onClick={() => {
                  setCurrentView(item.id as View);
                  setShowMenu(false);
                }}
              >
                <item.icon className="h-5 w-5 text-primary" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="pb-20">
        {renderView()}
      </div>

      {/* Bottom Navigation - Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg">
        <div className="flex justify-around items-center h-16">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                currentView === item.id ? 'text-primary' : 'text-muted-foreground'
              }`}
              onClick={() => setCurrentView(item.id as View)}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MVPDoctorDashboard;
