import React from 'react';
import QRCode from 'react-qr-code';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Apple, Smartphone, Share2, Copy, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { APP_STORE_URL, PLAY_STORE_URL } from '@/config/app';

const QRBlock: React.FC<{
  title: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  cta: string;
}> = ({ title, description, url, icon, cta }) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Lien copié', description: "Le lien de téléchargement a été copié." });
    } catch (_) {
      toast({ title: 'Erreur', description: 'Impossible de copier le lien.' });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
      } catch (_) {
        // cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          <span>{title}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <figure className="p-3 rounded-md border bg-background" aria-label={`QR code ${title}`}>
          <QRCode value={url} size={140} viewBox={`0 0 140 140`} />
        </figure>
        <div className="w-full text-xs text-muted-foreground break-all flex items-center gap-2">
          <LinkIcon className="w-3.5 h-3.5" />
          <a href={url} className="underline underline-offset-2" target="_blank" rel="noreferrer">
            {url}
          </a>
        </div>
        <div className="flex gap-2 w-full">
          <Button className="flex-1" variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-1" /> Copier
          </Button>
          <Button className="flex-1" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-1" /> Partager
          </Button>
        </div>
        <Button asChild className="w-full">
          <a href={url} target="_blank" rel="noreferrer" aria-label={cta}>
            {cta}
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

const AppStoreQRCodes: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Téléchargement de l'app patient (démo)</CardTitle>
        <CardDescription>QR codes pour iOS et Android afin de partager l'application avec les patients</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QRBlock
            title="iOS (App Store)"
            description="Scannez avec l'appareil photo de l'iPhone pour ouvrir l'App Store."
            url={APP_STORE_URL}
            icon={<Apple className="w-5 h-5" />}
            cta="Ouvrir dans l'App Store"
          />
          <QRBlock
            title="Android (Google Play)"
            description="Scannez avec l'appareil photo de votre smartphone Android pour ouvrir Google Play."
            url={PLAY_STORE_URL}
            icon={<Smartphone className="w-5 h-5" />}
            cta="Ouvrir sur Google Play"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AppStoreQRCodes;
