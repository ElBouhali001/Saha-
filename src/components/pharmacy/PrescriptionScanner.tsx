import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Upload, 
  FileText, 
  Scan, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Plus,
  Pill
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePrescriptionRecognition } from '@/hooks/usePrescriptionRecognition';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  found_in_inventory: boolean;
  inventory_id?: string;
}

interface PrescriptionData {
  doctor_name: string;
  patient_name: string;
  prescription_date: string;
  medications: Medication[];
  notes?: string;
}

interface PrescriptionScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onPrescriptionProcessed: (medications: Medication[]) => void;
  inventory: any[];
}

const PrescriptionScanner: React.FC<PrescriptionScannerProps> = ({
  isOpen,
  onClose,
  onPrescriptionProcessed,
  inventory
}) => {
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [manualText, setManualText] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Use the prescription recognition hook
  const { isProcessing, processImage: processImageOCR, processManualText: processManualTextOCR, convertToSaleItems } = usePrescriptionRecognition(inventory);
  
  // Extract pharmacy ID from inventory
  const pharmacyId = inventory[0]?.pharmacy_id;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier image",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!uploadedImage) return;
    
    try {
      const result = await processImageOCR(uploadedImage, pharmacyId);
      
      // Transform result to PrescriptionData format
      const prescriptionData: PrescriptionData = {
        doctor_name: result.doctor_name || "Médecin non identifié",
        patient_name: result.patient_name || "Patient non identifié",
        prescription_date: result.date || new Date().toISOString().split('T')[0],
        medications: result.medications.map(med => ({
          name: med.name,
          dosage: med.dosage,
          frequency: "À déterminer",
          duration: "À déterminer",
          quantity: 1,
          found_in_inventory: !!med.inventory_id,
          inventory_id: med.inventory_id
        })),
        notes: "Ordonnance scannée via OCR"
      };
      
      setPrescriptionData(prescriptionData);
    } catch (error) {
      console.error('Error processing image:', error);
    }
  };

  const processManualText = () => {
    if (!manualText.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer le texte de l'ordonnance",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = processManualTextOCR(manualText);
      
      // Transform result to PrescriptionData format
      const prescriptionData: PrescriptionData = {
        doctor_name: result.doctor_name || "Médecin non identifié",
        patient_name: result.patient_name || "Patient non identifié",
        prescription_date: result.date || new Date().toISOString().split('T')[0],
        medications: result.medications.map(med => ({
          name: med.name,
          dosage: med.dosage,
          frequency: "À déterminer",
          duration: "À déterminer",
          quantity: 1,
          found_in_inventory: !!med.inventory_id,
          inventory_id: med.inventory_id
        })),
        notes: "Saisie manuelle"
      };
      
      setPrescriptionData(prescriptionData);
    } catch (error) {
      console.error('Error processing manual text:', error);
    }
  };

  const handleValidatePrescription = () => {
    if (prescriptionData) {
      onPrescriptionProcessed(prescriptionData.medications);
      handleClose();
    }
  };

  const handleClose = () => {
    setUploadedImage(null);
    setPrescriptionData(null);
    setManualText('');
    setActiveTab('upload');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="w-5 h-5" />
            Reconnaissance d'Ordonnance
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Onglets */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === 'upload' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('upload')}
              className="flex-1"
            >
              <Camera className="w-4 h-4 mr-2" />
              Scanner/Upload
            </Button>
            <Button
              variant={activeTab === 'manual' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('manual')}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              Saisie manuelle
            </Button>
          </div>

          {/* Contenu Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {!uploadedImage && (
                <Card className="border-dashed border-2">
                  <CardContent className="p-8 text-center">
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <Upload className="w-12 h-12 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">Uploader une ordonnance</p>
                        <p className="text-sm text-muted-foreground">
                          Formats supportés: JPG, PNG, PDF
                        </p>
                      </div>
                      <Button onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-2" />
                        Choisir un fichier
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {uploadedImage && !prescriptionData && (
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <img
                        src={uploadedImage}
                        alt="Ordonnance uploadée"
                        className="max-w-full h-auto rounded-lg border"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={processImage}
                          disabled={isProcessing}
                          className="flex-1"
                        >
                          {isProcessing ? (
                            <>
                              <Scan className="w-4 h-4 mr-2 animate-spin" />
                              Analyse en cours...
                            </>
                          ) : (
                            <>
                              <Scan className="w-4 h-4 mr-2" />
                              Analyser l'ordonnance
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setUploadedImage(null)}
                        >
                          Changer d'image
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Contenu Saisie manuelle */}
          {activeTab === 'manual' && !prescriptionData && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Saisie manuelle</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="manual-text">
                      Texte de l'ordonnance
                    </Label>
                    <Textarea
                      id="manual-text"
                      placeholder="Copiez ici le texte de l'ordonnance ou listez les médicaments prescrits..."
                      value={manualText}
                      onChange={(e) => setManualText(e.target.value)}
                      rows={8}
                    />
                  </div>
                  <Button
                    onClick={processManualText}
                    disabled={!manualText.trim() || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Scan className="w-4 h-4 mr-2 animate-spin" />
                        Analyse en cours...
                      </>
                    ) : (
                      <>
                        <Scan className="w-4 h-4 mr-2" />
                        Analyser le texte
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Résultats de l'analyse */}
          {prescriptionData && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Ordonnance analysée
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Médecin:</span> {prescriptionData.doctor_name}
                    </div>
                    <div>
                      <span className="font-medium">Patient:</span> {prescriptionData.patient_name}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {new Date(prescriptionData.prescription_date).toLocaleDateString('fr-FR')}
                    </div>
                    <div>
                      <span className="font-medium">Médicaments:</span> {prescriptionData.medications.length}
                    </div>
                  </div>

                  {prescriptionData.notes && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium">Notes:</span> {prescriptionData.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="w-5 h-5" />
                    Médicaments prescrits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prescriptionData.medications.map((medication, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium">{medication.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {medication.dosage} - {medication.frequency}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Durée: {medication.duration} - Quantité: {medication.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {medication.found_in_inventory ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                En stock
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Non disponible
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Annuler
                </Button>
                <Button onClick={handleValidatePrescription}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter à la vente
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionScanner;