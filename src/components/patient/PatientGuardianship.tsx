
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Users, Plus, UserPlus, Calendar, Baby } from 'lucide-react';
import { useMyPatients, useCreatePatientGuardian } from '@/hooks/usePatientGuardians';
import { useCreatePatient } from '@/hooks/usePatients';
import { supabase } from '@/integrations/supabase/client';

type RelationshipType = 'parent' | 'tuteur_legal' | 'autre';

const PatientGuardianship = () => {
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [newChild, setNewChild] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    birth_certificate_number: '',
    relationship_type: 'parent' as RelationshipType,
  });

  const { data: myPatients = [], isLoading } = useMyPatients();
  const createPatient = useCreatePatient();
  const createGuardian = useCreatePatientGuardian();
  const { toast } = useToast();

  const handleAddChild = async () => {
    if (!newChild.first_name || !newChild.last_name || !newChild.date_of_birth) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      // Générer un UUID pour le nouveau profil
      const profileId = crypto.randomUUID();
      
      // Créer d'abord le profil utilisateur avec un ID généré
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: profileId,
          first_name: newChild.first_name,
          last_name: newChild.last_name,
          role: 'patient',
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Créer le patient
      const patientData = await createPatient.mutateAsync({
        user_id: profile.id,
        date_of_birth: newChild.date_of_birth,
        gender: newChild.gender,
        birth_certificate_number: newChild.birth_certificate_number,
        is_minor: true,
        legal_guardian_consent: true,
      });

      // Créer la relation de tutelle
      await createGuardian.mutateAsync({
        patient_id: patientData.id,
        relationship_type: newChild.relationship_type,
        is_primary: true,
      });

      toast({
        title: "Succès",
        description: "Enfant ajouté avec succès sous votre tutelle",
      });

      setIsAddChildOpen(false);
      setNewChild({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        birth_certificate_number: '',
        relationship_type: 'parent',
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'enfant:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout de l'enfant",
        variant: "destructive",
      });
    }
  };

  const getAgeFromBirthDate = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (isLoading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span>Patients sous ma tutelle</span>
            </CardTitle>
            <Dialog open={isAddChildOpen} onOpenChange={setIsAddChildOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un enfant</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Baby className="w-5 h-5" />
                    <span>Ajouter un enfant sous tutelle</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">Prénom *</Label>
                      <Input
                        id="first_name"
                        value={newChild.first_name}
                        onChange={(e) => setNewChild({ ...newChild, first_name: e.target.value })}
                        placeholder="Prénom de l'enfant"
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Nom *</Label>
                      <Input
                        id="last_name"
                        value={newChild.last_name}
                        onChange={(e) => setNewChild({ ...newChild, last_name: e.target.value })}
                        placeholder="Nom de l'enfant"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date_of_birth">Date de naissance *</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={newChild.date_of_birth}
                        onChange={(e) => setNewChild({ ...newChild, date_of_birth: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Sexe</Label>
                      <Select value={newChild.gender} onValueChange={(value) => setNewChild({ ...newChild, gender: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Masculin</SelectItem>
                          <SelectItem value="female">Féminin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="birth_certificate">N° Acte de naissance</Label>
                    <Input
                      id="birth_certificate"
                      value={newChild.birth_certificate_number}
                      onChange={(e) => setNewChild({ ...newChild, birth_certificate_number: e.target.value })}
                      placeholder="Numéro d'acte de naissance"
                    />
                  </div>

                  <div>
                    <Label htmlFor="relationship">Relation</Label>
                    <Select value={newChild.relationship_type} onValueChange={(value: RelationshipType) => setNewChild({ ...newChild, relationship_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="tuteur_legal">Tuteur légal</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddChildOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleAddChild} disabled={createPatient.isPending || createGuardian.isPending}>
                      {createPatient.isPending || createGuardian.isPending ? 'Ajout...' : 'Ajouter'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {myPatients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">Aucun patient sous votre tutelle</p>
              <p className="text-sm text-gray-400">
                Vous pouvez ajouter des enfants ou des personnes sous votre tutelle
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myPatients.map((guardian) => (
                <Card key={guardian.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Baby className="w-5 h-5 text-blue-600" />
                          <h3 className="font-medium text-lg">
                            {guardian.patient?.profile?.first_name} {guardian.patient?.profile?.last_name}
                          </h3>
                          <Badge variant={guardian.is_primary ? "default" : "secondary"}>
                            {guardian.is_primary ? 'Tuteur principal' : 'Tuteur secondaire'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Âge:</span>{' '}
                            {guardian.patient?.date_of_birth ? `${getAgeFromBirthDate(guardian.patient.date_of_birth)} ans` : 'Non renseigné'}
                          </div>
                          <div>
                            <span className="font-medium">Relation:</span>{' '}
                            {guardian.relationship_type === 'parent' ? 'Parent' : 
                             guardian.relationship_type === 'tuteur_legal' ? 'Tuteur légal' : 'Autre'}
                          </div>
                          <div>
                            <span className="font-medium">Sexe:</span>{' '}
                            {guardian.patient?.gender === 'male' ? 'Masculin' : 
                             guardian.patient?.gender === 'female' ? 'Féminin' : 'Non renseigné'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          RDV
                        </Button>
                        <Button variant="outline" size="sm">
                          Dossier
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientGuardianship;
