import React, { useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Apple, Smartphone, Share2, Copy, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { APP_STORE_URL, PLAY_STORE_URL } from '@/config/app';

const useSEO = () => {
  useEffect(() => {
    const title = "Télécharger l'application patient iOS & Android";
    const desc = "Scannez le QR code pour installer l'application patient sur iOS ou Android";
    document.title = `${title} | Medipatient`;

    const ensureMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    ensureMeta('description', desc);

    // Canonical
    const canonicalHref = `${window.location.origin}/download`;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalHref);
  }, []);
};

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
          <QRCode value={url} size={160} viewBox={`0 0 160 160`} />
        </figure>
        <div className="w-full text-xs text-muted-foreground break-all flex items-center gap-2">
          <LinkIcon className="w-3.5 h-3.5" />
          <a href={url} className="underline underline-offset-2" target="_blank" rel="noreferrer">
            {url}
          </a>
        </div>
        <div className="flex gap-2 w-full">
          <Button className="flex-1" variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-1" /> Copier le lien
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

const AppDownload: React.FC = () => {
  useSEO();

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Télécharger l'application patient iOS & Android</h1>
        <p className="text-muted-foreground mt-1">Partagez ces QR codes aux patients pour installer l'application mobile.</p>
      </header>

      <section aria-label="QR codes de téléchargement" className="grid gap-6 md:grid-cols-2">
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
      </section>

      <aside className="mt-6 text-sm text-muted-foreground">
        Astuce: vous pouvez aussi partager l'URL de cette page (/download) aux patients.
      </aside>
    </main>
  );
};

export default AppDownload;
