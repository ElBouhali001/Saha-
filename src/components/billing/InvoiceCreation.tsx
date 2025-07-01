import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Save, Calculator, Send } from 'lucide-react';
import PricingTiersDisplay from './PricingTiers';
import PatientInfoSection from './sections/PatientInfoSection';
import ConsultationTypeSection from './sections/ConsultationTypeSection';
import InvoiceItemsSection from './sections/InvoiceItemsSection';
import FinancialSummary from './sections/FinancialSummary';
import InvoiceDetailsSection from './sections/InvoiceDetailsSection';
import InvoiceAttachmentsSection from './sections/InvoiceAttachmentsSection';
import { useInvoiceForm } from './hooks/useInvoiceForm';

const InvoiceCreation = () => {
  const {
    patientInfo,
    consultationTicket,
    invoiceItems,
    invoiceDetails,
    consultationTypes,
    attachments,
    setAttachments,
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
  } = useInvoiceForm();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const getSubmitButtonText = () => {
    switch (patientInfo.coverage) {
      case 'mutuelle':
        return 'Créer et transmettre à la mutuelle';
      case 'tiers-payant':
        return 'Créer et traiter les paiements';
      default:
        return 'Créer la facture';
    }
  };

  const getSubmitButtonIcon = () => {
    return patientInfo.coverage === 'autre' ? Save : Send;
  };

  const ButtonIcon = getSubmitButtonIcon();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Nouvelle Facture avec Tarification</span>
          </CardTitle>
          <CardDescription>
            Créer une facture avec application automatique des tarifs par tranches et transmission selon la prise en charge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <PatientInfoSection
              patientInfo={patientInfo}
              onUpdate={updatePatientInfo}
              onCoverageChange={updatePricingForCoverage}
              dueDate={invoiceDetails.dueDate}
              onDueDateChange={(date) => updateInvoiceDetails('dueDate', date)}
            />

            <ConsultationTypeSection
              consultationTicket={consultationTicket}
              consultationTypes={consultationTypes}
              onUpdate={updateConsultationType}
            />

            <PricingTiersDisplay 
              selectedCoverage={patientInfo.coverage}
              basePrice={consultationTicket.basePrice}
            />

            <InvoiceItemsSection
              invoiceItems={invoiceItems}
              onAddItem={addInvoiceItem}
              onRemoveItem={removeInvoiceItem}
              onUpdateItem={updateInvoiceItem}
            />

            <FinancialSummary
              subtotal={calculateSubtotal()}
              tax={calculateTax()}
              total={calculateTotal()}
              coverage={patientInfo.coverage}
              coverageRate={70}
            />

            <InvoiceAttachmentsSection
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              coverage={patientInfo.coverage}
            />

            <InvoiceDetailsSection
              invoiceDetails={invoiceDetails}
              onUpdate={updateInvoiceDetails}
              coverage={patientInfo.coverage}
            />

            <div className="flex space-x-4">
              <Button type="submit" className="flex-1">
                <ButtonIcon className="w-4 h-4 mr-2" />
                {getSubmitButtonText()}
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
