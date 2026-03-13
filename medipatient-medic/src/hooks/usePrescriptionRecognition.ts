import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface MedicationMatch {
  name: string;
  dosage: string;
  confidence: number;
  inventory_id?: string;
  suggestions: string[];
}

interface PrescriptionAnalysis {
  doctor_name?: string;
  patient_name?: string;
  date?: string;
  medications: MedicationMatch[];
  raw_text: string;
}

export const usePrescriptionRecognition = (inventory: any[]) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Fonction pour analyser le texte et trouver des correspondances
  const analyzeText = useCallback((text: string): PrescriptionAnalysis => {
    const lines = text.toLowerCase().split('\n').filter(line => line.trim());
    const medications: MedicationMatch[] = [];
    
    // Mots-clés pour identifier les informations de prescription
    const doctorPatterns = [/dr\.?\s+([a-z\s]+)/i, /docteur\s+([a-z\s]+)/i, /médecin\s+([a-z\s]+)/i];
    const patientPatterns = [/patient\s*:\s*([a-z\s]+)/i, /nom\s*:\s*([a-z\s]+)/i];
    const datePatterns = [/(\d{1,2}\/\d{1,2}\/\d{4})/i, /(\d{1,2}-\d{1,2}-\d{4})/i];

    let doctor_name, patient_name, date;

    // Recherche des informations de base
    for (const line of lines) {
      if (!doctor_name) {
        for (const pattern of doctorPatterns) {
          const match = line.match(pattern);
          if (match) doctor_name = match[1].trim();
        }
      }
      
      if (!patient_name) {
        for (const pattern of patientPatterns) {
          const match = line.match(pattern);
          if (match) patient_name = match[1].trim();
        }
      }
      
      if (!date) {
        for (const pattern of datePatterns) {
          const match = line.match(pattern);
          if (match) date = match[1];
        }
      }
    }

    // Recherche des médicaments
    for (const line of lines) {
      const cleanLine = line.trim();
      if (cleanLine.length < 3) continue;

      // Recherche exacte dans l'inventaire
      const exactMatch = inventory.find(item => 
        cleanLine.includes(item.name.toLowerCase()) ||
        (item.generic_name && cleanLine.includes(item.generic_name.toLowerCase()))
      );

      if (exactMatch) {
        medications.push({
          name: exactMatch.name,
          dosage: exactMatch.dosage,
          confidence: 0.9,
          inventory_id: exactMatch.id,
          suggestions: []
        });
        continue;
      }

      // Recherche partielle avec suggestions
      const partialMatches = inventory.filter(item => {
        const itemName = item.name.toLowerCase();
        const genericName = item.generic_name?.toLowerCase() || '';
        
        return itemName.includes(cleanLine) || 
               cleanLine.includes(itemName) ||
               (genericName && (genericName.includes(cleanLine) || cleanLine.includes(genericName)));
      });

      if (partialMatches.length > 0) {
        const bestMatch = partialMatches[0];
        medications.push({
          name: bestMatch.name,
          dosage: bestMatch.dosage,
          confidence: 0.7,
          inventory_id: bestMatch.id,
          suggestions: partialMatches.slice(1, 4).map(m => m.name)
        });
      } else {
        // Recherche par mots-clés dans le texte
        const medKeywords = ['mg', 'ml', 'comprimé', 'gélule', 'sirop', 'solution', 'pommade', 'gel'];
        if (medKeywords.some(keyword => cleanLine.includes(keyword))) {
          medications.push({
            name: cleanLine,
            dosage: 'Dosage à déterminer',
            confidence: 0.3,
            suggestions: inventory.slice(0, 3).map(m => m.name)
          });
        }
      }
    }

    return {
      doctor_name,
      patient_name,
      date,
      medications,
      raw_text: text
    };
  }, [inventory]);

  // Fonction pour traiter l'OCR d'une image via l'API
  const processImage = useCallback(async (imageData: string, pharmacyId?: string): Promise<PrescriptionAnalysis> => {
    setIsProcessing(true);

    try {
      // Extract base64 data from data URL
      const base64Data = imageData.split(',')[1] || imageData;

      console.log('Calling OCR API for prescription analysis');
      
      // Call the edge function for OCR
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('scan-prescription-ocr', {
        body: {
          imageBase64: base64Data,
          pharmacyId
        }
      });

      if (error) {
        console.error('OCR API error:', error);
        throw new Error(error.message || 'Erreur lors de l\'analyse OCR');
      }

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de l\'analyse OCR');
      }

      console.log('OCR analysis successful:', data.data);

      // Transform API response to PrescriptionAnalysis format
      const apiData = data.data;
      const medications: MedicationMatch[] = (apiData.medications || []).map((med: any) => ({
        name: med.matched_name || med.name,
        dosage: med.dosage || 'Non spécifié',
        confidence: med.confidence || 0.5,
        inventory_id: med.inventory_id,
        suggestions: med.suggestions || [],
        found_in_inventory: med.found_in_inventory || false,
        current_stock: med.current_stock
      }));

      const analysis: PrescriptionAnalysis = {
        doctor_name: apiData.doctor_name,
        patient_name: apiData.patient_name,
        date: apiData.date,
        medications,
        raw_text: JSON.stringify(apiData, null, 2)
      };
      
      toast({
        title: "OCR terminé",
        description: `${medications.length} médicament(s) détecté(s)`,
      });

      return analysis;
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Erreur OCR",
        description: error instanceof Error ? error.message : "Impossible d'analyser l'image",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  // Fonction pour traiter le texte manuel
  const processManualText = useCallback((text: string): PrescriptionAnalysis => {
    if (!text.trim()) {
      throw new Error('Texte vide');
    }

    const analysis = analyzeText(text);
    
    toast({
      title: "Analyse terminée",
      description: `${analysis.medications.length} médicament(s) identifié(s)`,
    });

    return analysis;
  }, [analyzeText, toast]);

  // Fonction pour valider et convertir en format de vente
  const convertToSaleItems = useCallback((medications: MedicationMatch[]) => {
    return medications
      .filter(med => med.inventory_id && med.confidence > 0.5)
      .map(med => {
        const inventoryItem = inventory.find(item => item.id === med.inventory_id);
        return {
          inventory_id: med.inventory_id!,
          inventory: inventoryItem,
          quantity: 1, // Quantité par défaut
          unit_price: inventoryItem?.selling_price || 0,
          prescription_item: true,
          confidence: med.confidence
        };
      });
  }, [inventory]);

  return {
    isProcessing,
    processImage,
    processManualText,
    analyzeText,
    convertToSaleItems
  };
};