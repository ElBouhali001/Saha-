
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Stethoscope, Shield, UserCheck, FlaskConical, Pill, CreditCard } from 'lucide-react';
import { Tenant } from '@/types/tenant';

interface DemoProfile {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  icon: React.ReactNode;
  description: string;
}

interface DemoProfilesProps {
  tenant: Tenant;
  onSelectProfile: (email: string, password: string) => void;
}

export const DemoProfiles: React.FC<DemoProfilesProps> = ({ tenant, onSelectProfile }) => {
  const getDemoProfiles = (tenantName: string): DemoProfile[] => {
    const baseProfiles: DemoProfile[] = [
      {
        id: 'admin',
        name: 'Administrateur',
        email: `admin@${tenantName.toLowerCase().replace(/\s+/g, '')}.com`,
        password: 'admin123',
        role: 'Administrateur',
        icon: <Shield className="h-5 w-5" />,
        description: 'Accès complet à toutes les fonctionnalités'
      },
      {
        id: 'doctor',
        name: 'Dr. Kouamé',
        email: `dr.kouame@${tenantName.toLowerCase().replace(/\s+/g, '')}.com`,
        password: 'doctor123',
        role: 'Médecin',
        icon: <Stethoscope className="h-5 w-5" />,
        description: 'Consultations, prescriptions, agenda médical'
      },
      {
        id: 'agent',
        name: 'Agent Accueil',
        email: `agent@${tenantName.toLowerCase().replace(/\s+/g, '')}.com`,
        password: 'agent123',
        role: 'Agent',
        icon: <UserCheck className="h-5 w-5" />,
        description: 'Gestion patients, rendez-vous, accueil'
      },
      {
        id: 'patient',
        name: 'Patient Démo',
        email: `patient@${tenantName.toLowerCase().replace(/\s+/g, '')}.com`,
        password: 'patient123',
        role: 'Patient',
        icon: <User className="h-5 w-5" />,
        description: 'Interface patient, rendez-vous, dossier médical'
      }
    ];

    // Ajouter des profils spécifiques selon le plan
    if (tenant.subscription_plan === 'professional' || tenant.subscription_plan === 'enterprise') {
      baseProfiles.push(
        {
          id: 'lab_technician',
          name: 'Technicien Labo',
          email: `labo@${tenantName.toLowerCase().replace(/\s+/g, '')}.com`,
          password: 'labo123',
          role: 'Technicien',
          icon: <FlaskConical className="h-5 w-5" />,
          description: 'Gestion laboratoire, analyses, résultats'
        },
        {
          id: 'pharmacist',
          name: 'Pharmacien',
          email: `pharmacien@${tenantName.toLowerCase().replace(/\s+/g, '')}.com`,
          password: 'pharma123',
          role: 'Pharmacien',
          icon: <Pill className="h-5 w-5" />,
          description: 'Gestion pharmacie, ordonnances, stock'
        }
      );
    }

    if (tenant.subscription_plan === 'enterprise') {
      baseProfiles.push({
        id: 'insurance_agent',
        name: 'Agent Assurance',
        email: `assurance@${tenantName.toLowerCase().replace(/\s+/g, '')}.com`,
        password: 'assurance123',
        role: 'Assurance',
        icon: <CreditCard className="h-5 w-5" />,
        description: 'Gestion assurances, remboursements'
      });
    }

    return baseProfiles;
  };

  const profiles = getDemoProfiles(tenant.name);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-6 w-6" />
          Profils de démonstration - {tenant.name}
        </CardTitle>
        <CardDescription>
          Sélectionnez un profil pour vous connecter et explorer les fonctionnalités
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <Card key={profile.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {profile.icon}
                    <CardTitle className="text-lg">{profile.name}</CardTitle>
                  </div>
                  <Badge variant="outline">{profile.role}</Badge>
                </div>
                <CardDescription className="text-sm">
                  {profile.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 mb-4">
                  <div className="text-xs text-gray-600">
                    <strong>Email:</strong> {profile.email}
                  </div>
                  <div className="text-xs text-gray-600">
                    <strong>Mot de passe:</strong> {profile.password}
                  </div>
                </div>
                <Button 
                  size="sm"
                  className="w-full"
                  onClick={() => onSelectProfile(profile.email, profile.password)}
                >
                  Se connecter
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
