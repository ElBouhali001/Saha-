import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMVPConsultationTypes } from '@/hooks/useMVPData';
import { DollarSign, Smartphone, Printer, CheckCircle, Loader2 } from 'lucide-react';

const MVPBilling = () => {
  const { data: consultationTypes, isLoading } = useMVPConsultationTypes();
  const [selected, setSelected] = useState<any>(null);
  const [paid, setPaid] = useState(false);
  const { toast } = useToast();

  // Set first item as selected when data loads
  React.useEffect(() => {
    if (consultationTypes && consultationTypes.length > 0 && !selected) {
      setSelected(consultationTypes[0]);
    }
  }, [consultationTypes, selected]);

  const handleOrangeMoneyPayment = () => {
    toast({
      title: "Paiement Orange Money",
      description: "Code *144*montant# envoyé au patient",
    });
    setTimeout(() => {
      setPaid(true);
      toast({
        title: "Paiement confirmé",
        description: `${selected.price} FCFA reçus`,
      });
    }, 2000);
  };

  const handlePrintReceipt = () => {
    toast({
      title: "Reçu généré",
      description: "Prêt à imprimer ou envoyer par SMS",
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <Card className="p-4 bg-gradient-to-br from-primary/10 to-background">
        <h3 className="font-semibold mb-2">Tarifs prédéfinis</h3>
        <p className="text-sm text-muted-foreground">Chargés depuis Supabase</p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {consultationTypes?.map((item) => (
          <Card
            key={item.name}
            className={`p-4 cursor-pointer transition-all ${
              selected?.name === item.name
                ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelected(item)}
          >
            <p className="font-semibold text-sm mb-2">{item.name}</p>
            <p className="text-lg font-bold">{item.price.toLocaleString()} FCFA</p>
          </Card>
        ))}
      </div>

      {selected && (
        <Card className="p-6 bg-accent/50">
          <div className="text-center space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Montant à payer</p>
              <p className="text-3xl font-bold text-primary">
                {selected.price.toLocaleString()} FCFA
              </p>
            </div>

            {!paid ? (
              <div className="space-y-2">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleOrangeMoneyPayment}
                >
                  <Smartphone className="w-5 h-5 mr-2" />
                  Payer avec Orange Money
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={() => setPaid(true)}
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  Paiement en espèces
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-semibold">Paiement confirmé</span>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handlePrintReceipt}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Générer le reçu
                </Button>

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setPaid(false)}
                >
                  Nouvelle transaction
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Rapport du jour</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Consultations</span>
            <span className="font-semibold">12</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Orange Money</span>
            <span className="font-semibold">35,000 FCFA</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Espèces</span>
            <span className="font-semibold">10,000 FCFA</span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-lg text-primary">45,000 FCFA</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MVPBilling;
