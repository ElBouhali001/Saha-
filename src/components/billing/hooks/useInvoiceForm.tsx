
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { calculateTieredPrice, getPricingTier } from '../PricingTiers';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  basePrice: number;
  finalPrice: number;
  total: number;
}

interface PatientInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  coverage: string;
}

interface ConsultationTicket {
  type: string;
  basePrice: number;
}

interface InvoiceDetails {
  paymentMethod: string;
  notes: string;
  dueDate: string;
}

const consultationTypes = [
  { value: 'consultation-generale', label: 'Consultation générale', price: 15000 },
  { value: 'consultation-specialiste', label: 'Consultation spécialisée', price: 25000 },
  { value: 'urgence', label: 'Consultation urgence', price: 20000 },
  { value: 'teleconsultation', label: 'Téléconsultation', price: 12000 },
  { value: 'suivi', label: 'Consultation de suivi', price: 10000 }
];

export const useInvoiceForm = () => {
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    coverage: 'autre'
  });

  const [consultationTicket, setConsultationTicket] = useState<ConsultationTicket>({
    type: 'consultation-generale',
    basePrice: 15000
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { 
      id: '1', 
      description: 'Consultation générale', 
      quantity: 1, 
      basePrice: 15000,
      finalPrice: 9000,
      total: 9000 
    }
  ]);

  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails>({
    paymentMethod: '',
    notes: '',
    dueDate: ''
  });

  const updatePatientInfo = (field: keyof PatientInfo, value: string) => {
    setPatientInfo(prev => ({ ...prev, [field]: value }));
  };

  const updateInvoiceDetails = (field: keyof InvoiceDetails, value: string) => {
    setInvoiceDetails(prev => ({ ...prev, [field]: value }));
  };

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
      
      const finalPrice = calculateTieredPrice(consultationType.price, patientInfo.coverage);
      updateInvoiceItem('1', 'description', consultationType.label);
      updateInvoiceItem('1', 'basePrice', consultationType.price);
    }
  };

  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = () => {
    if (!patientInfo.name.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un patient",
        variant: "destructive"
      });
      return false;
    }

    if (invoiceItems.some(item => !item.description.trim() || item.basePrice <= 0)) {
      toast({
        title: "Erreur", 
        description: "Veuillez remplir tous les éléments de facturation",
        variant: "destructive"
      });
      return false;
    }

    const selectedTier = getPricingTier(patientInfo.coverage);
    
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

    return true;
  };

  return {
    patientInfo,
    consultationTicket,
    invoiceItems,
    invoiceDetails,
    consultationTypes,
    updatePatientInfo,
    updateInvoiceDetails,
    updatePricingForCoverage,
    addInvoiceItem,
    removeInvoiceItem,
    updateInvoiceItem,
    updateConsultationType,
    calculateSubtotal,
    calculateTax,
    calculateTotal,
    handleSubmit
  };
};
