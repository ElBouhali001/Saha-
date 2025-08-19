import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { QrCode, Smartphone, RotateCcw } from 'lucide-react';
import { useQRDisplay } from '@/contexts/QRDisplayContext';
import { useToast } from '@/components/ui/use-toast';

const QRDisplaySettings: React.FC = () => {
  const { settings, updateSettings, resetToDefaults } = useQRDisplay();
  const { toast } = useToast();

  const handleReset = () => {
    resetToDefaults();
    toast({
      title: "Paramètres réinitialisés",
      description: "Les paramètres d'affichage des QR codes ont été remis aux valeurs par défaut.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres QR Codes</h1>
        <p className="text-gray-600">Gérez l'affichage des codes QR dans votre interface</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Options d'affichage des QR Codes
          </CardTitle>
          <CardDescription>
            Contrôlez quels éléments QR sont visibles dans vos tableaux de bord
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-1 flex-1">
              <Label htmlFor="patient-qr" className="text-sm font-medium">
                QR d'activation patients
              </Label>
              <p className="text-sm text-muted-foreground">
                Affiche les codes QR pour l'activation des comptes patients
              </p>
            </div>
            <Switch
              id="patient-qr"
              checked={settings.showPatientClaimQR}
              onCheckedChange={(checked) => 
                updateSettings({ showPatientClaimQR: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-1 flex-1">
              <Label htmlFor="appstore-qr" className="text-sm font-medium flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                QR de téléchargement application
              </Label>
              <p className="text-sm text-muted-foreground">
                Affiche les codes QR pour télécharger l'application mobile (iOS et Android)
              </p>
            </div>
            <Switch
              id="appstore-qr"
              checked={settings.showAppStoreQR}
              onCheckedChange={(checked) => 
                updateSettings({ showAppStoreQR: checked })
              }
            />
          </div>

          <Separator />

          <div className="pt-4">
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="w-full sm:w-auto"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Réinitialiser aux valeurs par défaut
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            • Les QR codes d'activation patients permettent aux nouveaux patients de revendiquer leur compte
          </p>
          <p>
            • Les QR codes de téléchargement dirigent vers les app stores pour installer l'application mobile
          </p>
          <p>
            • Ces paramètres sont sauvegardés localement et persistent entre les sessions
          </p>
          <p>
            • Vous pouvez modifier ces paramètres à tout moment depuis ce menu
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRDisplaySettings;