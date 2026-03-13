import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Specialty {
  id: string;
  name: string;
  description: string;
  standard_fee: number;
  insurance_fee: number;
  reduced_fee: number;
  consultation_duration: number;
  is_active: boolean;
}

const SpecialtyManager = () => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    standard_fee: '',
    insurance_fee: '',
    reduced_fee: '',
    consultation_duration: '30',
  });
  const queryClient = useQueryClient();

  const { data: specialties } = useQuery({
    queryKey: ['medical-specialties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_specialties')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Specialty[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      const payload = {
        ...data,
        tenant_id: profile?.tenant_id,
        standard_fee: parseFloat(data.standard_fee),
        insurance_fee: parseFloat(data.insurance_fee),
        reduced_fee: parseFloat(data.reduced_fee),
        consultation_duration: parseInt(data.consultation_duration),
      };

      if (editingId) {
        const { error } = await supabase
          .from('medical_specialties')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('medical_specialties')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-specialties'] });
      toast.success(editingId ? 'Spécialité modifiée' : 'Spécialité créée');
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('medical_specialties')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-specialties'] });
      toast.success('Spécialité supprimée');
    },
  });

  const handleEdit = (specialty: Specialty) => {
    setEditingId(specialty.id);
    setFormData({
      name: specialty.name,
      description: specialty.description || '',
      standard_fee: specialty.standard_fee.toString(),
      insurance_fee: specialty.insurance_fee.toString(),
      reduced_fee: specialty.reduced_fee.toString(),
      consultation_duration: specialty.consultation_duration.toString(),
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      standard_fee: '',
      insurance_fee: '',
      reduced_fee: '',
      consultation_duration: '30',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Spécialités</h2>
          <p className="text-muted-foreground">Configurez les spécialités et leurs tarifs</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleClose()}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Spécialité
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Modifier' : 'Nouvelle'} Spécialité
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Nom de la spécialité</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Tarif Homologué (avec assurance)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.insurance_fee}
                    onChange={(e) => setFormData({ ...formData, insurance_fee: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Tarif Réduit (sans assurance)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.reduced_fee}
                    onChange={(e) => setFormData({ ...formData, reduced_fee: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Tarif Standard</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.standard_fee}
                    onChange={(e) => setFormData({ ...formData, standard_fee: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Durée Consultation (min)</Label>
                  <Input
                    type="number"
                    value={formData.consultation_duration}
                    onChange={(e) => setFormData({ ...formData, consultation_duration: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Annuler
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Spécialités</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Spécialité</TableHead>
                <TableHead>Tarif Assurance</TableHead>
                <TableHead>Tarif Réduit</TableHead>
                <TableHead>Tarif Standard</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specialties?.map((specialty) => (
                <TableRow key={specialty.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{specialty.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {specialty.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{specialty.insurance_fee.toFixed(2)}€</TableCell>
                  <TableCell>{specialty.reduced_fee.toFixed(2)}€</TableCell>
                  <TableCell>{specialty.standard_fee.toFixed(2)}€</TableCell>
                  <TableCell>{specialty.consultation_duration}min</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(specialty)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(specialty.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpecialtyManager;