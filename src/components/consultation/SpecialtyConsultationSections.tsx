import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Stethoscope, Baby, UserPlus, Eye, Brain, Bone, Scissors, Smile } from 'lucide-react';

interface SpecialtyData {
  [key: string]: any;
}

interface SpecialtyConsultationSectionsProps {
  specialty: string;
  specialtyData: SpecialtyData;
  onSpecialtyDataChange: (data: SpecialtyData) => void;
}

const SpecialtyConsultationSections: React.FC<SpecialtyConsultationSectionsProps> = ({
  specialty,
  specialtyData,
  onSpecialtyDataChange
}) => {
  const updateField = (field: string, value: any) => {
    onSpecialtyDataChange({
      ...specialtyData,
      [field]: value
    });
  };

  const renderCardiologySection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-red-600">
          <Heart className="w-5 h-5 mr-2" />
          Évaluation Cardiologique
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Tension artérielle (mmHg)</Label>
            <Input
              placeholder="Ex: 120/80"
              value={specialtyData.bloodPressure || ''}
              onChange={(e) => updateField('bloodPressure', e.target.value)}
            />
          </div>
          <div>
            <Label>Fréquence cardiaque (bpm)</Label>
            <Input
              type="number"
              placeholder="Ex: 72"
              value={specialtyData.heartRate || ''}
              onChange={(e) => updateField('heartRate', e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <Label>Auscultation cardiaque</Label>
          <Select value={specialtyData.heartAuscultation || ''} onValueChange={(value) => updateField('heartAuscultation', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Résultat de l'auscultation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Bruits du cœur normaux</SelectItem>
              <SelectItem value="murmur">Souffle cardiaque</SelectItem>
              <SelectItem value="irregular">Rythme irrégulier</SelectItem>
              <SelectItem value="gallop">Galop</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Symptômes cardiovasculaires</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['Douleur thoracique', 'Essoufflement', 'Palpitations', 'Œdème des membres', 'Fatigue', 'Syncope'].map((symptom) => (
              <div key={symptom} className="flex items-center space-x-2">
                <Checkbox
                  checked={specialtyData.cardioSymptoms?.includes(symptom) || false}
                  onCheckedChange={(checked) => {
                    const current = specialtyData.cardioSymptoms || [];
                    updateField('cardioSymptoms', 
                      checked 
                        ? [...current, symptom]
                        : current.filter((s: string) => s !== symptom)
                    );
                  }}
                />
                <Label className="text-sm">{symptom}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Examens complémentaires recommandés</Label>
          <Textarea
            placeholder="ECG, Échocardiographie, Test d'effort..."
            value={specialtyData.recommendedTests || ''}
            onChange={(e) => updateField('recommendedTests', e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderDermatologySection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-orange-600">
          <UserPlus className="w-5 h-5 mr-2" />
          Examen Dermatologique
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Localisation des lésions</Label>
          <Input
            placeholder="Ex: Visage, mains, tronc..."
            value={specialtyData.lesionLocation || ''}
            onChange={(e) => updateField('lesionLocation', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Type de lésion</Label>
            <Select value={specialtyData.lesionType || ''} onValueChange={(value) => updateField('lesionType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="macule">Macule</SelectItem>
                <SelectItem value="papule">Papule</SelectItem>
                <SelectItem value="vesicule">Vésicule</SelectItem>
                <SelectItem value="pustule">Pustule</SelectItem>
                <SelectItem value="nodule">Nodule</SelectItem>
                <SelectItem value="ulcere">Ulcère</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Couleur</Label>
            <Input
              placeholder="Ex: Érythémateuse, brune, noire..."
              value={specialtyData.lesionColor || ''}
              onChange={(e) => updateField('lesionColor', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Symptômes associés</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['Prurit', 'Brûlure', 'Douleur', 'Saignement', 'Desquamation', 'Suppuration'].map((symptom) => (
              <div key={symptom} className="flex items-center space-x-2">
                <Checkbox
                  checked={specialtyData.dermaSymptoms?.includes(symptom) || false}
                  onCheckedChange={(checked) => {
                    const current = specialtyData.dermaSymptoms || [];
                    updateField('dermaSymptoms', 
                      checked 
                        ? [...current, symptom]
                        : current.filter((s: string) => s !== symptom)
                    );
                  }}
                />
                <Label className="text-sm">{symptom}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Biopsie nécessaire</Label>
          <Select value={specialtyData.biopsyNeeded || ''} onValueChange={(value) => updateField('biopsyNeeded', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Évaluation biopsie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="non">Non nécessaire</SelectItem>
              <SelectItem value="recommandee">Recommandée</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  const renderPediatricsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-blue-600">
          <Baby className="w-5 h-5 mr-2" />
          Évaluation Pédiatrique
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Âge de l'enfant</Label>
            <Input
              placeholder="Ex: 5 ans 3 mois"
              value={specialtyData.childAge || ''}
              onChange={(e) => updateField('childAge', e.target.value)}
            />
          </div>
          <div>
            <Label>Poids (kg)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="Ex: 18.5"
              value={specialtyData.weight || ''}
              onChange={(e) => updateField('weight', e.target.value)}
            />
          </div>
          <div>
            <Label>Taille (cm)</Label>
            <Input
              type="number"
              placeholder="Ex: 110"
              value={specialtyData.height || ''}
              onChange={(e) => updateField('height', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Développement psychomoteur</Label>
          <Select value={specialtyData.development || ''} onValueChange={(value) => updateField('development', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Évaluation du développement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal pour l'âge</SelectItem>
              <SelectItem value="avance">Avancé</SelectItem>
              <SelectItem value="retard-leger">Léger retard</SelectItem>
              <SelectItem value="retard-important">Retard important</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Vaccinations</Label>
          <Select value={specialtyData.vaccinations || ''} onValueChange={(value) => updateField('vaccinations', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Statut vaccinal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a-jour">À jour</SelectItem>
              <SelectItem value="retard">En retard</SelectItem>
              <SelectItem value="incomplet">Incomplet</SelectItem>
              <SelectItem value="refuse">Refusé par les parents</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Antécédents familiaux particuliers</Label>
          <Textarea
            placeholder="Maladies héréditaires, allergies familiales..."
            value={specialtyData.familyHistory || ''}
            onChange={(e) => updateField('familyHistory', e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderGynecologySection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-pink-600">
          <UserPlus className="w-5 h-5 mr-2" />
          Examen Gynécologique
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Dernières règles</Label>
            <Input
              type="date"
              value={specialtyData.lastPeriod || ''}
              onChange={(e) => updateField('lastPeriod', e.target.value)}
            />
          </div>
          <div>
            <Label>Cycle menstruel</Label>
            <Select value={specialtyData.menstrualCycle || ''} onValueChange={(value) => updateField('menstrualCycle', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Régularité du cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regulier">Régulier</SelectItem>
                <SelectItem value="irregulier">Irrégulier</SelectItem>
                <SelectItem value="amenorrhee">Aménorrhée</SelectItem>
                <SelectItem value="menopause">Ménopause</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Contraception actuelle</Label>
          <Select value={specialtyData.contraception || ''} onValueChange={(value) => updateField('contraception', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Méthode contraceptive" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aucune">Aucune</SelectItem>
              <SelectItem value="pilule">Pilule contraceptive</SelectItem>
              <SelectItem value="sterilet">Stérilet</SelectItem>
              <SelectItem value="implant">Implant</SelectItem>
              <SelectItem value="preservatif">Préservatif</SelectItem>
              <SelectItem value="autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Grossesses antérieures</Label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm">Gestité</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={specialtyData.gestity || ''}
                onChange={(e) => updateField('gestity', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm">Parité</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={specialtyData.parity || ''}
                onChange={(e) => updateField('parity', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm">Avortements</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={specialtyData.abortions || ''}
                onChange={(e) => updateField('abortions', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <Label>Dépistages</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['Frottis cervical à jour', 'Mammographie récente', 'Échographie pelvienne', 'Test HPV'].map((screening) => (
              <div key={screening} className="flex items-center space-x-2">
                <Checkbox
                  checked={specialtyData.screenings?.includes(screening) || false}
                  onCheckedChange={(checked) => {
                    const current = specialtyData.screenings || [];
                    updateField('screenings', 
                      checked 
                        ? [...current, screening]
                        : current.filter((s: string) => s !== screening)
                    );
                  }}
                />
                <Label className="text-sm">{screening}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderNeurologySection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-purple-600">
          <Brain className="w-5 h-5 mr-2" />
          Examen Neurologique
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Examen des fonctions supérieures</Label>
          <Select value={specialtyData.cognitiveFunction || ''} onValueChange={(value) => updateField('cognitiveFunction', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Évaluation cognitive" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="leger-trouble">Légers troubles</SelectItem>
              <SelectItem value="trouble-modere">Troubles modérés</SelectItem>
              <SelectItem value="trouble-severe">Troubles sévères</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Réflexes ostéo-tendineux</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Membres supérieurs</Label>
              <Select value={specialtyData.upperReflexes || ''} onValueChange={(value) => updateField('upperReflexes', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="ROT sup." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normaux</SelectItem>
                  <SelectItem value="vifs">Vifs</SelectItem>
                  <SelectItem value="abolis">Abolis</SelectItem>
                  <SelectItem value="asymetriques">Asymétriques</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Membres inférieurs</Label>
              <Select value={specialtyData.lowerReflexes || ''} onValueChange={(value) => updateField('lowerReflexes', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="ROT inf." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normaux</SelectItem>
                  <SelectItem value="vifs">Vifs</SelectItem>
                  <SelectItem value="abolis">Abolis</SelectItem>
                  <SelectItem value="asymetriques">Asymétriques</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div>
          <Label>Force musculaire</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Membre supérieur droit</Label>
              <Select value={specialtyData.rightArmStrength || ''} onValueChange={(value) => updateField('rightArmStrength', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Force/5" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5/5 (Normale)</SelectItem>
                  <SelectItem value="4">4/5 (Diminuée)</SelectItem>
                  <SelectItem value="3">3/5 (Contre pesanteur)</SelectItem>
                  <SelectItem value="2">2/5 (Sur plan)</SelectItem>
                  <SelectItem value="1">1/5 (Contraction)</SelectItem>
                  <SelectItem value="0">0/5 (Paralysie)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Membre supérieur gauche</Label>
              <Select value={specialtyData.leftArmStrength || ''} onValueChange={(value) => updateField('leftArmStrength', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Force/5" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5/5 (Normale)</SelectItem>
                  <SelectItem value="4">4/5 (Diminuée)</SelectItem>
                  <SelectItem value="3">3/5 (Contre pesanteur)</SelectItem>
                  <SelectItem value="2">2/5 (Sur plan)</SelectItem>
                  <SelectItem value="1">1/5 (Contraction)</SelectItem>
                  <SelectItem value="0">0/5 (Paralysie)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div>
          <Label>Signes neurologiques particuliers</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['Trouble de la marche', 'Tremblements', 'Dysarthrie', 'Troubles visuels', 'Céphalées', 'Vertiges'].map((sign) => (
              <div key={sign} className="flex items-center space-x-2">
                <Checkbox
                  checked={specialtyData.neuroSigns?.includes(sign) || false}
                  onCheckedChange={(checked) => {
                    const current = specialtyData.neuroSigns || [];
                    updateField('neuroSigns', 
                      checked 
                        ? [...current, sign]
                        : current.filter((s: string) => s !== sign)
                    );
                  }}
                />
                <Label className="text-sm">{sign}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderOrthopedicsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-green-600">
          <Bone className="w-5 h-5 mr-2" />
          Examen Orthopédique
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Articulation concernée</Label>
          <Select value={specialtyData.affectedJoint || ''} onValueChange={(value) => updateField('affectedJoint', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner l'articulation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="epaule">Épaule</SelectItem>
              <SelectItem value="coude">Coude</SelectItem>
              <SelectItem value="poignet">Poignet</SelectItem>
              <SelectItem value="hanche">Hanche</SelectItem>
              <SelectItem value="genou">Genou</SelectItem>
              <SelectItem value="cheville">Cheville</SelectItem>
              <SelectItem value="rachis">Rachis</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Amplitude de mouvement</Label>
            <Select value={specialtyData.rangeOfMotion || ''} onValueChange={(value) => updateField('rangeOfMotion', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Mobilité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="complete">Complète</SelectItem>
                <SelectItem value="limitee">Limitée</SelectItem>
                <SelectItem value="douloureuse">Douloureuse</SelectItem>
                <SelectItem value="bloquee">Bloquée</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Douleur (0-10)</Label>
            <Select value={specialtyData.painLevel || ''} onValueChange={(value) => updateField('painLevel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(11)].map((_, i) => (
                  <SelectItem key={i} value={i.toString()}>{i}/10</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Tests spéciaux</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['Test de Lachman', 'Test de McMurray', 'Test de Hawkins', 'Test de Lasègue', 'Test de Patrick', 'Test de Thompson'].map((test) => (
              <div key={test} className="flex items-center space-x-2">
                <Checkbox
                  checked={specialtyData.specialTests?.includes(test) || false}
                  onCheckedChange={(checked) => {
                    const current = specialtyData.specialTests || [];
                    updateField('specialTests', 
                      checked 
                        ? [...current, test]
                        : current.filter((s: string) => s !== test)
                    );
                  }}
                />
                <Label className="text-sm">{test}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Imagerie recommandée</Label>
          <Select value={specialtyData.imaging || ''} onValueChange={(value) => updateField('imaging', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Type d'imagerie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="radiographie">Radiographie</SelectItem>
              <SelectItem value="echographie">Échographie</SelectItem>
              <SelectItem value="irm">IRM</SelectItem>
              <SelectItem value="scanner">Scanner</SelectItem>
              <SelectItem value="aucune">Aucune pour le moment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  const renderOphthalmologySection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-indigo-600">
          <Eye className="w-5 h-5 mr-2" />
          Examen Ophtalmologique
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Acuité visuelle OD</Label>
            <Input
              placeholder="Ex: 10/10, 5/10..."
              value={specialtyData.rightEyeVision || ''}
              onChange={(e) => updateField('rightEyeVision', e.target.value)}
            />
          </div>
          <div>
            <Label>Acuité visuelle OG</Label>
            <Input
              placeholder="Ex: 10/10, 8/10..."
              value={specialtyData.leftEyeVision || ''}
              onChange={(e) => updateField('leftEyeVision', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Pression intraoculaire OD</Label>
            <Input
              placeholder="Ex: 15 mmHg"
              value={specialtyData.rightEyePressure || ''}
              onChange={(e) => updateField('rightEyePressure', e.target.value)}
            />
          </div>
          <div>
            <Label>Pression intraoculaire OG</Label>
            <Input
              placeholder="Ex: 16 mmHg"
              value={specialtyData.leftEyePressure || ''}
              onChange={(e) => updateField('leftEyePressure', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Examen du fond d'œil</Label>
          <Select value={specialtyData.fundusExam || ''} onValueChange={(value) => updateField('fundusExam', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Résultat FO" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="retinopathie">Rétinopathie</SelectItem>
              <SelectItem value="glaucome">Signes de glaucome</SelectItem>
              <SelectItem value="dmla">DMLA</SelectItem>
              <SelectItem value="autre">Autre anomalie</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Symptômes oculaires</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['Vision floue', 'Douleur oculaire', 'Photophobie', 'Larmoiement', 'Sécheresse', 'Halos colorés'].map((symptom) => (
              <div key={symptom} className="flex items-center space-x-2">
                <Checkbox
                  checked={specialtyData.eyeSymptoms?.includes(symptom) || false}
                  onCheckedChange={(checked) => {
                    const current = specialtyData.eyeSymptoms || [];
                    updateField('eyeSymptoms', 
                      checked 
                        ? [...current, symptom]
                        : current.filter((s: string) => s !== symptom)
                    );
                  }}
                />
                <Label className="text-sm">{symptom}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderDentistrySection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-cyan-600">
          <Smile className="w-5 h-5 mr-2" />
          Examen Dentaire
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>État de la dentition</Label>
            <Select value={specialtyData.dentitionState || ''} onValueChange={(value) => updateField('dentitionState', value)}>
              <SelectTrigger>
                <SelectValue placeholder="État général" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bon">Bon état général</SelectItem>
                <SelectItem value="moyen">État moyen</SelectItem>
                <SelectItem value="mauvais">Mauvais état</SelectItem>
                <SelectItem value="edente">Édenté partiel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Nombre de dents absentes</Label>
            <Input
              type="number"
              min="0"
              max="32"
              placeholder="0-32"
              value={specialtyData.missingTeeth || ''}
              onChange={(e) => updateField('missingTeeth', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Caries détectées</Label>
          <Input
            placeholder="Ex: 16, 26, 36 (notation FDI)"
            value={specialtyData.cavities || ''}
            onChange={(e) => updateField('cavities', e.target.value)}
          />
        </div>

        <div>
          <Label>État des gencives</Label>
          <Select value={specialtyData.gumsState || ''} onValueChange={(value) => updateField('gumsState', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Évaluation gingivale" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="saines">Gencives saines</SelectItem>
              <SelectItem value="gingivite">Gingivite légère</SelectItem>
              <SelectItem value="parodontite-legere">Parodontite légère</SelectItem>
              <SelectItem value="parodontite-moderee">Parodontite modérée</SelectItem>
              <SelectItem value="parodontite-severe">Parodontite sévère</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Hygiène bucco-dentaire</Label>
          <Select value={specialtyData.oralHygiene || ''} onValueChange={(value) => updateField('oralHygiene', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Niveau d'hygiène" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellente">Excellente</SelectItem>
              <SelectItem value="bonne">Bonne</SelectItem>
              <SelectItem value="moyenne">Moyenne</SelectItem>
              <SelectItem value="insuffisante">Insuffisante</SelectItem>
              <SelectItem value="mauvaise">Mauvaise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Tartre</Label>
          <Select value={specialtyData.tartar || ''} onValueChange={(value) => updateField('tartar', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Présence de tartre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="leger">Léger</SelectItem>
              <SelectItem value="modere">Modéré</SelectItem>
              <SelectItem value="important">Important</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Occlusion dentaire</Label>
          <Select value={specialtyData.occlusion || ''} onValueChange={(value) => updateField('occlusion', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Type d'occlusion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="classe-I">Classe I (Normale)</SelectItem>
              <SelectItem value="classe-II">Classe II (Rétrognathie)</SelectItem>
              <SelectItem value="classe-III">Classe III (Prognathie)</SelectItem>
              <SelectItem value="supraclusion">Supraclusion</SelectItem>
              <SelectItem value="infraclusion">Infraclusion</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Symptômes dentaires</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['Douleur dentaire', 'Sensibilité au froid', 'Sensibilité au chaud', 'Saignement gingival', 'Mauvaise haleine', 'Mobilité dentaire'].map((symptom) => (
              <div key={symptom} className="flex items-center space-x-2">
                <Checkbox
                  checked={specialtyData.dentalSymptoms?.includes(symptom) || false}
                  onCheckedChange={(checked) => {
                    const current = specialtyData.dentalSymptoms || [];
                    updateField('dentalSymptoms', 
                      checked 
                        ? [...current, symptom]
                        : current.filter((s: string) => s !== symptom)
                    );
                  }}
                />
                <Label className="text-sm">{symptom}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Soins nécessaires</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['Détartrage', 'Soins de caries', 'Extraction', 'Prothèse dentaire', 'Couronne', 'Implant', 'Blanchiment', 'Orthodontie'].map((care) => (
              <div key={care} className="flex items-center space-x-2">
                <Checkbox
                  checked={specialtyData.requiredCare?.includes(care) || false}
                  onCheckedChange={(checked) => {
                    const current = specialtyData.requiredCare || [];
                    updateField('requiredCare', 
                      checked 
                        ? [...current, care]
                        : current.filter((c: string) => c !== care)
                    );
                  }}
                />
                <Label className="text-sm">{care}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Radiographie panoramique</Label>
          <Select value={specialtyData.panoramicXray || ''} onValueChange={(value) => updateField('panoramicXray', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Besoin de radio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="non-necessaire">Non nécessaire</SelectItem>
              <SelectItem value="recommandee">Recommandée</SelectItem>
              <SelectItem value="realisee">Déjà réalisée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Remarques et observations</Label>
          <Textarea
            placeholder="Notes complémentaires sur l'examen dentaire..."
            value={specialtyData.dentalNotes || ''}
            onChange={(e) => updateField('dentalNotes', e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );

  const getSpecialtySection = () => {
    switch (specialty.toLowerCase()) {
      case 'cardiologie':
        return renderCardiologySection();
      case 'dermatologie':
        return renderDermatologySection();
      case 'pédiatrie':
        return renderPediatricsSection();
      case 'gynécologie':
        return renderGynecologySection();
      case 'neurologie':
        return renderNeurologySection();
      case 'orthopédie':
        return renderOrthopedicsSection();
      case 'ophtalmologie':
        return renderOphthalmologySection();
      case 'dentiste':
        return renderDentistrySection();
      default:
        return null;
    }
  };

  return (
    <div>
      {getSpecialtySection()}
    </div>
  );
};

export default SpecialtyConsultationSections;