import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const UserRoleManager = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    role: 'agent',
  });
  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role');
      if (error) throw error;
      return data;
    },
  });

  const { data: userRoles } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          profiles:user_id(first_name, last_name, email)
        `);
      if (error) throw error;
      return data;
    },
  });

  const addRoleMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      const { error } = await supabase
        .from('user_roles')
        .insert({
          ...data,
          tenant_id: profile?.tenant_id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success('Rôle attribué avec succès');
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success('Rôle retiré');
    },
  });

  const handleClose = () => {
    setOpen(false);
    setFormData({ user_id: '', role: 'agent' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRoleMutation.mutate(formData);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'doctor': return 'default';
      case 'agent': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrateur',
      doctor: 'Médecin',
      agent: 'Agent',
      patient: 'Patient',
      lab_technician: 'Technicien Labo',
      pharmacist: 'Pharmacien',
      insurance_agent: 'Agent Assurance',
    };
    return labels[role] || role;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Rôles Utilisateurs</h2>
          <p className="text-muted-foreground">
            Attribuez plusieurs rôles aux utilisateurs
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
              <DialogTitle>Attribuer un Rôle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Utilisateur</Label>
                <Select
                  value={formData.user_id}
                  onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Rôle</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="doctor">Médecin</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="lab_technician">Technicien Laboratoire</SelectItem>
                    <SelectItem value="pharmacist">Pharmacien</SelectItem>
                    <SelectItem value="insurance_agent">Agent Assurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Annuler
                </Button>
                <Button type="submit" disabled={addRoleMutation.isPending}>
                  {addRoleMutation.isPending ? 'Attribution...' : 'Attribuer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rôles Attribués</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Primaire</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userRoles?.map((userRole: any) => (
                <TableRow key={userRole.id}>
                  <TableCell>
                    {userRole.profiles?.first_name} {userRole.profiles?.last_name}
                  </TableCell>
                  <TableCell>{userRole.profiles?.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(userRole.role)}>
                      {getRoleLabel(userRole.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {userRole.is_primary && <Badge variant="outline">Primaire</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRoleMutation.mutate(userRole.id)}
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

export default UserRoleManager;