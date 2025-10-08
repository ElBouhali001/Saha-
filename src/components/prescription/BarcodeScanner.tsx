import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Scan, 
  Camera, 
  CheckCircle, 
  XCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BarcodeScannerProps {
  prescriptionId: string;
  patientId: string;
  medications: any[];
  onScanComplete: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  prescriptionId,
  patientId,
  medications,
  onScanComplete
}) => {
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scannedMedications, setScannedMedications] = useState<any[]>([]);
  const [currentScan, setCurrentScan] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      // Cleanup camera on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      setScanning(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'accéder à la caméra",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const scanBarcode = async (barcode: string) => {
    if (!barcode) return;

    setCurrentScan({ loading: true, barcode });

    try {
      const { data, error } = await supabase.functions.invoke('scan-medication-barcode', {
        body: {
          barcode,
          prescriptionId,
          patientId
        }
      });

      if (error) throw error;

      if (data.success) {
        setScannedMedications([...scannedMedications, {
          ...data.medication,
          prescriptionMatch: data.prescriptionMatch,
          scannedAt: new Date().toISOString()
        }]);

        toast({
          title: data.prescriptionMatch ? "✅ Médicament validé" : "⚠️ Attention",
          description: data.message,
          variant: data.prescriptionMatch ? "default" : "destructive",
        });

        // Check if all medications have been scanned
        const totalMeds = medications.length;
        const scannedCount = scannedMedications.length + 1;
        
        if (scannedCount >= totalMeds) {
          toast({
            title: "🎉 Scan terminé",
            description: "Tous les médicaments ont été scannés",
          });
          stopCamera();
          onScanComplete();
        }
      } else {
        toast({
          title: "❌ Erreur",
          description: data.error || "Médicament non reconnu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du scan",
        variant: "destructive",
      });
    } finally {
      setCurrentScan(null);
      setManualBarcode('');
    }
  };

  const handleManualScan = () => {
    if (manualBarcode) {
      scanBarcode(manualBarcode);
    }
  };

  return (
    <div className="space-y-4">
      {/* Camera view */}
      <Card>
        <CardContent className="p-4">
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '300px' }}>
            {scanning ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-32 border-4 border-primary rounded-lg"></div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <Camera className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-sm opacity-75">Caméra désactivée</p>
              </div>
            )}
          </div>

          <div className="flex space-x-2 mt-4">
            {!scanning ? (
              <Button onClick={startCamera} className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Activer la caméra
              </Button>
            ) : (
              <Button onClick={stopCamera} variant="outline" className="flex-1">
                Arrêter la caméra
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual input */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-2">Saisie manuelle du code-barres</p>
          <div className="flex space-x-2">
            <Input
              placeholder="Entrez le code-barres"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
              disabled={currentScan?.loading}
            />
            <Button 
              onClick={handleManualScan}
              disabled={!manualBarcode || currentScan?.loading}
            >
              {currentScan?.loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Scan className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Progression</p>
            <Badge variant="outline">
              {scannedMedications.length} / {medications.length}
            </Badge>
          </div>
          
          {/* Expected medications */}
          <div className="space-y-2 mb-4">
            <p className="text-xs text-muted-foreground">Médicaments à scanner:</p>
            {medications.map((med, idx) => {
              const isScanned = scannedMedications.some(s => 
                s.name.toLowerCase().includes(med.medicationName?.toLowerCase() || '') ||
                s.molecule?.toLowerCase() === med.molecule?.toLowerCase()
              );

              return (
                <div key={idx} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                  <span className="text-sm">{med.medicationName || med.name}</span>
                  {isScanned ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Scanned medications */}
          {scannedMedications.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Médicaments scannés:</p>
              {scannedMedications.map((med, idx) => (
                <Alert key={idx} variant={med.prescriptionMatch ? "default" : "destructive"}>
                  <AlertDescription className="text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{med.name}</p>
                        <p className="text-xs text-muted-foreground">{med.dosage} - {med.form}</p>
                      </div>
                      {med.prescriptionMatch ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BarcodeScanner;
