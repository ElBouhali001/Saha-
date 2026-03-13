import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlaskConical, Search, Plus } from 'lucide-react';

export interface LabAnalysis {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  normalRange?: string;
  unit?: string;
}

export interface SelectedAnalysis extends LabAnalysis {
  isUrgent: boolean;
  customInstructions?: string;
}

interface LabAnalysisSelectorProps {
  selectedAnalyses: SelectedAnalysis[];
  onAnalysesChange: (analyses: SelectedAnalysis[]) => void;
}

const LAB_ANALYSES: LabAnalysis[] = [
  // Hématologie
  {
    id: 'nfs',
    name: 'Numération-Formule Sanguine',
    code: 'NFS',
    category: 'Hématologie',
    description: 'Comptage des différents types de cellules sanguines',
    normalRange: 'Variable selon les paramètres',
    unit: 'Various'
  },
  {
    id: 'vs',
    name: 'Vitesse de Sédimentation',
    code: 'VS',
    category: 'Hématologie',
    description: 'Marqueur non spécifique d\'inflammation',
    normalRange: '<20 mm/h',
    unit: 'mm/h'
  },
  {
    id: 'crp',
    name: 'C-Reactive Protein',
    code: 'CRP',
    category: 'Hématologie',
    description: 'Protéine de l\'inflammation',
    normalRange: '<3 mg/L',
    unit: 'mg/L'
  },

  // Biochimie
  {
    id: 'glycemie',
    name: 'Glycémie à jeun',
    code: 'GLY',
    category: 'Biochimie',
    description: 'Taux de glucose dans le sang',
    normalRange: '0.7-1.1 g/L',
    unit: 'g/L'
  },
  {
    id: 'hba1c',
    name: 'Hémoglobine Glyquée',
    code: 'HbA1c',
    category: 'Biochimie',
    description: 'Contrôle glycémique sur 3 mois',
    normalRange: '<6.5%',
    unit: '%'
  },
  {
    id: 'creatinine',
    name: 'Créatinine',
    code: 'CREA',
    category: 'Biochimie',
    description: 'Fonction rénale',
    normalRange: '60-110 μmol/L',
    unit: 'μmol/L'
  },
  {
    id: 'uree',
    name: 'Urée',
    code: 'UREE',
    category: 'Biochimie',
    description: 'Fonction rénale',
    normalRange: '2.5-7.5 mmol/L',
    unit: 'mmol/L'
  },
  {
    id: 'cholesterol_total',
    name: 'Cholestérol Total',
    code: 'CHOL',
    category: 'Biochimie',
    description: 'Bilan lipidique',
    normalRange: '<2.0 g/L',
    unit: 'g/L'
  },
  {
    id: 'hdl',
    name: 'HDL Cholestérol',
    code: 'HDL',
    category: 'Biochimie',
    description: 'Bon cholestérol',
    normalRange: '>0.40 g/L',
    unit: 'g/L'
  },
  {
    id: 'ldl',
    name: 'LDL Cholestérol',
    code: 'LDL',
    category: 'Biochimie',
    description: 'Mauvais cholestérol',
    normalRange: '<1.6 g/L',
    unit: 'g/L'
  },
  {
    id: 'triglycerides',
    name: 'Triglycérides',
    code: 'TG',
    category: 'Biochimie',
    description: 'Bilan lipidique',
    normalRange: '<1.5 g/L',
    unit: 'g/L'
  },

  // Fonction hépatique
  {
    id: 'asat',
    name: 'ASAT (Transaminases)',
    code: 'ASAT',
    category: 'Fonction hépatique',
    description: 'Enzyme hépatique',
    normalRange: '<40 UI/L',
    unit: 'UI/L'
  },
  {
    id: 'alat',
    name: 'ALAT (Transaminases)',
    code: 'ALAT',
    category: 'Fonction hépatique',
    description: 'Enzyme hépatique',
    normalRange: '<40 UI/L',
    unit: 'UI/L'
  },
  {
    id: 'bilirubine',
    name: 'Bilirubine Totale',
    code: 'BILI',
    category: 'Fonction hépatique',
    description: 'Pigment biliaire',
    normalRange: '<17 μmol/L',
    unit: 'μmol/L'
  },

  // Hormones
  {
    id: 'tsh',
    name: 'TSH',
    code: 'TSH',
    category: 'Hormones',
    description: 'Hormone thyroïdienne',
    normalRange: '0.4-4.0 mUI/L',
    unit: 'mUI/L'
  },
  {
    id: 't4',
    name: 'T4 Libre',
    code: 'T4L',
    category: 'Hormones',
    description: 'Hormone thyroïdienne',
    normalRange: '9-25 pmol/L',
    unit: 'pmol/L'
  },

  // Cardiologie
  {
    id: 'troponine',
    name: 'Troponine',
    code: 'TnI',
    category: 'Cardiologie',
    description: 'Marqueur cardiaque',
    normalRange: '<0.04 ng/mL',
    unit: 'ng/mL'
  },
  {
    id: 'bnp',
    name: 'BNP',
    code: 'BNP',
    category: 'Cardiologie',
    description: 'Peptide natriurétique',
    normalRange: '<100 pg/mL',
    unit: 'pg/mL'
  },

  // Sérologie
  {
    id: 'hepatite_b',
    name: 'Sérologie Hépatite B',
    code: 'HBs',
    category: 'Sérologie',
    description: 'Dépistage hépatite B',
    normalRange: 'Négatif',
    unit: ''
  },
  {
    id: 'hepatite_c',
    name: 'Sérologie Hépatite C',
    code: 'HCV',
    category: 'Sérologie',
    description: 'Dépistage hépatite C',
    normalRange: 'Négatif',
    unit: ''
  },
  {
    id: 'vih',
    name: 'Sérologie VIH',
    code: 'VIH',
    category: 'Sérologie',
    description: 'Dépistage VIH',
    normalRange: 'Négatif',
    unit: ''
  }
];

const ANALYSIS_CATEGORIES = [
  'Toutes',
  'Hématologie',
  'Biochimie',
  'Fonction hépatique',
  'Hormones',
  'Cardiologie',
  'Sérologie'
];

export default function LabAnalysisSelector({ 
  selectedAnalyses, 
  onAnalysesChange 
}: LabAnalysisSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [customAnalysis, setCustomAnalysis] = useState({ name: '', code: '' });

  const filteredAnalyses = LAB_ANALYSES.filter(analysis => {
    const matchesSearch = analysis.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         analysis.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         analysis.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Toutes' || analysis.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAnalysisToggle = (analysis: LabAnalysis, checked: boolean) => {
    if (checked) {
      const newAnalysis: SelectedAnalysis = {
        ...analysis,
        isUrgent: false,
        customInstructions: ''
      };
      onAnalysesChange([...selectedAnalyses, newAnalysis]);
    } else {
      onAnalysesChange(selectedAnalyses.filter(selected => selected.id !== analysis.id));
    }
  };

  const handleUrgentToggle = (analysisId: string, isUrgent: boolean) => {
    onAnalysesChange(
      selectedAnalyses.map(analysis =>
        analysis.id === analysisId ? { ...analysis, isUrgent } : analysis
      )
    );
  };

  const handleCustomInstructions = (analysisId: string, instructions: string) => {
    onAnalysesChange(
      selectedAnalyses.map(analysis =>
        analysis.id === analysisId ? { ...analysis, customInstructions: instructions } : analysis
      )
    );
  };

  const addCustomAnalysis = () => {
    if (!customAnalysis.name || !customAnalysis.code) return;

    const newAnalysis: SelectedAnalysis = {
      id: Date.now().toString(),
      name: customAnalysis.name,
      code: customAnalysis.code,
      category: 'Personnalisé',
      description: 'Analyse personnalisée',
      isUrgent: false,
      customInstructions: ''
    };

    onAnalysesChange([...selectedAnalyses, newAnalysis]);
    setCustomAnalysis({ name: '', code: '' });
  };

  const isAnalysisSelected = (analysisId: string) => {
    return selectedAnalyses.some(selected => selected.id === analysisId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-blue-600" />
            Sélection des Analyses à Prescrire
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="selection" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="selection">Sélection ({selectedAnalyses.length})</TabsTrigger>
              <TabsTrigger value="selected">Analyses sélectionnées</TabsTrigger>
            </TabsList>

            <TabsContent value="selection" className="space-y-4">
              {/* Filtres et recherche */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Rechercher une analyse..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ANALYSIS_CATEGORIES.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Liste des analyses */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredAnalyses.map(analysis => {
                  const isSelected = isAnalysisSelected(analysis.id);
                  return (
                    <Card key={analysis.id} className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleAnalysisToggle(analysis, checked as boolean)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{analysis.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {analysis.code}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{analysis.description}</p>
                            <div className="text-xs text-gray-500">
                              <div>Catégorie: {analysis.category}</div>
                              {analysis.normalRange && (
                                <div>Valeurs normales: {analysis.normalRange}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Ajout d'analyse personnalisée */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Ajouter une analyse personnalisée
                  </h4>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nom de l'analyse"
                      value={customAnalysis.name}
                      onChange={(e) => setCustomAnalysis(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder="Code"
                      value={customAnalysis.code}
                      onChange={(e) => setCustomAnalysis(prev => ({ ...prev, code: e.target.value }))}
                      className="w-24"
                    />
                    <Button onClick={addCustomAnalysis} disabled={!customAnalysis.name || !customAnalysis.code}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="selected" className="space-y-4">
              {selectedAnalyses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FlaskConical className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucune analyse sélectionnée</p>
                  <p className="text-sm">Sélectionnez des analyses dans l'onglet précédent</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      {selectedAnalyses.length} analyse{selectedAnalyses.length > 1 ? 's' : ''} sélectionnée{selectedAnalyses.length > 1 ? 's' : ''}
                    </h4>
                    <Badge variant="secondary">
                      {selectedAnalyses.filter(a => a.isUrgent).length} urgente{selectedAnalyses.filter(a => a.isUrgent).length > 1 ? 's' : ''}
                    </Badge>
                  </div>

                  {selectedAnalyses.map(analysis => (
                    <Card key={analysis.id}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{analysis.name}</span>
                              <Badge variant="outline">{analysis.code}</Badge>
                              {analysis.isUrgent && (
                                <Badge variant="destructive" className="text-xs">URGENT</Badge>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAnalysisToggle(analysis, false)}
                            >
                              Retirer
                            </Button>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`urgent-${analysis.id}`}
                                checked={analysis.isUrgent}
                                onCheckedChange={(checked) => handleUrgentToggle(analysis.id, checked as boolean)}
                              />
                              <Label htmlFor={`urgent-${analysis.id}`} className="text-sm">
                                Analyse urgente
                              </Label>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`instructions-${analysis.id}`} className="text-sm">
                              Instructions particulières (optionnel)
                            </Label>
                            <Input
                              id={`instructions-${analysis.id}`}
                              placeholder="Ex: à jeun, condition particulière..."
                              value={analysis.customInstructions || ''}
                              onChange={(e) => handleCustomInstructions(analysis.id, e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}