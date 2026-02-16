import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { encryptData, decryptData } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';

interface SecureDataManagerProps {
  onDataEncrypted?: (encryptedData: string) => void;
  onDataDecrypted?: (decryptedData: string) => void;
}

const SecureDataManager: React.FC<SecureDataManagerProps> = ({
  onDataEncrypted,
  onDataDecrypted
}) => {
  const [sensitiveData, setSensitiveData] = useState('');
  const [encryptedData, setEncryptedData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleEncrypt = async () => {
    if (!sensitiveData.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir des données à chiffrer",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const encrypted = await encryptData(sensitiveData);
      setEncryptedData(encrypted);
      onDataEncrypted?.(encrypted);
      
      toast({
        title: "Chiffrement réussi",
        description: "Les données ont été chiffrées de manière sécurisée",
      });
    } catch (error) {
      toast({
        title: "Erreur de chiffrement", 
        description: "Impossible de chiffrer les données",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    if (!encryptedData.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir des données chiffrées à déchiffrer",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const decrypted = await decryptData(encryptedData);
      setSensitiveData(decrypted);
      onDataDecrypted?.(decrypted);
      
      toast({
        title: "Déchiffrement réussi",
        description: "Les données ont été déchiffrées avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur de déchiffrement",
        description: "Impossible de déchiffrer les données",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center text-primary">
          <Shield className="w-5 h-5 mr-2" />
          Gestionnaire de Données Sécurisées
        </CardTitle>
        <div className="flex items-center text-sm text-amber-600 bg-amber-50 p-2 rounded">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Chiffrement côté serveur pour une sécurité maximale
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sensitiveData">Données sensibles</Label>
          <Input
            id="sensitiveData"
            type="password"
            placeholder="Saisissez les données à chiffrer..."
            value={sensitiveData}
            onChange={(e) => setSensitiveData(e.target.value)}
          />
          <Button 
            onClick={handleEncrypt}
            disabled={isProcessing}
            className="w-full"
          >
            <Lock className="w-4 h-4 mr-2" />
            Chiffrer les données
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="encryptedData">Données chiffrées</Label>
          <Input
            id="encryptedData"
            placeholder="Collez les données chiffrées ici..."
            value={encryptedData}
            onChange={(e) => setEncryptedData(e.target.value)}
          />
          <Button 
            onClick={handleDecrypt}
            disabled={isProcessing}
            variant="outline"
            className="w-full"
          >
            <Shield className="w-4 h-4 mr-2" />
            Déchiffrer les données
          </Button>
        </div>

        <div className="mt-4 p-3 bg-green-50 rounded text-sm text-green-700">
          <div className="flex items-center font-medium mb-1">
            <Shield className="w-4 h-4 mr-1" />
            Sécurité renforcée
          </div>
          <p>
            Le chiffrement s'effectue côté serveur avec des clés sécurisées. 
            Toutes les opérations sont auditées et tracées.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecureDataManager;