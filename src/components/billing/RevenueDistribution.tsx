import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Building2, DollarSign, Activity, Stethoscope } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RevenueData {
  doctorName: string;
  doctorRole: string;
  totalRevenue: number;
  doctorShare: number;
  structureShare: number;
  revenuePercentage: number;
  structurePercentage: number;
  consultationsCount: number;
  doctorId: string;
}

const RevenueDistribution = () => {
  const { data: invoices } = useQuery({
    queryKey: ['invoices-revenue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          appointments(
            doctor_id,
            doctors(
              id,
              user_id,
              profiles(first_name, last_name)
            )
          )
        `)
        .eq('status', 'paid');
      if (error) throw error;
      return data;
    },
  });

  const { data: doctorRoles } = useQuery({
    queryKey: ['doctor-roles-revenue'],
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
        `)
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  const revenueDistribution = useMemo<RevenueData[]>(() => {
    if (!invoices || !doctorRoles) return [];

    const distributionMap = new Map<string, RevenueData>();

    invoices.forEach((invoice) => {
      const doctorId = invoice.appointments?.doctor_id;
      if (!doctorId) return;

      const role = doctorRoles.find((r) => r.doctor_id === doctorId);
      if (!role) return;

      const doctorName = `Dr. ${role.doctors?.profiles?.first_name} ${role.doctors?.profiles?.last_name}`;
      const key = doctorId;

      const doctorShare = (invoice.amount * role.revenue_percentage) / 100;
      const structureShare = (invoice.amount * role.structure_percentage) / 100;

      if (distributionMap.has(key)) {
        const existing = distributionMap.get(key)!;
        distributionMap.set(key, {
          ...existing,
          totalRevenue: existing.totalRevenue + invoice.amount,
          doctorShare: existing.doctorShare + doctorShare,
          structureShare: existing.structureShare + structureShare,
          consultationsCount: existing.consultationsCount + 1,
        });
      } else {
        distributionMap.set(key, {
          doctorId,
          doctorName,
          doctorRole: role.structure_role === 'primary_doctor' ? 'Principal' : 'Secondaire',
          totalRevenue: invoice.amount,
          doctorShare,
          structureShare,
          revenuePercentage: role.revenue_percentage,
          structurePercentage: role.structure_percentage,
          consultationsCount: 1,
        });
      }
    });

    return Array.from(distributionMap.values());
  }, [invoices, doctorRoles]);

  const totalStats = useMemo(() => {
    const total = revenueDistribution.reduce(
      (acc, curr) => ({
        revenue: acc.revenue + curr.totalRevenue,
        doctorShare: acc.doctorShare + curr.doctorShare,
        structureShare: acc.structureShare + curr.structureShare,
        consultations: acc.consultations + curr.consultationsCount,
      }),
      { revenue: 0, doctorShare: 0, structureShare: 0, consultations: 0 }
    );
    return total;
  }, [revenueDistribution]);

  const roleStats = useMemo(() => {
    const stats = {
      primary: { count: 0, consultations: 0, revenue: 0, share: 0 },
      secondary: { count: 0, consultations: 0, revenue: 0, share: 0 },
    };

    revenueDistribution.forEach((data) => {
      const type = data.doctorRole === 'Principal' ? 'primary' : 'secondary';
      stats[type].count++;
      stats[type].consultations += data.consultationsCount;
      stats[type].revenue += data.totalRevenue;
      stats[type].share += data.doctorShare;
    });

    return stats;
  }, [revenueDistribution]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold break-words">Répartition du Chiffre d'Affaires</h2>
        <p className="text-sm md:text-base text-muted-foreground break-words">
          Distribution des revenus par rôle médical
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA Total</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-blue-700">
              {totalStats.revenue.toLocaleString()} CFA
            </div>
            <p className="text-xs text-muted-foreground">
              {totalStats.consultations} consultations
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Part Médecins</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-green-700">
              {totalStats.doctorShare.toLocaleString()} CFA
            </div>
            <p className="text-xs text-muted-foreground">
              {totalStats.revenue > 0 
                ? ((totalStats.doctorShare / totalStats.revenue) * 100).toFixed(1)
                : 0}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Part Structure</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-purple-700">
              {totalStats.structureShare.toLocaleString()} CFA
            </div>
            <p className="text-xs text-muted-foreground">
              {totalStats.revenue > 0 
                ? ((totalStats.structureShare / totalStats.revenue) * 100).toFixed(1)
                : 0}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-orange-700">
              {totalStats.consultations}
            </div>
            <p className="text-xs text-muted-foreground">
              Moyenne: {revenueDistribution.length > 0 
                ? (totalStats.consultations / revenueDistribution.length).toFixed(1)
                : 0} / médecin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* KPIs par rôle de médecin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              <span>Médecins Principaux</span>
            </CardTitle>
            <CardDescription>Performance des médecins avec rôle principal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Nombre</div>
                  <div className="text-2xl font-bold">{roleStats.primary.count}</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Consultations</div>
                  <div className="text-2xl font-bold">{roleStats.primary.consultations}</div>
                </div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">CA Global</div>
                <div className="text-2xl font-bold text-blue-700">
                  {roleStats.primary.revenue.toLocaleString()} CFA
                </div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Part après répartition (100%)</div>
                <div className="text-2xl font-bold text-green-700">
                  {roleStats.primary.share.toLocaleString()} CFA
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-purple-600" />
              <span>Médecins Secondaires</span>
            </CardTitle>
            <CardDescription>Performance des médecins avec partage de revenus</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Nombre</div>
                  <div className="text-2xl font-bold">{roleStats.secondary.count}</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Consultations</div>
                  <div className="text-2xl font-bold">{roleStats.secondary.consultations}</div>
                </div>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">CA Global</div>
                <div className="text-2xl font-bold text-purple-700">
                  {roleStats.secondary.revenue.toLocaleString()} CFA
                </div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Part après répartition (moyenne 80%)</div>
                <div className="text-2xl font-bold text-green-700">
                  {roleStats.secondary.share.toLocaleString()} CFA
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="by-doctor" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 gap-1">
          <TabsTrigger value="by-doctor">Détail par Médecin</TabsTrigger>
          <TabsTrigger value="summary">Résumé Global</TabsTrigger>
        </TabsList>

        <TabsContent value="by-doctor">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par Médecin</CardTitle>
              <CardDescription>Détail des revenus et partages par médecin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Médecin</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead className="text-right">Consultations</TableHead>
                      <TableHead className="text-right">CA Global</TableHead>
                      <TableHead className="text-right">Part Médecin</TableHead>
                      <TableHead className="text-right">Part Structure</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueDistribution.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium break-words">{data.doctorName}</TableCell>
                        <TableCell>
                          <Badge variant={data.doctorRole === 'Principal' ? 'default' : 'secondary'}>
                            {data.doctorRole}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="font-medium">{data.consultationsCount}</div>
                          <div className="text-xs text-muted-foreground">
                            {data.totalRevenue > 0 
                              ? Math.round(data.totalRevenue / data.consultationsCount).toLocaleString()
                              : 0} CFA/consult
                          </div>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="font-medium text-blue-700">
                            {data.totalRevenue.toLocaleString()} CFA
                          </div>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="font-medium text-green-700">
                              {data.doctorShare.toLocaleString()} CFA
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ({data.revenuePercentage}%)
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="font-medium text-purple-700">
                              {data.structureShare.toLocaleString()} CFA
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ({data.structurePercentage}%)
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {revenueDistribution.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Aucune donnée de revenus disponible
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Performance par Type de Rôle</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Principal', 'Secondaire'].map((roleType) => {
                    const roleData = revenueDistribution.filter((d) => d.doctorRole === roleType);
                    const roleTotal = roleData.reduce((acc, curr) => acc + curr.totalRevenue, 0);
                    const roleDoctorShare = roleData.reduce((acc, curr) => acc + curr.doctorShare, 0);
                    
                    return (
                      <div key={roleType} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={roleType === 'Principal' ? 'default' : 'secondary'}>
                            {roleType}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {roleData.length} médecin(s)
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm">CA Total:</span>
                            <span className="font-medium">{roleTotal.toLocaleString()} CFA</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Part Médecins:</span>
                            <span className="font-medium text-green-700">
                              {roleDoctorShare.toLocaleString()} CFA
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistiques Générales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Nombre de médecins actifs</div>
                    <div className="text-2xl font-bold">{revenueDistribution.length}</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">CA moyen par médecin</div>
                    <div className="text-2xl font-bold">
                      {revenueDistribution.length > 0
                        ? (totalStats.revenue / revenueDistribution.length).toLocaleString()
                        : 0} CFA
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Ratio moyen Structure</div>
                    <div className="text-2xl font-bold">
                      {totalStats.revenue > 0
                        ? ((totalStats.structureShare / totalStats.revenue) * 100).toFixed(1)
                        : 0}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RevenueDistribution;
