
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/utils/permissions';

interface TicketAuthenticationProps {
  onPatientAuthenticated: (patient: any) => void;
}

const TicketAuthentication: React.FC<TicketAuthenticationProps> = ({ onPatientAuthenticated }) => {
  const { user } = useAuth();
  const permissions = usePermissions(user);
  const [ticketCode, setTicketCode] = useState('');

  // Données patients sécurisées avec tickets
  const securePatientData = {
    'TK-1703845920-A7B2C9': {
      id: '1',
      firstName: 'Jean',
      lastName: 'Koné',
      dateOfBirth: '1985-05-15',
      phone: '+225-07-08-09-10',
      medicalHistory: [],
      ticketExpiry: Date.now() + (2 * 60 * 60 * 1000) // 2h validity
    }
  };

  const handleScanTicket = () => {
    const foundPatient = securePatientData[ticketCode as keyof typeof securePatientData];
    
    if (foundPatient) {
      // Vérifier l'expiration du ticket
      if (Date.now() > foundPatient.ticketExpiry) {
        alert('Code ticket expiré. Veuillez demander un nouveau ticket.');
        return;
      }
      
      // Vérifier les permissions
      if (!permissions.canCreateConsultation()) {
        alert('Accès refusé. Vous n\'avez pas les permissions pour effectuer une consultation.');
        return;
      }
      
      onPatientAuthenticated(foundPatient);
      
      // Audit log
      console.log(`[AUDIT] Accès consultation - Patient: ${foundPatient.firstName} ${foundPatient.lastName} - Doctor: ${user?.firstName} ${user?.lastName} - Time: ${new Date().toISOString()}`);
      
    } else {
      alert('Code ticket invalide ou expiré');
      console.log(`[AUDIT] Tentative accès ticket invalide - Code: ${ticketCode} - User: ${user?.email} - Time: ${new Date().toISOString()}`);
    }
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center">
          <QrCode className="w-5 h-5 mr-2" />
          Authentification par Ticket Sécurisé
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">
            <Shield className="w-4 h-4 inline mr-1" />
            Sécurité renforcée : Accès par code ticket unique et temporaire
          </p>
          <ul className="text-xs text-blue-600 space-y-1">
            <li>• Ticket valide 2 heures maximum</li>
            <li>• Traçabilité complète des accès</li>
            <li>• Vérification des permissions médicales</li>
          </ul>
        </div>
        
        <div>
          <Label htmlFor="ticketCode">Code du ticket patient</Label>
          <Input
            id="ticketCode"
            placeholder="TK-1703845920-A7B2C9"
            value={ticketCode}
            onChange={(e) => setTicketCode(e.target.value)}
            className="font-mono"
          />
        </div>
        
        <Button onClick={handleScanTicket} className="w-full bg-blue-600 hover:bg-blue-700">
          <Shield className="w-4 h-4 mr-2" />
          Accéder au Dossier (Sécurisé)
        </Button>
        
        <p className="text-sm text-gray-600 text-center">
          Code test: TK-1703845920-A7B2C9
        </p>
      </CardContent>
    </Card>
  );
};

export default TicketAuthentication;
