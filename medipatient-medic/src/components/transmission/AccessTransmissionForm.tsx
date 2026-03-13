
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Eye, FileText, Clock, Send } from 'lucide-react';
import { useAccessTransmission, useSubmitFeedback } from '@/hooks/useTransmissions';
import { toast } from 'sonner';

const AccessTransmissionForm = () => {
  const [accessCode, setAccessCode] = useState('');
  const [transmissionData, setTransmissionData] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const accessTransmission = useAccessTransmission();
  const submitFeedback = useSubmitFeedback();

  const handleAccess = async () => {
    if (!accessCode.trim()) {
      toast.error('Veuillez saisir un code d\'accès');
      return;
    }

    try {
      const data = await accessTransmission.mutateAsync(accessCode.trim().toUpperCase());
      setTransmissionData(data);
      toast.success('Accès autorisé au dossier médical');
    } catch (error) {
      toast.error('Code d\'accès invalide ou expiré');
      console.error('Access error:', error);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      toast.error('Veuillez saisir votre retour');
      return;
    }

    try {
      await submitFeedback.mutateAsync({
        transmissionId: transmissionData.id,
        feedback: feedback.trim()
      });
      toast.success('Retour envoyé avec succès');
      setShowFeedbackForm(false);
      setFeedback('');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du retour');
      console.error('Feedback error:', error);
    }
  };

  const formatTransmissionElements = (elements: string[]) => {
    const elementLabels: Record<string, string> = {
      identity: 'Identité',
      medical_history: 'Antécédents',
      consultation_summary: 'Résumé consultation',
      test_results: 'Résultats examens',
      diagnosis: 'Diagnostic',
      prescriptions: 'Prescriptions'
    };

    return elements.map(elem => elementLabels[elem] || elem);
  };

  if (!transmissionData) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle>Accès Sécurisé</CardTitle>
            <CardDescription>
              Saisissez votre code d'accès pour consulter le dossier médical transmis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="access-code">Code d'accès</Label>
              <Input
                id="access-code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX-XXXX"
                className="text-center font-mono text-lg"
                maxLength={14}
              />
            </div>
            <Button 
              onClick={handleAccess} 
              disabled={accessTransmission.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {accessTransmission.isPending ? 'Vérification...' : 'Accéder au dossier'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-6">
      {/* Header avec info transmission */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-green-600" />
                <span>Dossier Médical - Accès Autorisé</span>
              </CardTitle>
              <CardDescription>
                Patient: {transmissionData.patient?.profile?.first_name} {transmissionData.patient?.profile?.last_name}
              </CardDescription>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-green-600">
                <Clock className="w-3 h-3 mr-1" />
                Expire le {new Date(transmissionData.expiry_date).toLocaleDateString('fr-FR')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Motif de transmission:</strong>
              <p className="text-gray-600 mt-1">{transmissionData.reason}</p>
            </div>
            <div>
              <strong>Éléments transmis:</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {formatTransmissionElements(transmissionData.transmitted_elements).map((element, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {element}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenu du dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {transmissionData.transmitted_elements.includes('identity') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Identité du Patient</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><strong>Nom:</strong> {transmissionData.patient?.profile?.last_name}</div>
              <div><strong>Prénom:</strong> {transmissionData.patient?.profile?.first_name}</div>
              <div><strong>Date de naissance:</strong> {transmissionData.patient?.date_of_birth ? new Date(transmissionData.patient.date_of_birth).toLocaleDateString('fr-FR') : 'Non renseignée'}</div>
              <div><strong>Genre:</strong> {transmissionData.patient?.gender || 'Non renseigné'}</div>
            </CardContent>
          </Card>
        )}

        {transmissionData.transmitted_elements.includes('medical_history') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Antécédents Médicaux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><strong>Groupe sanguin:</strong> {transmissionData.patient?.blood_type || 'Non renseigné'}</div>
              <div><strong>Allergies:</strong> {transmissionData.patient?.allergies?.join(', ') || 'Aucune connue'}</div>
              <div><strong>Maladies chroniques:</strong> {transmissionData.patient?.chronic_conditions?.join(', ') || 'Aucune'}</div>
            </CardContent>
          </Card>
        )}

        {transmissionData.transmitted_elements.includes('consultation_summary') && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Résumé de Consultation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <strong>Date de consultation:</strong> {new Date(transmissionData.consultation?.consultation_date).toLocaleDateString('fr-FR')}
              </div>
              <div>
                <strong>Symptômes:</strong>
                <p className="text-gray-700 mt-1">{transmissionData.consultation?.symptoms || 'Non renseignés'}</p>
              </div>
              <div>
                <strong>Diagnostic:</strong>
                <p className="text-gray-700 mt-1">{transmissionData.consultation?.diagnosis || 'En cours d\'évaluation'}</p>
              </div>
              <div>
                <strong>Plan de traitement:</strong>
                <p className="text-gray-700 mt-1">{transmissionData.consultation?.treatment_plan || 'À définir'}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Section feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="w-5 h-5 text-blue-600" />
            <span>Retour du Spécialiste</span>
          </CardTitle>
          <CardDescription>
            Votre avis et recommandations seront transmis au médecin traitant
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showFeedbackForm ? (
            <Button onClick={() => setShowFeedbackForm(true)} className="bg-blue-600 hover:bg-blue-700">
              Ajouter mon retour
            </Button>
          ) : (
            <div className="space-y-4">
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Saisissez votre avis professionnel, recommandations, diagnostic différentiel..."
                rows={6}
              />
              <div className="flex space-x-3">
                <Button 
                  onClick={handleFeedbackSubmit}
                  disabled={submitFeedback.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitFeedback.isPending ? 'Envoi...' : 'Envoyer le retour'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowFeedbackForm(false)}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessTransmissionForm;
