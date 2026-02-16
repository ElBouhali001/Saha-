
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Save, Calculator } from 'lucide-react';
import PricingTiersDisplay from './PricingTiers';
import PatientInfoSection from './sections/PatientInfoSection';
import ConsultationTypeSection from './sections/ConsultationTypeSection';
import InvoiceItemsSection from './sections/InvoiceItemsSection';
import FinancialSummary from './sections/FinancialSummary';
import InvoiceDetailsSection from './sections/InvoiceDetailsSection';
import { useInvoiceForm } from './hooks/useInvoiceForm';

const InvoiceCreation = () => {
  const { t } = useTranslation();
  const {
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
  } = useInvoiceForm();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>{t('billing.invoice_creation.title')}</span>
          </CardTitle>
          <CardDescription>
            {t('billing.invoice_creation.subtitle')}
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
            />

            <InvoiceDetailsSection
              invoiceDetails={invoiceDetails}
              onUpdate={updateInvoiceDetails}
            />

            <div className="flex space-x-4">
              <Button type="submit" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {t('billing.actions.create_invoice')}
              </Button>
              <Button type="button" variant="outline" className="flex-1">
                <Calculator className="w-4 h-4 mr-2" />
                {t('billing.actions.preview_print')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceCreation;
