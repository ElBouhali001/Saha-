import { useMemo } from 'react';
import { DemoPatient } from './useDemoPatients';

interface SearchResult {
  patient: DemoPatient;
  score: number;
  matchedFields: string[];
  matchedText: string[];
}

// Fonction pour normaliser le texte (supprime accents, convertit en minuscules)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9\s]/g, ' ') // Remplace la ponctuation par des espaces
    .replace(/\s+/g, ' ') // Supprime les espaces multiples
    .trim();
};

// Fonction pour calculer le score de correspondance
const calculateMatchScore = (haystack: string, needle: string): number => {
  const normalizedHaystack = normalizeText(haystack);
  const normalizedNeedle = normalizeText(needle);
  
  if (!normalizedNeedle) return 0;
  if (normalizedHaystack === normalizedNeedle) return 100;
  if (normalizedHaystack.includes(normalizedNeedle)) return 80;
  
  // Recherche de mots partiels
  const needleWords = normalizedNeedle.split(' ').filter(word => word.length > 0);
  const haystackWords = normalizedHaystack.split(' ');
  
  let wordMatches = 0;
  let partialMatches = 0;
  
  needleWords.forEach(needleWord => {
    const exactMatch = haystackWords.some(haystackWord => haystackWord === needleWord);
    if (exactMatch) {
      wordMatches++;
    } else {
      const partialMatch = haystackWords.some(haystackWord => 
        haystackWord.includes(needleWord) || needleWord.includes(haystackWord)
      );
      if (partialMatch) {
        partialMatches++;
      }
    }
  });
  
  if (wordMatches === needleWords.length) return 90;
  if (wordMatches > 0) return 60 + (wordMatches / needleWords.length) * 20;
  if (partialMatches > 0) return 30 + (partialMatches / needleWords.length) * 20;
  
  return 0;
};

// Fonction pour extraire le texte correspondant avec contexte
const extractMatchedText = (text: string, query: string): string => {
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  
  if (!normalizedQuery) return '';
  
  const index = normalizedText.indexOf(normalizedQuery);
  if (index !== -1) {
    const start = Math.max(0, index - 10);
    const end = Math.min(text.length, index + normalizedQuery.length + 10);
    let excerpt = text.substring(start, end);
    
    if (start > 0) excerpt = '...' + excerpt;
    if (end < text.length) excerpt = excerpt + '...';
    
    return excerpt;
  }
  
  return text.substring(0, 50) + (text.length > 50 ? '...' : '');
};

export const useIntelligentSearch = (patients: DemoPatient[], query: string) => {
  return useMemo(() => {
    if (!query.trim()) {
      return patients.map(patient => ({
        patient,
        score: 0,
        matchedFields: [],
        matchedText: []
      }));
    }

    const searchResults: SearchResult[] = [];

    patients.forEach(patient => {
      let totalScore = 0;
      const matchedFields: string[] = [];
      const matchedText: string[] = [];

      // Recherche dans le nom complet (score le plus élevé)
      const fullName = `${patient.firstName} ${patient.lastName}`;
      const nameScore = calculateMatchScore(fullName, query);
      if (nameScore > 0) {
        totalScore += nameScore * 2; // Pondération élevée pour le nom
        matchedFields.push('nom');
        matchedText.push(extractMatchedText(fullName, query));
      }

      // Recherche dans le prénom
      const firstNameScore = calculateMatchScore(patient.firstName, query);
      if (firstNameScore > 0 && !matchedFields.includes('nom')) {
        totalScore += firstNameScore * 1.5;
        matchedFields.push('prénom');
        matchedText.push(extractMatchedText(patient.firstName, query));
      }

      // Recherche dans le nom de famille
      const lastNameScore = calculateMatchScore(patient.lastName, query);
      if (lastNameScore > 0 && !matchedFields.includes('nom')) {
        totalScore += lastNameScore * 1.5;
        matchedFields.push('nom de famille');
        matchedText.push(extractMatchedText(patient.lastName, query));
      }

      // Recherche dans le téléphone
      const phoneScore = calculateMatchScore(patient.phone, query);
      if (phoneScore > 0) {
        totalScore += phoneScore * 1.3;
        matchedFields.push('téléphone');
        matchedText.push(patient.phone);
      }

      // Recherche dans l'email
      if (patient.email) {
        const emailScore = calculateMatchScore(patient.email, query);
        if (emailScore > 0) {
          totalScore += emailScore * 1.2;
          matchedFields.push('email');
          matchedText.push(extractMatchedText(patient.email, query));
        }
      }

      // Recherche dans l'adresse
      const addressScore = calculateMatchScore(patient.address, query);
      if (addressScore > 0) {
        totalScore += addressScore;
        matchedFields.push('adresse');
        matchedText.push(extractMatchedText(patient.address, query));
      }

      // Recherche dans le médecin traitant
      if ((patient as any).primaryDoctor) {
        const doctorScore = calculateMatchScore((patient as any).primaryDoctor, query);
        if (doctorScore > 0) {
          totalScore += doctorScore * 0.8;
          matchedFields.push('médecin traitant');
          matchedText.push((patient as any).primaryDoctor);
        }
      }

      // Recherche dans l'assurance
      if ((patient as any).insurance) {
        const insuranceScore = calculateMatchScore((patient as any).insurance, query);
        if (insuranceScore > 0) {
          totalScore += insuranceScore * 0.6;
          matchedFields.push('assurance');
          matchedText.push((patient as any).insurance);
        }
      }

      // Recherche dans l'historique médical (diagnostics)
      patient.medicalHistory.forEach(record => {
        const diagnosisScore = calculateMatchScore(record.diagnosis, query);
        if (diagnosisScore > 0) {
          totalScore += diagnosisScore * 0.7;
          if (!matchedFields.includes('diagnostic')) {
            matchedFields.push('diagnostic');
            matchedText.push(extractMatchedText(record.diagnosis, query));
          }
        }

        const symptomsScore = calculateMatchScore(record.symptoms, query);
        if (symptomsScore > 0) {
          totalScore += symptomsScore * 0.5;
          if (!matchedFields.includes('symptômes')) {
            matchedFields.push('symptômes');
            matchedText.push(extractMatchedText(record.symptoms, query));
          }
        }

        const treatmentScore = calculateMatchScore(record.treatment, query);
        if (treatmentScore > 0) {
          totalScore += treatmentScore * 0.5;
          if (!matchedFields.includes('traitement')) {
            matchedFields.push('traitement');
            matchedText.push(extractMatchedText(record.treatment, query));
          }
        }
      });

      // Recherche dans les contacts d'urgence
      if (patient.emergencyContact) {
        const emergencyNameScore = calculateMatchScore(patient.emergencyContact.name, query);
        if (emergencyNameScore > 0) {
          totalScore += emergencyNameScore * 0.4;
          matchedFields.push('contact d\'urgence');
          matchedText.push(patient.emergencyContact.name);
        }
      }

      // Ne garder que les patients avec un score > seuil
      if (totalScore > 10) {
        searchResults.push({
          patient,
          score: totalScore,
          matchedFields,
          matchedText
        });
      }
    });

    // Trier par score décroissant
    return searchResults.sort((a, b) => b.score - a.score);
  }, [patients, query]);
};