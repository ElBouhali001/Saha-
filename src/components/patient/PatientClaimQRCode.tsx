import React from 'react';
import QRCode from 'react-qr-code';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PatientClaimQRCodeProps {
  patientName: string;
  claimUrl: string;
}

const PatientClaimQRCode: React.FC<PatientClaimQRCodeProps> = ({ patientName, claimUrl }) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(claimUrl);
      toast({ title: 'Lien copié', description: "Le lien d'activation a été copié dans le presse-papiers." });
    } catch (e) {
      toast({ title: 'Erreur', description: 'Impossible de copier le lien.' });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Activation patient", text: `QR d'activation pour ${patientName}`, url: claimUrl });
      } catch (_) {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{patientName}</CardTitle>
        <CardDescription>QR d'activation du compte patient</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        <div className="p-3 bg-white rounded-md border">
          <QRCode value={claimUrl} size={120} viewBox={`0 0 120 120`} />
        </div>
        <div className="w-full text-xs text-muted-foreground break-all flex items-center gap-2">
          <LinkIcon className="w-3.5 h-3.5" />
          <a href={claimUrl} className="underline underline-offset-2" aria-label="Lien d'activation patient">
            {claimUrl}
          </a>
        </div>
        <div className="flex gap-2 w-full">
          <Button className="flex-1" size="sm" onClick={handleCopy} variant="outline">
            <Copy className="w-4 h-4 mr-1" /> Copier le lien
          </Button>
          <Button className="flex-1" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-1" /> Partager
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientClaimQRCode;
