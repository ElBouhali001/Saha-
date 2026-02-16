import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const DoctorRoleManager = () => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    doctor_id: '',
    structure_role: 'secondary_doctor',
    revenue_percentage: '80',
    structure_percentage: '20',
  });
  const queryClient = useQueryClient();

  const { data: doctors } = useQuery({
    queryKey: ['doctors-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, user_id, profiles(first_name, last_name)');
      if (error) throw error;
      return data;
    },
  });

  const { data: roles } = useQuery({
    queryKey: ['doctor-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctor_structure_roles')
        .select(`
          *,
          doctors(
            id,
            user_id,
            profiles(first_name, last_name)
          )
        `);
      if (error) throw error;
      return data;
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
        revenue_percentage: parseFloat(data.revenue_percentage),
        structure_percentage: parseFloat(data.structure_percentage),
      };

      if (editingId) {
        const { error } = await supabase
          .from('doctor_structure_roles')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('doctor_structure_roles')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-roles'] });
      toast.success('Rôle configuré avec succès');
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setFormData({
      doctor_id: '',
      structure_role: 'secondary_doctor',
      revenue_percentage: '80',
      structure_percentage: '20',
    });
  };

  const handleRoleChange = (role: string) => {
    if (role === 'primary_doctor') {
      setFormData({
        ...formData,
        structure_role: role,
        revenue_percentage: '100',
        structure_percentage: '0',
      });
    } else {
      setFormData({
        ...formData,
        structure_role: role,
        revenue_percentage: '80',
        structure_percentage: '20',
      });
    }
  };

  const handleRevenueChange = (value: string) => {
    const revenue = parseFloat(value) || 0;
    const structure = 100 - revenue;
    setFormData({
      ...formData,
      revenue_percentage: value,
      structure_percentage: structure.toString(),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(formData.revenue_percentage) + parseFloat(formData.structure_percentage);
    if (Math.abs(total - 100) > 0.01) {
      toast.error('Les pourcentages doivent totaliser 100%');
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleEdit = (role: any) => {
    setEditingId(role.id);
    setFormData({
      doctor_id: role.doctor_id,
      structure_role: role.structure_role,
      revenue_percentage: role.revenue_percentage.toString(),
      structure_percentage: role.structure_percentage.toString(),
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Rôles Médicaux</h2>
          <p className="text-muted-foreground">
            Configurez les rôles et le partage des revenus
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleClose()}>
              <Plus className="w-4 h-4 mr-2" />
              Attribuer un Rôle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configuration du Rôle Médical</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Médecin</Label>
                <Select
                  value={formData.doctor_id}
                  onValueChange={(value) => setFormData({ ...formData, doctor_id: value })}
                  disabled={!!editingId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un médecin" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors?.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.profiles?.first_name} {doctor.profiles?.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Type de Rôle</Label>
                <Select
                  value={formData.structure_role}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary_doctor">
                      Médecin Principal (100% des revenus)
                    </SelectItem>
                    <SelectItem value="secondary_doctor">
                      Médecin Secondaire (partage avec structure)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Part Médecin (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.revenue_percentage}
                    onChange={(e) => handleRevenueChange(e.target.value)}
                    disabled={formData.structure_role === 'primary_doctor'}
                  />
                </div>
                <div>
                  <Label>Part Structure (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.structure_percentage}
                    disabled
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
          <CardTitle>Rôles Configurés</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Médecin</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Part Médecin</TableHead>
                <TableHead>Part Structure</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles?.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    Dr. {role.doctors?.profiles?.first_name} {role.doctors?.profiles?.last_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.structure_role === 'primary_doctor' ? 'default' : 'secondary'}>
                      {role.structure_role === 'primary_doctor' ? 'Principal' : 'Secondaire'}
                    </Badge>
                  </TableCell>
                  <TableCell>{role.revenue_percentage}%</TableCell>
                  <TableCell>{role.structure_percentage}%</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(role)}
                    >
                      <Edit className="w-4 h-4" />
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

export default DoctorRoleManager;