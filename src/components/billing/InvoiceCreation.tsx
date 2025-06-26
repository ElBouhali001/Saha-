
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Plus, Minus, Save, FileText, Calculator } from 'lucide-react';
import PricingTiersDisplay, { calculateTieredPrice, getPricingTier } from './PricingTiers';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  basePrice: number;
  finalPrice: number;
  total: number;
}

const InvoiceCreation = () => {
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    coverage: 'autre' // Type de prise en charge
  });

  const [consultationTicket, setConsultationTicket] = useState({
    type: 'consultation-generale',
    basePrice: 15000
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { 
      id: '1', 
      description: 'Consultation générale', 
      quantity: 1, 
      basePrice: 15000,
      finalPrice: 9000, // Prix calculé selon tranche C par défaut
      total: 9000 
    }
  ]);

  const [invoiceDetails, setInvoiceDetails] = useState({
    paymentMethod: '',
    notes: '',
    dueDate: ''
  });

  // Types de consultations avec prix de base
  const consultationTypes = [
    { value: 'consultation-generale', label: 'Consultation générale', price: 15000 },
    { value: 'consultation-specialiste', label: 'Consultation spécialisée', price: 25000 },
    { value: 'urgence', label: 'Consultation urgence', price: 20000 },
    { value: 'teleconsultation', label: 'Téléconsultation', price: 12000 },
    { value: 'suivi', label: 'Consultation de suivi', price: 10000 }
  ];

  // Recalculer les prix quand la prise en charge change
  const updatePricingForCoverage = (newCoverage: string) => {
    const updatedItems = invoiceItems.map(item => {
      const finalPrice = calculateTieredPrice(item.basePrice, newCoverage);
      return {
        ...item,
        finalPrice,
        total: finalPrice * item.quantity
      };
    });
    setInvoiceItems(updatedItems);
    
    // Mettre à jour le ticket de consultation
    const consultationFinalPrice = calculateTieredPrice(consultationTicket.basePrice, newCoverage);
    updatedItems[0] = {
      ...updatedItems[0],
      finalPrice: consultationFinalPrice,
      total: consultationFinalPrice * updatedItems[0].quantity
    };
    setInvoiceItems(updatedItems);
  };

  const addInvoiceItem = () => {
    const finalPrice = calculateTieredPrice(0, patientInfo.coverage);
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      basePrice: 0,
      finalPrice: finalPrice,
      total: 0
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  const removeInvoiceItem = (id: string) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter(item => item.id !== id));
    }
  };

  const updateInvoiceItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoiceItems(invoiceItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'basePrice') {
          updatedItem.finalPrice = calculateTieredPrice(Number(value), patientInfo.coverage);
        }
        
        if (field === 'quantity' || field === 'basePrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.finalPrice;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const updateConsultationType = (newType: string) => {
    const consultationType = consultationTypes.find(ct => ct.value === newType);
    if (consultationType) {
      setConsultationTicket({
        type: newType,
        basePrice: consultationType.price
      });
      
      // Mettre à jour le premier élément (consultation)
      const finalPrice = calculateTieredPrice(consultationType.price, patientInfo.coverage);
      updateInvoiceItem('1', 'description', consultationType.label);
      updateInvoiceItem('1', 'basePrice', consultationType.price);
    }
  };

  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18; // TVA 18%
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientInfo.name.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un patient",
        variant: "destructive"
      });
      return;
    }

    if (invoiceItems.some(item => !item.description.trim() || item.basePrice <= 0)) {
      toast({
        title: "Erreur", 
        description: "Veuillez remplir tous les éléments de facturation",
        variant: "destructive"
      });
      return;
    }

    const selectedTier = getPricingTier(patientInfo.coverage);
    
    // Simuler la création de facture
    console.log('Création facture avec tarification:', {
      patient: patientInfo,
      consultationTicket,
      pricingTier: selectedTier,
      items: invoiceItems,
      details: invoiceDetails,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal()
    });

    toast({
      title: "Facture créée",
      description: `Facture créée avec tarif ${selectedTier.tier} pour ${patientInfo.name}`,
    });

    // Réinitialiser le formulaire
    setPatientInfo({ name: '', phone: '', email: '', address: '', coverage: 'autre' });
    setConsultationTicket({ type: 'consultation-generale', basePrice: 15000 });
    setInvoiceItems([{ 
      id: '1', 
      description: 'Consultation générale', 
      quantity: 1, 
      basePrice: 15000,
      finalPrice: 9000,
      total: 9000 
    }]);
    setInvoiceDetails({ paymentMethod: '', notes: '', dueDate: '' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Nouvelle Facture avec Tarification</span>
          </CardTitle>
          <CardDescription>
            Créer une facture avec application automatique des tarifs par tranches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations Patient et Prise en charge */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient-name">Nom du Patient *</Label>
                <Input
                  id="patient-name"
                  value={patientInfo.name}
                  onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
                  placeholder="Rechercher un patient..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverage-type">Type de prise en charge *</Label>
                <Select 
                  value={patientInfo.coverage} 
                  onValueChange={(value) => {
                    setPatientInfo({...patientInfo, coverage: value});
                    updatePricingForCoverage(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la prise en charge" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mutuelle">Mutuelle (Tranche A)</SelectItem>
                    <SelectItem value="tiers-payant">Tiers payant (Tranche B)</SelectItem>
                    <SelectItem value="autre">Autre (Tranche C)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-phone">Téléphone</Label>
                <Input
                  id="patient-phone"
                  value={patientInfo.phone}
                  onChange={(e) => setPatientInfo({...patientInfo, phone: e.target.value})}
                  placeholder="+225 XX XX XX XX XX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due-date">Date d'échéance</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={invoiceDetails.dueDate}
                  onChange={(e) => setInvoiceDetails({...invoiceDetails, dueDate: e.target.value})}
                />
              </div>
            </div>

            {/* Type de consultation */}
            <div className="space-y-2">
              <Label htmlFor="consultation-type">Type de consultation</Label>
              <Select 
                value={consultationTicket.type} 
                onValueChange={updateConsultationType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type de consultation" />
                </SelectTrigger>
                <SelectContent>
                  {consultationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} - {type.price.toLocaleString()} CFA
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Affichage du système de tarification */}
            <PricingTiersDisplay 
              selectedCoverage={patientInfo.coverage}
              basePrice={consultationTicket.basePrice}
            />

            {/* Éléments de facturation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Éléments de facturation</h3>
                <Button type="button" onClick={addInvoiceItem} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>

              <div className="space-y-3">
                {invoiceItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-4">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                        placeholder="Consultation, médicament..."
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-1">
                      <Label className="text-xs">Qté</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateInvoiceItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Prix de base</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.basePrice}
                        onChange={(e) => updateInvoiceItem(item.id, 'basePrice', parseFloat(e.target.value) || 0)}
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Prix appliqué</Label>
                      <Input
                        value={item.finalPrice.toLocaleString() + ' CFA'}
                        readOnly
                        className="h-9 bg-blue-50 text-blue-800 font-medium"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Total</Label>
                      <Input
                        value={item.total.toLocaleString() + ' CFA'}
                        readOnly
                        className="h-9 bg-gray-50"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeInvoiceItem(item.id)}
                        disabled={invoiceItems.length === 1}
                        className="h-9 w-9 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Résumé financier */}
            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sous-total:</span>
                    <span>{calculateSubtotal().toLocaleString()} CFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>TVA (18%):</span>  
                    <span>{calculateTax().toLocaleString()} CFA</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>{calculateTotal().toLocaleString()} CFA</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Détails additionnels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment-method">Mode de paiement</Label>
                <Select value={invoiceDetails.paymentMethod} onValueChange={(value) => setInvoiceDetails({...invoiceDetails, paymentMethod: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le mode de paiement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Espèces</SelectItem>
                    <SelectItem value="mobile-money">Mobile Money</SelectItem>
                    <SelectItem value="bank-transfer">Virement bancaire</SelectItem>
                    <SelectItem value="check">Chèque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={invoiceDetails.notes}
                  onChange={(e) => setInvoiceDetails({...invoiceDetails, notes: e.target.value})}
                  placeholder="Notes additionnelles..."
                  className="h-20"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Créer la facture
              </Button>
              <Button type="button" variant="outline" className="flex-1">
                <Calculator className="w-4 h-4 mr-2" />
                Aperçu et Impression
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceCreation;
