import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { FileText, Calendar, Video, User, LogOut, Menu, Mic } from 'lucide-react';
import MVPPatientRecord from './MVPPatientRecord';
import MVPPatientBooking from './MVPPatientBooking';
import MVPPatientTeleconsult from './MVPPatientTeleconsult';

type View = 'dashboard' | 'dossier' | 'booking' | 'teleconsult';

const MVPPatientDashboard = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showMenu, setShowMenu] = useState(false);
  const { signOut, user } = useSupabaseAuth();

  const menuItems = [
    { id: 'dossier', label: 'Mon Dossier', icon: FileText },
    { id: 'booking', label: 'Réserver', icon: Calendar },
    { id: 'teleconsult', label: 'Téléconsult', icon: Video },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dossier':
        return <MVPPatientRecord />;
      case 'booking':
        return <MVPPatientBooking />;
      case 'teleconsult':
        return <MVPPatientTeleconsult />;
      default:
        return (
          <div className="p-4 space-y-4">
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-background">
              <h2 className="text-xl font-bold mb-2">Bienvenue</h2>
              <p className="text-muted-foreground">Votre santé en un clic</p>
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
              <h3 className="font-semibold mb-3">Prochain rendez-vous</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm">15 Janvier 2025 à 10h00</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm">Dr. Diallo</span>
                </div>
                <Button size="sm" variant="outline" className="w-full mt-2">
                  Annuler le RDV
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Assistant Vocal
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Posez vos questions en français ou wolof
              </p>
              <Button className="w-full" size="lg">
                <Mic className="w-5 h-5 mr-2" />
                Parler à l'assistant
              </Button>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
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
          
          <h1 className="text-lg font-bold">MédiPatient</h1>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground"
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

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

      {/* Bottom Navigation */}
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

export default MVPPatientDashboard;
